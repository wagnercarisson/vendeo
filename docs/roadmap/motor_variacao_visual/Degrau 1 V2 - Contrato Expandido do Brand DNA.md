# Degrau 1 V2 — Contrato Expandido do Brand DNA

> **Supersede:** Degrau 1 (contrato inicial — base tipada e estrutura versionada)
> **Versão:** 2.2 — Refinamentos finais pré-implementação (Abr/2026)

---

## Por que este Degrau existe

O Degrau 1 original cumpriu seu papel: criou a estrutura, a tipagem e o versionamento do `BrandDNA`. Ele foi explícito em deixar de fora `background`, `shadow_intensity` e outros tokens derivados — e isso foi a decisão certa para aquele momento.

Este Degrau 1 V2 existe porque a estratégia de produto evoluiu.

O BrandDNA precisa parar de ser apenas uma **descrição de marca** e se tornar uma **instrução operacional de renderização**.

> O usuário não percebe `visual_aggression: 0.5`.
> Ele percebe: "essa arte parece mais quente ou fria", "parece sofisticada ou popular", "parece minha ou de qualquer loja".

Essa é a mudança conceitual central deste degrau.

---

## O problema do contrato atual

Toda loja hoje recebe o mesmo fallback no `mapper.ts`:

```typescript
visual_style: "modern"         // igual para todos
visual_aggression: 0.5         // igual para todos
headline_font: "sans_display"  // igual para todos
accent: primary                // acento = cor primária = sem contraste
positioning: null              // ausente
tone_of_voice: "friendly"      // padrão para todos
```

O renderer não é o problema. O contrato de entrada é genérico demais, e o renderer responde com resultados igualmente genéricos.

---

## Objetivo deste Degrau

1. Expandir o `BrandDNA` com três novas dimensões operacionais
2. Eliminar campos opcionais no DNA **resolvido** — o objeto final deve ser sempre completo
3. Definir o **Auto DNA Engine** para geração automática a partir de dados simples da loja
4. Estabelecer os limites corretos entre o que o Free gera automaticamente e o que o Pro refina de forma guiada

---

## Princípio central revisado

> **Não "unicidade total por loja". Sim "coerência forte por arquétipo + personalização progressiva".**

Tentar gerar unicidade extrema com apenas `segmento` e `cor primária` cria inconsistência e decisões arbitrárias. O objetivo correto é:

- **Free:** arte coerente e bonita, inequivocamente do arquétipo da loja
- **Pro:** arte coerente, bonita **e mais proprietária** — refinada pelo próprio lojista

---

## Regra sobre campos opcionais

### No input da store (banco de dados)
`positioning`, `tone_of_voice`, `secondary_color` e outros podem estar ausentes — lojas legadas não os têm preenchidos.

### No BrandDNA resolvido
**Nenhum campo deve ser opcional.** O Auto DNA Engine é responsável por inferir defaults coerentes para qualquer campo ausente. O objeto `BrandDNA` que sai do engine — e que alimenta arte, copy, plano e Pro Day 1 — deve estar sempre completo.

> A razão é simples: se o DNA final continua com buracos, o problema só muda de lugar. Daqui a pouco, copy, heurística de plano e refinamento Pro dependerão desses campos.

---

## As três dimensões que entram no contrato

### Dimensão 1: Tratamento de Imagem (`image_treatment`)

Define como a foto do produto é apresentada.

```typescript
export type BrandImageFilter =
  | "natural"        // fiel ao produto — mercado, pet, farmácia simples
  | "warm"           // tons âmbar — adega, restaurante, boutique clássica
  | "cool"           // frio e contrastado — tech, farmácia premium, modern
  | "high_contrast"; // mais dramático — bold/impact

export interface BrandImageTreatment {
  filter: BrandImageFilter;
  /**
   * Ajustes leves e comercialmente seguros.
   * Em beta, limitados a valores que não alterem a fidelidade do produto.
   * Escala: -1.0 a +1.0 (0 = neutro)
   */
  warmth: number;     // range beta: -0.3 a +0.3
  contrast: number;   // range beta: -0.2 a +0.2
  saturation: number; // range beta: -0.3 a 0 (nunca saturar acima do original)
}
```

> **Regra de segurança obrigatória para o beta:** o tratamento não pode alterar a fidelidade comercial do produto. Tinta, roupa, bebida ou medicamento com aparência diferente quebra confiança do lojista com seu cliente. No beta, somente ajustes suaves do grupo "warmth / coolness / contrast" são permitidos. Filtros estilizados mais agressivos ficam para versão futura após validação.

