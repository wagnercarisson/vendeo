# Story 2B - Adaptações Obrigatórias

**Data:** 01 Mai 2026  
**Contexto:** Story 2A implementou estrutura mais complexa que exemplos teóricos de Story 2B  
**Status:** 🟡 REQUER ADAPTAÇÕES antes de @dev iniciar

---

## 🎯 RESUMO EXECUTIVO

Story 2B está **baseada em exemplos simplificados** (inputs de texto), mas Story 2A implementou **componentes customizados** (ChoiceChips, MultiSelectChips, máscaras, campos condicionais).

**Resultado:** Story 2B precisa adaptar implementações de:
1. Acessibilidade (A11Y)
2. Swipe gestures (conflito com touch em chips)
3. Lazy loading (named exports vs default)
4. SaveIndicator (redundância com ProgressIndicator)

---

## 📋 ADAPTAÇÕES OBRIGATÓRIAS

### 1. **A11Y: Adaptar para Componentes Reais** 🔴 CRÍTICO

**Problema:** Story 2B tem exemplos com `<input>` simples, mas usamos ChoiceChips/MultiSelectChips.

**Solução:** @dev precisa adicionar A11Y específico para cada componente:

#### ChoiceChips (Tom da marca, Posicionamento, etc)
```tsx
// FormPrimitives.tsx - ChoiceChips enhancement
<button
  key={option.value}
  type="button"
  role="radio"
  aria-checked={active}
  aria-label={option.label}
  onKeyDown={(e) => {
    if (e.key === 'ArrowRight') {
      // Focus próxima opção
    }
    if (e.key === 'ArrowLeft') {
      // Focus opção anterior
    }
  }}
>
  {option.label}
</button>
```

#### MultiSelectChips (Picos sazonais, Concorrentes nacionais)
```tsx
// FormPrimitives.tsx - MultiSelectChips enhancement
<button
  role="checkbox"
  aria-checked={isSelected}
  aria-label={option.label}
  aria-describedby={maxSelections ? `max-${fieldId}` : undefined}
>
  {option.label}
</button>
{maxSelections && (
  <div id={`max-${fieldId}`} className="sr-only">
    Máximo {maxSelections} seleções
  </div>
)}
```

#### SelectInput + Conditional Field (Público-alvo, Diferencial)
```tsx
// FormPrimitives.tsx - SelectInput enhancement
<select
  aria-describedby={hasCustomOption ? `${fieldId}-hint` : undefined}
  onChange={(e) => {
    onChange(e.target.value);
    
    // Se selecionou "custom", focus no TextArea que vai aparecer
    if (e.target.value === "custom") {
      setTimeout(() => {
        document.getElementById(`${fieldId}-custom-input`)?.focus();
      }, 100);
    }
  }}
>
  {/* options */}
</select>

{value === "custom" && (
  <textarea
    id={`${fieldId}-custom-input`}
    aria-label={`${label} - campo customizado`}
  />
)}
```

#### Máscara BRL (Ticket médio)
```tsx
// Tab2-Posicionamento.tsx enhancement
<div className="flex items-center">
  <span className="mr-2" aria-hidden="true">R$</span>
  <input
    type="text"
    inputMode="decimal"
    aria-label="Ticket médio em reais"
    aria-describedby="ticket-format-hint"
    placeholder="150,00"
  />
</div>
<div id="ticket-format-hint" className="sr-only">
  Digite o valor com vírgula para centavos, exemplo: 150,00
</div>
```

**Status:** 🔴 **OBRIGATÓRIO** - Sem isso, A11Y regredirá (AC19 falhará)

---

### 2. **Swipe Gestures: Evitar Conflito com Touch** 🟡 IMPORTANTE

**Problema:** `preventScrollOnSwipe: true` pode bloquear:
- Scroll vertical em TextAreas
- Touch em MultiSelectChips
- Swipe horizontal em campos longos

**Solução:** Configurar swipe para ignorar elementos de formulário:

```tsx
// components/IntelligenceTabs.tsx (enhanced)
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => setActiveTab(Math.min(activeTab + 1, 3)),
  onSwipedRight: () => setActiveTab(Math.max(activeTab - 1, 0)),
  trackMouse: false, // Touch only
  preventScrollOnSwipe: true,
  
  // 🔑 ADAPTAÇÃO CRÍTICA: Ignorar swipe em elementos de formulário
  delta: 50, // Mínimo 50px para considerar swipe (evita conflito com tap)
  trackTouch: true,
});

// Aplicar handlers APENAS no container da aba, NÃO nos campos
return (
  <div className="tab-navigation">
    <div className="tabs">{/* Tab buttons */}</div>
    
    <div {...handlers} className="tab-content-wrapper">
      {/* Tab panels aqui */}
    </div>
  </div>
);
```

**Alternativa:** Usar swipe APENAS na área de tabs (não no conteúdo):
```tsx
// Swipe só nos botões das tabs
<div {...handlers} className="tabs">
  {/* Swipe aqui move entre tabs */}
</div>

<div className="tab-content">
  {/* Sem handlers - permite scroll livre */}
</div>
```

**Status:** 🟡 **RECOMENDADO** - Evita frustração do lojista

---

### 3. **Lazy Loading: Adaptar Named Exports** 🟢 FÁCIL

**Problema:** Componentes atuais usam named export:
```tsx
export function Tab1PublicoTom() { /* ... */ }
```

