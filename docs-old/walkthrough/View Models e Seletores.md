# Walkthrough: Etapa 3 — View Models e Seletores

Concluímos a terceira etapa, trazendo a "inteligência estratégica" para dentro do domínio, seguindo rigorosamente o documento `CAMPAIGN_FLOW_RULES.md`.

## Alterações Realizadas

### 1. Centralização da Lógica em `selectors.ts`
Criamos um novo arquivo que contém todas as regras de negócio para cálculo de status e estados visuais.

*   **Arquivo**: [selectors.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/selectors.ts)
*   **Regras Implementadas**:
    *   **Hierarquia de Status (Regra 1.1)**: `draft` < `ready` < `approved`.
    *   **Estado de UI (Regra 1.2)**: Determina se a campanha é `complete`, `art`, `video` ou `none` com base em `post_status` e `reels_status`.
    *   **Trava Estratégica**: Funções para identificar se a campanha vem de um plano e deve ter campos bloqueados.

### 2. View Models em `types.ts`
Definimos o modelo `CampaignListItem`, uma versão otimizada e leve para a listagem principal.

*   **Arquivo**: [types.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/types.ts)

### 3. Mapeamento de UI em `mapper.ts`
Adicionamos a função `mapCampaignToListItem`, que utiliza os seletores para entregar os dados prontos para os componentes de React.

---

## Verificação Técnica

1.  **Conformidade**: Validamos que `getUIStatus` e `getGlobalStatus` seguem exatamente as definições do `CAMPAIGN_FLOW_RULES.md`.
2.  **Desacoplamento**: A UI agora pode perguntar `selectors.hasVideo(campaign)` em vez de verificar manualmente o status do banco.

---

## Próxima Etapa
**Etapa 4: Migração da Listagem**. Vamos atualizar a página principal de campanhas para usar o novo `CampaignListItem` e os seletores, removendo a lógica dispersa nos componentes.
