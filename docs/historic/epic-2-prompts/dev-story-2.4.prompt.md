# Prompt: @dev — Implementar Story 2.4 (Mappers Seguros)

---

## 📋 ANALYSIS

**Why this prompt structure:**

1. **Progressive Refactoring:** 5 etapas (1 função por vez) com checkpoints — reduz risco de quebrar múltiplas funções simultaneamente.

2. **Error Strategy Differentiation:** THROW vs FALLBACK dependendo do contexto (server vs client) — requires explicit examples.

3. **Interactive Mode (not YOLO):** HIGH RISK refactoring em produção — educational checkpoints ensinam patterns progressivamente.

4. **BEFORE/AFTER Code:** Cada função mostra estado atual + refatorado — clarity sobre mudanças.

5. **Real Data Fixtures:** `REAL_DB_ROW` incluído — testes cobrem casos reais do Supabase.

**Model Recommendation:** Claude Sonnet 4.6 (1x) — HIGH RISK refactoring + error handling estratégico.

---

## 🤖 SYSTEM PROMPT

Copie tudo abaixo desta linha e envie para @dev.

---

<context>
**Projeto:** Vendeo — sales engine para lojas físicas (Next.js + TypeScript + Supabase)

**Story:** 2.4 — Mappers Seguros  
**Status:** Ready (validado @po 10/10)  
**Epic:** Epic 2 — Arquitetura de Campanhas

**Dependencies:** Story 2.1 ✅ (schemas Zod), Story 2.2 ✅ (tipos), Story 2.3 ✅ (contracts)

**Objetivo:** Refatorar `mapper.ts` para substituir `.parse()` (throw genérico) por `.safeParse()` com error handling estratégico. Criar `mapDomainToCampaignDb()` para write operations.

**Complexity:** 🔴 **HIGH RISK** — código em produção, volume alto (listagens + preview)

**Esforço:** 3-4h  
**Modo recomendado:** **INTERACTIVE** (educational checkpoints, não YOLO)
</context>

---

<critical_requirements>
1. **Error Handling Strategy (MUST FOLLOW):**

| Function | Strategy | Rationale |
|----------|----------|-----------|
| `mapDbCampaignToDomain()` | **THROW** with useful message | service.ts expects throw — callers have try/catch |
| `mapDbCampaignToAIContext()` | **THROW** with useful message | Server-side only, errors should propagate |
| `mapAiArtToPreview()` | **FALLBACK** (no throw) | Client-side UI — degrade gracefully, log error |
| `mapAiReelsToPreview()` | **FALLBACK** (no throw) | Client-side UI — degrade gracefully, log error |

2. **Zero Breaking Changes:** Assinaturas de funções DEVEM permanecer idênticas — callers existentes não podem quebrar.

3. **Progressive Refactoring:** Refatorar **1 função por vez** + checkpoint após cada → evita quebrar tudo simultaneamente.

4. **Real Data Testing:** Testes DEVEM usar fixture `REAL_DB_ROW` (estrutura Supabase) — não apenas mocks sintéticos.

5. **Validation Before Returning:** `mapDomainToCampaignDb()` output DEVE ser validado com `DbCampaignSchema.partial()` antes de retornar.

6. **Risk Alert:** 🔴 ALTO — `DbCampaignSchema.safeParse()` must accept legacy `content_type: "info"` (verify CampaignReadableContentTypeSchema is used in schemas.ts).
</critical_requirements>

---

<implementation_plan>
## Workflow (5 Etapas + 5 Checkpoints)

### Etapa 1: Refatorar mapDbCampaignToDomain() (THROW strategy)

**Ação:** Substituir `DbCampaignSchema.parse(data)` por `.safeParse()` + throw com mensagem útil.

**BEFORE (código atual):**
```typescript
export function mapDbCampaignToDomain(data: unknown): Campaign {
  const raw = DbCampaignSchema.parse(data); // ❌ Throw genérico
  const contentType = normalizeCampaignContentType(raw.content_type);
  // ... resto do mapping
}
```

