# Briefing para @analyst — Marketing Briefing Research

**Data:** 2026-05-06  
**Solicitante:** @aiox-master  
**Contexto:** DEC-2026-05-06-001 (Arquitetura de Informação — Onboarding vs Intelligence)  
**Urgência:** MÉDIA (bloqueia decisão arquitetural)

---

## 🎯 OBJETIVO DA PESQUISA

Validar se a arquitetura de informação do Vendeo (onboarding básico + intelligence progressiva) está alinhada com **práticas reais de briefing de agências de marketing**.

**Pergunta central:**
> Como agências de marketing profissionais abordam clientes de varejo físico local (adega, farmácia, mercearia) para criar campanhas? Quais informações são coletadas na primeira sessão vs. calibração contínua?

---

## 📋 CONTEXTO DO PROBLEMA

### Situação Atual

**Vendeo tem 2 camadas de captura de contexto:**

1. **Onboarding Básico (stores table)** — Meta: ≤5 min
   - Nome, localização, segmento, tom de voz, diferencial
   - Objetivo: Lojista cria primeira campanha rapidamente

2. **Intelligence Progressiva (store_intelligence table)** — Calibração ao longo do tempo
   - 15 campos detalhados: público-alvo, USP estruturado, sazonalidade, concorrentes, gatilhos de conversão
   - Objetivo: Melhorar qualidade de 70% → 95% conforme calibração

### Problema Identificado

**Usuário levantou questões críticas:**
1. **Tom de voz duplicado:** Captamos no onboarding E na intelligence — qual é fonte da verdade?
2. **Diferencial duplicado:** Onboarding tem texto livre, intelligence tem estruturado (USP + prova)
3. **Segmentação flat:** "Loja de bebidas" não diferencia Adega (premium) vs. Distribuidora (B2B) vs. Loja de bebidas (conveniência)
4. **Gaps potenciais:** O que agências SEMPRE perguntam na primeira sessão que NÓS não estamos captando?

---

## 🔍 PERGUNTAS DE PESQUISA (PRIORITÁRIAS)

### 1. Framework de Briefing Tradicional

**Pesquisar:**
- Frameworks padrão de briefing: Creative Brief, Marketing Brief, Campaign Brief
- Modelos de agências brasileiras e internacionais (Ogilvy, Wieden+Kennedy, AlmapBBDO, África)
- Questionários/templates reais usados em primeira sessão com cliente

**Pergunta específica:**
> Quais são as 5-10 perguntas CRÍTICAS que uma agência faz na primeira sessão com um cliente de varejo local (adega, farmácia, restaurante)?

---

### 2. Abordagem para Varejo Físico Local

**Pesquisar:**
- Como agências abordam clientes LOCAIS (pequeno/médio porte) vs. grandes marcas?
- Diferenças entre briefing para e-commerce vs. varejo físico
- Especificidades de segmentos (bebidas, farmácia, moda, alimentar)

**Pergunta específica:**
> Uma adega em Ibirama/SC chama uma agência. O que a agência PRECISA saber para criar campanhas coerentes? Quais perguntas são feitas?

---

### 3. Primeira Sessão vs. Calibração Contínua

**Pesquisar:**
- O que é capturado no kick-off (sessão 1) vs. o que é refinado ao longo do tempo?
- Como agências facilitam o preenchimento inicial? (workshop presencial, questionário assíncrono, entrevista estruturada?)
- Quanto tempo leva o briefing inicial típico?

**Pergunta específica:**
> Como agências diferenciam "informações críticas para começar" vs. "informações que vamos aprender trabalhando juntos"?

**Hipótese a validar:**
- Nossa abordagem (onboarding rápido ≤5 min + intelligence progressiva) espelha o modelo de agências?
- Ou agências exigem briefing completo ANTES de criar primeira campanha? (fricção alta)

---

### 4. Fricção e Facilitação

**Pesquisar:**
- Como agências reduzem fricção no preenchimento? (exemplos, dropdowns, perguntas abertas vs. fechadas)
- Ferramentas/técnicas usadas: workshop facilitado, questionário online, entrevista presencial
- Taxa de desistência ou dificuldade relatada por clientes no briefing

**Pergunta específica:**
> Lojistas têm dificuldade em responder briefings de agências? Quais perguntas são mais difíceis? Como agências ajudam?

---

### 5. Gap Analysis — O Que Estamos Perdendo?

**Pesquisar:**
- Campos que agências SEMPRE captam mas Vendeo não (ou capta apenas na intelligence)
- Campos que Vendeo capta mas agências consideram secundários

**Perguntas específicas:**
1. **Objetivo da campanha:** Agências perguntam "Você quer vender mais, trazer novo público, ou reforçar marca?" — Vendeo assume "vender mais". Isso é válido?
2. **Perfil do cliente:** Agências perguntam "Quem é seu cliente típico?" na sessão 1? Ou isso é refinado depois?
3. **Concorrentes:** Perguntar concorrentes no onboarding básico é crítico? Ou pode ser capturado depois?
4. **Ticket médio:** Agências captam isso na sessão 1 ou depois?

---

## 📦 DELIVERABLES ESPERADOS

### 1. Documento: "Briefing de Agência vs. Onboarding Vendeo — Gap Analysis"

