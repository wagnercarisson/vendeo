import { callAI, parseJsonFirstObject } from "@/lib/ai/parse";
import {
  VisualReaderInput,
  VisualReaderInputSchema,
  VisualReaderResult,
  VisualReaderSchema,
  DEFAULT_VISUAL_READER_OUTPUT,
} from "./contracts";
import { VISUAL_READER_SYSTEM_PROMPT } from "./prompts";

export type VisualCropInput = {
  imageWidth: number;
  imageHeight: number;
  targetBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
};

export type VisualCropOutput = {
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildDefaultOutput(reasoningSummary?: string): VisualReaderResult {
  return {
    ...DEFAULT_VISUAL_READER_OUTPUT,
    ignoredElements: [...DEFAULT_VISUAL_READER_OUTPUT.ignoredElements],
    reasoningSummary:
      reasoningSummary ?? DEFAULT_VISUAL_READER_OUTPUT.reasoningSummary,
  };
}

function cloneOutput(output: VisualReaderResult): VisualReaderResult {
  return {
    ...output,
    ignoredElements: [...output.ignoredElements],
    targetBox: output.targetBox ? { ...output.targetBox } : null,
  };
}

function getBoxArea(box: NonNullable<VisualReaderResult["targetBox"]>): number {
  return box.width * box.height;
}

function isValidNormalizedBox(
  box: NonNullable<VisualReaderResult["targetBox"]>
): boolean {
  if (box.x < 0 || box.x > 1) return false;
  if (box.y < 0 || box.y > 1) return false;
  if (box.width <= 0 || box.width > 1) return false;
  if (box.height <= 0 || box.height > 1) return false;
  if (box.x + box.width > 1) return false;
  if (box.y + box.height > 1) return false;
  return true;
}

function normalizeMatchConsistency(
  output: VisualReaderResult
): VisualReaderResult {
  // fallback defensivo
  if (!output.matchType) {
    output.matchType = "none";
  }

  // Regra central:
  // - none => detected false + sem box
  // - exact/category_only => detected true + box obrigatória
  if (output.matchType === "none") {
    output.detected = false;
    output.matchedTarget = null;
    output.targetBox = null;
    output.targetOrientation = "unknown";
    output.targetPosition = "unknown";
    output.targetOccupancy = "low";
    output.relevantCount = 0;
    return output;
  }

  if (output.matchType === "exact") {
    output.detected = true;
  }

  if (output.matchType === "category_only") {
    output.detected = false;
  }

  // exact/category_only sem box = inconsistente
  if (
    (output.matchType === "exact" || output.matchType === "category_only") &&
    output.targetBox === null
  ) {
    return buildDefaultOutput(
      "Inconsistência detectada: match visual sem bounding box."
    );
  }

  // category_only não pode repetir o alvo exato como matchedTarget
  if (
    output.matchType === "category_only" &&
    output.matchedTarget &&
    output.matchedTarget.trim().toLowerCase() ===
    (output.matchedTarget ?? "").trim().toLowerCase()
  ) {
    // mantemos como veio; a validação forte disso deve acontecer no prompt/modelo,
    // mas evitamos sobrescrever aqui para não perder informação útil.
  }

  return output;
}

function normalizeBox(output: VisualReaderResult): VisualReaderResult {
  if (!output.targetBox) return output;

  let { x, y, width, height } = output.targetBox;

  // 1. Clamp
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  width = Math.max(0, Math.min(1, width));
  height = Math.max(0, Math.min(1, height));

  // 2. Tamanho mínimo só para cenas de produto
  const isProductScene =
    output.sceneType === "single_product" ||
    output.sceneType === "multiple_products";

  if (isProductScene) {
    const MIN_SIZE = 0.18;
    if (width < MIN_SIZE) width = MIN_SIZE;
    if (height < MIN_SIZE) height = MIN_SIZE;
  }

  // 3. Expansão leve só para cenas de produto
  if (isProductScene) {
    const EXPAND = 0.12;
    width = Math.min(1, width * (1 + EXPAND));
    height = Math.min(1, height * (1 + EXPAND));
  }

  // 4. Reposicionamento após expandir
  if (x + width > 1) x = 1 - width;
  if (y + height > 1) y = 1 - height;

  // 5. Recuo leve para respiro, só em cenas de produto
  if (isProductScene) {
    x = Math.max(0, x - width * 0.04);
    y = Math.max(0, y - height * 0.04);
  }

  output.targetBox = { x, y, width, height };
  return output;
}

function validateBoxValidity(
  output: VisualReaderResult
): VisualReaderResult {
  if (!output.targetBox) return output;

  if (!isValidNormalizedBox(output.targetBox)) {
    return buildDefaultOutput(
      "Inconsistência detectada: bounding box fora do range normalizado."
    );
  }

  const area = getBoxArea(output.targetBox);
  const isFullBox =
    output.targetBox.x <= 0.01 &&
    output.targetBox.y <= 0.01 &&
    output.targetBox.width >= 0.98 &&
    output.targetBox.height >= 0.98;

  // Box minúscula é erro provável em cenas de produto
  if (
    (output.sceneType === "single_product" ||
      output.sceneType === "multiple_products") &&
    area < 0.015
  ) {
    return buildDefaultOutput(
      "Inconsistência detectada: bounding box muito pequena para uso confiável."
    );
  }

  // Box 1:1 só deve ser barrada quando a cena não é full_scene
  const allowFullBox =
    output.sceneType === "full_scene" ||
    output.sceneType === "single_product" ||
    output.matchType === "exact" ||
    output.confidence === "high";

  if (isFullBox && !allowFullBox) {
    return buildDefaultOutput(
      "Inconsistência detectada: bounding box ocupando a imagem inteira sem alvo útil."
    );
  }

  return output;
}

function normalizeSceneType(output: VisualReaderResult): VisualReaderResult {
  // Se há mais de um alvo compatível, certamente é múltiplo
  if (output.sceneType === "single_product" && output.relevantCount > 1) {
    output.sceneType = "multiple_products";
  }

  // Se há elementos ignorados visíveis e a cena foi classificada como single,
  // reclassificar para múltipla
  if (
    output.sceneType === "single_product" &&
    output.ignoredElements.length > 0
  ) {
    output.sceneType = "multiple_products";
  }

  return output;
}

function normalizeOccupancy(output: VisualReaderResult): VisualReaderResult {
  if (!output.targetBox) return output;

  const area = getBoxArea(output.targetBox);

  // "full" só faz sentido em full_scene ou quando a box realmente ocupa quase tudo
  if (output.targetOccupancy === "full") {
    if (output.sceneType !== "full_scene" && area < 0.75) {
      output.targetOccupancy = "high";
    }
  }

  // Evitar "medium" em box enorme
  if (output.targetOccupancy === "medium" && area > 0.55) {
    output.targetOccupancy = "high";
  }

  return output;
}

function normalizePosition(output: VisualReaderResult): VisualReaderResult {
  if (!output.targetBox) return output;

  const x = output.targetBox.x;
  const centerX = x + output.targetBox.width / 2;

  if (centerX < 0.33) {
    output.targetPosition = "left";
  } else if (centerX > 0.66) {
    output.targetPosition = "right";
  } else {
    output.targetPosition = "center";
  }

  return output;
}

function normalizeMatchedTarget(output: VisualReaderResult): VisualReaderResult {
  if (output.matchType === "none") {
    output.matchedTarget = null;
    return output;
  }

  if (output.matchType === "category_only" && !output.matchedTarget) {
    output.matchedTarget = "item semelhante detectado";
  }

  return output;
}

function validatePostModelLogic(output: VisualReaderResult): VisualReaderResult {
  let normalized = cloneOutput(output);

  normalized = normalizeMatchConsistency(normalized);
  normalized = normalizeBox(normalized);
  normalized = validateBoxValidity(normalized);
  normalized = normalizeSceneType(normalized);
  normalized = normalizeOccupancy(normalized);
  normalized = normalizePosition(normalized);
  normalized = normalizeMatchedTarget(normalized);

  return normalized;
}

export function buildVisualCrop(input: VisualCropInput): VisualCropOutput {
  const { imageWidth, imageHeight, targetBox } = input;

  if (targetBox === null) {
    return { crop: null };
  }

  const isFullScene =
    targetBox.width >= 0.95 && targetBox.height >= 0.95;

  if (isFullScene) {
    return {
      crop: {
        x: 0,
        y: 0,
        width: imageWidth,
        height: imageHeight,
      },
    };
  }

  const rawX = targetBox.x * imageWidth;
  const rawY = targetBox.y * imageHeight;
  const rawWidth = targetBox.width * imageWidth;
  const rawHeight = targetBox.height * imageHeight;

  const marginFactor = 0.15; // entre 10% e 20%
  const marginW = rawWidth * marginFactor;
  const marginH = rawHeight * marginFactor;

  let cropWidth = rawWidth + marginW * 2;
  let cropHeight = rawHeight + marginH * 2;

  const aspectRatio = rawHeight / rawWidth;

  if (aspectRatio > 1.1) {
    // produto vertical: preservar proporção vertical
    cropHeight = Math.max(cropHeight, cropWidth * aspectRatio);
    cropWidth = cropHeight / aspectRatio;
  } else if (aspectRatio < 0.9) {
    // produto horizontal: preservar proporção horizontal
    cropWidth = Math.max(cropWidth, cropHeight / aspectRatio);
    cropHeight = cropWidth * aspectRatio;
  }

  const centerX = rawX + rawWidth / 2;
  const centerY = rawY + rawHeight / 2;

  let cropX = centerX - cropWidth / 2;
  let cropY = centerY - cropHeight / 2;

  if (cropWidth > imageWidth) {
    cropWidth = imageWidth;
    cropX = 0;
  }

  if (cropHeight > imageHeight) {
    cropHeight = imageHeight;
    cropY = 0;
  }

  cropX = clamp(cropX, 0, imageWidth - cropWidth);
  cropY = clamp(cropY, 0, imageHeight - cropHeight);

  return {
    crop: {
      x: Math.round(cropX),
      y: Math.round(cropY),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight),
    },
  };
}

