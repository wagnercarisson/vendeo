# Story 2A: Frontend - Intelligence Page Core

**Sprint:** Intelligence Calibration Sprint 1  
**Effort:** 3 pontos  
**Status:** Ready  
**Created:** 2026-04-30  
**Split From:** STORY-2-frontend-intelligence-page.md  
**Agents:** @dev, @qa

---

## 📋 Context

Criar o núcleo funcional da página de Intelligence Calibration: 4 abas, 15 campos, auto-save obrigatório, e sistema de gamificação (progress bar + score + badges).

**Escopo:** Desktop-first experience com funcionalidade completa.  
**Fora de Escopo:** Mobile swipe gestures, retry automático de erros, otimizações de performance (ver Story 2B).

**Referência de implementação:** `app/dashboard/store/page.tsx` (onboarding básico já funcional)  
**Specs UX completas:** `docs/ux/intelligence-calibration-tabs.md`

---

## 🎯 Objective

Entregar experiência completa de calibração de intelligence no desktop: lojista preenche 15 campos em 4 abas contextualizadas, com auto-save automático ao trocar de aba e feedback visual de progresso.

---

## 📐 Specifications

### File Structure

```
app/dashboard/store/intelligence/
├── page.tsx                    # Main page component
├── components/
│   ├── IntelligenceTabs.tsx    # Tab navigation (desktop)
│   ├── ProgressIndicator.tsx   # Progress bar + score + badge
│   ├── Tab1-PublicoTom.tsx     # 5 campos
│   ├── Tab2-Posicionamento.tsx # 5 campos
│   ├── Tab3-Conversao.tsx      # 3 campos
│   └── Tab4-Avancado.tsx       # 2 campos
└── hooks/
    ├── useIntelligenceForm.ts  # Form state + auto-save
    └── useScoreCalculation.ts  # Score logic
```

### Route

```
/dashboard/store/intelligence
```

### Component Structure

```tsx
// app/dashboard/store/intelligence/page.tsx
export default function IntelligencePage() {
  return (
    <DashboardShell>
      <h1>🧠 Calibre a inteligência do Vendeo</h1>
      <ProgressIndicator score={score} filledFields={8} totalFields={15} badge={badge} />
      <IntelligenceTabs>
        <Tab1PublicoTom />
        <Tab2Posicionamento />
        <Tab3Conversao />
        <Tab4Avancado />
      </IntelligenceTabs>
    </DashboardShell>
  );
}
```

---

## 🗂️ Tab Breakdown

### Tab 1: Público & Tom (5 campos)

```tsx
// components/Tab1-PublicoTom.tsx
<TabPanel>
  <RadioGroup name="brand_voice" options={["formal", "informal", "technical", "playful"]} />
  <Textarea name="target_audience" maxLength={200} optional />
  <MultiSelect name="seasonal_peaks" options={["Verão", "Inverno", "Dia dos Pais", ...]} optional />
  <Textarea name="main_differentiation" maxLength={300} optional />
  <DynamicList name="top_products" max={5} optional />
</TabPanel>
```

### Tab 2: Posicionamento (5 campos)

```tsx
// components/Tab2-Posicionamento.tsx
<TabPanel>
  <Select name="price_positioning" options={["economic", "medium", "premium", "luxury"]} optional />
  <NumberInput name="average_ticket_brl" placeholder="Ex: 150" optional />
  <DynamicList name="competitors" max={3} optional />
  <Textarea name="unique_selling_proposition.primary_usp" maxLength={200} optional />
  <MultiSelect name="customer_pain_points" options={["Falta de tempo", "Preço alto", ...]} optional />
</TabPanel>
```

### Tab 3: Conversão (3 campos)

```tsx
// components/Tab3-Conversao.tsx
<TabPanel>
  <ConversionTriggers>
    <Slider name="conversion_triggers.urgency_preference" min={0} max={10} />
    <Slider name="conversion_triggers.scarcity_comfortable" min={0} max={10} />
    <Checkbox name="conversion_triggers.social_proof_available" />
    <Checkbox name="conversion_triggers.guarantee_offered" />
  </ConversionTriggers>
  <DynamicCTAList name="successful_past_ctas" max={3} optional />
  <TextInput name="local_events_calendar" optional />
</TabPanel>
```