---

### Dimensão 2: Tratamento de Fundo (`background_treatment`)

Define o que existe atrás do produto — a maior alavanca de retorno visual imediato. É o que mais comunica sofisticação, energia e "cara de marca" ao lojista.

```typescript
export type BrandBackgroundStyle =
  | "solid_clean"          // cor sólida pura — minimalismo
  | "gradient_brand_soft"  // gradiente suave derivado da paleta
  | "geometric_bold"       // formas geométricas da marca
  | "editorial_light"      // composição com área de luz — luxury/fashion
  | "editorial_shadow";    // composição com profundidade e sombra — luxury/premium

export type BrandBackgroundIntensity =
  | "subtle"       // presença mínima — não compete com o produto
  | "balanced"     // equilíbrio entre presença e produto
  | "expressive";  // protagonismo — quando o fundo é parte da identidade

export interface BrandBackgroundTreatment {
  style: BrandBackgroundStyle;
  /**
   * Segundo eixo de controle.
   * Um fundo `geometric_bold` pode ser discreto ou agressivo demais sem este campo.
   * O renderer usa essa intensidade para escalar opacidade, tamanho e contraste do fundo.
   */
  intensity: BrandBackgroundIntensity;
}
```

> **Regra de catálogo controlado:** o DNA não escolhe livremente entre infinitas possibilidades — ele escolhe dentro de famílias bem calibradas combinadas com nível de intensidade. Isso garante consistência e reduz risco de uma campanha "escapar da marca".

---

### Dimensão 3: Temperatura da Marca (`brand_temperature`)

Define a "energia visual" percebida, independentemente da cor primária.

```typescript
export type BrandTemperature = "warm" | "cool" | "neutral";
```

Influencia: overlay da imagem, tom das sombras, derivação do `neutral` e geração do `accent` complementar.

> **Regra de derivação — não vem apenas do hue:**
> `temperatura final = hue_da_cor + arquétipo_do_segmento + posicionamento`
>
> | Cor | Segmento | Temperatura resultante |
> |---|---|---|
> | Vermelho | Adega | `warm` |
> | Vermelho | Farmácia popular | `neutral` |
> | Azul | Premium fashion | `cool` |
> | Azul | Mercado popular | `neutral` |

---

## Regras de Geração da Paleta Completa

### `primary`
Vem da loja. Se ausente, o engine usa uma **cor base por arquétipo** — não uma cor genérica global:

| Arquétipo | Cor primária padrão | Justificativa |
|---|---|---|
| luxury | `#7B2D2D` (Bordeaux) | Sofisticação e profundidade |
| editorial | `#2C3E50` (Azul grafite) | Elegância fria |
| sensorial | `#8B4513` (Terra quente) | Calor e gastronomia |
| friendly | `#2E7D32` (Verde vibrante) | Proximidade e vida |
| clean | `#1565C0` (Azul farmácia) | Confiança e saúde |
| impact | `#C62828` (Vermelho mercado) | Energia e promoção |
| precision | `#212121` (Preto tech) | Precisão e modernidade |
| trust | `#37474F` (Cinza azulado) | Credibilidade |
| modern (padrão) | `#111827` (Zinc-950) | Neutro seguro |

> **Anti-colisão por `visual_seed`:** quando duas lojas do mesmo arquétipo não têm cor cadastrada, a seed aplica uma micro-variação de hue (±5° a ±15°) dentro da família do arquétipo, garantindo que não recebam exatamente a mesma primary.

### `secondary`
Derivada da primary com ajuste de luminosidade no modelo HSL:
- Para arquétipos `luxury` e `minimal`: secondary = primary com lightness +20% e saturation -15% (versão mais suave)
- Para arquétipos `bold` e `impact`: secondary = primary com lightness -15% (versão mais escura e intensa)
- Para arquétipos `modern` e `friendly`: secondary = primary com hue +30° (análoga harmoniosa)

> **Regra de legibilidade:** `secondary` deve sempre ter contraste mínimo de 3:1 com o fundo mais comum do arquétipo (branco para minimal/clean, escuro para luxury/bold). O engine valida isso antes de persistir.

### `accent`
Derivado como complementar da cor primária no círculo HSL — nunca cópia da primary:

