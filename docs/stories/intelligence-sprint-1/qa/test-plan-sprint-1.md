# Test Plan - Intelligence Calibration Sprint 1

**Sprint:** Intelligence Calibration Sprint 1  
**Created:** 2026-04-30  
**QA Agent:** @qa (Quinn)  
**Status:** Ready for FASE 3 (Implementation)  
**Total Scenarios:** 62 test cases across 4 stories

---

## 📋 Executive Summary

Comprehensive test plan covering all 4 stories in Intelligence Sprint 1: Backend API, Frontend Intelligence Page, Logo IA DALL-E 3, and comprehensive validation suite. Focus areas: JSONB edge cases, RLS security, auto-save reliability, mobile behavior, and AI integration.

---

## 🎯 Test Coverage Matrix

| Story | Unit Tests | Integration Tests | E2E Tests | Total Scenarios |
|-------|------------|-------------------|-----------|-----------------|
| **Story 1: Backend API** | 15 | 5 | - | 20 |
| **Story 2: Frontend Intelligence Page** | 8 | - | 15 | 23 |
| **Story 3: Logo IA DALL-E 3** | 5 | 2 | 7 | 14 |
| **Story 4: Cross-Story Validation** | 3 | - | 2 | 5 |
| **TOTAL** | **31** | **7** | **24** | **62** |

### Coverage Targets

| Component | Target | Rationale |
|-----------|--------|-----------|
| Backend API | 100% | Critical data integrity |
| Frontend Hooks | 90% | Business logic heavy |
| Frontend Components | 85% | UI logic less critical |
| E2E Critical Paths | 100% ACs | User flows must work |
| RLS Policies | 100% | Security non-negotiable |
| Mobile Behavior | 100% ACs | Mobile-first product |

---

## 📚 Test Scenarios by Story

---

## Story 1: Backend Intelligence API (20 scenarios)

### Unit Tests - JSONB Operations (8 scenarios)

#### UT-S1-01: JSONB Merge - Partial Update
**Given:** Store with existing context `{ brand_voice: "formal", target_audience: "Público A" }`  
**When:** PATCH with `{ context: { top_products: ["Produto 1"] } }`  
**Then:** Context should be `{ brand_voice: "formal", target_audience: "Público A", top_products: ["Produto 1"] }`  
**Priority:** CRITICAL  
**AC Reference:** AC1, AC2

#### UT-S1-02: JSONB Merge - Overwrite Existing Field
**Given:** Store with `{ brand_voice: "formal" }`  
**When:** PATCH with `{ context: { brand_voice: "informal" } }`  
**Then:** Context should be `{ brand_voice: "informal" }` (field updated)  
**Priority:** HIGH  
**AC Reference:** AC1

#### UT-S1-03: JSONB Merge - Empty Context
**Given:** New store with `context = {}`  
**When:** PATCH with `{ context: { brand_voice: "formal" } }`  
**Then:** Context should be `{ brand_voice: "formal" }`, score = 7  
**Priority:** HIGH  
**AC Reference:** AC5

#### UT-S1-04: JSONB Malformed - Invalid JSON
**Given:** Valid auth token  
**When:** PATCH with malformed JSON `{ context: '{ invalid json' }`  
**Then:** Return HTTP 400 with error message matching `/invalid json/i`  
**Priority:** CRITICAL  
**AC Reference:** AC9

#### UT-S1-05: JSONB Null Values
**Given:** Store with existing context  
**When:** PATCH with `{ context: { brand_voice: null } }`  
**Then:** Field should be set to null, score recalculated correctly  
**Priority:** HIGH  
**AC Reference:** AC7

#### UT-S1-06: JSONB Undefined Fields
**Given:** Store with existing context  
**When:** PATCH with `{ context: {} }` (empty object)  
**Then:** Return HTTP 200, no fields changed, score unchanged  
**Priority:** MEDIUM  
**AC Reference:** AC7

#### UT-S1-07: JSONB Arrays - Empty Array
**Given:** Store with existing context  
**When:** PATCH with `{ context: { seasonal_peaks: [], competitors: [] } }`  
**Then:** Arrays saved, but NOT counted in score calculation (score should not increase)  
**Priority:** HIGH  
**AC Reference:** AC7

