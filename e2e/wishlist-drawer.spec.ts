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
  // "ถูกใจ" triggers onOpenHub('buy', 'saved') → opens MyHub in saved tab
  await page.getByRole('button', { name: 'ถูกใจ' }).click();
  // Wait for MyHub to render
  await expect(page.getByTestId('v8hub')).toBeVisible();
}

test.describe('Wishlist Drawer', () => {

  // ─── Opening ───────────────────────────────────────────────────────────────

  test('clicking "ถูกใจ" navbar button opens saved tab in MyHub', async ({ page }) => {
    await openWishlist(page);
    // MyHub opens in buy/saved tab — BuySaved renders h1 "บันทึกแล้ว"
    await expect(page.getByRole('heading', { name: 'บันทึกแล้ว' })).toBeVisible();
  });

  test('unauthenticated user gets auth modal instead of wishlist', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ถูกใจ' }).click();
    // Auth modal should open — check for the submit button scoped to the modal
    await expect(page.getByTestId('auth-modal').getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
    await expect(page.getByText('รายการถูกใจ')).not.toBeVisible();
  });

  test('saved tab shows item count', async ({ page }) => {
    await openWishlist(page);
    // BuySaved shows "2 รายการ" in the v8hub
    await expect(page.getByTestId('v8hub').getByText(/2.*รายการ/)).toBeVisible();
  });

  // ─── Closing ───────────────────────────────────────────────────────────────

  test('ESC closes MyHub', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByTestId('v8hub')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('v8hub')).not.toBeVisible();
  });

  test('clicking back button closes MyHub', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByTestId('v8hub')).toBeVisible();
    // Desktop back button in sidebar has exact text "Marketplace"
    await page.getByTestId('v8hub').getByRole('button', { name: 'Marketplace', exact: true }).click();
    await expect(page.getByTestId('v8hub')).not.toBeVisible();
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

  // ─── Footer total (feature removed — no footer sum in BuySaved) ────────────

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

  test('after removal, removed item disappears from list', async ({ page }) => {
    await openWishlist(page);
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    const removeBtns = page.locator('button[title="นำออกจากรายการถูกใจ"]');
    await removeBtns.first().click();
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
    // MacBook still visible
    await expect(page.getByText('MacBook Air M2 256GB')).toBeVisible();
  });

  test('removing last item shows empty state', async ({ page }) => {
    await openWishlist(page, [MOCK_WISHLIST[0]]); // only 1 item
    const removeBtns = page.locator('button[title="นำออกจากรายการถูกใจ"]');
    await removeBtns.first().click();
    await expect(page.getByText('ยังไม่มีรายการถูกใจ')).toBeVisible();
  });

  // ─── Product click → opens detail ──────────────────────────────────────────

  test('"ดูสินค้า" button opens ProductDetail and closes MyHub', async ({ page }) => {
    await openWishlist(page);
    // Click "ดูสินค้า" on the first product
    await page.getByRole('button', { name: 'ดูสินค้า' }).first().click();
    // MyHub should close
    await expect(page.getByTestId('v8hub')).not.toBeVisible();
    // ProductDetail should open
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).toBeVisible();
  });

  // ─── Empty state ───────────────────────────────────────────────────────────

  test('empty wishlist shows empty state message', async ({ page }) => {
    await openWishlist(page, []);
    await expect(page.getByText('ยังไม่มีรายการถูกใจ')).toBeVisible();
    await expect(page.getByText(/กดไอคอนหัวใจ/)).toBeVisible();
  });

  test('empty state shows prompt to browse products', async ({ page }) => {
    await openWishlist(page, []);
    await expect(page.getByText('ยังไม่มีรายการถูกใจ')).toBeVisible();
    await expect(page.getByText(/กดไอคอนหัวใจ/)).toBeVisible();
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

  test.skip('removing from wishlist drawer un-fills heart on product grid', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', r => r.fulfill({ json: [MOCK_WISHLIST[0]] }));
    await page.route('**/api/wishlist', r => {
      if (r.request().method() === 'GET') r.fulfill({ json: [MOCK_WISHLIST[0]] });
      else r.continue();
    });
    await page.route('**/api/wishlist/**', r => r.fulfill({ json: { success: true } }));

    // Capture wishlist response BEFORE navigating
    const wishlistResponse = page.waitForResponse(
      r => r.url().includes('/api/wishlist') && r.request().method() === 'GET'
    );
    await page.goto('/');

    // Wait for both: grid visible AND wishlist API loaded (so wishlistIds are populated)
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await wishlistResponse;

    // Now heart should be red (inWishlist=true from wishlistIds)
    // Scope to main to avoid matching Navbar's ถูกใจ button (same SVG path)
    const gridHeart = page.locator('main').locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    await expect(gridHeart.locator('svg')).toHaveAttribute('stroke', '#b83216');

    // Open wishlist and remove
    await page.getByRole('button', { name: 'ถูกใจ' }).click();
    await page.locator('button[title="นำออกจากรายการถูกใจ"]').first().click();
    await page.keyboard.press('Escape');

    // Grid heart should now be unfilled
    await expect(gridHeart.locator('svg')).not.toHaveAttribute('stroke', '#b83216');
  });

});
