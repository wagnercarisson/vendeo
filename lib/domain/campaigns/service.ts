import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { callAIWithRetry } from "@/lib/ai/parse";
import { fetchStoreContext } from "@/lib/domain/stores/queries";
import { MOTOR_V2_ENABLED } from "@/lib/constants/features";
// TODO: Revisar ao final da Epic 4 - módulo não existe nesta branch
// import { getLatestVisualPreference } from "@/lib/domain/visual-preference/service";
// import { VisualPreferenceShape } from "@/lib/domain/visual-preference/types";
import { CampaignAISchema } from "./schemas";
import { buildCampaignPrompt } from "./prompts";
import { mapAiCampaignToDomain, mapDbCampaignToAIContext } from "./mapper";
import { mapDbCampaignToDomain } from "./mapper";
import { CampaignAIOutput, GenerateCampaignVisualsOutput } from "./types";
import { generateCampaignVisuals, readExistingVisualOutputs } from "./visual-pipeline";

function isExternalHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function getInternalizedImageTarget(response: Response, fallbackUrl: string) {
  const contentTypeHeader = response.headers.get("content-type") || "image/webp";
  const contentType = contentTypeHeader.split(";")[0].trim().toLowerCase();

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };

  const urlPath = (() => {
    try {
      return new URL(fallbackUrl).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();

  const fallbackExtension = urlPath.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || "webp";

  return {
    contentType,
    extension: extensionByType[contentType] || fallbackExtension,
  };
}

/**
 * Internalizes external product image URLs to Supabase Storage.
 * If URL is already a Storage path, returns as-is.
 * Downloads external image, uploads to Storage, returns Storage path.
 */
async function internalizeProductImage(
  imageUrl: string,
  campaignId: string,
  storeId: string
): Promise<string> {
  if (!isExternalHttpUrl(imageUrl)) {
    return imageUrl;
  }

  console.log(`[INTERNALIZE] Downloading external image: ${imageUrl.substring(0, 80)}...`);

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`IMAGE_DOWNLOAD_FAILED: HTTP ${response.status}`);
  }

  const { contentType, extension } = getInternalizedImageTarget(response, imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const path = `stores/${storeId}/products/${campaignId}/source.${extension}`;
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.storage
    .from("campaign-images")
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("[INTERNALIZE] Storage upload failed:", error);
    throw new Error(`STORAGE_UPLOAD_FAILED: ${error.message}`);
  }

  console.log(`[INTERNALIZE] Saved to Storage: ${path}`);
  return path;
}

function readVisualV2State(domainInput: unknown) {
  if (!domainInput || typeof domainInput !== "object" || !("visual_v2" in domainInput)) {
    return null;
  }

  const visualV2 = (domainInput as { visual_v2?: unknown }).visual_v2;
  return visualV2 && typeof visualV2 === "object" ? visualV2 : null;
}

export type GenerateCampaignInput = {
  campaign_id: string;
  storeId: string;
  force?: boolean;
  description?: string;
  persist?: boolean;
};

export type GenerateCampaignResult =
  | { ok: true; reused: true; output?: CampaignAIOutput; visual_output?: GenerateCampaignVisualsOutput }
  | { ok: true; reused: false; campaign_id: string; output?: CampaignAIOutput; visual_output?: GenerateCampaignVisualsOutput }
  | { ok: false; error: string; details?: unknown; status: number };

/**
 * Pipeline completo de geração de conteúdo de campanha:
 * fetch campaign → validate → fetch store → build prompt → AI → normalize → persist
 */
