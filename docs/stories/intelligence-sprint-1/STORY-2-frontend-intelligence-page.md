# Story 2: Frontend - Intelligence Page (4 Abas)

**Sprint:** Intelligence Calibration Sprint 1  
**Effort:** 5 pontos  
**Status:** Draft  
**Created:** 2026-04-30  
**Agents:** @dev, @qa, @ux-design-expert

---

## 📋 Context

Criar página de Intelligence Calibration com sistema de 4 abas, auto-save obrigatório (debounce 500ms), e gamificação (progress bar + score + badges).

**Referência de implementação:** `app/dashboard/store/page.tsx` (onboarding básico já funcional)  
**Specs UX completas:** `docs/ux/intelligence-calibration-tabs.md`

---

## 🎯 Objective

Permitir que lojistas calibrem 15 campos de intelligence em 4 abas contextualizadas, com auto-save automático ao trocar de aba.

---

## 📐 Specifications

### File Structure

```
app/dashboard/store/intelligence/
├── page.tsx                    # Main page component
├── components/
│   ├── IntelligenceTabs.tsx    # Tab navigation
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
      <ProgressIndicator score={score} filledFields={8} totalFields={15} />
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

### User Feedback

```tsx
<SaveIndicator>
  {isSaving ? "💾 Salvando..." : "✅ Salvo automaticamente"}
</SaveIndicator>
```

### Edge Cases

1. **Perda de conexão:** Mostrar banner "⚠️ Offline - suas alterações serão salvas quando reconectar"
2. **Erro de API:** Retry automático (max 3 tentativas) + fallback para salvamento local (localStorage)
3. **Navegação rápida entre abas:** Debounce de 500ms evita chamadas desnecessárias

---

## 📊 Progress Indicator

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

### Badge Logic

```typescript
const getBadge = (score: number) => {
  if (score < 40) return "🥉 Inteligência Básica";
  if (score < 70) return "🥈 Inteligência Média";
  return "🥇 Inteligência Avançada";
};
```

---

## 📱 Mobile Behavior

### Swipe Horizontal

```tsx
// Mobile: Abas compactas com swipe
<Swipeable onSwipeLeft={nextTab} onSwipeRight={prevTab}>
  <TabContent />
</Swipeable>
```

### Responsive Breakpoints

- **Desktop (>768px):** Abas com texto completo + campos lado a lado
- **Tablet (768px):** Abas com texto reduzido + campos empilhados
- **Mobile (<640px):** Abas iconificadas + swipe horizontal + 1 campo por linha

---

## ✅ Acceptance Criteria

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
- [ ] **AC11:** Mobile: Swipe horizontal entre abas funciona em dispositivos touch
- [ ] **AC12:** Mobile: Layout responsivo (abas compactas, campos empilhados)
- [ ] **AC13:** SaveIndicator mostra estado (Salvando / Salvo / Erro)
- [ ] **AC14:** Erro de rede: banner offline + retry automático
- [ ] **AC15:** Form state preservado ao navegar entre abas (não perde dados)
- [ ] **AC16:** Testes unitários para hooks (useIntelligenceForm, useScoreCalculation)
- [ ] **AC17:** Testes E2E para auto-save + navegação entre abas
- [ ] **AC18:** CodeRabbit review passa com max 2 iterações de self-healing
- [ ] **AC19:** Acessibilidade: Tab navigation com teclado (Tab, Shift+Tab, Enter)
- [ ] **AC20:** Performance: Renderização < 200ms (lazy load abas inativas)

---

## 🧪 Test Scenarios

### Unit Tests

```typescript
describe('IntelligencePage', () => {
  it('renders 4 tabs', () => {
    render(<IntelligencePage />);
    expect(screen.getByText('Público & Tom')).toBeInTheDocument();
  });

  it('auto-saves after 500ms when switching tabs', async () => {
    const { clickTab } = renderWithMocks(<IntelligencePage />);
    clickTab(1); // Switch to Tab 2
    await waitFor(() => expect(mockPatch).toHaveBeenCalled(), { timeout: 600 });
  });

  it('calculates score correctly (8/15 = 53)', () => {
    const score = calculateScore(mockContext);
    expect(score).toBe(53);
  });

  it('displays correct badge for score 53', () => {
    render(<Badge score={53} />);
    expect(screen.getByText('🥈 Inteligência Média')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
describe('Intelligence Flow', () => {
  it('saves data when switching tabs and preserves form state', async () => {
    await page.goto('/dashboard/store/intelligence');
    await page.fill('textarea[name="target_audience"]', 'Público A');
    await page.click('button:has-text("Posicionamento")'); // Switch tab
    await page.waitForSelector('text=✅ Salvo automaticamente');
    await page.click('button:has-text("Público & Tom")'); // Back to Tab 1
    expect(await page.inputValue('textarea[name="target_audience"]')).toBe('Público A');
  });

  it('handles offline scenario gracefully', async () => {
    await page.setOffline(true);
    await page.fill('textarea[name="target_audience"]', 'Público B');
    await page.click('button:has-text("Posicionamento")');
    await page.waitForSelector('text=⚠️ Offline');
    await page.setOffline(false);
    await page.waitForSelector('text=✅ Salvo automaticamente');
  });
});
```

---

## 📚 References

- **UX Spec:** `docs/ux/intelligence-calibration-tabs.md` (wireframes completos)
- **API Endpoint:** Story 1 - PATCH /api/store/intelligence
- **Referência de código:** `app/dashboard/store/page.tsx` (onboarding completo)
- **Constitution:** `docs/PROJECT-CONSTITUTION.md` (Artigo I: Consultar CRITICAL-FLOWS)

---

## 🔗 Dependencies

- **Blocks:** Story 3 (Logo IA só faz sentido após intelligence page)
- **Blocked By:** Story 1 (Backend Intelligence API deve estar pronto)

---

## 📝 Implementation Notes

### Component Reuse

Reutilizar componentes do onboarding existente:
- `<Textarea />` com validação de maxLength
- `<Select />` com opções customizáveis
- `<DashboardShell />` para layout consistente

### State Management

```typescript
// Usar Zustand ou Context API (avaliar complexidade)
type IntelligenceStore = {
  context: Partial<IntelligenceContext>;
  score: number;
  updateField: (field: string, value: any) => void;
  saveChanges: () => Promise<void>;
};
```

### Performance Optimization

- **Lazy load abas inativas:** `React.lazy()` + `Suspense`
- **Memoize cálculos pesados:** `useMemo` para score calculation
- **Debounce auto-save:** `lodash.debounce` ou custom hook

---

## ✋ Out of Scope

- Sugestões de IA baseadas em campos preenchidos (futuro - Phase 2.2)
- Validação de schema JSONB no frontend (backend valida)
- Exportação de intelligence para PDF (não solicitado)

---

## 🎯 Definition of Done

- [ ] Código implementado e testado localmente
- [ ] 4 abas funcionais com 15 campos mapeados
- [ ] Auto-save obrigatório implementado e testado
- [ ] Progress indicator + score + badges funcionais
- [ ] Mobile responsivo com swipe horizontal
- [ ] Testes unitários e E2E com 100% cobertura dos ACs
- [ ] CodeRabbit review passou (self-healing completo)
- [ ] Acessibilidade validada (navegação por teclado)
- [ ] Performance < 200ms (lazy loading)
- [ ] Documentação atualizada (se aplicável)

---

**Status:** 🟡 Draft - Aguardando validação do @po  
**Next Steps:** @po *validate → @dev *develop → @qa *qa-gate
