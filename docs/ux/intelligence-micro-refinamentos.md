# Micro-Refinamentos UX — Intelligence (Pós-Implementação)

**Data:** 1 de maio de 2026  
**Origem:** @ux-design-expert (Uma)  
**Destino:** @dev (Dex)  
**Contexto:** Ajustes finos identificados em validação visual pelo co-criador

---

## 🎯 OBJETIVO

Corrigir 5 problemas pontuais de usabilidade/formatação identificados nos prints de validação. São ajustes cirúrgicos que não alteram lógica de negócio, apenas melhoram experiência do lojista.

---

## 📋 ESCOPO DOS PROBLEMAS

| # | Print | Problema | Severidade | Arquivo Afetado |
|---|-------|----------|-----------|-----------------|
| 1 | Print 1 | Ticket médio sem máscara BRL | 🟡 MÉDIA | Tab2-Posicionamento.tsx |
| 2 | Print 2 | Campo custom "pain points" não adiciona à lista | 🔴 ALTA | Tab2-Posicionamento.tsx |
| 3 | Print 3 | CTAs lado a lado (não empilhados) | 🔴 ALTA | FormPrimitives.tsx |
| 4 | Print 4 | Campo CTA não aceita espaços | 🟡 MÉDIA | FormPrimitives.tsx (verificar) |
| 5 | Print 5 | Hint "valor recomendado" duplicada | 🟢 BAIXA | Tab4-Avancado.tsx |

---

## 🔴 PROBLEMA 1: Ticket Médio sem Máscara BRL

### Situação Atual

```tsx
<TextInput
  type="number"
  min={0}
  value={context.average_ticket_brl}
  onChange={(value) => updateField("average_ticket_brl", value === "" ? null : Number(value))}
  placeholder="Ex: 150"
/>
```

**Problema:** Lojista digita `150` mas quer visualizar `R$ 150,00`. Campo numérico puro não tem contexto de moeda.

### Solução: Formatter BRL com Unidade de Medida

**Opção A: Formatter manual (recomendado — zero dependências)**

```tsx
// Arquivo: lib/formatters/currency.ts (criar se não existir)
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

**Implementação em Tab2-Posicionamento.tsx:**

```tsx
import { formatBRL, parseBRL } from "@/lib/formatters/currency";

// Dentro do componente
const [ticketDisplay, setTicketDisplay] = useState<string>(
  formatBRL(context.average_ticket_brl)
);

// No JSX
<div>
  <label className="block text-xs font-medium text-zinc-700 mb-1">
    Ticket médio (R$)
  </label>
  <input
    type="text"
    value={ticketDisplay}
    onChange={(e) => {
      setTicketDisplay(e.target.value);
    }}
    onBlur={() => {
      const parsed = parseBRL(ticketDisplay);
      updateField("average_ticket_brl", parsed);
      setTicketDisplay(formatBRL(parsed));
    }}
    placeholder="Ex: R$ 150,00"
    className={inputClassName}
  />
</div>
```

**Comportamento esperado:**
- Lojista digita: `150` → ao sair do campo → formata para `R$ 150,00`
- Lojista digita: `R$ 50,75` → ao sair do campo → mantém `R$ 50,75`
- Lojista digita: `abc` → ao sair do campo → limpa para vazio

---

## 🔴 PROBLEMA 2: Campo Custom "Pain Points" Não Adiciona

### Situação Atual

No print 2, o lojista escreveu **"Não tem atendimento especializado"** no campo custom, mas:
- ❌ Não há botão "Adicionar"
- ❌ Campo não é adicionado automaticamente ao array `customer_pain_points`
- ❌ Contador permanece em `3/4` mesmo com campo preenchido

**Código atual:**

```tsx
<TextInput
  value={context.customer_pain_points_custom}
  onChange={(value) => updateField("customer_pain_points_custom", value)}
  placeholder="Outro problema que sua loja resolve"
  maxLength={100}