**AFTER (refatorado):**
```typescript
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
```

**Checkpoint 1:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Se houver erro, PARE e reporte.

---

### Etapa 2: Refatorar mapDbCampaignToAIContext() (THROW strategy)

**Ação:** Substituir `DbCampaignSchema.parse(data)` por `.safeParse()` + throw com mensagem útil.

**BEFORE (código atual):**
```typescript
export function mapDbCampaignToAIContext(data: unknown, theme?: string | null): CampaignContext {
  const raw = DbCampaignSchema.parse(data); // ❌ Throw genérico
  return {
    id: String(raw.id),
    store_id: String(raw.store_id),
    product_name: String(raw.product_name || "Produto"),
    // ... resto
  };
}
```

**AFTER (refatorado):**
```typescript
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
```

**Checkpoint 2:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Se houver erro, PARE e reporte.

---

### Etapa 3: Refatorar mapAiArtToPreview() e mapAiReelsToPreview() (FALLBACK strategy)

**Ação:** Substituir `.parse()` por `.safeParse()` + fallback (não throw) + console.error.

**BEFORE (mapAiArtToPreview — código atual):**
```typescript
export function mapAiArtToPreview(campaign: Campaign, aiResponse: unknown): Partial<any> {
  const ai = CampaignAISchema.parse(aiResponse); // ❌ Throw genérico

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
```

**AFTER (mapAiArtToPreview — refatorado):**
```typescript
export function mapAiArtToPreview(campaign: Campaign, aiResponse: unknown): Partial<any> {
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
```

**BEFORE (mapAiReelsToPreview — código atual):**
```typescript
export function mapAiReelsToPreview(aiResponse: unknown): Partial<any> {
  const reels = CampaignReelsSchema.parse(aiResponse); // ❌ Throw genérico

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
```

**AFTER (mapAiReelsToPreview — refatorado):**
```typescript
export function mapAiReelsToPreview(aiResponse: unknown): Partial<any> {
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
```

**Checkpoint 3:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Se houver erro, PARE e reporte.

---

### Etapa 4: Atualizar mapAiCampaignToDomain() (validação + fallbacks)

**Ação:** Validar `aiData` com `CampaignAISchema.safeParse()` antes de acessar campos.

**BEFORE (código atual — sem validação):**
```typescript
export function mapAiCampaignToDomain(
  aiData: AIData,
  campaign: CampaignContext,
  store: StoreContext
): CampaignAIOutput {
  return {
    headline: (aiData.headline ?? "").trim() || campaign.product_name,
    caption:
      (aiData.caption ?? "").trim() ||
      `✨ ${campaign.product_name} em destaque!`,
    text:
      (aiData.text ?? "").trim() ||
      `Passe na ${store.name} e garanta o seu hoje.`,
    cta:
      (aiData.cta ?? "").trim() ||
      (store.whatsapp
        ? "Chama no WhatsApp e peça agora!"
        : "Fale conosco e peça agora!"),
    hashtags:
      (aiData.hashtags ?? "").trim() ||
      "#promo #oferta #instafood #loja #bairro",
    price_label: (aiData.price_label ?? "").trim() || null,
  };
}
```

**AFTER (refatorado com validação):**
```typescript
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
```

**Checkpoint 4:**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Se houver erro, PARE e reporte.

---

### Etapa 5: Criar mapDomainToCampaignDb() (write mapper)

**Ação:** Criar nova função para converter `Campaign` (domain) → objeto DB (snake_case).

**NOVO CÓDIGO (criar):**
```typescript
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
```

**Checkpoint 5 (FINAL):**
```powershell
npm run typecheck
```
**Expected:** 0 errors. Se houver erro, PARE e reporte.

---

### Etapa 6: Criar mapper.test.ts com dados reais

**Ação:** Criar testes unitários para todas as funções refatoradas.

**NOVO ARQUIVO (criar lib/domain/campaigns/mapper.test.ts):**

