# 🧪 Onboarding Progressivo — Guia de Teste de Usabilidade
**Agent:** @ux-design-expert (Uma) → @qa  
**Data:** 2026-04-30  
**Objetivo:** Validar onboarding com lojistas reais (perfil não-técnico)

---

## 🎯 Objetivos do Teste

### Validar:
1. **Tempo de conclusão:** Fase 1 < 2 minutos (meta)
2. **Taxa de conclusão:** 85%+ completam sem abandonar
3. **Compreensão:** Lojista entende cada campo sem ajuda
4. **Facilidade de uso:** 80%+ completam sem clicar "Ajuda"
5. **Satisfação:** "Parece minha loja" (campanhas personalizadas)

---

## 👥 Perfil dos Testadores

### Critérios de Seleção

| Característica | Requisito | Por quê |
|----------------|-----------|---------|
| **Idade** | 45-55 anos | Perfil dominante de lojistas |
| **Experiência tech** | Baixa a média (usa WhatsApp/Instagram) | Representativo do usuário final |
| **Tipo de loja** | Varejo físico (adega, farmácia, moda, beauty, casa) | Público-alvo do Vendeo |
| **Tamanho da loja** | Pequena/média (1-5 funcionários) | Segmento alvo |
| **Dispositivo** | Smartphone (Android ou iOS) | 70% dos lojistas acessam via mobile |
| **Tempo disponível** | 20-30 minutos | Teste completo + entrevista |

### Quantos Testadores?
- **Mínimo:** 3 lojistas (detecta 75% dos problemas de usabilidade)
- **Ideal:** 5 lojistas (detecta 85%+ dos problemas)
- **Diversidade:** Mix de segmentos (1 adega, 1 farmácia, 1 moda, 1 beauty, 1 casa)

---

## 📋 Preparação do Teste

### Materiais Necessários
- [ ] Smartphone com app/site Vendeo instalado (staging environment)
- [ ] Conta de teste pré-criada (ou permitir login social)
- [ ] Formulário de consentimento (LGPD)
- [ ] Questionário pós-teste (Google Forms ou similar)
- [ ] Gravação de tela (com consentimento) — Loom, OBS ou similar
- [ ] Timer (cronômetro para medir tempo)

### Setup Ambiente de Teste
- [ ] **Staging URL:** `https://staging.vendeo.app` (ou similar)
- [ ] **Reset entre testes:** Limpar localStorage, cookies, sessão
- [ ] **Dados de teste:** Lojista usa dados reais da sua loja (nome, cidade, telefone real)
- [ ] **Logo de teste:** Lojista pode usar logo real OU pular (testar ambos cenários)

---

## 🧪 Protocolo de Teste

### 1. Introdução (3 minutos)

**Script:**
> "Olá [Nome], obrigado por participar! Vou pedir pra você usar um app que ajuda lojistas como você a criar campanhas de vendas. Não é um teste de você — é um teste do sistema. Se algo não funcionar ou ficar confuso, é problema nosso, não seu. Pode falar em voz alta o que você está pensando enquanto usa. Vou gravar a tela pra gente analisar depois, mas não vou gravar seu rosto. Tudo bem?"

**Checklist:**
- [ ] Explicar objetivo do teste (validar onboarding)
- [ ] Reforçar: "Não é teste de você, é teste do sistema"
- [ ] Pedir para "pensar alto" (verbalizar dúvidas)
- [ ] Obter consentimento para gravação de tela
- [ ] Entregar smartphone com app aberto na tela de onboarding

---

### 2. Cenário 1: Fase 1 (Onboarding Básico) — 10 minutos

**Tarefa:**
> "Você acabou de criar uma conta no Vendeo. Agora o sistema vai pedir alguns dados da sua loja. Complete o cadastro usando os dados reais da sua loja. Não tem resposta certa ou errada — use o que fizer sentido pra você."

**Observações (anotar):**

#### **Tela 1/4: Identidade (nome + segmento)**
- [ ] Entendeu o que é "segmento" sem explicação?
- [ ] Hesitou entre opções de segmento? Qual dúvida?
- [ ] Clicou no ícone correto na primeira tentativa?
- [ ] **Tempo:** ______ segundos

**Sinais de problema:**
- ❌ Pergunta "O que é segmento?"
- ❌ Clica em vários ícones antes de decidir
- ❌ Comenta "Não sei qual escolher"

---

#### **Tela 2/4: Localização (cidade + estado + bairro)**
- [ ] Preencheu cidade sem ajuda?
- [ ] Autocomplete de cidade funcionou? (se implementado)
- [ ] Preencheu bairro ou pulou? (opcional)
- [ ] **Tempo:** ______ segundos