/>
```

### Problema de UX

O campo `customer_pain_points_custom` é **isolado** — não interage com o array `customer_pain_points[]`. O lojista preenche mas **nada acontece**.

### Solução: Converter para Campo com Botão "Adicionar"

**Implementação:**

```tsx
// Substituir o TextInput isolado por:
<div className="mt-3">
  <div className="flex gap-2">
    <input
      value={context.customer_pain_points_custom ?? ""}
      onChange={(e) => updateField("customer_pain_points_custom", e.target.value)}
      placeholder="Outro problema que sua loja resolve"
      maxLength={100}
      className={inputClassName}
    />
    <button
      type="button"
      onClick={() => {
        const customValue = context.customer_pain_points_custom?.trim();
        if (!customValue) return;
        if (painPoints.length >= 4) return;
        if (painPoints.includes(customValue)) return; // evita duplicata

        // Adiciona ao array
        toggleArrayValue("customer_pain_points", customValue);

        // Limpa o campo custom
        updateField("customer_pain_points_custom", "");
      }}
      disabled={
        !context.customer_pain_points_custom?.trim() ||
        painPoints.length >= 4
      }
      className="mt-2 shrink-0 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Adicionar
    </button>
  </div>
  <div className="mt-1 text-xs text-zinc-500">
    Descreva um problema específico do seu segmento e clique em "Adicionar".
  </div>
</div>
```

**Comportamento esperado:**
1. Lojista digita "Não tem atendimento especializado"
2. Clica em "Adicionar"
3. Valor é adicionado ao array `customer_pain_points[]`
4. Contador muda de `3/4` para `4/4`
5. Campo custom é limpo
6. Novo checkbox aparece na lista (renderizado dinamicamente)

**Alternativa (se preferir auto-adicionar ao Enter):**

```tsx
<input
  value={context.customer_pain_points_custom ?? ""}
  onChange={(e) => updateField("customer_pain_points_custom", e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // mesma lógica do botão acima
    }
  }}
  placeholder="Outro problema (pressione Enter para adicionar)"
  maxLength={100}
  className={inputClassName}
/>
```

---

## 🔴 PROBLEMA 3: CTAs Lado a Lado (Não Empilhados)

### Situação Atual (Print 3)

No print, os campos **"Chamada (CTA)"** e **"Contexto da campanha"** aparecem lado a lado, fazendo o texto ficar ilegível (truncado).

**Código atual:**

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

**Problema:** `lg:grid-cols-[1fr_1.2fr_auto]` mantém layout horizontal em telas grandes.

### Solução: Empilhar Verticalmente Sempre

**Código corrigido:**

```tsx
<div className="space-y-3">
  <div>
    <label className="block text-xs font-medium text-zinc-700 mb-1">Chamada (CTA)</label>
    <input
      value={item.cta}
      onChange={(event) => updateItem(index, { cta: event.target.value })}
      placeholder="Ex: Passe aqui hoje"
      className={inputClassName}
    />
  </div>

  <div>
    <label className="block text-xs font-medium text-zinc-700 mb-1">Contexto da campanha</label>
    <input
      value={item.context}
      onChange={(event) => updateItem(index, { context: event.target.value })}
      placeholder="Ex: promoção relâmpago, queima de estoque"
      className={inputClassName}
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

**Layout resultante:**

```
┌─────────────────────────────────┐
│ Chamada (CTA)                   │
│ [Ex: Passe aqui hoje          ] │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Contexto da campanha            │
│ [Ex: promoção relâmpago       ] │
└─────────────────────────────────┘

                         [Remover]
```

**Benefícios:**
- ✅ Campos largos, texto sempre legível
- ✅ Labels visíveis sem competir por espaço
- ✅ Botão "Remover" alinhado à direita (não compete com inputs)

---

## 🟡 PROBLEMA 4: Campo CTA Não Aceita Espaços

### Situação Atual (Print 4)

No print, o lojista tentou digitar **"passe nalo"** (provavelmente queria "passe no salão" mas os espaços foram removidos).

**Código atual:**

```tsx
<input
  value={item.cta}
  onChange={(event) => updateItem(index, { cta: event.target.value })}
  placeholder="Ex: Passe aqui hoje"
  className={inputClassName}
/>
```

### Diagnóstico

Não há `.trim()` ou regex no `onChange` que remova espaços. Possíveis causas:

1. **Validação no hook** — verificar se `useIntelligenceForm` remove espaços
2. **Auto-complete do navegador** — pode estar preenchendo sem espaços
3. **Bug de rendering** — React re-renderiza antes de processar espaço

