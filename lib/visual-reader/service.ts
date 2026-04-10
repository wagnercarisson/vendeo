import { callAI, callAIWithRetry, parseJsonFirstObject } from "@/lib/ai/parse";
import {
  VisualReaderInput,
  VisualReaderOutput,
  VisualReaderOutputSchema,
  DEFAULT_VISUAL_READER_OUTPUT,
} from "./contracts";
import { buildVisualReaderPrompt } from "./prompts";

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

function buildDefaultOutput(reasoningSummary?: string): VisualReaderOutput {
  return {
    ...DEFAULT_VISUAL_READER_OUTPUT,
    ignoredElements: [...DEFAULT_VISUAL_READER_OUTPUT.ignoredElements],
    reasoningSummary:
      reasoningSummary ?? DEFAULT_VISUAL_READER_OUTPUT.reasoningSummary,
  };
}

function cloneOutput(output: VisualReaderOutput): VisualReaderOutput {
  return {
    ...output,
    ignoredElements: [...output.ignoredElements],
    targetBox: output.targetBox ? { ...output.targetBox } : null,
  };
}

function getBoxArea(box: NonNullable<VisualReaderOutput["targetBox"]>): number {
  return box.width * box.height;
}

function isValidNormalizedBox(
  box: NonNullable<VisualReaderOutput["targetBox"]>
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
  output: VisualReaderOutput
): VisualReaderOutput {
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

function normalizeBox(output: VisualReaderOutput): VisualReaderOutput {
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
  output: VisualReaderOutput
): VisualReaderOutput {
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
  if (isFullBox && output.sceneType !== "full_scene") {
    return buildDefaultOutput(
      "Inconsistência detectada: bounding box ocupando a imagem inteira sem alvo útil."
    );
  }

  return output;
}

function normalizeSceneType(output: VisualReaderOutput): VisualReaderOutput {
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

function normalizeOccupancy(output: VisualReaderOutput): VisualReaderOutput {
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

function normalizePosition(output: VisualReaderOutput): VisualReaderOutput {
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

function normalizeMatchedTarget(output: VisualReaderOutput): VisualReaderOutput {
  if (output.matchType === "none") {
    output.matchedTarget = null;
    return output;
  }

  if (output.matchType === "category_only" && !output.matchedTarget) {
    output.matchedTarget = "item semelhante detectado";
  }

  return output;
}

function validatePostModelLogic(output: VisualReaderOutput): VisualReaderOutput {
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
): Promise<VisualReaderOutput> {
  const prompt = buildVisualReaderPrompt(input);
  const ai_model = "gpt-5.4-mini"; // usar modelo mais leve, pois o prompt é bem específico e queremos otimizar custo e latência  

  try {
    const raw = await callAIWithRetry(prompt, VisualReaderOutputSchema, {
      model: ai_model,
      temperature: 0.2,
      timeoutMs: 25000,
      imageUrl: input.imageUrl,
    });

    return validatePostModelLogic(raw.data);
  } catch {
    try {
      const fallbackAttempt = await callAI(
        [
          {
            role: "system",
            content:
              "Responda somente com JSON válido, sem markdown, sem comentários e obedecendo exatamente o schema solicitado.",
          },
          { role: "user", content: prompt },
        ],
        {
          model: ai_model,
          temperature: 0.2,
          timeoutMs: 25000,
          imageUrl: input.imageUrl,
        }
      );

      const parsed = parseJsonFirstObject(fallbackAttempt);
      const safe = VisualReaderOutputSchema.safeParse(parsed);

      if (safe.success) {
        return validatePostModelLogic(safe.data);
      }
    } catch {
      // ignora falha secundária
    }
  }

  return buildDefaultOutput();
}