#### UT-S1-08: JSONB Arrays - Mixed Content
**Given:** Store with existing context  
**When:** PATCH with `{ context: { top_products: ['', null, 'Produto 1', undefined] } }`  
**Then:** Array saved as-is, score counts field as filled (length > 0)  
**Priority:** MEDIUM  
**AC Reference:** AC7

---

### Unit Tests - Score Calculation (4 scenarios)

#### UT-S1-09: Score = 0 (Empty Context)
**Given:** New store with `context = {}`  
**When:** Calculate score  
**Then:** Score should be 0  
**Priority:** CRITICAL  
**AC Reference:** AC5

#### UT-S1-10: Score = 100 (All 15 Fields Filled)
**Given:** Store with all 15 fields populated  
**When:** Calculate score  
**Then:** Score should be 100  
**Priority:** CRITICAL  
**AC Reference:** AC6

#### UT-S1-11: Score = 53 (8/15 Fields)
**Given:** Store with 8 fields filled  
**When:** Calculate score  
**Then:** Score should be 53 (Math.round((8/15)*100))  
**Priority:** HIGH  
**AC Reference:** AC4

#### UT-S1-12: Score - Nested Objects Count as 1 Field
**Given:** Store with `unique_selling_proposition: { primary_usp: "USP", supporting_points: [...] }`  
**When:** Calculate score  
**Then:** USP counts as 1 field (not 2), score = 7 (1/15)  
**Priority:** HIGH  
**AC Reference:** AC4

---

### Integration Tests - RLS Policies (5 scenarios)

#### INT-S1-01: RLS - User Owns Store (Allow)
**Given:** User A authenticated, Store A owned by User A  
**When:** User A sends PATCH to Store A  
**Then:** Return HTTP 200, update successful  
**Priority:** CRITICAL  
**AC Reference:** AC3

#### INT-S1-02: RLS - User Does NOT Own Store (Deny)
**Given:** User A authenticated, Store B owned by User B  
**When:** User A sends PATCH to Store B  
**Then:** Return HTTP 403 with error matching `/not authorized|forbidden/i`  
**Priority:** CRITICAL  
**AC Reference:** AC3

#### INT-S1-03: RLS - No Auth Token (Deny)
**Given:** No authentication token provided  
**When:** Send PATCH request  
**Then:** Return HTTP 401 with authentication error  
**Priority:** CRITICAL  
**AC Reference:** AC3

#### INT-S1-04: RLS - Invalid Auth Token (Deny)
**Given:** Invalid/expired authentication token  
**When:** Send PATCH request  
**Then:** Return HTTP 401 with token validation error  
**Priority:** HIGH  
**AC Reference:** AC3

#### INT-S1-05: RLS - Multiple Stores per User
**Given:** User A owns Store A and Store C  
**When:** User A sends PATCH to Store C  
**Then:** Return HTTP 200, update successful (ownership validated)  
**Priority:** MEDIUM  
**AC Reference:** AC3

---

### Unit Tests - Response Format (3 scenarios)

#### UT-S1-13: Response Contains Merged Context
**Given:** Valid PATCH request  
**When:** Request completes successfully  
**Then:** Response contains `{ success: true, data: { context: {...}, score: N, updated_at: "..." } }`  
**Priority:** HIGH  
**AC Reference:** AC11

#### UT-S1-14: Response - updated_at Timestamp Updated
**Given:** Store with `updated_at = "2026-04-30T10:00:00Z"`  
**When:** PATCH at "2026-04-30T10:05:00Z"  
**Then:** Response `updated_at` should be "2026-04-30T10:05:00Z" (new timestamp)  
**Priority:** HIGH  
**AC Reference:** AC8

#### UT-S1-15: Response - Score Matches Calculation
**Given:** PATCH with 8 fields filled  
**When:** Request completes  
**Then:** Response score = 53, matches backend calculation  
**Priority:** HIGH  
**AC Reference:** AC4, AC11

---

## Story 2: Frontend Intelligence Page (23 scenarios)

### Unit Tests - Hooks (8 scenarios)

#### UT-S2-01: useIntelligenceForm - Initial State Empty
**Given:** Fresh component mount  
**When:** Hook initializes  
**Then:** `formData = {}`, `activeTab = 0`, `isSaving = false`  
**Priority:** HIGH  
**AC Reference:** AC1

#### UT-S2-02: useIntelligenceForm - Auto-Save Debounce 500ms
**Given:** User fills field, switches tab  
**When:** 500ms elapses  
**Then:** PATCH API called exactly once  
**Priority:** CRITICAL  
**AC Reference:** AC3

