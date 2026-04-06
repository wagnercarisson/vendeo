# Plano de Implementação — Fase 1: Fundação do Brand Identity Engine

> **Pergunta que esta fase responde:**
> "O sistema consegue resolver um BrandDNA completo, determinístico e coerente para qualquer loja?"

> **Fora do escopo desta fase:**
> `seed-engine.ts`, `brand-render-engine.ts`, `renderer.ts`, validação visual, plano semanal, Pro.

---

## Visão Geral

```
Fase 1 (esta): DADOS
  brand-dna.ts         → contrato expandido
  brand-token-catalog  → tabela de arquétipos
  auto-dna.ts          → motor de inferência (funções puras)
  mapper.ts            → remove fallback genérico, delega ao engine

Fase 2 (próxima): RENDERIZAÇÃO
  brand-render-engine  → materializa tokens no canvas
  renderer.ts          → consome tokens expandidos
  validação visual     → 5 critérios de sucesso
```

---

## Arquivos Afetados

| Arquivo | Ação | Tipo |
|---|---|---|
| `lib/domain/stores/brand-dna.ts` | Expandir | Contrato TypeScript |
| `lib/domain/stores/brand-token-catalog.ts` | Criar (novo) | Dados puros / catálogo |
| `lib/domain/stores/auto-dna.ts` | Criar (novo) | Funções puras |
| `lib/domain/stores/mapper.ts` | Refatorar | Delegação ao engine |

---

## Passo 1 — Expandir `brand-dna.ts`

### O que muda

- Adicionar 4 novos tipos exportados
- Expandir a interface `BrandDNA` com 3 novos blocos
- Remover `?` dos campos que passam a ser obrigatórios no DNA resolvido

### Novos tipos a adicionar

```typescript
export type BrandTemperature = "warm" | "cool" | "neutral";

export type BrandImageFilter =
  | "natural" | "warm" | "cool" | "high_contrast";

export type BrandBackgroundStyle =
  | "solid_clean" | "gradient_brand_soft"
  | "geometric_bold" | "editorial_light" | "editorial_shadow";

export type BrandBackgroundIntensity = "subtle" | "balanced" | "expressive";
```

### Campos a tornar obrigatórios (remover `?`)

```typescript
// Antes:
tone_of_voice?: BrandToneOfVoice;
positioning?: string;
palette.neutral?: string;

// Depois:
tone_of_voice: BrandToneOfVoice;
positioning: string;
palette.neutral: string;    // sai de optional para required
```

### Novos blocos na interface

```typescript
brand_temperature: BrandTemperature;

image_treatment: {
  filter: BrandImageFilter;
  warmth: number;     // range beta: -0.3 a +0.3
  contrast: number;   // range beta: -0.2 a +0.2
  saturation: number; // range beta: -0.3 a 0
};

background_treatment: {
  style: BrandBackgroundStyle;
  intensity: BrandBackgroundIntensity;
};
```

### Impacto de compatibilidade

> A mudança no contrato vai gerar erros de TypeScript em todo lugar que constrói um `BrandDNA` manualmente — o `mapper.ts` (Passo 4) corrige isso. O `renderer.ts` e o `seed-engine.ts` apenas *lêem* o DNA, então não quebram agora.

### Verificação do Passo 1
- `tsc --noEmit` deve compilar sem erros **após o Passo 4**
- Antes do Passo 4: erros esperados apenas em `mapper.ts`

---

## Passo 2 — Criar `brand-token-catalog.ts`

### Localização
`lib/domain/stores/brand-token-catalog.ts`

> Criado antes do `auto-dna.ts` porque o engine importa deste catálogo.

### O que contém

**1. Tipo `BrandArchetype`**

```typescript
export type BrandArchetype =
  | "luxury" | "editorial" | "sensorial"
  | "friendly" | "clean" | "impact"
  | "precision" | "trust" | "modern";
```

**2. Mapeamento `SEGMENT_TO_ARCHETYPE`**

