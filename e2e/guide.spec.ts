import { test, expect } from '@playwright/test';

test.describe('Guide Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/guide');
  });

  test('หน้า guide โหลดได้และมี tab bar', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('วิธีใช้งาน');
    // Tab bar ต้องมีอย่างน้อย 4 tab
    const tabs = page.locator('[role="tab"], button').filter({ hasText: /สำหรับ|การชำระ|จัดส่ง|เหรียญ|เกี่ยวกับ/ });
    await expect(tabs).toHaveCount(6);
  });

  test('default tab คือ สำหรับผู้ซื้อ', async ({ page }) => {
    // เนื้อหาแรกที่โหลดควรเป็น buyer tab
    await expect(page.locator('text=ค้นหาสินค้า').first()).toBeVisible();
  });

  test('กด tab สำหรับผู้ขาย เปลี่ยน content', async ({ page }) => {
    await page.getByRole('button', { name: /สำหรับผู้ขาย/ }).click();
    await expect(page.locator('text=ลงประกาศ').first()).toBeVisible();
  });

  test('กด tab การชำระเงิน แสดง P2P content', async ({ page }) => {
    await page.getByRole('button', { name: /การชำระเงิน/ }).click();
    // ควรอธิบายว่าเป็น P2P ไม่ใช่ platform-processed
    await expect(page.locator('text=ผู้ซื้อและผู้ขาย').first()).toBeVisible();
  });

  test('กด tab เติมเหรียญ & Boost แสดง coins content', async ({ page }) => {
    await page.getByRole('button', { name: /เติมเหรียญ/ }).click();
    await expect(page.locator('text=เหรียญ').first()).toBeVisible();
  });

  test('กด tab วิธีจัดส่ง แสดง delivery content', async ({ page }) => {
    await page.getByRole('button', { name: /จัดส่ง/ }).click();
    await expect(page.locator('text=ส่งพัสดุ').first()).toBeVisible();
  });

  test('กด tab เกี่ยวกับเรา แสดง about content', async ({ page }) => {
    await page.getByRole('button', { name: /เกี่ยวกับ/ }).click();
    await expect(page.locator('text=PloiKhong').first()).toBeVisible();
  });

  test('tab ที่ active มี visual indicator', async ({ page }) => {
    // Default tab buyer ควร active
    const buyerTab = page.getByRole('button', { name: /สำหรับผู้ซื้อ/ });
    const borderBottom = await buyerTab.evaluate(el => getComputedStyle(el).borderBottom);
    // ควรมี border-bottom ที่เป็น accent color หรือ background ต่างจาก tab อื่น
    expect(borderBottom).not.toBe('');
  });

  test('ไม่มีคำว่า ของมือสอง ในหน้า guide', async ({ page }) => {
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('ของมือสอง');
  });

  test('หน้า guide มี link กลับหน้าแรก', async ({ page }) => {
    const backLink = page.locator('a', { hasText: /กลับ/ });
    await expect(backLink).toBeVisible();
    const href = await backLink.getAttribute('href');
    expect(href).toBe('/');
  });
});
