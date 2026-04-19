# 🎯 Próximos Passos — Motor V2

**Última atualização:** 2026-04-19  
**FASE 1:** ✅ Concluída  
**Status:** Pronto para FASE 2

---

## 📋 Checklist FASE 1 (Concluída)

- [x] PASSO 1: Criar tabela `visual_signatures`
- [x] PASSO 2: Criar tabela `visual_signature_profiles`
- [x] PASSO 3: Popular visual_signatures com dados de stores
- [x] PASSO 4: Criar 5 profiles padrão para cada loja
- [x] PASSO 5: Adicionar `visual_signature_id` em campaigns
- [x] PASSO 6: Atualizar `database/schema.sql`
- [x] PASSO D: Testes de integração (9/9 passando)
- [x] Commits realizados e push para `intra-motor-visual`
- [x] Documentação consolidada

---

## 🚀 Opções para Continuar

### **OPÇÃO A: PASSO 7 — Definir Regras Visuais Detalhadas** 🎨

**Próximo imediato recomendado**

**Agente:** @ux-design-expert (Uma)  
**Objetivo:** Refinar JSONs de regras de cada context profile  
**Tempo:** 2-3 horas  

**O que fazer:**
1. Ativar @ux-design-expert
2. Passar contexto: "temos 5 context profiles (standard, promotional, seasonal, premium, urgency) com JSONs básicos"
3. Pedir para definir regras detalhadas de cada contexto:
   - Quando usar cada profile
   - Regras específicas de layout (spacing, hierarchy, etc)
   - Regras de tipografia (sizes, weights, alignment)
   - Regras de cor (overlays, gradients, contrasts)
   - Exemplos visuais de cada contexto

**Output esperado:**
- Documento `docs/VISUAL-SIGNATURE-RULES.md` com especificação completa
- Guidelines de uso para cada context type
- Exemplos de aplicação

**Por que fazer agora:**
- Prepara base sólida para FASE 2 (UI)
- Evita retrabalho depois
- Define padrões antes de implementar

---

### **OPÇÃO B: FASE 2 — Implementar UI do Visual Signature Manager** 🚀

**Agentes:** @pm → @sm → @po → @dev → @qa (SDC completo)  
**Objetivo:** Interface para lojista configurar Visual Signatures  
**Tempo:** 1-2 dias  

**Stories a criar:**

**Story 1: Configurar Visual Signature (Core)**
- Lojista pode editar primary_color e secondary_color
- Lojista pode fazer upload/editar logo
- Preview mostra identidade visual

**Story 2: Visualizar Context Profiles**
- Lojista vê os 5 context types
- Cada profile mostra suas regras
- Preview de composição por contexto

**Story 3: Editar Regras de Profile (Avançado)**
- Lojista pode ajustar composition_rules
- Lojista pode ajustar typography_rules
- Lojista pode ajustar color_rules
- Preview atualiza em tempo real

**Story 4: Integrar com Geração de Campanhas**
- Sistema detecta context automaticamente
- Campanhas novas usam Visual Signature
- Preview mostra diferença entre profiles

**Por que fazer agora:**
- Entrega valor direto ao usuário
- Permite validar signatures na prática
- Feedback real para refinar regras

---

### **OPÇÃO C: Integrar Motor de Geração com Visual Signatures** 🔧

**Agentes:** @architect + @dev  
**Objetivo:** Atualizar código de geração para usar novo schema  
**Tempo:** 3-4 horas  

**Tarefas:**
1. Criar service `getVisualSignatureForCampaign(campaign)`
2. Atualizar `renderCampaignArt.ts` para consumir signature
3. Resolver context automaticamente (promotional, urgency, etc)
4. Usar composition_rules do profile no rendering
5. Testar com campanhas reais

**Por que fazer agora:**
- Valida que schema funciona na prática
- Descobre problemas antes da UI
- Permite testar Motor V2 end-to-end

---

