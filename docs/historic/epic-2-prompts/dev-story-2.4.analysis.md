# Analysis — Story 2.4 (@dev Package)

## Prompt Design Decisions

### 1. Progressive Refactoring (6 Etapas + 6 Checkpoints)

**Why:**
- HIGH RISK story — código em produção com alto volume (listagens + preview)
- Refatorar 1 função por vez reduz blast radius se algo quebrar
- Checkpoints após cada função permitem catch early (typecheck + testes parciais)

**Alternative considered:** YOLO mode (refatorar tudo de uma vez)  
**Rejected because:** 5-6 funções refatoradas simultaneamente = debugging pesadelo se houver breaking change

### 2. Error Handling Strategy Differentiation (THROW vs FALLBACK)

**Why:**
- Server-side functions (mapDbCampaignToDomain, mapDbCampaignToAIContext): Callers em service.ts já têm try/catch — expect throw
- Client-side UI functions (mapAiArtToPreview, mapAiReelsToPreview): Usadas em CampaignPreviewClient.tsx — throw quebraria UI sem error boundary

**Critical @po guidance (Message 8):**
```
mapDbCampaignToDomain() → THROW (service.ts expects it)
mapDbCampaignToAIContext() → THROW (server-side only)
mapAiArtToPreview() → FALLBACK (no throw, degrade gracefully)
mapAiReelsToPreview() → FALLBACK (no throw)
```

**Implementation:**
- THROW functions: `.safeParse()` + `if (!result.success) throw new Error(...)`
- FALLBACK functions: `.safeParse()` + `if (!result.success) { console.error(...); return fallbackObject; }`

### 3. BEFORE/AFTER Code Examples (Complete)

**Why:**
- @dev precisa ver exatamente onde `.parse()` está no código atual
- AFTER code mostra pattern completo (não apenas snippet)
- Complete code examples reduzem alucinações ("eu acho que é assim...")

**Token cost:** +800 tokens (2 funções × ~400 tokens cada)  
**ROI:** Evita 2-3 iterações de "esqueci o fallback" ou "mensagem de erro genérica"

### 4. REAL_DB_ROW Fixture (não mock sintético)

**Why:**
- Mocks sintéticos (`{ id: "123", product_name: "Test" }`) não pegam bugs de campos extras (Supabase adiciona created_at, updated_at, etc.)
- REAL_DB_ROW com 30+ campos garante que `.safeParse()` aceita dados reais
- Testa edge case legacy (`content_type: "info"`)

**Alternative considered:** Mocks mínimos (apenas campos obrigatórios)  
**Rejected because:** Schemas usam `.strip()` — campos extras seriam ignorados, mas precisamos garantir que não quebram

### 5. Interactive Mode (Educational Checkpoints)

**Why:**
- @po explicit recommendation (Message 8): "Interactive (educational checkpoints for production refactoring)"
- HIGH RISK refactoring — @dev deve entender cada mudança antes de prosseguir
- 6 checkpoints garantem que cada etapa está correta antes de next

**YOLO mode rejected because:** Refatoração em batch sem checkpoints = 1 erro quebra tudo, debugging leva horas

### 6. Validation Before Returning (mapDomainToCampaignDb)

**Why:**
- Write mapper é HIGH RISK — output incorreto corrompe dados em produção
- Validar com `DbCampaignSchema.partial().safeParse(dbData)` antes de retornar garante estrutura DB correta
- Se validação falhar, log console.error (não throw, porque é write operation — caller espera que retorne algo)

**Code:**
```typescript
const validation = DbCampaignSchema.partial().safeParse(dbData);
if (!validation.success) {
  console.error("[mapDomainToCampaignDb] Output inválido:", validation.error.format());
}
return dbData;
```

### 7. Zero Breaking Changes Enforcement

**Why:**
- Assinaturas alteradas = breaking change para callers (service.ts, page.tsx, CampaignPreviewClient.tsx)
- MUST preserve: `function mapDbCampaignToDomain(data: unknown): Campaign` (assinatura idêntica)
- Apenas internals mudam (`.parse()` → `.safeParse()`)

