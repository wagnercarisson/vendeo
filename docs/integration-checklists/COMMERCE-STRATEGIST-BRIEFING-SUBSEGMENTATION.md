# Briefing: Subsegmentação de Segmentos — Impacto em Conversão

**Data:** 2026-05-06  
**Para:** @commerce-strategist  
**De:** @aiox-master  
**Urgência:** ALTA — Decisão bloqueante

---

## 🎯 PERGUNTA ÚNICA

**Subsegmentar "Loja de bebidas" em 3 tipos (Adega / Distribuidora / Loja de bebidas) MELHORA conversão de campanhas?**

**Traduzindo:**
- Hoje: Lojista escolhe "Loja de bebidas" (genérico)
- Proposta: Lojista escolhe "Bebidas → Adega" (específico)
- **Pergunta:** Isso faz diferença REAL em conversão? Ou é otimização prematura?

---

## 📊 CONTEXTO

### Situação Atual

**Segmento flat:**
```
stores.main_segment = "Loja de bebidas"
```

**Problema identificado:**
- "Loja de bebidas" engloba 3 perfis MUITO diferentes:
  - **Adega:** Premium, curadoria, vinhos, cliente ABC1
  - **Distribuidora:** B2B, atacado, volume, cliente PJ
  - **Loja de bebidas:** Varejo conveniência, gelado, cliente dia-a-dia

**Resultado:**
- IA usa contexto genérico "bebidas"
- Campanha pode ser inadequada (ex: tom premium pra loja de conveniência)

---

### Proposta de Subsegmentação

**Hierarquia:**
```
Categoria: "Bebidas"
├─ Subcategoria: "Adega"
├─ Subcategoria: "Distribuidora"
└─ Subcategoria: "Loja de bebidas"
```

**Exemplo de uso:**
- Registry de prompts: `bebidas-alcoolicas/variants/adega.yaml`
- L3 (Profissional Agêntico): Especialista em adegas (não genérico de bebidas)
- Messaging: Curadoria vs. Volume vs. Conveniência

---

## ❓ PERGUNTAS ESPECÍFICAS

### 1. Subsegmentação Melhora Conversão?

**Pergunta:**
> Se campanha para "Adega" usar linguagem de curadoria/exclusividade, e campanha para "Loja de bebidas" usar linguagem de conveniência/rapidez, isso AUMENTA conversão?

**Ou:**
> Clientes não ligam para isso? (Ex: "Cerveja gelada" funciona igual pra todos?)

**Responda com:**
- [ ] SIM, melhora conversão significativamente (>15%)
- [ ] SIM, melhora um pouco (5-15%)
- [ ] NÃO, diferença é marginal (<5%)
- [ ] NÃO SEI, precisa de teste A/B

---

### 2. Onde Está a Diferença Real?

**Se SIM (melhora conversão), onde está o ganho?**

Marque tudo que se aplica:

- [ ] **Messaging:** Tom/linguagem diferente por subsegmento
- [ ] **Timing:** Horário de pico varia (adega vende sexta-noite, distribuidora vende terça-manhã)
- [ ] **Produto:** Adegas focam vinho, lojas focam cerveja
- [ ] **CTA:** Adega = "Conheça", Loja = "Compre agora"
- [ ] **Público:** Adega = ABC1, Loja = ABC2/C
- [ ] **Sazonalidade:** Adega = fim de ano, Loja = fim de semana
- [ ] **Outro:** [Descrever]

---

### 3. Lojista Sabe Responder?

**Pergunta:**
> Lojista sabe diferenciar "Sou adega" vs. "Sou loja de bebidas"? Ou isso confunde?

**Cenários:**

**Cenário A (Lojista claro):**
- Adega premium em Pinheiros/SP → Sabe que é "Adega"
- Loja de conveniência → Sabe que é "Loja de bebidas"

**Cenário B (Lojista confuso):**
- "Sou uma adega, mas também vendo cerveja gelada. Qual escolher?"
- Resultado: Desistência no onboarding

