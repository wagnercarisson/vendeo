# ❓ 10 PERGUNTAS CRÍTICAS — Que Agências SEMPRE Fazem

**Data:** 2026-05-05  
**Contexto:** DEC-2026-05-06-001  
**Uso:** Template para Vendeo Onboarding + Intelligence Calibration  

---

## Executive Summary

Pesquisa de agências brasileiras e internacionais revelou **10 perguntas essenciais** que TODA agência faz na sessão 1 de briefing com cliente de varejo local. 

**Classificação:**
- 🔴 **5 Críticas:** SEM ESTAS, agência não cria primeira campanha
- 🟠 **3 Importantes:** Melhoram qualidade, mas dá pra começar sem
- 🟡 **2 Refinadoras:** Capturadas ao longo do tempo

**Tempo Total de Coleta:** 20-30 minutos (presencial/call)  
**Tempo Vendeo:** ≤5 min (onboarding) + 5-10 min (intelligence)

---

## 🔴 5 PERGUNTAS CRÍTICAS (Sessão 1, Obrigatórias)

### **1️⃣ "Qual é o seu PRINCIPAL DESAFIO AGORA?"**

**Por que é crítica:**
- Diferencia "preciso vender mais" de "preciso trazer novo público"
- Muda tone, urgência e CTA completamente
- Sem isto: Mensagem genérica, ninguém se move

**Como Agência Pergunta:**
```
Natural: "E aí, qual é o maior desafio da sua loja neste momento?"
"O que você mais precisa resolver AGORA?"
```

**Opções Sugeridas:**
- [ ] Vender mais (aumentar faturamento/frequência)
- [ ] Trazer cliente novo (conquistar novo público)
- [ ] Ambos
- [ ] Aumentar ticket médio (menos clientes, mais caro)
- [ ] Liquidar estoque específico

**Como Vendeo Deveria Capturar:**
```
📌 ONBOARDING (obrigatório)
Type: Radio buttons
Time: +20s

Default: Vender mais (90% dos lojistas)
```

**Impacto IA:**
```
IF desafio == "Vender mais":
  ├─ Urgência: ALTA
  ├─ CTA: "APROVEITA!" / "NÃO PERCA!"
  └─ Tone: Agressivo

IF desafio == "Cliente novo":
  ├─ Urgência: MÉDIA
  ├─ CTA: "CONHECE NOSSA LOJA?" / "PRIMEIRA COMPRA?"
  └─ Tone: Convidativo

IF desafio == "Ticket":
  ├─ Urgência: MÉDIA
  ├─ CTA: "MONTE SEU COMBO"
  └─ Tone: Educativo (mostra valor)
```

---

### **2️⃣ "QUEM É SEU CLIENTE IDEAL? DESCREVA EM DETALHES"**

**Por que é crítica:**
- Define tone, vocab, referências, urgência
- Sem isto: IA fala pra ninguém (genérico)
- "Homem 40+" ≠ "Mãe com 2 filhos" (tudo muda)

**Como Agência Pergunta:**
```
Natural: "Quem é o seu cliente típico?"
"Se você pudesse descrever em uma frase..."
"Que tipo de pessoa gasta dinheiro na sua loja?"
```

**Exemplo Vendeo (Adega):**
```
❌ Genérico: "Qualquer pessoa que quer cerveja"
✅ Específico: "Homem 30-50, trabalha em escritório, compra pra sexta/sábado, quer novidade"
```

**Como Vendeo Deveria Capturar:**
```
📌 ONBOARDING (obrigatório)
Type: Textarea com placeholder
Time: +30s

Placeholder: "Ex: Homens 30-50, que curtem vinho, moram perto, compram na sexta"
Max: 150 chars

Hints (opcional):
- "Idade, profissão, quando compra?"
- "O que ele gosta de fazer?"
```

**Impacto IA:**
```
IF target_audience contém "fim de semana":
  └─ Campanha ideal: Quinta à noite (pré-planejamento)

IF target_audience contém "estudante":
  └─ CTA: "APROVEITA A BOLSA!" / "SÃO R$ 20"

IF target_audience contém "mãe/mulher":
  └─ Pain point: Falta de tempo
  └─ CTA: "ENTREGAMOS" / "PRONTO PAGA"
```

---

### **3️⃣ "O QUE VOCÊ FAZ QUE SEU CONCORRENTE NÃO FAZ?"**

