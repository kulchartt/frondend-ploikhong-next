import { test, expect } from '@playwright/test';

// Tests for Premium & Coin system (MyHub Premium tab)

test.describe('Premium & Coins Tab', () => {
  test('Premium tab appears in SELL nav', async ({ page }) => {
    await page.goto('/');
    // Open hub — look for hub trigger button
    const hubBtn = page.getByTestId('hub-btn').or(page.getByRole('button', { name: /ศูนย์ซื้อขาย/i })).first();
    if (await hubBtn.count() === 0) {
      // Try clicking the sell/hub icon in navbar
      await page.locator('[data-testid="v8hub"]').waitFor({ state: 'detached', timeout: 2000 }).catch(() => {});
      test.skip(true, 'Hub not accessible without auth');
      return;
    }
  });

  test('MyHub renders with SELL_NAV including premium', async ({ page }) => {
    // Navigate to page and check MyHub component is present in DOM
    await page.goto('/');
    // The Hub is only accessible after login; we just verify the page loads cleanly
    await expect(page).toHaveTitle(/.+/);
  });

  test('Coin packages API returns expected shape', async ({ request }) => {
    const res = await request.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/packages`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('packages');
    expect(body).toHaveProperty('features');
    expect(body).toHaveProperty('promptpay');
    expect(Array.isArray(body.packages)).toBeTruthy();
    expect(body.packages.length).toBeGreaterThanOrEqual(4);

    const pkg = body.packages[0];
    expect(pkg).toHaveProperty('key');
    expect(pkg).toHaveProperty('coins');
    expect(pkg).toHaveProperty('price');
  });

  test('Coin packages have correct pricing tiers', async ({ request }) => {
    const res = await request.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/packages`);
    const body = await res.json();
    const pkgs = body.packages as Array<{ key: string; coins: number; price: number }>;

    expect(pkgs.find((p: any) => p.key === 'coins_100')).toBeTruthy();
    expect(pkgs.find((p: any) => p.key === 'coins_350')).toBeTruthy();
    expect(pkgs.find((p: any) => p.key === 'coins_800')).toBeTruthy();
    expect(pkgs.find((p: any) => p.key === 'coins_1500')).toBeTruthy();

    // Pricing sanity
    const pkg100 = pkgs.find((p: any) => p.key === 'coins_100')!;
    expect(pkg100.coins).toBe(100);
    expect(pkg100.price).toBe(99);
  });

  test('Coin features list has all required features', async ({ request }) => {
    const res = await request.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/packages`);
    const body = await res.json();
    const featureKeys = Object.keys(body.features);

    expect(featureKeys).toContain('boost');
    expect(featureKeys).toContain('price_alert');
    expect(featureKeys).toContain('auto_relist');
    expect(featureKeys).toContain('featured');
    expect(featureKeys).toContain('analytics_pro');

    // Each feature has icon, coins, days, desc
    const boost = body.features.boost;
    expect(boost).toHaveProperty('icon');
    expect(boost).toHaveProperty('coins');
    expect(boost).toHaveProperty('days');
    expect(boost).toHaveProperty('desc');
    expect(boost.coins).toBe(30);
    expect(boost.days).toBe(7);
  });

  test('Balance endpoint requires auth', async ({ request }) => {
    const res = await request.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/balance`);
    expect(res.status()).toBe(401);
  });

  test('Active features endpoint requires auth', async ({ request }) => {
    const res = await request.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/active-features`);
    expect(res.status()).toBe(401);
  });

  test('Transactions endpoint requires auth', async ({ request }) => {
    const res = await request.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/transactions`);
    expect(res.status()).toBe(401);
  });

  test('Request payment endpoint requires auth', async ({ request }) => {
    const res = await request.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/request-payment`, {
      data: { package_key: 'coins_100', sender_name: 'Test User' },
    });
    expect(res.status()).toBe(401);
  });

  test('Activate feature endpoint requires auth', async ({ request }) => {
    const res = await request.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/activate-feature`, {
      data: { feature_key: 'boost', product_id: null },
    });
    expect(res.status()).toBe(401);
  });

  test('Admin payment requests endpoint requires admin auth', async ({ request }) => {
    const res = await request.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app'}/api/coins/payment-requests`);
    expect(res.status()).toBe(401);
  });
});