**Qual é mais provável?**
- [ ] Cenário A (lojista sabe responder sem fricção)
- [ ] Cenário B (causa confusão, aumenta desistência)

---

### 4. Trade-off: Precisão vs. Fricção

**Análise:**

| Cenário | Precisão (Conversão) | Fricção (Onboarding) | Resultado |
|---------|---------------------|----------------------|-----------|
| **Flat (atual)** | 60% (genérico) | Baixa (1 pergunta) | Rápido mas impreciso |
| **Subsegmentado** | 80% (específico) | Média (+1 pergunta) | Mais lento mas preciso |

**Pergunta:**
> Vale a pena trocar +30 segundos de fricção por +20% de conversão?

**Responda:**
- [ ] SIM, +20% conversão justifica +30s
- [ ] NÃO, fricção mata retenção (lojista desiste)
- [ ] DEPENDE (explicar)

---

## 📐 EXEMPLO CONCRETO

### Caso Real: Adega do João (Ibirama/SC)

**Perfil:**
- Adega tradicional, 15 anos no mercado
- Especialidade: Vinhos sul-americanos
- Cliente: Famílias ABC2, 35-60 anos
- Ticket médio: R$ 120

**Campanha Atual (Genérico "Loja de bebidas"):**
```
🍺 Cerveja Gelada Esperando!
Passa aqui e leva a sua. Estamos abertos até 22h.
📍 Adega do João — Ibirama/SC
```

**Problema:** Tom genérico, não reflete curadoria

---

**Campanha com Subsegmentação (Adega):**
```
🍷 Vinhos Sul-Americanos Selecionados
Descubra rótulos exclusivos que você não encontra em outro lugar.
15 anos de tradição na escolha dos melhores vinhos.
📍 Adega do João — Ibirama/SC
```

**Pergunta:**
> Campanha 2 converte MELHOR que Campanha 1? Quantos % a mais?

**Estimativa:**
- [ ] +5% conversão
- [ ] +10% conversão
- [ ] +20% conversão
- [ ] +30% conversão ou mais
- [ ] Sem diferença (ambas convertem igual)

---

## 🎯 DELIVERABLE ESPERADO

**Resposta estruturada:**

```markdown
## Decisão: Subsegmentação [SIM / NÃO / DEPENDE]

### Rationale (2-3 parágrafos)
[Por que SIM ou NÃO? Onde está o ganho real?]

### Impacto em Conversão (Estimativa)
- Subsegmentado: +X% conversão vs. flat
- Justificativa: [Messaging? Timing? Produto? CTA?]

### Fricção vs. Precisão
- Trade-off vale a pena? [SIM / NÃO]
- Lojista sabe responder? [SIM / NÃO / DEPENDE]

### Recomendação Final
- [ ] Implementar subsegmentação (ganho > fricção)
- [ ] NÃO implementar (fricção > ganho)
- [ ] Implementar MAS com ajuda (tooltips, exemplos)
- [ ] Testar A/B (não sabemos, precisa validar)

### Se SIM, onde usar subsegmentação?
- [ ] Registry de prompts (variants/adega.yaml)
- [ ] L3 Profissional Agêntico (especialista específico)
- [ ] Messaging/tone diferenciado
- [ ] Timing/sazonalidade específica
- [ ] CTA diferenciado
- [ ] Outro: [Descrever]
```

---

## ⏱️ TEMPO ESPERADO

- Análise: 30-45 min
- Resposta: 10-15 min
- **Total:** ~1h

---

## 🚨 BLOQUEIO ATUAL

**Não podemos avançar sem esta decisão:**
- Se SIM → Implementar subsegmentação (migration + UI + registry)
- Se NÃO → Manter flat, focar em outros gaps

**Esta é decisão BLOQUEANTE.**

---

**Aguardando resposta do @commerce-strategist para prosseguir.**
