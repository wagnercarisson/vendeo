# Story 2B: Frontend - Mobile + Advanced UI

**Sprint:** Intelligence Calibration Sprint 1  
**Effort:** 3 pontos  
**Status:** Ready  
**Created:** 2026-04-30  
**Split From:** STORY-2-frontend-intelligence-page.md  
**Agents:** @dev, @qa  
**Blocked By:** Story 2A COMPLETA

---

## 📋 Context

Adicionar camada de polish e mobile enhancements à Intelligence Page: swipe gestures, retry automático de erros, acessibilidade completa, e otimizações de performance.

**Escopo:** Mobile-first enhancements + error handling + A11Y + performance.  
**Pré-requisito:** Story 2A (core desktop functionality) deve estar 100% funcional.

**Referência:** `docs/ux/intelligence-calibration-tabs.md` (mobile specs)

---

## 🎯 Objective

Transformar a intelligence page desktop-first (Story 2A) em experiência mobile-optimized com resiliência a erros e acessibilidade WCAG AA.

---

## 📐 Specifications

### Enhancements sobre Story 2A

```
app/dashboard/store/intelligence/
├── page.tsx                    # Add mobile optimization
├── components/
│   ├── IntelligenceTabs.tsx    # Add swipe gestures
│   ├── SaveIndicator.tsx       # NEW: Retry logic + offline banner
│   └── [...existing tabs]      # Add mobile responsive improvements
└── hooks/
    ├── useIntelligenceForm.ts  # Add retry logic + localStorage fallback
    └── useOfflineDetection.ts  # NEW: Network status monitoring
```

---

## 📱 Mobile Swipe Gestures (PRIORITY)

### Implementation

```tsx
// components/IntelligenceTabs.tsx (enhanced)
import { useSwipeable } from 'react-swipeable';

export function IntelligenceTabs({ children }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveTab(Math.min(activeTab + 1, 3)),
    onSwipedRight: () => setActiveTab(Math.max(activeTab - 1, 0)),
    trackMouse: false, // Touch only
    preventScrollOnSwipe: true,
  });
  
  return (
    <div {...handlers} className="swipeable-tabs">
      {/* Tab content */}
    </div>
  );
}
```

### Mobile Responsive Breakpoints

```css
/* Mobile (<640px): Iconified tabs + swipe */
@media (max-width: 640px) {
  .tab-button {
    font-size: 0; /* Hide text */
    width: 48px;
  }
  
  .tab-button::before {
    content: attr(data-icon); /* Show icon only */
    font-size: 24px;
  }
  
  .tab-content {
    padding: 16px; /* Compact padding */
  }
  
  input, textarea, select {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Tablet (640-768px): Abbreviated text */
@media (min-width: 640px) and (max-width: 768px) {
  .tab-button {
    font-size: 14px;
  }
}
```

---

## 🔄 Error Handling + Retry Logic

### Retry Automático (Max 3 Tentativas)

```typescript
// hooks/useIntelligenceForm.ts (enhanced)
const saveWithRetry = async (data: Partial<IntelligenceContext>, maxRetries = 3) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const response = await fetch('/api/store/intelligence', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Save failed');
      
      setIsSaving(false);
      return true;
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        setSaveError('Não foi possível salvar. Verifique sua conexão.');
        setIsSaving(false);
        
        // Fallback: Save to localStorage
        localStorage.setItem('intelligence-pending', JSON.stringify(data));
        return false;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
};
```

### Offline Detection

```typescript
// hooks/useOfflineDetection.ts (NEW)
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

### SaveIndicator Component (NEW)

```tsx
// components/SaveIndicator.tsx (NEW)
export function SaveIndicator({ isSaving, error, isOnline }: Props) {
  if (!isOnline) {
    return (
      <div className="save-indicator offline">
        ⚠️ Offline - suas alterações serão salvas quando reconectar
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="save-indicator error">
        ❌ {error}
        <button onClick={retryNow}>Tentar novamente</button>
      </div>
    );
  }
  
  if (isSaving) {
    return <div className="save-indicator saving">💾 Salvando...</div>;
  }
  
  return <div className="save-indicator success">✅ Salvo automaticamente</div>;
}
```

---

## ♿ Acessibilidade (WCAG AA)

### Keyboard Navigation

```tsx
// components/IntelligenceTabs.tsx (enhanced)
const handleKeyDown = (e: KeyboardEvent, tabIndex: number) => {
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      setActiveTab(Math.max(tabIndex - 1, 0));
      break;
    case 'ArrowRight':
      e.preventDefault();
      setActiveTab(Math.min(tabIndex + 1, 3));
      break;
    case 'Home':
      e.preventDefault();
      setActiveTab(0);
      break;
    case 'End':
      e.preventDefault();
      setActiveTab(3);
      break;
  }
};

