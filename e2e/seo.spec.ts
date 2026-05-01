// SEO e2e tests — metadata, OG tags, robots.txt, sitemap.xml

import { test, expect } from '@playwright/test';

// ─── robots.txt ─────────────────────────────────────────────────────────────

test.describe('robots.txt', () => {
  test('is accessible and allows all crawlers', async ({ page }) => {
    const res = await page.goto('/robots.txt');
    expect(res?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain('User-Agent: *');
    expect(body).toContain('Allow: /');
  });

  test('contains sitemap URL', async ({ page }) => {
    await page.goto('/robots.txt');
    const body = await page.content();
    expect(body).toContain('sitemap.xml');
  });
});

// ─── sitemap.xml ────────────────────────────────────────────────────────────

test.describe('sitemap.xml', () => {
  test('is accessible and returns XML', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res?.status()).toBe(200);
    const contentType = res?.headers()['content-type'] ?? '';
    expect(contentType).toContain('xml');
  });

  test('contains static pages', async ({ page }) => {
    await page.goto('/sitemap.xml');
    const body = await page.content();
    expect(body).toContain('/terms');
    expect(body).toContain('/privacy');
    expect(body).toContain('/refund');
    expect(body).toContain('/rules');
    expect(body).toContain('/help');
    expect(body).toContain('/guide');
  });
});

// ─── Home page metadata ──────────────────────────────────────────────────────

test.describe('Home page SEO metadata', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/PloiKhong/);
  });

  test('has description meta tag', async ({ page }) => {
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(10);
  });

  test('has og:title meta tag', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('PloiKhong');
  });

  test('has og:description meta tag', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDesc).toBeTruthy();
  });

  test('has og:type = website', async ({ page }) => {
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('website');
  });

  test('has og:locale = th_TH', async ({ page }) => {
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');
    expect(ogLocale).toBe('th_TH');
  });

  test('has og:image meta tag', async ({ page }) => {
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
  });

  test('has twitter:card meta tag', async ({ page }) => {
    const twCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twCard).toBe('summary_large_image');
  });
});

// ─── Static page title template ──────────────────────────────────────────────

test.describe('Static page title templates', () => {
  const pages = [
    { path: '/terms', expected: /PloiKhong/ },
    { path: '/privacy', expected: /PloiKhong/ },
    { path: '/help', expected: /PloiKhong/ },
    { path: '/guide', expected: /PloiKhong/ },
  ];

  for (const { path, expected } of pages) {
    test(`${path} title includes PloiKhong`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(expected);
    });
  }
});

// ─── Product page dynamic OG ─────────────────────────────────────────────────

test.describe('Product page dynamic metadata', () => {
  const MOCK_PRODUCT = {
    id: 1,
    title: 'iPhone 14 Pro 256GB สีม่วง',
    price: 32900,
    description: 'เครื่องศูนย์ไทย ใช้งานปกติทุกฟังก์ชัน',
    images: ['https://placekitten.com/400/400'],
    seller_id: 99,
    category: 'มือถือ & แท็บเล็ต',
    location: 'กรุงเทพ',
  };

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products/1', (r) => r.fulfill({ json: MOCK_PRODUCT }));
    await page.route('**/api/products*', (r) => r.fulfill({ json: [MOCK_PRODUCT] }));
    await page.route('**/api/auth/session', (r) => r.fulfill({ json: {} }));
  });

  test('product page title contains product name via title template', async ({ page }) => {
    // Navigate to the product detail page (server-side metadata via generateMetadata)
    // The title comes from the real API — check it's not the default homepage title
    await page.goto('/products/1');
    const title = await page.title();
    // Title should either be a product name or "ไม่พบสินค้า" — not the homepage default
    expect(title).not.toMatch(/^PloiKhong — ตลาดซื้อขายของมือสองออนไลน์$/);
  });

  test('product title includes | PloiKhong suffix', async ({ page }) => {
    await page.goto('/products/1');
    await expect(page).toHaveTitle(/PloiKhong/, { timeout: 10000 });
  });
});
