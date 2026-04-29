import { test, expect } from '@playwright/test';

// ─── AuthModal — Apple Login ──────────────────────────────────────────────────

test.describe('AuthModal — Apple login button', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', route =>
      route.fulfill({ json: { user: null, expires: '' } })
    );
    await page.goto('/');
  });

  async function openAuthModal(page: any) {
    // Try data-testid first, fall back to text button
    const byTestId = page.locator('[data-testid="open-auth"]');
    if (await byTestId.count()) {
      await byTestId.first().click();
    } else {
      await page.locator('button', { hasText: 'เข้าสู่ระบบ' }).first().click();
    }
    await page.waitForSelector('[data-testid="auth-modal"]');
  }

  test('Apple button is visible and enabled in login modal', async ({ page }) => {
    await openAuthModal(page);
    const appleBtn = page.locator('button', { hasText: 'Apple' });
    await expect(appleBtn).toBeVisible();
    await expect(appleBtn).toBeEnabled();
  });

  test('Apple button does not show "(เร็วๆ นี้)" text', async ({ page }) => {
    await openAuthModal(page);
    const modal = page.locator('[data-testid="auth-modal"]');
    await expect(modal).not.toContainText('เร็วๆ นี้');
  });

  test('Clicking Apple button does not crash the page', async ({ page }) => {
    await openAuthModal(page);
    // Intercept redirect so we don't actually leave the app
    await page.route('**/api/auth/signin/apple**', route => route.abort());
    await page.locator('button', { hasText: 'Apple' }).click();
    await expect(page).not.toHaveURL(/error/);
  });

  test('Google button is still visible alongside Apple', async ({ page }) => {
    await openAuthModal(page);
    await expect(page.locator('button', { hasText: 'Google' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Google' })).toBeEnabled();
  });

  test('Both Apple and Google buttons shown in signup mode', async ({ page }) => {
    await openAuthModal(page);
    await page.locator('button', { hasText: 'สมัครสมาชิก' }).click();
    await expect(page.locator('button', { hasText: 'Apple' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Google' })).toBeVisible();
  });

  test('Social buttons hidden in reset password mode', async ({ page }) => {
    await openAuthModal(page);
    await page.locator('button', { hasText: 'ลืมรหัสผ่าน?' }).click();
    await expect(page.locator('button', { hasText: 'Apple' })).not.toBeVisible();
    await expect(page.locator('button', { hasText: 'Google' })).not.toBeVisible();
  });
});
