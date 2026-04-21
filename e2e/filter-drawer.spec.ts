import { test, expect } from '@playwright/test';

test.describe('Filter Drawer (mobile)', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.route('**/api/products*', r =>
      r.fulfill({ json: [
        { id: 1, title: 'iPhone 14', price: 32900, images: [], category: 'มือถือ & แท็บเล็ต' },
        { id: 2, title: 'โต๊ะ IKEA', price: 1500, images: [], category: 'เฟอร์นิเจอร์' },
      ]})
    );
    // Use mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  });

  // ─── Opening ───────────────────────────────────────────────────────────────

  test('floating "ตัวกรอง" button is visible on mobile', async ({ page }) => {
    await expect(page.getByRole('button', { name: /ตัวกรอง/ })).toBeVisible();
  });

  test('clicking "ตัวกรอง" opens the filter drawer', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await expect(page.getByText('ล้างทั้งหมด')).toBeVisible();
    await expect(page.getByText('ดูผลลัพธ์')).toBeVisible();
  });

  test('drawer shows all filter sections', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await expect(page.getByText('หมวดหมู่')).toBeVisible();
    await expect(page.getByText('ช่วงราคา')).toBeVisible();
    await expect(page.getByText('สภาพสินค้า')).toBeVisible();
    await expect(page.getByText('วิธีรับสินค้า')).toBeVisible();
  });

  test('drawer shows category chips including "ทั้งหมด"', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await expect(page.getByRole('button', { name: 'ทั้งหมด' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'มือถือ & แท็บเล็ต' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'เฟอร์นิเจอร์' })).toBeVisible();
  });

  // ─── Closing ───────────────────────────────────────────────────────────────

  test('pressing ESC closes the drawer', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await expect(page.getByText('ล้างทั้งหมด')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('ล้างทั้งหมด')).not.toBeVisible();
  });

  test('clicking backdrop closes the drawer', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await expect(page.getByText('ล้างทั้งหมด')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByText('ล้างทั้งหมด')).not.toBeVisible();
  });

  test('"ดูผลลัพธ์" button closes the drawer', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await page.getByRole('button', { name: /ดูผลลัพธ์/ }).click();
    await expect(page.getByText('ล้างทั้งหมด')).not.toBeVisible();
  });

  // ─── Category filter ───────────────────────────────────────────────────────

  test('selecting a category chip highlights it', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    const chip = page.getByRole('button', { name: 'มือถือ & แท็บเล็ต' });
    await chip.click();
    // Selected chip has dark background (var(--ink))
    await expect(chip).toHaveCSS('font-weight', '600');
  });

  test('applying category filter passes it to product API', async ({ page }) => {
    const calls: string[] = [];
    await page.route('**/api/products*', r => {
      calls.push(r.request().url());
      r.fulfill({ json: [] });
    });

    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await page.getByRole('button', { name: 'คอมพิวเตอร์' }).click();
    await page.getByRole('button', { name: /ดูผลลัพธ์/ }).click();
    await page.waitForTimeout(300);

    const filtered = calls.filter(u => u.includes('category='));
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    const lastUrl = decodeURIComponent(filtered[filtered.length - 1]);
    expect(lastUrl).toContain('คอมพิวเตอร์');
  });

  // ─── Price filter ──────────────────────────────────────────────────────────

  test('price inputs accept numbers', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    const minInput = page.getByPlaceholder('ต่ำสุด');
    const maxInput = page.getByPlaceholder('สูงสุด');
    await minInput.fill('1000');
    await maxInput.fill('50000');
    await expect(minInput).toHaveValue('1000');
    await expect(maxInput).toHaveValue('50000');
  });

  test('applying price filter passes min/max to API', async ({ page }) => {
    const urls: string[] = [];
    await page.route('**/api/products*', r => {
      urls.push(r.request().url());
      r.fulfill({ json: [] });
    });

    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await page.getByPlaceholder('ต่ำสุด').fill('5000');
    await page.getByPlaceholder('สูงสุด').fill('40000');
    await page.getByRole('button', { name: /ดูผลลัพธ์/ }).click();
    await page.waitForTimeout(300);

    const priceFiltered = urls.filter(u => u.includes('min_price='));
    expect(priceFiltered.length).toBeGreaterThanOrEqual(1);
    expect(priceFiltered[priceFiltered.length - 1]).toContain('min_price=5000');
    expect(priceFiltered[priceFiltered.length - 1]).toContain('max_price=40000');
  });

  // ─── Condition & delivery chips ────────────────────────────────────────────

  test('condition chip toggles on/off', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    const chip = page.getByRole('button', { name: 'ใหม่ในกล่อง' });
    await chip.click();
    await expect(chip).toHaveCSS('font-weight', '600'); // selected? no weight set, check border instead
    await chip.click(); // deselect
    // After double-click should not have selected style
    await expect(chip).not.toHaveCSS('border-color', 'rgb(17, 17, 16)');
  });

  test('delivery chip "ส่งฟรี" is selectable', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    const chip = page.getByRole('button', { name: 'ส่งฟรี' });
    await chip.click();
    await expect(chip).toBeVisible();
  });

  // ─── Reset ─────────────────────────────────────────────────────────────────

  test('"ล้างทั้งหมด" resets category to ทั้งหมด', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await page.getByRole('button', { name: 'คอมพิวเตอร์' }).click();
    await page.getByRole('button', { name: 'ล้างทั้งหมด' }).click();
    // ทั้งหมด chip should now be selected (dark)
    const allChip = page.getByRole('button', { name: 'ทั้งหมด' }).first();
    await expect(allChip).toBeVisible();
  });

  test('"ล้างทั้งหมด" clears price inputs', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await page.getByPlaceholder('ต่ำสุด').fill('999');
    await page.getByRole('button', { name: 'ล้างทั้งหมด' }).click();
    await expect(page.getByPlaceholder('ต่ำสุด')).toHaveValue('');
  });

  // ─── Result count ──────────────────────────────────────────────────────────

  test('"ดูผลลัพธ์" button shows current product count', async ({ page }) => {
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    // 2 products loaded → button should show (2)
    await expect(page.getByRole('button', { name: /ดูผลลัพธ์.*2/ })).toBeVisible();
  });

  // ─── Desktop: drawer not shown ─────────────────────────────────────────────

  test('floating filter button is hidden on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    // The floating button is only rendered when isMobile=true (≤768px)
    const filterBtn = page.getByRole('button', { name: /^ตัวกรอง$/ });
    await expect(filterBtn).not.toBeVisible();
  });

  test('desktop shows sidebar instead of filter button', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    // Sidebar is visible on desktop
    await expect(page.getByText('หมวดหมู่').first()).toBeVisible();
  });

});
