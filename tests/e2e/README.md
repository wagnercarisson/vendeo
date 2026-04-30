# E2E Tests - Vendeo

Testes end-to-end usando Playwright para validar fluxos críticos da aplicação.

## 📦 Setup

```bash
# Instalar dependências
npm install

# Instalar browsers do Playwright
npx playwright install chromium
```

## 🧪 Running Tests

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Rodar testes em modo UI (debug)
npm run test:e2e:ui

# Rodar testes específicos
npx playwright test tests/e2e/logo-generation.spec.ts

# Rodar com diferentes browsers
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
```

## 📊 Test Coverage

### Logo Generation Flow (`logo-generation.spec.ts`)

**Story 3 - AC Coverage:**
- ✅ **AC1:** Link "Gerar logo com IA" só aparece se logo_url é vazio
- ✅ **AC2:** Link desaparece automaticamente após salvar logo
- ✅ **AC3:** Modal abre ao clicar no link
- ✅ **AC4:** API gera 3 sugestões de logo (DALL-E 3)
- ✅ **AC5:** Loading state mostra spinner + fake progress bar
- ✅ **AC6:** 3 sugestões exibidas lado a lado (desktop) ou empilhadas (mobile)
- ✅ **AC7:** Preview final ao clicar "Usar este logo"
- ✅ **AC8:** Logo salvo no Supabase Storage
- ✅ **AC9:** stores.logo_url atualizado com URL permanente
- ✅ **AC10:** Rate limit funcional (max 5 gerações/hora)
- ✅ **AC11:** Mensagem de erro clara se API falhar
- ✅ **AC12:** Botão "Gerar novos logos" funciona
- ✅ **AC15:** Testes E2E para fluxo completo ✅
- ✅ **AC17:** Timeout configurado (30s)
- ✅ **AC18:** Modal fechável com Esc + focus trap

**Test Suites:**
- Logo Generation Flow (11 tests)
- Mobile Responsiveness (1 test)
- Performance (1 test)

**Total:** 13 E2E tests

## 🎭 Mocked APIs

Para evitar custos reais durante testes, as seguintes APIs são mockadas:

- `POST /api/ai/generate-logo` - Retorna 3 logos base64 mock
- `POST /api/store/save-logo` - Retorna URL mock do Supabase Storage

## 📸 Artifacts

Playwright gera automaticamente:

- **Screenshots** - Capturados em falhas
- **Videos** - Gravados apenas em falhas
- **Traces** - Capturados na primeira retry

Localização: `test-results/`

## 🔍 Debugging

```bash
# Rodar em modo debug (UI)
npx playwright test --debug

# Rodar teste específico em modo debug
npx playwright test tests/e2e/logo-generation.spec.ts --debug

# Ver último report HTML
npx playwright show-report
```

## 🌐 Test Configuration

Ver [playwright.config.ts](../playwright.config.ts) para:

- Configuração de browsers (Chromium, Firefox, WebKit)
- Mobile viewports (Pixel 5, iPhone 12)
- Timeouts e retries
- Base URL configuration

## ✅ CI/CD Integration

Testes E2E rodam automaticamente em CI:

```yaml
# .github/workflows/test.yml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e
  env:
    BASE_URL: ${{ secrets.STAGING_URL }}
```

## 📚 Writing New Tests

```typescript
import { test, expect } from '@playwright/test';

test('my new test', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toHaveText('Dashboard');
});
```

Ver [Playwright Docs](https://playwright.dev/docs/intro) para mais detalhes.
