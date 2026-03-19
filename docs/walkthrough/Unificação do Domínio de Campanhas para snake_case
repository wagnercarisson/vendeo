# Unificação do Domínio de Campanhas para `snake_case`

Concluímos a refatoração completa do domínio de campanhas para o padrão `snake_case`, unificando a nomenclatura desde o banco de dados até os componentes de interface e a API. Isso resolveu os erros de build encontrados no fluxo de criação de nova campanha.

## Mudanças Realizadas

### Domínio de Campanhas
- **Unificação para `snake_case`**: Todas as propriedades de campanha foram convertidas para `snake_case` em todo o fluxo (DB -> API -> UI).
- **Refatoração do `NewCampaignShell`**: Corrigido o erro de build e atualizados todos os componentes filhos (`ProductFormCard`, `StrategyFormCard`, `CampaignPreviewPanel`).
- **Consolidação de Lógica**: Centralização dos seletores e lógica em `lib/domain/campaigns/logic.ts`.
- **Limpeza de Legado**: Remoção completa do diretório `lib/campaigns/`.

### Componentes de Interface (UI)
- [x] [NewCampaignShell.tsx](file:///g:/Projetos/vendeo/app/dashboard/campaigns/new/_components/NewCampaignShell.tsx): Implementado bloqueio de campos quando vinculado ao plano e validação de posicionamento.
- [x] [StrategyFormCard.tsx](file:///g:/Projetos/vendeo/app/dashboard/campaigns/new/_components/StrategyFormCard.tsx): Adicionada prop `isDisabled` e removida opção "Padrão da loja".
- [x] [CampaignEditForm.tsx](file:///g:/Projetos/vendeo/app/dashboard/campaigns/[id]/_components/CampaignEditForm.tsx): Alinhada validação e placeholders com o fluxo de criação.
- [x] [CampaignPreviewClient.tsx](file:///g:/Projetos/vendeo/app/dashboard/campaigns/[id]/_components/CampaignPreviewClient.tsx): Adicionadas badges de origem ("Plano Semanal") e indicadores de status agrupados.
- [x] [page.tsx](file:///g:/Projetos/vendeo/app/dashboard/campaigns/[id]/page.tsx): Atualizado cabeçalho com contexto de origem da estratégia.
- [x] [ExecutionStep.tsx](file:///g:/Projetos/vendeo/app/dashboard/plans/_components/ExecutionStep.tsx): Removidos botões redundantes "Gerar texto" e "Gerar reels".
- [x] [ContentCalendar.tsx](file:///g:/Projetos/vendeo/app/dashboard/_components/ContentCalendar.tsx): Refatorada busca de dados para garantir exibição dos itens do plano no calendário.
 Drum
### API e Integrações
- **API `og-image`**: Atualizada para suportar o novo padrão de nomenclatura.
- **Mappers e Schemas**: Todos os pontos de entrada de dados agora utilizam mappers e esquemas Zod em `snake_case`.

## Resultados dos Testes
- **Build**: O erro de compilação em `NewCampaignShell.tsx` foi resolvido.
- **Tipagem**: Verificação local de tipos (`tsc`) concluída sem erros nos arquivos modificados.
- **Funcionalidade**: O fluxo de criação de campanha agora utiliza propriedades consistentes, evitando falhas de mapeamento entre a UI e o backend.

## Próximos Passos
- Monitorar a geração de artes e vídeos no ambiente de produção para garantir que os novos nomes de propriedades sejam interpretados corretamente por todos os serviços AI.
