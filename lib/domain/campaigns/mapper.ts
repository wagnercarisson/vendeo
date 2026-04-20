import { z } from "zod";
import {
  CampaignAISchema,
  CampaignReelsSchema,
  DbCampaignSchema,
} from "./schemas";
import {
  Campaign,
  CampaignContext,
  CampaignAIOutput,
  CampaignAudience,
  CampaignCanonicalContentType,
  CampaignListItem,
  CampaignReadableContentType,
  ProductPositioning,
} from "./types";
import type { CampaignObjective } from "@/lib/constants/strategy";
import { StoreContext } from "@/lib/domain/stores/types";
import * as selectors from "./selectors";

type AIData = z.infer<typeof CampaignAISchema>;

export function normalizeCampaignContentType(
  value: unknown
): CampaignCanonicalContentType {
  if (value === "service") return "service";
  if (value === "info" || value === "message") return "message";
  return "product";
}

export function buildCampaignContentTypeWrite(
  value: unknown,
  existingLegacyContentType?: unknown
): {
  content_type: CampaignReadableContentType;
  legacy_content_type: string | null;
} {
  const content_type = normalizeCampaignContentType(value);
  const persistedLegacy =
    typeof existingLegacyContentType === "string" && existingLegacyContentType.trim().length > 0
      ? existingLegacyContentType
      : null;

  if (value === "info") {
    return {
      content_type: "info",
      legacy_content_type: "info",
    };
  }

  if (content_type === "message") {
    return {
      content_type: "info",
      legacy_content_type: "info",
    };
  }

  return {
    content_type,
    legacy_content_type: null,
  };
}

function resolveCampaignLegacyContentType(
  rawContentType: CampaignReadableContentType | null,
  storedLegacyContentType?: string | null
): string | null {
  if (typeof storedLegacyContentType === "string" && storedLegacyContentType.trim().length > 0) {
    return storedLegacyContentType;
  }

  return rawContentType === "info" ? "info" : null;
}

export function mapAiCampaignToDomain(
  aiData: AIData,
  campaign: CampaignContext,
  store: StoreContext
): CampaignAIOutput {
  const result = CampaignAISchema.safeParse(aiData);

  // Se validação falhar, usa fallbacks (comportamento atual preservado)
  const validated = result.success ? result.data : {
    headline: null,
    caption: null,
    text: null,
    cta: null,
    hashtags: null,
    price_label: null,
  };

  return {
    headline: (validated.headline ?? "").trim() || campaign.product_name,
    caption:
      (validated.caption ?? "").trim() ||
      `✨ ${campaign.product_name} em destaque!`,
    text:
      (validated.text ?? "").trim() ||
      `Passe na ${store.name} e garanta o seu hoje.`,
    cta:
      (validated.cta ?? "").trim() ||
      (store.whatsapp
        ? "Chama no WhatsApp e peça agora!"
        : "Fale conosco e peça agora!"),
    hashtags:
      (validated.hashtags ?? "").trim() ||
      "#promo #oferta #instafood #loja #bairro",
    price_label: (validated.price_label ?? "").trim() || null,
  };
}

export function mapDbCampaignToDomain(data: unknown): Campaign {
  const result = DbCampaignSchema.safeParse(data);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const path = firstIssue?.path?.join(".") ?? "unknown";
    const msg = firstIssue?.message ?? "validação falhou";
    throw new Error(`[mapDbCampaignToDomain] Campo inválido: ${path} — ${msg}`);
  }

  const raw = result.data;
  const contentType = normalizeCampaignContentType(raw.content_type);
  const legacyContentType = resolveCampaignLegacyContentType(
    raw.content_type,
    raw.legacy_content_type
  );

  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    product_name: raw.product_name ?? null,
    price: raw.price != null ? Number(raw.price) : null,
    price_label: raw.price_label ?? null,
    audience: (raw.audience as CampaignAudience) || null,
    objective: (raw.objective as CampaignObjective) || null,
    product_positioning: (raw.product_positioning as ProductPositioning) || null,
    status: raw.status ?? null,
    campaign_type: raw.campaign_type ?? "both",
    content_type: contentType,
    legacy_content_type: legacyContentType,
    domain_input:
      raw.domain_input && typeof raw.domain_input === "object" && !Array.isArray(raw.domain_input)
        ? raw.domain_input
        : {},
    domain_input_version: raw.domain_input_version ?? 1,
    post_status: raw.post_status ?? "none",
    reels_status: raw.reels_status ?? "none",
    origin: raw.origin === "plan" ? "plan" : "manual",
    weekly_plan_item_id: raw.weekly_plan_item_id ?? null,
    image_url: raw.image_url ?? null,
    product_image_url: raw.product_image_url ?? null,
    headline: raw.headline ?? null,
    body_text: raw.body_text ?? null,
    cta: raw.cta ?? null,
    ai_caption: raw.ai_caption ?? null,
    ai_text: raw.ai_text ?? null,
    ai_cta: raw.ai_cta ?? null,
    ai_hashtags: raw.ai_hashtags ?? null,
    ai_generated_at: raw.ai_generated_at ?? null,
    reels_hook: raw.reels_hook ?? null,
    reels_script: raw.reels_script ?? null,
    reels_shotlist: Array.isArray(raw.reels_shotlist) ? raw.reels_shotlist : null,
    reels_on_screen_text: Array.isArray(raw.reels_on_screen_text) ? raw.reels_on_screen_text : null,
    reels_audio_suggestion: raw.reels_audio_suggestion ?? null,
    reels_duration_seconds: raw.reels_duration_seconds != null ? Number(raw.reels_duration_seconds) : null,
    reels_caption: raw.reels_caption ?? null,
    reels_cta: raw.reels_cta ?? null,
    reels_hashtags: raw.reels_hashtags ?? null,
    reels_generated_at: raw.reels_generated_at ?? null,
    created_at: raw.created_at ? new Date(raw.created_at).toISOString() : new Date().toISOString(),
  };
}

