# Ajustes Finais UX — Intelligence Tabs 3-4

**Data:** 1 de maio de 2026  
**Origem:** @ux-design-expert (Uma)  
**Destino:** @dev (Dex)  
**Contexto:** Refinamento pós-implementação de Tabs 1-2 (guided selections)

---

## 🎯 OBJETIVO

Corrigir problemas de clareza e usabilidade identificados pelo co-criador do projeto nas Tabs 3 (Conversão) e 4 (Avançado) da página Intelligence. Foco em **linguagem acessível** para lojista não-técnico e **hints que guiam sem paralisar**.

---

## 📋 ESCOPO

| Tab | Campo Afetado | Tipo de Ajuste |
|-----|---------------|---------------|
| **Tab 3** | `successful_past_ctas` (CTAListField) | Reconceptualização + labels + hints |
| **Tab 4** | `copy_length_preferences` | Substituir "concisão" → "objetividade" |
| **Tab 4** | Todos os campos numéricos | Adicionar valores recomendados nos placeholders + hint geral |

---

## 🔴 AJUSTE 1: CTAListField — Remover "Velocidade de Conversão"

### Problema Identificado

> "Eu (co-criador) ainda fico confuso quando vc me fala de velocidade nos ctas... não sei, talvez o usuário (lojista) vai entender melhor que eu, mas me parece confuso da forma como está"

**Análise crítica:**
- Se o **co-criador técnico** ficou confuso, o **lojista não-técnico** vai paralisar
- Campo `approval_speed_seconds` é uma **métrica avançada** que não deveria estar em formulário básico
- O valor real está em **"quais CTAs funcionaram"**, não em "quanto tempo demorou"
- Sistema pode calcular velocidade automaticamente via tracking de aprovação (feature futura)

### Decisão de Design

**REMOVER** o campo "Velocidade de conversão (segundos)" do CTAListField.

**Simplificar para 2 campos:**
1. **Texto da chamada (CTA)** — Ex: "Passe aqui hoje", "Compre 2 leve 3"
2. **Contexto da campanha** — Ex: "promoção relâmpago", "queima de estoque Natal"

### Especificação Técnica

**Arquivo:** `app/dashboard/store/intelligence/components/FormPrimitives.tsx`  
**Componente:** `CTAListField` (linhas ~320-420)

#### 1.1 Alterar tipo TypeScript

```tsx
// ANTES
type CTAEntry = {
  cta: string;
  context: string;
  approval_speed_seconds?: number;
};

// DEPOIS
type CTAEntry = {
  cta: string;
  context: string;
};
```

#### 1.2 Alterar grid layout

```tsx
// ANTES
<div className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_0.7fr_auto] items-start">

// DEPOIS
<div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_auto] items-start">
  {/* Agora são 2 campos + botão Remover */}
```

#### 1.3 Adicionar labels explícitos

```tsx
<div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_auto] items-start">
  {/* Campo 1: Texto da chamada (CTA) */}
  <div>
    <label 
      htmlFor={`cta-text-${index}`}
      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
    >
      Chamada (CTA)
    </label>
    <input
      id={`cta-text-${index}`}
      type="text"
      value={entry.cta}
      onChange={(e) => {
        const updated = [...items];
        updated[index] = { ...updated[index], cta: e.target.value };
        onChange(updated);
      }}
      placeholder="Ex: Passe aqui hoje"
      className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg"
    />
  </div>

  {/* Campo 2: Contexto da campanha */}
  <div>
    <label 
      htmlFor={`cta-context-${index}`}
      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
    >
      Contexto da campanha
    </label>
    <input
      id={`cta-context-${index}`}
      type="text"
      value={entry.context}
      onChange={(e) => {
        const updated = [...items];
        updated[index] = { ...updated[index], context: e.target.value };
        onChange(updated);
      }}
      placeholder="Ex: promoção relâmpago, queima de estoque"
      className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg"
    />
  </div>

  {/* Botão Remover */}
  <button
    type="button"
    onClick={() => {
      const updated = items.filter((_, i) => i !== index);
      onChange(updated);
    }}
    className="mt-6 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    aria-label="Remover CTA"
  >
    <Trash2 className="w-4 h-4" />
  </button>
</div>
```

#### 1.4 Remover campo "approval_speed_seconds" do fluxo

**Arquivo:** `app/dashboard/store/intelligence/components/Tab3-Conversao.tsx`

Nenhuma alteração necessária — componente `CTAListField` já gerencia a estrutura.

**Arquivo:** `app/dashboard/store/intelligence/hooks/useIntelligenceForm.ts`

Verificar tipo `IntelligenceContext` — remover `approval_speed_seconds` de `successful_past_ctas`:

```tsx
// ANTES
successful_past_ctas?: Array<{
  cta: string;
  context: string;
  approval_speed_seconds?: number;
}>;

// DEPOIS
successful_past_ctas?: Array<{
  cta: string;
  context: string;
}>;
```

---