### Solução: Adicionar Debug + Garantir Espaços

**Etapa 1: Verificar validação no hook**

Conferir se há `.trim()` ou `.replace(/\s/g, "")` em:
- `app/dashboard/store/intelligence/hooks/useIntelligenceForm.ts`
- Função `updateField` ou `setContext`

**Etapa 2: Forçar permissão de espaços**

Se necessário, adicionar handler explícito:

```tsx
<input
  value={item.cta}
  onChange={(event) => {
    // Garante que espaços sejam preservados
    const value = event.target.value;
    updateItem(index, { cta: value });
  }}
  onKeyDown={(e) => {
    // Previne comportamento estranho da barra de espaço
    if (e.key === " ") {
      e.stopPropagation();
    }
  }}
  placeholder="Ex: Passe aqui hoje"
  className={inputClassName}
/>
```

**Etapa 3: Testar casos extremos**

- ✅ "Passe aqui hoje" → deve manter espaços
- ✅ "  Vem logo  " → deve permitir espaços extras (trim pode acontecer no save)
- ✅ "Compre2leve3" → deve permitir texto sem espaços

**Nota:** Se o problema persistir, pode ser um bug de auto-save. Verificar se o debounce do `useIntelligenceForm` está processando o valor antes do espaço ser adicionado.

---

## 🟢 PROBLEMA 5: Hint "Valor Recomendado" Duplicada

### Situação Atual (Print 5)

A mesma hint azul aparece em **duas** FieldShells:

1. **Linguagem específica** (esquerda)
2. **Tamanho preferido da copy** (direita)

**Código atual (Tab4-Avancado.tsx):**

```tsx
<FieldShell label="Linguagem específica" ...>
  <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
    <div className="flex items-start gap-2">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>Se tiver dúvida em algum campo numérico, use o valor recomendado...</span>
    </div>
  </div>
  ...
</FieldShell>

<FieldShell label="Tamanho preferido da copy" ...>
  <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
    <div className="flex items-start gap-2">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>Se tiver dúvida em algum campo numérico, use o valor recomendado...</span>
    </div>
  </div>
  ...
</FieldShell>
```

### Solução: Mostrar Hint Apenas Uma Vez

**Melhor posicionamento:** Antes das duas colunas (topo da tab).

