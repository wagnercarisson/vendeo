import { expect, test } from '@playwright/test';

async function login(page: import('@playwright/test').Page) {
    await page.goto('/login?mode=login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'teste123');
    await page.click('button[type="submit"]:has-text("Entrar")');
    await page.waitForURL('**/dashboard**', { timeout: 90000 });
}

async function fillRequiredFields(page: import('@playwright/test').Page) {
    await page.goto('/dashboard/store');
    const nameInput = page.locator('input[placeholder="Ex.: Mercado Central"]');
    const cityInput = page.locator('input[placeholder="Ex.: São Paulo"]');
    const phoneInput = page.locator('input[placeholder="(11) 3333-4444 ou (11) 99999-9999"]');
    const whatsappInput = page.locator('input[placeholder="(11) 99999-9999"]');

    await expect(nameInput).toBeVisible();
    await expect(nameInput).not.toHaveValue('', { timeout: 15000 });

    await nameInput.fill('Loja de Teste');
    await cityInput.fill('São Paulo');
    await phoneInput.fill('(11) 3333-4444');
    await whatsappInput.fill('(11) 99999-9999');
    await page.locator('select').first().selectOption('SP');
    await page.selectOption('#category', 'bebidas_alcoolicas');
}

test.describe('Onboarding Subsegmentation', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await login(page);
    });

    test('should allow selecting category and subcategory', async ({ page }) => {
        await page.route('**/api/stores', async (route) => {
            const payload = JSON.parse(route.request().postData() ?? '{}');
            expect(payload.category).toBe('bebidas_alcoolicas');
            expect(payload.subcategory).toBe('adega');

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });

        await fillRequiredFields(page);
        await page.selectOption('#subcategory', 'adega');
        await page.click('button[type="submit"]');

        await expect(page.locator('.success-message')).toBeVisible();
    });

    test('should require custom field when selecting outro', async ({ page }) => {
        await fillRequiredFields(page);
        await page.selectOption('#subcategory', 'outro');
        await expect(page.locator('#subcategory_custom')).toBeVisible();
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toContainText('obrigatório');
    });

    test('should accept custom value when outro selected', async ({ page }) => {
        await page.route('**/api/stores', async (route) => {
            const payload = JSON.parse(route.request().postData() ?? '{}');
            expect(payload.subcategory).toBe('outro');
            expect(payload.subcategory_custom).toBe('Conveniência');

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });

        await fillRequiredFields(page);
        await page.selectOption('#subcategory', 'outro');
        await expect(page.locator('#subcategory_custom')).toBeVisible();
        await page.fill('#subcategory_custom', 'Conveniência');
        await page.click('button[type="submit"]');

        await expect(page.locator('.success-message')).toBeVisible();
    });

    test('should reject custom value with existing keyword emporio', async ({ page }) => {
        await page.route('**/api/stores', async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Opção existente detectada',
                    message: 'Detectamos que seu negócio se encaixa melhor em "Empório de Cervejas / Craft". Escolha essa opção para campanhas mais efetivas.',
                    suggestion: 'emporio-cervejas',
                }),
            });
        });

        await fillRequiredFields(page);
        await page.selectOption('#subcategory', 'outro');
        await expect(page.locator('#subcategory_custom')).toBeVisible();
        await page.fill('#subcategory_custom', 'empório');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toContainText('Empório de Cervejas');
    });

    test('should reject custom value with existing keyword adega', async ({ page }) => {
        await page.route('**/api/stores', async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Opção existente detectada',
                    message: 'Detectamos que seu negócio se encaixa melhor em "Adega / Wine Bar". Escolha essa opção para campanhas mais efetivas.',
                    suggestion: 'adega',
                }),
            });
        });

        await fillRequiredFields(page);
        await page.selectOption('#subcategory', 'outro');
        await expect(page.locator('#subcategory_custom')).toBeVisible();
        await page.fill('#subcategory_custom', 'Adega de vinhos');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toContainText('Adega / Wine Bar');
    });

    test('should accept legitimate edge case emporio de cachacas', async ({ page }) => {
        await page.route('**/api/stores', async (route) => {
            const payload = JSON.parse(route.request().postData() ?? '{}');
            expect(payload.subcategory_custom).toBe('Empório de Cachaças');

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });

        await fillRequiredFields(page);
        await page.selectOption('#subcategory', 'outro');
        await expect(page.locator('#subcategory_custom')).toBeVisible();
        await page.fill('#subcategory_custom', 'Empório de Cachaças');
        await page.click('button[type="submit"]');

        await expect(page.locator('.success-message')).toBeVisible();
    });
});