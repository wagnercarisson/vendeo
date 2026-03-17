# Vendeo — Beta Consolidation Plan

## Objetivo

Consolidar a base técnica do Vendeo antes da liberação do beta.

Meta: transformar o projeto de "MVP funcional" para "produto SaaS sólido".

---

# Cronograma

Dia 1 — Modelo de Loja  
Dia 2 — Status do Domínio  
Dia 3 — Baseline e Migrations  
Dia 4 — Auditoria Temporal  
Dia 5 — Semântica de Imagens  
Dia 6 — Segurança e Storage  
Dia 7 — Documentação Final

---

# Dia 1 — Modelo de Loja

Objetivo: eliminar inconsistências entre banco e código.

Tarefas:

- Confirmar modelo owner-based
- Revisar queries usando store_members
- Garantir que getUserStoreId use stores.owner_user_id
- Revisar políticas RLS

Status: ✅

✅ Dia 1 — Consolidação do Modelo de Loja (Owner-Based)

Status: CONCLUÍDO
Data: Beta Consolidation Phase

Decisão Arquitetural

Para a fase beta do Vendeo, o sistema utiliza modelo owner-based puro para resolução de loja.

A tabela stores é a fonte única de verdade para posse da loja.

stores.owner_user_id → usuário proprietário da loja

Toda resolução de loja no sistema deve seguir esta regra.

Motivo da Decisão

O modelo owner-based foi escolhido para o beta porque:

reduz complexidade de autorização

elimina joins desnecessários

diminui risco de bugs de acesso

simplifica RLS

acelera desenvolvimento da versão inicial

Tabela store_members

A tabela store_members permanece no schema, mas não é utilizada operacionalmente no beta.

Ela está reservada para uma evolução futura do produto que permitirá:

múltiplas lojas por usuário

múltiplos usuários por loja

papéis de acesso (admin, editor, etc)

Enquanto isso não for implementado:

store_members = estrutura futura (não utilizada no fluxo atual)
Regras Técnicas do Beta

Durante a fase beta, todas as operações relacionadas à loja devem seguir:

Resolução de loja

SELECT id
FROM stores
WHERE owner_user_id = auth.uid()

Onboarding

Ao criar uma loja:

INSERT INTO stores (..., owner_user_id)
VALUES (..., user.id)
Funções Consolidadas

As funções responsáveis por resolver a loja do usuário foram padronizadas:

getUserStoreIdOrThrow()

getUserPrimaryStoreId()

Ambas agora utilizam:

stores.owner_user_id
Políticas RLS

As políticas de acesso seguem a mesma regra de ownership:

stores → owner_user_id
campaigns → store.owner_user_id
weekly_plans → store.owner_user_id
weekly_plan_items → weekly_plan.store.owner_user_id
Regra de Desenvolvimento

Durante o beta:

❌ Não criar novas queries utilizando store_members.

✔ Sempre resolver acesso à loja via:

stores.owner_user_id
Evolução Planejada

O suporte completo a multi-store / multi-user será introduzido em uma fase futura do produto.

Quando isso acontecer:

store_members passará a ser a tabela principal de acesso

owner_user_id poderá tornar-se apenas um atalho para o proprietário

Essa migração será planejada em uma fase posterior.

---

🔒 Preparação para Dia 2 — Auditoria de Segurança de Rotas

Com a consolidação do modelo owner-based finalizada no Dia 1, o próximo passo da fase beta é garantir isolamento total de dados entre lojas.

Durante o desenvolvimento inicial do produto, algumas rotas utilizam Supabase service role para executar operações privilegiadas (ex.: criação de loja, geração de conteúdo, inserções internas).

Embora isso seja necessário em alguns fluxos, o uso de service role pode ignorar políticas RLS, o que exige validação manual no backend.

Risco Potencial

Uma rota que utilize service role e aceite store_id vindo do cliente pode permitir acesso a dados de outra loja caso não haja verificação adicional.

Exemplo de cenário inseguro:

Cliente envia store_id → API usa service role → operação executada sem verificar ownership

Se isso ocorrer, um usuário poderia teoricamente operar sobre recursos pertencentes a outra loja.

Regra de Segurança do Backend

Toda rota que:

utilize service role

execute operações relacionadas a lojas

receba ou manipule store_id

deve obrigatoriamente seguir este fluxo:

Obter o usuário autenticado.

Resolver a loja real no servidor:

SELECT id
FROM stores
WHERE owner_user_id = auth.uid()

Utilizar essa loja resolvida no servidor como fonte de verdade.

Regra Importante
store_id enviado pelo cliente nunca deve ser considerado fonte de verdade.

Ele pode ser usado como hint ou validado, mas a autoridade sempre deve vir do servidor.

Objetivo do Dia 2

Auditar todas as rotas app/api para garantir que:

nenhuma operação privilegiada dependa de store_id enviado pelo cliente

todas as rotas que usam service role validem ownership corretamente

