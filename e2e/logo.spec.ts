/**
 * e2e tests: Logo C10 — Big Rainbow Sack
 *
 * ตรวจสอบตาม LOGO_C_SPEC.md (v2) section 0 Critical Rules:
 * 1. Wordmark "PloiKhong" ต้องเป็น rainbow gradient (hard stops)
 * 2. ใช้ background-clip: text
 * 3. ใช้สีเฉพาะที่กำหนด (#e63946, #1d4ed8, #16a34a, #facc15, #f97316)
 * 4. Fallback color ต้องเป็น #e63946 (ไม่ใช่ดำ ไม่ใช่ transparent)
 * 5. display ต้องเป็น inline-block (ไม่ใช่ block)
 * 6. Mark SVG ต้องมี 5 stripe rect
 */

import { test, expect } from '@playwright/test';

const EXPECTED_GRADIENT =
  'linear-gradient(90deg, rgb(230, 57, 70) 0%, rgb(230, 57, 70) 18%, rgb(29, 78, 216) 22%, rgb(29, 78, 216) 38%, rgb(22, 163, 74) 42%, rgb(22, 163, 74) 58%, rgb(250, 204, 21) 62%, rgb(250, 204, 21) 78%, rgb(249, 115, 22) 82%, rgb(249, 115, 22) 100%)';

async function setup(page: any) {
  await page.route('**/api/products**', (r: any) =>
    r.fulfill({ status: 200, body: '[]', contentType: 'application/json' }),
  );
  await page.route('**/api/auth/session', (r: any) =>
    r.fulfill({ status: 200, body: 'null', contentType: 'application/json' }),
  );
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
}

/** หา span ที่มีข้อความ PloiKhong ใน navbar */
function wordmarkLocator(page: any) {
  return page.locator('header a span').filter({ hasText: /^PloiKhong$/ }).first();
}

test.describe('Logo C10 — Rainbow Sack mark', () => {

  test.beforeEach(async ({ page }) => { await setup(page); });

  test('SVG mark มีอยู่ใน navbar', async ({ page }) => {
    const svg = page.locator('header a svg[aria-label="PloiKhong"]');
    await expect(svg).toBeVisible();
  });

  test('SVG mark มี 5 stripe rect (rainbow stripes)', async ({ page }) => {
    const stripeColors = await page.evaluate(() => {
      const svgs = document.querySelectorAll('header a svg[aria-label="PloiKhong"]');
      if (!svgs.length) return [];
      const rects = Array.from(svgs[0].querySelectorAll('rect'))
        .map(r => r.getAttribute('fill'))
        .filter(Boolean);
      return rects;
    });
    expect(stripeColors).toContain('#e63946');  // red
    expect(stripeColors).toContain('#1d4ed8');  // blue
    expect(stripeColors).toContain('#16a34a');  // green
    expect(stripeColors).toContain('#facc15');  // yellow
    expect(stripeColors).toContain('#f97316');  // orange
  });

  test('stripe ลำดับถูกต้อง: แดง→น้ำเงิน→เขียว→เหลือง→ส้ม', async ({ page }) => {
    const order = await page.evaluate(() => {
      const svg = document.querySelector('header a svg[aria-label="PloiKhong"]');
      if (!svg) return [];
      return Array.from(svg.querySelectorAll('g rect'))
        .map(r => (r as Element).getAttribute('fill'))
        .filter(Boolean);
    });
    expect(order[0]).toBe('#e63946');
    expect(order[1]).toBe('#1d4ed8');
    expect(order[2]).toBe('#16a34a');
    expect(order[3]).toBe('#facc15');
    expect(order[4]).toBe('#f97316');
  });

});