export function mapDbCampaignToAIContext(data: unknown, theme?: string | null): CampaignContext {
  const result = DbCampaignSchema.safeParse(data);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const path = firstIssue?.path?.join(".") ?? "unknown";
    const msg = firstIssue?.message ?? "validação falhou";
    throw new Error(`[mapDbCampaignToAIContext] Campo inválido: ${path} — ${msg}`);
  }

  const raw = result.data;
  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    product_name: String(raw.product_name || "Produto"),
    price: raw.price != null ? String(raw.price) : null,
    price_label: raw.price_label ?? null,
    audience: (raw.audience as CampaignAudience) || "geral",
    objective: (raw.objective as CampaignObjective) || "promocao",
    product_positioning: (raw.product_positioning as ProductPositioning) || null,
    theme: theme ?? null,
  };
}

export function mapCampaignToPreviewData(
  campaign: Campaign,
  store?: any
): any {
  const isApproved = campaign.status === "approved" || campaign.post_status === "approved";
  return {
    image_url: isApproved ? (campaign.image_url || campaign.product_image_url || "") : (campaign.product_image_url || ""),
    headline: campaign.headline || campaign.product_name || "",
    body_text: campaign.ai_text || "",
    cta: campaign.ai_cta || "",
    caption: campaign.ai_caption || "",
    hashtags: campaign.ai_hashtags || "",
    price: campaign.price,
    price_label: campaign.price_label,
    layout: "solid",
    reels_hook: campaign.reels_hook,
    reels_script: campaign.reels_script,
    reels_shotlist: campaign.reels_shotlist,
    reels_on_screen_text: campaign.reels_on_screen_text,
    reels_audio_suggestion: campaign.reels_audio_suggestion,
    reels_duration_seconds: campaign.reels_duration_seconds,
    reels_caption: campaign.reels_caption,
    reels_cta: campaign.reels_cta,
    reels_hashtags: campaign.reels_hashtags,
    store: store ? {
      name: store.name,
      address: `${store.address || ""}${store.neighborhood ? `, ${store.neighborhood}` : ""}`,
      whatsapp: store.whatsapp || store.phone || "",
      primary_color: store.primary_color,
      secondary_color: store.secondary_color,
      logo_url: store.logo_url,
    } : undefined,
  };
}

export function mapAiArtToPreview(
  campaign: Campaign,
  aiResponse: unknown
): Partial<any> {
  const result = CampaignAISchema.safeParse(aiResponse);

  if (!result.success) {
    console.error("[mapAiArtToPreview] AI response inválida:", result.error.format());
    // Fallback — não throw para não quebrar UI
    return {
      headline: campaign.product_name || "",
      body_text: "",
      cta: "",
      caption: "",
      hashtags: "",
      price_label: campaign.price && Number(campaign.price) > 0 ? "OFERTA" : null,
    };
  }

  const ai = result.data;

  return {
    headline: ai.headline || campaign.product_name || "",
    body_text: ai.text || "",
    cta: ai.cta || "",
    caption: ai.caption || "",
    hashtags: ai.hashtags || "",
    price_label: (ai.price_label !== undefined && ai.price_label !== null)
      ? ai.price_label
      : (campaign.price && Number(campaign.price) > 0 ? "OFERTA" : null),
  };
}