**Sinais de problema:**
- ❌ Digita cidade errada (typo)
- ❌ Não entende diferença entre "cidade" e "bairro"
- ❌ Ignora campo "bairro" por não saber o que é

---

#### **Tela 3/4: Contato (telefone + WhatsApp + Instagram)**
- [ ] Máscara de telefone aplicou corretamente?
- [ ] Entendeu checkbox "Esse número também é WhatsApp"?
- [ ] Preencheu Instagram ou pulou? (opcional)
- [ ] Compreendeu formato "@usuario" do Instagram?
- [ ] **Tempo:** ______ segundos

**Sinais de problema:**
- ❌ Digita telefone com DDD errado (máscara não bloqueia)
- ❌ Marca/desmarca checkbox sem entender
- ❌ Digita Instagram sem @ (validação não adiciona automaticamente)

---

#### **Tela 4/4: Identidade Visual (logo + cores)**
- [ ] Tentou fazer upload de logo OU pulou?
- [ ] Se tentou upload: Conseguiu sem ajuda? (drag & drop ou clique)
- [ ] Se pulou: Clicou "Vou adicionar depois" ou não encontrou opção?
- [ ] Entendeu color picker OU ficou confuso?
- [ ] Modificou cores padrão OU manteve verde/azul?
- [ ] Clicou "Criar minha loja e começar" ou procurou outro botão?
- [ ] **Tempo:** ______ segundos

**Sinais de problema:**
- ❌ Tenta fazer upload mas não encontra botão
- ❌ Não entende o que é "color picker"
- ❌ Escolhe cores com contraste ruim (ex: amarelo claro + branco)
- ❌ Procura botão "Salvar" ou "Próximo" (não vê CTA "Criar minha loja")

---

**TOTAL Fase 1:**
- [ ] **Tempo total:** ______ minutos ______ segundos
- [ ] **Completou sem abandonar?** Sim / Não
- [ ] **Pediu ajuda?** Sim (quantas vezes: ___) / Não
- [ ] **Clicou botão "Ajuda" ou "?"?** Sim / Não
- [ ] **Voltou telas para corrigir algo?** Sim / Não

**Meta de sucesso:**
- ✅ Tempo < 3 minutos
- ✅ 0 pedidos de ajuda
- ✅ Completou todas as 4 telas

---

### 3. Cenário 2: Fase 2 (Intelligence Calibration) — 10 minutos

**Tarefa:**
> "Agora você está no dashboard. Veja esse banner aqui [apontar] que diz 'Calibrar inteligência da IA'. Isso é opcional, mas pode melhorar suas campanhas. Clique nele e preencha pelo menos 5 campos. Você pode pular o que não souber ou não quiser responder."

**Observações:**

#### **Modal: Estrutura Geral**
- [ ] Entendeu o que é "calibrar inteligência"? (perguntou "pra que serve?")
- [ ] Compreendeu barra de progresso (X/15 campos)?
- [ ] Entendeu Score de Inteligência (0-100)?
- [ ] Badge motivou a preencher mais? (Básica → Média → Avançada)

**Sinais de problema:**
- ❌ Pergunta "Por que devo fazer isso?"
- ❌ Não entende o que é "Score de Inteligência"
- ❌ Ignora barra de progresso

---

#### **Aba 1: Tom & Público**
- [ ] Entendeu "Tom de voz da marca"? (Formal, Informal, Técnico, Divertido)
- [ ] Preencheu "Público-alvo" ou pulou?
- [ ] Selecionou "Picos sazonais" corretamente?
- [ ] Adicionou produtos top 5 ou pulou?
- [ ] **Campos preenchidos:** ____ / 5

**Sinais de problema:**
- ❌ Não entende diferença entre "Informal" e "Divertido"
- ❌ Deixa "Público-alvo" vazio por não saber o que escrever
- ❌ Adiciona mais de 5 produtos (sistema não bloqueia)

---

#### **Aba 2: Posicionamento**
- [ ] Entendeu "Posicionamento de preço"? (Econômico, Médio, Premium, Luxo)
- [ ] Preencheu "Ticket médio" com valor real?
- [ ] Adicionou concorrentes ou pulou?
- [ ] Entendeu "Proposta única de venda (USP)"?
- [ ] **Campos preenchidos:** ____ / 5

