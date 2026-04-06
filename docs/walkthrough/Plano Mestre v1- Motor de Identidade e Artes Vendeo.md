# Plano Mestre: Motor de Identidade e Artes Vendeo

Este plano detalha a implementação do novo **Vendeo Brand Engine**, um sistema unificado que garante artes exclusivas, conteúdo on-brand e consistência visual absoluta para cada lojista através de uma arquitetura de DNA centralizado e renderização em camadas.

## User Review Required

> [!IMPORTANT]
> **Modelo de Verdade Única**: Consolidaremos os campos dispersos (`primary_color`, `tone_of_voice`, etc.) no objeto `brand_dna`. A migração será feita com mappers inteligentes para manter a retrocompatibilidade.

> [!IMPORTANT]
> **Hierarquia de Renderização Rigorosa**: Seguiremos a regra `Layout > Hierarquia > Conteúdo > Estilo > Variação`. A `seed` será restrita à camada de **Variação**.

---

## 🏗️ Fase 1: Fundação (Banco de Dados & Domínio)

Objetivo: Criar o "Núcleo de Identidade" (Brand DNA) que alimentará todo o ecossistema.

### [MODIFY] [stores table](file:///g:/Projetos/vendeo/supabase/migrations/...)
- Adicionar coluna `brand_dna` (JSONB) para armazenar:
  - `colors`: `{ primary, secondary, accent }`
  - `typography`: `{ headline_font, body_font }`
  - `visual_style`: (ex: "minimalista", "luxo", "pop")
  - `tone_of_voice`: string
  - `positioning`: string
  - `visual_seed`: Hash único gerado no onboarding.
- Adicionar coluna `master_layout_id` (string) para "travar" o design aprovado.

### [MODIFY] [Domain Layer](file:///g:/Projetos/vendeo/lib/domain/stores/...)
- **Types**: Definir a interface `BrandDNA`.
- **Mapper**: Atualizar `mapDbStoreToDomain` para ler do `brand_dna` com fallback automático para colunas legadas.

---

## 🎨 Fase 2: O Motor Gráfico (Layered Rendering)

Objetivo: Refatorar o `renderer.ts` para ser um orquestrador de camadas em vez de funções monolíticas.

#### [MODIFY] [lib/graphics/renderer.ts](file:///g:/Projetos/vendeo/lib/graphics/renderer.ts)

A nova estrutura do renderer será composta por 4 métodos de desenho sequenciais:

1.  **`renderBaseLayout(ctx, layoutId)`**: Desenha o "esqueleto" e grids (Split, Floating ou Solid).
2.  **`renderBrandStyle(ctx, dna)`**: Aplica o "Style" do DNA (border-radius, sombras, fontes, tokens de cor).
3.  **`renderContent(ctx, campaignData)`**: Desenha a foto do produto, headline, preço e CTAs (o "recheio").
4.  **`renderSeedVariation(ctx, seed)`**: **Camada Final**. Injeta texturas,Patterns sutilmente gerados e micro-elementos decorativos baseados na semente única da loja.

---

## 🧠 Fase 3: IA & Onipresença (Copy & Estratégia)

Objetivo: Garantir que a "voz" da marca acompanhe o "visual".

### [MODIFY] [AI Prompt Generators](file:///g:/Projetos/vendeo/lib/ai/...)
- Injetar o objeto `brand_dna` (especialmente `tone_of_voice` e `positioning`) nos System Prompts de geração de:
  - Legendas e Headlines de campanhas.
  - Roteiros de Reels.
  - Planos de Marketing semanais.

---

## 🔄 Fase 4: Fluxo de Aprovação e Consistência

Objetivo: Implementar o conceito de "Layout Pinning".

1.  **Configuração de Identidade**: No onboarding ou perfil, o lojista define seu `brand_dna`.
2.  **Aprovação do Layout Geral**: O lojista escolhe e aprova um dos 3 layouts base. O sistema salva o `master_layout_id`.
3.  **Geração Automatizada**: Ao criar novas campanhas, o sistema ignora seletores de design e aplica automaticamente as 4 camadas baseadas no `master_layout_id` e no `brand_dna`.

---

## 🛠️ Plano de Verificação

### Testes Automatizados
- **Consistência**: Gerar 10 artes para a mesma loja e validar via hash de pixels que as camadas 1, 2 e 4 são idênticas.
- **Diferenciação**: Validar que duas lojas com o mesmo layout tem camadas 4 (Seed) visualmente distintas.

### Validação Manual
- Demonstrar a alteração do `visual_style` no DNA (ex: mudar de 'pop' para 'luxo') e como isso altera instantaneamente a estética de todas as artes e o tom das legendas sem quebar o layout.

## Open Questions

1. **Snapshots de Seed**: Devemos permitir que o usuário "re-gerar semente" se ele não gostar da textura inicial da marca dele?
2. **Camadas de Texto**: Como garantir legibilidade máxima caso a `renderSeedVariation` crie texturas muito complexas? (Sugestão: Alpha blending dinâmico).