```typescript
export const SEGMENT_TO_ARCHETYPE: Record<string, BrandArchetype> = {
  "adega": "luxury",
  "bebidas": "luxury",
  "vinho": "luxury",
  "restaurante": "sensorial",
  "alimentação": "sensorial",
  "food": "sensorial",
  "boutique": "editorial",
  "moda": "editorial",
  "vestuário": "editorial",
  "pet": "friendly",
  "pet shop": "friendly",
  "animal": "friendly",
  "farmácia": "clean",
  "drogaria": "clean",
  "saúde": "clean",
  "mercado": "impact",
  "supermercado": "impact",
  "varejo": "impact",
  "tech": "precision",
  "eletrônicos": "precision",
  "tecnologia": "precision",
  // serviços gerais → "trust"
};
```

**3. `ARCHETYPE_CATALOG`** — tabela completa de tokens por arquétipo

```typescript
export interface ArchetypeTokens {
  visual_style: BrandVisualStyle;
  visual_aggression: number;
  headline_font: BrandHeadlineFont;
  body_font: BrandBodyFont;
  tone_of_voice: BrandToneOfVoice;
  temperature_base: BrandTemperature;
  background_style: BrandBackgroundStyle;
  background_intensity: BrandBackgroundIntensity;
  image_filter: BrandImageFilter;
  default_primary: string;
  positioning_template: string;
}

export const ARCHETYPE_CATALOG: Record<BrandArchetype, ArchetypeTokens> = {
  luxury: {
    visual_style: "luxury", visual_aggression: 0.40,
    headline_font: "serif_elegant", body_font: "sans_clean",
    tone_of_voice: "premium", temperature_base: "warm",
    background_style: "editorial_shadow", background_intensity: "balanced",
    image_filter: "warm",
    default_primary: "#7B2D2D",
    positioning_template: "Sofisticação e qualidade no segmento de {segment}"
  },
  // ... demais arquétipos
};
```

### Verificação do Passo 2
- Objeto exportável, sem side-effects
- Verificar que todos os 9 arquétipos estão mapeados no catálogo
- Verificar que SEGMENT_TO_ARCHETYPE cobre variações de grafia (plural/singular, com/sem acento)

---

## Passo 3 — Criar `auto-dna.ts`

### Localização
`lib/domain/stores/auto-dna.ts`

### Princípio: funções puras

Todas as funções recebem inputs explícitos e retornam outputs tipados. Nenhuma acessa banco, contexto ou estado externo.

### As 8 funções

**`normalizeSegment(segment: string | null): string`** *(utilitário interno)*

Normalização robusta em 4 camadas antes de qualquer lookup:

```typescript
// 1. lowercase + trim + remove acentos (NFD + strip)
// 2. remover stopwords: ["loja de", "comércio de", "mercado de", "casa de", "produtos"]
// 3. remover plural: ["bebidas"→"bebida", "animais"→"animal", "vinhos"→"vinho"]
// 4. busca por substring: "adega premium vinhos" → split → verifica cada token
//    primeiro match vence
```

> **Por que isso é crítico:** sem normalização robusta, "adega premium vinhos" cai no fallback `modern` e recebe uma arte errada. A busca por substring resolve a maioria dos casos compostos sem precisar listar todas as variações.

---

**`inferBrandArchetype(segment: string | null): BrandArchetype`**
- Chama `normalizeSegment(segment)` internamente
- Busca match exato em SEGMENT_TO_ARCHETYPE
- Se não encontrar: busca por substring em cada token do segment normalizado
- Fallback final: `"modern"`

---

**`inferColorTemperature(hex: string | null, archetype: BrandArchetype): BrandTemperature`**
- Converte hex → HSL
- Aplica regra: `temperatura = hue_zone + modulação_do_arquétipo`
- Tabela de modulação: `luxury` sempre puxa para `warm`, `clean` puxa para `cool`, etc.

```
hue 0–30   → warm base
hue 31–70  → warm base
hue 71–160 → neutral base
hue 161–240→ cool base
hue 241–290→ cool base
hue 291–360→ warm base
```

---

**`buildExpandedPalette(primary: string | null, temperature: BrandTemperature, archetype: BrandArchetype, seed: string): Palette`**

> ⚠️ O parâmetro `seed` é obrigatório — é ele que garante anti-colisão entre lojas.

