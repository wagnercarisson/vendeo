import { test, expect } from '@playwright/test';

// Use iPhone 12 as default for mobile emulation in this spec
test.use({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1' });

test.describe('Intelligence Flow - Mobile UI (Story 2B)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Step 1: Navigate to login page in login mode
    await page.goto('/login?mode=login');
    
    // Step 2: Wait for login form to be visible
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    
    // Step 3: Fill credentials
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'teste123');
    
    // Step 4: Click "Entrar" button (exact text match)
    await page.click('button[type="submit"]:has-text("Entrar")');
    
    // Step 5: Wait for successful login and redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    
    // Step 6: Navigate to intelligence page
    await page.goto('/dashboard/store/intelligence');
    
    // Step 7: Wait for page to load
    await expect(page.locator('text=Calibre a inteligência do Vendeo')).toBeVisible({ timeout: 10000 });
  });

  test('AC11: swipes between tabs on mobile', async ({ page }) => {
    // Initial state: first tab active
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText(/Público/);

    // Perform swipe left gesture on the tab panel
    // We locate the scrollable/swipeable area. According to implementation, it is likely the `<section>` containing the tabs
    const tabsContainer = page.locator('section').filter({ hasText: 'Público' }).first();
    
    const boundingBox = await tabsContainer.boundingBox();
    if (boundingBox) {
      // Simulate swipe left (from right edge to left edge)
      const startX = boundingBox.x + boundingBox.width * 0.8;
      const startY = boundingBox.y + boundingBox.height / 2;
      const endX = boundingBox.x + boundingBox.width * 0.2;
      
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, startY, { steps: 5 });
      await page.mouse.up();
      
      // Wait for next tab to become active
      await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText(/Posição|Posicionamento/i);
    }
  });

  test('AC14 & AC13: Offline scenario with localStorage fallback and error/offline SaveIndicator', async ({ page }) => {
    // Modify an input to trigger a save
    // We assume there is a textarea for brand_voice or similar
    const textarea = page.locator('button[role="radio"], textarea').first();
    
    // Go offline
    await page.context().setOffline(true);
    
    // Trigger save (click a chip, for example)
    if (await textarea.getAttribute('role') === 'radio') {
      await textarea.click();
    } else {
      await textarea.fill('Novo texto test');
    }

    // Because we are offline, the SaveIndicator should say "Offline" and it will fallback to localStorage
    const offlineIndicator = page.locator('.offline, text=/Offline/i');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
    
    // Check localStorage
    const pendingData = await page.evaluate(() => localStorage.getItem('intelligence-pending'));
    expect(pendingData).not.toBeNull();
    
    // Reconnect
    await page.context().setOffline(false);
    
    // Should trigger sync and eventually show "Salvo"
    const savedIndicator = page.locator('.success, text=/Salvo/i');
    await expect(savedIndicator).toBeVisible({ timeout: 10000 });
  });

  test('AC14 & AC13: Retries save on network error before showing error indicator', async ({ page }) => {
    // Intercept PATCH to simulate failure repeatedly
    let requests = 0;
    await page.route('**/api/store/intelligence', async (route) => {
      if (route.request().method() === 'PATCH') {
        requests++;
        await route.abort('internetdisconnected');
      } else {
        await route.continue();
      }
    });

    // Trigger save
    const btn = page.locator('button[role="radio"]').first();
    if (await btn.isVisible()) {
        await btn.click();
    }

    // It should attempt 3 times
    const errorIndicator = page.locator('.error, text=/Não foi possível salvar/i');
    await expect(errorIndicator).toBeVisible({ timeout: 15000 });
    expect(requests).toBeGreaterThanOrEqual(3);
    
    // Verify "Tentar novamente" button exists
    const retryBtn = page.locator('button:has-text("Tentar novamente")');
    await expect(retryBtn).toBeVisible();
  });

  test('AC19: Keyboard navigation complete (Arrow keys, Home, End)', async ({ page }) => {
    // Focus the first tab
    const firstTab = page.locator('[role="tab"]').first();
    await firstTab.focus();
    
    // Arrow Right to go to next tab
    await page.keyboard.press('ArrowRight');
    let activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toContainText(/Posição|Posicionamento/i);
    
    // Home key to go to first tab
    await page.keyboard.press('Home');
    activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toContainText(/Público/i);
    
    // End key to go to last tab
    await page.keyboard.press('End');
    activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toContainText(/Avançado/i);
  });
});