```
// Complementar direto (contraste máximo)
accent_hue = (primary_hue + 180) % 360

// Complementar triádico (harmonia mais sofisticada)
accent_hue = (primary_hue + 120) % 360
```

Seleção por arquétipo:
- `luxury` / `minimal` → triádico
- `bold` / `impact` → direto
- `modern` / `friendly` → triádico com leveza

### `neutral`
Cinza modulado pela temperatura da marca:
- `warm` → cinza com hue entre 15°–40° (warm gray)
- `cool` → cinza com hue entre 200°–240° (cool gray)
- `neutral` → cinza puro HSL (hue: 0°, saturation: 0%)

**O `neutral` é sempre obrigatório no DNA resolvido.** O engine o deriva da temperatura caso o lojista não o forneça.

---

## Regras Globais de Contraste (WCAG adaptado para contexto comercial)

Esses limites se aplicam **após** a paleta estar resolvida. O engine os valida antes de persistir o DNA.

### Texto principal sobre fundo
| Tipo de texto | Contraste mínimo | Justificativa |
|---|---|---|
| Headline (grande) | 4.5:1 | Legibilidade em arte comprimida para feed |
| Body text (médio) | 4.5:1 | Idem |
| Label / detalhe (pequeno) | 7:1 | Textos pequenos exigem contraste maior |

### CTA sobre seu fundo
| Elemento | Contraste mínimo |
|---|---|
| Texto do CTA vs. fundo do botão | 4.5:1 |
| Botão CTA vs. fundo da arte | 3:1 (distinção de área) |

> **Regra de fallback de contraste:** se o accent gerado não atingir 4.5:1 contra o fundo do CTA, o engine substitui por `#FFFFFF` ou `#000000` (o que tiver maior contraste). O DNA nunca persiste com violação de contraste no CTA.

> **Por que isso importa além da estética:** arte com CTA ilegível não converte. Para lojas físicas com público de todas as idades, legibilidade é diretamente proporcional a resultado comercial.

---

## O papel do `visual_seed` (definição semântica revisada)

O `visual_seed` é um identificador determinístico por loja, derivado do `store.id`. Seu papel é **estabilidade**, não variação.

### Para que serve:
- Garantir que a mesma loja gere sempre a mesma arte para o mesmo produto
- Fazer pequenas escolhas editoriais **dentro do catálogo controlado** (ex: qual variação de `gradient_brand_soft` usar, em qual ângulo, com qual offset)
- Garantir consistência entre campanhas geradas em momentos diferentes

### Para que NÃO serve:
- Inventar diferenças arbitrárias entre campanhas da mesma loja
- Gerar variação perceptível para compensar um DNA insuficiente
- Funcionar como substituto de uma paleta ou estilo bem definidos

> Se o DNA estiver correto, a seed é apenas um "ajuste fino editorial". Se o DNA estiver errado, a seed não conserta nada.

---

## O Contrato Expandido

