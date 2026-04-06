# Degrau 4: O Catálogo de Layouts (O Script)
Este degrau é fundamental para a "inteligência" do motor gráfico. Vamos extrair as coordenadas mágicas que hoje estão fixas no `renderer.ts` e formalizá-las em um **Catálogo de Layouts**. Isso permitirá que o sistema saiba exatamente quais áreas do canvas estão ocupadas por texto, preço ou logo.
## User Review Required
> [!IMPORTANT]
> **Zonas de Exclusão (Safe Zones)**: Definiremos áreas onde o gerador de ruído/textura (Seed) NÃO poderá desenhar com alta opacidade, garantindo a legibilidade.
> [!TIP]
> **Coordenadas Normalizadas**: Embora o canvas trabalhe com 1080x1350, o catálogo deve ser pensado de forma que o Renderer consiga consultar "onde está o preço?" de forma programática.
---
## Proposed Changes

### [Gráficos: Motor de Layout]

#### [NEW] [catalog.ts](file:///g:/Projetos/vendeo/lib/graphics/catalog.ts)
- Definir interfaces `Rect` (x, y, w, h) e `SafeZones`.
- **Unidade de Medida**: Coordenadas Absolutas (Base 1080x1350).
- **Nível de Detalhe**: Blocos de Conteúdo (Bounding Boxes).
- Implementar o `LAYOUT_CATALOG` com as definições iniciais para:
    - **Split**: 
        - `content_image`: [0, 0, 540, 1350]
        - `text_area`: [580, 250, 440, 500] (Bounding box da headline/body)
        - `cta_area`: [580, 1070, 440, 92]
        - `branding_area`: [580, 90, 440, 100]
    - **Solid** & **Floating**: Mapeamento básico de safe zones.

### [Domínio: Campanhas]

#### [MODIFY] [types.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/types.ts)
- Definir a interface `SafeZones`.
- Atualizar `LayoutSnapshot` para incluir a geometria de forma obrigatória (quando o snapshot for criado):
```ts
export interface LayoutSnapshot {
  id: string;
  version: number;
  zones: SafeZones; // Capturado do catálogo no momento do snapshot
}
```

---

## Decisões de Projeto (Fechadas)

1. **Unidade**: **Absolutas (1080x1350)**. Facilita a paridade com o `renderer.ts` e evita erros de arredondamento em proporções complexas.
2. **Geometria**: Uso de **Bounding Boxes**. Protege blocos inteiros de informação em vez de linhas individuais, garantindo uma margem de segurança visual para o Seed.
3. **Contrato**: O `LayoutSnapshot` passa a carregar as `zones` de forma explícita, servindo como a "escritura" do layout para o Renderer.

---

## Verification Plan

### Automated Tests
- Validar se o `catalog.getLayout('split')` retorna os retângulos corretos.
- Teste de colisão: Verificar se um ponto aleatório do canvas está dentro de uma Safe Zone.

### Manual Verification
- Renderizar as Safe Zones como retângulos semi-transparentes sobre uma arte de teste para validar o alinhamento.
