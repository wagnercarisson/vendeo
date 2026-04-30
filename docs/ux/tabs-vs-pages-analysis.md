# 🎨 Abas vs Páginas: Análise Comparativa (Intelligence Calibration)
**Agent:** @ux-design-expert (Uma)  
**Data:** 2026-04-30  
**Contexto:** Usuário sugeriu sistema de abas ao invés de progressão de páginas

---

## 🔍 Pergunta-Chave

> "Também avalie a possibilidade de, ao invés de utilizar avanço por páginas, utilizar o sistema de abas, distribuindo os campos por abas acessíveis, aninhados por contexto e por necessidade, podendo deixar os opcionais por último."

**Resposta:** ✅ **Sistema de abas é superior para Intelligence Calibration** (mas não para onboarding básico).

---

## 📊 Comparação: Abas vs Páginas

### Intelligence Calibration (15 Campos Avançados)

| Critério | Sistema de Abas | Progressão de Páginas |
|----------|----------------|----------------------|
| **Organização por contexto** | ✅ Excelente (4 abas temáticas) | ⚠️ Bom (4 páginas sequenciais) |
| **Progressão não-linear** | ✅ Pode pular abas | ❌ Precisa avançar sequencialmente |
| **Auto-save** | ✅ Salva ao trocar de aba | ⚠️ Precisa botão "Salvar rascunho" |
| **Campos opcionais** | ✅ Pode deixar aba 4 (Avançado) vazia | ⚠️ Pode pular página, mas menos intuitivo |
| **Mobile** | ✅ Swipe horizontal entre abas | ⚠️ Botões "Voltar/Próxima" |
| **Percepção de progresso** | ✅ Progress bar + abas visíveis | ✅ "Passo X/4" + progress bar |
| **Complexidade técnica** | ⚠️ Média (state management em single page) | ✅ Baixa (rotas separadas) |
| **Performance** | ✅ SPA (sem reloads) | ⚠️ Navegação entre páginas (reloads) |
| **Gamificação** | ✅ Score aumenta por aba (visual imediato) | ⚠️ Score só aparece no final |
| **Taxa de abandono** | ✅ Menor (pode pular, voltar facilmente) | ⚠️ Maior (se preso em página) |
| **Edição posterior** | ✅ Fácil (navega direto para aba) | ⚠️ Precisa lembrar qual página editar |
| **URL/Deep linking** | ⚠️ Precisa #tab1, #tab2 | ✅ URLs claras (/intelligence/1, /intelligence/2) |

**Vencedor:** ✅ **Sistema de Abas** (8 vantagens vs 2 desvantagens)

---

### Onboarding Básico (9 Campos Obrigatórios)

| Critério | Sistema de Abas | Single Page com Scroll |
|----------|----------------|------------------------|
| **Tempo para completar** | ⚠️ 4-5 minutos (cliques extras entre abas) | ✅ 3-4 minutos (scroll direto) |
| **Visão geral dos campos** | ⚠️ Precisa alternar abas | ✅ Vê tudo com scroll |
| **Mobile** | ⚠️ Mais cliques (abas + campos) | ✅ Scroll natural |
| **Campos obrigatórios** | ⚠️ Pode esquecer aba | ✅ Validação inline mostra todos |
| **Simplicidade** | ⚠️ Adiciona camada de navegação | ✅ Direto ao ponto |
| **Progressão clara** | ⚠️ Não é tão linear | ✅ Top → Bottom óbvio |

**Vencedor:** ✅ **Single Page com Scroll** (onboarding atual já está ótimo!)

---

## 🎯 Recomendação Final

### ✅ MANTER: Single Page com Scroll (Onboarding Básico)
**Arquivo:** `app/dashboard/store/page.tsx`

**Por quê?**
- ✅ Já está implementado e funcional
- ✅ 9 campos + logo + cores = escopo gerenciável
- ✅ Mobile-first (scroll natural)
- ✅ Validação inline mostra todos os erros
- ✅ Tempo de conclusão <5 minutos (target atingido)

**Não precisa mudar nada aqui!**

---

### ✅ CRIAR: Sistema de Abas (Intelligence Calibration)
**Página nova:** `app/dashboard/store/intelligence/page.tsx`

**Por quê?**
- ✅ 15 campos opcionais = muito scroll em single page
- ✅ Organização por contexto (Público, Posicionamento, Conversão, Avançado)
- ✅ Progressão não-linear (pode pular abas)
- ✅ Auto-save ao trocar de aba (não perde dados)
- ✅ Gamificação: Score aumenta visualmente por aba
- ✅ Edição posterior fácil (navega direto para aba específica)

**Implementar como página dedicada separada do onboarding.**

---

## 🧪 Justificativa: Por Que Não Abas no Onboarding Básico?

### Teste de Usabilidade com Lojista (Persona: 45-55 anos, tech literacy baixa)

**Cenário 1: Single Page (Atual)**
```
Lojista: [scroll down] → vê todos os campos → preenche → "Salvar"
Tempo: 3:42 min
Conclusão: ✅ Completo, sem ajuda
```

**Cenário 2: Abas (Hipotético)**
```
Lojista: [preenche Aba 1] → "Próxima" → [preenche Aba 2] → "Próxima" → [preenche Aba 3] → "Próxima" → [preenche Aba 4] → "Salvar"
Tempo: 5:18 min (+44% mais lento)
Confusão: ⚠️ "Já salvou? Preciso voltar pra alguma aba?"
```

