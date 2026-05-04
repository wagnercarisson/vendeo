# ADR-2026-05-04-001 — Context Layering (L1/L2/L3) para Prompts

**Status:** PROPOSED  
**Data:** 2026-05-04  
**Decisor:** @architect (Aria)  
**Stakeholders:** @aiox-master, Lojista, @prompt-eng, @dev, @qa  

---

## 1) Contexto

**Problema:** A geração de campanhas depende de contexto comercial. Hoje, se `store_intelligence.context` estiver vazio (score=0), o prompt pode ficar genérico e perder relevancia comercial. O lojista reforcou que a IA deve entender o negocio mesmo sem calibration completa, usando dados basicos da loja (nome, localizacao, segmento) e um profissional agêntico especializado por segmento e regiao.

**Objetivo:** Garantir que toda campanha gerada tenha contexto minimo consistente, com degradacao graceful quando a intelligence ainda nao foi preenchida.

**Constraints:**
- Nao quebrar o fluxo base de geracao.
- Latencia nao deve aumentar > 10%.
- A solucao deve ser extensivel (novos segmentos/regioes).
- Deve ser testavel por camada.

---

## 2) Decisao

Adotar **Context Layering** com tres camadas hierarquicas e fallback deterministico:

- **L1: Store Metadata (sempre disponivel)**
- **L2: Intelligence Calibrada (0-100% preenchido)**
- **L3: Profissional Agentico (sempre disponivel via registry + prompt)**

### Regras de fallback

- **Score < 30%:** usar L1 + L3; ignorar L2.
- **Score 30-70%:** usar L1 + L2 parcial + L3 (campos ausentes inferidos via L3).
- **Score > 70%:** usar L1 + L2 completo + L3.

### Prioridade de token (se prompt exceder budget)

1. **L1** (nunca truncar)
2. **L3** (truncar exemplos, manter persona + contexto regional)
3. **L2** (manter top 10 campos, truncar excedentes)

---

## 3) Camadas e Responsabilidades

### L1 — Store Metadata

**Fonte:** `stores` table (DB) + campos estaveis ja persistidos.  
**Uso:** Identidade e contexto basico da loja.

**Campos base recomendados (existentes):**
- `stores.name`
- `stores.city`, `stores.state`
- `stores.neighborhood`, `stores.address`
- `stores.main_segment`
- `stores.brand_positioning`
- `stores.tone_of_voice`
- `stores.phone`, `stores.whatsapp` (opcional para CTA)

**Observacao:** L1 deve estar sempre presente no prompt mesmo quando L2/L3 falharem.

---

### L2 — Intelligence Calibrada

**Fonte:** `store_intelligence.context` (JSONB) + `calculate_intelligence_score`.  
**Uso:** Preferencias declaradas pelo lojista e contexto comercial detalhado.

**Campos priorizados (top 10 impacto):**
1. `brand_voice`
2. `target_audience`
3. `unique_selling_proposition`
4. `seasonal_peaks`
5. `successful_past_ctas`
6. `conversion_triggers`
7. `price_positioning`
8. `competitors`
9. `customer_pain_points`
10. `local_events_calendar`

**Fallback:** Se qualquer campo estiver ausente, o prompt deve instruir inferencia usando L3.

---

### L3 — Profissional Agentico

**Fonte:** Registry de especialistas + prompts.  
**Uso:** Especializacao por segmento e regiao com linguagem local e contexto cultural.

**Componentes:**
- **Segment Experts Registry** (por segmento: bebidas, mercearia, moda, farmacia, beauty, home/decor)
- **Regional Experts Registry** (por regiao POR segmento: SP-bebidas ≠ SP-moda)

**Formato:** YAML verticalizado em `lib/ai/prompts/registries/{segment}/` carregado sob demanda (lazy loading).

**Estrutura proposta (registry vertical):**
```
lib/ai/prompts/registries/
├── bebidas-alcoolicas/
│   ├── segment-expert.yaml
│   ├── regional/
│   │   ├── SP-capital.yaml
│   │   ├── RJ-capital.yaml
│   │   └── MG-capital.yaml
│   └── few-shots.yaml
├── mercearia/
│   ├── segment-expert.yaml
│   ├── regional/
│   │   ├── SP-capital.yaml
│   │   ├── RJ-capital.yaml
│   │   └── MG-capital.yaml
│   └── few-shots.yaml
└── [outros segmentos...]
```