o isolamento entre lojas esteja garantido mesmo com bypass de RLS

Resultado Esperado

Ao final do Dia 2 o sistema terá:

isolamento seguro entre lojas

rotas privilegiadas protegidas

menor risco de vazamento de dados

arquitetura consistente entre frontend, API e banco

Status do Plano
Dia 1 — Modelo de Loja        ✅ Concluído
Dia 2 — Segurança de Rotas    ▶ Em execução
Dia 3 — Fluxo de Campanha     ⏳ Planejado
Dia 4 — Geração de Conteúdo   ⏳ Planejado
Dia 5 — UI / UX Final         ⏳ Planejado

# Dia 2 — Status do Domínio

Objetivo: criar contrato único de status.

Tarefas:

- Definir status finais de campaigns
- Definir status finais de weekly_plans
- Criar migration de constraint ou enum

Status: ✅

Execução Realizada — Dia 2 (2026-03-16)

Nesta etapa foi realizada uma auditoria completa das rotas da API do Vendeo com foco em segurança antes da liberação da beta privada.

O objetivo foi garantir que nenhuma rota permitisse:

redirecionamento externo

acesso entre lojas diferentes

fetch remoto arbitrário

payloads inválidos

abuso de endpoints de geração de IA

1. Correção de Open Redirect no fluxo de login

Foi identificado que o parâmetro next no fluxo de autenticação poderia aceitar URLs externas.

Exemplo potencial de abuso:

/auth/callback?next=https://evil.com

Foi implementado um sanitizador centralizado:

lib/security/sanitizeNextPath.ts

Regras aplicadas:

aceitar apenas paths internos iniciando com /

bloquear:

http://

https://

//

javascript:

backslash

null byte

CR/LF

Fallback seguro:

/dashboard

Arquivos atualizados:

app/auth/callback/route.ts
app/login/LoginClient.tsx

2. Proteção de ownership em weekly strategy

A rota

/api/generate/weekly-strategy

utilizava supabaseAdmin e aceitava store_id vindo do cliente.

Isso poderia permitir tentativa de execução para lojas de outros usuários.

Foi implementado um ownership check explícito:

validar autenticação

obter userId

consultar a loja no banco

garantir que

store.owner_user_id === userId

Caso contrário a rota retorna:

403 FORBIDDEN

Arquivo alterado:

app/api/generate/weekly-strategy/route.ts

3. Hardening da rota de geração de OG Image

A rota

/api/generate/og-image

permitia fetch remoto arbitrário de imagens.

Isso poderia ser explorado para:

SSRF

proxy arbitrário

abuso de infraestrutura

Foi implementada uma allowlist:

apenas imagens provenientes do Supabase Storage do projeto são aceitas.

Host permitido:

NEXT_PUBLIC_SUPABASE_URL

Paths permitidos:

/storage/v1/object/public/
/storage/v1/render/image/public/

Proteções adicionais:

limite de download de imagem

timeout de fetch

validação de content-type

4. Hardening da rota de strategy de campanha

A rota

/api/generate/campaign/strategy

foi reforçada com validação de payload via Zod.

Foram adicionados:

schema obrigatório

limite de tamanho de campos

normalização de strings antes do prompt

Objetivo: evitar payload excessivo, prompt injection e consumo desnecessário de IA.

5. Validação manual executada

Os seguintes testes foram realizados manualmente via DevTools.

Open redirect:

/auth/callback?next=https://evil.com

Resultado: redirect externo bloqueado.

Weekly strategy normal:

Resultado: 200 OK.

Weekly strategy com store inválida:

Resultado: 403 FORBIDDEN.

OG image com imagem do Supabase:

Resultado: 200 OK.

OG image com imagem externa:

Resultado: 400 (imageUrl not allowed).

Conclusão do Dia 2

A camada de rotas do Vendeo passou a operar com:

validação explícita de redirects

verificação de ownership de loja

bloqueio de fetch arbitrário

validação de payload nas rotas críticas

Isso reduz significativamente riscos de segurança antes da liberação do beta.

Status da etapa:

Dia 2 — CONCLUÍDO COM SUCESSO

Status do Plano
Dia 1 — Modelo de Loja        ✅ Concluído
Dia 2 — Segurança de Rotas    ✅ Concluído
Dia 3 — Fluxo de Campanha     ▶ Em execução
Dia 4 — Geração de Conteúdo   ⏳ Planejado
Dia 5 — UI / UX Final         ⏳ Planejado

---

# Dia 3 — Baseline do Banco

Objetivo: consolidar migrations como fonte oficial.

Tarefas:

- Criar migration baseline
- Reorganizar pasta migrations
- Gerar snapshot do schema

Status: ✅ Concluído

### Dia 3 — Fluxo de Campanha e Plano Semanal (Concluído)

Consolidação completa do fluxo de planejamento semanal e execução de campanhas.

Principais ajustes realizados:

