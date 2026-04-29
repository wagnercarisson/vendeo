# Matriz de Gaps — Arquitetura-Alvo v2 vs Implementação Atual

Status: baseline inicial de gaps arquiteturais
Data: 2026-04-14
Fonte-alvo: `docs/architecture/arquitetura-alvo-vendeo-v2.md`

## Escopo

Esta matriz compara a arquitetura-alvo v2 com a implementação atual observada no monólito Next.js do Vendeo. O foco é identificar gaps estruturais que afetam a consolidação do produto em torno de:

- domínio
- contratos
- persistência
- cadeia visual
- legado duplicado

## Resumo Executivo

Os gaps mais críticos hoje não estão em ausência de funcionalidade, mas em autoridade arquitetural. O sistema já possui partes importantes da arquitetura-alvo, porém a cadeia de decisão ainda está distribuída entre UI cliente, rotas, serviços e renderer. Isso gera risco de divergência entre estado persistido, estado exibido e estado efetivamente aprovado.

Prioridade prática sugerida:

1. Recentralizar escrita e transições de `campaigns` e `weekly_plan_items` no contexto de domínio.
2. Canonicalizar contratos de entrada e saída dos motores.
3. Formalizar a cadeia visual `Reader -> Composer -> Renderer`.
4. Eliminar módulos legados duplicados após migração segura.

## Gaps por Classificação

### Domínio

| Gap | Estado atual | Estado-alvo | Risco | Impacto no produto | Prioridade | Ação recomendada | Dependências |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Campaign Context não é o único árbitro de execução e aprovação | O fluxo de campanha ainda escreve diretamente em `campaigns` e `weekly_plan_items` a partir da UI cliente e de páginas de aplicação, com transições distribuídas entre `NewCampaignShell`, `CampaignPreviewClient`, páginas de dashboard e services. | Todo fluxo de criação, geração, edição, aprovação e regeneração deve convergir para o `Campaign Context`, com uma única cadeia de autoridade para escrita operacional. | Inconsistência de estado, regressões silenciosas e dificuldade para auditar quem promoveu uma campanha a `ready` ou `approved`. | Pode gerar campanha com status incorreto, quebra de previsibilidade na aprovação e maior chance de conteúdo incoerente chegar ao lojista. | P0 | Criar um application service canônico para mutações de campanha e substituir writes diretos da UI por chamadas server-side arbitradas pelo domínio. | Definir API de mutações do Campaign Context; mapear todos os pontos de escrita atuais; revisar ownership e autorização por operação. |
| Boundary entre Weekly Plan e execução por campanha ainda está frágil | O vínculo entre plano e campanha é mantido, mas parte da governança do fluxo ocorre no cliente, inclusive checagem de plano draft e vinculação de `campaign_id` no item do plano. | Weekly Plan deve apenas produzir intenção e brief; a promoção para execução deve ser validada e persistida server-side pelo contexto dono. | Planejamento pode vazar para execução sem a mesma proteção transacional e sem regra única de promoção. | Risco de campanha nascer ou permanecer vinculada a um plano em estado inadequado, afetando confiança no fluxo opcional de planejamento. | P1 | Mover validação de elegibilidade do plano e vinculação `weekly_plan_item_id` para um serviço server-side único; remover checagens decisórias do cliente. | Fechar regra de promoção de `weekly_plan_item` para campanha; definir transações mínimas para vínculo e desvínculo. |

### Contratos

| Gap | Estado atual | Estado-alvo | Risco | Impacto no produto | Prioridade | Ação recomendada | Dependências |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Não existe um Campaign Brief Contract canônico consumido por todos os motores | O serviço de geração textual usa `mapDbCampaignToAIContext`, mas esse shape é um contexto legado e não representa o contrato operacional central descrito na arquitetura. Campos como `origin`, `weekly_plan_item_id`, `campaign_type` e `content_type` não são a entrada canônica do motor. | `Campaign Brief Contract` explícito, tipado e compartilhado por conteúdo, vídeo e composição visual. | Drift entre motores, dependência de convenção implícita e evolução difícil de prompts e pipelines. | A geração pode perder contexto operacional relevante, o que reduz aderência do conteúdo ao fluxo real da campanha. | P1 | Criar arquivos de contrato dedicados para `Store Context`, `Strategy Item`, `Campaign Brief`, `Campaign Copy Output` e `Short Video Output`, e adaptar os serviços para consumi-los diretamente. | Aprovar catálogo técnico de contratos; alinhar `lib/domain/campaigns`, `lib/domain/weekly-plans` e `lib/domain/short-videos`. |
| Preview e composição usam objetos implícitos em vez de contratos explícitos | O preview visual depende de objetos `any` e `Partial<any>` produzidos por mappers, que viram contrato de fato entre geração, review e renderer. | `Composition Intent Contract` e `Composition Spec Contract` explícitos, com tipos dedicados e sem objetos ad hoc espalhados entre UI e renderer. | Acoplamento implícito entre preview, UI de edição e renderer, com baixa segurança de mudanças. | Pequenas mudanças em preview podem quebrar renderização ou aprovação sem falha clara em tempo de compilação. | P1 | Extrair `Composition Intent` e `Composition Spec` como contratos próprios; tipar `mapCampaignToPreviewData`, `mapAiArtToPreview` e `mapAiReelsToPreview` contra esses contratos. | Definir cadeia visual alvo; revisar `CampaignPreviewData` e o renderer para consumir spec, não estado de UI. |

