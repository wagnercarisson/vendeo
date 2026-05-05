# Sessão 05 Mai 2026 23:45 — Segment Normalization Discussion (PAUSADA)

**Status:** 🟡 PAUSADA — Usuário solicitou retomada após retorno  
**Contexto:** B8 implementado com sucesso, mas testes manuais revelaram blocker crítico  
**Próxima Ação:** Decidir estratégia de normalização UI → DB → Registry

---

## 🎯 PROBLEMA IDENTIFICADO

### Mapeamento Quebrado: UI → DB → Registry

**Situação Atual:**

```
UI (store/page.tsx)
  ↓
  "Loja de bebidas" (SEGMENT_OPTIONS)
  ↓
DB (stores.main_segment)
  ↓
  "Loja de bebidas" (texto livre)
  ↓
Registry Loader (loader.ts)
  ↓
  Busca diretório: "loja-de-bebidas/" ou "loja_de_bebidas/"
  ↓
  ❌ NÃO EXISTE → Error: "Segment expert not found"
  ↓
  Fallback para prompt legado (legacy-fallback)
```

**Registry Real Disponível:**
- ✅ `bebidas-alcoolicas/segment-expert.yaml` (segment_id: "bebidas_alcoolicas", nome: "Adegas e Distribuidoras")
- ✅ `mercearia/segment-expert.yaml`

**Workaround Atual (Temporário):**
- Usuário precisa escolher **exatamente** "Adegas e Distribuidoras" no dropdown
- Isso funciona porque o loader normaliza espaços para hífens/underscores

---

## 🔍 NUANCES CONCEITUAIS IDENTIFICADAS

Usuário destacou que **Adega ≠ Distribuidora ≠ Loja de bebidas**:

| Sub-Segmento | Público | Foco | Diferencial |
|-------------|---------|------|-------------|
| **Adega** | Premium, apreciadores | Curadoria, vinhos, harmonização | Atendimento personalizado, expertise |
| **Distribuidora** | B2B, bares, restaurantes | Volume, atacado, variedade | Preço competitivo, logística |
| **Loja de bebidas** | Varejo local, conveniência | Dia-a-dia, gelado, proximidade | Rapidez, sempre tem estoque |

**Porém:** Todos compartilham ~70% do DNA (sazonalidade, gatilhos de urgência, linguagem do setor)

---

## 💡 3 ESTRATÉGIAS PROPOSTAS (DISCUSSÃO PAUSADA)

### **Estratégia 1: Dicionário de Normalização (MVP — 15min)**

**Implementação:**
```typescript
// Em lib/ai/prompts/registries/loader.ts ou context-builder.ts
const SEGMENT_NORMALIZATION_MAP: Record<string, string> = {
  // Bebidas alcoólicas (variações)
  'Loja de bebidas': 'bebidas_alcoolicas',
  'Adega': 'bebidas_alcoolicas',
  'Distribuidora': 'bebidas_alcoolicas',
  'Adegas e Distribuidoras': 'bebidas_alcoolicas',
  
  // Mercado/Mercearia
  'Mercado / Mercearia': 'mercearia',
  'Mercado': 'mercearia',
  'Mercearia': 'mercearia',
  
  // ... outros segmentos
}

function normalizeSegment(rawSegment: string): string {
  return SEGMENT_NORMALIZATION_MAP[rawSegment] ?? rawSegment.toLowerCase().replace(/[^a-z0-9]/g, '_')
}
```

**Prós:**
- ✅ Implementação imediata (15 min)
- ✅ Não quebra dados existentes
- ✅ Flexível para adicionar variações

**Contras:**
- ⚠️ Perde nuances entre Adega vs Distribuidora vs Loja de bebidas
- ⚠️ Manutenção manual

---

### **Estratégia 2: Registry Hierárquico com Herança (1 semana)**

**Estrutura:**
```
lib/ai/prompts/registries/
├── bebidas-alcoolicas/
│   ├── segment-expert.yaml (parent genérico)
│   ├── regional/
│   └── variants/
│       ├── adega.yaml (80% herda parent + 20% override)
│       ├── distribuidora.yaml (70% herda parent + 30% override B2B)
│       └── loja-bebidas.yaml (85% herda parent + 15% override conveniência)
```