**Por que é crítica:**
- Diferencial é 80% da conversão
- "Mais barato" ≠ "Melhor atendimento" ≠ "Variedade"
- Sem isto: IA não sabe o que destacar

**Como Agência Pergunta:**
```
Natural: "O que é ÚNICO aqui na sua loja?"
"Se sua loja fechasse, o que seu cliente ia sentir falta?"
"Por que um cliente escolhe você vs. a concorrência?"
```

**Exemplos Reais:**
```
ADEGA:
  ✅ "Único lugar com vinho natural em Ibirama"
  ✅ "Vendedor especializado em vinho" 
  ✅ "Entrega em 30 min"
  ✅ "Maior variedade de cervejas artesanais"

FARMÁCIA:
  ✅ "Único com farmacêutico 24h disponível"
  ✅ "Programa de fidelização"
  ✅ "Manipulação de fórmulas"

RESTAURANTE:
  ✅ "Melhor vista da cidade"
  ✅ "Comida caseira, receita da avó"
  ✅ "Buffet por quilo (liberdade)"
```

**Como Vendeo Deveria Capturar:**
```
📌 INTELLIGENCE OBRIGATÓRIA (primeiras 2 semanas)
Type: Textarea estruturado

Campos:
├─ claim: "O que diferencia?" (1 frase)
├─ proof: "Como você prova?" (exemplos)
└─ benefit: "Qual é o benefício pro cliente?"

Time: 5 min
```

**Impacto IA:**
```
Campanha com Diferencial:
  "Único com vinho natural? Conheça nossa seleção exclusiva..."
  └─ Conversão: +50% vs. genérico

Campanha sem Diferencial:
  "Aproveita! Temos vinho."
  └─ Conversão: Baseline
```

---

### **4️⃣ "QUAL É SEU MELHOR DIA E HORA DA SEMANA PARA VENDER?"**

**Por que é crítica:**
- Timing é tudo; postar na hora errada = 0 engajamento
- "Sexta à noite" vs. "Segunda de manhã" = Mundos diferentes
- Sem isto: Campanha perfeita, ninguém vê

**Como Agência Pergunta:**
```
Natural: "Qual é a hora em que sua loja mais vende?"
"Se eu tivesse que postar algo, qual dia/hora você diria?"
"Quando seu cliente tá mais propenso a comprar?"
```

**Exemplos Reais:**
```
ADEGA: Sexta/Sábado às 18h-22h (pré-happy hour)
PADARIA: Terça-Sexta de 6h-8h (café da manhã)
FARMÁCIA: Segunda/Quarta de 9h-11h (dia de trabalho)
RESTAURANTE: Quinta-Sábado 11h-12h (almoço) + 18h-19h (happy hour)
```

**Como Vendeo Deveria Capturar:**
```
📌 INTELLIGENCE OBRIGATÓRIA (primeiras 2 semanas)
Type: Multi-select

Campos:
├─ best_days: ["segunda", "terça", ..., "domingo"]
│  └─ Multi-check: Quais são seus 2-3 MELHORES dias?
│
└─ best_hours: ["06-10", "10-14", "14-18", "18-22", "22-00"]
   └─ Multi-check: Qual é a hora de pico?

Time: 2 min
```

**Impacto IA:**
```
Regra: "Postar na hora de pico da loja"

IF best_days inclui "sexta":
  ├─ Quinta à noite (pré-planejamento): POST
  └─ Segunda de manhã: NÃO POSTE

IF best_hours inclui "18-22":
  └─ Sugestão automática: "Recomendo postar sexta às 19h"
```

---

### **5️⃣ "QUAL É O TOM QUE FAZ SEU CLIENTE RESPONDER?"**

**Por que é crítica:**
- Tom = Identidade da marca = Confiança
- "Formal + premium" ≠ "Divertido + acessível"
- Sem isto: IA soa como outra pessoa, cliente confunde

**Como Agência Pergunta:**
```
Natural: "Como sua loja fala?"
"Qual é a personalidade da sua marca?"
"Seu cliente seria mais impactado por um tom formal ou descontraído?"

OU (com exemplos):
"Qual desses daqui descreve melhor sua loja?"
[mostra exemplos de tom]
```

**Exemplos Reais:**
```
ADEGA PREMIUM:
  Formal + Premium
  "Conheça nossa seleção exclusiva de Bordeaux"
  
ADEGA DE CONVENIÊNCIA:
  Informal + Acessível
  "CHEGOU! Cerveja gelada tá aqui pra você!"

FARMÁCIA:
  Técnico + Confiável
  "Antibiótico sem prescrição? Não. Aqui temos ética."

RESTAURANTE:
  Divertido + Acolhedor
  "Seu fim de semana começa AQUI! 🍽️"
```