### Persistência

| Gap | Estado atual | Estado-alvo | Risco | Impacto no produto | Prioridade | Ação recomendada | Dependências |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Status global e status granulares são atualizados em múltiplas camadas por conveniência de fluxo | `status`, `post_status` e `reels_status` são promovidos em diferentes pontos: service de geração, tela de nova campanha e tela de review/aprovação. Parte das transições usa cálculo local via selectors antes de persistir. | O domínio deve recalcular e persistir status somente a partir das transições oficiais dos estados granulares e da aprovação. | Divergência entre estado persistido e estado exibido, especialmente em fluxos parciais de arte vs reels. | Lojista pode ver campanha pronta ou aprovada fora da regra real, afetando confiança e continuidade do fluxo. | P0 | Centralizar transições de status em uma policy do Campaign Context e proibir updates diretos de `status` fora dessa policy. | Mapear matriz de transições válidas; alinhar `selectors` com policy canônica; migrar callers gradualmente. |
| Contrato de asset aprovado e governança de storage ainda não estão endurecidos | Há inconsistência no que vai para `campaigns.image_url`: um fluxo persiste URL pública; outro persiste o path do storage. Também não há registro transacional dedicado para snapshot aprovado do asset. | `Approved Asset Contract` canônico com `storage_path`, `generation_source`, `campaign_snapshot` e `visual_snapshot` quando aplicável; path controlado como fonte de verdade. | Perda de rastreabilidade, dificuldade para reconstituir aprovação e inconsistência entre ambientes/assinatura de URL. | Aprovação visual fica menos auditável e mais frágil para reabertura, analytics e governança futura. | P0 | Padronizar `image_url` para path controlado ou introduzir tabela de approved assets; gerar URL assinada apenas sob demanda; persistir snapshot mínimo de aprovação. | Decidir modelo final de asset aprovado; revisar uso de Supabase Storage e compatibilidade com dados já existentes. |
| Persistência analítica e operacional ainda não estão claramente separadas na aprovação visual | O fluxo atual persiste conteúdo aprovado diretamente na linha de campanha, mas não consolida snapshot reprodutível do que foi aprovado nem o contexto visual usado para render final. | Persistir somente o estado operacional da campanha na tabela central e, quando necessário, persistir snapshots dedicados para rastreabilidade de aprovação. | Reabertura ambígua e incapacidade de explicar exatamente qual versão foi aprovada. | Compromete debugging de qualidade visual, auditoria e evolução do motor de composição. | P1 | Definir snapshot mínimo de campanha aprovada e snapshot visual opcional; persistir no ato de aprovação pelo contexto dono. | Fechar desenho do `Approved Asset Contract`; decidir se snapshot fica em nova tabela ou JSON controlado. |

### Cadeia Visual

Baseline canonico aprovado em 2026-04-14:

- `docs/architecture/contratos-pipeline-visual-v1.md`
- `lib/domain/visual-composition/contracts.ts`

| Gap | Estado atual | Estado-alvo | Risco | Impacto no produto | Prioridade | Ação recomendada | Dependências |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A cadeia `Reader -> Composer -> Renderer` ainda não existe como pipeline explícito | O `visual-reader` existe como capacidade isolada, mas o renderer ainda recebe um input híbrido derivado de preview, estado de campanha e medições do DOM. Não há `Visual Intent Resolver`, `Composition Spec Builder` nem `Renderer Adapter` explícitos. | Reader produz sinais estruturados; o `Visual Intent Resolver` produz `Composition Intent`; o `Composition Spec Builder` produz `Composition Spec`; preview oficial e `Renderer Adapter` consomem a mesma spec; o renderer apenas executa os nodes derivados. | Alto acoplamento entre UI, preview e render final; evolução do motor visual tende a ser cara e arriscada. | Dificulta ganhos de qualidade visual previsível e reduz a capacidade de escalar composição sem quebrar aprovação. | P1 | Introduzir componentes explícitos de composição e converter o renderer para consumir `Composition Spec` via `Renderer Adapter`. | Definir contratos G e H; alinhar preview para ser consumidor da mesma spec usada na aprovação. |
| Renderer ainda embute decisões de negócio e paridade dependente de DOM | O renderer decide fallback de preço, badge, comportamento de contato e depende de dezenas de campos `measured_*` vindos da UI para preservar paridade visual. | Renderer deve apenas executar a spec final; políticas de layout e decisão comercial devem vir do compositor. | Regressões visuais e de negócio ficam misturadas; qualquer ajuste de preview pode alterar arte final de forma não intencional. | Afeta diretamente a qualidade da arte aprovada, que é uma alavanca de conversão do produto. | P1 | Reduzir responsabilidade do renderer para execução; mover políticas de layout, preço e assinatura de loja para contratos de composição. | Modelar `Composition Intent`; estabelecer fonte única das regras de layout; revisar medições realmente necessárias para aprovação. |