export function mapAiReelsToPreview(
  aiResponse: unknown
): Partial<any> {
  const result = CampaignReelsSchema.safeParse(aiResponse);

  if (!result.success) {
    console.error("[mapAiReelsToPreview] AI response inválida:", result.error.format());
    // Fallback — não throw para não quebrar UI
    return {
      reels_hook: "",
      reels_script: "",
      reels_shotlist: [],
      reels_on_screen_text: [],
      reels_audio_suggestion: "",
      reels_duration_seconds: 30,
      reels_caption: "",
      reels_cta: "",
      reels_hashtags: "",
    };
  }

  const reels = result.data;

  return {
    reels_hook: reels.hook || "",
    reels_script: reels.script || "",
    reels_shotlist: reels.shotlist || [],
    reels_on_screen_text: reels.on_screen_text || [],
    reels_audio_suggestion: reels.audio_suggestion || "",
    reels_duration_seconds: reels.duration_seconds || 30,
    reels_caption: reels.caption || "",
    reels_cta: reels.cta || "",
    reels_hashtags: reels.hashtags || "",
  };
}

/**
 * Converte Campaign (domain) para formato DB (snake_case) pronto para Supabase.
 *
 * @example
 * ```typescript
 * const campaign: Campaign = await getCampaignById(id);
 * const dbData = mapDomainToCampaignDb(campaign);
 * await supabase.from('campaigns').update(dbData).eq('id', campaign.id);
 * ```
 */
export function mapDomainToCampaignDb(campaign: Campaign): Record<string, unknown> {
  const contentTypeWrite = buildCampaignContentTypeWrite(
    campaign.content_type,
    campaign.legacy_content_type
  );

  const dbData = {
    product_name: campaign.product_name,
    price: campaign.price,
    price_label: campaign.price_label,
    audience: campaign.audience,
    objective: campaign.objective,
    product_positioning: campaign.product_positioning,
    status: campaign.status,
    campaign_type: campaign.campaign_type,
    ...contentTypeWrite,
    domain_input: campaign.domain_input,
    domain_input_version: campaign.domain_input_version,
    post_status: campaign.post_status,
    reels_status: campaign.reels_status,
    origin: campaign.origin,
    weekly_plan_item_id: campaign.weekly_plan_item_id,
    image_url: campaign.image_url,
    product_image_url: campaign.product_image_url,
    headline: campaign.headline,
    body_text: campaign.body_text,
    cta: campaign.cta,
    ai_caption: campaign.ai_caption,
    ai_text: campaign.ai_text,
    ai_cta: campaign.ai_cta,
    ai_hashtags: campaign.ai_hashtags,
    ai_generated_at: campaign.ai_generated_at,
    reels_hook: campaign.reels_hook,
    reels_script: campaign.reels_script,
    reels_shotlist: campaign.reels_shotlist,
    reels_on_screen_text: campaign.reels_on_screen_text,
    reels_audio_suggestion: campaign.reels_audio_suggestion,
    reels_duration_seconds: campaign.reels_duration_seconds,
    reels_caption: campaign.reels_caption,
    reels_cta: campaign.reels_cta,
    reels_hashtags: campaign.reels_hashtags,
    reels_generated_at: campaign.reels_generated_at,
  };

  // Validar output antes de retornar (garantir que estrutura DB está correta)
  const validation = DbCampaignSchema.partial().safeParse(dbData);
  if (!validation.success) {
    console.error("[mapDomainToCampaignDb] Output inválido:", validation.error.format());
  }

  return dbData;
}

export function mapCampaignToListItem(c: Campaign): CampaignListItem {
  return {
    id: c.id,
    store_id: c.store_id,
    product_name: c.product_name || "Sem nome",
    price: c.price,
    audience: c.audience,
    objective: c.objective,
    product_positioning: c.product_positioning,
    status: selectors.getGlobalStatus(c),
    ui_status: selectors.getUIStatus(c),
    image_url: c.image_url || null,
    product_image_url: c.product_image_url || null,
    created_at: c.created_at,
    campaign_type: c.campaign_type,
    content_type: c.content_type,
    legacy_content_type: c.legacy_content_type,
    post_status: c.post_status,
    reels_status: c.reels_status,
    ai_text: c.ai_text,
    ai_caption: c.ai_caption,
    ai_cta: c.ai_cta,
    ai_hashtags: c.ai_hashtags,
    headline: c.headline,
    reels_hook: c.reels_hook,
    reels_script: c.reels_script,
    reels_shotlist: c.reels_shotlist,
    reels_on_screen_text: c.reels_on_screen_text,
    reels_audio_suggestion: c.reels_audio_suggestion,
    reels_duration_seconds: c.reels_duration_seconds,
    reels_caption: c.reels_caption,
    reels_cta: c.reels_cta,
    reels_hashtags: c.reels_hashtags,
  };
}
