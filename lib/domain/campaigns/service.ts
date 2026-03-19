import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { callAIWithRetry } from "@/lib/ai/parse";
import { fetchStoreContext } from "@/lib/domain/stores/queries";
import { CampaignAISchema } from "./schemas";
import { buildCampaignPrompt } from "./prompts";
import { mapAiCampaignToDomain, mapDbCampaignToAIContext } from "./mapper";
import { mapDbCampaignToDomain } from "./mapper";
import { CampaignAIOutput } from "./types";

export type GenerateCampaignInput = {
  campaign_id: string;
  storeId: string;
  force?: boolean;
  description?: string;
  persist?: boolean;
};

export type GenerateCampaignResult =
  | { ok: true; reused: true; output?: CampaignAIOutput }
  | { ok: true; reused: false; campaign_id: string; output?: CampaignAIOutput }
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

  // Mapeamento de contexto técnico para a IA (mantemos para compatibilidade com prompts legados)
  const campaignCtx = mapDbCampaignToAIContext(rawCampaign);

  // 2) Idempotência (usa a versão snake_case mapeada)
  const already = !!(campaign.ai_caption && campaign.ai_caption.trim().length > 0);
  if (!force && already) {
    return { ok: true, reused: true };
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

  // 5) Monta prompt e chama IA
  const prompt = buildCampaignPrompt(campaignCtx, store, description);
  const { data: aiData } = await callAIWithRetry(prompt, CampaignAISchema, { temperature: 0.7 });

  // 6) Normaliza cópia gerada
  const normalized: CampaignAIOutput = mapAiCampaignToDomain(aiData, campaignCtx, store);

  // 7) Persiste no banco usando nomes de colunas snake_case (se persist for true)
  if (persist) {
    const { error: upErr } = await supabaseAdmin
      .from("campaigns")
      .update({
        headline: normalized.headline,
        ai_caption: normalized.caption,
        ai_text: normalized.text,
        ai_cta: normalized.cta,
        ai_hashtags: normalized.hashtags,
        ai_generated_at: new Date().toISOString(),
        status: 'ready',
      })
      .eq("id", campaign_id);

    if (upErr) {
      return { ok: false, error: "DB_UPDATE_FAILED", details: upErr.message, status: 500 };
    }
  }

  return { ok: true, reused: false, campaign_id, output: normalized };
}