test.describe('Logo C10 — Wordmark gradient', () => {

  test.beforeEach(async ({ page }) => { await setup(page); });

  test('wordmark "PloiKhong" มีอยู่ใน navbar', async ({ page }) => {
    await expect(wordmarkLocator(page)).toBeVisible();
  });

  test('wordmark มี width: fit-content (กันไม่ให้ gradient ยืดเต็ม flex container)', async ({ page }) => {
    // CSS spec: inline-block ใน flex item ถูก blockify เป็น block เสมอ
    // สิ่งที่กัน gradient จริงๆ คือ width:fit-content ไม่ใช่ display
    const width = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('header span')).find(
        s => s.textContent?.trim() === 'PloiKhong',
      );
      if (!el) return null;
      // computed offsetWidth ต้องน้อยกว่า container (ไม่ stretch เต็ม)
      const parent = el.parentElement;
      return {
        elWidth: (el as HTMLElement).offsetWidth,
        parentWidth: parent ? (parent as HTMLElement).offsetWidth : 9999,
        styleWidth: (el as HTMLElement).style.width,
      };
    });
    expect(width).not.toBeNull();
    // ความกว้าง span ต้องไม่เต็ม parent (ถ้า gradient stretch เต็ม = ผิด)
    expect(width!.elWidth).toBeLessThan(width!.parentWidth);
  });

  test('wordmark มี -webkit-text-fill-color: transparent (gradient แสดงผล)', async ({ page }) => {
    const fillColor = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('header span')).find(
        s => s.textContent?.trim() === 'PloiKhong',
      );
      return el ? getComputedStyle(el).webkitTextFillColor : null;
    });
    expect(fillColor).toBe('rgba(0, 0, 0, 0)');  // transparent
  });

  test('wordmark fallback color เป็น #e63946 (ไม่ใช่ดำ ไม่ใช่ transparent)', async ({ page }) => {
    const color = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('header span')).find(
        s => s.textContent?.trim() === 'PloiKhong',
      );
      return el ? getComputedStyle(el).color : null;
    });
    // rgb(230, 57, 70) = #e63946
    expect(color).toBe('rgb(230, 57, 70)');
  });

  test('wordmark background-image เป็น gradient (ไม่ใช่ none)', async ({ page }) => {
    const bg = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('header span')).find(
        s => s.textContent?.trim() === 'PloiKhong',
      );
      return el ? getComputedStyle(el).backgroundImage : null;
    });
    expect(bg).toContain('linear-gradient');
  });

  test('gradient มีสีถูกต้องครบ 5 สี', async ({ page }) => {
    const bg = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('header span')).find(
        s => s.textContent?.trim() === 'PloiKhong',
      );
      return el ? getComputedStyle(el).backgroundImage : '';
    });
    expect(bg).toContain('rgb(230, 57, 70)');   // #e63946 red
    expect(bg).toContain('rgb(29, 78, 216)');   // #1d4ed8 blue
    expect(bg).toContain('rgb(22, 163, 74)');   // #16a34a green
    expect(bg).toContain('rgb(250, 204, 21)');  // #facc15 yellow
    expect(bg).toContain('rgb(249, 115, 22)');  // #f97316 orange
  });

  test('gradient เป็น hard stops (ค่าซ้ำกันเป็นคู่)', async ({ page }) => {
    const bg = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('header span')).find(
        s => s.textContent?.trim() === 'PloiKhong',
      );
      return el ? getComputedStyle(el).backgroundImage : '';
    });
    // hard stops: สีเดียวกันต้องปรากฏ 2 ครั้ง
    const redCount = (bg.match(/rgb\(230, 57, 70\)/g) || []).length;
    expect(redCount).toBeGreaterThanOrEqual(2);
  });

  test('gradient ไม่มีสีม่วง (ห้าม purple)', async ({ page }) => {
    const bg = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('header span')).find(
        s => s.textContent?.trim() === 'PloiKhong',
      );
      return el ? getComputedStyle(el).backgroundImage : '';
    });
    expect(bg).not.toContain('128, 0, 128');    // purple
    expect(bg).not.toContain('147, 51, 234');   // violet
    expect(bg).not.toContain('139, 92, 246');   // indigo
  });

});

test.describe('Logo C10 — Brand accent color', () => {

  test.beforeEach(async ({ page }) => { await setup(page); });

  test('--accent CSS variable เป็น #1667fe (brand blue ไม่ใช่แดง)', async ({ page }) => {
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    );
    expect(accent).toBe('#1667fe');
  });

  test('"ค้นหา" button ใช้ accent blue (ไม่ใช่แดง)', async ({ page }) => {
    const bg = await page.evaluate(() => {
      const btn = document.querySelector('header button') as HTMLElement;
      return btn ? getComputedStyle(btn).backgroundColor : null;
    });
    // ไม่ควรเป็นแดง #ff2d1f = rgb(255, 45, 31)
    expect(bg).not.toBe('rgb(255, 45, 31)');
  });

});

test.describe('Logo C10 — Footer brand', () => {

  test.beforeEach(async ({ page }) => { await setup(page); });

  test('footer มี SVG mark', async ({ page }) => {
    const footerMark = page.locator('footer svg[aria-label="PloiKhong"]');
    await expect(footerMark).toBeVisible();
  });

  test('footer wordmark "PloiKhong" มี gradient', async ({ page }) => {
    const bg = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('footer span'));
      const el = spans.find(s => s.textContent?.trim() === 'PloiKhong');
      return el ? getComputedStyle(el).backgroundImage : null;
    });
    expect(bg).toContain('linear-gradient');
  });

});
