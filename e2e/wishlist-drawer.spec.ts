import { test, expect } from '@playwright/test';

const MOCK_SESSION = {
  user: { name: 'ทดสอบ', email: 'test@ploi.dev', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-token-abc',
};

const MOCK_WISHLIST = [
  {
    id: 1, title: 'iPhone 14 Pro 256GB', price: 32900, original_price: 38900,
    images: [], image_url: '', seller_name: 'สมชาย',
    location: 'กรุงเทพ · พระราม 9',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    condition: 'มือสอง สภาพดี', category: 'มือถือ & แท็บเล็ต',
  },
  {
    id: 2, title: 'MacBook Air M2 256GB', price: 42000,
    images: [], image_url: '', seller_name: 'วิชัย',
    location: 'เชียงใหม่',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    condition: 'ใหม่ในกล่อง',
  },
];

async function setupLoggedIn(page: any, wishlist = MOCK_WISHLIST) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  await page.route('**/api/products*', r => r.fulfill({ json: [] }));
  await page.route('**/api/wishlist', r => {
    if (r.request().method() === 'GET') r.fulfill({ json: wishlist });
    else r.continue();
  });
  await page.route('**/api/wishlist/**', r => r.fulfill({ json: { success: true } }));
}

async function openWishlist(page: any, wishlist = MOCK_WISHLIST) {
  await setupLoggedIn(page, wishlist);
  await page.goto('/');
  // "ถูกใจ" button in navbar triggers onOpenHub('buy') → wishlistOpen
  await page.getByRole('button', { name: 'ถูกใจ' }).click();
}

