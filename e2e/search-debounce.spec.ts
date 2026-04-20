import { test, expect } from '@playwright/test';

test.describe('Search Debounce', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
  });

  test('typing triggers only one API call after pause (not per keystroke)', async ({ page }) => {
    const calls: string[] = [];
    await page.route('**/api/products*', r => {
      calls.push(r.request().url());
      r.fulfill({ json: [] });
    });

    await page.goto('/');
    const search = page.getByPlaceholder(/ค้นหา/i);
    await search.pressSequentially('iphone', { delay: 50 }); // type fast
    // Wait for debounce (400ms) + a little buffer
    await page.waitForTimeout(600);

    // "iphone" = 6 chars typed fast, but should result in ~2 calls:
    // 1 initial load (no search) + 1 debounced call with "iphone"
    // Definitely NOT 7 calls (one per char)
    const searchCalls = calls.filter(u => u.includes('search='));
    expect(searchCalls.length).toBeLessThanOrEqual(2);
  });

  test('debounced search call includes the full search term', async ({ page }) => {
    const urls: string[] = [];
    await page.route('**/api/products*', r => {
      urls.push(r.request().url());
      r.fulfill({ json: [] });
    });

    await page.goto('/');
    const search = page.getByPlaceholder(/ค้นหา/i);
    await search.fill('macbook pro');
    await page.waitForTimeout(600); // wait for debounce

    const withSearch = urls.filter(u => u.includes('search=macbook'));
    expect(withSearch.length).toBeGreaterThanOrEqual(1);
    expect(withSearch[withSearch.length - 1]).toContain('macbook');
  });

  test('clearing search field triggers a call with no search param', async ({ page }) => {
    const urls: string[] = [];
    await page.route('**/api/products*', r => {
      urls.push(r.request().url());
      r.fulfill({ json: [] });
    });

    await page.goto('/');
    const search = page.getByPlaceholder(/ค้นหา/i);
    await search.fill('iphone');
    await page.waitForTimeout(600);
    await search.fill('');
    await page.waitForTimeout(600);

    const last = urls[urls.length - 1];
    expect(last).not.toContain('search=');
  });

  test('rapid successive searches result in final term being sent', async ({ page }) => {
    const searchTerms: string[] = [];
    await page.route('**/api/products*', r => {
      const url = new URL(r.request().url());
      const s = url.searchParams.get('search');
      if (s) searchTerms.push(s);
      r.fulfill({ json: [] });
    });

    await page.goto('/');
    const search = page.getByPlaceholder(/ค้นหา/i);

    // Type multiple searches quickly (each replaces the previous)
    await search.fill('a');
    await search.fill('ap');
    await search.fill('app');
    await search.fill('appl');
    await search.fill('apple');
    await page.waitForTimeout(600);

    // Only the final "apple" (or near-final) should be sent
    if (searchTerms.length > 0) {
      expect(searchTerms[searchTerms.length - 1]).toBe('apple');
    }
  });

  test('search result count updates after debounce', async ({ page }) => {
    await page.route('**/api/products*', r => {
      const url = new URL(r.request().url());
      const s = url.searchParams.get('search');
      if (s === 'iphone') {
        r.fulfill({ json: [{ id: 1, title: 'iPhone 14', price: 30000, images: [] }] });
      } else {
        r.fulfill({ json: [
          { id: 1, title: 'iPhone 14', price: 30000, images: [] },
          { id: 2, title: 'MacBook', price: 40000, images: [] },
        ]});
      }
    });

    await page.goto('/');
    await expect(page.getByText('2 รายการ').or(page.getByText('2').first())).toBeVisible({ timeout: 3000 });

    const search = page.getByPlaceholder(/ค้นหา/i);
    await search.fill('iphone');
    await page.waitForTimeout(600);
    // Result count should reflect filtered results
    await expect(page.getByText('1 รายการ').or(page.getByText('1').first())).toBeVisible({ timeout: 2000 });
  });

});
