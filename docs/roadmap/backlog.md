# 📌 Backlog — Vendeo

Este documento centraliza ideias, melhorias e funcionalidades futuras que ainda não são prioridade.

O objetivo é:

* evitar perda de ideias
* manter foco no roadmap atual
* registrar oportunidades futuras

---

# 🧠 Regras do backlog

## 1. Não implementar direto do backlog

Toda ideia deve primeiro:

👉 ser validada
👉 ser priorizada
👉 entrar em uma fase do roadmap

---

## 2. Evitar excesso de detalhamento

Itens aqui devem ser descritos de forma simples.

Detalhamento completo só ocorre quando a feature for priorizada.

---

## 3. Revisar periodicamente

O backlog deve ser revisado conforme o produto evolui.

---

# 🚀 Ideias registradas

## 🧩 Produto

* Biblioteca de produtos (catálogo reutilizável)
* Campanhas recorrentes automáticas
* Templates por nicho (padaria, farmácia, adega)
* Ajustes visuais guiados de layout (sem editor livre)
  * Permitir reposicionamento inteligente de elementos (preço, título, badge)
  * Opções pré-definidas (esquerda, centro, direita / topo, meio, base)
  * Variação de estilo (destaque, minimalista, agressivo)
  * Ajustes simples de tamanho e ênfase
  * Evitar editor livre tipo Canva para não aumentar complexidade
* Gerador de nome de promoção (ex: “Sextou da Adega”)

---

## ⚡ Conversão / Vendas

* Modo “Promoção Relâmpago” (geração rápida com urgência)
* Ajuste automático de copy para ocasiões (fim de semana, clima, etc)
* Sugestão automática de combos baseados em histórico

---

## 📱 Canais

* Conteúdo otimizado para WhatsApp (status e listas)
* Integração com outras redes sociais
* Exportação em múltiplos formatos

---

## 🤖 IA

* IA que sugere produtos para promoção
* IA que detecta campanhas repetitivas
* IA que ajusta preço psicológico (ex: R$9,99 vs R$10)

---

## 📊 Inteligência

* análise de performance por campanha
* comparação entre tipos de campanha
* recomendação baseada em histórico

---

## 🏢 Expansão

* suporte completo para imobiliárias
* suporte para concessionárias
* serviços (ex: clínicas, estética)

---

## ⚙️ Técnico

* otimização de custo de geração de imagem
* cache inteligente de assets gerados
* melhorias no motor de renderização

### 🎨 Contraste adaptativo de cores nos layouts

**Origem:** observado durante a validação do Passo 6 — Fase 2 (Brand Render Engine)

**Problema:** algumas cores primárias escolhidas pelo lojista (ex: azul escuro) "gritam" visualmente em layouts com fundo escuro (Split, Floating). O `primary_color` é aplicado diretamente sem ajuste de luminosidade/contraste.

**Comportamento esperado:**
- Antes de aplicar `primary_color` em elementos sobre fundo escuro, verificar contraste WCAG
- Se insuficiente, ajustar luminosidade da cor da marca (clarear ou escurecer) para garantir leitura sem perder a identidade
- Validar os 3 layouts (Solid, Floating, Split) e os 5 estilos de fundo do `background_treatment`

**Função candidata:** `ensureContrast()` — já existe em `auto-dna.ts`, expandir para os pontos de aplicação do `renderer.ts` e do `CampaignArtViewer.tsx`

---

### 🔄 Propagação de alteração de dados básicos da loja para o BrandDNA

**Origem:** observado durante o beta — lojista altera `primary_color` no perfil mas novas artes continuam usando o DNA armazenado (com a cor anterior)

**Comportamento atual:** `resolveBrandDNA` dá prioridade absoluta ao `brand_dna` salvo no banco. Mudanças em `primary_color` não invalidam o DNA armazenado.

**Comportamento esperado:**
1. Quando o lojista salvar alterações em campos de identidade de marca, o `brand_dna` deve ser zerado (`null`) no banco
2. Na próxima geração de arte, `resolveBrandDNA` não encontra DNA → executa `buildAutoDNA` com os novos dados → salva o novo DNA
3. Artes já geradas e publicadas **não são afetadas** — elas têm snapshot próprio
4. Um **alert de confirmação** deve ser exibido ao salvar, informando: *"Ao alterar a cor primária, as próximas artes seguirão o novo padrão. Artes já geradas precisarão ser regeradas para refletir a mudança."*

**Campos que devem disparar o alert e invalidar o DNA:**

| Campo | Impacto |
|---|---|
| `primary_color` | Alto — reconstrói toda a paleta |
| `secondary_color` | Médio — afeta secondary, accent |
| `main_segment` | Altíssimo — troca o arquétipo completo |
| `brand_positioning` | Médio — altera tone e positioning |

**Campos que NÃO disparam o alert:** `name`, `address`, `whatsapp`, `phone`, `logo_url`

---

# 🧭 Observação final

O backlog NÃO define prioridade.

Ele apenas registra possibilidades.

---

# 🔄 Próximo passo

Quando uma ideia for priorizada:

👉 mover para a fase correspondente em:

```bash
docs/roadmap/phases/
```
