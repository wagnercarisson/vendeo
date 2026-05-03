# Intelligence UX Corrections — Guia de Implementação Consolidado

**Data:** 2 de maio de 2026  
**Origem:** @ux-design-expert (Uma)  
**Destino:** @dev (Dex)  
**Objetivo:** Consolidar 3 artefatos UX em 1 guia executável  
**Sprint:** Intelligence Sprint 2 (correções UX)

---

## 📋 CONTEXTO

Este documento consolida **13 correções UX** identificadas após implementação das Stories 2A e 2B:

| Fonte | Correções | Status Atual |
|-------|-----------|-------------|
| `intelligence-campos-selecao-proposta.md` | 5 campos texto → seleções | ❌ PARCIAL (2 de 5 feitos) |
| `intelligence-micro-refinamentos.md` | 5 bugs pós-implementação | ❌ NÃO IMPLEMENTADO |
| `intelligence-tabs3-4-ajustes-finais.md` | 3 ajustes finais | ❌ NÃO IMPLEMENTADO |

**Problema identificado pelo usuário:**
> "tínhamos definido que os campos descritivos seriam, em sua maioria, substituídos por caixas de seleção ou menus dropdown... no entanto, ao navegar pelo aplicativo atual, noto que essas facilidades foram perdidas"

**Diagnóstico confirmado:** REGRESSÃO PARCIAL — apenas 2 de 5 campos convertidos para seleções.

---

## 🎯 OBJETIVO

Implementar as **13 correções UX** em ordem de prioridade, garantindo que:

1. ✅ Lojista não-técnico preenche formulário em ≤5 minutos (vs. atual ~8-10 min)
2. ✅ Taxa de preenchimento sobe de ~60% para 95%+
3. ✅ Qualidade dos dados melhora (entradas estruturadas vs. texto livre)
4. ✅ Bugs visuais e de usabilidade sejam corrigidos

---

## 🚀 PRIORIZAÇÃO (Por Impacto)

### 🔴 PRIORIDADE ALTA (5 itens) — Bloqueadores de UX

| # | Correção | Arquivo Afetado | Tempo |
|---|----------|----------------|-------|
| 1 | Campo `target_audience` texto → Select + presets | Tab1-PublicoTom.tsx | 30 min |
| 2 | Campo `main_differentiation` texto → ChoiceChips + presets | Tab2-Posicionamento.tsx | 30 min |
| 3 | Campo custom "pain points" adicionar botão "Adicionar" | Tab2-Posicionamento.tsx | 15 min |
| 4 | CTAs empilhados verticalmente (não lado a lado) | FormPrimitives.tsx | 10 min |
| 5 | Remover campo "velocidade de conversão (segundos)" | FormPrimitives.tsx, Tab3-Conversao.tsx | 30 min |

**Total:** 1h 55min

---

### 🟡 PRIORIDADE MÉDIA (4 itens) — Melhorias de Usabilidade

| # | Correção | Arquivo Afetado | Tempo |
|---|----------|----------------|-------|
| 6 | Ticket médio com máscara BRL | Tab2-Posicionamento.tsx, criar `lib/formatters/currency.ts` | 20 min |
| 7 | Substituir "concisão" → "objetividade" | Tab4-Avancado.tsx | 5 min |
| 8 | Adicionar valores recomendados (placeholders + hints) | Tab4-Avancado.tsx | 45 min |
| 9 | Melhorar `competitors` com segmentação | Tab2-Posicionamento.tsx | 40 min |

**Total:** 1h 50min

---

### 🟢 PRIORIDADE BAIXA (4 itens) — Polimento Visual

| # | Correção | Arquivo Afetado | Tempo |
|---|----------|----------------|-------|
| 10 | Hint duplicada (remover duplicação) | Tab4-Avancado.tsx | 5 min |
| 11 | Campo CTA aceitar espaços (debug) | FormPrimitives.tsx | 15 min |
| 12 | Adicionar ícones em `seasonal_peaks` | Tab1-PublicoTom.tsx | 20 min |
| 13 | Contador visual em `customer_pain_points` | Tab2-Posicionamento.tsx | 10 min |

**Total:** 50 min

---

**TEMPO TOTAL ESTIMADO:** 4h 35min (1 dia de trabalho)

---

## 📐 ESPECIFICAÇÕES DETALHADAS (Por Prioridade)

---

## 🔴 ALTA PRIORIDADE

### 1. Campo `target_audience` — Texto → Select + Presets

**Arquivo:** `app/dashboard/store/intelligence/components/Tab1-PublicoTom.tsx`