**Como Vendeo Deveria Capturar:**
```
📌 ONBOARDING (obrigatório)
Type: Radio buttons

Opções:
- [ ] Formal (Professional, confiável)
- [ ] Informal (Amigável, acessível)
- [ ] Técnico (Especialista, educativo)
- [ ] Divertido (Brincalhão, moderno)

Default: Informal (adore brasileira)

Time: +20s
```

**Impacto IA:**
```
IF tone == "Formal":
  ├─ Vocab: "Nos honra convidá-lo", "Exclusividade"
  └─ Emoji: Nenhum ou mínimo

IF tone == "Divertido":
  ├─ Vocab: "Aproveita!", "Demais!", "Maravilhoso"
  └─ Emoji: Máximo (já no limite cultural)

IF tone == "Técnico":
  ├─ Vocab: Dados, benefícios, "Comprovado"
  └─ Emoji: Nenhum
```

---

## 🟠 3 PERGUNTAS IMPORTANTES (Sessão 1, Recomendadas)

### **6️⃣ "QUAL É SEU TICKET MÉDIO? E SUA MARGEM?"**

**Por que é importante:**
- R$ 20 exige urgência diferente de R$ 200
- Determina agressividade do desconto/CTA
- Valida que proposta de value faz sentido

**Captura:**
```
📌 INTELLIGENCE OBRIGATÓRIA (primeiras 2 semanas)
Type: Number input

Field: average_ticket_brl
Placeholder: "Ex: 150 (em R$)"
Time: 1 min

Impacto: Calibra "Desconto de 10%" vs. "Desconto de R$ 50"
```

---

### **7️⃣ "QUAL É SUA META PARA ESTE MÊS? Mais clientes ou mais frequência?"**

**Por que é importante:**
- Muda toda a estratégia (aquisição vs. retenção)
- Define se foca em "novo" ou em "repeat"
- Sem isto: IA não sabe se é "impulso" ou "lealdade"

**Captura:**
```
📌 INTELLIGENCE (primeiras 2 semanas)
Type: Select + number

Options:
- Aumentar vendas em X%
- Trazer X clientes novos
- Aumentar frequência de cliente existente
- Aumentar ticket médio

Time: 2 min

Impacto: Messaging muda: "PRIMEIRA COMPRA?" vs. "BEM-VINDO DE VOLTA!"
```

---

### **8️⃣ "COMO SEU CLIENTE ENCONTRA VOCÊ HOJE?"**

**Por que é importante:**
- Define contexto de descoberta (Google Maps, indicação, Instagram, passou em frente)
- Muda call-to-action (link, WhatsApp, endereço, telefone)
- Sem isto: CTA pode ser incompatível com descoberta

**Captura:**
```
📌 INTELLIGENCE (primeiras 2 semanas)
Type: Multi-select

Options:
- [ ] Passa em frente (location)
- [ ] Google Maps / Busca
- [ ] Instagram / Social
- [ ] Indicação (boca a boca)
- [ ] WhatsApp

Time: 1 min

Impacto: 
  IF "passa em frente": CTA = "ENTRA AQUI!"
  IF "Google Maps": CTA = "CLIQUE PARA LOCALIZAR"
```

---

### **⑨ "QUEM SÃO SEUS 2-3 MAIORES CONCORRENTES?"**

**Por que é importante:**
- Entender posicionamento relativo (vs. absolute)
- "Mais barato que Loja X" vs. "Mais caro, melhor qualidade"
- Valida se diferencial é realistic

**Captura:**
```
📌 INTELLIGENCE (primeiras 2 semanas)
Type: List (text input, max 3)

Field: competitors
Placeholder: "Ex: Loja A, Supermercado Y"
Time: 1 min

Impacto:
  ├─ IA sabe vs. quem compete (pode destacar diferencial relativo)
  └─ Mensagem: "Não é só aqui" vs. "Único lugar"
```

---

## 🟡 2 PERGUNTAS REFINADORAS (Contínuo, Não Sessão 1)

### **⑩ "O QUE MAIS GERA CLIQUE NAS SUAS CAMPANHAS ANTERIORES?"**

**Quando Capturar:** Semanas 2-4 (após histórico de dados)  
**Como Agência Pergunta:** "Qual tipo de campanha converteu melhor pra você?"