#### UT-S2-03: useIntelligenceForm - No Save if Empty Form
**Given:** Empty form (no fields filled)  
**When:** User switches tab  
**Then:** PATCH API should NOT be called  
**Priority:** CRITICAL  
**AC Reference:** AC4

#### UT-S2-04: useIntelligenceForm - Form State Preserved Between Tabs
**Given:** Tab 1 field filled with "Público A"  
**When:** Switch to Tab 2, then back to Tab 1  
**Then:** Tab 1 field still shows "Público A"  
**Priority:** CRITICAL  
**AC Reference:** AC15

#### UT-S2-05: useScoreCalculation - Correct Score (0 fields)
**Given:** Empty context  
**When:** Calculate score  
**Then:** Score = 0  
**Priority:** HIGH  
**AC Reference:** AC6

#### UT-S2-06: useScoreCalculation - Correct Score (8 fields)
**Given:** 8 fields filled  
**When:** Calculate score  
**Then:** Score = 53  
**Priority:** HIGH  
**AC Reference:** AC6

#### UT-S2-07: useScoreCalculation - Correct Score (15 fields)
**Given:** All 15 fields filled  
**When:** Calculate score  
**Then:** Score = 100  
**Priority:** HIGH  
**AC Reference:** AC6

#### UT-S2-08: Badge Logic - Score Ranges
**Given:** Scores: 0, 39, 40, 69, 70, 100  
**When:** getBadge() called  
**Then:** Returns 🥉 (<40), 🥈 (40-69), 🥇 (>=70)  
**Priority:** MEDIUM  
**AC Reference:** AC7

---

### E2E Tests - Core Functionality (7 scenarios)

#### E2E-S2-01: Page Renders with 4 Tabs
**Given:** User navigates to `/dashboard/store/intelligence`  
**When:** Page loads  
**Then:** All 4 tabs visible: "Público & Tom", "Posicionamento", "Conversão", "Avançado"  
**Priority:** CRITICAL  
**AC Reference:** AC1, AC2

#### E2E-S2-02: Tab Navigation Works
**Given:** User on Tab 1  
**When:** Click "Posicionamento" tab  
**Then:** Tab 2 content displayed, Tab 2 highlighted  
**Priority:** CRITICAL  
**AC Reference:** AC2

#### E2E-S2-03: Auto-Save After Tab Switch (500ms)
**Given:** User fills "target_audience" in Tab 1  
**When:** Click Tab 2  
**Then:** After 500ms, see "✅ Salvo automaticamente", PATCH API called  
**Priority:** CRITICAL  
**AC Reference:** AC3

#### E2E-S2-04: Progress Indicator Updates in Real-Time
**Given:** User on page with 0/15 fields filled  
**When:** Fill 1 field  
**Then:** Progress shows "1/15", score ~7  
**Priority:** HIGH  
**AC Reference:** AC5, AC6

#### E2E-S2-05: Badge Updates Based on Score
**Given:** User has score 30 (🥉)  
**When:** Fill more fields to reach score 50  
**Then:** Badge changes to 🥈  
**Priority:** MEDIUM  
**AC Reference:** AC7

#### E2E-S2-06: Placeholder Text Visible in Fields
**Given:** User on Tab 1  
**When:** View "target_audience" field  
**Then:** Placeholder shows "Ex: Homens 30-50 anos..."  
**Priority:** LOW  
**AC Reference:** AC9

#### E2E-S2-07: Optional Fields Marked
**Given:** User on any tab  
**When:** View optional fields  
**Then:** Label shows "(Opcional)"  
**Priority:** LOW  
**AC Reference:** AC8

---

### E2E Tests - Auto-Save Reliability (4 scenarios)

#### E2E-S2-08: Auto-Save - Network Error with Retry
**Given:** Network offline  
**When:** Fill field, switch tab  
**Then:** Show "❌ Erro ao salvar", retry 3 times, show "Tentando novamente..."  
**Priority:** CRITICAL  
**AC Reference:** AC14

#### E2E-S2-09: Auto-Save - Offline Banner
**Given:** Network offline  
**When:** Fill field  
**Then:** Show banner "⚠️ Offline - suas alterações serão salvas quando reconectar"  
**Priority:** HIGH  
**AC Reference:** AC14