export async function generateCampaignContent(
  input: GenerateCampaignInput
): Promise<GenerateCampaignResult> {
  const { campaign_id, storeId, force = false, description, persist = true } = input;
  const supabaseAdmin = getSupabaseAdmin();

  // 1) Busca campanha e normaliza para o domínio
  const { data: rawCampaign, error: cErr } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("id", campaign_id)
    .eq("store_id", storeId)
    .single();

  if (cErr || !rawCampaign) {
    return { ok: false, error: "CAMPAIGN_NOT_FOUND", details: cErr?.message, status: 404 };
  }

  // Normalização oficial para o domínio camelCase
  const campaign = mapDbCampaignToDomain(rawCampaign);

  // 1.1) Busca o tema da estratégia se vier de um plano
  let strategicTheme: string | null = null;
  if (campaign.weekly_plan_item_id) {
    const { data: wpItem } = await supabaseAdmin
      .from("weekly_plan_items")
      .select("theme")
      .eq("id", campaign.weekly_plan_item_id)
      .single();
    strategicTheme = wpItem?.theme ?? null;
  }

  // Mapeamento de contexto técnico para a IA (mantemos para compatibilidade com prompts legados)
  const campaignCtx = mapDbCampaignToAIContext(rawCampaign, strategicTheme);
  const visualV2State = readVisualV2State(campaign.domain_input);
  const existingVisualOutputs = readExistingVisualOutputs(
    visualV2State && "visual_outputs" in visualV2State
      ? (visualV2State as { visual_outputs?: unknown }).visual_outputs
      : undefined
  );
  const shouldRunVisual = Boolean(
    MOTOR_V2_ENABLED &&
    (campaign.product_image_url || campaign.image_url) &&
    campaign.content_type !== "message"
  );

  // 2) Idempotência (usa a versão snake_case mapeada)
  const already = !!(campaign.ai_caption && campaign.ai_caption.trim().length > 0);
  if (!force && already && (!shouldRunVisual || existingVisualOutputs.length > 0)) {
    return {
      ok: true,
      reused: true,
      visual_output: existingVisualOutputs.length > 0
        ? {
            trace_id: String(
              visualV2State && "trace_id" in visualV2State
                ? (visualV2State as { trace_id?: unknown }).trace_id ?? ""
                : ""
            ),
            campaign_id,
            visual_outputs: existingVisualOutputs,
            performance: {
              motor1_ms: Number(
                visualV2State && "performance" in visualV2State
                  ? ((visualV2State as { performance?: { motor1_ms?: unknown } }).performance?.motor1_ms ?? 0)
                  : 0
              ),
              motor2_ms: Number(
                visualV2State && "performance" in visualV2State
                  ? ((visualV2State as { performance?: { motor2_ms?: unknown } }).performance?.motor2_ms ?? 0)
                  : 0
              ),
              motor3_ms: Number(
                visualV2State && "performance" in visualV2State
                  ? ((visualV2State as { performance?: { motor3_ms?: unknown } }).performance?.motor3_ms ?? 0)
                  : 0
              ),
              motor4_ms: Number(
                visualV2State && "performance" in visualV2State
                  ? ((visualV2State as { performance?: { motor4_ms?: unknown } }).performance?.motor4_ms ?? 0)
                  : 0
              ),
              total_ms: Number(
                visualV2State && "performance" in visualV2State
                  ? ((visualV2State as { performance?: { total_ms?: unknown } }).performance?.total_ms ?? 0)
                  : 0
              ),
            },
            reused: true,
          }
        : undefined,
    };
  }

  // 2.5) Internalize external product image URL to Storage before running the visual pipeline.
  if (campaign.product_image_url) {
    try {
      const previousProductImageUrl = campaign.product_image_url;
      const internalPath = await internalizeProductImage(
        previousProductImageUrl,
        campaign_id,
        storeId
      );

      if (internalPath !== previousProductImageUrl) {
        const { error: updateErr } = await supabaseAdmin
          .from("campaigns")
          .update({ product_image_url: internalPath })
          .eq("id", campaign_id);

        if (updateErr) {
          console.error("[INTERNALIZE] DB update failed:", updateErr);
        }

        campaign.product_image_url = internalPath;
      }
    } catch (error) {
      console.error("[INTERNALIZE] Failed to internalize image:", error);
    }
  }

  // 3) Validação mínima dos dados da campanha
  const nameOk = !!(campaign.product_name || "").trim();
  const audOk = !!(campaign.audience || "").trim();
  const objOk = !!(campaign.objective || "").trim();
  if (!nameOk || !audOk || !objOk) {
    return {
      ok: false,
      error: "INSUFFICIENT_DATA",
      details: "Campanha incompleta: preencha Produto, Público e Objetivo antes de gerar o texto.",
      status: 400,
    };
  }

  // 4) Busca contexto da loja
  const store = await fetchStoreContext(campaignCtx.store_id);
  if (!store) {
    return { ok: false, error: "STORE_NOT_FOUND", status: 404 };
  }

  // TODO: Revisar ao final da Epic 4 - visual-preference não implementado nesta branch
  // let visualPreference: VisualPreferenceShape | null = null;
  // try {
  //   visualPreference = await getLatestVisualPreference(storeId);
  //   console.log('[DEBUG 2.7] Visual Preference loaded:', visualPreference ? 'YES' : 'NO', visualPreference);
  // } catch (err) {
  //   console.error('[campaigns/service] visual preference fetch failed:', err);
  // }

  // 4.1) Contexto de geração: rastreabilidade completa da base declarativa e contextual usada.
  // brand_profile_source indica se a identidade veio do Brand Profile publicado
  // ou do fallback legado determinístico.
  // Fallback legado não é preferência aprendida nem snapshot de composição.
  // main_segment vem exclusivamente da Store (não do Brand Profile).
  // O snapshot abaixo captura os dados efetivos no momento da geração para auditoria posterior.
  const bp = store.brand_profile;
  const generationContext = {
    // TODO: Revisar ao final da Epic 4 - brand_profile_source não vem de fetchStoreContext
    // brand_profile_source: store.brand_profile_source ?? "legacy",
    brand_profile_version: store.brand_profile_version ?? null,
    brand_profile_updated_at: store.brand_profile_updated_at ?? null,
    resolved_at: new Date().toISOString(),
    visual_preference: null, // TODO: Revisar ao final da Epic 4
    store: {
      store_id: store.id,
      main_segment: store.main_segment ?? null,
      brand_profile: bp
        ? {
            store_name: bp.store_name,
            contact: {
              whatsapp: bp.contact.whatsapp,
              phone: bp.contact.phone,
            },
            location: {
              address: bp.location.address,
              neighborhood: bp.location.neighborhood ?? null,
              city: bp.location.city ?? null,
              state: bp.location.state ?? null,
            },
            visual: {
              primary_color: bp.visual.primary_color,
              secondary_color: bp.visual.secondary_color,
              logo_url: bp.visual.logo_url,
            },
            voice: {
              tone_of_voice: bp.voice.tone_of_voice,
              brand_positioning: bp.voice.brand_positioning,
            },
          }
        : null,
    },
  };

  let normalized: CampaignAIOutput | undefined;
  if (!already || force) {
    const prompt = buildCampaignPrompt(campaignCtx, store, null, description); // TODO: Revisar ao final da Epic 4
    const { data: aiData } = await callAIWithRetry(prompt, CampaignAISchema, { temperature: 0.7 });
    normalized = mapAiCampaignToDomain(aiData, campaignCtx, store);
  }

  let visualOutput: GenerateCampaignVisualsOutput | undefined;
  if (shouldRunVisual) {
    try {
      visualOutput = await generateCampaignVisuals({
        campaign_id,
        store_id: storeId,
        product_image_url: campaign.product_image_url || campaign.image_url || "",
        campaign_data: {
          product_name: campaign.product_name || "Produto",
          objective: campaign.objective || "promocao",
          audience: campaign.audience || "geral",
          price: campaign.price,
          price_label: campaign.price_label,
          content_type: campaign.content_type || "product",
          product_positioning: campaign.product_positioning,
        },
        visual_signature: {
          logo_url: store.logo_url,
          store_name: store.name,
        },
        force,
        existing_visual_outputs: existingVisualOutputs,
      });
    } catch (error: any) {
      return {
        ok: false,
        error: error?.code || "VISUAL_PIPELINE_FAILED",
        details: error,
        status: 422,
      };
    }
  }

  // 7) Persiste no banco usando nomes de colunas snake_case (se persist for true)
  if (persist) {
    const persistedVisualState = visualOutput
      ? {
          trace_id: visualOutput.trace_id,
          visual_outputs: visualOutput.visual_outputs,
          performance: visualOutput.performance,
          generated_at: new Date().toISOString(),
        }
      : campaign.domain_input?.visual_v2;

    const { error: upErr } = await supabaseAdmin
      .from("campaigns")
      .update({
        headline: normalized?.headline ?? campaign.headline,
        ai_caption: normalized?.caption ?? campaign.ai_caption,
        ai_text: normalized?.text ?? campaign.ai_text,
        ai_cta: normalized?.cta ?? campaign.ai_cta,
        ai_hashtags: normalized?.hashtags ?? campaign.ai_hashtags,
        ai_generated_at: new Date().toISOString(),
        status: 'ready',
        post_status: 'ready',
        image_url: visualOutput?.visual_outputs[0]?.url ?? campaign.image_url,
        domain_input: {
          ...generationContext,
          ...(campaign.domain_input || {}),
          ...(persistedVisualState ? { visual_v2: persistedVisualState } : {}),
        },
      })
      .eq("id", campaign_id);

    if (upErr) {
      return { ok: false, error: "DB_UPDATE_FAILED", details: upErr.message, status: 500 };
    }
  }

  return { ok: true, reused: false, campaign_id, output: normalized, visual_output: visualOutput };
}