test.describe('Wishlist Drawer', () => {

  // ─── Opening ───────────────────────────────────────────────────────────────

  test('clicking "ถูกใจ" navbar button opens wishlist drawer when logged in', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText('รายการถูกใจ')).toBeVisible();
  });

  test('unauthenticated user gets auth modal instead of wishlist', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ถูกใจ' }).click();
    await expect(page.getByText('เข้าสู่ระบบ')).toBeVisible();
    await expect(page.getByText('รายการถูกใจ')).not.toBeVisible();
  });

  test('drawer header shows item count badge', async ({ page }) => {
    await openWishlist(page);
    // Badge showing "2"
    await expect(page.locator('span').filter({ hasText: /^2$/ }).first()).toBeVisible();
  });

  // ─── Closing ───────────────────────────────────────────────────────────────

  test('ESC closes the drawer', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText('รายการถูกใจ')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('รายการถูกใจ')).not.toBeVisible();
  });

  test('clicking backdrop closes the drawer', async ({ page }) => {
    await openWishlist(page);
    await page.mouse.click(5, 5);
    await expect(page.getByText('รายการถูกใจ')).not.toBeVisible();
  });

  test('clicking × button closes the drawer', async ({ page }) => {
    await openWishlist(page);
    const closeBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M6 6l12 12"]'),
    }).first();
    await closeBtn.click();
    await expect(page.getByText('รายการถูกใจ')).not.toBeVisible();
  });

  // ─── Product list ──────────────────────────────────────────────────────────

  test('shows all wishlisted products', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await expect(page.getByText('MacBook Air M2 256GB')).toBeVisible();
  });

  test('shows formatted price', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText('฿32,900')).toBeVisible();
  });

  test('shows strikethrough original price', async ({ page }) => {
    await openWishlist(page);
    // original_price 38900 should appear as strikethrough
    await expect(page.locator('s').filter({ hasText: '38,900' })).toBeVisible();
  });

  test('shows seller name', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText('สมชาย')).toBeVisible();
  });

  test('shows location', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText('กรุงเทพ').first()).toBeVisible();
  });

  // ─── Footer total ──────────────────────────────────────────────────────────

  test('footer shows total value of all wishlisted items', async ({ page }) => {
    await openWishlist(page);
    // 32900 + 42000 = 74900
    await expect(page.getByText('฿74,900')).toBeVisible();
  });

  test('footer shows item count', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText(/2 รายการ/)).toBeVisible();
  });

  // ─── Remove ────────────────────────────────────────────────────────────────

  test('clicking filled heart removes item from list', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    // Remove buttons: filled red hearts
    const removeBtns = page.locator('button[title="นำออกจากรายการถูกใจ"]');
    await removeBtns.first().click();
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

  test('removing item calls DELETE/toggle API', async ({ page }) => {
    let apiCalled = false;
    await setupLoggedIn(page);
    await page.route('**/api/wishlist/1', r => {
      apiCalled = true;
      r.fulfill({ json: { success: true } });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'ถูกใจ' }).click();
    const removeBtns = page.locator('button[title="นำออกจากรายการถูกใจ"]');
    await removeBtns.first().click();
    expect(apiCalled).toBe(true);
  });

  test('after removal, footer total updates', async ({ page }) => {
    await openWishlist(page);
    const removeBtns = page.locator('button[title="นำออกจากรายการถูกใจ"]');
    await removeBtns.first().click(); // remove iPhone (32900)
    // Remaining: MacBook 42000
    await expect(page.getByText('฿42,000')).toBeVisible();
  });

  test('removing last item shows empty state', async ({ page }) => {
    await openWishlist(page, [MOCK_WISHLIST[0]]); // only 1 item
    const removeBtns = page.locator('button[title="นำออกจากรายการถูกใจ"]');
    await removeBtns.first().click();
    await expect(page.getByText('ยังไม่มีรายการถูกใจ')).toBeVisible();
  });

  // ─── Product click → opens detail ──────────────────────────────────────────

  test('clicking product thumbnail opens ProductDetail and closes drawer', async ({ page }) => {
    await openWishlist(page);
    // Click the thumbnail div (first product)
    const thumbs = page.locator('div[style*="cursor: pointer"]').first();
    await thumbs.click();
    // Drawer should close
    await expect(page.getByText('รายการถูกใจ')).not.toBeVisible();
    // ProductDetail should open (shows the title in h1)
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).toBeVisible();
  });

  // ─── Empty state ───────────────────────────────────────────────────────────

  test('empty wishlist shows empty state message', async ({ page }) => {
    await openWishlist(page, []);
    await expect(page.getByText('ยังไม่มีรายการถูกใจ')).toBeVisible();
    await expect(page.getByText(/กดไอคอนหัวใจ/)).toBeVisible();
  });

  test('empty state has "เลือกดูสินค้า" button that closes drawer', async ({ page }) => {
    await openWishlist(page, []);
    await page.getByRole('button', { name: 'เลือกดูสินค้า' }).click();
    await expect(page.getByText('รายการถูกใจ')).not.toBeVisible();
  });

  // ─── Not logged in inside drawer ───────────────────────────────────────────

  test('shows login prompt when session token missing', async ({ page }) => {
    // session exists but no token (edge case)
    await page.route('**/api/auth/session', r => r.fulfill({
      json: { user: { name: 'test' }, expires: new Date(Date.now() + 86400000).toISOString() }
      // no token field
    }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ถูกใจ' }).click();
    // Should show login prompt inside drawer
    await expect(page.getByText('กรุณาเข้าสู่ระบบ').first()).toBeVisible();
  });

  // ─── Sync with product grid hearts ─────────────────────────────────────────

  test('removing from wishlist drawer un-fills heart on product grid', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', r => r.fulfill({ json: [MOCK_WISHLIST[0]] }));
    await page.route('**/api/wishlist', r => {
      if (r.request().method() === 'GET') r.fulfill({ json: [MOCK_WISHLIST[0]] });
      else r.continue();
    });
    await page.route('**/api/wishlist/**', r => r.fulfill({ json: { success: true } }));

    await page.goto('/');
    // Wait for grid to load, heart should be filled
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    const gridHeart = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    await expect(gridHeart.locator('svg')).toHaveAttribute('stroke', '#b83216');

    // Open wishlist and remove
    await page.getByRole('button', { name: 'ถูกใจ' }).click();
    await page.locator('button[title="นำออกจากรายการถูกใจ"]').first().click();
    await page.keyboard.press('Escape');

    // Grid heart should now be unfilled
    await expect(gridHeart.locator('svg')).not.toHaveAttribute('stroke', '#b83216');
  });

});
