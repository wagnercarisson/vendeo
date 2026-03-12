# Auditoria Estrutural - Pós-Refatoração

## 1. Diagnóstico Geral
A refatoração parece **parcialmente desalinhada**. Embora a segurança de tipo tenha melhorado em pontos isolados (como o uso de narrowing explícito), a estrutura central do projeto sofre com a **duplicação de contratos** e o uso excessivo de **campos frouxos (`unknown`, `any`)** em camadas de persistência que são depois forçados a tipos rígidos na UI. Isso cria uma "falsa segurança" que falha no build do Vercel quando as definições divergem.

## 2. Pontos de Ruptura Encontrados

| Caminho do Arquivo | Problema Identificado | Risco | Severidade |
| :--- | :--- | :--- | :--- |
| `lib/domain/short-videos/types.ts` | `reels_shotlist` definido como `unknown`. | Quebra silenciosa no frontend que usa `as any[]`. | Alta |
| `lib/domain/weekly-plans/types.ts` | `brief` definido como `Record<string, unknown>`. | Inconsistência com o decider que gera um objeto rígido. | Média |
| `app/dashboard/plans/_components/types.ts` | Duplicação massiva de tipos (`Plan`, `Campaign`, `Store`). | Divergência de propriedades entre Domain e UI. | Alta |
| `lib/domain/weekly-plans/mapper.ts` | Mapper `normalizeStrategyItems` manual (sem Zod). | Falha em capturar mudanças na estrutura da IA. | Média |
| `lib/domain/campaigns/schemas.ts` | Schema 100% opcional vs Domain 100% obrigatório. | Mappers podem esconder falhas graves da IA com fallbacks genéricos. | Baixa |

## 3. Contratos Quebrados

### Schema -> Mapper
- **Campaigns**: O schema aceita tudo opcional. O mapper assume a responsabilidade de "inventar" dados se a IA falhar. Isso é seguro para o runtime, mas mascara a qualidade da IA.
- **Weekly Strategy**: O Mapper ignora campos como `reasoning` se não forem explicitamente filtrados, mas a UI espera que eles existam.

### Mapper -> Domínio
- **Short Videos**: O mapper devolve `ShortVideoAIOutput` (rígido), mas o service persiste no banco e depois lê como `unknown` (`ShortVideoContext`).

### Rota -> Frontend
- **Weekly Plan**: A rota devolve `items: result?.items ?? []`. O frontend espera `WeeklyPlanItem[]` da UI, que tem um `brief` tipado, mas o domain devolve `brief: Record<string, unknown>`.

## 4. Tipos Duplicados ou Conflitantes

- **`Campaign`**: Definido em pelo menos 3 locais (`lib/domain/campaigns/types.ts`, `app/dashboard/plans/_components/types.ts`, `app/dashboard/campaigns/page.tsx`). As flags de `reels_*` variam entre opcionais e obrigatórias.
- **`Store`**: Definido em `lib/domain/stores/types.ts` e `app/dashboard/plans/_components/types.ts`. A UI adiciona campos que o domain não reconhece.
- **`StrategyItem`**: `lib/domain` define `reasoning?`, enquanto a UI define `reasoning` (obrigatório).

## 5. Recomendações de Correção

1.  **Tipos Centrais**: Unificar os tipos de `Campaign`, `Store` e `Plan` em um local global (ex: `lib/domain/core/types.ts` ou manter apenas nas pastas de domínio) e exportá-los para a UI.
2.  **Mappers**: Substituir filtros manuais por validação Zod no retorno da IA e garantir que o `unknown` do banco seja validado ao carregar o contexto (`fetchStoreContext`, `fetchCampaign`).
3.  **Domínio**: Definir interfaces rígidas para campos JSONB (como `shotlist` e `brief`) em vez de `unknown`.
4.  **Frontend**: Parar de redefinir tipos de domínio dentro das pastas de componentes.

## 6. Correções Prioritárias

1.  **Unificar `Campaign`**: Garantir que `lib/domain/campaigns/types.ts` seja a única fonte de verdade para o objeto de campanha.
2.  **Tipar `reels_shotlist`**: Mudar de `unknown` para `ReelsShot[]` em todos os contratos de domínio e schemas.
3.  **Zod Mappers**: Refatorar `normalizeStrategyItems` para usar Zod, garantindo que o `reasoning` e outros campos sejam preservados e validados.
4.  **Consistência de Resposta**: Alinhar o nome do campo `strategyItems` (Service) com `strategy_summary` (API/Frontend).
5.  **Remover `as any`**: Eliminar casts perigosos em `WizardShell` e `CampaignPreviewClient` substituindo-os por tipos importados do domínio.