#### Estado Atual (PROBLEMÁTICO)
```tsx
<FieldShell label="Público-alvo principal" optional>
  <TextArea
    value={context.target_audience}
    onChange={(value) => updateField("target_audience", value)}
    placeholder="Ex: Homens 30-50 anos, famílias do bairro..."
    rows={3}
  />
</FieldShell>
```

**Problema:** Lojista paralisa ("o que eu coloco aqui?"), digita respostas vagas ("todo mundo", "pessoas").

#### Estado Desejado
```tsx
<FieldShell
  label="Público-alvo principal"
  optional
  hint="Quem mais compra na sua loja?"
>
  <SelectInput
    value={context.target_audience_preset ?? ""}
    onChange={(value) => {
      updateField("target_audience_preset", value);
      
      if (value === "custom") {
        updateField("target_audience", "");
      } else if (value === "") {
        updateField("target_audience", null);
      } else {
        updateField("target_audience", TARGET_AUDIENCE_LABELS[value]);
      }
    }}
    placeholder="Selecione o público principal"
    options={[
      { label: "Famílias do bairro", value: "families" },
      { label: "Jovens 18-25 anos", value: "young_adults" },
      { label: "Profissionais 30-50 anos", value: "professionals" },
      { label: "Idosos aposentados", value: "seniors" },
      { label: "Estudantes universitários", value: "students" },
      { label: "Pais com crianças pequenas", value: "parents" },
      { label: "Público misto (todas as idades)", value: "mixed_age" },
      { label: "✍️ Outros (descrever)", value: "custom" },
    ]}
  />

  {context.target_audience_preset === "custom" && (
    <TextArea
      className="mt-3"
      value={context.target_audience ?? ""}
      onChange={(value) => updateField("target_audience", value)}
      placeholder="Descreva seu público principal..."
      maxLength={200}
      rows={3}
    />
  )}
</FieldShell>
```

#### Dados TypeScript
```typescript
// Adicionar ao IntelligenceContext (useIntelligenceForm.ts)
target_audience_preset?: 
  | "families" 
  | "young_adults" 
  | "professionals" 
  | "seniors" 
  | "students" 
  | "parents" 
  | "mixed_age" 
  | "custom"
  | null;

// Labels para mapeamento
const TARGET_AUDIENCE_LABELS: Record<string, string> = {
  families: "Famílias do bairro",
  young_adults: "Jovens entre 18-25 anos",
  professionals: "Profissionais liberais (30-50 anos)",
  seniors: "Idosos aposentados",
  students: "Estudantes universitários",
  parents: "Pais com crianças pequenas",
  mixed_age: "Público misto (todas as idades)",
};
```

#### Critérios de Aceitação
- ✅ Select com 8 opções (7 presets + "Outros")
- ✅ Ao selecionar preset, `target_audience` recebe label mapeado
- ✅ Ao selecionar "Outros", TextArea aparece abaixo
- ✅ Campo continua opcional (pode ficar vazio)

---

### 2. Campo `main_differentiation` — Texto → ChoiceChips + Presets

**Arquivo:** `app/dashboard/store/intelligence/components/Tab2-Posicionamento.tsx`

#### Estado Atual (PROBLEMÁTICO)
```tsx
<FieldShell label="Diferencial principal" optional>
  <TextArea
    value={context.main_differentiation}
    onChange={(value) => updateField("main_differentiation", value)}
    placeholder="Ex: Atendimento rápido, produtos gelados..."
    rows={3}
  />
</FieldShell>
```

**Problema:** Respostas vagas ("bom atendimento", "qualidade"), campo frequentemente vazio.

#### Estado Desejado
```tsx
<FieldShell
  label="Diferencial principal"
  optional
  hint="O que faz o cliente escolher você em vez da concorrência?"
>
  <ChoiceChips
    options={[
      { label: "💰 Melhor preço da região", value: "price" },
      { label: "⭐ Alta qualidade", value: "quality" },
      { label: "🤝 Atendimento personalizado", value: "service" },
      { label: "🛒 Maior variedade", value: "variety" },
      { label: "📍 Conveniência e localização", value: "convenience" },
      { label: "🎓 Especialização técnica", value: "expertise" },
      { label: "⚡ Rapidez no atendimento", value: "speed" },
      { label: "🏆 Tradição e confiança", value: "trust" },
      { label: "✍️ Outro", value: "custom" },
    ]}
    value={context.main_differentiation_preset ?? ""}
    onChange={(value) => {
      updateField("main_differentiation_preset", value);
      
      if (value === "custom") {
        updateField("main_differentiation", "");
      } else if (value === "") {
        updateField("main_differentiation", null);
      } else {
        updateField("main_differentiation", DIFFERENTIATION_LABELS[value]);
      }
    }}
  />

  {context.main_differentiation_preset === "custom" && (
    <TextArea
      className="mt-3"
      value={context.main_differentiation ?? ""}
      onChange={(value) => updateField("main_differentiation", value)}
      placeholder="Descreva o diferencial único da sua loja..."
      maxLength={300}
      rows={3}
    />
  )}
</FieldShell>
```