- Se primary ausente: usa `ARCHETYPE_CATALOG[archetype].default_primary` + aplica micro-variação de hue (±5° a ±15°) derivada do `seed` via hash
- Se primary presente: usa diretamente (sem variação — foi o lojista quem escolheu)
- Gera `secondary` por regra HSL do arquétipo
- Gera `accent` como complementar via `ensureContrast` (triádico ou direto, por arquétipo)
- Gera `neutral` por temperatura
- Valida contraste de `secondary` (mínimo 3:1 vs fundo padrão do arquétipo)

---

**`ensureContrast(color: string, background: string, minRatio: number): string`** *(utilitário compartilhado)*

```typescript
// Retorna `color` se o contraste vs `background` >= minRatio
// Se não: testa #FFFFFF e #000000, retorna o que tiver maior contraste
// Nunca retorna uma cor que viole o minRatio
ensureContrast(accent, "#FFFFFF", 4.5) // para CTA sobre fundo branco
ensureContrast(accent, "#000000", 4.5) // para CTA sobre fundo escuro
```

> Este utilitário será reutilizado na Fase 2 pelo renderer para garantir contraste de texto, CTA e overlay em runtime. Criar aqui evita duplicação.

---

**`inferImageTreatment(archetype: BrandArchetype, temperature: BrandTemperature): BrandImageTreatment`**
- Lê `image_filter` do ARCHETYPE_CATALOG
- Aplica valores de warmth/contrast/saturation por temperatura dentro dos ranges do beta
- Não ultrapassa limites: warmth ±0.3, contrast ±0.2, saturation -0.3 a 0

---

**`inferBackgroundTreatment(archetype: BrandArchetype, aggression: number): BrandBackgroundTreatment`**
- Lê `background_style` e `background_intensity` do ARCHETYPE_CATALOG
- Modula `intensity` pelo `aggression`: se aggression > 0.7 e intensity era "subtle", promove para "balanced"

---

**`inferToneOfVoice(raw: string | null, archetype: BrandArchetype): BrandToneOfVoice`**
- Mantém lógica existente do mapper para raw (premium/luxo, agressivo, informativo)
- Fallback: usa `tone_of_voice` do arquétipo no catálogo

---

**`inferPositioning(segment: string | null, archetype: BrandArchetype): string`**
- Usa `positioning_template` do arquétipo, substituindo `{segment}` pelo valor real
- Fallback: "Comércio local com atendimento personalizado"

---

**`buildAutoDNA(raw: RawStoreData): BrandDNA`**

Ordem explícita de execução — importa por causa de dependências entre funções:

```typescript
function buildAutoDNA(raw: RawStoreData): BrandDNA {
  // 1. Arquétipo primeiro — tudo deriva dele
  const archetype = inferBrandArchetype(raw.main_segment);

  // 2. Seed — necessária antes da paleta (anti-colisão)
  const visual_seed = hashString(raw.id);

  // 3. Primary — se ausente, usa default do arquétipo + variação por seed
  //    Temperatura depende da primary, então precisa vir antes
  const primary = raw.primary_color ?? applyArchetypeDefault(archetype, visual_seed);

  // 4. Temperatura — depende do primary E do arquétipo
  const brand_temperature = inferColorTemperature(primary, archetype);

  // 5. Paleta completa — depende de primary + temperatura + arquétipo + seed
  const palette = buildExpandedPalette(primary, brand_temperature, archetype, visual_seed);

  // 6. Tratamento de imagem — depende do arquétipo e temperatura
  const image_treatment = inferImageTreatment(archetype, brand_temperature);

  // 7. Tratamento de fundo — depende do arquétipo e da agressividade
  const aggression = ARCHETYPE_CATALOG[archetype].visual_aggression;
  const background_treatment = inferBackgroundTreatment(archetype, aggression);

  // 8. Identidade verbal — depende do arquétipo
  const tone_of_voice = inferToneOfVoice(raw.tone_of_voice, archetype);
  const positioning    = raw.brand_positioning ?? inferPositioning(raw.main_segment, archetype);

  // 9. Montar objeto final — sempre completo, nunca undefined
  return { version: 2, visual_seed, visual_style, brand_temperature, palette, ... };
}
```

> Se essa ordem for invertida (ex: temperatura antes da primary finalizada), a paleta pode sair inconsistente.

### Verificação do Passo 3

Casos de teste para validar determinismo e coerência:

