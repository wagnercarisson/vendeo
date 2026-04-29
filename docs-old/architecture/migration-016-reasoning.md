# Registro de Decisão Técnica: Migration 016 - Selos Dinâmicos

**Data:** 31/03/2026
**Status:** Aplicado (Schema & Code)

## Contexto
O Vendeo Beta utilizava um badge de preço rígido com o texto "OFERTA" fixo no Canvas. Lojistas expressaram a necessidade de usar o badge para outras finalidades estratégicas, como "NOVIDADE", "LANÇAMENTO" ou "SÓ HOJE", e até mesmo omitir o valor monetário.

## Decisão
Adicionar a coluna `price_label` (TEXT) à tabela `campaigns`.

## Racional
1. **Flexibilidade de Marketing**: Permite segmentar ofertas que não são puramente promoção de preço.
2. **Design Adaptativo**: O motor gráfico (`renderer.ts`) foi atualizado para lidar com a ausência de preço, centralizando o rótulo verticalmente no badge.
3. **Padrão Semântico**: O nome `price_label` foi escolhido em vez de `image_badge_label` por ser mais conciso e estar diretamente ligado ao componente visual de preço/selo.
4. **Retrocompatibilidade**: O campo é opcional. Se nulo, o sistema assume o padrão "OFERTA" se houver preço, ou esconde o badge se ambos forem nulos.

## Impactos
- **Domínio**: Interface `Campaign` agora inclui `price_label`.
- **Motor Gráfico**: Função `drawPriceBadge` refatorada.
- **Wizard**: Campo de preço agora é opcional (`hasRequiredPrice = true`).
- **Review (Estúdio)**: Inclusão de seletor de rótulo para ajuste fino em tempo real.
