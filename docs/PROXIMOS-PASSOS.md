# ­ƒÄ» Pr├│ximos Passos ÔÇö Motor V2

**├Ültima atualiza├º├úo:** 2026-04-19  
**FASE 1:** Ô£à Conclu├¡da  
**Status:** Pronto para FASE 2

---

## ­ƒôï Checklist FASE 1 (Conclu├¡da)

- [x] PASSO 1: Criar tabela `visual_signatures`
- [x] PASSO 2: Criar tabela `visual_signature_profiles`
- [x] PASSO 3: Popular visual_signatures com dados de stores
- [x] PASSO 4: Criar 5 profiles padr├úo para cada loja
- [x] PASSO 5: Adicionar `visual_signature_id` em campaigns
- [x] PASSO 6: Atualizar `database/schema.sql`
- [x] PASSO D: Testes de integra├º├úo (9/9 passando)
- [x] Commits realizados e push para `intra-motor-visual`
- [x] Documenta├º├úo consolidada

---

## ­ƒÜÇ Op├º├Áes para Continuar

### **OP├ç├âO A: PASSO 7 ÔÇö Definir Regras Visuais Detalhadas** ­ƒÄ¿

**Pr├│ximo imediato recomendado**

**Agente:** @ux-design-expert (Uma)  
**Objetivo:** Refinar JSONs de regras de cada context profile  
**Tempo:** 2-3 horas  

**O que fazer:**
1. Ativar @ux-design-expert
2. Passar contexto: "temos 5 context profiles (standard, promotional, seasonal, premium, urgency) com JSONs b├ísicos"
3. Pedir para definir regras detalhadas de cada contexto:
   - Quando usar cada profile
   - Regras espec├¡ficas de layout (spacing, hierarchy, etc)
   - Regras de tipografia (sizes, weights, alignment)
   - Regras de cor (overlays, gradients, contrasts)
   - Exemplos visuais de cada contexto

**Output esperado:**
- Documento `docs/VISUAL-SIGNATURE-RULES.md` com especifica├º├úo completa
- Guidelines de uso para cada context type
- Exemplos de aplica├º├úo

**Por que fazer agora:**
- Prepara base s├│lida para FASE 2 (UI)
- Evita retrabalho depois
- Define padr├Áes antes de implementar

---

### **OP├ç├âO B: FASE 2 ÔÇö Implementar UI do Visual Signature Manager** ­ƒÜÇ

**Agentes:** @pm ÔåÆ @sm ÔåÆ @po ÔåÆ @dev ÔåÆ @qa (SDC completo)  
**Objetivo:** Interface para lojista configurar Visual Signatures  
**Tempo:** 1-2 dias  

**Stories a criar:**

**Story 1: Configurar Visual Signature (Core)**
- Lojista pode editar primary_color e secondary_color
- Lojista pode fazer upload/editar logo
- Preview mostra identidade visual

**Story 2: Visualizar Context Profiles**
- Lojista v├¬ os 5 context types
- Cada profile mostra suas regras
- Preview de composi├º├úo por contexto

**Story 3: Editar Regras de Profile (Avan├ºado)**
- Lojista pode ajustar composition_rules
- Lojista pode ajustar typography_rules
- Lojista pode ajustar color_rules
- Preview atualiza em tempo real

**Story 4: Integrar com Gera├º├úo de Campanhas**
- Sistema detecta context automaticamente
- Campanhas novas usam Visual Signature
- Preview mostra diferen├ºa entre profiles

**Por que fazer agora:**
- Entrega valor direto ao usu├írio
- Permite validar signatures na pr├ítica
- Feedback real para refinar regras

---

### **OP├ç├âO C: Integrar Motor de Gera├º├úo com Visual Signatures** ­ƒöº

**Agentes:** @architect + @dev  
**Objetivo:** Atualizar c├│digo de gera├º├úo para usar novo schema  
**Tempo:** 3-4 horas  

**Tarefas:**
1. Criar service `getVisualSignatureForCampaign(campaign)`
2. Atualizar `renderCampaignArt.ts` para consumir signature
3. Resolver context automaticamente (promotional, urgency, etc)
4. Usar composition_rules do profile no rendering
5. Testar com campanhas reais

**Por que fazer agora:**
- Valida que schema funciona na pr├ítica
- Descobre problemas antes da UI
- Permite testar Motor V2 end-to-end

---

### **OP├ç├âO D: Criar Documenta├º├úo de Arquitetura** ­ƒôÜ

