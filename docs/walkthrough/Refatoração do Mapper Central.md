# Walkthrough: Etapa 2 — Refatoração do Mapper Central

Concluímos a segunda etapa da "Frente A". O Mapper agora é o guardião oficial da integridade dos dados entre o Supabase e a nossa UI.

## Alterações Realizadas

### 1. Eliminação definitiva do `any` em `mapper.ts`
Refatoramos as funções de mapeamento para usar o `DbCampaignSchema` que criamos na Etapa 1.

*   **Arquivo**: [mapper.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/mapper.ts)
*   **O que mudou**: `mapDbCampaignToDomain(data: unknown)` agora valida a entrada. Se os campos obrigatórios não existirem ou tiverem o tipo errado, o sistema interrompe o processamento antes de chegar na UI.

### 2. Mapeamento de Tipos de Estratégia
Implementamos o casting seguro para os novos tipos Union (`CampaignAudience`, `CampaignObjective`, `ProductPositioning`).

*   **Lógica**: `(raw.audience as CampaignAudience) || null`.
*   **Segurança**: Se o banco contiver uma string antiga que não está na nossa lista oficial, o Typescript nos alertará em tempo de desenvolvimento, e o Mapper garantirá um valor nulo ou padrão seguro.

---

## Verificação Técnica

1.  **Zod Parsing**: Implementado em `mapDbCampaignToDomain` e `mapDbCampaignToAIContext`.
2.  **Consistência de Tipos**: Verificamos que todas as propriedades do banco mapeadas em `schemas.ts` estão sendo corretamente atribuídas à interface `Campaign`.

---

## Próxima Etapa
**Etapa 3: Implementação de View Models e Seletores**. Agora que o fluxo de dados do banco está blindado, vamos criar modelos otimizados para as telas (ex: um modelo leve para a lista e seletores para lógica de status).
