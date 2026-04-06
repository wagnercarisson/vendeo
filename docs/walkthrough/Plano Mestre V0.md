# Vendeo - Motor de Geração de Artes Personalizado via Seed

Este documento descreve a estratégia técnica para transformar o motor gráfico do Vendeo em um sistema de "Identidade Visual Generativa", onde cada lojista possui uma estética exclusiva mas consistente.

## User Review Required

> [!IMPORTANT]
> A implementação proposta exige a expansão do esquema de banco de dados para incluir o "DNA da Marca" de cada loja. Precisaremos definir se esses dados serão preenchidos manualmente pelo lojista ou gerados inicialmente por uma IA durante o onboarding.

> [!TIP]
> O conceito de "Seed" (semente) será usado para garantir que elementos decorativos (texturas, gradientes, formas geométricas) sejam randômicos entre lojistas, mas **determinísticos** para o mesmo lojista.

## Proposed Changes

A solução divide-se em quatro pilares: Identidade, Consistência, Geração e Orquestração.

---

### 1. Brand DNA (Persistência)

Expandir a entidade `Store` no banco de dados (Supabase) para incluir metadados estéticos.

- `brand_dna`: JSON contendo:
  - `primary_color`, `secondary_color`, `accent_color`
  - `visual_style`: (ex: "minimalista", "brutalista", "luxo", "orgânico")
  - `tone_of_voice`: (ex: "agressivo", "acolhedor", "informativo")
  - `visual_seed`: Um Hash único (ex: MD5 do Store ID) para gerenciar a aleatoriedade controlada.
- `master_layout_settings`: Configurações do layout "aprovado" (layout_id, alinhamento, etc).

---

### 2. Motor Gráfico (Renderer)

Atualizar o `renderer.ts` para ser "Seed-Aware", injetando elementos visuais únicos baseados no DNA da marca.

#### [MODIFY] [renderer.ts](file:///g:/Projetos/vendeo/lib/graphics/renderer.ts)
- Implementar uma função `drawBrandTexture(ctx, seed, style)` que:
  - Usa o `visual_seed` para gerar padrões de fundo (ex: ruído sutil, formas abstratas, gradientes específicos).
  - Garante que a arte de uma Adega tenha uma "energia" visual diferente de uma Boutique, mesmo usando o mesmo layout base.
- Suportar múltiplas fontes baseadas no `brand_dna`.

---

### 3. Layout Pinning (Consistência)

Garantir que, uma vez que o lojista escolha um layout, o sistema o "trave" para futuras campanhas.

- Interface para o lojista configurar sua identidade visual.
- Botão "Aprovar Layout Geral": Salva o layout atual como `master_layout_id` na loja.
- Novos `Campaigns` herdarão automaticamente as configurações de `master_layout_settings`.

---

### 4. IA Orchestrator (Personalização de Conteúdo)

Ajustar os prompts para que a IA consuma o posicionamento e diferencial da loja ao gerar o conteúdo.

- Injetar o `brand_dna` no System Prompt da IA.
- Exemplo: "Você é um redator para uma boutique de luxo (DNA: sofisticação). Escreva uma oferta para este produto..."

## Open Questions

1. **Nível de Autonomia**: Devemos permitir que o lojista altere o "Seed" (mudando o padrão visual) ou ele deve ser fixo por loja?
2. **Assets Externos**: Além de cores e formas, devemos suportar backgrounds gerados por IA (DALL-E) específicos para a marca e reutilizáveis?

## Verification Plan

### Automated Tests
- Criar um script de teste que gera 10 artes para a "Loja A" e 10 para a "Loja B". 
- Validar se as 10 da "Loja A" são idênticas entre si (consistência) mas visualmente distintas das 10 da "Loja B" (exclusividade).

### Manual Verification
- Demonstrar no Dashboard a troca de Brand DNA e como isso reflete instantaneamente no preview da campanha.
