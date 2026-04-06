
# Degrau 1 — Contrato Técnico do Brand DNA

## Objetivo da etapa

Definir o **contrato de domínio** do `BrandDNA` em Typescript, sem alterar banco de dados nem renderer neste momento.

Este degrau existe para:

* criar uma base tipada e estável para a evolução do Brand Engine;
* separar claramente o que é **identidade da marca** do que será **token derivado de renderização**;
* permitir transição segura a partir do modelo atual da `store`, que ainda possui campos flat legados como `primary_color`, `secondary_color`, `tone_of_voice` e `brand_positioning`. 

---

## Princípios adotados

### 1. O DNA guarda identidade, não decisão final de render

O contrato deve armazenar genes centrais da marca, e não detalhes que futuramente serão derivados pelo motor gráfico.

Por isso:

* **entram**: estilo visual, paleta, tipografia, semente, tom de voz, posicionamento;
* **não entram agora**: `background`, `shadow`, `border_radius`, contraste final, tokens de espaçamento.

Esses elementos deverão nascer depois, na etapa de derivação de tokens, em linha com a arquitetura final do Brand Engine. 

### 2. O contrato já nasce versionado

O campo `version` é obrigatório para suportar evolução futura do schema.

### 3. O contrato deve ser controlado

Sempre que possível, usar enums/unions em vez de `string` livre, para evitar caos semântico e inconsistência de uso.

### 4. A ausência do DNA deve ser aceitável

Neste degrau, o sistema deve continuar funcionando mesmo sem `brand_dna`, usando fallback para os campos legados existentes na store. 

---

# Proposta de contrato

## Arquivo sugerido

`lib/domain/stores/brand-dna.ts`

---

## Estrutura proposta

```ts
export type BrandVisualStyle =
  | "minimal"
  | "bold"
  | "luxury"
  | "modern";

export type BrandToneOfVoice =
  | "premium"
  | "friendly"
  | "aggressive"
  | "informative";

export type BrandHeadlineFont =
  | "sans_display"
  | "serif_elegant"
  | "rounded_bold";

export type BrandBodyFont =
  | "sans_clean"
  | "serif_clean";

export interface BrandDNA {
  version: number;

  /**
   * Identificador determinístico da variação visual da marca.
   * Deve ser gerado de forma estável a partir da identidade da loja.
   */
  visual_seed: string;

  visual_style: BrandVisualStyle;

  /**
   * Todas as cores devem ser armazenadas em formato hexadecimal.
   * Exemplo: #FFFFFF
   */
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral?: string;
  };

  typography: {
    headline_font: BrandHeadlineFont;
    body_font: BrandBodyFont;
  };

  tone_of_voice?: BrandToneOfVoice;
  positioning?: string;

  logo_usage?: {
    allow_monochrome: boolean;
  };

  config: {
    /**
     * Intensidade visual global da marca.
     * Range esperado: 0.0 (mínimo) a 1.0 (máximo).
     */
    visual_aggression: number;
  };
}
```

---

# Justificativa de cada campo

## `version`

Controla evolução do schema do DNA.

## `visual_seed`

Base do determinismo visual por loja. Deve ser derivada deterministicamente a partir do `store.id`, garantindo unicidade e estabilidade.

## `visual_style`

Define o macroestilo da marca, sem acoplar isso ainda ao renderer.

## `palette`

Contém apenas as cores-base da identidade, obrigatoriamente em formato **Hexadecimal**.

### Opcional: `neutral`

Permite que marcas refinadas especifiquem sua preferência de cinzas (quentes vs frios). Se ausente, o motor deriva a partir da cor primária.

## `typography`

Mantém a intenção tipográfica da marca, usando categorias semânticas controladas.

## `tone_of_voice` e `positioning`

Conectam o núcleo de identidade verbal ao conteúdo estratégico gerado pelo sistema.

## `logo_usage`

Estrutura inicial para governança do logotipo. Começa permitindo ou proibindo o uso monocromático, mas está preparada para expansões como `allow_negative` ou `prefer_symbol_only`.

## `config.visual_aggression`

Representa a intensidade visual desejada da marca (o "volume" da camada de semente).

---

# Decisões importantes deste contrato

## O que entra agora

* identidade visual essencial;
* identidade verbal relevante;
* estrutura versionada;
* tipagem controlada;
* governança básica de logo e paletas.

## O que fica para etapas futuras

* tokens derivados;
* regras de contraste;
* bordas, sombras, spacing;
* snapshots;
* catálogo de layouts;
* integração com renderer.

---

# Itens deliberadamente fora do contrato inicial

Estes itens **não entram no Degrau 1** para manter o escopo pequeno, seguro e coerente:

* `background`
* `border_radius`
* `shadow_intensity`
* `text_contrast`
* `layout_id`
* `safe_zones`
* `master_layout`
* snapshots de campanha
* regras de clipping
* telemetria

---

# Estratégia de compatibilidade inicial

Neste degrau, o domínio deverá aceitar que uma loja ainda não possua `brand_dna`.

Logo, a regra será:

* se `brand_dna` existir, ele é a fonte prioritária;
* se não existir, o sistema pode continuar operando com fallback a partir dos campos flat atuais da loja;
* nenhum comportamento visual novo será ativado ainda;
* este passo é somente preparação de domínio e tipagem.

---

# Conclusão

A proposta do Degrau 1 estabelece a base oficial sobre a qual renderer, tokens, snapshots e prompts poderão evoluir de forma premium e escalável.
ial sobre a qual renderer, tokens, snapshots e prompts poderão evoluir depois.

---