return (
  <div role="tablist">
    {tabs.map((tab, i) => (
      <button
        key={i}
        role="tab"
        aria-selected={activeTab === i}
        aria-controls={`tabpanel-${i}`}
        tabIndex={activeTab === i ? 0 : -1}
        onKeyDown={(e) => handleKeyDown(e, i)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
```

### ARIA Labels

```tsx
<div role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0">
  <label htmlFor="brand_voice">
    Tom de voz
    <span className="sr-only">(Campo obrigatório)</span>
  </label>
  <input
    id="brand_voice"
    name="brand_voice"
    aria-required="true"
    aria-describedby="brand_voice-hint"
  />
  <p id="brand_voice-hint" className="hint-text">
    Escolha o tom que representa sua marca
  </p>
</div>
```

---

## ⚡ Performance Optimization

### Lazy Loading Abas Inativas

```tsx
// page.tsx (enhanced)
import { lazy, Suspense } from 'react';

const Tab1PublicoTom = lazy(() => import('./components/Tab1-PublicoTom'));
const Tab2Posicionamento = lazy(() => import('./components/Tab2-Posicionamento'));
const Tab3Conversao = lazy(() => import('./components/Tab3-Conversao'));
const Tab4Avancado = lazy(() => import('./components/Tab4-Avancado'));

export default function IntelligencePage() {
  return (
    <IntelligenceTabs>
      <Suspense fallback={<Loading />}>
        {activeTab === 0 && <Tab1PublicoTom />}
        {activeTab === 1 && <Tab2Posicionamento />}
        {activeTab === 2 && <Tab3Conversao />}
        {activeTab === 3 && <Tab4Avancado />}
      </Suspense>
    </IntelligenceTabs>
  );
}
```

### Memoization

```typescript
// hooks/useScoreCalculation.ts (enhanced)
import { useMemo } from 'react';

export function useScoreCalculation(context: Partial<IntelligenceContext>) {
  const score = useMemo(() => {
    const fields = Object.keys(context);
    const filledFields = fields.filter(key => {
      const value = context[key];
      return value !== null && value !== '' && value !== undefined;
    });
    
    // Score: (filledFields / totalFields) * 100
    return Math.round((filledFields.length / 15) * 100);
  }, [context]);
  
  const badge = useMemo(() => {
    if (score < 40) return "🥉 Inteligência Básica";
    if (score < 70) return "🥈 Inteligência Média";
    return "🥇 Inteligência Avançada";
  }, [score]);
  
  return { score, badge, filledFields: Object.keys(context).length };
}
```

---

## ✅ Acceptance Criteria (ACs 11-20)

- [ ] **AC11:** Mobile: Swipe horizontal entre abas funciona em dispositivos touch
- [ ] **AC12:** Mobile: Layout responsivo (abas compactas, campos empilhados)
- [ ] **AC13:** SaveIndicator mostra estado (Salvando / Salvo / Erro)
- [ ] **AC14:** Erro de rede: retry automático (max 3 tentativas) + localStorage fallback
- [ ] **AC15:** Form state preservado ao navegar entre abas (não perde dados)
- [ ] **AC16:** Testes unitários para hooks (useOfflineDetection, retry logic)
- [ ] **AC17:** Testes E2E para auto-save + navegação entre abas (mobile emulation)
- [ ] **AC18:** CodeRabbit review passa com max 2 iterações de self-healing
- [ ] **AC19:** Acessibilidade: Tab navigation com teclado (Tab, Shift+Tab, Arrow keys, Home, End)
- [ ] **AC20:** Performance: Renderização < 200ms (lazy load abas inativas)

---

## 🧪 Test Scenarios

### Unit Tests

```typescript
describe('IntelligencePage - Mobile + Advanced', () => {
  it('swipes to next tab on swipe left', async () => {
    const { container } = render(<IntelligencePage />);
    const tabs = container.querySelector('.swipeable-tabs');
    
    fireEvent.touchStart(tabs, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(tabs, { changedTouches: [{ clientX: 50 }] }); // Swipe left
    
    await waitFor(() => expect(screen.getByText('Posicionamento')).toHaveAttribute('aria-selected', 'true'));
  });

  it('retries save 3 times before showing error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    const { saveWithRetry } = renderHook(() => useIntelligenceForm());
    await saveWithRetry.current({ brand_voice: 'informal' });
    
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(screen.getByText(/Não foi possível salvar/)).toBeInTheDocument();
  });

  it('saves to localStorage on persistent failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    const { saveWithRetry } = renderHook(() => useIntelligenceForm());
    await saveWithRetry.current({ brand_voice: 'informal' });
    
    expect(localStorage.getItem('intelligence-pending')).toBe(
      JSON.stringify({ brand_voice: 'informal' })
    );
  });

  it('detects offline status', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    
    const { result } = renderHook(() => useOfflineDetection());
    expect(result.current).toBe(false);
  });

  it('keyboard navigation works (ArrowLeft, ArrowRight)', () => {
    render(<IntelligencePage />);
    const firstTab = screen.getByRole('tab', { name: 'Público & Tom' });
    
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    
    expect(screen.getByRole('tab', { name: 'Posicionamento' })).toHaveFocus();
  });

  it('renders mobile layout on small screens', () => {
    global.innerWidth = 640;
    render(<IntelligencePage />);
    
    const tabs = screen.getAllByRole('tab');
    tabs.forEach(tab => {
      expect(tab).toHaveClass('mobile-icon-only');
    });
  });
});
```

### E2E Tests (Mobile Emulation)

```typescript
describe('Intelligence Flow - Mobile', () => {
  beforeEach(async () => {
    await page.emulate(devices['iPhone 12']);
  });

  it('swipes between tabs on mobile', async () => {
    await page.goto('/dashboard/store/intelligence');
    
    // Swipe left
    await page.touchscreen.tap(200, 300);
    await page.touchscreen.swipe({ x: 200, y: 300 }, { x: 50, y: 300 });
    
    await page.waitForSelector('[aria-selected="true"]:has-text("Posicionamento")');
    expect(await page.textContent('[aria-selected="true"]')).toBe('Posicionamento');
  });

  it('handles offline scenario with localStorage fallback', async () => {
    await page.goto('/dashboard/store/intelligence');
    await page.setOffline(true);
    
    await page.fill('textarea[name="target_audience"]', 'Público Offline');
    await page.click('button:has-text("Posicionamento")');
    
    // Check localStorage
    const pendingData = await page.evaluate(() => localStorage.getItem('intelligence-pending'));
    expect(pendingData).toContain('Público Offline');
    
    // Reconnect
    await page.setOffline(false);
    await page.waitForSelector('text=✅ Salvo automaticamente');
  });

  it('retries save on network error', async () => {
    await page.route('/api/store/intelligence', route => {
      route.abort('failed');
    });
    
    await page.goto('/dashboard/store/intelligence');
    await page.fill('textarea[name="target_audience"]', 'Público');
    await page.click('button:has-text("Posicionamento")');
    
    await page.waitForSelector('text=❌ Não foi possível salvar');
    expect(await page.textContent('.save-indicator')).toContain('Tentar novamente');
  });

  it('keyboard navigation works (full a11y test)', async () => {
    await page.goto('/dashboard/store/intelligence');
    
    // Tab to first tab button
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('tab');
    
    // Arrow right to next tab
    await page.keyboard.press('ArrowRight');
    expect(await page.textContent('[aria-selected="true"]')).toBe('Posicionamento');
    
    // Home key to first tab
    await page.keyboard.press('Home');
    expect(await page.textContent('[aria-selected="true"]')).toBe('Público & Tom');
    
    // End key to last tab
    await page.keyboard.press('End');
    expect(await page.textContent('[aria-selected="true"]')).toBe('Avançado');
  });
});
```

### Performance Tests

```typescript
describe('Intelligence Page - Performance', () => {
  it('lazy loads inactive tabs (< 200ms render)', async () => {
    const start = performance.now();
    render(<IntelligencePage />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
    
    // Only active tab should be loaded
    expect(screen.queryByText('Tab 2 content')).not.toBeInTheDocument();
  });

  it('memoizes score calculation (no unnecessary re-renders)', () => {
    const { rerender } = render(<ProgressIndicator context={mockContext} />);
    const initialRenders = countRenders();
    
    // Re-render with same context
    rerender(<ProgressIndicator context={mockContext} />);
    const finalRenders = countRenders();
    
    expect(finalRenders - initialRenders).toBe(0); // No re-render
  });
});
```

---

## 📚 References

- **Story 2A:** Frontend Core (desktop functionality)
- **UX Spec:** `docs/ux/intelligence-calibration-tabs.md` (mobile wireframes)
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **React Swipeable:** https://github.com/FormidableLabs/react-swipeable

---

## 🔗 Dependencies

- **Blocked By:** Story 2A COMPLETA (core desktop functionality)
- **Blocks:** Story 4 (Tests require full implementation)

---

## 📝 Implementation Notes

### Mobile Testing Strategy

```bash
# Test on real devices
npm run dev -- --host 0.0.0.0
# Access from mobile: http://192.168.x.x:3000

# Playwright mobile emulation
npm run test:e2e -- --project=mobile
```

### Offline Testing

```bash
# Chrome DevTools: Network tab → Offline
# Playwright: page.setOffline(true)
```

### Accessibility Testing

```bash
# Automated: axe-core
npm run test:a11y

# Manual: NVDA (Windows) / VoiceOver (Mac)
```

---

## ✋ Out of Scope

- Sugestões de IA baseadas em campos preenchidos (futuro)
- PWA offline-first architecture (não solicitado)
- Animações complexas de transição entre abas (nice-to-have)

---

## 🎯 Definition of Done

- [ ] Mobile swipe gestures implementados e testados em dispositivos reais
- [x] Retry logic + localStorage fallback funcionando
- [x] Offline detection + banner de status
- [x] Keyboard navigation completo (ArrowLeft/Right, Home, End)
- [x] ARIA labels e roles corretos (WCAG AA compliance)
- [x] Lazy loading abas inativas (performance < 200ms)
- [x] Testes unitários com cobertura para swipe, retry backoff e estado offline inicial
- [ ] Testes E2E mobile com 100% cobertura (ACs 11-20)
- [ ] CodeRabbit review passou (self-healing completo)
- [ ] Acessibilidade validada com axe-core + manual testing

---

## 📋 File List (Updated During Implementation)

- [x] `app/dashboard/store/intelligence/page.tsx` (enhanced)
- [x] `app/dashboard/store/intelligence/components/IntelligenceTabs.tsx` (enhanced)
- [x] `app/dashboard/store/intelligence/components/FormPrimitives.tsx` (enhanced)
- [x] `app/dashboard/store/intelligence/components/ProgressIndicator.tsx` (enhanced)
- [x] `app/dashboard/store/intelligence/components/SaveIndicator.tsx` (NEW)
- [x] `app/dashboard/store/intelligence/components/Tab1-PublicoTom.tsx` (enhanced)
- [x] `app/dashboard/store/intelligence/components/Tab2-Posicionamento.tsx` (enhanced)
- [x] `app/dashboard/store/intelligence/hooks/useIntelligenceForm.ts` (enhanced)
- [x] `app/dashboard/store/intelligence/hooks/useOfflineDetection.ts` (NEW)
- [x] `app/dashboard/store/intelligence/hooks/useOfflineDetection.test.ts` (NEW)
- [x] `app/dashboard/store/intelligence/utils/mobileInteractions.ts` (NEW)
- [x] `app/dashboard/store/intelligence/utils/mobileInteractions.test.ts` (NEW)
- [x] `app/dashboard/store/intelligence/utils/saveRetry.ts` (NEW)
- [x] `app/dashboard/store/intelligence/utils/saveRetry.test.ts` (NEW)

---

**Status:** 🟢 Ready - Aguardando Story 2A COMPLETA  
**Next Steps:** @dev *develop STORY-2B-mobile-ui.md --mode=interactive (após 2A)  
**Estimated Duration:** 2.5 days (sequential execution após Story 2A)