```typescript
import { describe, it, expect } from "vitest";
import {
  mapDbCampaignToDomain,
  mapDbCampaignToAIContext,
  mapAiArtToPreview,
  mapAiReelsToPreview,
  mapAiCampaignToDomain,
  mapDomainToCampaignDb,
} from "./mapper";
import type { Campaign, CampaignContext } from "./types";
import type { StoreContext } from "@/lib/domain/stores/types";

// Fixture com dados reais do banco Supabase
const REAL_DB_ROW = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  store_id: "456e7890-e89b-12d3-a456-426614174001",
  product_name: "Tênis Nike Air Max",
  price: 299.90,
  price_label: null,
  audience: "jovens_festa",
  objective: "promocao",
  product_positioning: "medio",
  status: "ready",
  campaign_type: "post",
  content_type: "product",
  legacy_content_type: null,
  domain_input: {},
  domain_input_version: 1,
  post_status: "ready",
  reels_status: "none",
  origin: "manual",
  weekly_plan_item_id: null,
  image_url: null,
  product_image_url: "https://example.com/image.jpg",
  headline: "Tênis Nike em Promoção!",
  body_text: null,
  cta: null,
  ai_caption: null,
  ai_text: null,
  ai_cta: null,
  ai_hashtags: null,
  ai_generated_at: null,
  reels_hook: null,
  reels_script: null,
  reels_shotlist: null,
  reels_on_screen_text: null,
  reels_audio_suggestion: null,
  reels_duration_seconds: null,
  reels_caption: null,
  reels_cta: null,
  reels_hashtags: null,
  reels_generated_at: null,
  created_at: "2026-04-20T10:00:00Z",
};

describe("mapDbCampaignToDomain", () => {
  it("mapeia dado real do banco corretamente", () => {
    const result = mapDbCampaignToDomain(REAL_DB_ROW);
    expect(result.id).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(result.product_name).toBe("Tênis Nike Air Max");
    expect(result.price).toBe(299.90);
    expect(result.content_type).toBe("product");
  });

  it("lança erro com mensagem útil quando campo obrigatório ausente", () => {
    const invalid = { ...REAL_DB_ROW, id: undefined };
    expect(() => mapDbCampaignToDomain(invalid)).toThrow("[mapDbCampaignToDomain] Campo inválido: id");
  });

  it("mapeia content_type legacy 'info' corretamente", () => {
    const legacy = { ...REAL_DB_ROW, content_type: "info", legacy_content_type: "info" };
    const result = mapDbCampaignToDomain(legacy);
    expect(result.content_type).toBe("message"); // normalizeCampaignContentType("info") → "message"
    expect(result.legacy_content_type).toBe("info");
  });
});

describe("mapDbCampaignToAIContext", () => {
  it("mapeia dado real do banco para CampaignContext", () => {
    const result = mapDbCampaignToAIContext(REAL_DB_ROW);
    expect(result.product_name).toBe("Tênis Nike Air Max");
    expect(result.audience).toBe("jovens_festa");
    expect(result.objective).toBe("promocao");
  });

  it("usa fallback quando product_name é null", () => {
    const withoutName = { ...REAL_DB_ROW, product_name: null };
    const result = mapDbCampaignToAIContext(withoutName);
    expect(result.product_name).toBe("Produto");
  });

  it("lança erro quando campo obrigatório ausente", () => {
    const invalid = { ...REAL_DB_ROW, store_id: undefined };
    expect(() => mapDbCampaignToAIContext(invalid)).toThrow("[mapDbCampaignToAIContext] Campo inválido: store_id");
  });
});

describe("mapAiArtToPreview", () => {
  const mockCampaign: Campaign = {
    id: "123",
    store_id: "456",
    product_name: "Produto Teste",
    price: 99.90,
    price_label: null,
    audience: null,
    objective: null,
    product_positioning: null,
    status: null,
    campaign_type: "both",
    content_type: "product",
    legacy_content_type: null,
    domain_input: {},
    domain_input_version: 1,
    post_status: "none",
    reels_status: "none",
    origin: "manual",
    weekly_plan_item_id: null,
    image_url: null,
    product_image_url: null,
    headline: null,
    body_text: null,
    cta: null,
    ai_caption: null,
    ai_text: null,
    ai_cta: null,
    ai_hashtags: null,
    ai_generated_at: null,
    reels_hook: null,
    reels_script: null,
    reels_shotlist: null,
    reels_on_screen_text: null,
    reels_audio_suggestion: null,
    reels_duration_seconds: null,
    reels_caption: null,
    reels_cta: null,
    reels_hashtags: null,
    reels_generated_at: null,
    created_at: "2026-04-20T10:00:00Z",
  };

  it("mapeia AI response válida corretamente", () => {
    const aiResponse = {
      headline: "Promoção Imperdível!",
      caption: "Teste caption",
      text: "Texto promocional",
      cta: "Compre agora",
      hashtags: "#promo #teste",
      price_label: "DESCONTO",
    };
    const result = mapAiArtToPreview(mockCampaign, aiResponse);
    expect(result.headline).toBe("Promoção Imperdível!");
    expect(result.price_label).toBe("DESCONTO");
  });

  it("retorna fallback quando AI response inválida (não throw)", () => {
    const invalid = { headline: 123 }; // Tipo incorreto
    const result = mapAiArtToPreview(mockCampaign, invalid);
    expect(result.headline).toBe("Produto Teste"); // Fallback para product_name
    expect(result.body_text).toBe("");
    expect(result.cta).toBe("");
  });
});

describe("mapAiReelsToPreview", () => {
  it("mapeia reels response válida corretamente", () => {
    const reelsResponse = {
      hook: "Hook inicial",
      script: "Script completo",
      shotlist: ["Shot 1", "Shot 2"],
      on_screen_text: ["Texto 1"],
      audio_suggestion: "Música sugerida",
      duration_seconds: 45,
      caption: "Caption reels",
      cta: "CTA reels",
      hashtags: "#reels",
    };
    const result = mapAiReelsToPreview(reelsResponse);
    expect(result.reels_hook).toBe("Hook inicial");
    expect(result.reels_duration_seconds).toBe(45);
  });

  it("retorna fallback quando reels response inválida (não throw)", () => {
    const invalid = { hook: null, script: 123 }; // Tipos incorretos
    const result = mapAiReelsToPreview(invalid);
    expect(result.reels_hook).toBe("");
    expect(result.reels_script).toBe("");
    expect(result.reels_shotlist).toEqual([]);
    expect(result.reels_duration_seconds).toBe(30); // Fallback
  });
});

describe("mapAiCampaignToDomain", () => {
  const mockCampaignContext: CampaignContext = {
    id: "123",
    store_id: "456",
    product_name: "Produto Teste",
    price: "99.90",
    price_label: null,
    audience: "geral",
    objective: "promocao",
    product_positioning: null,
    theme: null,
  };

  const mockStoreContext: StoreContext = {
    id: "456",
    name: "Loja Teste",
    whatsapp: "11999999999",
    address: null,
    neighborhood: null,
    primary_color: "#000000",
    secondary_color: "#FFFFFF",
    logo_url: null,
  };

  it("usa dados validados quando aiData é válido", () => {
    const aiData = {
      headline: "Headline AI",
      caption: "Caption AI",
      text: "Texto AI",
      cta: "CTA AI",
      hashtags: "#ai #test",
      price_label: "AI LABEL",
    };
    const result = mapAiCampaignToDomain(aiData, mockCampaignContext, mockStoreContext);
    expect(result.headline).toBe("Headline AI");
    expect(result.caption).toBe("Caption AI");
  });

  it("usa fallbacks quando aiData tem campos ausentes", () => {
    const aiData = {}; // Sem campos
    const result = mapAiCampaignToDomain(aiData, mockCampaignContext, mockStoreContext);
    expect(result.headline).toBe("Produto Teste"); // Fallback para campaign.product_name
    expect(result.caption).toContain("Produto Teste em destaque"); // Fallback template
  });
});

describe("mapDomainToCampaignDb", () => {
  const mockCampaign: Campaign = {
    id: "123",
    store_id: "456",
    product_name: "Produto Teste",
    price: 99.90,
    price_label: "OFERTA",
    audience: "geral",
    objective: "promocao",
    product_positioning: "medio",
    status: "ready",
    campaign_type: "both",
    content_type: "message",
    legacy_content_type: null,
    domain_input: { test: "value" },
    domain_input_version: 1,
    post_status: "ready",
    reels_status: "none",
    origin: "manual",
    weekly_plan_item_id: null,
    image_url: null,
    product_image_url: "https://example.com/img.jpg",
    headline: "Headline teste",
    body_text: null,
    cta: null,
    ai_caption: "Caption AI",
    ai_text: "Texto AI",
    ai_cta: "CTA AI",
    ai_hashtags: "#test",
    ai_generated_at: "2026-04-20T10:00:00Z",
    reels_hook: null,
    reels_script: null,
    reels_shotlist: null,
    reels_on_screen_text: null,
    reels_audio_suggestion: null,
    reels_duration_seconds: null,
    reels_caption: null,
    reels_cta: null,
    reels_hashtags: null,
    reels_generated_at: null,
    created_at: "2026-04-20T10:00:00Z",
  };

  it("converte Campaign para formato DB com campos snake_case", () => {
    const result = mapDomainToCampaignDb(mockCampaign);
    expect(result.product_name).toBe("Produto Teste");
    expect(result.price).toBe(99.90);
    expect(result.price_label).toBe("OFERTA");
    expect(result.ai_caption).toBe("Caption AI");
  });

  it("usa buildCampaignContentTypeWrite para content_type 'message'", () => {
    const result = mapDomainToCampaignDb(mockCampaign);
    expect(result.content_type).toBe("info"); // "message" → "info" (via buildCampaignContentTypeWrite)
    expect(result.legacy_content_type).toBe("info");
  });

  it("converte content_type 'product' corretamente", () => {
    const productCampaign = { ...mockCampaign, content_type: "product" as const };
    const result = mapDomainToCampaignDb(productCampaign);
    expect(result.content_type).toBe("product");
    expect(result.legacy_content_type).toBe(null);
  });
});
```

