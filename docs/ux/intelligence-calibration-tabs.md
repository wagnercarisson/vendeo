# 🧠 Intelligence Calibration — Página com Sistema de Abas
**Agent:** @ux-design-expert (Uma)  
**Data:** 2026-04-30  
**Baseado em:** `app/dashboard/store/page.tsx` (onboarding básico já implementado)

---

## 📊 Contexto: O Que Já Está Pronto

### ✅ Onboarding Básico Implementado
**Arquivo:** `app/dashboard/store/page.tsx`

**Campos já capturados (9 + logo + cores):**
| Campo | Tabela | Status |
|-------|--------|--------|
| Nome da loja | `stores.name` | ✅ |
| Cidade | `stores.city` | ✅ |
| Estado (UF) | `stores.state` | ✅ |
| Logo | `stores.logo_url` | ✅ Upload drag & drop + preview |
| Segmento principal | `stores.main_segment` | ✅ Dropdown + custom |
| Tom de voz | `stores.tone_of_voice` | ✅ Dropdown + custom |
| Diferencial da loja | `stores.brand_positioning` | ✅ |
| Endereço | `stores.address` | ✅ Opcional |
| Bairro | `stores.neighborhood` | ✅ Opcional |
| Telefone | `stores.phone` | ✅ Máscara BR |
| WhatsApp | `stores.whatsapp` | ✅ Máscara celular |
| Instagram | `stores.instagram` | ✅ Validação @ |
| Cor primária | `stores.primary_color` | ✅ Color picker + preview |
| Cor secundária | `stores.secondary_color` | ✅ Color picker + preview |

**UX atual:** Single page com scroll, 4 seções, validações inline, preview em tempo real.

**Conclusão:** ✅ **Onboarding básico está completo e bem feito. Não precisa refazer.**

---

## 🎯 Gap: Intelligence Calibration (15 Campos)

### ❌ O Que Falta
**Tabela:** `store_intelligence.context` (JSONB)  
**Schema:** v2.1 (Migration 034 já criada)

**15 campos de calibração avançada:**
1. `brand_voice` (enum: formal, informal, technical, playful)
2. `target_audience` (string)
3. `seasonal_peaks` (array<string>)
4. `main_differentiation` (string)
5. `top_products` (array<string>)
6. `price_positioning` (enum: economic, medium, premium, luxury)
7. `average_ticket_brl` (number)
8. `competitors` (array<string>)
9. `unique_selling_proposition` (object)
10. `customer_pain_points` (array<string>)
11. `conversion_triggers` (object: urgency, scarcity, social_proof, guarantee)
12. `successful_past_ctas` (array<object>)
13. `local_events_calendar` (array<string>)
14. `language_specifics` (object: slang, emoji_comfort, formality, max_exclamations)
15. `copy_length_preferences` (object: headline_max_words, body_max_words, prefers_brevity)

**Onde implementar:** Nova página `/dashboard/store/intelligence`

---

## 🎨 Proposta: Página com Sistema de Abas

### Estrutura de Navegação

```
Dashboard → Loja → Calibrar Inteligência
                     ↓
      /dashboard/store/intelligence
                     ↓
      ┌────────────────────────────────────┐
      │  [Público & Tom] [Posicionamento]  │
      │  [Conversão] [Avançado]            │ ← 4 abas
      └────────────────────────────────────┘
                     ↓
            Campos por contexto
            Opcionais por último
```

### Vantagens do Sistema de Abas
✅ **Organização por contexto:** Campos relacionados agrupados  
✅ **Progressão não-linear:** Lojista pode pular abas  
✅ **Menos scroll:** Cada aba tem 3-5 campos (viewport completo)  
✅ **Auto-save:** Salva ao trocar de aba (não perde dados)  
✅ **Mobile-friendly:** Abas horizontais com swipe  
✅ **Gamificação:** Progress bar + score aumenta por aba  

### Desvantagens (Mitigadas)
⚠️ **Não vê todos os campos de uma vez** → Mitigado: Progress indicator mostra X/15  
⚠️ **Pode ficar perdido** → Mitigado: Aba ativa destacada, botão "Próxima aba"  