**Anti-pattern blocked:** Adicionar parâmetro opcional `options?: { throwOnError: boolean }` — quebraria assinatura

---

## Token Economy

| Component | Tokens | Justification |
|-----------|--------|---------------|
| **Analysis** (este arquivo) | ~700 | Decisões de design + rationale |
| **Testing Strategy** | ~980 | 6 test suites × ~163 tokens cada |
| **Main Prompt** | ~3200 | 6 etapas + BEFORE/AFTER code + fixtures |
| **TOTAL @dev Package** | ~4880 | HIGH RISK refactoring needs detail |

**Comparison:**
- Story 2.2 @dev package: ~2400 tokens (MEDIUM RISK creation)
- Story 2.3 @dev package: ~1900 tokens (MEDIUM RISK creation)
- Story 2.4 @dev package: **~4880 tokens** (+103% vs 2.3) — HIGH RISK refactoring justifies +103% token increase

**Cost/benefit:**
- Extra +2980 tokens (vs 2.3) prevent 4-6h debugging (refatorar tudo de uma vez + quebrar UI)
- Educational checkpoints teach error handling patterns → reusable for future HIGH RISK stories

---

## Risk Coverage

| Risk (from Story 2.4) | Mitigation in @dev Prompt |
|----------------------|---------------------------|
| 🔴 ALTO — DbCampaignSchema rejeita legacy "info" | T1.3 test + reminder to verify CampaignReadableContentTypeSchema |
| 🔴 ALTO — mapDomainToCampaignDb gera estrutura errada | Output validation (`DbCampaignSchema.partial().safeParse()`) + T6.1/T6.2/T6.3 tests |
| 🟡 MÉDIO — Callers não têm try/catch (throw esperado) | THROW strategy explícita + error recovery doc |
| 🟡 MÉDIO — Fallback UI mostra conteúdo em branco | Fallback retorna campos vazios (strings vazias, arrays vazios) — comportamento aceitável + console.error |

---

## Model Recommendation

**Claude Sonnet 4.6 (1x):**
- Complex logic: 6 etapas sequenciais com different error strategies
- High risk refactoring: Production code, multiple callers
- Error handling nuances: THROW vs FALLBACK depende do contexto (server vs client)

**GPT-4.5 mini (0.33x) NÃO recomendado:**
- Pode confundir THROW vs FALLBACK strategies
- Maior risco de alucinar código (esquecer fallback return, acessar result.data sem check)

---

## Success Metrics

**Quality Gates:**
- ✅ All 6 checkpoints pass (typecheck after each etapa)
- ✅ 15+ tests passing (happy path + error cases + fallbacks)
- ✅ Zero breaking changes (assinaturas idênticas)
- ✅ Error messages úteis (não genéricas: `[funcName] Campo inválido: ${path} — ${msg}`)

**Timeline:**
- Estimated: 3-4h (6 etapas × 30-40min each)
- With YOLO mode: 1-2h coding + 4-6h debugging = 5-8h total (worse)

---

## CodeRabbit Self-Healing Expectations

**Auto-review will check:**
1. NENHUMA função usa `.parse()` (apenas `.safeParse()`)
2. mapDbCampaignToDomain() e mapDbCampaignToAIContext() throwam com mensagem útil
3. mapAiArtToPreview() e mapAiReelsToPreview() retornam fallback (não throw)
4. mapDomainToCampaignDb() usa `buildCampaignContentTypeWrite()`
5. Assinaturas inalteradas

**Max 2 iterations:**
- Iteration 1: @dev implementa seguindo prompt
- CodeRabbit review: Issues detectados automaticamente
- Iteration 2: @dev corrige issues (se necessário)
- Se iteration 3 necessária → escalate to @architect (architecture issue, não code quality)

---

**END OF ANALYSIS**