**Checkpoint 6 (FINAL):**
```powershell
# Rodar testes
npx vitest run lib/domain/campaigns/mapper.test.ts

# Typecheck final
npm run typecheck
```

**Expected:**
- Testes: 15+ passing (happy path + error cases + fallbacks)
- Typecheck: 0 errors

</implementation_plan>

---

<validation_checklist>
## Definition of Done (copie da story)

Marque cada item APÓS confirmar:

- [ ] `mapDbCampaignToDomain()` refatorado: usa `DbCampaignSchema.safeParse()` + throw com mensagem útil
- [ ] `mapDbCampaignToAIContext()` refatorado: usa `DbCampaignSchema.safeParse()` + throw com mensagem útil
- [ ] `mapAiArtToPreview()` refatorado: usa `CampaignAISchema.safeParse()` + fallback (sem throw) + console.error
- [ ] `mapAiReelsToPreview()` refatorado: usa `CampaignReelsSchema.safeParse()` + fallback (sem throw) + console.error
- [ ] `mapAiCampaignToDomain()` atualizado: valida aiData com `CampaignAISchema.safeParse()` antes de acessar campos
- [ ] `mapDomainToCampaignDb()` criado com input `Campaign`, output com campos snake_case para supabase
- [ ] `mapDomainToCampaignDb()` usa `buildCampaignContentTypeWrite()` para content_type
- [ ] JSDoc com `@example` e descrição de error handling em todas as funções refatoradas
- [ ] `lib/domain/campaigns/mapper.test.ts` criado com testes para cada função
- [ ] Testes cobrem: happy path com dado real, campo obrigatório ausente, fallback de aiData inválido
- [ ] `npm run typecheck` passa com 0 erros
- [ ] `npx vitest run lib/domain/campaigns/mapper.test.ts` passa
- [ ] Assinaturas de todas as funções existentes inalteradas (zero breaking changes)