#### E2E-S2-10: Auto-Save - Reconnect After Offline
**Given:** Network offline, field filled  
**When:** Network reconnects  
**Then:** Auto-save triggers, show "✅ Salvo automaticamente"  
**Priority:** HIGH  
**AC Reference:** AC14

#### E2E-S2-11: Auto-Save - Rapid Tab Switching (Debounce Test)
**Given:** User on Tab 1  
**When:** Switch Tab 1→2→3→4 rapidly (within 2 seconds)  
**Then:** Only 1 PATCH request sent after 500ms from last switch  
**Priority:** HIGH  
**AC Reference:** AC3

---

### E2E Tests - Mobile Behavior (4 scenarios)

#### E2E-S2-12: Mobile - Swipe Left to Next Tab
**Given:** Mobile viewport (375x667), user on Tab 1  
**When:** Swipe left  
**Then:** Tab 2 displayed  
**Priority:** CRITICAL  
**AC Reference:** AC11

#### E2E-S2-13: Mobile - Swipe Right to Previous Tab
**Given:** Mobile viewport, user on Tab 2  
**When:** Swipe right  
**Then:** Tab 1 displayed  
**Priority:** CRITICAL  
**AC Reference:** AC11

#### E2E-S2-14: Mobile - Responsive Layout (Tabs Compact)
**Given:** Mobile viewport  
**When:** Page loads  
**Then:** Tabs show abbreviated labels (e.g., "P&T", "Pos", "Con", "Ava")  
**Priority:** MEDIUM  
**AC Reference:** AC12

#### E2E-S2-15: Mobile - Fields Stacked Vertically
**Given:** Mobile viewport  
**When:** View any tab  
**Then:** All fields stacked in single column (not side-by-side)  
**Priority:** MEDIUM  
**AC Reference:** AC12

---

## Story 3: Logo IA DALL-E 3 (14 scenarios)

### Unit Tests - Prompt Generation (5 scenarios)

#### UT-S3-01: getLogoPromptBySegment - Mercado/Mercearia
**Given:** storeName = "Mercadinho da Vila", segment = "Mercado / Mercearia"  
**When:** getLogoPromptBySegment() called  
**Then:** Prompt contains "welcoming and trustworthy", "green, orange, or earthy tones"  
**Priority:** HIGH  
**AC Reference:** PE-AC3

#### UT-S3-02: getLogoPromptBySegment - Loja de bebidas + Premium Tone
**Given:** storeName = "Adega Premium", segment = "Loja de bebidas", tone = "Premium"  
**When:** getLogoPromptBySegment() called  
**Then:** Prompt contains "elegant and sophisticated" (tone adjustment applied)  
**Priority:** HIGH  
**AC Reference:** PE-AC4

#### UT-S3-03: getLogoPromptBySegment - Fallback for "Outro…"
**Given:** segment = "Outro…"  
**When:** getLogoPromptBySegment() called  
**Then:** Prompt uses generic "clean and modern" template  
**Priority:** MEDIUM  
**AC Reference:** PE-AC5

#### UT-S3-04: getColorSuggestions - Pet Shop
**Given:** segment = "Pet shop"  
**When:** getColorSuggestions() called  
**Then:** Returns array with pet-friendly colors (e.g., blue, orange, green)  
**Priority:** LOW  
**AC Reference:** PE-AC2

#### UT-S3-05: getAllSegments - Returns 12 Segments
**Given:** Function called  
**When:** getAllSegments()  
**Then:** Returns array with exactly 12 segments  
**Priority:** LOW  
**AC Reference:** PE-AC1

---

### Integration Tests - OpenAI API (2 scenarios)

#### INT-S3-01: DALL-E 3 API - Success Response
**Given:** Valid prompt, OpenAI API key configured  
**When:** generateLogos() called  
**Then:** Returns 3 suggestions, each with url, prompt, revised_prompt  
**Priority:** CRITICAL  
**AC Reference:** AC4

#### INT-S3-02: DALL-E 3 API - Error Handling
**Given:** Invalid API key or rate limit exceeded  
**When:** generateLogos() called  
**Then:** Return error with user-friendly message, log technical details  
**Priority:** HIGH  
**AC Reference:** AC12

---

### E2E Tests - Logo Generation Flow (7 scenarios)

