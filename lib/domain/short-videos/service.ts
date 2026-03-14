import { supabaseAdmin } from "@/lib/supabase/admin";
import { callAIWithRetry } from "@/lib/ai/parse";
import { fetchStoreContext } from "@/lib/domain/stores/queries";
import { ShortVideoAISchema } from "./schemas";
import { buildShortVideoPrompt } from "./prompts";
import { mapAiShortVideoToDomain, mapDbCampaignToShortVideoContext } from "./mapper";
import { ShortVideoAIOutput, ShortVideoContext } from "./types";

export type GenerateShortVideoInput = {
  campaign_id: string;
  storeId: string;
  force?: boolean;
};

export type GenerateShortVideoResult =
  | { ok: true; reused: true; video: ShortVideoAIOutput }
  | { ok: true; reused: false; video: ShortVideoAIOutput }
  | { ok: false; error: string; details?: unknown; status: number };

/**
 * Pipeline completo de geração de vídeo curto (reels):
 * fetch campaign → idempotency check → validate → fetch store → build prompt → AI → normalize → persist
 */
export async function generateShortVideoContent(
  input: GenerateShortVideoInput
): Promise<GenerateShortVideoResult> {
  const { campaign_id, storeId, force = false } = input;

  // 1) Busca campanha
  const { data: campaign, error: cErr } = await supabaseAdmin
    .from("campaigns")
    .select(
      `id, store_id, product_name, price, audience, objective, product_positioning,
       reels_generated_at, reels_hook, reels_script, reels_shotlist, reels_on_screen_text,
       reels_audio_suggestion, reels_duration_seconds, reels_caption, reels_cta, reels_hashtags`
    )
    .eq("id", campaign_id)
    .eq("store_id", storeId)
    .single();

  if (cErr || !campaign) {
    return { ok: false, error: "CAMPAIGN_NOT_FOUND", details: cErr?.message, status: 404 };
  }

  const campaignCtx = mapDbCampaignToShortVideoContext(campaign);

  // 2) Idempotência — retorna dados já gerados se existirem
  if (!force && campaignCtx.reels_generated_at) {
    const existingVideo: ShortVideoAIOutput = {
      hook: campaignCtx.reels_hook ?? "",
      script: campaignCtx.reels_script ?? "",
      shotlist: campaignCtx.reels_shotlist ?? [],
      on_screen_text: campaignCtx.reels_on_screen_text ?? [],
      audio_suggestion: campaignCtx.reels_audio_suggestion ?? "",
      duration_seconds: campaignCtx.reels_duration_seconds ?? 30,
      caption: campaignCtx.reels_caption ?? "",
      cta: campaignCtx.reels_cta ?? "",
      hashtags: campaignCtx.reels_hashtags ?? "",
    };
    return { ok: true, reused: true, video: existingVideo };
  }

  // 3) Validação mínima
  const nameOk = !!campaignCtx.product_name.trim();
  const audOk = !!campaignCtx.audience.trim();
  const objOk = !!campaignCtx.objective.trim();
  if (!nameOk || !audOk || !objOk) {
    return {
      ok: false,
      error: "INSUFFICIENT_DATA",
      details: "Campanha incompleta: preencha Produto, Público e Objetivo antes de gerar o Vídeo.",
      status: 400,
    };
  }

  // 4) Busca contexto da loja
  const store = await fetchStoreContext(campaignCtx.store_id);
  if (!store) {
    return { ok: false, error: "STORE_NOT_FOUND", status: 404 };
  }

  // 5) Monta prompt e chama IA
  const prompt = buildShortVideoPrompt(campaignCtx, store);
  const { data: aiData } = await callAIWithRetry(prompt, ShortVideoAISchema, { temperature: 0.6 });

  // 6) Normaliza
  const normalized: ShortVideoAIOutput = mapAiShortVideoToDomain(aiData, campaignCtx, store);

  // 7) Persiste
  const { error: upErr } = await supabaseAdmin
    .from("campaigns")
    .update({
      reels_hook: normalized.hook,
      reels_script: normalized.script,
      reels_shotlist: normalized.shotlist,
      reels_on_screen_text: normalized.on_screen_text,
      reels_audio_suggestion: normalized.audio_suggestion,
      reels_duration_seconds: normalized.duration_seconds,
      reels_caption: normalized.caption,
      reels_cta: normalized.cta,
      reels_hashtags: normalized.hashtags,
      reels_generated_at: new Date().toISOString(),
      status: 'ready',
    })
    .eq("id", campaign_id);

  if (upErr) {
    return { ok: false, error: "DB_UPDATE_FAILED", details: upErr.message, status: 500 };
  }

  return { ok: true, reused: false, video: normalized };
}