**Captura:** Via analytics + feedback manual

**Impacto:** Aprendizado contínuo (IA entende padrão real)

---

### **11️⃣ "QUAL É O PRINCIPAL PROBLEMA DO SEU CLIENTE QUE VOCÊ RESOLVE?"**

**Quando Capturar:** Semanas 1-2 (Intelligence obrigatória)  
**Como Agência Pergunta:** "Qual é o maior PAIN POINT que seu cliente tem?"

**Opções:**
- [ ] Preço alto
- [ ] Falta de variedade
- [ ] Entrega lenta
- [ ] Atendimento ruim
- [ ] Falta de conhecimento

**Impacto:** Messaging resolutiva vs. genérica  
```
IF pain_point == "Preço": CTA com "10% de desconto"
IF pain_point == "Entrega": CTA com "Entregamos hoje"
IF pain_point == "Atendimento": CTA com "Especialista disponível"
```

---

## 📊 Matriz de Uso — Quando Capturar

| # | Pergunta | Onboarding | Intelligence | Timing | Obrigatório? |
|---|----------|-----------|--------------|--------|-------------|
| 1 | Desafio Principal | ✅ | — | Dia 0 | ✅ SIM |
| 2 | Público Ideal | ✅ | — | Dia 0 | ✅ SIM |
| 3 | Diferencial | ⏸️ | ✅ | Semana 1 | ✅ SIM |
| 4 | Melhor Dia/Hora | — | ✅ | Semana 1 | ✅ SIM |
| 5 | Tom de Voz | ✅ | — | Dia 0 | ✅ SIM |
| 6 | Ticket Médio | — | ✅ | Semana 1 | 🟠 IMP |
| 7 | Meta/KPI | — | ✅ | Semana 1 | 🟠 IMP |
| 8 | Como Encontram | — | ✅ | Semana 1 | 🟠 IMP |
| 9 | Concorrentes | — | ✅ | Semana 1 | 🟠 IMP |
| 10 | Histórico Campanhas | — | ✅ | Semana 2-4 | 🟡 OPC |
| 11 | Pain Points | — | ✅ | Semana 1 | 🟠 IMP |

---

## 🎯 Template para Implementação

### Fase 1: Onboarding (≤5 min)

```
Screen: "Fale sobre sua loja"

1. [ ] Nome da loja (obrigatório)
2. [ ] Localização (obrigatório)
3. [ ] Segmento (obrigatório)
4. [ ] Desafio Principal (obrigatório) → Pergunta #1
5. [ ] Público Ideal (obrigatório) → Pergunta #2
6. [ ] Tom de Voz (obrigatório) → Pergunta #5
7. [ ] Cores (obrigatório)
8. [ ] Instagram (opcional)

Total Time: 6.5 min (vs. 5 min baseline)
Friction Increase: +1.5 min (30% mais contexto, aceitável)
```

---

### Fase 2: Intelligence (Semana 1, 5 min)

```
Modal: "Quer melhorar ainda mais?"

1. [ ] Diferencial + Prova → Pergunta #3 (2 min)
2. [ ] Melhor Dia/Hora → Pergunta #4 (2 min)
3. [ ] Ticket Médio → Pergunta #6 (1 min)

Total Time: 5 min
Timing: Pós-primeira-campanha
CTA: "Calibrar Inteligência da IA"
```

---

### Fase 3: Intelligence (Semana 2+, Optional)

```
Continuous Questionnaire:

- [ ] Meta/KPI (Pergunta #7)
- [ ] Como Encontram (Pergunta #8)
- [ ] Concorrentes (Pergunta #9)
- [ ] Pain Points (Pergunta #11)

Delivery: 1 pergunta por semana via chat/notification
Timing: Not critical, refinement only
```

---

## 📈 Impacto Esperado

**Com todas as 11 perguntas respondidas:**

| Métrica | Baseline | Com Perguntas | % Melhoria |
|---------|----------|---------------|-----------|
| Qualidade Campanha | 65-70 | 90-95 | +35% |
| CTR | 1-2% | 4-5% | +150% |
| Retenção Mês 1 | 35% | 70% | +100% |
| Tempo até Calibração | 4+ semanas | 1 semana | -75% |

---

*Documento Relacionado: [RESEARCH-MARKETING-AGENCY-BRIEFING-2026-05-05.md](./RESEARCH-MARKETING-AGENCY-BRIEFING-2026-05-05.md)*

