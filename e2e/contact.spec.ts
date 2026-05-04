import { test, expect } from '@playwright/test';

test.describe('Contact Page (DBD compliance)', () => {

  test('contact page loads with business info', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('ติดต่อเรา');
    // Wait for client-side data fetch
    await page.waitForSelector('[data-testid="contact-info"]', { timeout: 15000 });

    const text = await page.locator('[data-testid="contact-info"]').textContent();
    expect(text).toBeTruthy();
    // Must include the registered business name (correct brand)
    expect(text).toContain('PloiKhong');
    // Must NOT contain the old wrong brand name
    expect(text).not.toContain('ขายคล่อง');
  });

  test('contact page exposes owner, address, phone, email', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('[data-testid="contact-info"]', { timeout: 15000 });
    const text = await page.locator('[data-testid="contact-info"]').textContent() || '';
    // DBD required: ผู้ประกอบการ + ที่อยู่ + เบอร์โทร + อีเมล
    expect(text).toContain('ผู้ประกอบการ');
    expect(text).toContain('ที่อยู่');
    expect(text).toContain('เบอร์โทรศัพท์');
    expect(text).toContain('อีเมล');
  });

  test('edit button hidden for non-admin users', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('[data-testid="contact-info"]', { timeout: 15000 });
    // Anonymous user → no edit button
    const editBtn = page.getByRole('button', { name: /แก้ไข/ });
    await expect(editBtn).toHaveCount(0);
  });

  test('contact page has back link to home', async ({ page }) => {
    await page.goto('/contact');
    const backLink = page.locator('a', { hasText: /กลับหน้าหลัก/ });
    await expect(backLink).toBeVisible();
    expect(await backLink.getAttribute('href')).toBe('/');
  });

  test('home footer links to /contact', async ({ page }) => {
    await page.goto('/');
    // The footer has a "ข้อมูลผู้ประกอบการ" link to /contact
    const link = page.locator('a[href="/contact"]', { hasText: /ข้อมูลผู้ประกอบการ/ });
    await expect(link.first()).toBeVisible();
  });

  test('home footer no longer shows fake social links (Facebook/Twitter)', async ({ page }) => {
    await page.goto('/');
    // The hardcoded fake social links were removed in this change
    const facebook = page.locator('a[href*="facebook.com/ploikhong"]');
    const twitter = page.locator('a[href*="twitter.com/ploikhong"]');
    await expect(facebook).toHaveCount(0);
    await expect(twitter).toHaveCount(0);
  });

});