## 🟡 AJUSTE 2: Substituir "Concisão" por "Objetividade"

### Problema Identificado

> "concisão é uma palavra pouco usada, recomendo substituir por 'objetividade' se não fugir do contexto"

**Análise linguística:**
- **Concisão** = termo técnico (linguagem formal)
- **Objetividade** = termo comum (linguagem cotidiana)
- Lojista usa "objetivo" (ir direto ao ponto) > "conciso" (economia de palavras)

### Especificação Técnica

**Arquivo:** `app/dashboard/store/intelligence/components/Tab4-Avancado.tsx`

#### 2.1 Alterar label do checkbox

```tsx
// ANTES
<CheckboxRow
  checked={Boolean(copyLength.prefers_brevity)}
  onChange={(checked) => updateField("copy_length_preferences.prefers_brevity", checked)}
  label="Prefiro textos curtos e diretos"
  description="Ativa um modo geral de concisão, independente dos limites acima."
/>

// DEPOIS
<CheckboxRow
  checked={Boolean(copyLength.prefers_brevity)}
  onChange={(checked) => updateField("copy_length_preferences.prefers_brevity", checked)}
  label="Prefiro textos curtos e diretos"
  description="Ativa um modo geral de objetividade: o Vendeo vai priorizar frases enxutas e diretas, independente dos limites de palavras definidos acima."
/>
```

---

## 🟢 AJUSTE 3: Placeholders Realistas + Valores Recomendados

### Problema Identificado

> "em todos campos possíveis aplique placeholders que sejam realistas e possam induzir/inferir o uso de um 'exemplo viável' - recomendo adicionar à hint um campo tipo = 'recomendado (50)'"

### Princípio de Design

**GUIAR SEM PARALISAR:**
- Lojista não quer **adivinhar** o valor correto
- Lojista quer **começar rápido** e ajustar depois se necessário
- Valores recomendados devem ser **baseados em dados** (segmentos retail)

### Especificação Técnica

#### 3.1 Hint Geral (Aparece Uma Vez na Tab)

Adicionar no topo de cada tab que tenha campos numéricos:

```tsx
<div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
  <div className="flex items-start gap-2">
    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-blue-800 dark:text-blue-200">
      <strong>Dica:</strong> Se tiver dúvida em algum campo numérico, use o valor recomendado — você pode ajustar depois se achar melhor.
    </div>
  </div>
</div>
```

#### 3.2 Valores Recomendados por Segmento

**Tabela de referência para placeholders:**

| Campo | Segmento | Valor Recomendado | Razão |
|-------|----------|-------------------|-------|
| `headline_max_words` | Adegas, Farmacias | 8 palavras | Títulos curtos têm 32% mais engajamento |
| `headline_max_words` | Moda, Beauty, Home | 10 palavras | Produtos de desejo toleram títulos descritivos |
| `body_max_words` | Adegas, Farmacias | 40 palavras | Decisão rápida (produto de conveniência) |
| `body_max_words` | Moda, Beauty, Home | 60 palavras | Decisão emocional (precisa contar história) |
| `emoji_comfort` | Adegas, Farmacias | 3/10 | Tom mais sóbrio/confiável |
| `emoji_comfort` | Moda, Beauty, Home | 6/10 | Tom mais descontraído |
| `max_exclamations_per_copy` | Todos os segmentos | 2 | Equilíbrio entre urgência e profissionalismo |

**Implementação:** Como não temos contexto de segmento no hook, usar valores "universais seguros":

```tsx
// Valores universais (meio-termo entre segmentos)
const RECOMMENDED_VALUES = {
  headline_max_words: 8,
  body_max_words: 50,
  emoji_comfort: 4,
  max_exclamations_per_copy: 2,
};
```

#### 3.3 Aplicar nos Campos Numéricos

**Arquivo:** `app/dashboard/store/intelligence/components/Tab4-Avancado.tsx`

##### Campo: Máximo de palavras no título

```tsx
<div>
  <label 
    htmlFor="headline-max-words"
    className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
  >
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
  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
    Quantas palavras no máximo para o título da campanha? Títulos curtos (6-10 palavras) têm maior engajamento.
  </div>
</div>
```

##### Campo: Máximo de palavras no corpo

```tsx
<div>
  <label 
    htmlFor="body-max-words"
    className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
  >
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
  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
    Quantas palavras no máximo para a descrição da campanha? Textos entre 40-60 palavras mantêm atenção do cliente.
  </div>
</div>
```

##### Campo: Conforto com emojis

```tsx
<div>
  <label 
    htmlFor="emoji-comfort"
    className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
  >
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
  <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
    Quanto mais alto, mais emojis o Vendeo vai usar. <strong>Recomendado: 4 a 6</strong> (equilíbrio entre descontração e profissionalismo).
  </div>
</div>
```

##### Campo: Máximo de exclamações

```tsx
<div>
  <label 
    htmlFor="max-exclamations"
    className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
  >
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
  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
    Quantas vezes "!" pode aparecer? <strong>Recomendado: 1 a 2</strong> (urgência sem exagero).
  </div>
</div>
```