#### E2E-S3-01: Lazy Loading - Link Visible When No Logo
**Given:** Store with `logo_url = null`  
**When:** User on onboarding or intelligence page  
**Then:** "🎨 Gerar logo com IA" link visible  
**Priority:** CRITICAL  
**AC Reference:** AC1

#### E2E-S3-02: Lazy Loading - Link Hidden When Logo Exists
**Given:** Store with `logo_url = "https://..."`  
**When:** User on page  
**Then:** "🎨 Gerar logo com IA" link NOT visible  
**Priority:** CRITICAL  
**AC Reference:** AC2

#### E2E-S3-03: Modal Opens on Click
**Given:** User clicks "🎨 Gerar logo com IA"  
**When:** Click event triggers  
**Then:** Modal opens with title "🎨 Gere seu logo com IA"  
**Priority:** HIGH  
**AC Reference:** AC3

#### E2E-S3-04: Generation - 3 Suggestions Displayed
**Given:** User in modal, clicks "Gerar"  
**When:** DALL-E 3 API completes (15-30s)  
**Then:** 3 logo suggestions displayed as images  
**Priority:** CRITICAL  
**AC Reference:** AC4

#### E2E-S3-05: Generation - Loading State Visible
**Given:** User clicks "Gerar"  
**When:** API call in progress  
**Then:** Show spinner, "Gerando logos...", fake progress bar (0%→30%→60%→100%)  
**Priority:** HIGH  
**AC Reference:** AC5

#### E2E-S3-06: Save Flow - Preview Before Save
**Given:** User clicks "Usar este logo" on suggestion 2  
**When:** Click event triggers  
**Then:** Show confirmation modal "Tem certeza? Este será o logo da sua loja."  
**Priority:** HIGH  
**AC Reference:** AC7

#### E2E-S3-07: Save Flow - Logo Saved to Supabase Storage
**Given:** User confirms logo selection  
**When:** Save API completes  
**Then:** Logo uploaded to `campaign-images/{storeId}/logo.png`, `stores.logo_url` updated  
**Priority:** CRITICAL  
**AC Reference:** AC8

---

## Story 4: Cross-Story Validation (5 scenarios)

### Unit Tests - Integration Points (3 scenarios)

#### UT-S4-01: Frontend Calls Backend API with Correct Payload
**Given:** Frontend auto-save triggered  
**When:** PATCH request sent  
**Then:** Payload matches backend expected format (JSONB structure)  
**Priority:** HIGH  
**Story Link:** Story 1 + Story 2

#### UT-S4-02: Frontend Handles Backend Error Responses
**Given:** Backend returns 403 (RLS violation)  
**When:** Frontend receives response  
**Then:** Show user-friendly error "Você não tem permissão para esta loja"  
**Priority:** HIGH  
**Story Link:** Story 1 + Story 2

#### UT-S4-03: Logo Prompt Uses Store Intelligence Context
**Given:** Store has `brand_voice = "Premium"` in intelligence  
**When:** Logo generation triggered  
**Then:** Prompt uses "Premium" tone adjustment  
**Priority:** MEDIUM  
**Story Link:** Story 2 + Story 3

---

### E2E Tests - Full User Journey (2 scenarios)

#### E2E-S4-01: Complete Intelligence Calibration Journey
**Given:** New user with empty intelligence  
**When:** Fill all 15 fields across 4 tabs, auto-save works  
**Then:** Score = 100, badge = 🥇, all data persisted in DB  
**Priority:** CRITICAL  
**Story Link:** Story 1 + Story 2

#### E2E-S4-02: Intelligence → Logo Generation Journey
**Given:** User completes intelligence (segment + tone set)  
**When:** User generates logo  
**Then:** Logo prompt uses segment + tone from intelligence context  
**Priority:** HIGH  
**Story Link:** Story 2 + Story 3

---

## 🛡️ Security Test Scenarios (8 scenarios)

### SEC-01: SQL Injection - JSONB Field
**Given:** Malicious payload in context field  
**When:** PATCH with `{ context: { brand_voice: "'; DROP TABLE stores;--" } }`  
**Then:** Query parameterized, no SQL injection, return 400 or save as string  
**Priority:** CRITICAL

### SEC-02: XSS - Stored in Intelligence Fields
**Given:** Malicious script in text field  
**When:** PATCH with `{ context: { target_audience: "<script>alert('XSS')</script>" } }`  
**Then:** Data sanitized before save, or escaped on render  
**Priority:** CRITICAL

