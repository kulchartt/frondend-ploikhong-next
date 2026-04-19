import { test, expect } from '@playwright/test';

// Helper: open auth modal via navbar button
async function openAuthModal(page: any) {
  // "+ ลงขาย" or the person icon triggers auth modal
  const btn = page.getByRole('button', { name: /ลงขาย/i }).first();
  await btn.click();
  // Wait for modal backdrop
  await page.waitForSelector('div[style*="position: fixed"]', { timeout: 5000 });
}

test.describe('Auth Modal', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ─── Modal Open / Close ───────────────────────────────────────────────────

  test('modal: opens when "+ ลงขาย" is clicked', async ({ page }) => {
    await openAuthModal(page);
    await expect(page.getByText('ยินดีต้อนรับกลับ')).toBeVisible();
  });

  test('modal: closes when X button is clicked', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: '' }).first().click(); // X button via lucide X
    // Try the close button by its position (top-right)
    const closeBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await closeBtn.click();
    await expect(page.getByText('ยินดีต้อนรับกลับ')).not.toBeVisible({ timeout: 3000 });
  });

  test('modal: closes when clicking backdrop', async ({ page }) => {
    await openAuthModal(page);
    // Click the backdrop (fixed overlay div, outside the modal card)
    await page.mouse.click(10, 10); // top-left corner = backdrop
    await expect(page.getByText('ยินดีต้อนรับกลับ')).not.toBeVisible({ timeout: 3000 });
  });

  // ─── Login Mode ───────────────────────────────────────────────────────────

  test('login: heading and subtext visible', async ({ page }) => {
    await openAuthModal(page);
    await expect(page.getByText('ยินดีต้อนรับกลับ')).toBeVisible();
    await expect(page.getByText('เข้าสู่ระบบเพื่อซื้อ-ขายในตลาด')).toBeVisible();
  });

  test('login: social login buttons visible (Facebook, Google, Apple, LINE)', async ({ page }) => {
    await openAuthModal(page);
    await expect(page.getByRole('button', { name: /Facebook/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Apple/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /LINE/i })).toBeVisible();
  });

  test('login: email and password inputs are visible', async ({ page }) => {
    await openAuthModal(page);
    await expect(page.getByPlaceholder('อีเมล')).toBeVisible();
    await expect(page.getByPlaceholder('รหัสผ่าน')).toBeVisible();
  });

  test('login: can type in email and password fields', async ({ page }) => {
    await openAuthModal(page);
    await page.getByPlaceholder('อีเมล').fill('test@example.com');
    await page.getByPlaceholder('รหัสผ่าน').fill('password123');
    await expect(page.getByPlaceholder('อีเมล')).toHaveValue('test@example.com');
    await expect(page.getByPlaceholder('รหัสผ่าน')).toHaveValue('password123');
  });

  test('login: password is hidden by default', async ({ page }) => {
    await openAuthModal(page);
    const passInput = page.getByPlaceholder('รหัสผ่าน');
    await expect(passInput).toHaveAttribute('type', 'password');
  });

  test('login: show/hide password toggle works', async ({ page }) => {
    await openAuthModal(page);
    const passInput = page.getByPlaceholder('รหัสผ่าน');
    // Find the eye toggle button inside the password wrapper
    const toggleBtn = passInput.locator('..').locator('button');
    await toggleBtn.click();
    await expect(passInput).toHaveAttribute('type', 'text');
    await toggleBtn.click();
    await expect(passInput).toHaveAttribute('type', 'password');
  });

  test('login: shows error on invalid credentials', async ({ page }) => {
    await openAuthModal(page);
    await page.getByPlaceholder('อีเมล').fill('wrong@example.com');
    await page.getByPlaceholder('รหัสผ่าน').fill('wrongpass');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    // Error message should appear (NextAuth returns error)
    await expect(page.getByText(/ไม่ถูกต้อง|ไม่สำเร็จ|error/i)).toBeVisible({ timeout: 8000 });
  });

  test('login: submit button shows loading state', async ({ page }) => {
    await openAuthModal(page);
    await page.getByPlaceholder('อีเมล').fill('test@example.com');
    await page.getByPlaceholder('รหัสผ่าน').fill('pass1234');

    // Slow down the auth request so we can catch loading state
    await page.route('**/api/auth/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await expect(page.getByText('กำลังดำเนินการ…')).toBeVisible({ timeout: 3000 });
  });

  test('login: "สมัครสมาชิก" link switches to signup mode', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
    await expect(page.getByText('สร้างบัญชีใหม่')).toBeVisible();
  });

  test('login: "ลืมรหัสผ่าน?" link switches to reset mode', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'ลืมรหัสผ่าน?' }).click();
    await expect(page.getByText('รีเซ็ตรหัสผ่าน')).toBeVisible();
  });

  // ─── Signup Mode ─────────────────────────────────────────────────────────

  test('signup: shows name field', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
    await expect(page.getByPlaceholder('ชื่อของคุณ')).toBeVisible();
  });

  test('signup: shows social login buttons', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
  });

  test('signup: submit button label is "สมัครสมาชิก"', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
    // After mode switch, the submit button (type=submit) should say สมัครสมาชิก
    const submitBtn = page.getByRole('button', { name: 'สมัครสมาชิก' }).last();
    await expect(submitBtn).toBeVisible();
  });

  test('signup: password requires minimum 8 characters', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
    const passInput = page.getByPlaceholder('รหัสผ่าน');
    await expect(passInput).toHaveAttribute('minlength', '8');
  });

  test('signup: "มีบัญชีแล้ว?" link switches back to login', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
    await expect(page.getByText('สร้างบัญชีใหม่')).toBeVisible();
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await expect(page.getByText('ยินดีต้อนรับกลับ')).toBeVisible();
  });

  // ─── Reset Mode ──────────────────────────────────────────────────────────

  test('reset: shows only email field (no password)', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'ลืมรหัสผ่าน?' }).click();
    await expect(page.getByPlaceholder('อีเมล')).toBeVisible();
    await expect(page.getByPlaceholder('รหัสผ่าน')).not.toBeVisible();
  });

  test('reset: social login buttons hidden', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'ลืมรหัสผ่าน?' }).click();
    await expect(page.getByRole('button', { name: /Facebook/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Google/i })).not.toBeVisible();
  });

  test('reset: submit shows success message', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'ลืมรหัสผ่าน?' }).click();
    await page.getByPlaceholder('อีเมล').fill('test@example.com');
    await page.getByRole('button', { name: 'ส่งลิงก์รีเซ็ต' }).click();
    await expect(page.getByText(/ส่งลิงก์รีเซ็ต/)).toBeVisible({ timeout: 5000 });
  });

  test('reset: "← กลับไปเข้าสู่ระบบ" link returns to login', async ({ page }) => {
    await openAuthModal(page);
    await page.getByRole('button', { name: 'ลืมรหัสผ่าน?' }).click();
    await page.getByRole('button', { name: /กลับไปเข้าสู่ระบบ/ }).click();
    await expect(page.getByText('ยินดีต้อนรับกลับ')).toBeVisible();
  });

});
