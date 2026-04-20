import { test, expect } from '@playwright/test';

const MOCK_PRODUCTS = [
  { id: 1, title: 'Test Product', price: 1000, images: [], seller_name: 'Test' },
];

// Helper: mock session so user is "logged in"
async function mockSession(page: any) {
  await page.route('**/api/auth/session', route => {
    route.fulfill({
      json: {
        user: { name: 'ทดสอบ', email: 'test@example.com', image: null },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
    });
  });
}

test.describe('Listing Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products*', route => route.fulfill({ json: MOCK_PRODUCTS }));
    await mockSession(page);
    await page.goto('/');
  });

  // ─── Opening ───────────────────────────────────────────────────────────────

  test('logged-in user: "+ ลงขาย" opens listing modal (not auth modal)', async ({ page }) => {
    const btn = page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first();
    await btn.click();
    // Auth modal shows "เข้าสู่ระบบ"; listing modal shows "รูปภาพ" step label
    await expect(page.getByText('รูปภาพ').first()).toBeVisible();
    await expect(page.getByText('เข้าสู่ระบบ')).not.toBeVisible();
  });

  test('unauthenticated user: "+ ลงขาย" opens auth modal', async ({ page }) => {
    // Override session to return no user
    await page.route('**/api/auth/session', route => route.fulfill({ json: {} }));
    await page.reload();
    const btn = page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first();
    await btn.click();
    await expect(page.getByText('เข้าสู่ระบบ')).toBeVisible();
  });

  // ─── Stepper ───────────────────────────────────────────────────────────────

  test('stepper shows all 4 steps on open', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    for (const label of ['รูปภาพ', 'รายละเอียด', 'ราคา & ส่ง', 'ตรวจ & โพสต์']) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test('step counter shows "ขั้นตอน 1 จาก 4"', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

  // ─── Step 1: Photos ────────────────────────────────────────────────────────

  test('step 1: "ต่อไป" button is disabled when no photos', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await expect(page.getByTestId('listing-next-btn')).toBeDisabled();
  });

  test('step 1: adding a photo enables "ต่อไป" button', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await page.getByTestId('add-photo-btn').click();
    await expect(page.getByTestId('listing-next-btn')).toBeEnabled();
  });

  test('step 1: added photo shows photo count 1/10', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await page.getByTestId('add-photo-btn').click();
    await expect(page.getByText('1/10')).toBeVisible();
  });

  test('step 1: adding 10 photos hides the add button', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    for (let i = 0; i < 10; i++) {
      const addBtn = page.getByTestId('add-photo-btn');
      if (await addBtn.isVisible()) await addBtn.click();
    }
    await expect(page.getByTestId('add-photo-btn')).not.toBeVisible();
  });

  test('step 1: removing a photo brings it back below 10', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await page.getByTestId('add-photo-btn').click();
    // Remove button (×) on added photo
    await page.locator('button').filter({ hasText: '×' }).first().click();
    // Photo count should be 0/10 and add button visible again
    await expect(page.getByTestId('add-photo-btn')).toBeVisible();
  });

  test('step 1: COVER label appears on first photo', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await page.getByTestId('add-photo-btn').click();
    await expect(page.getByText('COVER')).toBeVisible();
  });

  // ─── Step 2: Details ───────────────────────────────────────────────────────

  async function goToStep2(page: any) {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await page.getByTestId('add-photo-btn').click();
    await page.getByTestId('listing-next-btn').click();
  }

  test('step 2: shows title, category, condition, description fields', async ({ page }) => {
    await goToStep2(page);
    await expect(page.getByTestId('listing-title')).toBeVisible();
    await expect(page.getByTestId('listing-category')).toBeVisible();
    await expect(page.getByTestId('listing-condition')).toBeVisible();
    await expect(page.getByTestId('listing-desc')).toBeVisible();
  });

  test('step 2: "ต่อไป" disabled until title ≥ 6 chars and desc ≥ 10 chars', async ({ page }) => {
    await goToStep2(page);
    await expect(page.getByTestId('listing-next-btn')).toBeDisabled();
    await page.getByTestId('listing-title').fill('iPhone 14');
    await expect(page.getByTestId('listing-next-btn')).toBeDisabled(); // desc still empty
    await page.getByTestId('listing-desc').fill('ใช้งานปกติทุกฟังก์ชัน ของแท้');
    await expect(page.getByTestId('listing-next-btn')).toBeEnabled();
  });

  test('step 2: title char counter updates', async ({ page }) => {
    await goToStep2(page);
    await page.getByTestId('listing-title').fill('Hello');
    await expect(page.getByText(/5\/80/)).toBeVisible();
  });

  test('step 2: AI button is present', async ({ page }) => {
    await goToStep2(page);
    await expect(page.getByTestId('ai-write-btn')).toBeVisible();
  });

  test('step 2: AI button shows error when fields empty', async ({ page }) => {
    await goToStep2(page);
    await page.getByTestId('ai-write-btn').click();
    await expect(page.getByText(/พิมพ์ชื่อหรือคำอธิบายก่อน/)).toBeVisible();
  });

  // ─── Step 3: Price & Delivery ──────────────────────────────────────────────

  async function goToStep3(page: any) {
    await goToStep2(page);
    await page.getByTestId('listing-title').fill('iPhone 14 Pro');
    await page.getByTestId('listing-desc').fill('เครื่องศูนย์ไทย ใช้งานปกติ ครบกล่อง');
    await page.getByTestId('listing-next-btn').click();
  }

  test('step 3: price field, location, delivery chips are visible', async ({ page }) => {
    await goToStep3(page);
    await expect(page.getByTestId('listing-price')).toBeVisible();
    await expect(page.getByText('วิธีรับสินค้า')).toBeVisible();
    await expect(page.getByText('นัดรับ').first()).toBeVisible();
  });

  test('step 3: "ต่อไป" disabled until price is filled', async ({ page }) => {
    await goToStep3(page);
    await expect(page.getByTestId('listing-next-btn')).toBeDisabled();
    await page.getByTestId('listing-price').fill('15000');
    await expect(page.getByTestId('listing-next-btn')).toBeEnabled();
  });

  test('step 3: Boost card toggles on click', async ({ page }) => {
    await goToStep3(page);
    const boost = page.getByTestId('boost-card');
    await expect(boost).toBeVisible();
    await boost.click();
    // After click, checkbox inside should be checked
    const checkbox = boost.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
  });

  test('step 3: delivery chip "ส่งไปรษณีย์" can be selected', async ({ page }) => {
    await goToStep3(page);
    await page.getByRole('button', { name: 'ส่งไปรษณีย์' }).click();
    // That button should now have dark background (ink)
    const btn = page.getByRole('button', { name: 'ส่งไปรษณีย์' });
    await expect(btn).toHaveCSS('color', 'rgb(248, 249, 251)'); // --bg color
  });

  // ─── Step 4: Preview & Post ────────────────────────────────────────────────

  async function goToStep4(page: any) {
    await goToStep3(page);
    await page.getByTestId('listing-price').fill('15000');
    await page.getByTestId('listing-next-btn').click();
  }

  test('step 4: shows preview with entered title', async ({ page }) => {
    await goToStep4(page);
    await expect(page.getByText('iPhone 14 Pro').first()).toBeVisible();
  });

  test('step 4: shows formatted price', async ({ page }) => {
    await goToStep4(page);
    await expect(page.getByText('฿15,000').first()).toBeVisible();
  });

  test('step 4: cost summary shows ฿0 for no boost', async ({ page }) => {
    await goToStep4(page);
    await expect(page.getByText('ชำระตอนนี้')).toBeVisible();
    await expect(page.getByText('฿0').first()).toBeVisible();
  });

  test('step 4: post button shows "โพสต์ประกาศ"', async ({ page }) => {
    await goToStep4(page);
    await expect(page.getByTestId('listing-post-btn')).toBeVisible();
    await expect(page.getByTestId('listing-post-btn')).toContainText('โพสต์ประกาศ');
  });

  test('step 4: post button shows boost price when boost is on', async ({ page }) => {
    await goToStep3(page);
    await page.getByTestId('boost-card').click();
    await page.getByTestId('listing-price').fill('15000');
    await page.getByTestId('listing-next-btn').click();
    await expect(page.getByTestId('listing-post-btn')).toContainText('฿29');
  });

  test('step 4: clicking "โพสต์" shows success screen', async ({ page }) => {
    await goToStep4(page);
    await page.getByTestId('listing-post-btn').click();
    await expect(page.getByText('โพสต์สำเร็จแล้ว!')).toBeVisible();
  });

  // ─── Navigation ────────────────────────────────────────────────────────────

  test('back button on step 2 goes back to step 1', async ({ page }) => {
    await goToStep2(page);
    await page.getByRole('button', { name: /ย้อนกลับ/ }).click();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

  test('cancel button on step 1 closes modal', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).not.toBeVisible();
  });

  test('ESC key closes listing modal', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).not.toBeVisible();
  });

  test('clicking backdrop closes listing modal', async ({ page }) => {
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).not.toBeVisible();
  });

});