- Restauração do Weekly Plan Wizard (3 etapas):
  1. Configuração da semana
  2. Revisão da estratégia
  3. Execução do plano

- Correção da persistência de status do plano e dos itens:
  - weekly_plans.status
  - weekly_plan_items.status

- Implementação do fluxo real de aprovação do plano:
  - Aprovação atualiza weekly_plans.status = "approved"
  - Aprovação atualiza weekly_plan_items.status = "approved"

- Correção de inconsistências entre UI e banco de dados:
  - vínculo correto: weekly_plan_items.plan_id

- Remoção de heurística aleatória de horários no plano semanal.

- Estabilização da execução do plano:
  - criação de campanha a partir do item
  - geração de texto
  - geração de reels
  - atualização automática da UI após geração

Resultado:

O fluxo completo agora funciona de forma consistente:

Planejamento semanal → geração de estratégia → geração do plano → execução → aprovação.

Esse bloco elimina inconsistências entre:

campaigns  
weekly_plans  
weekly_plan_items  
UI de execução do plano.

Nota: Durante a consolidação foi confirmada a estrutura final do vínculo entre plano e itens:

weekly_plans.id → weekly_plan_items.plan_id

Status do Plano
Dia 1 — Modelo de Loja        ✅ Concluído
Dia 2 — Segurança de Rotas    ✅ Concluído
Dia 3 — Fluxo de Campanha     ✅ Concluído
Dia 4 — Geração de Conteúdo   ▶ Em execução
Dia 5 — UI / UX Final         ⏳ Planejado

---

# Dia 4 — Auditoria Temporal

Objetivo: padronizar timestamps.

Tarefas:

- Adicionar updated_at
- Padronizar timestamptz

Status: ✅ Concluído

### ✅ Dia 4 — Hardening Pré-Beta (Concluído)

Objetivo: eliminar inconsistências que aparecem apenas em uso real do sistema, principalmente nos fluxos de criação, geração de conteúdo com IA, aprovação e persistência de campanhas.

Principais melhorias implementadas:

• Hardening do fluxo de criação de campanha (`/campaigns/new`)
- Aprovação bloqueada quando conteúdo obrigatório não está completo.
- Falhas de geração de conteúdo, especialmente reels, deixam de ser silenciosas.
- Preview de campanha isolado do banco utilizando `persist: false`.

• Correção semântica dos estados de campanha
- `draft` → campanha em construção
- `ready` → conteúdo gerado e revisável
- `approved` → campanha final aprovada pelo usuário

A interface deixa de tratar `ready` como estado final, evitando inconsistência entre geração e aprovação.

• Validação forte nas rotas de geração de IA
- Contratos de entrada reforçados com Zod.
- Remoção de dependência de payloads não tipados.
- Controle mais seguro do parâmetro `persist`.

• Correção estrutural do pipeline de arte final
A geração da arte final passou a ser feita no navegador via Canvas, com exportação em PNG antes do upload para o bucket. Isso eliminou falhas observadas com imagens `.webp` e melhorou a compatibilidade geral da composição final.

Fluxo final da arte:
Preview → Renderização Canvas → Exportação PNG → Upload → `image_url`

• Separação definitiva entre imagem de produto e arte final
- `product_image_url` permanece como foto do produto.
- `image_url` passa a representar exclusivamente a arte final aprovada.

• Hardening de infraestrutura para deploy
- Lazy init aplicado ao client admin do Supabase.
- Lazy init aplicado ao client OpenAI.
- Redução do risco de falhas por import-time initialization durante build/deploy.

Resultado do hardening:
- Criação de campanha mais robusta.
- Aprovação mais segura.
- Geração de arte final confiável para `.webp`, `.jpg` e `.png`.
- Maior consistência entre preview, persistência e exibição no dashboard.
- Deploy estabilizado após eliminação dos pontos sensíveis de inicialização.

Status: **Dia 4 concluído com sucesso.**

Status do Plano
Dia 1 — Modelo de Loja        ✅ Concluído
Dia 2 — Segurança de Rotas    ✅ Concluído
Dia 3 — Fluxo de Campanha     ✅ Concluído
Dia 4 — Geração de Conteúdo   ✅ Concluído
Dia 5 — UI / UX Final         ⏳ Planejado
Dia 6 — Segurança             ⏳ Planejado
Dia 7 — Fechamento            ⏳ Planejado

---

# Dia 5 — Semântica de Imagens

Objetivo: formalizar uso de imagens.

Tarefas:

- Confirmar papel de product_image_url
- Confirmar papel de image_url
- Auditar código

Status: ⬜

---

# Dia 6 — Segurança

Objetivo: reforçar segurança e governança.

Tarefas:

- Revisar RLS
- Revisar bucket de imagens
- Padronizar paths de upload

Status: ⬜

---

# Dia 7 — Fechamento

Objetivo: finalizar consolidação.

Tarefas:

- Atualizar schema.sql
- Criar documentação do banco
- Auditoria final

Status: ⬜