### Tab 4: Avançado (2 campos)

```tsx
// components/Tab4-Avancado.tsx
<TabPanel>
  <LanguageSpecifics>
    <Checkbox name="language_specifics.uses_regional_slang" />
    <Select name="language_specifics.formality_level" options={["very_formal", "formal", "neutral", "casual", "very_casual"]} />
    <Slider name="language_specifics.emoji_comfort" min={0} max={10} />
    <NumberInput name="language_specifics.max_exclamations_per_copy" max={5} />
  </LanguageSpecifics>
  <CopyLengthPreferences>
    <NumberInput name="copy_length_preferences.headline_max_words" default={10} />
    <NumberInput name="copy_length_preferences.body_max_words" default={50} />
    <Checkbox name="copy_length_preferences.prefers_brevity" />
  </CopyLengthPreferences>
</TabPanel>
```

---

## 🔄 Auto-Save Behavior (OBRIGATÓRIO)

### Trigger

```typescript
// hooks/useIntelligenceForm.ts
const [formData, setFormData] = useState({});
const [activeTab, setActiveTab] = useState(0);

// Debounced auto-save quando troca de aba
useEffect(() => {
  const timer = setTimeout(() => {
    if (Object.keys(formData).length > 0) {
      saveIntelligence(formData); // PATCH /api/store/intelligence
    }
  }, 500); // 500ms debounce

  return () => clearTimeout(timer);
}, [activeTab]); // Trigger: mudança de aba
```

### User Feedback (Básico)

```tsx
<SaveIndicator>
  {isSaving ? "💾 Salvando..." : "✅ Salvo automaticamente"}
</SaveIndicator>
```

**Nota:** Tratamento de erros de rede (retry automático, offline banner) será implementado em **Story 2B**.

---

## 📊 Progress Indicator + Gamificação

### Layout

```tsx
// components/ProgressIndicator.tsx
<div className="progress-container">
  <ProgressBar value={score} max={100} />
  <span>{filledFields}/15 campos preenchidos</span>
  <Badge score={score} />
  <span>Score: {score}/100</span>
</div>
```

### Badge Logic (OBRIGATÓRIO)

```typescript
const getBadge = (score: number) => {
  if (score < 40) return "🥉 Inteligência Básica";
  if (score < 70) return "🥈 Inteligência Média";
  return "🥇 Inteligência Avançada";
};
```

**Critérios de Badge:**
- **🥉 Bronze (<40):** Campos obrigatórios mínimos preenchidos
- **🥈 Prata (40-69):** Maioria dos campos preenchidos
- **🥇 Ouro (≥70):** Calibração completa e detalhada

---

## 📱 Responsive Behavior (Desktop-First)

### Desktop (>768px)
- Abas com texto completo ("Público & Tom", "Posicionamento", etc.)
- Campos lado a lado quando possível (layout de 2 colunas)
- Full width (max-width: 1200px)

### Tablet (768px)
- Abas com texto reduzido ("Público", "Posição", etc.)
- Campos empilhados (layout de 1 coluna)

**Nota:** Mobile swipe gestures e otimizações para <640px serão implementadas em **Story 2B**.

---

## ✅ Acceptance Criteria (ACs 1-10)

- [ ] **AC1:** Página renderiza em `/dashboard/store/intelligence`
- [ ] **AC2:** 4 abas funcionais: Público & Tom, Posicionamento, Conversão, Avançado
- [ ] **AC3:** Auto-save ativado ao trocar de aba (debounce 500ms)
- [ ] **AC4:** Auto-save NÃO dispara se formulário estiver vazio
- [ ] **AC5:** Progress bar atualiza em tempo real (8/15 campos preenchidos)
- [ ] **AC6:** Score calculado corretamente (0-100) e exibido
- [ ] **AC7:** Badge atualiza conforme score (<40 🥉, 40-69 🥈, >=70 🥇)
- [ ] **AC8:** Campos opcionais marcados claramente com "(Opcional)"
- [ ] **AC9:** Campos com placeholder informativos (ex: "Ex: Homens 30-50 anos...")
- [ ] **AC10:** Validações inline (ex: max 200 caracteres, número >= 0)