| Input | Esperado |
|---|---|
| segment: "adega", primary: "#8B0000" | archetype: luxury, temperature: warm, filter: warm |
| segment: "adega premium vinhos", primary: null | archetype: luxury (via substring), default_primary com variação de seed |
| segment: "farmácia", primary: "#1565C0" | archetype: clean, temperature: cool, filter: cool |
| segment: null, primary: null | archetype: modern, DNA válido com todos os defaults |
| segment: "adega", primary: null | default_primary bordeaux com micro-variação, não "#111827" |
| mesma loja, chamada 2x | DNA byte-a-byte idêntico (determinismo) |
| 2 lojas "adega" sem primary, IDs diferentes | DNAs distintos (anti-colisão via seed) |
| ensureContrast("#FFD700", "#FFFFFF", 4.5) | retorna "#000000" (ouro não tem contraste suficiente com branco) |

---

## Passo 4 — Refatorar `mapper.ts`

### O que muda

**Antes:**
```typescript
export function resolveBrandDNA(raw: any, storeId: string): BrandDNA {
  if (raw.brand_dna && typeof raw.brand_dna === "object") {
    return raw.brand_dna as BrandDNA;
  }
  // fallback genérico...
  return {
    version: 1,
    visual_style: "modern",        // igual para todos
    visual_aggression: 0.5,        // igual para todos
    // ...
  };
}
```

**Depois:**
```typescript
import { buildAutoDNA } from "./auto-dna";

export function resolveBrandDNA(raw: any, storeId: string): BrandDNA {
  // DNA persistido no banco tem prioridade absoluta
  if (raw.brand_dna && typeof raw.brand_dna === "object") {
    return hydrateLegacyDNA(raw.brand_dna as Partial<BrandDNA>, raw, storeId);
  }

  // Sem DNA persistido: gera automaticamente (Free)
  return buildAutoDNA({ ...raw, id: storeId });
}

/**
 * Hidratação de DNA legado:
 * Lojas do beta fechado têm DNA no banco mas sem os campos novos.
 * Esta função completa os campos ausentes usando o Auto DNA Engine
 * sem sobrescrever o que já estava definido.
 */
function hydrateLegacyDNA(existing: Partial<BrandDNA>, raw: any, storeId: string): BrandDNA {
  const auto = buildAutoDNA({ ...raw, id: storeId });
  return {
    ...auto,
    ...existing,
    // Merge explícito campo-a-campo: evita "buracos silenciosos"
    // se palette vier incompleta do banco (ex: sem neutral ou sem accent)
    palette: {
      primary:   existing.palette?.primary   ?? auto.palette.primary,
      secondary: existing.palette?.secondary ?? auto.palette.secondary,
      accent:    existing.palette?.accent    ?? auto.palette.accent,
      neutral:   existing.palette?.neutral   ?? auto.palette.neutral,
    },
  };
}
```

### Por que `hydrateLegacyDNA` é necessário

O beta fechado gerou DNAs no banco com o schema antigo (sem `image_treatment`, `background_treatment`, `brand_temperature`). Sem hidratação, essas lojas receberiam um DNA incompleto que o TypeScript aceita mas o renderer não consegue consumir corretamente na Fase 2.

### Verificação do Passo 4

- `tsc --noEmit` sem erros
- Loja sem DNA no banco → `buildAutoDNA` chamado
- Loja com DNA legado (parcial) → `hydrateLegacyDNA` preenche os novos campos
- Loja com DNA v2 completo → passado diretamente, sem chamada ao engine

---

## Critério de Conclusão da Fase 1

A Fase 1 está concluída quando:

1. `tsc --noEmit` passa sem erros em todo o projeto
2. `buildAutoDNA({ id: "xxx", main_segment: "adega", primary_color: "#8B0000" })` retorna um `BrandDNA` com todos os campos preenchidos, sem `undefined`
3. Chamar `buildAutoDNA` com os mesmos inputs duas vezes retorna objetos idênticos (determinismo)
4. Chamar com `main_segment: null` e `primary_color: null` retorna um DNA válido com defaults do arquétipo `modern`
5. Duas lojas com mesmo segmento mas sem primary recebem DNA diferente (anti-colisão via seed)

**Nenhuma validação visual é necessária nesta fase.** O renderer ainda não consome os novos tokens — isso é Fase 2.