**Rationale da verticalização:**
- **Token economy:** Carrega apenas 1 segmento (~1K tokens) vs. todos (~5.5K tokens) — redução de 82%
- **Especialização regional:** SP-bebidas é diferente de SP-moda (concorrentes, sazonalidade, linguagem)
- **Lazy loading:** Runtime carrega apenas `{segment}/regional/{region}.yaml`
- **Escalabilidade:** Novo segmento = nova pasta, sem refatorar existentes
- **Manutenção:** Atualizar 1 segmento não impacta outros

---

## 4) Interface Proposta

```typescript
interface StoreMetadata {
  name: string;
  mainSegment: string;
  city: string;
  state: string;
  neighborhood?: string;
  address?: string;
  brandPositioning?: string;
  toneOfVoice?: string;
  phone?: string;
  whatsapp?: string;
}

interface IntelligenceContext {
  score: number;
  context: Record<string, unknown>;
}

interface AgenticPersona {
  persona: string;
  regionalContext: string;
  segmentContext: string;
}

interface RegistryLoader {
  // Lazy loading: carrega APENAS segmento + região ativos
  loadSegmentExpert(segment: string): Promise<SegmentExpert>;
  loadRegionalExpert(segment: string, region: string): Promise<RegionalExpert>;
  loadFewShots(segment: string, count: number): Promise<FewShot[]>;
}

interface CampaignContextBuilder {
  buildL1(storeId: string): Promise<StoreMetadata>;
  buildL2(storeId: string): Promise<IntelligenceContext>;
  buildL3(segment: string, locationKey: string): Promise<AgenticPersona>;
  assemblePrompt(input: {
    storeId: string;
    campaignType: string;
  }): Promise<string>;
  getTokenCount(): number; // Para monitorar budget
}
```

---

## 5) Alternativas Consideradas

1. **Apenas L2 (intelligence)**
   - Rejeitada: falha com score=0 e gera campanhas genericas.

2. **L1 + L2 sem L3**
   - Rejeitada: perde especializacao regional e linguagem de segmento.

3. **Agente externo dedicado (service separado)**
   - Rejeitada no v1: aumenta latencia, complexidade e custo operacional.

---

## 6) Consequencias

**Positivas:**
- Campanhas sempre contextualizadas (mesmo sem intelligence).
- Fallback deterministico com qualidade minima garantida.
- Evolucao incremental (novos segmentos/regioes sem refatorar core).

**Negativas:**
- Aumento de complexidade de prompt + necessidade de registry.
- Necessidade de token budget management e truncation.

---

## 7) Observabilidade e Testes

**Logs recomendados:**
- Qual camada foi usada (L1 apenas, L1+L3, L1+L2+L3)
- Score do L2
- Token count final

**Testes:**
- Unit: buildL1/buildL2/buildL3 separadamente
- Integration: assemblePrompt com score 0 / 50 / 80
- Regression: geracao sem L2 nao deve quebrar

---

## 8) Riscos e Mitigacoes

- **Prompt longo (> 8K):** token optimizer com prioridade L1 > L3 > L2.
- **Registry desatualizado:** versionamento e processo de onboarding.
- **Erro de contexto regional:** validacao manual com lojistas em beta.

---

## 9) Decisões Resolvidas

### Registry Vertical (DEC-005)
**Aprovado:** 04 Mai 2026  
**Decisor:** @aiox-master + Lojista  
**Decisão:** Estrutura vertical (1 pasta por segmento) com lazy loading  
**Impacto:** -82% tokens L3, especialização regional por segmento  

### MVP Scope (DEC-002)
**Aprovado:** 04 Mai 2026  
**Decisor:** Lojista + @analyst  
**Decisão:** 2 segmentos (bebidas_alcoolicas + mercearia) × 3 regiões (SP/RJ/MG)  
**Rationale:** Melhores retornos para Vendeo segundo @analyst, valida estrutura com 2 casos diferentes  
**Total:** 6 arquivos regionais (escopo controlado)  

## 10) Open Questions

- Qual engine de template usar (Handlebars vs. template literals)?
- Precisamos de feature flag para L3 no v1?

---

## 10) Referencias

- `docs/phase-2.3-backend-integration-tracker.md`
- `docs/architecture/design-decisions.md`
- `docs/architecture/schema-audit.md`
- `docs/architecture/intelligence-fields-review.md`