### SEC-03: CORS - API Endpoint Protection
**Given:** Request from unauthorized origin  
**When:** PATCH from `https://attacker.com`  
**Then:** CORS policy blocks request  
**Priority:** HIGH

### SEC-04: Rate Limiting - Logo Generation
**Given:** User has generated 5 logos in 1 hour  
**When:** User attempts 6th generation  
**Then:** Return 429 "Rate limit exceeded, try again in X minutes"  
**Priority:** HIGH  
**AC Reference:** AC10

### SEC-05: Authentication Bypass Attempt
**Given:** No auth token, manipulated request headers  
**When:** PATCH request sent  
**Then:** Return 401, no data modified  
**Priority:** CRITICAL

### SEC-06: Authorization Escalation - Store ID Manipulation
**Given:** User A authenticated, tries to update Store B via URL manipulation  
**When:** PATCH with Store B ID in URL  
**Then:** RLS blocks, return 403  
**Priority:** CRITICAL

### SEC-07: OpenAI API Key Exposure
**Given:** Client-side code inspected  
**When:** View source or network tab  
**Then:** API key NOT visible, all DALL-E calls via backend proxy  
**Priority:** CRITICAL

### SEC-08: Supabase Storage - Public URL Security
**Given:** Logo saved to storage  
**When:** Storage URL accessed  
**Then:** RLS policies allow only owner access (if private), or public access if intended  
**Priority:** HIGH

---

## 📱 Mobile-Specific Test Scenarios (5 scenarios)

### MOB-01: Touch Target Size - Tabs (WCAG 2.1)
**Given:** Mobile viewport  
**When:** User taps tab button  
**Then:** Touch target >= 44x44px (WCAG minimum)  
**Priority:** MEDIUM  
**AC Reference:** AC11

### MOB-02: Viewport Rotation - Portrait → Landscape
**Given:** Mobile device in portrait (375x667)  
**When:** Rotate to landscape (667x375)  
**Then:** Layout adapts, no content cutoff, tabs visible  
**Priority:** MEDIUM  
**AC Reference:** AC12

### MOB-03: Keyboard on iOS - Input Focus
**Given:** iOS device, text input focused  
**When:** Keyboard appears  
**Then:** Input field scrolls into view, not hidden by keyboard  
**Priority:** HIGH  
**AC Reference:** AC12

### MOB-04: Slow Network - Auto-Save Timeout
**Given:** 3G network simulation (slow)  
**When:** Auto-save triggered  
**Then:** Show loading indicator, timeout after 30s, show retry option  
**Priority:** HIGH  
**AC Reference:** AC14

### MOB-05: Swipe Gesture - Accidental Triggers
**Given:** User scrolling vertically on Tab 1  
**When:** Slight horizontal movement during scroll  
**Then:** Tab does NOT switch (prevent accidental swipes)  
**Priority:** MEDIUM  
**AC Reference:** AC11

---

## ♿ Accessibility Test Scenarios (6 scenarios)

### A11Y-01: Keyboard Navigation - Tab Order
**Given:** User navigates via keyboard only  
**When:** Press Tab key repeatedly  
**Then:** Focus moves logically: tabs → fields → save indicator → next tab  
**Priority:** HIGH  
**AC Reference:** AC19

### A11Y-02: Screen Reader - Tab Labels
**Given:** Screen reader active  
**When:** Focus on tab button  
**Then:** Announce "Público & Tom tab, 1 of 4" (descriptive)  
**Priority:** MEDIUM  
**AC Reference:** AC19

### A11Y-03: Screen Reader - Form Fields
**Given:** Screen reader active  
**When:** Focus on input field  
**Then:** Announce label, placeholder, required/optional status  
**Priority:** MEDIUM  
**AC Reference:** AC8

### A11Y-04: Keyboard Navigation - Modal Close
**Given:** Logo generation modal open  
**When:** Press Escape key  
**Then:** Modal closes, focus returns to trigger button  
**Priority:** MEDIUM  
**AC Reference:** AC3

### A11Y-05: Color Contrast - Badge Text (WCAG AA)
**Given:** Badge displayed (🥉/🥈/🥇)  
**When:** Check contrast ratio  
**Then:** Text contrast >= 4.5:1 (WCAG AA)  
**Priority:** LOW  
**AC Reference:** AC7