#### Dados TypeScript
```typescript
// Adicionar ao IntelligenceContext
main_differentiation_preset?: 
  | "price" 
  | "quality" 
  | "service" 
  | "variety" 
  | "convenience" 
  | "expertise" 
  | "speed" 
  | "trust" 
  | "custom"
  | null;

// Labels
const DIFFERENTIATION_LABELS: Record<string, string> = {
  price: "Oferecemos o melhor preço da região",
  quality: "Trabalhamos apenas com produtos de alta qualidade",
  service: "Nosso atendimento é personalizado e atencioso",
  variety: "Temos a maior variedade de produtos",
  convenience: "Localização conveniente e fácil acesso",
  expertise: "Equipe especializada com conhecimento técnico profundo",
  speed: "Atendimento rápido e eficiente",
  trust: "Tradição e confiança construídas ao longo dos anos",
};
```

#### Critérios de Aceitação
- ✅ ChoiceChips com 9 opções (8 presets + "Outro")
- ✅ Ao selecionar preset, `main_differentiation` recebe label mapeado
- ✅ Ao selecionar "Outro", TextArea aparece abaixo
- ✅ Ícones (emojis) visíveis ao lado de cada label

---

### 3. Campo Custom "Pain Points" — Adicionar Botão "Adicionar"

**Arquivo:** `app/dashboard/store/intelligence/components/Tab2-Posicionamento.tsx`

#### Problema Identificado
No print 2 da validação, lojista escreveu **"Não tem atendimento especializado"** no campo custom, mas:
- ❌ Não há botão "Adicionar"
- ❌ Campo não é adicionado automaticamente ao array `customer_pain_points`
- ❌ Contador permanece em `3/4` mesmo com campo preenchido

#### Estado Atual (PROBLEMÁTICO)
```tsx
<TextInput
  value={context.customer_pain_points_custom}
  onChange={(value) => updateField("customer_pain_points_custom", value)}
  placeholder="Outro problema que sua loja resolve"
  maxLength={100}
/>
```

#### Estado Desejado
```tsx
<div className="mt-3">
  <div className="flex gap-2">
    <input
      value={context.customer_pain_points_custom ?? ""}
      onChange={(e) => updateField("customer_pain_points_custom", e.target.value)}
      placeholder="Outro problema que sua loja resolve"
      maxLength={100}
      className="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    />
    <button
      type="button"
      onClick={() => {
        const customValue = context.customer_pain_points_custom?.trim();
        if (!customValue) return;
        if ((context.customer_pain_points?.length ?? 0) >= 4) return;
        if (context.customer_pain_points?.includes(customValue)) return; // Evita duplicata

        // Adiciona ao array
        toggleArrayValue("customer_pain_points", customValue);

        // Limpa o campo custom
        updateField("customer_pain_points_custom", "");
      }}
      disabled={
        !context.customer_pain_points_custom?.trim() ||
        (context.customer_pain_points?.length ?? 0) >= 4
      }
      className="shrink-0 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Adicionar
    </button>
  </div>
  <div className="mt-1 text-xs text-zinc-500">
    Descreva um problema específico do seu segmento e clique em "Adicionar".
  </div>
</div>
```

#### Critérios de Aceitação
- ✅ Botão "Adicionar" visível ao lado do campo custom
- ✅ Clicar "Adicionar" move valor para o array `customer_pain_points[]`
- ✅ Contador atualiza de `3/4` para `4/4` imediatamente
- ✅ Campo custom é limpo após adicionar
- ✅ Botão fica disabled quando limite (4/4) é atingido
- ✅ Botão fica disabled quando campo custom está vazio

---

### 4. CTAs Empilhados Verticalmente (Não Lado a Lado)

**Arquivo:** `app/dashboard/store/intelligence/components/FormPrimitives.tsx` (componente `CTAListField`)

#### Problema Identificado
No print 3 da validação, os campos **"Chamada (CTA)"** e **"Contexto da campanha"** aparecem lado a lado, fazendo o texto ficar ilegível (truncado).