**Exemplo `variants/adega.yaml`:**
```yaml
variant_of: bebidas_alcoolicas
segment_name: "Adega Especializada"

# Herda tudo do parent, mas sobrescreve:
expertise:
  - "Curadoria de vinhos e rótulos exclusivos"
  - "Atendimento consultivo e personalizado"
```

**Prós:**
- ✅ Respeita nuances reais entre sub-segmentos
- ✅ DRY: não duplica 80% do conteúdo
- ✅ Escalável

**Contras:**
- ⚠️ Mais complexo (~1 semana)
- ⚠️ Requer refactor do loader

---

### **Estratégia 3: Normalização na Camada de Dados (2-3 dias)**

**Implementação:**
```sql
-- Migration 041: Normalizar main_segment
CREATE TYPE segment_type AS ENUM (
  'bebidas_alcoolicas',
  'mercearia',
  'farmacias',
  -- ...
);

ALTER TABLE stores 
ALTER COLUMN main_segment TYPE segment_type 
USING (
  CASE
    WHEN main_segment IN ('Loja de bebidas', 'Adega', 'Distribuidora') 
      THEN 'bebidas_alcoolicas'::segment_type
    -- ...
  END
);
```

**Prós:**
- ✅ Único ponto de verdade (DB)
- ✅ Type safety no TypeScript
- ✅ Performance

**Contras:**
- ⚠️ Requer migração de dados
- ⚠️ Quebra temporária

---

## 📝 RECOMENDAÇÃO DO @AIOX-MASTER

**Abordagem Híbrida Progressiva:**

### **Fase 1: AGORA (desbloquear testes)**
✅ **Estratégia 1** (Dicionário de normalização)
- Tempo: 15 min
- Desbloqueia testes B8 imediatos
- Permite avançar para B10

### **Fase 2: Phase 2.4 (próximo sprint)**
✅ **Estratégia 2** (Registry hierárquico com variants)
- Tempo: 1 semana
- Adiciona nuances para Adega vs Distribuidora vs Loja
- Melhora qualidade das campanhas

### **Fase 3: Phase 3.0 (refactor)**
✅ **Estratégia 3** (Normalização no DB)
- Tempo: 2-3 dias
- Padroniza definitivamente
- Elimina mapeamentos manuais

---

## 🚦 STATUS DE DECISÃO

**Decisor:** Usuário  
**Status:** 🟡 PAUSADA — Aguarda retorno  
**Ação Requerida:** Escolher estratégia (1, 2, 3, ou híbrida)  
**Blocker:** Testes E2E do B8 dependem dessa decisão  
**Urgência:** MÉDIA — Workaround disponível (usar label exato no dropdown)

---

## 📋 CONTEXTO ADICIONAL

### B8 Implementation Summary
- ✅ 21/21 unit tests passing
- ✅ Fallback automático validado
- ✅ Logging implementado
- ⚠️ Testes E2E bloqueados por segment normalization

### Arquivos Relevantes
- `lib/ai/prompts/registries/loader.ts` — Resolver aqui (Estratégia 1)
- `app/dashboard/store/page.tsx` — SEGMENT_OPTIONS (linha 134)
- `lib/domain/campaigns/context-builder.ts` — Usa store.main_segment
- `database/schema.sql` — stores.main_segment (text)

### Registries Existentes
1. `bebidas-alcoolicas/segment-expert.yaml` — "Adegas e Distribuidoras"
2. `mercearia/segment-expert.yaml` — "Mercados e Mercearias"

### Registries Planejados (Phase 2.4)
- `farmacias/` — "Farmácias e Drogarias"
- `moda/` — "Moda e Boutiques"
- `pet-shop/` — "Pet Shops"
- `restaurante/` — "Restaurantes e Lanchonetes"

---

## 🎯 PRÓXIMOS PASSOS (QUANDO RETOMAR)

1. ✅ Usuário decide estratégia
2. ✅ @aiox-master implementa (15min se Estratégia 1)
3. ✅ Testes E2E completos do B8 (score < 30, score >= 30)
4. ✅ Atualizar tracker marcando B8 como VALIDATED
5. ✅ Avançar para B10 (Logging completo) ou Phase 2.3C (Validation)

---

**Última Atualização:** 05 Mai 2026 23:45 por @aiox-master  
**Próxima Sessão:** TBD — Usuário retorna para discussão