### **OPÇÃO D: Criar Documentação de Arquitetura** 📚

**Objetivo:** Documentar decisões técnicas do Motor V2  
**Tempo:** 1 hora  

**Documentos a criar:**
- `docs/architecture/visual-signature-system.md`
- Diagrama de entidades (visual_signatures ↔ profiles ↔ campaigns)
- Fluxo de decisão de contexto
- Estratégia de migração completa (FASE 1 → 4)

**Por que fazer agora:**
- Facilita onboarding de novos desenvolvedores
- Preserva conhecimento arquitetural
- Referência para decisões futuras

---

## 🎯 Recomendação de Sequência

**Para máxima eficiência:**

1. **OPÇÃO A** (PASSO 7) — Definir regras visuais (2-3h)
2. **OPÇÃO C** — Integrar motor de geração (3-4h)
3. **OPÇÃO D** — Documentar arquitetura (1h)
4. **OPÇÃO B** — Implementar UI (1-2 dias com SDC)

**Total:** ~2 dias de trabalho incremental e validado

---

**Para entregar valor rápido:**

1. **OPÇÃO B** — Implementar UI primeiro (1-2 dias)
2. **OPÇÃO A** — Refinar regras com feedback real (2-3h)
3. **OPÇÃO C** — Integrar motor (3-4h)
4. **OPÇÃO D** — Documentar (1h)

---

## 📞 Como Retomar

### **Se escolher OPÇÃO A (PASSO 7):**

```
@ux-design-expert

Contexto: Implementamos Visual Signature System com 5 context profiles (standard, promotional, seasonal, premium, urgency). Cada profile tem 3 JSONs de regras (composition_rules, typography_rules, color_rules) com valores básicos.

Tarefa: Precisamos refinar essas regras com especificações detalhadas. Para cada context profile, defina:
1. Quando usar (casos de uso específicos)
2. Regras detalhadas de layout e composição
3. Regras detalhadas de tipografia
4. Regras detalhadas de cores e overlays
5. Exemplos visuais de aplicação

Output: Documento docs/VISUAL-SIGNATURE-RULES.md com guidelines completas.
```

---

### **Se escolher OPÇÃO B (FASE 2 - UI):**

```
@pm

Contexto: FASE 1 do Motor V2 concluída. Temos infraestrutura de Visual Signatures no banco (9 lojas, 45 profiles, testes passando).

Objetivo: Criar interface para lojista configurar Visual Signature da loja.

Precisamos de epic/stories para:
1. Editar core identity (cores, logo)
2. Visualizar context profiles
3. Preview de composição
4. Integração com geração de campanhas

Seguir SDC completo: @pm → @sm → @po → @dev → @qa
```

---

### **Se escolher OPÇÃO C (Integrar Motor):**

```
@dev

Contexto: Criamos tabelas visual_signatures e visual_signature_profiles. Campanhas têm colunas visual_signature_id e visual_context (default 'standard').

Tarefa: Atualizar motor de geração para usar Visual Signatures.

1. Criar lib/visual-signature/get-signature-for-campaign.ts
2. Atualizar lib/graphics/renderCampaignArt.ts para consumir signature
3. Resolver context automaticamente (detectar se é promotional, urgency, etc)
4. Usar composition_rules do profile no rendering
5. Testar com campanhas reais

Referência: docs/FASE-1-RESUMO.md, database/schema.sql
```

---

## 📚 Documentação de Referência

- `docs/FASE-1-RESUMO.md` — Resumo executivo da FASE 1
- `docs/FASE-1-EXECUCAO.md` — Guia de execução das migrations
- `database/schema.sql` — Schema atualizado (v1.1)
- `database/tests/fase-1-integration-test.sql` — Suite de testes
- `docs/Vendeo - Motor de composição visual .md` — Spec original
- `docs/architecture/visual-reader-spec-v1.md` — Spec do Visual Reader

---

**— @aiox-master (Orion), pronto para próxima fase 🎯**
