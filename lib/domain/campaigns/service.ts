import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { callAIWithRetry } from "@/lib/ai/parse";
import { fetchStoreContext } from "@/lib/domain/stores/queries";
// TODO: Revisar ao final da Epic 4 - módulo não existe nesta branch
// import { getLatestVisualPreference } from "@/lib/domain/visual-preference/service";
// import { VisualPreferenceShape } from "@/lib/domain/visual-preference/types";
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

  // 5) Monta prompt e chama IA
  const prompt = buildCampaignPrompt(campaignCtx, store, null, description); // TODO: Revisar ao final da Epic 4
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
        post_status: 'ready',
        domain_input: generationContext,
      })
      .eq("id", campaign_id);

    if (upErr) {
      return { ok: false, error: "DB_UPDATE_FAILED", details: upErr.message, status: 500 };
    }
  }

  return { ok: true, reused: false, campaign_id, output: normalized };
}