**Reporte:** Ao marcar DoD completo, forneça output de typecheck e vitest.

</validation_checklist>

---

<instructions>
1. **Etapa 1:** Refatorar `mapDbCampaignToDomain()` + Checkpoint 1
2. **Etapa 2:** Refatorar `mapDbCampaignToAIContext()` + Checkpoint 2
3. **Etapa 3:** Refatorar `mapAiArtToPreview()` e `mapAiReelsToPreview()` + Checkpoint 3
4. **Etapa 4:** Atualizar `mapAiCampaignToDomain()` + Checkpoint 4
5. **Etapa 5:** Criar `mapDomainToCampaignDb()` + Checkpoint 5
6. **Etapa 6:** Criar `mapper.test.ts` com dados reais + Checkpoint 6 FINAL
7. **Marque DoD** como completo na story (`docs/stories/2.4.story.md`)
8. **Commit:** `refactor: add safe error handling to campaign mappers with .safeParse() [Story 2.4]`
9. **NÃO push** — aguardar @devops (Article II: Agent Authority)
10. **Reporte para @qa** quando pronto
</instructions>

---

<anti_patterns>
❌ **NEVER DO:**
- Refatorar todas as funções de uma vez (MUST refactor 1 por vez + checkpoint)
- Usar fallback em `mapDbCampaignToDomain()` ou `mapDbCampaignToAIContext()` (MUST throw)
- Usar throw em `mapAiArtToPreview()` ou `mapAiReelsToPreview()` (MUST fallback)
- Alterar assinaturas de funções existentes (zero breaking changes)
- Prosseguir se qualquer checkpoint falhar
- Criar `mapDomainToCampaignDb()` sem usar `buildCampaignContentTypeWrite()`
- Usar dados sintéticos em testes (MUST usar REAL_DB_ROW)