```typescript
// === Tipos existentes (mantidos) ===
export type BrandVisualStyle = "minimal" | "bold" | "luxury" | "modern";
export type BrandToneOfVoice = "premium" | "friendly" | "aggressive" | "informative";
export type BrandHeadlineFont = "sans_display" | "serif_elegant" | "rounded_bold";
export type BrandBodyFont = "sans_clean" | "serif_clean";

// === Tipos novos ===
export type BrandTemperature = "warm" | "cool" | "neutral";
export type BrandImageFilter = "natural" | "warm" | "cool" | "high_contrast";
export type BrandBackgroundStyle =
  | "solid_clean"
  | "gradient_brand_soft"
  | "geometric_bold"
  | "editorial_light"
  | "editorial_shadow";
export type BrandBackgroundIntensity = "subtle" | "balanced" | "expressive";

// === Interface principal ===
export interface BrandDNA {
  /** Versão do schema. Obrigatório para evolução segura do contrato. */
  version: number;

  /**
   * Identificador determinístico por loja.
   * Serve para estabilidade e pequenas escolhas editoriais dentro do catálogo.
   * NÃO é fonte de variação arbitrária.
   */
  visual_seed: string;

  // === BLOCO: PERFIL VISUAL ===
  /** Macroestilo da marca. Orienta todas as decisões do engine. */
  visual_style: BrandVisualStyle;

  /** Energia visual percebida. Derivada de hue + arquétipo + posicionamento. */
  brand_temperature: BrandTemperature;

  // === BLOCO: PALETA ===
  palette: {
    primary: string;
    /** Derivada da primary por regra de harmonia do arquétipo. */
    secondary: string;
    /** Gerado como complementar da primary — nunca cópia. */
    accent: string;
    /** Cinza modulado pela temperatura. Sempre obrigatório no DNA resolvido. */
    neutral: string;
  };

  // === BLOCO: TIPOGRAFIA ===
  typography: {
    headline_font: BrandHeadlineFont;
    body_font: BrandBodyFont;
  };

  // === BLOCO: TRATAMENTO VISUAL ===
  image_treatment: {
    filter: BrandImageFilter;
    warmth: number;    // range beta: -0.3 a +0.3
    contrast: number;  // range beta: -0.2 a +0.2
    saturation: number;// range beta: -0.3 a 0
  };

  background_treatment: {
    style: BrandBackgroundStyle;
    /** Escala opacidade, tamanho e contraste do fundo no renderer. */
    intensity: BrandBackgroundIntensity;
  };

  // === BLOCO: IDENTIDADE VERBAL ===
  /**
   * Obrigatório no DNA resolvido.
   * O engine infere um default quando ausente no input da store.
   */
  tone_of_voice: BrandToneOfVoice;

  /**
   * Posicionamento estratégico da marca.
   * Obrigatório no DNA resolvido — inferido do arquétipo + segmento se ausente.
   */
  positioning: string;

  // === BLOCO: GOVERNANÇA ===
  logo_usage: {
    allow_monochrome: boolean;
  };

  // === BLOCO: CONFIGURAÇÃO ===
  config: {
    /**
     * Intensidade visual global da marca.
     * Derivada do arquétipo — não mais fixada em 0.5 para todos.
     * Range: 0.0 (mínimo) a 1.0 (máximo).
     */
    visual_aggression: number;
  };
}
```

> **Nota de migração:** `tone_of_voice`, `positioning` e `palette.neutral` passam de opcionais para obrigatórios. O `Auto DNA Engine` garante que o objeto resolvido sempre os popule. Lojas com DNA legado no banco serão migradas ao serem carregadas, sem necessidade de migration SQL.

---

## O Auto DNA Engine

O `mapper.ts` não infere diretamente — ele delega para um conjunto de funções coesas:

### Estrutura de funções

```typescript
// lib/domain/stores/auto-dna.ts

inferBrandArchetype(segment: string | null): BrandArchetype
inferColorTemperature(hex: string, archetype: BrandArchetype): BrandTemperature
buildExpandedPalette(primary: string, temperature: BrandTemperature, archetype: BrandArchetype): Palette
inferImageTreatment(archetype: BrandArchetype, temperature: BrandTemperature): BrandImageTreatment
inferBackgroundTreatment(archetype: BrandArchetype, aggression: number): BrandBackgroundTreatment
inferToneOfVoice(raw: string | null, archetype: BrandArchetype): BrandToneOfVoice
inferPositioning(segment: string | null, archetype: BrandArchetype): string
buildAutoDNA(store: RawStoreData): BrandDNA
```

### Por que separar?
- Cada função é testável de forma isolada
- O `mapper.ts` apenas monta — não infere
- O Pro pode reusar as mesmas funções com inputs adicionais do setup guiado
- Facilita evolução sem reescrever tudo

---

## Tabela de Arquétipos por Segmento

O segmento define o **ponto de partida**, não a prisão estética. Desvios controlados são esperados e tratados na função `inferBrandArchetype` com base em `brand_positioning`.

| Segmento | Arquétipo | visual_style | aggression | Tipografia | Tom | Temperatura base | Fundo | Intensidade | Filtro |
|---|---|---|---|---|---|---|---|---|---|
| Adega / Bebidas | luxury | `luxury` | 0.40 | serif_elegant | premium | warm | editorial_shadow | balanced | warm |
| Restaurante / Food | sensorial | `luxury` | 0.50 | serif_elegant | friendly | warm | editorial_light | balanced | warm |
| Boutique / Moda | editorial | `minimal` | 0.35 | serif_elegant | premium | cool | editorial_light | subtle | natural |
| Pet Shop | friendly | `modern` | 0.55 | rounded_bold | friendly | neutral | gradient_brand_soft | balanced | natural |
| Farmácia / Drogaria | clean | `minimal` | 0.30 | sans_display | informative | cool | solid_clean | subtle | cool |
| Mercado Local | impact | `bold` | 0.75 | rounded_bold | friendly | neutral | geometric_bold | expressive | high_contrast |
| Tech / Eletrônicos | precision | `modern` | 0.60 | sans_display | informative | cool | gradient_brand_soft | balanced | cool |
| Serviços | trust | `minimal` | 0.40 | sans_display | informative | neutral | solid_clean | subtle | natural |
| **Padrão (sem segmento)** | modern | `modern` | 0.50 | sans_display | friendly | neutral | gradient_brand_soft | balanced | natural |