export async function readVisualTarget(
  input: VisualReaderInput
): Promise<VisualReaderResult> {
  const validatedInput = VisualReaderInputSchema.safeParse(input);
  if (!validatedInput.success) {
    return buildDefaultOutput();
  }

  const payload = {
    targetLabel: validatedInput.data.targetLabel,
    productName: validatedInput.data.productName ?? null,
    category: validatedInput.data.category ?? null,
    campaignType: validatedInput.data.campaignType ?? null,
    content_type: validatedInput.data.content_type ?? null,
  };

  const userPrompt = [
    "Analise a imagem com base no contexto abaixo.",
    "Retorne somente JSON puro e valido, sem markdown e sem texto adicional.",
    JSON.stringify(payload, null, 2),
  ].join("\n\n");

  try {
    const raw = await callAI(
      [
        { role: "system", content: VISUAL_READER_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      {
        model: "gpt-5.4-mini",
        temperature: 0.2,
        timeoutMs: 25000,
        imageUrl: validatedInput.data.imageUrl,
      }
    );

    const parsed = parseJsonFirstObject(raw);
    const safe = VisualReaderSchema.safeParse(parsed);
    if (!safe.success) {
      console.error("[VisualReader] schema validation failed", {
        issues: safe.error.issues,
        parsed,
      });
      return buildDefaultOutput();
    }

    return validatePostModelLogic(safe.data);
  } catch {
    return buildDefaultOutput();
  }
}