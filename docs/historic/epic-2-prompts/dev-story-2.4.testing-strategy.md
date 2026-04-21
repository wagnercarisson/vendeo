# Testing Strategy — Story 2.4 (Mappers Seguros)

## Test Coverage Requirements

Esta strategy valida que CADA função refatorada preserva comportamento correto + adiciona error handling.

---

## Test Suite 1: mapDbCampaignToDomain()

**Função:** `mapDbCampaignToDomain(data: unknown): Campaign`

| Test Case | Input | Expected Output | Validates |
|-----------|-------|----------------|-----------|
| **T1.1 — Happy path com dado real** | `REAL_DB_ROW` (fixture Supabase) | `Campaign` object com todos os campos | Mapeamento correto de DB → domain |
| **T1.2 — Campo obrigatório ausente** | `{ ...REAL_DB_ROW, id: undefined }` | **THROW** com mensagem `[mapDbCampaignToDomain] Campo inválido: id` | Error handling útil (não genérico) |
| **T1.3 — Legacy content_type "info"** | `{ ...REAL_DB_ROW, content_type: "info", legacy_content_type: "info" }` | `content_type: "message"`, `legacy_content_type: "info"` | `normalizeCampaignContentType()` funciona com `.safeParse()` |
| **T1.4 — Campos opcionais null** | `{ ...REAL_DB_ROW, price_label: null, ai_caption: null }` | `price_label: null`, `ai_caption: null` | Fallbacks não quebram com null |

---

## Test Suite 2: mapDbCampaignToAIContext()

**Função:** `mapDbCampaignToAIContext(data: unknown, theme?: string | null): CampaignContext`

| Test Case | Input | Expected Output | Validates |
|-----------|-------|----------------|-----------|
| **T2.1 — Happy path** | `REAL_DB_ROW` | `CampaignContext` com `product_name: "Tênis Nike Air Max"` | Mapeamento correto DB → AI context |
| **T2.2 — product_name null (fallback)** | `{ ...REAL_DB_ROW, product_name: null }` | `product_name: "Produto"` | Fallback funciona |
| **T2.3 — Campo obrigatório ausente** | `{ ...REAL_DB_ROW, store_id: undefined }` | **THROW** com mensagem `[mapDbCampaignToAIContext] Campo inválido: store_id` | Error handling útil |

---

## Test Suite 3: mapAiArtToPreview()

**Função:** `mapAiArtToPreview(campaign: Campaign, aiResponse: unknown): Partial<any>`

| Test Case | Input | Expected Output | Validates |
|-----------|-------|----------------|-----------|
| **T3.1 — AI response válida** | `aiResponse: { headline: "Promo", caption: "Teste", ... }` | Object com `headline: "Promo"`, `caption: "Teste"` | Happy path sem erro |
| **T3.2 — AI response inválida (tipo errado)** | `aiResponse: { headline: 123 }` | **FALLBACK** com `headline: campaign.product_name`, `body_text: ""`, `console.error` chamado | Fallback sem throw (UI não quebra) |
| **T3.3 — AI response null/undefined** | `aiResponse: null` | **FALLBACK** com campos vazios | Fallback robusto |

---

## Test Suite 4: mapAiReelsToPreview()

**Função:** `mapAiReelsToPreview(aiResponse: unknown): Partial<any>`

| Test Case | Input | Expected Output | Validates |
|-----------|-------|----------------|-----------|
| **T4.1 — Reels response válida** | `{ hook: "Hook", script: "Script", duration_seconds: 45, ... }` | Object com `reels_hook: "Hook"`, `reels_duration_seconds: 45` | Happy path |
| **T4.2 — Reels response inválida** | `{ hook: null, script: 123 }` | **FALLBACK** com `reels_hook: ""`, `reels_script: ""`, `reels_duration_seconds: 30` | Fallback sem throw |

---

## Test Suite 5: mapAiCampaignToDomain()

**Função:** `mapAiCampaignToDomain(aiData: AIData, campaign: CampaignContext, store: StoreContext): CampaignAIOutput`

| Test Case | Input | Expected Output | Validates |
|-----------|-------|----------------|-----------|
| **T5.1 — aiData válido** | `aiData: { headline: "AI Headline", caption: "AI Caption", ... }` | `headline: "AI Headline"`, `caption: "AI Caption"` | Usa dados validados |
| **T5.2 — aiData com campos ausentes (objeto vazio)** | `aiData: {}` | `headline: campaign.product_name`, `caption: "✨ {product_name} em destaque!"` | Fallbacks ativados (comportamento atual preservado) |
| **T5.3 — aiData inválido (validação falha)** | `aiData: { headline: 123, text: false }` | Fallbacks ativados como T5.2 | `.safeParse()` falha gracefully |

---

## Test Suite 6: mapDomainToCampaignDb()

**Função:** `mapDomainToCampaignDb(campaign: Campaign): Record<string, unknown>`

| Test Case | Input | Expected Output | Validates |
|-----------|-------|----------------|-----------|
| **T6.1 — Campaign válida** | `mockCampaign` (content_type: "product") | Object com campos snake_case + `content_type: "product"`, `legacy_content_type: null` | Mapeamento domain → DB correto |
| **T6.2 — content_type "message"** | `mockCampaign` (content_type: "message") | `content_type: "info"`, `legacy_content_type: "info"` | `buildCampaignContentTypeWrite()` funciona |
| **T6.3 — Todos os campos presentes** | `mockCampaign` (full) | Object com 30+ campos (incluindo reels_*, ai_*, etc.) | Nenhum campo perdido |

---

## Validation Commands

```powershell
# Rodar testes
npx vitest run lib/domain/campaigns/mapper.test.ts

# Typecheck
npm run typecheck

# Cobertura (opcional, se houver tempo)
npx vitest run lib/domain/campaigns/mapper.test.ts --coverage
```

---

## Success Criteria

- ✅ 15+ tests passing (6 suites × 2-4 casos cada)
- ✅ Zero tests skipped (todos habilitados)
- ✅ Testes cobrem: happy path + error cases + fallbacks + legacy data ("info")
- ✅ Console.error aparece nos testes de fallback (T3.2, T4.2) — não silenciado
- ✅ THROW nos testes server-side (T1.2, T2.3)
- ✅ NO THROW nos testes UI (T3.2, T4.2)
- ✅ Typecheck passa com 0 erros após todos os testes

---

## Risk Mitigation (Testing Edition)

| Risk | Test Coverage |
|------|---------------|
| DbCampaignSchema rejeita legacy "info" | T1.3 — Dado com `content_type: "info"` |
| mapDbCampaignToDomain callers esperam throw | T1.2, T2.3 — Verificam que throw é mantido |
| mapDomainToCampaignDb gera estrutura errada | T6.1, T6.2, T6.3 — Verificam todos os campos + content_type write |
| UI quebra com AI response inválida | T3.2, T4.2 — Verificam fallback sem throw |

---

**END OF TESTING STRATEGY**