---

## O que muda no `seed-engine.ts`

O `seed-engine.ts` atual gera microvariações aleatórias invisíveis. Ele precisa ser reescrito para aplicar o `background_treatment` e o `image_treatment` do DNA com base no catálogo controlado.

> O papel deixou de ser "variar" e passou a ser "materializar identidade editorial".

O componente deve ser renomeado para comunicar essa nova intenção. Opções:
- `brand-render-engine.ts`
- `visual-identity-engine.ts`

---

## Nota sobre o `renderer.ts`

O `renderer.ts` não será refatorado estruturalmente — ele passa a consumir tokens mais ricos. Porém:

> **A responsabilidade visual do renderer vai aumentar significativamente.**

Especialmente em:
- Aplicação consistente de overlay e temperatura sobre a foto
- Geração de fundo por família + intensidade
- Combinação de contraste entre foto, tipografia e paleta expandida

Essa complexidade adicional deve ser planejada — não subestimada.

### Regra de Prioridade Visual (Reading Order)

Quando houver conflito entre elementos visuais — fundo muito expressivo vs. texto com baixo contraste, por exemplo —, o renderer deve seguir esta hierarquia:

```
1. Produto (foto)      → sempre preservado, nunca mascarado
2. Headline            → sempre legível, nunca perdida no fundo
3. Preço               → sempre em destaque, especialmente em artes promocionais
4. Fundo               → se adapta aos anteriores, não o contrário
```

Essa regra orienta decisões de:
- quando reduzir `background_treatment.intensity` automaticamente
- quando forçar overlay de legibilidade sobre a foto
- quando priorizar contraste do texto em detrimento da estética do fundo

> **Princípio:** o fundo serve à marca, mas nunca prejudica a comunicação do produto.

### Clareza de responsabilidade entre campos visuais

Para evitar confusão entre campos de configuração visual à medida que o sistema cresce:

| Campo | Papel | Escopo |
|---|---|---|
| `visual_style` | Identidade macro da marca | Orienta tipografia, tom e família estética |
| `config.visual_aggression` | Energia geral da marca | Escala global: quão presente é a marca em tudo |
| `background_treatment.intensity` | Comportamento do fundo | Controle fino: quão protagonista é o fundo especificamente |

---

## Critérios de Sucesso

### Critérios originais
1. **5 artes da mesma loja, produtos distintos → inconfundivelmente da mesma marca**
2. **2 lojas do mesmo segmento, cores diferentes → claramente distintas**

### Critérios adicionais
3. **Mesma loja, categorias de produto diferentes → ainda parece a mesma marca**
   (O teste mais completo de consistência do DNA)

4. **Duas lojas do mesmo segmento → não podem parecer template recolorido**
   (O teste mais cruel: muda só a cor mas a "alma" da marca precisa ser diferente)

5. **A identidade visual sobrevive ao ciclo campanha → regeneração → plano semanal sem "drift" visual**
   (O DNA precisa ser estável o suficiente para manter coerência entre reuso, duplicação e atualização)

---

## Sequência de Implementação

| Passo | O que fazer | Dependência |
|---|---|---|
| 1 | Expandir `brand-dna.ts` com os novos tipos e campos | Nenhuma |
| 2 | Criar `lib/domain/stores/auto-dna.ts` com as funções de inferência | Passo 1 |
| 3 | Criar `lib/graphics/brand-token-catalog.ts` com arquétipos por segmento | Passo 1 |
| 4 | Atualizar `mapper.ts` para delegar ao Auto DNA Engine | Passos 2 e 3 |
| 5 | Reescrever `seed-engine.ts` → `brand-render-engine.ts` | Passos 1 e 3 |
| 6 | Atualizar `renderer.ts` para consumir os novos tokens | Passo 5 |
| 7 | Validar os 5 critérios de sucesso com artes reais | Passo 6 |

---