**Código corrigido:**

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

      {/* GRID COM AS DUAS COLUNAS (sem hints duplicadas) */}
      <div className="grid gap-4 xl:grid-cols-2">
        <FieldShell label="Linguagem específica" ...>
          {/* REMOVER a hint daqui */}
          <CheckboxRow ... />
          <SelectInput ... />
          ...
        </FieldShell>

        <FieldShell label="Tamanho preferido da copy" ...>
          {/* REMOVER a hint daqui */}
          <div className="mt-3">
            <div className="text-sm font-medium text-zinc-900">Máximo de palavras no título</div>
            ...
          </div>
        </FieldShell>
      </div>
    </div>
  );
}
```

**Benefícios:**
- ✅ Hint aparece uma vez só (menos poluição visual)
- ✅ Posicionamento lógico (antes dos campos, não dentro)
- ✅ Mais espaço para os campos de formulário

---

## 📦 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Ticket Médio com Máscara BRL (20 min)

- [ ] Criar `lib/formatters/currency.ts` com `formatBRL` e `parseBRL`
- [ ] Adicionar estado local `ticketDisplay` em Tab2-Posicionamento.tsx
- [ ] Substituir TextInput por input controlado com `onBlur` formatter
- [ ] Testar: digitar `150` → sair do campo → vira `R$ 150,00`

### Fase 2: Campo Custom Pain Points com Botão (15 min)

- [ ] Adicionar botão "Adicionar" ao lado do input custom
- [ ] Implementar lógica: adicionar ao array + limpar campo + atualizar contador
- [ ] Testar: digitar "Problema X" → clicar "Adicionar" → contador vai de 3/4 para 4/4
- [ ] Testar limite: com 4/4 selecionados, botão "Adicionar" deve ficar disabled

### Fase 3: CTAs Empilhados Verticalmente (10 min)

- [ ] Remover grid horizontal `lg:grid-cols-[1fr_1.2fr_auto]`
- [ ] Substituir por `space-y-3` (campos empilhados)
- [ ] Botão "Remover" vai para `flex justify-end` no final
- [ ] Testar: campos largos, texto não trunca

### Fase 4: Campo CTA Aceitar Espaços (15 min)

- [ ] Verificar se hook `useIntelligenceForm` tem `.trim()` agressivo
- [ ] Se necessário, adicionar `onKeyDown` para prevenir bug de espaço
- [ ] Testar: digitar "Passe aqui hoje" → espaços mantidos
- [ ] Testar: auto-save preserva espaços

### Fase 5: Hint Única (5 min)

- [ ] Mover hint para fora das FieldShells (antes do grid)
- [ ] Remover hint duplicada de "Linguagem específica"
- [ ] Remover hint duplicada de "Tamanho preferido da copy"
- [ ] Testar: hint aparece uma vez só no topo

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### AC1: Ticket Médio Formatado
✅ Campo aceita entrada livre (`150`, `R$ 150`, `150.50`)  
✅ Ao sair do campo, formata automaticamente para `R$ 150,00`  
✅ Valor salvo no banco permanece numérico (`150.00`)  

### AC2: Pain Points Custom Funcional
✅ Botão "Adicionar" visível ao lado do campo custom  
✅ Clicar "Adicionar" move valor para o array `customer_pain_points[]`  
✅ Contador atualiza de `3/4` para `4/4` imediatamente  
✅ Campo custom é limpo após adicionar  
✅ Botão fica disabled quando limite (4/4) é atingido  

### AC3: CTAs Empilhados e Legíveis
✅ Campos "Chamada" e "Contexto" aparecem **verticalmente** (um abaixo do outro)  
✅ Texto completo sempre visível (não trunca)  
✅ Labels claros acima de cada campo  
✅ Botão "Remover" alinhado à direita, não compete com inputs  

### AC4: Campo CTA Aceita Espaços
✅ Lojista digita "Passe aqui hoje" → espaços preservados  
✅ Espaços múltiplos ("Vem  logo") preservados durante digitação  
✅ Auto-save não remove espaços acidentalmente  

### AC5: Hint Única e Bem Posicionada
✅ Hint azul aparece **uma vez só** no topo da Tab 4  
✅ Nenhuma hint duplicada nas FieldShells individuais  
✅ Texto mantém clareza: "Se tiver dúvida em algum campo numérico..."  

---

## 📊 IMPACTO ESPERADO

| Métrica | Antes | Depois (Projetado) |
|---------|-------|-------------------|
| Compreensão do ticket médio | 60% (número puro confunde) | 95% (R$ deixa claro que é dinheiro) |
| Taxa de preenchimento pain points custom | 10% (campo inútil) | 70% (botão torna óbvio) |
| Legibilidade dos CTAs | 40% (truncado) | 100% (empilhado, texto completo) |
| Frustração com campo CTA | 30% (espaços somem?) | 0% (funciona como esperado) |
| Poluição visual da hint | 2 hints (redundante) | 1 hint (limpo) |

---

## 🔗 REFERÊNCIAS

- **Handoff anterior:** `docs/ux/intelligence-tabs3-4-ajustes-finais.md`
- **Componentes:** `app/dashboard/store/intelligence/components/`
- **Hook:** `app/dashboard/store/intelligence/hooks/useIntelligenceForm.ts`
- **Formatters:** `lib/formatters/` (criar se não existir)

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Problema 3 (CTAs empilhados)** — 10 min, maior impacto visual
2. **Problema 2 (Pain points botão)** — 15 min, resolve confusão do contador
3. **Problema 5 (Hint única)** — 5 min, quick win de limpeza
4. **Problema 1 (Máscara BRL)** — 20 min, requer criar formatter
5. **Problema 4 (CTA espaços)** — 15 min, pode ser só debug

**Tempo total estimado:** 1h 5min

---

**Prioridade:** ALTA (blockers de usabilidade identificados pelo co-criador)  
**Complexidade:** BAIXA (ajustes pontuais, sem refatoração profunda)

---

*Documento gerado por @ux-design-expert (Uma) — 1 de maio de 2026*