---

## 🧪 Test Scenarios

### Unit Tests

```typescript
describe('IntelligencePage - Core', () => {
  it('renders 4 tabs', () => {
    render(<IntelligencePage />);
    expect(screen.getByText('Público & Tom')).toBeInTheDocument();
    expect(screen.getByText('Posicionamento')).toBeInTheDocument();
    expect(screen.getByText('Conversão')).toBeInTheDocument();
    expect(screen.getByText('Avançado')).toBeInTheDocument();
  });

  it('auto-saves after 500ms when switching tabs', async () => {
    const { clickTab, fillField } = renderWithMocks(<IntelligencePage />);
    fillField('brand_voice', 'informal');
    clickTab(1); // Switch to Tab 2
    await waitFor(() => expect(mockPatch).toHaveBeenCalled(), { timeout: 600 });
  });

  it('does NOT auto-save if form is empty', async () => {
    const { clickTab } = renderWithMocks(<IntelligencePage />);
    clickTab(1);
    await waitFor(() => expect(mockPatch).not.toHaveBeenCalled(), { timeout: 600 });
  });

  it('calculates score correctly (8/15 = 53)', () => {
    const score = calculateScore(mockContext);
    expect(score).toBe(53);
  });

  it('displays correct badge for score 53', () => {
    render(<Badge score={53} />);
    expect(screen.getByText('🥈 Inteligência Média')).toBeInTheDocument();
  });

  it('displays correct badge for score 75', () => {
    render(<Badge score={75} />);
    expect(screen.getByText('🥇 Inteligência Avançada')).toBeInTheDocument();
  });

  it('marks optional fields with "(Opcional)" label', () => {
    render(<Tab1PublicoTom />);
    expect(screen.getByText('Público-alvo (Opcional)')).toBeInTheDocument();
  });

  it('shows placeholder text for inputs', () => {
    render(<Tab2Posicionamento />);
    expect(screen.getByPlaceholderText('Ex: 150')).toBeInTheDocument();
  });

  it('validates max length inline (200 chars)', async () => {
    render(<Tab1PublicoTom />);
    const textarea = screen.getByLabelText('Público-alvo');
    await userEvent.type(textarea, 'A'.repeat(201));
    expect(screen.getByText('Máximo 200 caracteres')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
describe('Intelligence Form Integration', () => {
  it('preserves form state when switching tabs', async () => {
    render(<IntelligencePage />);
    const textarea = screen.getByLabelText('Público-alvo');
    await userEvent.type(textarea, 'Público A');
    
    // Switch to Tab 2
    await userEvent.click(screen.getByText('Posicionamento'));
    await waitFor(() => expect(mockPatch).toHaveBeenCalled());
    
    // Switch back to Tab 1
    await userEvent.click(screen.getByText('Público & Tom'));
    expect(screen.getByLabelText('Público-alvo')).toHaveValue('Público A');
  });

  it('updates progress bar and score in real-time', async () => {
    render(<IntelligencePage />);
    
    // Initial state
    expect(screen.getByText('0/15 campos preenchidos')).toBeInTheDocument();
    expect(screen.getByText('Score: 0/100')).toBeInTheDocument();
    
    // Fill 1 field
    await userEvent.click(screen.getByLabelText('Informal'));
    expect(screen.getByText('1/15 campos preenchidos')).toBeInTheDocument();
    expect(screen.getByText(/Score: \d+\/100/)).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
describe('Intelligence Flow - Core', () => {
  it('completes full tab navigation and saves data', async () => {
    await page.goto('/dashboard/store/intelligence');
    
    // Tab 1: Fill field
    await page.fill('textarea[name="target_audience"]', 'Público A');
    await page.click('button:has-text("Posicionamento")');
    await page.waitForSelector('text=✅ Salvo automaticamente');
    
    // Tab 2: Fill field
    await page.selectOption('select[name="price_positioning"]', 'premium');
    await page.click('button:has-text("Conversão")');
    await page.waitForSelector('text=✅ Salvo automaticamente');
    
    // Verify progress
    expect(await page.textContent('.progress-container')).toContain('2/15 campos');
  });

  it('displays correct badge based on score', async () => {
    await page.goto('/dashboard/store/intelligence');
    
    // Fill 5 fields (score ~33)
    await fillFields(5);
    expect(await page.textContent('.badge')).toBe('🥉 Inteligência Básica');
    
    // Fill 10 fields (score ~67)
    await fillFields(5);
    expect(await page.textContent('.badge')).toBe('🥈 Inteligência Média');
    
    // Fill all 15 fields (score 100)
    await fillFields(5);
    expect(await page.textContent('.badge')).toBe('🥇 Inteligência Avançada');
  });
});
```

