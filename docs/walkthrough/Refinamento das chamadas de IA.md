# Walkthrough: Refinamento da Estratégia Semanal (Chamada #1)

Concluí a primeira etapa do refinamento de prompts, focando na **Estratégia Semanal**. A IA agora atua como um "Consultor de Varejo de Bairro" e considera a localização real da loja para sugerir postagens.

## Alterações Realizadas

### [Backend] [strategy.ts](file:///g:/Projetos/vendeo/lib/domain/weekly-plans/strategy.ts)
*   Atualizada a consulta ao banco de dados para incluir o campo `neighborhood` (bairro), permitindo uma segmentação ainda mais precisa.
*   Garantido que todos os dados de localização (`city`, `state`, `neighborhood`) sejam passados para o construtor do prompt.

### [IA] [prompts.ts](file:///g:/Projetos/vendeo/lib/domain/weekly-plans/prompts.ts)
*   **Nova Persona**: Alterada para "Consultor de Marketing de Varejo Especialista", com foco em "arregaçar as mangas" e buscar resultados reais.
*   **Lógica de Cross-Selling**: A IA agora é instruída a sempre pensar em produtos complementares (ex: se sugeriu bebidas, sugere também petiscos ou gelo).
*   **Ganchos de Urgência Inteligentes**: Implementada lógica de escassez/tempo condicional, usada apenas quando faz sentido comercial, para evitar cansar o público premium.
*   **Inteligência Regional**: Aprimorada a consideração de costumes e clima de `{{store.city}} / {{store.state}}`.
*   **Filtro B2B**: Lógica baseada no segmento para evitar sugestões de atacado onde não cabe.

### [Backend] [service.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/service.ts)
*   Aprimorada a busca de contexto: agora, se a campanha estiver vinculada a um plano, o sistema recupera o **Raciocínio Estratégico** (theme) original do banco de dados.
*   Isso garante que a "promessa" feita na estratégia (ex: cross-selling) seja cumprida no texto final.

### [IA] [prompts.ts](file:///g:/Projetos/vendeo/lib/domain/campaigns/prompts.ts)
*   **Regra de Ouro (Concordância)**: Instrução explícita para validar o gênero do produto (O Whisky vs A Cerveja) para evitar erros de pronomes/artigos.
*   **Sotaque Regional**: O prompt agora exige o uso de termos e gírias locais baseados na cidade da loja.
*   **Fidelidade Estratégica**: A IA é obrigada a seguir o `theme` recuperado do plano.
*   **Limites de Caracteres**: Headline reduzida para 25 carac. e Body para 60 carac., otimizando o design das artes.

### [Canais de Vídeo] [service.ts](file:///g:/Projetos/vendeo/lib/domain/short-videos/service.ts)
*   **Inteligência Estratégica**: Assim como nos posts, o gerador de Reels agora recupera o `theme` do plano semanal. Se o plano sugere "Cerveja + Petisco", o roteiro do vídeo seguirá exatamente essa linha.
*   **Mapeamento de Contexto**: Atualizado o mapper para garantir que todos os dados de marca e localização cheguem ao roteirista de IA.

### [IA] [prompts.ts](file:///g:/Projetos/vendeo/lib/domain/short-videos/prompts.ts)
*   **Diretriz de Varejo Real**: Banimento de cenas complexas (multidões, festas, mesas cheias). Foco em cenas que o lojista grava sozinho (Close no produto, POV, demonstração simples no balcão).
*   **Ganchos (Hooks) Magnéticos**: Otimização dos primeiros 3 segundos para retenção máxima no scroll.
*   **Rigor Gramatical**: Regra de concordância de gênero aplicada também aos roteiros e textos de tela.

## Como Validar

1.  Selecione um item de um plano semanal que tenha uma sugestão estratégica clara (ex: "Foco em Cross-selling de Vinhos").
2.  Gere o roteiro do Reels.
3.  Verifique se o `shotlist` (lista de cenas) é simples de executar na loja e se o roteiro cita os produtos sugeridos na estratégia.
## Limpeza e Roadmap

*   **Chamada #4 (Removida)**: O endpoint de sugestão de estratégia e o componente `StrategySuggestionCard` foram removidos por estarem obsoletos no fluxo atual (estratégia primeiro).
*   **Registro Futuro**: A ideia foi preservada em `docs/BETA_CONSOLIDATION_PLAN.md` para implementação futura como um assistente "Mágico" dentro do formulário.

---

**Ciclo de Refinamento de Prompts de IA v1.0 Concluído com Sucesso.**
Estou pronto para prosseguir para a **Chamada #2: Copywriting de Campanha** assim que você validar esta etapa!
