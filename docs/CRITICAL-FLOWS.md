# Vendeo — Critical Flows

**Última Atualização:** 2026-04-29  
**Propósito:** Fluxos críticos que não podem regredir

---

## 🎯 Fluxo F1: Criação de Campanha Manual

**Descrição:** Lojista cria campanha do zero (sem Weekly Plan)

**Passos:**
1. Lojista acessa `/dashboard/campaigns/new`
2. Preenche dados: produto, preço, imagem
3. Clica "Gerar Campanha"
4. Sistema gera 3 variações
5. Lojista aprova/edita/regenera
6. Salva como rascunho ou publica

**O QUE NÃO PODE REGREDIR:**
- ✅ Validação de campos obrigatórios (nome, preço, imagem)
- ✅ Geração de texto funcional (headline, body, CTA)
- ✅ Imagem renderizada corretamente
- ✅ Lojista pode editar antes de aprovar
- ✅ Status persiste corretamente (draft → ready)

**Testes de Regressão:**
- **RT-1:** Criar campanha completa fim-a-fim
- **RT-1.1:** Validar campos obrigatórios (tentar salvar sem nome → erro)
- **RT-1.2:** Gerar 3 variações e aprovar uma

---

## 🎯 Fluxo F2: Geração de Conteúdo (IA)

**Descrição:** Sistema gera copy da campanha via IA

**Passos:**
1. Sistema recebe: produto, preço, contexto loja
2. Monta prompt para IA
3. IA gera: headline, body, CTA, hashtags
4. Sistema valida estrutura
5. Retorna para lojista

**O QUE NÃO PODE REGREDIR:**
- ✅ Prompt não pode ser "cego" em relação à imagem
- ✅ Copy deve mencionar produto explicitamente
- ✅ Preço deve aparecer quando há desconto
- ✅ Tone combina com tom da loja
- ✅ CTA não pode ser genérico vazio

**Testes de Regressão:**
- **RT-1:** (compartilhado com F1) — validar copy gerada

---

## 🎯 Fluxo F3: Weekly Plan → Campaigns

**Descrição:** Lojista cria plan semanal, sistema gera campanhas

**Passos:**
1. Lojista cria Weekly Plan
2. Define produtos por dia
3. Sistema gera campanhas automaticamente
4. Lojista aprova/rejeita cada uma
5. Campanhas linkadas ao plan via `weekly_plan_item_id`

**O QUE NÃO PODE REGREDIR:**
- ✅ Link `weekly_plan_item_id` preservado
- ✅ Editar campanha não quebra vínculo com plan
- ✅ Deletar plan não deleta campanhas aprovadas

**Testes de Regressão:**
- **RT-4:** Criar plan → gerar campanhas → validar linkage

---

## 🎯 Fluxo F4: Validação Produto vs Imagem (CRÍTICO)

**Descrição:** Sistema detecta se imagem bate com nome do produto

**Passos:**
1. Lojista digita: "Coca Cola 2L"
2. Lojista faz upload de imagem
3. Visual Reader analisa imagem
4. Sistema compara: `productName` vs `matchedTarget`
5. Se não bater → alerta lojista

**O QUE NÃO PODE REGREDIR:**
- ✅ Visual Reader deve detectar produto na imagem
- ✅ `matchType` deve ser: exact | category_only | none
- ✅ Se `matchType === none` → alerta "Produto não encontrado"
- ✅ Se detectar produto DIFERENTE → alerta "Inconsistência"
- ✅ Exemplo: Digite "Coca" mas imagem é "Pepsi" → ALERTA

**Por Que é Crítico:**
Evita lojista publicar campanha errada (perde credibilidade)

**Testes de Regressão:**
- **RT-2:** Upload imagem Coca + nome "Coca" → match exact
- **RT-3:** Upload imagem Pepsi + nome "Coca" → mismatch alert

---

## 🎯 Fluxo F5: Aprovação e Status

**Descrição:** Estados da campanha (draft → ready → approved)

**Transições Válidas:**
```
draft → ready (após geração)
ready → approved (lojista aprova)
approved → published (se integração ativa)
ready → draft (lojista edita)
```

**O QUE NÃO PODE REGREDIR:**
- ✅ Campanha aprovada não volta para draft sem ação explícita
- ✅ Status granular (post_status, reels_status) funciona
- ✅ Edição de campanha aprovada cria nova versão (não sobrescreve)

**Testes de Regressão:**
- **RT-5:** Validar todas transições de status

---

## 📊 Matriz de Impacto

| Fluxo | Impacto se Regredir | Severidade | Testes |
|-------|---------------------|------------|--------|
| F1 | Lojista não consegue criar campanha | 🔴 CRÍTICO | RT-1 |
| F2 | Copy gerada é inútil/genérica | 🟠 ALTO | RT-1 |
| F3 | Weekly Plan não funciona | 🟡 MÉDIO | RT-4 |
| F4 | Lojista publica campanha errada | 🔴 CRÍTICO | RT-2, RT-3 |
| F5 | Estados ficam inconsistentes | 🟠 ALTO | RT-5 |

---

## 🔄 Como Manter Este Documento

**Quando atualizar:**
- Antes de modificar código que afeta fluxo → ler seção correspondente
- Após adicionar novo fluxo → criar seção F6, F7...
- Após quebrar algo → adicionar teste de regressão

**Responsável:** @dev consulta antes de modificar, @qa valida testes

---

**Status:** ✅ Documento ativo  
**Versão:** 1.0  
**Próxima revisão:** Após cada epic implementado
