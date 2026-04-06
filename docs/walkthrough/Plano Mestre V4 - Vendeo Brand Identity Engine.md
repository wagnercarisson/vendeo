# Plano Mestre V4: Vendeo Brand Identity Engine (Blueprint Final)

Este é o documento final de arquitetura para o **Vendeo Brand Identity Engine**. Ele consolida todos os pontos de design generativo, governança de dados e resiliência operacional discutidos.

---

## 🏗️ Fase 1: Catálogo Central & Contratos Técnicos

Objetivo: Criar a única fonte de verdade para a geometria e regras de marca.

### [NEW] [lib/graphics/catalog.ts]
- Registro formal de layouts versionados.
- Cada item do catálogo define:
  - `id`: (ex: "split")
  - `version`: (inteiro incremental)
  - `SafeZones`: Dicionário de `Rects` (Background, Content, Text, CTA).
  - `Rules`: `image_fit`, `text_alignment`, `visual_aggression_factor`.

---

## 🎨 Fase 2: Snapshotting & Imutabilidade Histórica

Objetivo: Garantir que uma campanha de 2024 nunca mude visualmente em 2026.

### [MODIFY] [campaigns table]
- **`layout_snapshot`** (JSONB): Objeto completo contendo a definição extraída do catálogo no momento da criação.
- **`brand_dna_snapshot`** (JSONB): Cópia total do DNA (Cores, Fontes, Seed) usada na renderização.

### 🛡️ Política de Versionamento
- **Nova Versão de Layout**: Mudança na geometria, zones ou regras estruturais.
- **Nova Versão de DNA**: Mudança no schema JSONB ou na lógica de derivação de tokens.
- **Hotfix**: Ajustes internos no renderer que não alteram a saída visual (não sobe versão).

---

## 🛡️ Fase 3: Resiliência Coercitiva (Fail-Safe Strategy)

Objetivo: Garantir 100% de disponibilidade operacional.

- Caso o `brand_dna` ou snapshot falhe, o renderer aplica:
  - **Layout de Emergência**: `solid_v1`.
  - **Tokens Default**: Cores neutras (Zinc 900) e fontes seguras (Sans-serif).
  - **Contrast Hard Mode**: Força fundo branco com texto preto se o contraste falhar.
  - **Seed Neutra**: Zero ruído visível.

---

## 🖌️ Fase 4: Orquestrador de Camadas V2 (O Engine)

Objetivo: Execução modular e observável.

1.  **`renderBaseLayout`**: Carrega o `layout_snapshot` (geometria imutável).
2.  **`renderBrandStyle`**: Processa `deriveBrandTokens` com `ensureContrast`.
3.  **`renderContent`**: Ajusta o "vigor visual" via `content_type` (Oferta > Produto > Info).
4.  **`renderSeedVariation`**: Restrição absoluta via Máscara de Clipping das `SafeZones`.

---

## 📡 Fase 5: Telemetria & Debug Interno

- **Debug Overlay**: Camada visual (ativável via query param em Dev/Beta) que desenha as zonas e ID de tokens.
- **Observability Log**: Telemetria básica anexada ao evento de render:
  - `render_duration_ms`, `layout_id`, `dna_version`, `contrast_corrected: boolean`, `fallback_triggered: boolean`.

---

## ✅ Plano de Verificação Final

### Automated Tests
- **Immutability Regression**: Criar campanha -> Atualizar Global Layout -> Renderizar Campanha -> Validar que os pixels são 100% idênticos ao snapshot original.
- **Fail-Safe Test**: Chamar renderer com objeto `brand_dna` vazio e garantir que o PDF/PNG seja gerado com sucesso.