✅ **ALWAYS DO:**
- Refatorar 1 função + rodar checkpoint ANTES de próxima
- THROW com mensagem útil em funções de read (server-side)
- FALLBACK + console.error em funções de UI (client-side)
- Validar output de `mapDomainToCampaignDb()` antes de retornar
- Usar REAL_DB_ROW fixture em testes
- Reportar resultado de CADA checkpoint
</anti_patterns>

---

<error_recovery>
### Se Checkpoint falhar:

**Erro comum 1:** `DbCampaignSchema.safeParse()` rejeita `content_type: "info"`
**Causa:** `CampaignReadableContentTypeSchema` não aceita "info"
**Fix:** Verificar `schemas.ts` — `CampaignReadableContentTypeSchema` DEVE ser `z.union([z.literal("product"), z.literal("service"), z.literal("info")])`. Se não for, Story 2.1 está incompleta.

**Erro comum 2:** Typecheck falha com "Property 'data' does not exist on type 'SafeParseError'"
**Causa:** Acessou `result.data` sem checar `result.success`
**Fix:** Sempre usar `if (!result.success) { throw ... } const raw = result.data;`

**Erro comum 3:** Testes de `mapAiArtToPreview` throwam mesmo com `.safeParse()`
**Causa:** Esqueceu de retornar fallback no `if (!result.success)`
**Fix:** Adicionar `return { headline: "", body_text: "", ... }` no bloco de erro

**Erro comum 4:** `mapDomainToCampaignDb()` cria `content_type: "message"` em vez de `"info"`
**Causa:** Não usou `buildCampaignContentTypeWrite()`
**Fix:** Substituir atribuição manual por `const contentTypeWrite = buildCampaignContentTypeWrite(campaign.content_type, campaign.legacy_content_type); return { ...contentTypeWrite, ... }`

</error_recovery>

---

**END OF PROMPT**