**Estrutura sugerida:**
```markdown
# Briefing de Agência vs. Onboarding Vendeo — Gap Analysis

## 1. Framework de Briefing Tradicional
- Modelos pesquisados (Ogilvy, AlmapBBDO, etc)
- Template típico de primeira sessão

## 2. Perguntas Críticas (Sessão 1)
- Lista de 5-10 perguntas que agências SEMPRE fazem
- Classificação: CRÍTICO (sem isso, não cria campanha) vs. IMPORTANTE (melhora qualidade)

## 3. Abordagem para Varejo Local
- Como agências facilitam briefing para lojistas (não publicitários)
- Tempo médio do briefing inicial
- Taxa de fricção/dificuldade relatada

## 4. Calibração Contínua
- O que é refinado ao longo do tempo vs. capturado no kick-off
- Como agências aprendem sobre o cliente trabalhando juntos

## 5. Gap Analysis
- Tabela comparativa: Agência Tradicional | Vendeo Onboarding | Vendeo Intelligence | Status
- Gaps críticos identificados (campos que agências SEMPRE captam mas Vendeo não)
- Campos redundantes (Vendeo capta mas agências consideram secundários)

## 6. Recomendações
- 3 ajustes críticos no onboarding básico
- 2 campos para adicionar/remover
- Validação da estratégia "onboarding rápido + intelligence progressiva"
```

---

### 2. Tabela Comparativa (Excel ou Markdown)

| Campo | Agência Tradicional | Quando Capta | Vendeo Atual | Status | Recomendação |
|-------|---------------------|--------------|--------------|--------|--------------|
| Nome da loja | ✅ Sempre (sessão 1) | Kick-off | ✅ Onboarding | ✅ OK | Manter |
| Localização | ✅ Sempre (sessão 1) | Kick-off | ✅ Onboarding | ✅ OK | Manter |
| Segmento | ✅ Sempre (sessão 1) | Kick-off | ✅ Onboarding (flat) | ⚠️ Sem hierarquia | Adicionar subcategoria? |
| Perfil do cliente | ? | ? | ✅ Intelligence (opcional) | ? | ? |
| Tom de voz | ? | ? | ✅ Onboarding + Intelligence | 🔴 Duplicado | Captar APENAS em...? |
| ... | ... | ... | ... | ... | ... |

---

### 3. Recomendações Priorizadas

**Formato:**
```markdown
## Recomendações Críticas (P0)
1. [Recomendação 1 com rationale]
2. [Recomendação 2 com rationale]

## Recomendações Importantes (P1)
1. [...]

## Considerações Adicionais (P2)
1. [...]
```

---

## 🎯 ESCOPO E CONSTRAINTS

### In-Scope (Pesquisar)
- ✅ Agências brasileiras e internacionais
- ✅ Clientes de varejo físico local (pequeno/médio porte)
- ✅ Segmentos: bebidas, farmácia, moda, alimentar, restaurante
- ✅ Briefing inicial (kick-off) vs. calibração contínua
- ✅ Ferramentas/técnicas de facilitação

### Out-of-Scope (NÃO pesquisar)
- ❌ Grandes marcas nacionais (Coca-Cola, Ambev) — não é nosso público
- ❌ E-commerce puro (Amazon, Mercado Livre) — foco é varejo físico
- ❌ Agências especializadas em digital ads (Google Ads, Meta Ads) — foco é conteúdo social
- ❌ Pricing/contratos de agências — não relevante para Vendeo

---

## 📚 FONTES SUGERIDAS (Opcional)

Se você não encontrar via pesquisa orgânica, pode tentar:
- Case studies de agências (sites institucionais)
- Blogs de marketing (RockContent, Neil Patel, HubSpot)
- Templates de briefing (Canva, Notion, Miro)
- Fóruns de profissionais de marketing (Reddit r/marketing, LinkedIn Groups)
- Livros: "Ogilvy on Advertising", "Hey Whipple, Squeeze This"

---

## ⏱️ TEMPO ESTIMADO

- Pesquisa: 1-1.5h
- Análise: 30-45 min
- Documentação: 30-45 min
- **Total:** ~2.5-3h

---

## 🚀 PRÓXIMOS PASSOS (APÓS ENTREGA)

1. ✅ @analyst entrega documento de gap analysis
2. ✅ @aiox-master revisa com @commerce-strategist (validação para varejo)
3. ✅ @ux-design-expert propõe fluxo de onboarding revisado (se necessário)
4. ✅ Decisão final documentada (DEC-2026-05-06-001 sai de DRAFT)
5. ✅ Implementação (migrations, refactor UI)

---

## 📞 CONTATO

**Dúvidas ou esclarecimentos:** Ping @aiox-master

**Referências adicionais:**
- [DEC-2026-05-06-001-DRAFT.md](./DEC-2026-05-06-001-DRAFT.md) — Documento de decisão em progresso
- [docs/PROJECT-CONTEXT.md](../PROJECT-CONTEXT.md) — Contexto do projeto
- [docs/AIOX-MASTER-PROTOCOL.md](../AIOX-MASTER-PROTOCOL.md) — Protocolo pre-flight

---

**Obrigado, @analyst! Essa pesquisa é fundamental para garantir que o Vendeo espelha as melhores práticas do mercado sem criar fricção desnecessária para o lojista.** 🙏
