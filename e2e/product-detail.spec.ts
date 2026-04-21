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

  test('gallery shows 4 thumbnails when images has 1 entry (pads to 4)', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    // Thumbnail row: 4 buttons in the thumbnail strip
    const thumbs = page.locator('[style*="width: 70px"]');
    await expect(thumbs).toHaveCount(4);
  });

  test('clicking thumbnail changes active thumbnail border', async ({ page }) => {
    await page.getByText('iPhone 14 Pro 256GB สีM').click();
    const thumbs = page.locator('[style*="width: 70px"]');
    await thumbs.nth(1).click();
    // Second thumb should now have ink border
    const secondThumb = thumbs.nth(1);
    await expect(secondThumb).toHaveCSS('border-style', 'solid');
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
    const input = page.getByPlaceholder('พิมพ์ข้อความ...');
    await input.fill('สนใจมากครับ');
    await page.getByRole('button', { name: 'ส่ง' }).click();
    await expect(page.getByText('สนใจมากครับ')).toBeVisible();
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    await openProductChat(page);
    const sendBtn = page.getByRole('button', { name: 'ส่ง' });
    await expect(sendBtn).toBeDisabled();
  });

  test('quick reply "ยังว่างไหมครับ?" sends a message', async ({ page }) => {
    await openProductChat(page);
    await page.getByRole('button', { name: 'ยังว่างไหมครับ?' }).click();
    await expect(page.getByText('ยังว่างไหมครับ?').last()).toBeVisible();
  });

  test('seller typing indicator appears after sending', async ({ page }) => {
    await openProductChat(page);
    const input = page.getByPlaceholder('พิมพ์ข้อความ...');
    await input.fill('สวัสดีครับ');
    await page.getByRole('button', { name: 'ส่ง' }).click();
    // Typing indicator: 3 animated dots in a bubble
    await expect(page.locator('[style*="bop"]').first()).toBeVisible({ timeout: 500 });
  });

  test('seller auto-reply appears within 3 seconds', async ({ page }) => {
    await openProductChat(page);
    await page.getByRole('button', { name: 'ลดราคาได้ไหม?' }).click();
    await expect(page.getByText('เดี๋ยวตอบให้นะครับ')).toBeVisible({ timeout: 3000 });
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
