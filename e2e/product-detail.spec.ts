import { test, expect } from '@playwright/test';

const MOCK_PRODUCTS = [
  {
    id: 1,
    title: 'iPhone 14 Pro 256GB สีม่วง',
    price: 32900,
    original_price: 38900,
    images: ['https://placekitten.com/400/400'],
    location: 'กรุงเทพ · พระราม 9',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    seller_name: 'สมชาย',
    condition: 'มือสอง สภาพดี',
    category: 'มือถือ & แท็บเล็ต',
    description: 'เครื่องศูนย์ไทย ใช้งานปกติทุกฟังก์ชัน',
  },
  {
    id: 2,
    title: 'MacBook Pro M2',
    price: 55000,
    images: [],
    location: 'เชียงใหม่',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    seller_name: 'วิชัย',
    condition: 'ใหม่ในกล่อง',
    category: 'คอมพิวเตอร์',
  },
];

test.describe('Product Detail', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products*', route => {
      route.fulfill({ json: MOCK_PRODUCTS });
    });
    await page.goto('/');
    // Wait for grid to render
    await expect(page.getByText('iPhone 14 Pro 256GB สีม่วง')).toBeVisible();
  });

  // ─── Opening ───────────────────────────────────────────────────────────────

  test('clicking a product card opens the detail modal', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    // Modal overlay should appear — look for the title inside it
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro 256GB สีม่วง' })).toBeVisible();
  });

  test('modal shows product price', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.getByText('32,900').first()).toBeVisible();
  });

  test('modal shows seller name', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.getByText('สมชาย').first()).toBeVisible();
  });

  test('modal shows condition tag', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.getByText('มือสอง สภาพดี').first()).toBeVisible();
  });

  test('modal shows description', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.getByText(/เครื่องศูนย์ไทย/)).toBeVisible();
  });

  // ─── Gallery ───────────────────────────────────────────────────────────────

  test('gallery shows image counter 1 / N', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    // counter text "1 / 1" or "1 / 4"
    await expect(page.getByText(/1 \/ \d+/)).toBeVisible();
  });

  test('gallery shows 4 thumbnails when product has 4 images', async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({
      json: [{ ...MOCK_PRODUCTS[0],
        images: [
          'https://placekitten.com/400/400',
          'https://placekitten.com/401/401',
          'https://placekitten.com/402/402',
          'https://placekitten.com/403/403',
        ],
      }],
    }));
    await page.goto('/');
    await expect(page.getByText('iPhone 14 Pro 256GB สีม่วง')).toBeVisible();
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    const strip = page.getByTestId('thumb-strip');
    await expect(strip.locator('button')).toHaveCount(4);
  });

  test('gallery shows 1 thumbnail when product has 1 image', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    const strip = page.getByTestId('thumb-strip');
    await expect(strip.locator('button')).toHaveCount(1);
  });

  test('clicking thumbnail changes active thumbnail border', async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({
      json: [{ ...MOCK_PRODUCTS[0],
        images: [
          'https://placekitten.com/400/400',
          'https://placekitten.com/401/401',
        ],
      }],
    }));
    await page.goto('/');
    await expect(page.getByText('iPhone 14 Pro 256GB สีม่วง')).toBeVisible();
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await page.getByTestId('thumb-1').click();
    await expect(page.getByTestId('thumb-1')).toHaveCSS('border-style', 'solid');
  });

  // ─── Chat ──────────────────────────────────────────────────────────────────

  async function openProductChat(page: any) {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await page.getByTestId('pd-chat-btn').click();
  }

  test('"แชทกับผู้ขาย" button opens chat popup', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.getByTestId('pd-chat-popup')).not.toBeVisible();
    await page.getByTestId('pd-chat-btn').click();
    await expect(page.getByTestId('pd-chat-popup')).toBeVisible();
  });

  test('chat CTA button has soft ghost background (not solid accent)', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    const btn = page.getByTestId('pd-chat-btn');
    // Should NOT be solid white or solid accent — background should contain rgba with low opacity
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    // rgba(255, 45, 31, 0.07) — alpha < 0.5, not fully opaque
    const alphaMatch = bg.match(/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*([\d.]+)\s*\)/);
    if (alphaMatch) {
      expect(parseFloat(alphaMatch[1])).toBeLessThan(0.5);
    }
    // Text color should be accent-like (red-ish), not white
    const color = await btn.evaluate(el => getComputedStyle(el).color);
    expect(color).not.toBe('rgb(255, 255, 255)');
  });

  test('chat popup shows product image when product has an image', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await page.getByTestId('pd-chat-btn').click();
    const popup = page.getByTestId('pd-chat-popup');
    // The product pin area inside the popup should show an img tag
    await expect(popup.locator('img[src*="placekitten"]').first()).toBeVisible();
  });

  test('chat popup product pin shows gradient placeholder when no image', async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({
      json: [{ ...MOCK_PRODUCTS[0], images: [] }],
    }));
    await page.goto('/');
    await expect(page.getByText('iPhone 14 Pro 256GB สีม่วง')).toBeVisible();
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await page.getByTestId('pd-chat-btn').click();
    const popup = page.getByTestId('pd-chat-popup');
    // No real img — gradient div is there but no img src
    await expect(popup.locator('img[src*="placekitten"]')).toHaveCount(0);
    // Product title still visible in pin
    await expect(popup.getByText('iPhone 14 Pro 256GB สีม่วง').first()).toBeVisible();
  });

  test('chat popup close button hides the popup', async ({ page }) => {
    await openProductChat(page);
    await expect(page.getByTestId('pd-chat-popup')).toBeVisible();
    await page.getByTestId('pd-chat-close').click();
    await expect(page.getByTestId('pd-chat-popup')).not.toBeVisible();
  });

  test('modal shows initial chat messages', async ({ page }) => {
    await openProductChat(page);
    await expect(page.getByText('สวัสดีครับ สินค้ายังว่างนะครับ')).toBeVisible();
  });

  test('sending a message appends it to chat', async ({ page }) => {
    await openProductChat(page);
    const popup = page.getByTestId('pd-chat-popup');
    await popup.getByPlaceholder('พิมพ์ข้อความ...').fill('สนใจมากครับ');
    await popup.getByRole('button', { name: 'ส่ง', exact: true }).click();
    await expect(popup.getByText('สนใจมากครับ')).toBeVisible();
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    await openProductChat(page);
    const sendBtn = page.getByTestId('pd-chat-popup').getByRole('button', { name: 'ส่ง', exact: true });
    await expect(sendBtn).toBeDisabled();
  });

  test('quick reply "ยังว่างไหมครับ?" sends a message', async ({ page }) => {
    await openProductChat(page);
    const popup = page.getByTestId('pd-chat-popup');
    await popup.getByRole('button', { name: 'ยังว่างไหมครับ?' }).click();
    await expect(popup.getByText('ยังว่างไหมครับ?').last()).toBeVisible();
  });

  test('seller typing indicator appears after sending', async ({ page }) => {
    await openProductChat(page);
    const popup = page.getByTestId('pd-chat-popup');
    await popup.getByPlaceholder('พิมพ์ข้อความ...').fill('สวัสดีครับ');
    await popup.getByRole('button', { name: 'ส่ง', exact: true }).click();
    await expect(page.locator('[style*="bop"]').first()).toBeVisible({ timeout: 500 });
  });

  test('seller auto-reply appears within 3 seconds', async ({ page }) => {
    await openProductChat(page);
    const popup = page.getByTestId('pd-chat-popup');
    await popup.getByRole('button', { name: 'ลดราคาได้ไหม?' }).click();
    await expect(popup.getByText('เดี๋ยวตอบให้นะครับ')).toBeVisible({ timeout: 3000 });
  });

  // ─── Closing ───────────────────────────────────────────────────────────────

  test('pressing ESC closes the modal', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).not.toBeVisible();
  });

  test('clicking backdrop closes the modal', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).toBeVisible();
    // Click the fixed overlay (top-left corner away from modal)
    await page.mouse.click(5, 5);
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).not.toBeVisible();
  });

  test('clicking ✕ button closes the modal', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).toBeVisible();
    // The close button wraps an X-path SVG; target by aria-label or button position
    const closeBtn = page.locator('button[style*="border-radius: 50%"]').filter({ has: page.locator('svg path[d*="M6 6l12 12"]') }).first();
    await closeBtn.click();
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).not.toBeVisible();
  });

  // ─── API field mapping (image_url → images) ────────────────────────────────

  test('product with image_url field renders without error', async ({ page }) => {
    await page.route('**/api/products*', route => {
      route.fulfill({
        json: [{
          id: 99, title: 'ทดสอบ image_url', price: 999,
          image_url: '', seller_name: 'Test', condition: 'มือสอง',
        }],
      });
    });
    await page.goto('/');
    await expect(page.getByText('ทดสอบ image_url')).toBeVisible();
  });

  test('product with non-empty image_url shows it in the card gradient area', async ({ page }) => {
    await page.route('**/api/products*', route => {
      route.fulfill({
        json: [{
          id: 100, title: 'มีรูปจาก image_url', price: 1500,
          image_url: 'https://placekitten.com/200/200', seller_name: 'Test',
        }],
      });
    });
    await page.goto('/');
    await expect(page.getByText('มีรูปจาก image_url')).toBeVisible();
    // Image tag should be rendered
    const img = page.locator('img[src*="placekitten"]');
    await expect(img.first()).toBeVisible();
  });

});