#### Estado Atual (PROBLEMÁTICO)
```tsx
<div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
  <div>
    <label className="block text-xs font-medium text-zinc-700">Chamada (CTA)</label>
    <input ... />
  </div>
  <div>
    <label className="block text-xs font-medium text-zinc-700">Contexto da campanha</label>
    <input ... />
  </div>
  <button>Remover</button>
</div>
```

#### Estado Desejado
```tsx
<div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
  <div>
    <label className="block text-xs font-medium text-zinc-700 mb-1">
      Chamada (CTA)
    </label>
    <input
      value={item.cta}
      onChange={(event) => updateItem(index, { cta: event.target.value })}
      placeholder="Ex: Passe aqui hoje"
      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    />
  </div>

  <div>
    <label className="block text-xs font-medium text-zinc-700 mb-1">
      Contexto da campanha
    </label>
    <input
      value={item.context}
      onChange={(event) => updateItem(index, { context: event.target.value })}
      placeholder="Ex: promoção relâmpago, queima de estoque"
      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    />
  </div>

  <div className="flex justify-end">
    <button
      type="button"
      onClick={() => removeItem(index)}
      className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900"
    >
      Remover
    </button>
  </div>
</div>
```

#### Critérios de Aceitação
- ✅ Campos "Chamada" e "Contexto" aparecem **verticalmente** (um abaixo do outro)
- ✅ Texto completo sempre visível (não trunca)
- ✅ Labels claros acima de cada campo
- ✅ Botão "Remover" alinhado à direita, não compete com inputs

---

### 5. Remover Campo "Velocidade de Conversão (Segundos)"

**Arquivos:**
- `app/dashboard/store/intelligence/components/FormPrimitives.tsx` (tipo `CTAEntry`)
- `app/dashboard/store/intelligence/hooks/useIntelligenceForm.ts` (tipo `IntelligenceContext`)

#### Problema Identificado
> "Eu (co-criador) ainda fico confuso quando vc me fala de velocidade nos ctas... não sei, talvez o usuário (lojista) vai entender melhor que eu, mas me parece confuso da forma como está"

**Análise:** Se o co-criador técnico ficou confuso, o lojista não-técnico vai paralisar. Remover campo.

#### Estado Atual (PROBLEMÁTICO)
```typescript
// FormPrimitives.tsx
type CTAEntry = {
  cta: string;
  context: string;
  approval_speed_seconds?: number; // ❌ REMOVER
};

// JSX
<div className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_0.7fr_auto] items-start">
  {/* Campo 1: CTA */}
  {/* Campo 2: Context */}
  {/* Campo 3: Segundos ❌ REMOVER */}
  {/* Botão Remover */}
</div>
```

#### Estado Desejado
```typescript
// FormPrimitives.tsx
type CTAEntry = {
  cta: string;
  context: string;
  // ✅ approval_speed_seconds REMOVIDO
};

// useIntelligenceForm.ts
successful_past_ctas?: Array<{
  cta: string;
  context: string;
  // ✅ approval_speed_seconds REMOVIDO
}>;
```

#### Critérios de Aceitação
- ✅ Tipo `CTAEntry` não contém `approval_speed_seconds`
- ✅ Tipo `IntelligenceContext.successful_past_ctas` não contém campo de segundos
- ✅ Grid agora tem **2 campos + botão Remover** (não 3 campos + botão)
- ✅ TypeScript compila sem erros

---

## 🟡 MÉDIA PRIORIDADE

### 6. Ticket Médio com Máscara BRL

**Arquivos:**
- Criar `lib/formatters/currency.ts`
- Modificar `app/dashboard/store/intelligence/components/Tab2-Posicionamento.tsx`

#### Criar Formatter

**Arquivo novo:** `lib/formatters/currency.ts`
```typescript
export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export function parseBRL(formatted: string): number | null {
  if (!formatted) return null;
  
  // Remove R$, espaços, pontos de milhar
  const cleaned = formatted.replace(/[R$\s.]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}
```

#### Implementar em Tab2

**Arquivo:** `app/dashboard/store/intelligence/components/Tab2-Posicionamento.tsx`

```tsx
import { formatBRL, parseBRL } from "@/lib/formatters/currency";
import { useState } from "react";

// Dentro do componente
const [ticketDisplay, setTicketDisplay] = useState<string>(
  formatBRL(context.average_ticket_brl)
);

// No JSX
<FieldShell
  label="Ticket médio (R$)"
  optional
  hint="Ajuda a calibrar linguagem, ofertas e urgência."
  error={errors.average_ticket_brl}
>
  <input
    type="text"
    value={ticketDisplay}
    onChange={(e) => setTicketDisplay(e.target.value)}
    onBlur={() => {
      const parsed = parseBRL(ticketDisplay);
      updateField("average_ticket_brl", parsed);
      setTicketDisplay(formatBRL(parsed));
    }}
    placeholder="Ex: R$ 150,00"
    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
  />
</FieldShell>
```