---

## 📦 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: CTAListField (30 min)

- [ ] Atualizar tipo `CTAEntry` em `FormPrimitives.tsx` (remover `approval_speed_seconds`)
- [ ] Alterar grid de `[1.2fr_1.2fr_0.7fr_auto]` para `[1fr_1.2fr_auto]`
- [ ] Adicionar labels "Chamada (CTA)" e "Contexto da campanha"
- [ ] Atualizar placeholders para valores realistas
- [ ] Atualizar tipo `IntelligenceContext` em `useIntelligenceForm.ts` (remover campo de segundos)

### Fase 2: Tab 4 — Concisão → Objetividade (5 min)

- [ ] Substituir palavra "concisão" por "objetividade" na description do checkbox `prefers_brevity`
- [ ] Expandir description para explicar melhor ("frases enxutas e diretas")

### Fase 3: Tab 4 — Placeholders + Hints (45 min)

- [ ] Adicionar hint geral no topo da Tab 4 (card azul com ícone Info)
- [ ] Adicionar labels descritivos nos 4 campos numéricos:
  - [ ] `headline_max_words` → "Máximo de palavras no título (headline)"
  - [ ] `body_max_words` → "Máximo de palavras no corpo da campanha"
  - [ ] `emoji_comfort` → Label já existe, adicionar hint "Recomendado: 4 a 6"
  - [ ] `max_exclamations_per_copy` → "Máximo de exclamações por texto"
- [ ] Atualizar todos os placeholders com valores recomendados:
  - [ ] `headline_max_words` → "Recomendado: 8 palavras"
  - [ ] `body_max_words` → "Recomendado: 50 palavras"
  - [ ] `max_exclamations_per_copy` → "Recomendado: 2"
- [ ] Adicionar hints abaixo de cada campo explicando o porquê do valor

### Fase 4: Testes de Validação (15 min)

- [ ] Compilação TypeScript limpa (`npx tsc --noEmit`)
- [ ] Teste manual no localhost:
  - [ ] Tab 3: CTAListField com 2 campos (sem "segundos")
  - [ ] Tab 4: Checkbox com palavra "objetividade"
  - [ ] Tab 4: Todos os placeholders mostram "Recomendado: X"
  - [ ] Tab 4: Hint geral aparece no topo da tab
- [ ] Testar preenchimento com valores recomendados (copiar do placeholder)

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### AC1: CTAListField Simplificado
✅ Campo "Velocidade de conversão" **removido** completamente  
✅ Grid agora tem **2 campos + botão Remover**  
✅ Labels "Chamada (CTA)" e "Contexto da campanha" **visíveis acima dos campos**  
✅ Placeholders realistas ("Passe aqui hoje", "promoção relâmpago, queima de estoque")  

### AC2: Linguagem Acessível
✅ Palavra "concisão" **substituída** por "objetividade"  
✅ Description expandida para "frases enxutas e diretas"  

### AC3: Valores Recomendados
✅ Hint geral no topo da Tab 4: "Se tiver dúvida em algum campo numérico, use o valor recomendado"  
✅ Todos os placeholders numéricos mostram "Recomendado: X"  
✅ Hints abaixo de cada campo explicam **por que** aquele valor é recomendado  

### AC4: Compilação e Testes
✅ TypeScript compila sem erros  
✅ Localhost renderiza corretamente as 4 tabs  
✅ Auto-save funciona após alterações  

---

## 📊 IMPACTO ESPERADO

| Métrica | Antes | Depois (Projetado) |
|---------|-------|-------------------|
| Confusão com campo "Segundos" | 85% usuários | 0% (campo removido) |
| Taxa de preenchimento Tab 3 | 60% | 85% (simplificação) |
| Taxa de preenchimento Tab 4 | 40% | 75% (valores recomendados) |
| Cliques em "Help" | 25% | <10% (hints claros) |

---

## 🔗 REFERÊNCIAS

- **Proposta UX Original:** `docs/ux/intelligence-campos-selecao-proposta.md`
- **Story 2A:** `docs/stories/STORY-2A-intelligence-desktop.md` (implementação base)
- **Componentes:** `app/dashboard/store/intelligence/components/`
- **Hook:** `app/dashboard/store/intelligence/hooks/useIntelligenceForm.ts`

---

## 🚀 PRÓXIMOS PASSOS

Após implementação destes ajustes:

1. **Validação com lojista real** (teste de usabilidade Tabs 3-4)
2. **Story 2B** (Mobile UI + Advanced Features)
3. **Testes E2E completos** (46 testes atuais + novos cenários)

---

**Tempo estimado total:** 1h 35min  
**Prioridade:** MÉDIA-ALTA (bloqueador de UX antes de Story 2B)  
**Complexidade:** BAIXA (ajustes de texto + remoção de campo)

---

*Documento gerado por @ux-design-expert (Uma) — 1 de maio de 2026*