**Objetivo:** Documentar decis├Áes t├®cnicas do Motor V2  
**Tempo:** 1 hora  

**Documentos a criar:**
- `docs/architecture/visual-signature-system.md`
- Diagrama de entidades (visual_signatures Ôåö profiles Ôåö campaigns)
- Fluxo de decis├úo de contexto
- Estrat├®gia de migra├º├úo completa (FASE 1 ÔåÆ 4)

**Por que fazer agora:**
- Facilita onboarding de novos desenvolvedores
- Preserva conhecimento arquitetural
- Refer├¬ncia para decis├Áes futuras

---

## ­ƒÄ» Recomenda├º├úo de Sequ├¬ncia

**Para m├íxima efici├¬ncia:**

1. **OP├ç├âO A** (PASSO 7) ÔÇö Definir regras visuais (2-3h)
2. **OP├ç├âO C** ÔÇö Integrar motor de gera├º├úo (3-4h)
3. **OP├ç├âO D** ÔÇö Documentar arquitetura (1h)
4. **OP├ç├âO B** ÔÇö Implementar UI (1-2 dias com SDC)

**Total:** ~2 dias de trabalho incremental e validado

---

**Para entregar valor r├ípido:**

1. **OP├ç├âO B** ÔÇö Implementar UI primeiro (1-2 dias)
2. **OP├ç├âO A** ÔÇö Refinar regras com feedback real (2-3h)
3. **OP├ç├âO C** ÔÇö Integrar motor (3-4h)
4. **OP├ç├âO D** ÔÇö Documentar (1h)

---

## ­ƒô× Como Retomar

### **Se escolher OP├ç├âO A (PASSO 7):**

```
@ux-design-expert

Contexto: Implementamos Visual Signature System com 5 context profiles (standard, promotional, seasonal, premium, urgency). Cada profile tem 3 JSONs de regras (composition_rules, typography_rules, color_rules) com valores b├ísicos.

Tarefa: Precisamos refinar essas regras com especifica├º├Áes detalhadas. Para cada context profile, defina:
1. Quando usar (casos de uso espec├¡ficos)
2. Regras detalhadas de layout e composi├º├úo
3. Regras detalhadas de tipografia
4. Regras detalhadas de cores e overlays
5. Exemplos visuais de aplica├º├úo

Output: Documento docs/VISUAL-SIGNATURE-RULES.md com guidelines completas.
```

---

### **Se escolher OP├ç├âO B (FASE 2 - UI):**

```
@pm

Contexto: FASE 1 do Motor V2 conclu├¡da. Temos infraestrutura de Visual Signatures no banco (9 lojas, 45 profiles, testes passando).

Objetivo: Criar interface para lojista configurar Visual Signature da loja.

Precisamos de epic/stories para:
1. Editar core identity (cores, logo)
2. Visualizar context profiles
3. Preview de composi├º├úo
4. Integra├º├úo com gera├º├úo de campanhas

Seguir SDC completo: @pm ÔåÆ @sm ÔåÆ @po ÔåÆ @dev ÔåÆ @qa
```

---

### **Se escolher OP├ç├âO C (Integrar Motor):**

```
@dev

Contexto: Criamos tabelas visual_signatures e visual_signature_profiles. Campanhas t├¬m colunas visual_signature_id e visual_context (default 'standard').

Tarefa: Atualizar motor de gera├º├úo para usar Visual Signatures.

1. Criar lib/visual-signature/get-signature-for-campaign.ts
2. Atualizar lib/graphics/renderCampaignArt.ts para consumir signature
3. Resolver context automaticamente (detectar se ├® promotional, urgency, etc)
4. Usar composition_rules do profile no rendering
5. Testar com campanhas reais

Refer├¬ncia: docs/FASE-1-RESUMO.md, database/schema.sql
```

---

## ­ƒôÜ Documenta├º├úo de Refer├¬ncia

- `docs/FASE-1-RESUMO.md` ÔÇö Resumo executivo da FASE 1
- `docs/FASE-1-EXECUCAO.md` ÔÇö Guia de execu├º├úo das migrations
- `database/schema.sql` ÔÇö Schema atualizado (v1.1)
- `database/tests/fase-1-integration-test.sql` ÔÇö Suite de testes
- `docs/Vendeo - Motor de composi├º├úo visual .md` ÔÇö Spec original
- `docs/architecture/visual-reader-spec-v1.md` ÔÇö Spec do Visual Reader

---

**ÔÇö @aiox-master (Orion), pronto para pr├│xima fase ­ƒÄ»**