**Story 2B assume:**
```tsx
const Tab1 = lazy(() => import('./components/Tab1-PublicoTom'));
```

**Solução A:** Converter para default export (RECOMENDADO):
```tsx
// Tab1-PublicoTom.tsx
export default function Tab1PublicoTom() { /* ... */ }

// page.tsx
const Tab1 = lazy(() => import('./components/Tab1-PublicoTom'));
```

**Solução B:** Adaptar lazy import para named export:
```tsx
const Tab1 = lazy(() => 
  import('./components/Tab1-PublicoTom').then(m => ({ default: m.Tab1PublicoTom }))
);
```

**Status:** 🟢 **FÁCIL** - 5 min de trabalho, zero impacto

---

### 4. **SaveIndicator: Eliminar Redundância** 🟡 DECISÃO ARQUITETURAL

**Problema:** ProgressIndicator JÁ mostra `saveMessage` e `saveStatus`.

**Opção A: Substituir (RECOMENDADO)**
```tsx
// ProgressIndicator.tsx - REMOVER saveMessage/saveStatus
<ProgressIndicator 
  score={score}
  filledFields={filledFields}
  totalFields={totalFields}
  badge={badge}
  // ❌ Remover: saveMessage, saveStatus
/>

// page.tsx - ADICIONAR SaveIndicator separado
<SaveIndicator 
  isSaving={saving}
  error={saveError}
  isOnline={isOnline}
  onRetry={retryNow}
/>
```

**Opção C: Merge (ALTERNATIVA)**
```tsx
// ProgressIndicator.tsx - ENHANÇAR com retry + offline
<ProgressIndicator 
  score={score}
  badge={badge}
  saveStatus={saveStatus}
  saveMessage={saveMessage}
  onRetry={retryNow} // ← NOVO
  isOnline={isOnline} // ← NOVO
/>
```

**Decisão:** @dev escolhe, mas **evitar duplicação** de UI/funcionalidade.

**Status:** 🟡 **DECISÃO** - Impacta UX, mas não bloqueia

---

### 5. **Retry Logic: Integrar com Validação** 🟢 TRANQUILO

**Adaptação:** Retry deve respeitar validação inline:

```tsx
// hooks/useIntelligenceForm.ts (enhanced)
const saveWithRetry = async (data: Partial<IntelligenceContext>, maxRetries = 3) => {
  // 1. Validar ANTES de tentar salvar
  const errors = validateIntelligenceContext(data);
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    return false; // Não tenta salvar se tem erro de validação
  }
  
  // 2. Retry de rede (implementação Story 2B)
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch('/api/store/intelligence', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Save failed');
      
      setValidationErrors({}); // Limpa erros de validação
      return true;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        // Fallback: Save to localStorage
        localStorage.setItem('intelligence-pending', JSON.stringify(data));
        return false;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
};
```

**Status:** 🟢 **TRANQUILO** - Lógica já existe, só adicionar retry

---

## 📊 CHECKLIST DE ADAPTAÇÕES

Antes de @dev iniciar Story 2B, verificar:

### Acessibilidade (A11Y)
- [ ] ChoiceChips: role="radio", aria-checked, keyboard nav (Arrow keys)
- [ ] MultiSelectChips: role="checkbox", aria-checked, maxSelections hint
- [ ] SelectInput + conditional: focus management quando "custom" aparece
- [ ] Máscara BRL: aria-describedby com hint de formato
- [ ] Counter: aria-live para leitores de tela ("145 de 200 caracteres")

### Swipe Gestures
- [ ] Configurar delta mínimo (50px) para evitar conflito com tap
- [ ] Testar swipe em device real (não só emulador)
- [ ] Verificar que TextArea scroll não bloqueia
- [ ] Verificar que MultiSelectChips touch funciona

### Lazy Loading
- [ ] Converter Tab components para default export OU adaptar lazy import
- [ ] Testar que Suspense fallback aparece durante load
- [ ] Verificar que form state preserva ao lazy load

### SaveIndicator
- [ ] Decidir: Opção A (substituir) ou Opção C (merge)
- [ ] Implementar retry button UI
- [ ] Implementar offline banner
- [ ] Testar localStorage fallback (simular offline)

### Retry Logic
- [ ] Integrar com validateIntelligenceContext()
- [ ] Não tentar salvar se tem erro de validação
- [ ] Exponential backoff (1s, 2s, 4s)
- [ ] localStorage fallback após 3 falhas

---

## ✅ APROVAÇÃO PARA PROSSEGUIR

**Decisão:** ✅ **PODE PROSSEGUIR**, mas @dev precisa LER este documento ANTES de começar.

**Próximos passos:**
1. @dev lê STORY-2B-ADAPTATIONS-REQUIRED.md (este documento)
2. @dev confirma entendimento das 5 adaptações
3. @dev decide: Opção A ou C para SaveIndicator
4. @dev inicia implementação com adaptações aplicadas

**Estimated effort adjustment:**
- Story 2B original: 3 pontos (2.5 dias)
- Com adaptações: +0.5 pontos → **3.5 pontos (3 dias)**

---

**Criado por:** @ux-design-expert (Uma)  
**Aprovado por:** [Aguardando]  
**Status:** 🟡 AGUARDANDO CONFIRMAÇÃO DO @dev