### A11Y-06: Focus Indicators - Visible on All Interactive Elements
**Given:** User navigates via keyboard  
**When:** Any interactive element focused  
**Then:** Clear focus indicator visible (outline or ring)  
**Priority:** MEDIUM  
**AC Reference:** AC19

---

## ⚡ Performance Test Scenarios (4 scenarios)

### PERF-01: Initial Page Load - Time to Interactive
**Given:** User navigates to `/dashboard/store/intelligence`  
**When:** Page loads (cold cache)  
**Then:** Time to interactive < 2 seconds (target: <1s)  
**Priority:** MEDIUM  
**AC Reference:** AC20

### PERF-02: Tab Switch - Rendering Time
**Given:** User on Tab 1  
**When:** Switch to Tab 2  
**Then:** New tab content rendered < 200ms  
**Priority:** HIGH  
**AC Reference:** AC20

### PERF-03: Auto-Save - Response Time
**Given:** User fills field, switches tab  
**When:** PATCH request sent  
**Then:** Response received < 500ms (median)  
**Priority:** MEDIUM  
**AC Reference:** AC3

### PERF-04: Logo Generation - Total Time
**Given:** User clicks "Gerar logo"  
**When:** DALL-E 3 API calls complete  
**Then:** 3 logos displayed within 40 seconds (DALL-E 3 limit ~10-15s per image)  
**Priority:** MEDIUM  
**AC Reference:** AC5

---

## 🔧 Test Data Factories

### Factory: User
```typescript
createUser({
  id?: string;
  email?: string;
  created_at?: string;
}): User
```

### Factory: Store
```typescript
createStore({
  id?: string;
  owner_id: string;
  logo_url?: string | null;
  segment?: string;
  created_at?: string;
}): Store
```

### Factory: Store Intelligence
```typescript
createStoreIntelligence({
  store_id: string;
  context?: Partial<IntelligenceContext>;
  score?: number;
}): StoreIntelligence
```

### Factory: Intelligence Context (Partial)
```typescript
createPartialContext({
  fieldsCount: number; // 0-15
  segment?: string;
  tone?: string;
}): Partial<IntelligenceContext>
```

**Usage Example:**
```typescript
// Create user with store at score 53
const user = createUser();
const store = createStore({ owner_id: user.id });
const intelligence = createStoreIntelligence({
  store_id: store.id,
  context: createPartialContext({ fieldsCount: 8 }),
  score: 53
});
```

---

## 🎯 Test Execution Strategy

### Phase 1: Unit Tests (DIA 5-6)
**Duration:** 1.5 days  
**Parallel:** Backend + Frontend unit tests  
**Tools:** Jest, React Testing Library  
**Target:** 100% backend, 90% frontend  
**Blocking:** Must pass before E2E tests

### Phase 2: Integration Tests (DIA 6-7)
**Duration:** 1 day  
**Focus:** RLS policies, API contracts  
**Tools:** Supertest, Supabase local  
**Target:** 100% RLS coverage  
**Blocking:** Must pass before E2E tests

### Phase 3: E2E Tests (DIA 7-9)
**Duration:** 2 days  
**Focus:** Critical user paths, mobile behavior  
**Tools:** Playwright  
**Parallel:** Desktop + Mobile viewports  
**Target:** 100% AC coverage  
**Blocking:** Must pass before QA Gate

### Phase 4: Security & Accessibility (DIA 9)
**Duration:** 0.5 days  
**Focus:** OWASP top 10, WCAG AA  
**Tools:** ZAP, axe-core  
**Target:** No critical findings  
**Blocking:** Security critical, A11Y advisory

### Phase 5: Performance (DIA 9-10)
**Duration:** 0.5 days  
**Focus:** Load times, API response times  
**Tools:** Lighthouse, Chrome DevTools  
**Target:** Load < 2s, render < 200ms  
**Blocking:** Advisory only

---

## 📊 Test Metrics & KPIs

### Coverage Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Backend Unit Coverage | 100% | TBD | 🟡 Pending |
| Frontend Unit Coverage | 90% | TBD | 🟡 Pending |
| E2E AC Coverage | 100% | TBD | 🟡 Pending |
| RLS Policy Coverage | 100% | TBD | 🟡 Pending |
| Security Scan Pass | 0 critical | TBD | 🟡 Pending |
| A11Y WCAG AA Pass | 0 violations | TBD | 🟡 Pending |