---

## 📐 Wireframe: Página Intelligence com Abas (Desktop)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Dashboard > Loja > Calibrar Inteligência                    [Salvar]   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🧠 Calibre a inteligência do Vendeo                                     │
│  Quanto mais você conta sobre sua loja, melhores ficam as campanhas     │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ [██████████████░░░░░░░] 8/15 campos preenchidos                 │    │
│  │ Score: 53/100 (Inteligência Média 🥈)                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ [Público & Tom] | Posicionamento | Conversão | Avançado         │← Abas
│  │ ─────────────                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                  CONTEÚDO DA ABA ATIVA                           │    │
│  │                  (ver detalhes abaixo)                           │    │
│  │                                                                  │    │
│  │                                                                  │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  [Voltar]                                   [Próxima aba →]             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Wireframe: Página Intelligence com Abas (Mobile)

```
┌───────────────────────────────────┐
│  ← Calibrar Inteligência          │
├───────────────────────────────────┤
│                                   │
│  [████████░░░░░░░] 8/15          │ ← Progress compacto
│  Score: 53/100 🥈                 │
│                                   │
│  ┌───┬───┬───┬───┐               │
│  │P&T│Pos│Con│Ava│               │ ← Abas compactas (swipe)
│  └───┴───┴───┴───┘               │
│  ──                               │ ← Aba ativa
│                                   │
│  [Conteúdo da aba]                │
│  (3-5 campos por aba)             │
│                                   │
│                                   │
│  ┌────────────────────────────┐  │
│  │  Próxima aba →             │  │ ← CTA grande
│  └────────────────────────────┘  │
│                                   │
└───────────────────────────────────┘
```

---

## 🗂️ Estrutura das 4 Abas

### Aba 1: Público & Tom (5 campos - 33% do score)

**Campos:**
1. **Tom de voz** (radio buttons)
   - Formal, Informal, Técnico, Divertido
   - Opcional (IA usa tom padrão do segmento se vazio)

2. **Público-alvo principal** (textarea)
   - Placeholder: "Ex: Homens 30-50 anos, que curtem vinho, moram no bairro"
   - 200 caracteres max
   - Opcional

3. **Picos sazonais** (multi-select checkboxes)
   - Verão, Inverno, Dia dos Pais, Natal, Black Friday, Páscoa, Dia das Mães
   - + Input "Outros eventos" (text)
   - Opcional

4. **Principais diferenciais** (textarea)
   - Placeholder: "Ex: Atendimento personalizado, entrega rápida, produtos exclusivos"
   - 300 caracteres max
   - Opcional

5. **Produtos top 5** (lista dinâmica)
   - Input: "Nome do produto" (+ botão "Adicionar mais")
   - Max 5 itens
   - Exemplo: "Vinho Chileno, Cerveja Artesanal, Whisky Premium"
   - Opcional

**CTA:** "Próxima aba →"

---

### Aba 2: Posicionamento (5 campos - 33% do score)

**Campos:**
6. **Posicionamento de preço** (select)
   - Econômico, Médio, Premium, Luxo
   - Opcional

7. **Ticket médio (R$)** (number input)
   - Placeholder: "Ex: 150"
   - Opcional
   - Hint: "Ajuda a IA calibrar urgência e CTAs"

8. **Principais concorrentes** (lista dinâmica)
   - Input: "Nome do concorrente" (+ botão "Adicionar mais")
   - Max 3 itens
   - Opcional
   - Hint: "Isso ajuda a destacar seus diferenciais"

9. **Proposta única de venda (USP)** (textarea)
   - Placeholder: "O que só sua loja tem? Ex: Único com entrega em 30 min no bairro"
   - 200 caracteres max
   - Opcional

10. **Dores do cliente que você resolve** (multi-select checkboxes)
    - Falta de tempo, Preço alto, Falta de variedade, Atendimento ruim, Entrega demorada
    - + Input "Outras dores" (text)
    - Opcional

**CTA:** "Próxima aba →"

---

### Aba 3: Conversão (3 campos - 20% do score)