#### Critérios de Aceitação
- ✅ Campo aceita entrada livre (`150`, `R$ 150`, `150.50`)
- ✅ Ao sair do campo, formata automaticamente para `R$ 150,00`
- ✅ Valor salvo no banco permanece numérico (`150.00`)

---

### 7. Substituir "Concisão" → "Objetividade"

**Arquivo:** `app/dashboard/store/intelligence/components/Tab4-Avancado.tsx`

#### Estado Atual
```tsx
<CheckboxRow
  checked={Boolean(copyLength.prefers_brevity)}
  onChange={(checked) => updateField("copy_length_preferences.prefers_brevity", checked)}
  label="Prefiro textos curtos e diretos"
  description="Ativa um modo geral de concisão, independente dos limites acima."
/>
```

#### Estado Desejado
```tsx
<CheckboxRow
  checked={Boolean(copyLength.prefers_brevity)}
  onChange={(checked) => updateField("copy_length_preferences.prefers_brevity", checked)}
  label="Prefiro textos curtos e diretos"
  description="Ativa um modo geral de objetividade: o Vendeo vai priorizar frases enxutas e diretas, independente dos limites de palavras definidos acima."
/>
```

#### Critérios de Aceitação
- ✅ Palavra "concisão" substituída por "objetividade"
- ✅ Description expandida para explicar melhor

---

### 8. Adicionar Valores Recomendados (Placeholders + Hints)

**Arquivo:** `app/dashboard/store/intelligence/components/Tab4-Avancado.tsx`

#### Adicionar Hint Geral no Topo

```tsx
export function Tab4Avancado({ context, errors, updateField }: ...) {
  const language = context.language_specifics ?? {};
  const copyLength = context.copy_length_preferences ?? {};

  return (
    <div className="space-y-4">
      {/* HINT GLOBAL (aparece uma vez só) */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Dica:</strong> Se tiver dúvida em algum campo numérico, use o valor recomendado.
            Você pode ajustar depois se achar melhor.
          </span>
        </div>
      </div>

      {/* GRID COM AS DUAS COLUNAS */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Campos aqui */}
      </div>
    </div>
  );
}
```

#### Atualizar Placeholders dos Campos Numéricos

```tsx
{/* Campo: Máximo de palavras no título */}
<div>
  <label htmlFor="headline-max-words" className="block text-sm font-medium text-zinc-900 mb-2">
    Máximo de palavras no título (headline)
  </label>
  <TextInput
    id="headline-max-words"
    type="number"
    min={0}
    value={copyLength.headline_max_words}
    onChange={(value) =>
      updateField(
        "copy_length_preferences.headline_max_words",
        value === "" ? undefined : Number(value)
      )
    }
    placeholder="Recomendado: 8 palavras"
  />
  <div className="mt-1 text-xs text-zinc-500">
    Quantas palavras no máximo para o título da campanha? Títulos curtos (6-10 palavras) têm maior engajamento.
  </div>
</div>

{/* Campo: Máximo de palavras no corpo */}
<div>
  <label htmlFor="body-max-words" className="block text-sm font-medium text-zinc-900 mb-2">
    Máximo de palavras no corpo da campanha
  </label>
  <TextInput
    id="body-max-words"
    type="number"
    min={0}
    value={copyLength.body_max_words}
    onChange={(value) =>
      updateField(
        "copy_length_preferences.body_max_words",
        value === "" ? undefined : Number(value)
      )
    }
    placeholder="Recomendado: 50 palavras"
  />
  <div className="mt-1 text-xs text-zinc-500">
    Quantas palavras no máximo para a descrição da campanha? Textos entre 40-60 palavras mantêm atenção do cliente.
  </div>
</div>

{/* Campo: Conforto com emojis */}
<div>
  <label htmlFor="emoji-comfort" className="block text-sm font-medium text-zinc-900 mb-2">
    Conforto com emojis
  </label>
  <SliderField
    id="emoji-comfort"
    value={language.emoji_comfort ?? 4}
    onChange={(value) => updateField("language_specifics.emoji_comfort", value)}
    min={0}
    max={10}
    leftLabel="Sem emoji"
    rightLabel="Emoji liberado"
  />
  <div className="mt-2 text-xs text-zinc-500">
    Quanto mais alto, mais emojis o Vendeo vai usar. <strong>Recomendado: 4 a 6</strong> (equilíbrio entre descontração e profissionalismo).
  </div>
</div>

{/* Campo: Máximo de exclamações */}
<div>
  <label htmlFor="max-exclamations" className="block text-sm font-medium text-zinc-900 mb-2">
    Máximo de exclamações por texto
  </label>
  <TextInput
    id="max-exclamations"
    type="number"
    min={0}
    max={5}
    value={language.max_exclamations_per_copy}
    onChange={(value) =>
      updateField(
        "language_specifics.max_exclamations_per_copy",
        value === "" ? undefined : Number(value)
      )
    }
    placeholder="Recomendado: 2"
  />
  <div className="mt-1 text-xs text-zinc-500">
    Quantas vezes "!" pode aparecer? <strong>Recomendado: 1 a 2</strong> (urgência sem exagero).
  </div>
</div>
```

