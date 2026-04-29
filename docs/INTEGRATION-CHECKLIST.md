# Vendeo — Integration Checklist

**Última Atualização:** 2026-04-29  
**Propósito:** Checklist obrigatório antes de integrar

---

## 📋 CASO 1: Substituir Funcionalidade Existente

**Situação:** Você quer substituir código/módulo por versão nova

**Checklist OBRIGATÓRIO:**

### Antes de Começar
- [ ] Li CAPABILITIES-INVENTORY.md — seção do módulo que vou substituir
- [ ] Listei TODAS as capacidades da versão antiga (campos, funções, outputs)
- [ ] Identifiquei quem CONSOME este módulo (entry points)
- [ ] Verifiquei fluxos afetados em CRITICAL-FLOWS.md

### Durante Desenvolvimento
- [ ] Nova versão mantém TODAS as capacidades antigas
- [ ] Se remover algo: criei adapter/wrapper para retrocompatibilidade
- [ ] Testes unitários da versão antiga passam na nova
- [ ] Criei testes de regressão (RT-*)

### Migration Plan
- [ ] Documentei o que muda (breaking changes)
- [ ] Criei script de migração (se banco de dados)
- [ ] Defini rollback plan
- [ ] Testei rollback

### Antes de Merge
- [ ] Code review aprovado
- [ ] Testes de regressão passam (RT-*)
- [ ] Documentação atualizada (CAPABILITIES-INVENTORY.md)

**Exemplo Real:** Epic 4.1 quase substituiu Visual Reader (18 campos) por versão com 8 campos → BLOQUEADO porque perderia capacidades críticas

---

## 📋 CASO 2: Adicionar Funcionalidade Nova

**Situação:** Criar algo que não existe ainda

**Checklist:**

### Antes de Começar
- [ ] Li CAPABILITIES-INVENTORY.md — verifiquei que NÃO existe
- [ ] Se existe similar: defini como vou reutilizar
- [ ] Identifiquei dependencies (o que preciso consumir)
- [ ] Identifiquei entry points (quem vai me chamar)

### Durante Desenvolvimento
- [ ] Defini contratos claros (TypeScript interfaces)
- [ ] Criei testes unitários
- [ ] Documentei uso (comentários, README)

### Integration
- [ ] Testei com módulos que vão consumir
- [ ] Validei que não quebra nada existente
- [ ] Adicionei à CAPABILITIES-INVENTORY.md (quando criado)

---

## 📋 CASO 3: Modificar Schema/Database

**Situação:** Adicionar/modificar tabelas, campos

**Checklist:**

### Antes de Modificar
- [ ] Consultei `database/schema.sql` — verifiquei estado atual
- [ ] Identifiquei código que usa campos que vou modificar
- [ ] Verifiquei se migration anterior está aplicada

### Migration
- [ ] Criei migration versionada (sequencial)
- [ ] Migration é idempotent (pode rodar 2x sem quebrar)
- [ ] Testei migration em banco local
- [ ] Testei rollback

### Código
- [ ] Atualizei TypeScript types (interfaces)
- [ ] Atualizei Zod schemas (validação)
- [ ] Atualizei queries SQL
- [ ] Testes de integração passam

**CRÍTICO:** Migrations são canonical source (não editar schema.sql diretamente)

---

## 📋 CASO 4: Integrar Novo Agente/Motor

**Situação:** Adicionar agente AIOX ou motor de IA

**Checklist:**

### Definição
- [ ] Defini responsabilidade clara do agente
- [ ] Defini contrato de entrada (input)
- [ ] Defini contrato de saída (output)
- [ ] Documentei em `docs/marketing/MARKETING-SQUAD-AIOX.md` (se agente marketing)

### Dependencies
- [ ] Identifiquei o que agente consome (outros agentes, dados)
- [ ] Identifiquei quem consome agente (entry points)
- [ ] Criei interfaces TypeScript para contratos

### Integration
- [ ] Testei agente isoladamente (unit test)
- [ ] Testei agente com dependências (integration test)
- [ ] Validei que output é usável por consumidores
- [ ] Adicionei métricas de sucesso

**Exemplo:** Squad Marketing (5 agentes) — cada um tem contrato claro

---

## 📋 CASO 5: Modificar Fluxo Crítico

**Situação:** Mudar F1, F2, F3, F4 ou F5 de CRITICAL-FLOWS.md

**Checklist:**

### Antes de Modificar
- [ ] Li CRITICAL-FLOWS.md — seção do fluxo que vou modificar
- [ ] Entendi "O QUE NÃO PODE REGREDIR"
- [ ] Defini testes de regressão para validar

### Durante Desenvolvimento
- [ ] Mantive TODAS as regras de "não pode regredir"
- [ ] Se mudei regra: documentei POR QUÊ e obtive aprovação

### Testes
- [ ] Rodei testes de regressão (RT-*) do fluxo
- [ ] Validei que fluxos dependentes ainda funcionam
- [ ] Testei edge cases

**Exemplo:** Modificar F4 (Validação Produto vs Imagem) sem perder detecção de inconsistências

---

## 🚨 Red Flags — Quando PARAR e Revisar

- 🚩 Você está removendo campos/funções sem migration plan
- 🚩 Testes de regressão falharam e você ignorou
- 🚩 Breaking change sem aprovação de @po ou @architect
- 🚩 Modificação afeta F1-F5 sem consultar CRITICAL-FLOWS.md
- 🚩 Substituição de módulo sem listar capacidades antigas

**Se viu Red Flag:** PARE, volte ao checklist, documente decisão

---

## 🔄 Como Manter Este Documento

**Quando atualizar:**
- Após identificar novo padrão de integração → adicionar CASO 6, 7...
- Após quebrar algo por não seguir checklist → adicionar red flag

**Responsável:** @aiox-master mantém, todos agentes seguem

---

**Status:** ✅ Documento ativo  
**Versão:** 1.0  
**Próxima revisão:** Após cada epic implementado