### Quality Gates

| Gate | Criteria | Blocking? |
|------|----------|-----------|
| **Unit Tests** | All pass, coverage >= target | YES |
| **Integration Tests** | All pass, RLS 100% | YES |
| **E2E Tests** | All critical pass, 95% total | YES |
| **Security** | 0 critical, 0 high | YES |
| **Accessibility** | 0 critical violations | NO (advisory) |
| **Performance** | Load < 2s, render < 200ms | NO (advisory) |

---

## 🚨 Risk Assessment

### HIGH RISK Areas

1. **Auto-Save Reliability** (Story 2)
   - **Risk:** Data loss if debounce fails or network error mishandled
   - **Mitigation:** localStorage fallback, retry logic (max 3), comprehensive E2E tests

2. **RLS Security** (Story 1)
   - **Risk:** User accessing another user's store data
   - **Mitigation:** 100% integration test coverage, manual penetration testing

3. **DALL-E 3 API Cost** (Story 3)
   - **Risk:** Runaway costs if rate limiting fails
   - **Mitigation:** Hard rate limit (5/hour/store), monitoring alerts, E2E tests verify rate limit

4. **Mobile Swipe Gestures** (Story 2)
   - **Risk:** Unreliable on different devices/browsers
   - **Mitigation:** Test on real devices (iOS Safari, Android Chrome), fallback to tap navigation

### MEDIUM RISK Areas

1. **JSONB Edge Cases** (Story 1)
   - **Risk:** Data corruption with malformed input
   - **Mitigation:** 15 unit tests covering edge cases, schema validation

2. **Score Calculation Accuracy** (Story 1+2)
   - **Risk:** Incorrect score displayed to user
   - **Mitigation:** 7 unit tests, manual verification with QA

### LOW RISK Areas

1. **Badge Display Logic** (Story 2)
   - **Risk:** Wrong badge for score range
   - **Mitigation:** Simple logic, 1 unit test sufficient

2. **Placeholder Text** (Story 2)
   - **Risk:** Unhelpful placeholders
   - **Mitigation:** UX review, user feedback

---

## 📝 Testing Tools & Environment

### Unit Testing
- **Framework:** Jest 29.x
- **Library:** React Testing Library, Testing Library User Event
- **Mocking:** MSW (Mock Service Worker) for API calls
- **Coverage:** Istanbul/nyc

### Integration Testing
- **Framework:** Jest + Supertest
- **Database:** Supabase local (Docker)
- **Auth:** Supabase Auth mock tokens

### E2E Testing
- **Framework:** Playwright 1.40+
- **Browsers:** Chromium, WebKit (Safari), Firefox
- **Viewports:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **CI:** GitHub Actions

### Security Testing
- **SAST:** CodeRabbit (automated), ESLint security plugin
- **DAST:** OWASP ZAP (manual scans)
- **Dependencies:** npm audit, Snyk

### Accessibility Testing
- **Automated:** axe-core, Playwright axe integration
- **Manual:** NVDA/JAWS screen reader testing, keyboard-only navigation

### Performance Testing
- **Tools:** Lighthouse CI, Chrome DevTools Performance panel
- **Metrics:** FCP, LCP, TTI, TBT, CLS (Core Web Vitals)

---

## ✅ Test Plan Approval

**Created By:** @qa (Quinn)  
**Reviewed By:** _Pending @dev, @po_  
**Approved By:** _Pending @pm_  
**Date:** 2026-04-30  
**Status:** ✅ READY FOR FASE 3 (Implementation)

### Sign-Off

- [ ] @dev confirms technical feasibility of all test scenarios
- [ ] @po confirms AC coverage is complete
- [ ] @pm approves scope and timeline

---

## 📞 Next Steps

1. **@dev:** Review test plan, flag any unimplementable tests
2. **@qa:** Setup test environments (local Supabase, Playwright config)
3. **@dev:** Implement Story 1 (Backend API) with unit tests
4. **@qa:** Begin writing E2E test scaffolding in parallel
5. **@squad-creator:** Monitor GATE 2 conditions for FASE 3 start

---

**Total Test Scenarios:** 62  
**Estimated Test Execution Time:** 4.5 days (DIA 5-9)  
**Critical Path:** Unit → Integration → E2E → Security → Performance  
**Confidence Level:** 9/10 (HIGH)

— Quinn, guardião da qualidade 🛡️