#### Critérios de Aceitação
- ✅ Hint geral aparece no topo da Tab 4
- ✅ Todos os placeholders numéricos mostram "Recomendado: X"
- ✅ Hints abaixo de cada campo explicam **por que** aquele valor é recomendado

---

### 9. Melhorar `competitors` com Segmentação

**Arquivo:** `app/dashboard/store/intelligence/components/Tab2-Posicionamento.tsx`

#### Estado Atual
```tsx
<StringListField
  values={context.competitors ?? []}
  onChange={(values) => setStringList("competitors", values)}
  placeholder="Ex: Adega da esquina"
  addLabel="Adicionar concorrente"
  max={3}
/>
```

#### Estado Desejado (Avançado — Opcional)

Esta correção é **OPCIONAL** por aumentar a complexidade. Implementar apenas se houver tempo.

```tsx
<FieldShell
  label="Principais concorrentes"
  optional
  hint="Quem mais disputa cliente com você? (máximo 3)"
>
  {/* Tipo de concorrência */}
  <div className="mb-4 space-y-2">
    <label className="text-sm font-medium">Tipo de concorrência:</label>
    <ChoiceChips
      options={[
        { label: "Lojas locais (mesmo bairro)", value: "local" },
        { label: "Redes regionais", value: "regional" },
        { label: "Grandes redes nacionais", value: "national" },
        { label: "E-commerces", value: "online" },
      ]}
      value={context.competitor_type ?? "local"}
      onChange={(value) => updateField("competitor_type", value)}
    />
  </div>

  {/* Se nacional, mostrar checkboxes com sugestões */}
  {context.competitor_type === "national" && (
    <div className="space-y-2">
      <label className="text-sm font-medium">Selecione as redes:</label>
      <MultiSelectChips
        options={getCompetitorsBySegment(storeSegment).map(comp => ({
          label: comp,
          value: comp
        }))}
        values={context.competitors ?? []}
        onToggle={(value) => toggleArrayValue("competitors", value)}
        max={3}
      />
    </div>
  )}

  {/* Se local/regional/online, campo texto */}
  {context.competitor_type !== "national" && (
    <StringListField
      values={context.competitors ?? []}
      onChange={(values) => setStringList("competitors", values)}
      placeholder="Ex: Adega da esquina"
      addLabel="Adicionar concorrente"
      max={3}
    />
  )}
</FieldShell>
```

#### Dados TypeScript
```typescript
// Adicionar ao IntelligenceContext
competitor_type?: "local" | "regional" | "national" | "online";

// Sugestões por segmento (exemplos)
const COMPETITORS_BY_SEGMENT: Record<string, string[]> = {
  farmacia: ["Drogasil", "Drogaria São Paulo", "Pacheco", "Pague Menos", "Extrafarma"],
  adega: ["Mundial Vinhos", "Evino", "Grand Cru", "Mistral"],
  moda: ["Renner", "C&A", "Riachuelo", "Marisa", "Lojas Pompéia"],
  beauty: ["O Boticário", "Natura", "Sephora", "Eudora", "Avon"],
  home_decor: ["Leroy Merlin", "Tok&Stok", "Etna", "Casa & Vídeo", "Camicado"],
};

function getCompetitorsBySegment(segment?: string): string[] {
  return COMPETITORS_BY_SEGMENT[segment ?? "farmacia"] ?? [];
}
```

---

## 🟢 BAIXA PRIORIDADE

### 10. Hint Duplicada (Remover Duplicação)

**Arquivo:** `app/dashboard/store/intelligence/components/Tab4-Avancado.tsx`