### Legado Duplicado

| Gap | Estado atual | Estado-alvo | Risco | Impacto no produto | Prioridade | Ação recomendada | Dependências |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Coexistência de `lib/campaigns` e `lib/domain/campaigns` | O repositório mantém dois núcleos de campanha com tipos distintos: um legado camelCase e menos rico, outro mais próximo do domínio-alvo em snake_case e com campos operacionais atuais. | `lib/domain/campaigns` deve ser o único caminho canônico para tipos, mappers, selectors, lógica e contratos de campanha. | Drift de tipos, imports errados, duplicação de manutenção e regressões por uso acidental do módulo legado. | Retarda consolidação do produto e aumenta o custo de qualquer alteração em campanha, que é o core do Vendeo. | P0 | Inventariar usos de `lib/campaigns`, migrar dependentes para `lib/domain/campaigns` e então remover o legado em corte controlado. | Levantar referências; definir compatibilidade de tipos; validar telas e serviços que ainda dependem do shape legado. |
| Definições estratégicas e regras semânticas ainda não estão totalmente centralizadas | A arquitetura já aponta fontes oficiais, mas a implementação ainda convive com normalizações, selectors e decisões espalhadas entre UI, formatters e services. | Uma única casa oficial para enums estratégicos, normalização semântica e regras de promoção de estado. | Inconsistência semântica e dificuldade para garantir que o mesmo conceito de campanha vale em todos os fluxos. | Gera comportamento divergente entre criação manual, plano semanal, geração textual, review e dashboard. | P1 | Consolidar enums, normalização e policies em `lib/domain` e deixar UI apenas consumir labels e contratos. | Fechar catálogo semântico; revisar imports de constantes e formatters; alinhar documentação com código. |

## Evidências Principais

### Arquitetura-alvo

- O documento-alvo define `Campaign` como unidade central de execução e aprovação, com arbitragem de persistência pelo `Campaign Context`: `docs/architecture/arquitetura-alvo-vendeo-v2.md`.
- O documento-alvo exige contratos explícitos entre motores e formaliza `Campaign Brief`, `Composition Intent`, `Composition Spec` e `Approved Asset Contract`: `docs/architecture/arquitetura-alvo-vendeo-v2.md`.
- O documento-alvo exige `lib/domain` como casa única do domínio e reconhece como legado a coexistência de `lib/campaigns` com `lib/domain/campaigns`: `docs/architecture/arquitetura-alvo-vendeo-v2.md`.

### Implementação atual

- Criação, atualização, geração, vínculo com plano e aprovação de campanha ainda ocorrem diretamente na UI em `app/dashboard/campaigns/new/_components/NewCampaignShell.tsx`.
- Edição, regeneração, review e aprovação também persistem diretamente em `campaigns` a partir do cliente em `app/dashboard/campaigns/[id]/_components/CampaignPreviewClient.tsx`.
- O dashboard e outras páginas continuam consultando `campaigns`, `weekly_plans` e `weekly_plan_items` diretamente, fora de um façade canônico de domínio, por exemplo em `app/dashboard/page.tsx` e `app/dashboard/campaigns/page.tsx`.
- O serviço textual já está em `lib/domain/campaigns/service.ts`, mas ainda usa `mapDbCampaignToAIContext` como shape operacional da IA, em vez de um `Campaign Brief Contract` formal.
- O renderer continua recebendo input híbrido e medições de DOM em `lib/graphics/renderer.ts`, sem `Composition Intent`, `Composition Spec` e `Renderer Adapter` explícitos.
- Os módulos `lib/campaigns` e `lib/domain/campaigns` coexistem com tipos divergentes em `lib/campaigns/types.ts` e `lib/domain/campaigns/types.ts`.

## Sequência Recomendada de Ataque

1. Consolidar autoridade de escrita de campanha e status em um service canônico do domínio.
2. Introduzir catálogo técnico de contratos compartilhados entre campanha, weekly plan, conteúdo, reels e cadeia visual.
3. Padronizar storage path e snapshot mínimo de aprovação antes de ampliar o motor visual.
4. Explicitar `Composition Intent`, `Composition Spec` e `Renderer Adapter` e adaptar preview e renderer.
5. Remover `lib/campaigns` apenas depois de todos os imports estarem migrados e validados.