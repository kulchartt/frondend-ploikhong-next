import { test, expect } from '@playwright/test';

// ─── Sessions ─────────────────────────────────────────────────────────────────

const ADMIN_SESSION = {
  user: { name: 'สมชาย Admin', email: 'admin@ploikhong.com', image: null, is_admin: 1 },
  token: 'mock-admin-token',
  expires: '2099-01-01',
};

const USER_SESSION = {
  user: { name: 'ผู้ใช้ทั่วไป', email: 'user@example.com', image: null, is_admin: 0 },
  token: 'mock-user-token',
  expires: '2099-01-01',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function gotoHome(page: any, session: any) {
  await page.route('**/api/auth/session', (r: any) => r.fulfill({ json: session }));
  await page.route('**/api/products**', (r: any) => r.fulfill({ json: [] }));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

async function openAccountDropdown(page: any) {
  await page.getByRole('button', { name: /บัญชี/i }).click();
  // Wait for dropdown to appear
  await page.waitForTimeout(200);
}

// =============================================================================
// ADMIN PANEL BUTTON IN PROFILE DROPDOWN
// =============================================================================

test.describe('Navbar — Admin Panel in profile dropdown', () => {

  test('admin user sees "🛡️ Admin Panel" inside account dropdown', async ({ page }) => {
    await gotoHome(page, ADMIN_SESSION);
    await openAccountDropdown(page);
    await expect(page.getByText('🛡️ Admin Panel')).toBeVisible({ timeout: 5000 });
  });

  test('non-admin user does NOT see admin panel in dropdown', async ({ page }) => {
    await gotoHome(page, USER_SESSION);
    await openAccountDropdown(page);
    await expect(page.getByText('🛡️ Admin Panel')).not.toBeVisible({ timeout: 5000 });
  });

  test('admin panel is inside the account dropdown (not standalone in navbar)', async ({ page }) => {
    await gotoHome(page, ADMIN_SESSION);
    // Before opening dropdown: Admin Panel should not be visible
    await expect(page.getByText('🛡️ Admin Panel')).not.toBeVisible({ timeout: 3000 });
    // After opening: it appears
    await openAccountDropdown(page);
    await expect(page.getByText('🛡️ Admin Panel')).toBeVisible({ timeout: 5000 });
  });

  test('clicking "🛡️ Admin Panel" navigates to /admin', async ({ page }) => {
    await gotoHome(page, ADMIN_SESSION);
    // Also mock admin page session so redirect doesn't fail
    await page.route('**/api/auth/session', (r: any) => r.fulfill({ json: ADMIN_SESSION }));
    await openAccountDropdown(page);
    await page.getByText('🛡️ Admin Panel').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 6000 });
  });

  test('account dropdown shows user name for admin', async ({ page }) => {
    await gotoHome(page, ADMIN_SESSION);
    await openAccountDropdown(page);
    await expect(page.getByText('สมชาย Admin')).toBeVisible({ timeout: 5000 });
  });

  test('account dropdown shows standard menu items for all users', async ({ page }) => {
    await gotoHome(page, USER_SESSION);
    await openAccountDropdown(page);
    await expect(page.getByText('สินค้าของฉัน')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('การซื้อของฉัน')).toBeVisible();
    await expect(page.getByText('ร้องเรียนของฉัน')).toBeVisible();
  });

});