#### Problema
A mesma hint azul aparece em **duas** FieldShells (Linguagem específica e Tamanho preferido da copy).

#### Solução
Mover hint para fora das FieldShells (antes do grid) — já especificado no item #8.

---

### 11. Campo CTA Aceitar Espaços (Debug)

**Arquivo:** `app/dashboard/store/intelligence/components/FormPrimitives.tsx` (componente `CTAListField`)

#### Problema Identificado
No print 4 da validação, lojista tentou digitar **"passe nalo"** (espaços foram removidos).

#### Diagnóstico
Verificar se há `.trim()` ou regex no `onChange` que remova espaços. Adicionar handler explícito se necessário:

```tsx
<input
  value={item.cta}
  onChange={(event) => {
    const value = event.target.value; // Garante espaços preservados
    updateItem(index, { cta: value });
  }}
  onKeyDown={(e) => {
    if (e.key === " ") {
      e.stopPropagation(); // Previne comportamento estranho
    }
  }}
  placeholder="Ex: Passe aqui hoje"
  className={inputClassName}
/>
```

---

### 12. Adicionar Ícones em `seasonal_peaks`

**Arquivo:** `app/dashboard/store/intelligence/components/Tab1-PublicoTom.tsx`

#### Estado Atual
```tsx
const SEASONAL_PEAK_OPTIONS = [
  { label: "Verão", value: "Verão" },
  { label: "Inverno", value: "Inverno" },
  // ...
];
```

#### Estado Desejado
```tsx
const SEASONAL_PEAK_OPTIONS = [
  { label: "☀️ Verão", value: "Verão" },
  { label: "❄️ Inverno", value: "Inverno" },
  { label: "💐 Dia das Mães", value: "Dia das Mães" },
  { label: "👔 Dia dos Pais", value: "Dia dos Pais" },
  { label: "🏷️ Black Friday", value: "Black Friday" },
  { label: "🎄 Natal", value: "Natal" },
];
```

---

### 13. Contador Visual em `customer_pain_points`

**Arquivo:** `app/dashboard/store/intelligence/components/Tab2-Posicionamento.tsx`

