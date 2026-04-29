Walkthrough — Refinamentos de UI / UX e Semântica de Status (Dia 5)
Este documento resume as melhorias implementadas para garantir a integridade do fluxo de aprovação de campanhas e a clareza da experiência do lojista na Dashboard.

1. Novo Status: "Aguardando Aprovação" (Âmbar)
Problema: Campanhas com conteúdo gerado (arte/roteiro), mas não formalmente aprovadas, eram exibidas como "Prontas" (Verde), confundindo o usuário e o status do Plano Semanal.
Implementação: Criado o estado lógico pending (Aguardando Aprovação). Agora, campanhas nesse estado exibem um badge âmbar em vez de verde.
Sincronização: O Plano Semanal agora reflete fielmente esse estado: o item só é marcado como "Campanha Pronta" após a aprovação do lojista.
2. Refinamento de Navegação (Draft → Edit)
Botão "Abrir" Inteligente: Modificamos o comportamento do botão "Abrir" (na lista de campanhas e no plano). Para rascunhos ou campanhas pendentes, ele agora redireciona automaticamente para o modo de edição (?mode=edit).
Foco no Workflow: Os botões de visualização direta ("Ver Arte" / "Ver Vídeo") foram ocultados para campanhas não aprovadas. Isso guia o usuário para o editor, onde ele deve revisar e aprovar o conteúdo.
3. Botão "Aprovar e Salvar" no Editor
Workflow Agilizado: Adicionamos o botão "Aprovar e salvar" (verde) no topo direito do formulário de edição de campanha.
Validação: O botão fica desabilitado (verde suave via opacidade) se campos obrigatórios estiverem ausentes, permitindo que o usuário identifique pendências antes de finalizar.
Resultado: O lojista agora pode ajustar o script sugerido pela IA e aprovar a campanha em uma única tela, sem precisar navegar para o fluxo de revisão.
4. Consolidação de Terminologia na Dashboard
Métricas: O card "Conteúdo IA" foi renomeado para "Artes" (plural) para clareza e alinhamento com os termos usados nas outras telas.
Subtítulo: Ajustado para "Legendas/Copies criadas", fornecendo contexto técnico para a métrica de 30 dias.
Identidade Visual: Padronizada a cor de botões desabilitados para manter a harmonia visual em todas as páginas de gestão.
5. Herança de Contexto (Dica de IA → Wizard)
Inteligência de Origem: As dicas dinâmicas da dashboard (baseadas em clima/hora) agora transmitem sua "intenção". Se a dica sugere um "Vídeo Curto", o link de criação já carrega essa opção pré-selecionada.
Flexibilidade: A herança funciona como um facilitador (ponto de partida sugerido), mas o usuário mantém controle total para alterar o objetivo ou formato da campanha se desejar.