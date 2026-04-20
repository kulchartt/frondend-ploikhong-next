import { test, expect } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MOCK_SESSION = {
  user: { name: 'สมชาย ทดสอบ', email: 'test@ploi.dev', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-token-abc123',
};

const MOCK_PRODUCTS = [
  {
    id: 10, title: 'iPhone 14 Pro 256GB', price: 32900,
    image_url: '', images: [], condition: 'มือสอง สภาพดี',
    category: 'มือถือ & แท็บเล็ต', status: 'active',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_boosted: false, description: 'เครื่องศูนย์ไทย ครบกล่อง',
  },
  {
    id: 11, title: 'MacBook Air M2', price: 42000,
    image_url: '', images: [], condition: 'ใหม่ในกล่อง',
    category: 'คอมพิวเตอร์', status: 'sold',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    is_boosted: true, description: 'ยังไม่แกะกล่อง',
  },
  {
    id: 12, title: 'AirPods Pro Gen 2', price: 7900,
    image_url: '', images: [], condition: 'มือสอง สภาพ 95%+',
    category: 'มือถือ & แท็บเล็ต', status: 'active',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_boosted: false, description: 'ใช้น้อย แบตดี',
  },
];

async function setupLoggedIn(page: any) {
  await page.route('**/api/auth/session', route =>
    route.fulfill({ json: MOCK_SESSION })
  );
  // Register broad route first so specific /my route (registered last) wins (Playwright LIFO)
  await page.route('**/api/products*', route =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/products/my', route =>
    route.fulfill({ json: MOCK_PRODUCTS })
  );
}

async function openHub(page: any) {
  await setupLoggedIn(page);
  await page.goto('/');
  // Click avatar dropdown → สินค้าของฉัน
  // The "ขาย" button calls onOpenHub('sell') → hubOpen = true
  // Use exact: true to avoid matching "+ ลงขาย" or "ลงขายฟรี"
  const sellBtn = page.getByRole('button', { name: 'ขาย', exact: true });
  await sellBtn.click();
}

// ─── Opening & closing ────────────────────────────────────────────────────────

test.describe('My Hub', () => {

  test('clicking "ขาย" nav button while logged-in opens MyHub', async ({ page }) => {
    await openHub(page);
    // MyHub header shows user name and stats
    await expect(page.getByText('สมชาย ทดสอบ').first()).toBeVisible();
    await expect(page.getByText('ประกาศทั้งหมด').first()).toBeVisible();
  });

  test('hub shows user name', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('สมชาย ทดสอบ')).toBeVisible();
  });

  test('hub shows user email', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('test@ploi.dev')).toBeVisible();
  });

  test('ESC closes the hub', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

  test('clicking backdrop closes the hub', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

  // ─── Stats ─────────────────────────────────────────────────────────────────

  test('stats row shows correct total count', async ({ page }) => {
    await openHub(page);
    // 3 products total → "3" in the stats
    await expect(page.getByText('ประกาศทั้งหมด')).toBeVisible();
    const statsBlock = page.locator('div').filter({ hasText: 'ประกาศทั้งหมด' }).first();
    await expect(statsBlock).toContainText('3');
  });

  test('stats row shows กำลังขาย count = 2', async ({ page }) => {
    await openHub(page);
    const statsBlock = page.locator('div').filter({ hasText: 'กำลังขาย' }).first();
    await expect(statsBlock).toContainText('2');
  });

  test('stats row shows ขายแล้ว count = 1', async ({ page }) => {
    await openHub(page);
    const statsBlock = page.locator('div').filter({ hasText: 'ขายแล้ว' }).first();
    await expect(statsBlock).toContainText('1');
  });

  // ─── Product list ──────────────────────────────────────────────────────────

  test('all 3 products appear in "ทั้งหมด" tab', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await expect(page.getByText('MacBook Air M2')).toBeVisible();
    await expect(page.getByText('AirPods Pro Gen 2')).toBeVisible();
  });

  test('product shows formatted price', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('฿32,900')).toBeVisible();
  });

  test('sold product shows "ขายแล้ว" badge', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('ขายแล้ว').first()).toBeVisible();
  });

  test('active product shows "กำลังขาย" badge', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('กำลังขาย').first()).toBeVisible();
  });

  test('boosted product shows BOOST badge', async ({ page }) => {
    await openHub(page);
    await expect(page.getByText('BOOST', { exact: true })).toBeVisible();
  });

  // ─── Tab filtering ─────────────────────────────────────────────────────────

  test('"กำลังขาย" tab shows only active products', async ({ page }) => {
    await openHub(page);
    await page.getByRole('button', { name: /กำลังขาย/ }).first().click();
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await expect(page.getByText('AirPods Pro Gen 2')).toBeVisible();
    await expect(page.getByText('MacBook Air M2')).not.toBeVisible();
  });

  test('"ขายแล้ว" tab shows only sold products', async ({ page }) => {
    await openHub(page);
    await page.getByRole('button', { name: /ขายแล้ว/ }).first().click();
    await expect(page.getByText('MacBook Air M2')).toBeVisible();
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

  // ─── Edit ──────────────────────────────────────────────────────────────────

  test('clicking edit icon expands inline edit form', async ({ page }) => {
    await openHub(page);
    // Each product row has 3 icon buttons: ✓ edit delete
    // Edit = pencil icon button (second of the 3 action buttons on first product)
    const editBtns = page.locator('button[title]').filter({ hasNot: page.locator('[title]') });
    // More reliable: find the svg with the pencil path
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await expect(page.getByText('ชื่อประกาศ').first()).toBeVisible();
    await expect(page.getByText('ราคา (฿)').first()).toBeVisible();
    await expect(page.getByText('คำอธิบาย').first()).toBeVisible();
  });

  test('edit form pre-fills with current values', async ({ page }) => {
    await openHub(page);
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    const titleInput = page.locator('input[maxlength="80"]');
    await expect(titleInput).toHaveValue('iPhone 14 Pro 256GB');
  });

  test('edit save calls PATCH and updates the list', async ({ page }) => {
    let patchCalled = false;
    await page.route('**/api/products/10', route => {
      if (route.request().method() === 'PATCH') {
        patchCalled = true;
        route.fulfill({ json: { id: 10, title: 'iPhone 14 Pro EDITED', price: 30000 } });
      } else {
        route.continue();
      }
    });

    await openHub(page);
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    const titleInput = page.locator('input[maxlength="80"]');
    await titleInput.fill('iPhone 14 Pro EDITED');
    await page.getByRole('button', { name: 'บันทึก' }).click();

    expect(patchCalled).toBe(true);
    await expect(page.getByText('iPhone 14 Pro EDITED')).toBeVisible();
  });

  test('clicking edit again collapses the form', async ({ page }) => {
    await openHub(page);
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await expect(page.getByText('ชื่อประกาศ').first()).toBeVisible();
    await firstEditBtn.click(); // toggle off
    await expect(page.getByText('ชื่อประกาศ')).not.toBeVisible();
  });

  // ─── Delete ────────────────────────────────────────────────────────────────

  test('clicking delete icon shows confirm bar', async ({ page }) => {
    await openHub(page);
    const firstDeleteBtn = page.locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await expect(page.getByText('ลบประกาศนี้? ย้อนกลับไม่ได้')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ลบเลย' })).toBeVisible();
  });

  test('"ยกเลิก" in confirm bar dismisses it', async ({ page }) => {
    await openHub(page);
    const firstDeleteBtn = page.locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.getByText('ลบประกาศนี้?')).not.toBeVisible();
  });

  test('confirming delete calls DELETE and removes product from list', async ({ page }) => {
    let deleteCalled = false;
    await page.route('**/api/products/10', route => {
      if (route.request().method() === 'DELETE') {
        deleteCalled = true;
        route.fulfill({ json: { success: true } });
      } else {
        route.continue();
      }
    });

    await openHub(page);
    const firstDeleteBtn = page.locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await page.getByRole('button', { name: 'ลบเลย' }).click();

    expect(deleteCalled).toBe(true);
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

  // ─── Empty state ───────────────────────────────────────────────────────────

  test('empty state shows when no products', async ({ page }) => {
    await page.route('**/api/auth/session', route => route.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', route => route.fulfill({ json: [] }));
    await page.route('**/api/products/my', route => route.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ขาย', exact: true }).click();
    await expect(page.getByText('ยังไม่มีประกาศ')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ ลงขายฟรี' })).toBeVisible();
  });

  // ─── New listing shortcut ──────────────────────────────────────────────────

  test('"+ ลงขายใหม่" button closes hub and opens ListingFlow', async ({ page }) => {
    await openHub(page);
    await page.getByRole('button', { name: '+ ลงขายใหม่' }).click();
    // Hub should close, ListingFlow step 1 should appear
    await expect(page.getByText('สินค้าของฉัน')).not.toBeVisible();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

  // ─── Loading state ─────────────────────────────────────────────────────────

  test('shows loading skeletons while fetching', async ({ page }) => {
    await page.route('**/api/auth/session', route => route.fulfill({ json: MOCK_SESSION }));
    // Delay the products response
    await page.route('**/api/products*', route => route.fulfill({ json: [] }));
    await page.route('**/api/products/my', async route => {
      await new Promise(r => setTimeout(r, 800));
      route.fulfill({ json: MOCK_PRODUCTS });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'ขาย', exact: true }).click();
    // Skeletons should be visible before products load (loading=true while 800ms delay active)
    // React outputs "animation:pulse..." without space so match on "animation"
    const skeletons = page.locator('[style*="animation"]');
    await expect(skeletons.first()).toBeVisible({ timeout: 2000 });
  });

});
