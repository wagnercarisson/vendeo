# Documentação do Vendeo

Esta pasta contém a documentação estrutural do projeto Vendeo.

Os documentos aqui presentes definem arquitetura, produto, fluxo de geração, regras de UX e decisões fundamentais do sistema.

Esta documentação deve servir como referência para evolução futura do projeto.


--------------------------------------------------
VISÃO GERAL
--------------------------------------------------

O Vendeo é um motor de geração de campanhas para lojas físicas.

Seu objetivo é permitir que comerciantes criem conteúdos de marketing rapidamente para redes sociais.

O sistema transforma produtos e serviços em campanhas completas contendo:

arte
vídeo
legenda
copy
CTA
hashtags


--------------------------------------------------
ESTRUTURA DA DOCUMENTAÇÃO
--------------------------------------------------

A documentação está dividida em duas áreas principais.

product
architecture


product descreve decisões de produto e experiência do usuário.

architecture descreve a estrutura técnica do sistema.


--------------------------------------------------
DOCUMENTOS DE PRODUTO
--------------------------------------------------

product/fluxo-oficial-vendeo-v1.md

Fluxo principal do produto Vendeo.


product/diagrama-fluxo-vendeo-v1.md

Diagrama visual do funcionamento do sistema.


product/fluxo-definitivo-criacao-campanha-vendeo-v1.md

Fluxo completo de criação de campanhas.


product/regras-geracao-conteudo-vendeo-v1.md

Regras estratégicas para geração de conteúdo.


product/padroes-ux-vendeo-v1.md

Padrões de experiência do usuário.


product/mapa-decisoes-produto-vendeo-v1.md

Registro das principais decisões estruturais do produto.


--------------------------------------------------
DOCUMENTOS DE ARQUITETURA
--------------------------------------------------

architecture/arquitetura-geral-vendeo-v1.md

Visão geral da arquitetura do sistema.


architecture/arquitetura-alvo-vendeo-v2.md

Arquitetura-alvo oficial para a nova fase do Vendeo, com bounded contexts, contratos entre motores, fontes de verdade, estratégia de persistência e plano de migração do legado.


architecture/mapa-sistema-vendeo-v1.md

Mapa estrutural completo do sistema.


architecture/campaign-engine-vendeo-v1.md

Definição da entidade central do sistema: campanha.


architecture/motor-ia-vendeo-v1.md

Arquitetura do motor de geração de conteúdo com IA.


architecture/fluxo-api-geracao-vendeo-v1.md

Funcionamento das APIs de geração de conteúdo.


architecture/contrato-dados-ia-vendeo-v1.md

Contrato de dados entre backend e IA.


architecture/dados-e-entidades-vendeo-v1.md

Definição das entidades de dados do sistema.


architecture/estados-campanha-vendeo-v1.md

Definição dos estados da campanha no sistema.


--------------------------------------------------
PRINCÍPIOS DO PROJETO
--------------------------------------------------

O desenvolvimento do Vendeo deve seguir três princípios principais.

Simplicidade

O sistema deve ser fácil de usar e fácil de manter.


Clareza

Fluxos e responsabilidades devem ser bem definidos.


Consistência

Todas as novas funcionalidades devem respeitar as decisões registradas nesta documentação.


--------------------------------------------------
REGRA DE OURO DO BANCO DE DADOS
--------------------------------------------------

Toda alteração no banco de dados deve gerar uma migration versionada antes de ser aplicada.


--------------------------------------------------
EVOLUÇÃO DA DOCUMENTAÇÃO
--------------------------------------------------

Sempre que novas funcionalidades forem adicionadas ao sistema, a documentação correspondente deve ser atualizada.

Isso garante que o projeto permaneça compreensível e sustentável ao longo do tempo.