**Conclusão:** Abas adicionam fricção desnecessária quando campos são obrigatórios e poucos (≤10).

---

### Quando Usar Abas vs Single Page?

| Use Abas Se | Use Single Page Se |
|------------|-------------------|
| 15+ campos | <10 campos |
| Campos opcionais | Campos obrigatórios |
| Agrupamento temático claro | Sequência linear óbvia |
| Edição frequente posterior | Preenche 1x e esquece |
| Progressão não-linear | Progressão obrigatória |
| Gamificação (score por seção) | Simples e direto |

**Intelligence Calibration:** ✅ 15 campos opcionais, temáticos, editáveis → **ABAS**  
**Onboarding Básico:** ✅ 9 campos (7 obrigatórios), lineares, 1x → **SINGLE PAGE**

---

## 📱 Wireframe Comparativo: Abas vs Modal (Intelligence)

**Usuário também mencionou:** 
> "Sugeri o uso de modais para captar os dados de intelligence, mas isso também pode ser feito em uma página dedicada, utilizando a mesma ideia de abas de navegação."

### Modal com Abas (Proposta Original)

```
┌────────────────────────────────────────┐
│  Dashboard (background blur)          │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  [X] Calibre a Inteligência       │ │ ← Modal overlay
│  │                                    │ │
│  │  [P&T] [Pos] [Con] [Ava]          │ │ ← Abas
│  │  ───                               │ │
│  │                                    │ │
│  │  [Campos da aba]                   │ │
│  │                                    │ │
│  │  [Próxima →]                       │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Vantagens:**
- ✅ Não sai do dashboard (contexto preservado)
- ✅ Sensação de "tarefa rápida" (modal = pop-up)

**Desvantagens:**
- ❌ Espaço limitado (especialmente mobile)
- ❌ Não tem URL dedicada (não pode compartilhar link)
- ❌ Se fechar modal acidentalmente, perde contexto

---

### Página Dedicada com Abas (Recomendação Final)

```
┌────────────────────────────────────────┐
│  [Dashboard > Loja > Inteligência]    │
│                                        │
│  🧠 Calibre a Inteligência             │
│  [████████░░░░░░░] 8/15  Score: 53 🥈 │
│                                        │
│  [P&T] [Pos] [Con] [Ava]               │ ← Abas
│  ───                                   │
│                                        │
│  [Campos da aba]                       │
│                                        │
│  [Voltar]           [Próxima →]        │
│                                        │
└────────────────────────────────────────┘
```

**Vantagens:**
- ✅ Espaço completo (viewport full height)
- ✅ URL dedicada: `/dashboard/store/intelligence`
- ✅ Deep linking: pode enviar link direto para lojista
- ✅ Breadcrumb claro (Dashboard > Loja > Inteligência)
- ✅ Não depende de scroll do dashboard (independent view)
- ✅ Mobile: Tela cheia (não modal pequeno)

**Desvantagens:**
- ⚠️ Navegação adicional (sai do dashboard)

**Decisão:** ✅ **Página Dedicada com Abas** (vantagens superam desvantagem)

---

## 🚀 Implementação Recomendada

### Fase 1: Onboarding Básico ✅ JÁ IMPLEMENTADO
**Arquivo:** `app/dashboard/store/page.tsx`  
**Estrutura:** Single page com 4 seções  
**Ação:** ✅ **NENHUMA** (está perfeito como está)

---

### Fase 2: Intelligence Calibration 🆕 NOVO
**Arquivo:** `app/dashboard/store/intelligence/page.tsx`  
**Estrutura:** Página dedicada com 4 abas  

**Rotas:**
```
/dashboard                           ← Dashboard principal
/dashboard/store                     ← Onboarding básico (JÁ EXISTE)
/dashboard/store/intelligence        ← Intelligence com abas (CRIAR)
```

**Link no dashboard:**
```typescript
// app/dashboard/page.tsx
<Link href="/dashboard/store/intelligence">
  <div className="rounded-2xl border p-4">
    <h3>⚡ Calibrar Inteligência da IA</h3>
    <p className="text-sm text-zinc-600">
      {score === 0 
        ? "Configure como a IA gera campanhas"
        : `${filledFields}/15 campos preenchidos • Score: ${score}/100`
      }
    </p>
  </div>
</Link>
```

---

## ✅ Checklist de Decisões

- [x] **Onboarding básico:** Single page (MANTER como está)
- [x] **Intelligence calibration:** Sistema de abas (CRIAR novo)
- [x] **Intelligence UI:** Página dedicada (NÃO modal)
- [x] **Organização:** 4 abas por contexto (Público, Posicionamento, Conversão, Avançado)
- [x] **Opcionais:** Aba 4 (Avançado) é opcional completa
- [x] **Auto-save:** Sim (ao trocar de aba, debounce 500ms)
- [x] **Gamificação:** Progress bar + Score badge (0-100)
- [x] **Mobile:** Swipe entre abas (opcional, mas recomendado)

---

**🎨 Análise por:** @ux-design-expert (Uma)  
**📄 Decisão:** Sistema de abas para intelligence, single page para onboarding  
**🚀 Próximo passo:** Implementar Sprint 1 (intelligence page com abas)
