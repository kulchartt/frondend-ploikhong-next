import { test, expect } from '@playwright/test';
import path from 'path';

const MOCK_PRODUCTS = [
  { id: 1, title: 'Test Product', price: 1000, images: [], seller_name: 'Test' },
];

const MOCK_SESSION = {
  user: { name: 'ทดสอบ', email: 'test@example.com', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-token-abc',
};

// Upload a fake image via the hidden file input
async function addPhoto(page: any) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
  });
}

async function openListing(page: any) {
  await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
}

async function goToStep2(page: any) {
  await openListing(page);
  await addPhoto(page);
  await page.getByTestId('listing-next-btn').click();
}

async function goToStep3(page: any) {
  await goToStep2(page);
  await page.getByTestId('listing-title').fill('iPhone 14 Pro');
  await page.getByTestId('listing-desc').fill('เครื่องศูนย์ไทย ใช้งานปกติ ครบกล่อง');
  await page.getByTestId('listing-next-btn').click();
}

async function goToStep4(page: any) {
  await goToStep3(page);
  await page.getByTestId('listing-price').fill('15000');
  await page.getByTestId('listing-next-btn').click();
}

test.describe('Listing Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/wishlist', r => r.fulfill({ json: [] }));
    await page.goto('/');
  });

  // ─── Opening ───────────────────────────────────────────────────────────────

  test('logged-in user: "+ ลงขาย" opens listing modal', async ({ page }) => {
    await openListing(page);
    await expect(page.getByText('รูปภาพ').first()).toBeVisible();
    await expect(page.getByText('เข้าสู่ระบบ')).not.toBeVisible();
  });

  test('unauthenticated user: "+ ลงขาย" does not open listing flow', async ({ page }) => {
    // New page with no session at all
    await page.route('**/api/auth/session', r => r.fulfill({ status: 200, json: null }));
    await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
    await page.goto('/');
    await page.getByRole('button', { name: /^\+\s*ลงขาย$/ }).first().click();
    // Listing modal (stepper) must NOT appear
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).not.toBeVisible();
  });

  // ─── Stepper ───────────────────────────────────────────────────────────────

  test('stepper shows all 4 step labels on open', async ({ page }) => {
    await openListing(page);
    for (const label of ['รูปภาพ', 'รายละเอียด', 'ราคา & ส่ง', 'ตรวจ & โพสต์']) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test('step counter shows "ขั้นตอน 1 จาก 4"', async ({ page }) => {
    await openListing(page);
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

  // ─── Step 1: Photos ────────────────────────────────────────────────────────

  test('step 1: "ต่อไป" disabled when no photos', async ({ page }) => {
    await openListing(page);
    await expect(page.getByTestId('listing-next-btn')).toBeDisabled();
  });

  test('step 1: adding a photo enables "ต่อไป"', async ({ page }) => {
    await openListing(page);
    await addPhoto(page);
    await expect(page.getByTestId('listing-next-btn')).toBeEnabled();
  });

  test('step 1: added photo shows count 1/10', async ({ page }) => {
    await openListing(page);
    await addPhoto(page);
    await expect(page.getByText('1/10')).toBeVisible();
  });

  test('step 1: COVER label appears on first photo', async ({ page }) => {
    await openListing(page);
    await addPhoto(page);
    await expect(page.getByText('COVER')).toBeVisible();
  });

  test('step 1: removing a photo shows add button again', async ({ page }) => {
    await openListing(page);
    await addPhoto(page);
    // Remove button uses × character inside a button
    await page.locator('[data-testid^="remove-photo"]').first().click();
    await expect(page.getByTestId('add-photo-btn')).toBeVisible();
    await expect(page.getByTestId('listing-next-btn')).toBeDisabled();
  });

  // ─── Step 2: Details ───────────────────────────────────────────────────────

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
    await expect(page.getByTestId('listing-next-btn')).toBeDisabled();
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

  test('step 3: price field, delivery chips visible', async ({ page }) => {
    await goToStep3(page);
    await expect(page.getByTestId('listing-price')).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'วิธีรับสินค้า' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'นัดรับ', exact: true }).first()).toBeVisible();
  });

  test('step 3: "ต่อไป" disabled until price filled', async ({ page }) => {
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
    await expect(boost.locator('input[type="checkbox"]')).toBeChecked();
  });

  test('step 3: delivery chip "ส่งไปรษณีย์" can be selected', async ({ page }) => {
    await goToStep3(page);
    const btn = page.getByRole('button', { name: 'ส่งไปรษณีย์', exact: true });
    await btn.click();
    await expect(btn).toHaveCSS('color', 'rgb(248, 249, 251)');
  });

  // ─── Step 4: Preview & Post ────────────────────────────────────────────────

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
    await expect(page.getByTestId('listing-post-btn')).toContainText('โพสต์ประกาศ');
  });

  test('step 4: post button shows boost price when boost on', async ({ page }) => {
    await goToStep3(page);
    await page.getByTestId('boost-card').click();
    await page.getByTestId('listing-price').fill('15000');
    await page.getByTestId('listing-next-btn').click();
    await expect(page.getByTestId('listing-post-btn')).toContainText('฿29');
  });

  test('step 4: clicking "โพสต์" shows success screen', async ({ page }) => {
    await page.route('**/api/products/upload', r => r.fulfill({ json: { url: 'https://example.com/img.jpg' } }));
    await page.route('**/api/products', r => r.fulfill({ json: { id: 99, title: 'iPhone 14 Pro' } }));
    await goToStep4(page);
    await page.getByTestId('listing-post-btn').click();
    await expect(page.getByText('โพสต์สำเร็จแล้ว!')).toBeVisible({ timeout: 10000 });
  });

  // ─── Close button in header ────────────────────────────────────────────────

  test('× button in header closes modal on step 1', async ({ page }) => {
    await openListing(page);
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
    const closeBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M6 6l12 12"]'),
    }).first();
    await closeBtn.click();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).not.toBeVisible();
  });

  test('× button in header closes modal on step 4', async ({ page }) => {
    await goToStep4(page);
    await expect(page.getByText('ตรวจสอบก่อนโพสต์')).toBeVisible();
    const closeBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M6 6l12 12"]'),
    }).first();
    await closeBtn.click();
    await expect(page.getByText('ตรวจสอบก่อนโพสต์')).not.toBeVisible();
  });

  // ─── Auth warning on step 4 ────────────────────────────────────────────────

  test('step 4: post button disabled when no token — clicking shows warning', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({
      json: {
        user: { name: 'ทดสอบ', email: 'test@example.com', image: null },
        expires: new Date(Date.now() + 86400000).toISOString(),
        // no token field
      },
    }));
    await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
    await page.goto('/');
    await goToStep4(page);
    await page.getByTestId('listing-post-btn').click();
    await expect(page.getByText('กรุณาเข้าสู่ระบบก่อนโพสต์')).toBeVisible();
  });

  // ─── Navigation ────────────────────────────────────────────────────────────

  test('back button on step 2 goes back to step 1', async ({ page }) => {
    await goToStep2(page);
    await page.getByRole('button', { name: /ย้อนกลับ/ }).click();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

  test('ESC key closes listing modal', async ({ page }) => {
    await openListing(page);
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).not.toBeVisible();
  });

  test('clicking backdrop closes listing modal', async ({ page }) => {
    await openListing(page);
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
    // Click far left edge of screen (backdrop area)
    await page.mouse.click(10, page.viewportSize()!.height / 2);
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).not.toBeVisible();
  });

});