**Sinais de problema:**
- ❌ Não sabe o que é "Ticket médio"
- ❌ Não entende "USP" (usa jargão empresarial demais)
- ❌ Lista concorrentes mas não entende por que isso ajuda

---

#### **Aba 3: Conversão**
- [ ] Entendeu sliders de "Urgência" e "Escassez"? (0-10)
- [ ] Preencheu CTAs que já funcionaram ou pulou?
- [ ] Adicionou eventos locais importantes?
- [ ] **Campos preenchidos:** ____ / 3

**Sinais de problema:**
- ❌ Não entende o que slider 0-10 significa ("urgência" é abstrato)
- ❌ Não lembra CTAs que usou no passado (campo vazio)

---

#### **Aba 4: Linguagem**
- [ ] Entendeu preferências de linguagem? (gírias, emojis, formalidade)
- [ ] Entendeu "Tamanho de copy preferido"? (Curto, Médio, Detalhado)
- [ ] Preview de exemplo ajudou a decidir?
- [ ] **Campos preenchidos:** ____ / 2

**Sinais de problema:**
- ❌ Slider de emojis (0-10) é confuso ("O que é 5 emojis?")
- ❌ Preview de campanha não aparece ou está quebrado

---

**TOTAL Fase 2:**
- [ ] **Tempo total:** ______ minutos ______ segundos
- [ ] **Completou até o fim (Aba 5 - Resumo)?** Sim / Não
- [ ] **Campos preenchidos:** ____ / 15
- [ ] **Score final:** ____ / 100
- [ ] **Badge alcançado:** Básica / Média / Avançada
- [ ] **Abandonou antes do fim?** Sim / Não (se sim, em qual aba: ____)

**Meta de sucesso:**
- ✅ 30%+ lojistas chegam até Aba 3 (Conversão)
- ✅ Média 8+ campos preenchidos
- ✅ Score médio: 53+ (Inteligência Média)

---

### 4. Entrevista Pós-Teste (5 minutos)

**Perguntas abertas:**

1. **Facilidade geral:**
   - "De 1 a 5, quão fácil foi completar o cadastro da loja?" (1 = muito difícil, 5 = muito fácil)
   - Resposta: ______
   - "O que foi mais difícil?"

2. **Compreensão:**
   - "Teve algum campo que você não entendeu o que era?"
   - Resposta: ______

3. **Tempo:**
   - "Você achou rápido ou demorado?"
   - Resposta: ______

4. **Logo e cores:**
   - "Você fez upload do logo? Se não, por quê?"
   - Resposta: ______
   - "E as cores, você mudou ou deixou as padrões?"
   - Resposta: ______

5. **Intelligence Calibration:**
   - "Você entendeu pra que serve o 'Calibrar inteligência'?"
   - Resposta: ______
   - "O Score de Inteligência te motivou a preencher mais campos?"
   - Resposta: ______

6. **Satisfação:**
   - "Você acha que o sistema captou bem as informações da sua loja?"
   - Resposta: ______
   - "Se o sistema gerar uma campanha agora, você acha que vai 'parecer sua loja'?"
   - Resposta: ______

7. **Melhorias:**
   - "Se você pudesse mudar uma coisa no cadastro, o que seria?"
   - Resposta: ______

---

### 5. Teste Bônus: Geração de Primeira Campanha (5 minutos)

**Tarefa:**
> "Agora que sua loja está cadastrada, vamos testar a geração de uma campanha. Clique em 'Gerar campanha' e escolha um produto da sua loja."

**Observações:**
- [ ] Conseguiu gerar campanha sem ajuda?
- [ ] Campanha gerada "parece a loja dele"? (cores, tom, contexto local)
- [ ] Lojista aprovou a campanha ou regenerou?
- [ ] Se regenerou: Quantas vezes? ____ (meta: max 3)
- [ ] **Tempo até aprovar campanha:** ______ minutos

**Feedback final:**
- "A campanha parece sua loja?" (Sim / Não / Mais ou menos)
- "O que você mudaria na campanha?"
- "Você usaria essa campanha de verdade?" (Sim / Não)

---

## 📊 Métricas de Coleta

