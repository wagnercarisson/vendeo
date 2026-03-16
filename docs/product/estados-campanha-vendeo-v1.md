# Estados da Campanha - Vendeo v1

Status: Ativo
Versão: 1.0

Este documento define os estados possíveis de uma campanha dentro do sistema Vendeo.

A definição clara de estados evita inconsistências entre frontend, backend e banco de dados.


--------------------------------------------------
1. OBJETIVO DOS ESTADOS
--------------------------------------------------

Estados permitem que o sistema saiba exatamente em que momento do ciclo de vida uma campanha está.

Isso garante:

controle do fluxo
prevenção de bugs
consistência da interface


--------------------------------------------------
2. CICLO DE VIDA DA CAMPANHA
--------------------------------------------------

Uma campanha passa pelos seguintes estados.

draft
generating
generated
editing
approved


Fluxo completo:

draft
 ↓
generating
 ↓
generated
 ↓
editing
 ↓
approved


--------------------------------------------------
3. ESTADO DRAFT
--------------------------------------------------

Significa que a campanha foi criada, mas ainda não teve conteúdo gerado.

Exemplo:

usuário preenche formulário
campanha é salva


Conteúdo ainda não existe.


--------------------------------------------------
4. ESTADO GENERATING
--------------------------------------------------

Indica que o sistema está gerando conteúdo.

Exemplos:

gerando arte
gerando vídeo


Esse estado evita múltiplas gerações simultâneas.


--------------------------------------------------
5. ESTADO GENERATED
--------------------------------------------------

Significa que a campanha já possui conteúdo gerado.

Conteúdos possíveis:

arte
vídeo
copy
legenda


O usuário pode visualizar e iniciar edição.


--------------------------------------------------
6. ESTADO EDITING
--------------------------------------------------

Indica que o usuário está revisando ou modificando o conteúdo.

Possíveis ações:

editar texto
regenerar arte
regenerar vídeo
aprovar conteúdo


--------------------------------------------------
7. ESTADO APPROVED
--------------------------------------------------

Indica que o conteúdo foi aprovado pelo usuário.

A campanha está pronta para uso.


--------------------------------------------------
8. APROVAÇÃO DE CONTEÚDO
--------------------------------------------------

Arte e vídeo podem ser aprovados separadamente.

Exemplo:

Arte ✓
Vídeo •


A campanha só entra em estado final quando todos os conteúdos necessários estiverem aprovados.


--------------------------------------------------
9. TRANSIÇÕES DE ESTADO
--------------------------------------------------

As transições devem seguir regras claras.

draft → generating

generating → generated

generated → editing

editing → approved


Evitar transições fora desse fluxo.


--------------------------------------------------
10. REGENERAÇÃO DE CONTEÚDO
--------------------------------------------------

Quando o usuário solicita regeneração:

estado volta para generating.

Fluxo:

editing
 ↓
generating
 ↓
generated


--------------------------------------------------
11. PRINCÍPIO DOS ESTADOS
--------------------------------------------------

Estados devem ser:

claros
previsíveis
consistentes


Qualquer nova funcionalidade do Vendeo deve respeitar esse fluxo.