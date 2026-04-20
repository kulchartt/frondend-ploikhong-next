import { test, expect } from '@playwright/test';

const MOCK_SESSION = {
  user: { name: 'ทดสอบ', email: 'test@ploi.dev', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-token-abc',
};

const MOCK_PRODUCTS = [
  { id: 1, title: 'iPhone 14 Pro', price: 32900, images: [], seller_name: 'สมชาย' },
  { id: 2, title: 'MacBook Air M2', price: 42000, images: [], seller_name: 'วิชัย' },
];

async function setupGuest(page: any) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
  await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
}

async function setupLoggedIn(page: any, wishlistIds: number[] = []) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
  await page.route('**/api/wishlist', r => {
    if (r.request().method() === 'GET') {
      r.fulfill({ json: wishlistIds.map(id => ({ id, product_id: id })) });
    } else {
      r.continue();
    }
  });
  await page.route('**/api/wishlist/**', r => r.fulfill({ json: { success: true } }));
}

test.describe('Wishlist', () => {

  // ─── Guest behaviour ────────────────────────────────────────────────────────

  test('heart button is visible on product card for guest', async ({ page }) => {
    await setupGuest(page);
    await page.goto('/');
    await expect(page.getByText('iPhone 14 Pro')).toBeVisible();
    // Heart button: svg inside absolute-positioned button
    const hearts = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') });
    await expect(hearts.first()).toBeVisible();
  });

  test('heart toggles locally for guest (no API call)', async ({ page }) => {
    let wishlistCalled = false;
    await setupGuest(page);
    await page.route('**/api/wishlist/**', r => { wishlistCalled = true; r.continue(); });
    await page.goto('/');
    const heart = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    await heart.click();
    // Should toggle visually but NOT call the API
    expect(wishlistCalled).toBe(false);
  });

  // ─── Logged-in behaviour ────────────────────────────────────────────────────

  test('loads wishlist from API on login — hearted product shows filled heart', async ({ page }) => {
    await setupLoggedIn(page, [1]); // product id=1 is wishlisted
    await page.goto('/');
    await expect(page.getByText('iPhone 14 Pro')).toBeVisible();
    // Product 1 heart should be filled (stroke = #b83216)
    const firstHeart = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    const svg = firstHeart.locator('svg');
    await expect(svg).toHaveAttribute('stroke', '#b83216');
  });

  test('product not in wishlist shows unfilled heart', async ({ page }) => {
    await setupLoggedIn(page, []); // nothing wishlisted
    await page.goto('/');
    const firstHeart = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    const svg = firstHeart.locator('svg');
    await expect(svg).not.toHaveAttribute('stroke', '#b83216');
  });

  test('clicking heart calls POST /api/wishlist/:id', async ({ page }) => {
    let toggleCalled = false;
    await setupLoggedIn(page, []);
    await page.route('**/api/wishlist/1', r => { toggleCalled = true; r.fulfill({ json: { success: true } }); });
    await page.goto('/');
    const firstHeart = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    await firstHeart.click();
    expect(toggleCalled).toBe(true);
  });

  test('heart fills immediately (optimistic) before API responds', async ({ page }) => {
    await setupLoggedIn(page, []);
    // Slow API response
    await page.route('**/api/wishlist/1', async r => {
      await new Promise(res => setTimeout(res, 500));
      r.fulfill({ json: { success: true } });
    });
    await page.goto('/');
    const firstHeart = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    await firstHeart.click();
    // Should be filled immediately, not after 500ms
    const svg = firstHeart.locator('svg');
    await expect(svg).toHaveAttribute('stroke', '#b83216');
  });

  test('heart reverts if API call fails', async ({ page }) => {
    await setupLoggedIn(page, []);
    await page.route('**/api/wishlist/1', r => r.fulfill({ status: 500, json: { error: 'fail' } }));
    await page.goto('/');
    const firstHeart = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    await firstHeart.click();
    // After error + revert, should be unfilled again
    const svg = firstHeart.locator('svg');
    await expect(svg).not.toHaveAttribute('stroke', '#b83216', { timeout: 2000 });
  });

  test('clicking heart again un-wishes (toggle off)', async ({ page }) => {
    await setupLoggedIn(page, [1]);
    await page.route('**/api/wishlist/1', r => r.fulfill({ json: { success: true } }));
    await page.goto('/');
    const firstHeart = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') }).first();
    // Already filled → click to remove
    await firstHeart.click();
    const svg = firstHeart.locator('svg');
    await expect(svg).not.toHaveAttribute('stroke', '#b83216');
  });

  test('second product heart is independent of first', async ({ page }) => {
    await setupLoggedIn(page, [1]);
    await page.goto('/');
    const hearts = page.locator('button').filter({ has: page.locator('svg path[d*="M12 21"]') });
    const first = hearts.nth(0);
    const second = hearts.nth(1);
    await expect(first.locator('svg')).toHaveAttribute('stroke', '#b83216');
    await expect(second.locator('svg')).not.toHaveAttribute('stroke', '#b83216');
  });

});
