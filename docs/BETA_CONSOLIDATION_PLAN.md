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

Status: ⬜

---

# Dia 3 — Baseline do Banco

Objetivo: consolidar migrations como fonte oficial.

Tarefas:

- Criar migration baseline
- Reorganizar pasta migrations
- Gerar snapshot do schema

Status: ⬜

---

# Dia 4 — Auditoria Temporal

Objetivo: padronizar timestamps.

Tarefas:

- Adicionar updated_at
- Padronizar timestamptz

Status: ⬜

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