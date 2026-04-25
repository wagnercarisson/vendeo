import {
  composeVariations,
} from "@/lib/ai/visual-composer/service";
import {
  getVisualSignatureProfile,
  resolveIntent,
} from "@/lib/ai/intent-resolver/service";
import {
  renderVariations,
} from "@/lib/ai/renderer/service";
import { readVisualTarget } from "@/lib/ai/visual-reader/service";
import { getSignedImageUrl } from "@/lib/supabase/storage-server";

import type {
  GenerateCampaignVisualsInput,
  GenerateCampaignVisualsOutput,
  PipelineError,
  VisualOutputItem,
} from "./types";

function pipelineLog(stage: string, payload: Record<string, unknown>) {
  console.log(stage, payload);
}

function buildPipelineError(error: Omit<PipelineError, "trace_id">, trace_id: string): PipelineError {
  return {
    ...error,
    trace_id,
  };
}

function isDataUrl(url: string): boolean {
  return url.startsWith("data:");
}

async function assertImageReachable(imageUrl: string, trace_id: string) {
  if (isDataUrl(imageUrl)) {
    return;
  }

  // Resolve path relativo → URL assinada (healing logic)
  // Suporta paths (v2: "stores/.../file.webp") e URLs (v1: "https://...")
  const resolvedUrl = await getSignedImageUrl(imageUrl);
  
  if (!resolvedUrl) {
    throw buildPipelineError(
      {
        motor: "visual-reader",
        code: "IMAGE_URL_RESOLUTION_FAILED",
        message: "Erro ao resolver URL da imagem. Verifique se a imagem existe.",
        details: `Failed to resolve image URL from: ${imageUrl}`,
      },
      trace_id
    );
  }

  pipelineLog("[PIPELINE][URL_RESOLVED]", {
    trace_id,
    originalInput: imageUrl,
    resolvedUrl: resolvedUrl.substring(0, 100) + "...", // Log truncado para segurança
  });

  try {
    const response = await fetch(resolvedUrl, { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP_${response.status}`);
    }
  } catch (error) {
    throw buildPipelineError(
      {
        motor: "visual-reader",
        code: "IMAGE_LOAD_FAILED",
        message: "Erro ao processar imagem. Tente fazer upload de outra imagem.",
        details: error instanceof Error ? error.message : error,
      },
      trace_id
    );
  }
}

export function readExistingVisualOutputs(value: unknown): VisualOutputItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is VisualOutputItem => {
    return Boolean(
      item &&
      typeof item === "object" &&
      typeof (item as VisualOutputItem).variation_index === "number" &&
      typeof (item as VisualOutputItem).url === "string" &&
      (item as VisualOutputItem).metadata?.format === "png"
    );
  });
}

export async function generateCampaignVisuals(
  input: GenerateCampaignVisualsInput,
  options: { now?: () => number } = {}
): Promise<GenerateCampaignVisualsOutput> {
  const trace_id = crypto.randomUUID();
  const now = options.now ?? (() => Date.now());
  const startedAt = now();
  const existing = readExistingVisualOutputs(input.existing_visual_outputs);

  if (!input.force && existing.length > 0) {
    return {
      trace_id,
      campaign_id: input.campaign_id,
      visual_outputs: existing,
      performance: {
        motor1_ms: 0,
        motor2_ms: 0,
        motor3_ms: 0,
        motor4_ms: 0,
        total_ms: 0,
      },
      reused: true,
    };
  }

  pipelineLog("[PIPELINE][START]", {
    trace_id,
    campaign_id: input.campaign_id,
    timestamp: startedAt,
  });

  await assertImageReachable(input.product_image_url, trace_id);

  const motor1Start = now();
  pipelineLog("[MOTOR-1][INPUT]", {
    trace_id,
    imageUrl: input.product_image_url,
    productName: input.campaign_data.product_name,
    content_type: input.campaign_data.content_type,
  });
  const imageProfile = await readVisualTarget({
    imageUrl: input.product_image_url,
    productName: input.campaign_data.product_name,
    content_type: input.campaign_data.content_type,
  });
  const motor1_ms = now() - motor1Start;
  pipelineLog("[MOTOR-1][OUTPUT]", { trace_id, imageProfile, motor1_ms });

  const motor2Start = now();
  pipelineLog("[MOTOR-2][INPUT]", { trace_id, imageProfile, campaign: input.campaign_data });
  let signature;
  try {
    signature = await getVisualSignatureProfile(input.store_id, input.campaign_data.objective);
  } catch (error) {
    throw buildPipelineError(
      {
        motor: "intent-resolver",
        code: "VISUAL_SIGNATURE_NOT_FOUND",
        message: "Erro ao carregar assinatura visual da loja.",
        details: error instanceof Error ? error.message : error,
      },
      trace_id
    );
  }

  const direction = await resolveIntent({
    image: {
      backgroundType: imageProfile.backgroundType,
      targetOccupancy: imageProfile.targetOccupancy,
      sceneType: imageProfile.sceneType,
      visibility: imageProfile.visibility,
      framing: imageProfile.framing,
      imageQuality: imageProfile.imageQuality,
      matchType: imageProfile.matchType,
      targetPosition: imageProfile.targetPosition,
      targetOrientation: imageProfile.targetOrientation,
    },
    campaign: {
      content_type: input.campaign_data.content_type,
      objective: input.campaign_data.objective,
      price: input.campaign_data.price ?? null,
      price_label: input.campaign_data.price_label ?? null,
      product_name: input.campaign_data.product_name,
      audience: input.campaign_data.audience as any,
      product_positioning: input.campaign_data.product_positioning ?? null,
    },
    signature,
  });
  const motor2_ms = now() - motor2Start;
  pipelineLog("[MOTOR-2][OUTPUT]", { trace_id, direction, motor2_ms });

  const motor3Start = now();
  pipelineLog("[MOTOR-3][INPUT]", { trace_id, imageProfile, direction });
  const variations = await composeVariations({
    image: {
      targetBox: imageProfile.targetBox,
      targetPosition: imageProfile.targetPosition,
      targetOrientation: imageProfile.targetOrientation,
      targetOccupancy: imageProfile.targetOccupancy,
      backgroundType: imageProfile.backgroundType,
      sceneType: imageProfile.sceneType,
      imageQuality: imageProfile.imageQuality,
      visibility: imageProfile.visibility,
      framing: imageProfile.framing,
    },
    direction,
    signature: {
      logo_url: input.visual_signature.logo_url ?? signature.logo_url,
      store_name_typography: signature.store_name_typography,
      signature_seed: signature.signature_seed,
      intensity_level: signature.intensity_level,
      context_type: signature.context_type,
    },
    campaign: {
      content_type: input.campaign_data.content_type,
      objective: input.campaign_data.objective,
      price: input.campaign_data.price ?? null,
      price_label: input.campaign_data.price_label ?? null,
      product_name: input.campaign_data.product_name,
      audience: input.campaign_data.audience as any,
      product_positioning: input.campaign_data.product_positioning ?? null,
    },
  });
  const motor3_ms = now() - motor3Start;
  pipelineLog("[MOTOR-3][OUTPUT]", { trace_id, variations: variations.variations.length, motor3_ms });

  const motor4Start = now();
  pipelineLog("[MOTOR-4][INPUT]", { trace_id, variationCount: variations.variations.length });
  const renders = await renderVariations({
    variations: variations.variations.map((spec, index) => ({
      spec,
      productImage: {
        url: input.product_image_url,
        targetBox: imageProfile.targetBox,
      },
      campaignData: {
        campaignId: input.campaign_id,
        variationIndex: index,
        productName: input.campaign_data.product_name,
        price: input.campaign_data.price ?? null,
      },
      visualSignature: {
        logo_url: input.visual_signature.logo_url ?? signature.logo_url ?? null,
        store_name: input.visual_signature.store_name,
      },
    })),
  }, {
    now,
  });
  const motor4_ms = now() - motor4Start;
  pipelineLog("[MOTOR-4][OUTPUT]", { trace_id, renders, motor4_ms });

  const visual_outputs = renders.map((render, index) => ({
    variation_index: index,
    url: render.artUrl,
    metadata: {
      width: render.metadata.width,
      height: render.metadata.height,
      format: render.metadata.format,
      size: render.metadata.size,
      renderTime: render.metadata.renderTime,
    },
  }));

  const total_ms = now() - startedAt;
  pipelineLog("[PIPELINE][END]", { trace_id, total_ms });
  return {
    trace_id,
    campaign_id: input.campaign_id,
    visual_outputs,
    performance: {
      motor1_ms,
      motor2_ms,
      motor3_ms,
      motor4_ms,
      total_ms,
    },
  };
}