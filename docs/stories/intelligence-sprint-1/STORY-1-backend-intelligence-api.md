# Story 1: Backend - Intelligence API

**Sprint:** Intelligence Calibration Sprint 1  
**Effort:** 3 pontos  
**Status:** Draft  
**Created:** 2026-04-30  
**Agents:** @dev, @qa

---

## 📋 Context

Criar endpoint PATCH para atualizar `store_intelligence.context` (JSONB) de forma incremental. Este endpoint suporta a Intelligence Calibration Page (4 abas) com auto-save.

**Migration existente:** `034_store_intelligence_context_v2_1.sql` (documenta estrutura JSONB v2.1)

---

## 🎯 Objective

Permitir que o frontend salve campos de intelligence de forma granular (por aba) sem sobrescrever todo o objeto JSONB.

---

## 📐 Specifications

### Endpoint

```
PATCH /api/store/intelligence
```

### Request Body

```typescript
{
  context: {
    // Partial update - apenas campos enviados serão atualizados
    brand_voice?: "formal" | "informal" | "technical" | "playful";
    target_audience?: string;
    seasonal_peaks?: string[];
    main_differentiation?: string;
    top_products?: string[];
    price_positioning?: "economic" | "medium" | "premium" | "luxury";
    average_ticket_brl?: number;
    competitors?: string[];
    unique_selling_proposition?: {
      primary_usp: string;
      supporting_points: string[];
      proof_elements?: string[];
    };
    customer_pain_points?: string[];
    conversion_triggers?: {
      urgency_preference: number; // 0-10
      scarcity_comfortable: number; // 0-10
      social_proof_available: boolean;
      guarantee_offered: boolean;
    };
    successful_past_ctas?: Array<{
      cta: string;
      context: string;
      approval_speed_seconds?: number;
    }>;
    local_events_calendar?: string[];
    language_specifics?: {
      uses_regional_slang: boolean;
      formality_level: "very_formal" | "formal" | "neutral" | "casual" | "very_casual";
      emoji_comfort: number; // 0-10
      max_exclamations_per_copy: number;
    };
    copy_length_preferences?: {
      headline_max_words: number;
      body_max_words: number;
      prefers_brevity: boolean;
    };
  }
}
```

### Response

```typescript
{
  success: true,
  data: {
    context: { /* JSONB completo atualizado */ },
    score: 53, // 0-100
    updated_at: "2026-04-30T12:34:56Z"
  }
}
```

### Behavior

1. **JSONB Merge (não replace):**
   - Mesclar `context` enviado com `context` existente
   - Preservar campos não enviados
   - Exemplo: Se envio apenas `{ brand_voice: "informal" }`, outros campos permanecem intactos

2. **Ownership Validation:**
   - RLS policy: `store_intelligence.store_id` deve pertencer ao usuário autenticado
   - Retornar 403 se store não pertence ao usuário

3. **Score Calculation (0-100):**
   - Base: 15 campos disponíveis
   - Score = (campos preenchidos / 15) * 100
   - Campos opcionais: contar apenas se `!== null && !== undefined`

4. **Timestamps:**
   - Atualizar `store_intelligence.updated_at` automaticamente

---

## ✅ Acceptance Criteria

- [ ] **AC1:** PATCH /api/store/intelligence aceita partial updates de `context`
- [ ] **AC2:** JSONB merge preserva campos não enviados (testar com store existente)
- [ ] **AC3:** RLS validation: retorna 403 se store_id não pertence ao usuário autenticado
- [ ] **AC4:** Score calculation retorna 0-100 baseado em 15 campos disponíveis
- [ ] **AC5:** Score = 0 quando `context` é `{}` (store nova)
- [ ] **AC6:** Score = 100 quando todos os 15 campos estão preenchidos
- [ ] **AC7:** Campos opcionais vazios não quebram cálculo (tratamento de null/undefined)
- [ ] **AC8:** `updated_at` é atualizado automaticamente no banco
- [ ] **AC9:** Testes unitários cobrem 100% das edge cases (JSONB malformado, campos faltando, ownership)
- [ ] **AC10:** CodeRabbit review passa com max 2 iterações de self-healing
- [ ] **AC11:** Response retorna JSONB completo (merged) + score + updated_at

---

## 🧪 Test Scenarios

### Unit Tests

```typescript
describe('PATCH /api/store/intelligence', () => {
  it('merges partial context without overwriting existing fields', async () => {
    // Setup: store com context = { brand_voice: "formal", target_audience: "público A" }
    // Action: PATCH { context: { top_products: ["Produto 1"] } }
    // Assert: context = { brand_voice: "formal", target_audience: "público A", top_products: ["Produto 1"] }
  });

  it('calculates score = 0 for empty context', async () => {
    // Assert: score = 0 quando context = {}
  });

  it('calculates score = 100 when all 15 fields are filled', async () => {
    // Assert: score = 100
  });

  it('returns 403 when store does not belong to authenticated user', async () => {
    // Setup: user A tenta atualizar store de user B
    // Assert: HTTP 403
  });

  it('handles malformed JSONB gracefully', async () => {
    // Action: PATCH com JSON inválido
    // Assert: HTTP 400 com mensagem clara
  });

  it('updates updated_at timestamp', async () => {
    // Assert: updated_at é diferente do valor anterior
  });
});
```

---

## 📚 References

- **Migration:** `database/migrations/034_store_intelligence_context_v2_1.sql`
- **UX Spec:** `docs/ux/intelligence-calibration-tabs.md`
- **Constitution:** `docs/PROJECT-CONSTITUTION.md` (Artigo I: Consultar CAPABILITIES-INVENTORY antes de implementar)

---

## 🔗 Dependencies

- **Blocks:** Story 2 (Frontend Intelligence Page depende deste endpoint)
- **Blocked By:** None

---

## 📝 Implementation Notes

### JSONB Merge Strategy (PostgreSQL)

```sql
UPDATE store_intelligence
SET context = context || $1::jsonb  -- || operator merges JSONB
WHERE store_id = $2
RETURNING context, updated_at;
```

### Score Calculation Logic

```typescript
const fields = [
  'brand_voice', 'target_audience', 'seasonal_peaks', 'main_differentiation',
  'top_products', 'price_positioning', 'average_ticket_brl', 'competitors',
  'unique_selling_proposition', 'customer_pain_points', 'conversion_triggers',
  'successful_past_ctas', 'local_events_calendar', 'language_specifics',
  'copy_length_preferences'
];

const filledFields = fields.filter(f => 
  context[f] !== null && 
  context[f] !== undefined && 
  (Array.isArray(context[f]) ? context[f].length > 0 : true)
);

const score = Math.round((filledFields.length / fields.length) * 100);
```

---

## ✋ Out of Scope

- Validação de schema JSONB (será feita no frontend)
- Gamificação de badges (será tratado no frontend)
- Sugestões de IA baseadas em score (futuro — Phase 2.2)

---

## 🎯 Definition of Done

- [ ] Código implementado e testado localmente
- [ ] Testes unitários com 100% cobertura
- [ ] CodeRabbit review passou (self-healing completo)
- [ ] RLS validation funcional
- [ ] JSONB merge testado com stores existentes
- [ ] Score calculation validado (0, 50, 100)
- [ ] Documentação da API atualizada (se aplicável)
- [ ] Frontend Story 2 desbloqueada para implementação

---

**Status:** 🟡 Draft - Aguardando validação do @po  
**Next Steps:** @po *validate → @dev *develop → @qa *qa-gate