#### Estado Desejado
```tsx
<FieldShell label="Dores do cliente" optional>
  <MultiSelectChips
    options={PAIN_POINT_OPTIONS}
    values={context.customer_pain_points ?? []}
    onToggle={(value) => toggleArrayValue("customer_pain_points", value)}
  />
  
  {/* Contador visual */}
  <div className="mt-2 text-xs text-zinc-500">
    {context.customer_pain_points?.length ?? 0}/4 selecionados
  </div>
</FieldShell>
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Alta Prioridade (1h 55min)

- [ ] **1.** Campo `target_audience` → Select + presets (30 min)
  - [ ] Adicionar `target_audience_preset` ao tipo `IntelligenceContext`
  - [ ] Criar constante `TARGET_AUDIENCE_LABELS`
  - [ ] Substituir TextArea por SelectInput em Tab1
  - [ ] Adicionar TextArea condicional se "custom"
- [ ] **2.** Campo `main_differentiation` → ChoiceChips + presets (30 min)
  - [ ] Adicionar `main_differentiation_preset` ao tipo `IntelligenceContext`
  - [ ] Criar constante `DIFFERENTIATION_LABELS`
  - [ ] Substituir TextArea por ChoiceChips em Tab2
  - [ ] Adicionar TextArea condicional se "custom"
- [ ] **3.** Campo custom "pain points" com botão "Adicionar" (15 min)
  - [ ] Envolver TextInput em div flex com botão
  - [ ] Implementar lógica onClick: adicionar ao array + limpar campo
  - [ ] Adicionar disabled quando limite (4) atingido
- [ ] **4.** CTAs empilhados verticalmente (10 min)
  - [ ] Remover grid horizontal `lg:grid-cols-[1fr_1.2fr_auto]`
  - [ ] Substituir por `space-y-3`
  - [ ] Botão "Remover" vai para `flex justify-end`
- [ ] **5.** Remover campo "velocidade de conversão" (30 min)
  - [ ] Atualizar tipo `CTAEntry` (remover `approval_speed_seconds`)
  - [ ] Atualizar tipo `IntelligenceContext.successful_past_ctas`
  - [ ] Remover campo do JSX em FormPrimitives
  - [ ] Alterar grid de 3 colunas para 2 colunas

### Fase 2: Média Prioridade (1h 50min)

- [ ] **6.** Ticket médio com máscara BRL (20 min)
  - [ ] Criar `lib/formatters/currency.ts` com `formatBRL` e `parseBRL`
  - [ ] Adicionar estado local `ticketDisplay` em Tab2
  - [ ] Substituir TextInput por input controlado com `onBlur` formatter
- [ ] **7.** Substituir "concisão" → "objetividade" (5 min)
  - [ ] Alterar description do checkbox `prefers_brevity`
- [ ] **8.** Adicionar valores recomendados (45 min)
  - [ ] Adicionar hint geral no topo da Tab 4
  - [ ] Atualizar placeholders de 4 campos numéricos
  - [ ] Adicionar hints abaixo de cada campo
- [ ] **9.** Melhorar `competitors` com segmentação (40 min) — OPCIONAL
  - [ ] Adicionar `competitor_type` ao tipo `IntelligenceContext`
  - [ ] Criar constante `COMPETITORS_BY_SEGMENT`
  - [ ] Adicionar ChoiceChips para tipo de concorrência
  - [ ] Condicional: MultiSelectChips se nacional, StringListField caso contrário

### Fase 3: Baixa Prioridade (50 min)

- [ ] **10.** Hint duplicada (remover) — JÁ FEITO em #8
- [ ] **11.** Campo CTA aceitar espaços (15 min)
  - [ ] Verificar se hook remove espaços
  - [ ] Adicionar `onKeyDown` preventivo se necessário
- [ ] **12.** Adicionar ícones em `seasonal_peaks` (20 min)
  - [ ] Atualizar labels em `SEASONAL_PEAK_OPTIONS` com emojis
- [ ] **13.** Contador visual em `customer_pain_points` (10 min)
  - [ ] Adicionar div com contador após MultiSelectChips

### Fase 4: Testes (30 min)

- [ ] Compilação TypeScript limpa (`npx tsc --noEmit`)
- [ ] Teste manual no localhost:
  - [ ] Tab 1: Select `target_audience` funcional
  - [ ] Tab 2: ChoiceChips `main_differentiation` funcional
  - [ ] Tab 2: Botão "Adicionar" em pain points funcional
  - [ ] Tab 3: CTAs empilhados verticalmente
  - [ ] Tab 3: Campo "segundos" removido
  - [ ] Tab 2: Ticket médio formata BRL ao sair do campo
  - [ ] Tab 4: Placeholders com valores recomendados
  - [ ] Tab 4: Hint geral aparece uma vez só
- [ ] Auto-save funciona após alterações
- [ ] Navegação entre abas preserva dados

---

## 📊 IMPACTO ESPERADO

| Métrica | Antes | Depois (Projetado) |
|---------|-------|-------------------|
| Taxa de preenchimento | ~60% | 95%+ |
| Tempo médio de preenchimento | 8-10 min | 2-5 min |
| Taxa de abandono | ~25% | <5% |
| Cliques em "Help" | ~15% | <5% |
| Qualidade dos dados para IA | Baixa (texto livre) | Alta (estruturado) |

---

## 📁 ARQUIVOS AFETADOS (Resumo)

| Arquivo | Modificações |
|---------|-------------|
| `Tab1-PublicoTom.tsx` | 2 campos (target_audience, seasonal_peaks) |
| `Tab2-Posicionamento.tsx` | 4 campos (main_differentiation, pain_points, ticket_brl, competitors) |
| `Tab3-Conversao.tsx` | 1 campo (remover referência a approval_speed) |
| `Tab4-Avancado.tsx` | 5 ajustes (concisão, placeholders, hints, remover duplicação) |
| `FormPrimitives.tsx` | 2 componentes (CTAListField, tipo CTAEntry) |
| `useIntelligenceForm.ts` | 4 tipos (adicionar presets, remover approval_speed) |
| `lib/formatters/currency.ts` | CRIAR NOVO (formatBRL, parseBRL) |

---

## 🚀 PRÓXIMOS PASSOS

Após implementação destas correções:

1. **Testes E2E:** Atualizar specs para validar novos campos de seleção
2. **Validação UX:** Teste de usabilidade com lojista real
3. **Documentação:** Atualizar Stories 2A/2B com novos ACs
4. **Sprint 2:** Continuar com novas features (Score visual, onboarding skip, etc.)

---

**Tempo estimado total:** 4h 35min (1 dia de trabalho)  
**Prioridade:** ALTA (bloqueador de UX antes de produção)  
**Complexidade:** MÉDIA (ajustes de UI + tipos + validações)

---

*Documento consolidado por @ux-design-expert (Uma) — 2 de maio de 2026*  
*Baseado em: intelligence-campos-selecao-proposta.md, intelligence-micro-refinamentos.md, intelligence-tabs3-4-ajustes-finais.md*