---

## 📚 References

- **UX Spec:** `docs/ux/intelligence-calibration-tabs.md` (wireframes completos)
- **API Endpoint:** Story 1 - PATCH /api/store/intelligence
- **Referência de código:** `app/dashboard/store/page.tsx` (onboarding completo)
- **Story 2B:** Mobile + Advanced UI (swipe, retry, A11Y, performance)

---

## 🔗 Dependencies

- **Blocked By:** Story 1 (Backend Intelligence API deve estar pronto)
- **Blocks:** Story 2B (Mobile UI depende do core funcional)

---

## 📝 Implementation Notes

### Component Reuse

Reutilizar componentes do onboarding existente:
- `<Textarea />` com validação de maxLength
- `<Select />` com opções customizáveis
- `<DashboardShell />` para layout consistente

### State Management

```typescript
// Usar Context API (simplicidade para 2A)
type IntelligenceStore = {
  context: Partial<IntelligenceContext>;
  score: number;
  filledFields: number;
  badge: string;
  updateField: (field: string, value: any) => void;
  saveChanges: () => Promise<void>;
};
```

### Debounce Implementation

```typescript
// Custom hook com lodash.debounce ou native setTimeout
const useDebouncedSave = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(callback, delay);
  };
};
```

---

## ✋ Out of Scope (Ver Story 2B)

- Mobile swipe horizontal entre abas
- Retry automático de erros de rede
- Banner offline + localStorage fallback
- Otimizações de performance (lazy loading, memoization)
- Acessibilidade avançada (keyboard nav completo)

---

## 🎯 Definition of Done

- [ ] Código implementado e testado localmente
- [ ] 4 abas funcionais com 15 campos mapeados
- [ ] Auto-save obrigatório implementado (debounce 500ms)
- [ ] Progress indicator + score + badges funcionais
- [ ] Desktop + tablet responsive (>768px)
- [ ] Testes unitários com 90% cobertura (ACs 1-10)
- [ ] Testes E2E com 100% cobertura (ACs 1-10)
- [ ] CodeRabbit review passou (self-healing completo)
- [ ] Form state preservation validado
- [ ] Validações inline funcionando

---

## 📋 File List (Updated During Implementation)

- [ ] `app/dashboard/store/intelligence/page.tsx`
- [ ] `app/dashboard/store/intelligence/components/IntelligenceTabs.tsx`
- [ ] `app/dashboard/store/intelligence/components/ProgressIndicator.tsx`
- [ ] `app/dashboard/store/intelligence/components/Tab1-PublicoTom.tsx`
- [ ] `app/dashboard/store/intelligence/components/Tab2-Posicionamento.tsx`
- [ ] `app/dashboard/store/intelligence/components/Tab3-Conversao.tsx`
- [ ] `app/dashboard/store/intelligence/components/Tab4-Avancado.tsx`
- [ ] `app/dashboard/store/intelligence/hooks/useIntelligenceForm.ts`
- [ ] `app/dashboard/store/intelligence/hooks/useScoreCalculation.ts`
- [ ] `tests/unit/intelligence-page.test.tsx`
- [ ] `tests/e2e/intelligence-flow.spec.ts`

---

**Status:** 🟢 Ready - Aguardando implementação (@dev)  
**Next Steps:** @dev *develop STORY-2A-frontend-core.md --mode=interactive  
**Estimated Duration:** 2.5 days (sequential execution após Story 1)