### Quantitativas (medir)
| Métrica | Testador 1 | Testador 2 | Testador 3 | Testador 4 | Testador 5 | Média |
|---------|-----------|-----------|-----------|-----------|-----------|-------|
| Tempo Fase 1 (min) | | | | | | |
| Taxa de conclusão Fase 1 (%) | | | | | | |
| Campos preenchidos Fase 2 | | | | | | |
| Score Inteligência (0-100) | | | | | | |
| Pedidos de ajuda (#) | | | | | | |
| Cliques em "Ajuda" (#) | | | | | | |
| Facilidade (1-5) | | | | | | |
| Satisfação "parece minha loja" (Sim/Não) | | | | | | |

### Qualitativas (observar)
- **Problemas críticos:** Campos que TODOS os testadores tiveram dificuldade
- **Problemas menores:** Campos que 2-3 testadores hesitaram
- **Elogios:** O que funcionou bem (para preservar)
- **Sugestões:** Ideias que surgiram espontaneamente

---

## 🚦 Critérios de Aprovação

### Fase 1 (Obrigatória)
| Critério | Meta | Status |
|----------|------|--------|
| Tempo médio | < 3 minutos | ⬜ |
| Taxa de conclusão | 85%+ (4/5 testadores) | ⬜ |
| Pedidos de ajuda | < 1 por testador | ⬜ |
| Facilidade (1-5) | Média 4+ | ⬜ |
| "Parece minha loja" | 80%+ (4/5 testadores) | ⬜ |

### Fase 2 (Opcional)
| Critério | Meta | Status |
|----------|------|--------|
| 30%+ abrem modal | 2/5 testadores | ⬜ |
| Campos preenchidos | Média 8+ / 15 | ⬜ |
| Score Inteligência | Média 53+ (Média) | ⬜ |
| Completam até Aba 3 | 2/5 testadores | ⬜ |

### Decisão Final
- ✅ **APROVADO:** Fase 1 atende 4/5 critérios (pode deployar)
- ⚠️ **APROVADO COM RESSALVAS:** Fase 1 atende 3/5 critérios (ajustes menores)
- ❌ **REPROVADO:** Fase 1 atende <3/5 critérios (redesign necessário)

---

## 🔧 Problemas Comuns & Soluções

### Problema 1: Lojista não entende "Segmento"
**Sintoma:** Hesita muito ou pergunta "O que é isso?"  
**Solução:** Mudar label para "Tipo de loja" (mais claro)

### Problema 2: Máscara de telefone não aplica
**Sintoma:** Lojista digita números sem formatação  
**Solução:** Forçar máscara on-the-fly (regex em tempo real)

### Problema 3: Color picker assusta lojista
**Sintoma:** Comenta "Não sei usar isso" ou deixa cores padrão  
**Solução:** Priorizar "Extrair cores do logo" (automático)

### Problema 4: Modal Fase 2 é ignorado
**Sintoma:** Lojista fecha modal sem preencher nada  
**Solução:** Adicionar incentivo visual ("Campanhas 40% melhores")

### Problema 5: Lojista desiste no upload de logo
**Sintoma:** Clica "Vou adicionar depois" imediatamente  
**Solução:** Adicionar "Gerar logo com IA" (remove fricção)

---

## 📝 Template de Relatório Final

```markdown
# Relatório de Teste de Usabilidade — Onboarding Progressivo

**Data:** [Data do teste]  
**Testadores:** 5 lojistas (perfil 45-55 anos, baixa tech literacy)  
**Dispositivos:** 3 Android, 2 iOS  
**Ambiente:** Staging (https://staging.vendeo.app)

---

## Resumo Executivo

### Fase 1 (Obrigatória)
- **Tempo médio:** X.X minutos (meta: <3 min)
- **Taxa de conclusão:** X% (meta: 85%+)
- **Facilidade (1-5):** X.X (meta: 4+)
- **Satisfação:** X% disseram "parece minha loja" (meta: 80%+)

**Veredito:** ✅ APROVADO / ⚠️ APROVADO COM RESSALVAS / ❌ REPROVADO

---

## Problemas Críticos (P1 — bloqueia deploy)

1. **[Problema]**
   - **Observado em:** X/5 testadores
   - **Impacto:** [Descrição]
   - **Solução proposta:** [Fix]

---

## Problemas Menores (P2 — não bloqueia, mas deve corrigir)

1. **[Problema]**
   - **Observado em:** X/5 testadores
   - **Impacto:** [Descrição]
   - **Solução proposta:** [Fix]

---

## Elogios & Pontos Fortes

- "[Citação de testador]"
- [O que funcionou bem]

---

## Recomendações

1. [Ação 1]
2. [Ação 2]
3. [Ação 3]

---

**Próximos passos:** [Deployar / Iterar / Redesign]
```

---

**🧪 Guia criado por:** @ux-design-expert (Uma)  
**👨‍🔬 Para:** @qa (Quinn)  
**📅 Data:** 2026-04-30  
**🚀 Status:** Pronto para execução de testes
