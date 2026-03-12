import { supabaseAdmin } from "@/lib/supabase/admin";
import { callAIWithRetry } from "@/lib/ai/parse";
import { fetchStoreContext } from "@/lib/domain/stores/queries";
import { CampaignAISchema, CampaignRequestSchema } from "./schemas";
import { buildCampaignPrompt } from "./prompts";
import { normalizeCampaignAI } from "./mapper";
import { CampaignAIOutput, CampaignContext } from "./types";

export type GenerateCampaignInput = {
  campaign_id: string;
  storeId: string;
  force?: boolean;
  description?: string;
};

export type GenerateCampaignResult =
  | { ok: true; reused: true }
  | { ok: true; reused: false; campaign_id: string }
  | { ok: false; error: string; details?: unknown; status: number };

/**
 * Pipeline completo de geração de conteúdo de campanha:
 * fetch campaign → idempotency check → validate → fetch store → build prompt → AI → normalize → persist
 */
export async function generateCampaignContent(
  input: GenerateCampaignInput
): Promise<GenerateCampaignResult> {
  const { campaign_id, storeId, force = false, description } = input;

  // 1) Busca campanha
  const { data: campaign, error: cErr } = await supabaseAdmin
    .from("campaigns")
    .select(
      `id, store_id, product_name, price, audience, objective, product_positioning,
       headline, ai_caption, ai_text, ai_cta, ai_hashtags`
    )
    .eq("id", campaign_id)
    .eq("store_id", storeId)
    .single();

  if (cErr || !campaign) {
    return { ok: false, error: "CAMPAIGN_NOT_FOUND", details: cErr?.message, status: 404 };
  }

  // 2) Idempotência
  const already = !!(campaign.ai_caption && String(campaign.ai_caption).trim().length > 0);
  if (!force && already) {
    return { ok: true, reused: true };
  }

  // 3) Validação mínima dos dados da campanha
  const nameOk = !!String(campaign.product_name ?? "").trim();
  const audOk = !!String(campaign.audience ?? "").trim();
  const objOk = !!String(campaign.objective ?? "").trim();
  if (!nameOk || !audOk || !objOk) {
    return {
      ok: false,
      error: "INSUFFICIENT_DATA",
      details: "Campanha incompleta: preencha Produto, Público e Objetivo antes de gerar o texto.",
      status: 400,
    };
  }

  // 4) Busca contexto da loja
  const store = await fetchStoreContext(campaign.store_id);
  if (!store) {
    return { ok: false, error: "STORE_NOT_FOUND", status: 404 };
  }

  const campaignCtx: CampaignContext = {
    id: campaign.id,
    store_id: campaign.store_id,
    product_name: campaign.product_name,
    price: campaign.price,
    audience: campaign.audience,
    objective: campaign.objective,
    product_positioning: campaign.product_positioning,
  };

  // 5) Monta prompt e chama IA
  const prompt = buildCampaignPrompt(campaignCtx, store, description);
  const { data: aiData } = await callAIWithRetry(prompt, CampaignAISchema, { temperature: 0.7 });

  // 6) Normaliza com fallbacks
  const normalized: CampaignAIOutput = normalizeCampaignAI(aiData, campaignCtx, store);

  // 7) Persiste no banco
  const { error: upErr } = await supabaseAdmin
    .from("campaigns")
    .update({
      headline: normalized.headline,
      ai_caption: normalized.caption,
      ai_text: normalized.text,
      ai_cta: normalized.cta,
      ai_hashtags: normalized.hashtags,
      ai_generated_at: new Date().toISOString(),
    })
    .eq("id", campaign_id);

  if (upErr) {
    return { ok: false, error: "DB_UPDATE_FAILED", details: upErr.message, status: 500 };
  }

  return { ok: true, reused: false, campaign_id };
}