**Campos:**
11. **Gatilhos de conversão** (checkboxes + sliders)
    - **Urgência:** Slider (0-10) "Quanto você usa urgência nas promoções?"
    - **Escassez:** Slider (0-10) "Usa 'últimas unidades' / 'estoque limitado'?"
    - **Prova social:** Checkbox "Tem avaliações/depoimentos de clientes?"
    - **Garantia:** Checkbox "Oferece garantia estendida ou troca fácil?"
    - Opcional

12. **CTAs que já funcionaram** (lista dinâmica)
    - Input: "CTA" (ex: "Compre agora e ganhe 10%")
    - Input: "Contexto" (ex: "Black Friday 2025")
    - + botão "Adicionar mais" (max 3)
    - Opcional
    - Hint: "IA vai reusar CTAs validados"

13. **Eventos locais importantes** (text input)
    - Placeholder: "Ex: Festa do Colono (outubro), Sommerfest (janeiro)"
    - Opcional
    - Hint: "IA cria campanhas alinhadas com calendário local"

**CTA:** "Próxima aba →"

---

### Aba 4: Avançado (2 campos opcionais - 14% do score)

**Campos:**
14. **Preferências de linguagem** (checkboxes + sliders)
    - ☑ Usa gírias regionais (ex: tchê, uai, mano)
    - Conforto com emojis: Slider (0-10)
    - Formalidade: Select (Muito formal → Muito informal)
    - Max exclamações por copy: Slider (0-5)
    - Opcional

15. **Tamanho de copy preferido** (radio buttons)
    - ○ Curto e direto (título: 5-7 palavras, corpo: 15-20 palavras)
    - ○ Médio (título: 8-10 palavras, corpo: 25-35 palavras)
    - ○ Detalhado (título: 10-12 palavras, corpo: 40-50 palavras)
    - Preview: Mostra exemplo de campanha em cada tamanho
    - Opcional

**CTA:** "Salvar e ver resumo"

---

## 📊 Progress & Score System

### Progress Indicator (sempre visível no topo)
```
[████████░░░░░░░░] 8/15 campos preenchidos
```

- Atualiza em tempo real conforme preenche
- Cor verde: progresso
- Cor cinza: campos vazios

### Intelligence Score (0-100)
```typescript
function calculateScore(context: IntelligenceContext): number {
  const weights = {
    // Aba 1: Público & Tom (33%)
    brand_voice: 5,
    target_audience: 8,
    seasonal_peaks: 5,
    main_differentiation: 8,
    top_products: 7,
    
    // Aba 2: Posicionamento (33%)
    price_positioning: 7,
    average_ticket_brl: 5,
    competitors: 5,
    unique_selling_proposition: 8,
    customer_pain_points: 8,
    
    // Aba 3: Conversão (20%)
    conversion_triggers: 7,
    successful_past_ctas: 7,
    local_events_calendar: 6,
    
    // Aba 4: Avançado (14%)
    language_specifics: 7,
    copy_length_preferences: 7,
  };
  
  let total = 0;
  let maxPossible = Object.values(weights).reduce((a, b) => a + b, 0); // 100
  
  for (const [field, weight] of Object.entries(weights)) {
    if (context[field] !== null && context[field] !== undefined) {
      // Check if field is "filled" (not empty string/array)
      const value = context[field];
      const isFilled = 
        (typeof value === 'string' && value.trim().length > 0) ||
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'object' && Object.keys(value).length > 0);
      
      if (isFilled) total += weight;
    }
  }
  
  return Math.round((total / maxPossible) * 100);
}
```

### Badge Visual
| Score | Badge | Emoji |
|-------|-------|-------|
| 0-30 | Inteligência Básica | 🥉 |
| 31-60 | Inteligência Média | 🥈 |
| 61-100 | Inteligência Avançada | 🥇 |

---

## 🔌 API Backend (Já Existe)

### PATCH /api/store/intelligence
**Payload:**
```typescript
{
  store_id: string;
  context: Partial<IntelligenceContext>; // Merge com existente
}
```

