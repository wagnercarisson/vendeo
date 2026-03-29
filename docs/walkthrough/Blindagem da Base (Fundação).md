# Walkthrough: Etapa 1 — Blindagem da Base (Fundação)

Concluímos a primeira etapa da reestruturação da arquitetura de domínio. Esta etapa foca na "porta de entrada" dos dados, garantindo que tudo o que entra no sistema siga regras rígidas.

## Alterações Realizadas

### 1. Tipagem Estrita em `types.ts`
Substituímos strings genéricas por Uniões de Strings literais baseadas nas constantes oficiais de estratégia (`AUDIENCE_OPTIONS`, `OBJECTIVE_OPTIONS`, `PRODUCT_POSITIONING_OPTIONS`).

*   **Arquivo**: [types.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/types.ts)
*   **Campos Protegidos**: `audience`, `objective`, `product_positioning`.
*   **Benefício**: O Typescript agora impede o uso de valores inválidos (ex: "promo" em vez de "promocao") em toda a aplicação.

### 2. Validação Rigorosa em `schemas.ts`
Implementamos o `DbCampaignSchema` para servir de filtro para os dados vindos do Supabase.

*   **Arquivo**: [schemas.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/schemas.ts)
*   **O que ele faz**: Garante que o ID seja uma string, que o preço seja um número e que enums como `campaign_type` e `post_status` sigam apenas os valores permitidos pelo banco.

---

## Verificação Técnica

1.  **Integridade de Tipos**: As uniões de strings foram testadas contra as constantes em `lib/constants/strategy.ts` para garantir cobertura total.
2.  **Schema Zod**: O `DbCampaignSchema` foi estruturado para refletir a tabela `campaigns`, preparando o terreno para a **Etapa 2** (Mapeamento Seguro).

---

## Próxima Etapa
**Etapa 2: Refatoração do Mapper Central**. Agora que temos os schemas, vamos atualizar o Mapper para usá-los, eliminando definitivamente o uso de `any` na transformação dos dados do banco.
