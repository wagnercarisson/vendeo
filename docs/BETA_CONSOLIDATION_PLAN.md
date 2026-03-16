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