**Response:**
```typescript
{
  success: boolean;
  intelligence_score: number; // 0-100
  error?: string;
}
```

**Lógica:**
- Valida ownership (store.owner_user_id === auth.uid())
- Merge context (preserva campos existentes, atualiza apenas os enviados)
- Recalcula score
- Retorna score atualizado

**Auto-save:** Dispara PATCH ao trocar de aba (debounce 500ms)

---

## 🎨 Componentes React (TypeScript)

### 1. IntelligencePage.tsx (Parent)

```typescript
// app/dashboard/store/intelligence/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { IntelligenceTabs } from "./_components/IntelligenceTabs";
import { ProgressIndicator } from "./_components/ProgressIndicator";
import { IntelligenceScoreBadge } from "./_components/IntelligenceScoreBadge";

export default function IntelligencePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [storeId, setStoreId] = useState<string>("");
  const [context, setContext] = useState<Partial<IntelligenceContext>>({});
  const [score, setScore] = useState(0);
  
  const [activeTab, setActiveTab] = useState(0); // 0-3
  
  useEffect(() => {
    loadStoreAndIntelligence();
  }, []);
  
  async function loadStoreAndIntelligence() {
    // Busca store_id do usuário
    const { data: stores } = await supabase
      .from("stores")
      .select("id")
      .limit(1)
      .single();
    
    if (!stores) {
      router.push("/dashboard/store"); // Redireciona para criar loja
      return;
    }
    
    setStoreId(stores.id);
    
    // Busca intelligence context
    const { data: intel } = await supabase
      .from("store_intelligence")
      .select("context")
      .eq("store_id", stores.id)
      .single();
    
    if (intel?.context) {
      setContext(intel.context);
      setScore(calculateScore(intel.context));
    }
    
    setLoading(false);
  }
  
  async function saveContext(updatedContext: Partial<IntelligenceContext>) {
    setSaving(true);
    
    const merged = { ...context, ...updatedContext };
    setContext(merged);
    
    const res = await fetch("/api/store/intelligence", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_id: storeId, context: merged }),
    });
    
    const data = await res.json();
    setScore(data.intelligence_score);
    
    setSaving(false);
  }
  
  function handleTabChange(newTab: number) {
    // Auto-save ao trocar de aba (se houver mudanças)
    setActiveTab(newTab);
  }
  
  if (loading) return <LoadingSkeleton />;
  
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header>
          <h1 className="text-3xl font-semibold">🧠 Calibre a inteligência do Vendeo</h1>
          <p className="mt-2 text-zinc-600">
            Quanto mais você conta sobre sua loja, melhores ficam as campanhas.
          </p>
        </header>
        
        <ProgressIndicator
          filled={Object.keys(context).filter(k => context[k] !== null).length}
          total={15}
        />
        
        <IntelligenceScoreBadge score={score} />
        
        <IntelligenceTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          context={context}
          onUpdateContext={saveContext}
          saving={saving}
        />
        
        <footer className="mt-8 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")}>
            Voltar
          </button>
          <button disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </footer>
      </div>
    </main>
  );
}
```

---

### 2. IntelligenceTabs.tsx (Tab System)

```typescript
// app/dashboard/store/intelligence/_components/IntelligenceTabs.tsx
"use client";

import { Tab1PublicTom } from "./tabs/Tab1PublicTom";
import { Tab2Posicionamento } from "./tabs/Tab2Posicionamento";
import { Tab3Conversao } from "./tabs/Tab3Conversao";
import { Tab4Avancado } from "./tabs/Tab4Avancado";

const TABS = [
  { id: 0, label: "Público & Tom", short: "P&T" },
  { id: 1, label: "Posicionamento", short: "Pos" },
  { id: 2, label: "Conversão", short: "Con" },
  { id: 3, label: "Avançado", short: "Ava" },
];

interface Props {
  activeTab: number;
  onTabChange: (tab: number) => void;
  context: Partial<IntelligenceContext>;
  onUpdateContext: (updated: Partial<IntelligenceContext>) => void;
  saving: boolean;
}

export function IntelligenceTabs({
  activeTab,
  onTabChange,
  context,
  onUpdateContext,
  saving,
}: Props) {
  return (
    <div className="mt-6 rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {/* Tab Headers */}
      <div className="flex gap-2 border-b border-zinc-100 p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 rounded-xl px-4 py-3 text-sm font-medium transition
              ${activeTab === tab.id
                ? "bg-emerald-100 text-emerald-900"
                : "text-zinc-600 hover:bg-zinc-50"
              }
            `}
          >
            {/* Desktop: label completo */}
            <span className="hidden sm:inline">{tab.label}</span>
            {/* Mobile: label curto */}
            <span className="sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 0 && (
          <Tab1PublicTom
            context={context}
            onUpdate={onUpdateContext}
          />
        )}
        {activeTab === 1 && (
          <Tab2Posicionamento
            context={context}
            onUpdate={onUpdateContext}
          />
        )}
        {activeTab === 2 && (
          <Tab3Conversao
            context={context}
            onUpdate={onUpdateContext}
          />
        )}
        {activeTab === 3 && (
          <Tab4Avancado
            context={context}
            onUpdate={onUpdateContext}
          />
        )}
        
        {/* CTA "Próxima aba" */}
        {activeTab < 3 && (
          <button
            onClick={() => onTabChange(activeTab + 1)}
            className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
            disabled={saving}
          >
            Próxima aba →
          </button>
        )}
        
        {activeTab === 3 && (
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
          >
            Salvar e voltar ao dashboard
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### 3. Tab1PublicTom.tsx (Exemplo de Aba)

```typescript
// app/dashboard/store/intelligence/_components/tabs/Tab1PublicTom.tsx
"use client";

import { useState, useEffect } from "react";

interface Props {
  context: Partial<IntelligenceContext>;
  onUpdate: (updated: Partial<IntelligenceContext>) => void;
}

export function Tab1PublicTom({ context, onUpdate }: Props) {
  const [brandVoice, setBrandVoice] = useState(context.brand_voice || "");
  const [targetAudience, setTargetAudience] = useState(context.target_audience || "");
  const [seasonalPeaks, setSeasonalPeaks] = useState<string[]>(context.seasonal_peaks || []);
  const [mainDifferentiation, setMainDifferentiation] = useState(context.main_differentiation || "");
  const [topProducts, setTopProducts] = useState<string[]>(context.top_products || []);
  
  // Auto-save ao alterar (debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      onUpdate({
        brand_voice: brandVoice as any,
        target_audience: targetAudience,
        seasonal_peaks: seasonalPeaks,
        main_differentiation: mainDifferentiation,
        top_products: topProducts,
      });
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [brandVoice, targetAudience, seasonalPeaks, mainDifferentiation, topProducts]);
  
  return (
    <div className="grid gap-4">
      {/* Campo 1: Tom de voz */}
      <div>
        <label className="text-sm font-medium">Tom de voz</label>
        <div className="mt-2 grid gap-2">
          {["formal", "informal", "technical", "playful"].map((tone) => (
            <label key={tone} className="flex items-center gap-2">
              <input
                type="radio"
                name="brand_voice"
                value={tone}
                checked={brandVoice === tone}
                onChange={(e) => setBrandVoice(e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm capitalize">{tone}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Campo 2: Público-alvo */}
      <div>
        <label className="text-sm font-medium">Público-alvo principal</label>
        <textarea
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="Ex: Homens 30-50 anos, que curtem vinho, moram no bairro"
          maxLength={200}
          className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm"
          rows={3}
        />
        <div className="text-xs text-zinc-500">{targetAudience.length}/200 caracteres</div>
      </div>
      
      {/* Campo 3: Picos sazonais (multi-select checkboxes) */}
      <div>
        <label className="text-sm font-medium">Picos sazonais</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["Verão", "Inverno", "Dia dos Pais", "Natal", "Black Friday", "Páscoa", "Dia das Mães"].map((peak) => (
            <label key={peak} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={seasonalPeaks.includes(peak)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSeasonalPeaks([...seasonalPeaks, peak]);
                  } else {
                    setSeasonalPeaks(seasonalPeaks.filter(p => p !== peak));
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm">{peak}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Campo 4: Principais diferenciais */}
      <div>
        <label className="text-sm font-medium">Principais diferenciais</label>
        <textarea
          value={mainDifferentiation}
          onChange={(e) => setMainDifferentiation(e.target.value)}
          placeholder="Ex: Atendimento personalizado, entrega rápida, produtos exclusivos"
          maxLength={300}
          className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm"
          rows={3}
        />
        <div className="text-xs text-zinc-500">{mainDifferentiation.length}/300 caracteres</div>
      </div>
      
      {/* Campo 5: Produtos top 5 (lista dinâmica) */}
      <div>
        <label className="text-sm font-medium">Produtos top 5</label>
        <div className="mt-2 grid gap-2">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={product}
                onChange={(e) => {
                  const updated = [...topProducts];
                  updated[index] = e.target.value;
                  setTopProducts(updated);
                }}
                className="flex-1 rounded-xl border border-zinc-200 p-2 text-sm"
                placeholder={`Produto ${index + 1}`}
              />
              <button
                onClick={() => setTopProducts(topProducts.filter((_, i) => i !== index))}
                className="text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          
          {topProducts.length < 5 && (
            <button
              onClick={() => setTopProducts([...topProducts, ""])}
              className="rounded-xl border border-dashed border-zinc-300 py-2 text-sm text-zinc-600"
            >
              + Adicionar produto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 📱 Responsividade: Desktop vs Mobile

### Desktop (1024px+)
- Abas com labels completos ("Público & Tom")
- Campos lado a lado (grid 2 colunas)
- Progress bar horizontal
- Hover states

### Mobile (375px)
- Abas com labels curtos ("P&T")
- Campos empilhados (1 coluna)
- Progress bar compacto
- Swipe entre abas (opcional: react-swipeable)
- Touch targets 48dp mínimo

---

## ✅ Checklist de Implementação

### Backend (Já Existe)
- [x] Migration 031: `store_intelligence` table
- [x] Migration 034: JSONB context v2.1 (15 campos documentados)
- [ ] API PATCH `/api/store/intelligence` (criar se não existe)
- [ ] Score calculator function
- [ ] Validação de ownership (RLS já ativo)

### Frontend (Novo)
- [ ] Página `app/dashboard/store/intelligence/page.tsx`
- [ ] Componente `IntelligenceTabs.tsx` (tab system)
- [ ] Componente `Tab1PublicTom.tsx` (5 campos)
- [ ] Componente `Tab2Posicionamento.tsx` (5 campos)
- [ ] Componente `Tab3Conversao.tsx` (3 campos)
- [ ] Componente `Tab4Avancado.tsx` (2 campos)
- [ ] Componente `ProgressIndicator.tsx`
- [ ] Componente `IntelligenceScoreBadge.tsx`
- [ ] Auto-save (debounce 500ms ao trocar de aba)
- [ ] Mobile: Swipe entre abas (opcional)

### Dashboard Integration
- [ ] Link no dashboard: "⚡ Calibrar Inteligência da IA"
- [ ] Badge no link: "X/15 campos preenchidos" (se já iniciado)
- [ ] Redirect: Se loja não existe → `/dashboard/store`

---

## 🎯 Métricas de Sucesso

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Taxa de acesso** | 30%+ lojistas abrem página | Analytics: `intelligence_page_opened` |
| **Campos preenchidos** | Média 8/15 (53%) | Avg non-null fields em `store_intelligence.context` |
| **Score médio** | 53+ (Inteligência Média) | Avg `intelligence_score` calculado |
| **Taxa de conclusão** | 20%+ preenchem Aba 4 (Avançado) | Analytics: `tab_4_reached` |
| **Tempo médio** | 5-8 minutos | Analytics: `intelligence_page_opened` → `intelligence_saved` |

---

**🧠 Documento criado por:** @ux-design-expert (Uma)  
**📄 Referência:** Onboarding atual (`app/dashboard/store/page.tsx`)  
**🚀 Status:** Pronto para implementação (Sprint 1)
