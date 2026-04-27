import { test, expect } from '@playwright/test';

const SELLER_ID = 99; // seller of the mock product

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
    seller_id: SELLER_ID,
    user_id: SELLER_ID,
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
    seller_id: SELLER_ID,
    condition: 'ใหม่ในกล่อง',
    category: 'คอมพิวเตอร์',
  },
];

// Session as a buyer (userId ≠ SELLER_ID)
const BUYER_SESSION = {
  user: { name: 'ผู้ซื้อ', email: 'buyer@test.com', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-buyer-token',
  userId: 1,
};

// Session as the seller (userId === SELLER_ID)
const SELLER_SESSION = {
  user: { name: 'ผู้ขาย', email: 'seller@test.com', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-seller-token',
  userId: SELLER_ID,
};

const MOCK_CHAT_ROOM = { id: 42, buyer_id: 1, seller_id: SELLER_ID, product_id: 1 };
const MOCK_CHAT_MSGS = [
  { id: 1, sender_id: SELLER_ID, content: 'สวัสดีครับ ยังว่างอยู่ครับ', created_at: new Date().toISOString() },
];

async function mockBuyerSession(page: any) {
  await page.route('**/api/auth/session', (r: any) => r.fulfill({ json: BUYER_SESSION }));
  await page.route('**/api/chat/rooms', (r: any) => {
    if (r.request().method() === 'POST') r.fulfill({ json: MOCK_CHAT_ROOM });
    else r.fulfill({ json: [] });
  });
  await page.route('**/api/chat/rooms/*/messages', (r: any) => {
    if (r.request().method() === 'POST') r.fulfill({ json: { id: 99, content: 'ok' } });
    else r.fulfill({ json: MOCK_CHAT_MSGS });
  });
}

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

  // ─── Chat — login guard ────────────────────────────────────────────────────

  test('guest: chat button shows "เข้าสู่ระบบเพื่อแชทกับผู้ขาย" (red accent)', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    const btn = page.getByTestId('pd-chat-btn');
    await expect(btn).toContainText('เข้าสู่ระบบเพื่อแชทกับผู้ขาย');
    // Button should have accent (red) background — verify via inline style
    const bg = await btn.evaluate((el: HTMLElement) => el.style.background);
    expect(bg).toContain('accent');
  });

  test('guest: clicking chat button does NOT open popup (opens auth instead)', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await page.getByTestId('pd-chat-btn').click();
    await expect(page.getByTestId('pd-chat-popup')).not.toBeVisible();
    // Auth modal should appear
    await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
  });

  // ─── Chat — self-chat prevention ───────────────────────────────────────────

  test('seller: chat area shows "นี่คือสินค้าของคุณ" (no chat button)', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: SELLER_SESSION }));
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.getByText('นี่คือสินค้าของคุณ')).toBeVisible();
    await expect(page.getByTestId('pd-chat-btn')).not.toBeVisible();
  });

  // ─── Chat — logged-in buyer ────────────────────────────────────────────────

  async function openProductChatAsLoggedIn(page: any) {
    await mockBuyerSession(page);
    await page.goto('/');
    await expect(page.getByText('iPhone 14 Pro 256GB สีม่วง')).toBeVisible();
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await page.getByTestId('pd-chat-btn').click();
  }

  test('buyer: "แชทกับผู้ขาย" button opens chat popup', async ({ page }) => {
    await mockBuyerSession(page);
    await page.goto('/');
    await expect(page.getByText('iPhone 14 Pro 256GB สีม่วง')).toBeVisible();
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    await expect(page.getByTestId('pd-chat-popup')).not.toBeVisible();
    await page.getByTestId('pd-chat-btn').click();
    await expect(page.getByTestId('pd-chat-popup')).toBeVisible();
  });

  test('buyer: chat CTA button has neutral (non-red) style', async ({ page }) => {
    await mockBuyerSession(page);
    await page.goto('/');
    await expect(page.getByText('iPhone 14 Pro 256GB สีม่วง')).toBeVisible();
    await page.getByText('iPhone 14 Pro 256GB สีม่วง').click();
    const btn = page.getByTestId('pd-chat-btn');
    await expect(btn).toContainText('แชทกับผู้ขาย');
    const bg = await btn.evaluate((el: HTMLElement) => el.style.background);
    expect(bg).not.toContain('accent');
  });

  test('buyer: chat popup shows messages from API', async ({ page }) => {
    await openProductChatAsLoggedIn(page);
    await expect(page.getByTestId('pd-chat-popup')).toBeVisible();
    await expect(page.getByText('สวัสดีครับ ยังว่างอยู่ครับ')).toBeVisible();
  });

  test('buyer: sending a message appends it to chat', async ({ page }) => {
    await openProductChatAsLoggedIn(page);
    const popup = page.getByTestId('pd-chat-popup');
    await popup.getByPlaceholder('พิมพ์ข้อความ...').fill('สนใจมากครับ');
    await popup.getByRole('button', { name: 'ส่ง', exact: true }).click();
    await expect(popup.getByText('สนใจมากครับ')).toBeVisible();
  });

  test('buyer: send button is disabled when input is empty', async ({ page }) => {
    await openProductChatAsLoggedIn(page);
    const sendBtn = page.getByTestId('pd-chat-popup').getByRole('button', { name: 'ส่ง', exact: true });
    await expect(sendBtn).toBeDisabled();
  });

  test('buyer: quick reply "ยังว่างไหมครับ?" sends a message', async ({ page }) => {
    await openProductChatAsLoggedIn(page);
    const popup = page.getByTestId('pd-chat-popup');
    await popup.getByRole('button', { name: 'ยังว่างไหมครับ?' }).click();
    await expect(popup.getByText('ยังว่างไหมครับ?').last()).toBeVisible();
  });

  test('buyer: popup shows product pin with title', async ({ page }) => {
    await openProductChatAsLoggedIn(page);
    const popup = page.getByTestId('pd-chat-popup');
    await expect(popup.getByText('iPhone 14 Pro 256GB สีม่วง').first()).toBeVisible();
  });

  test('buyer: chat popup close button hides the popup', async ({ page }) => {
    await openProductChatAsLoggedIn(page);
    await expect(page.getByTestId('pd-chat-popup')).toBeVisible();
    await page.getByTestId('pd-chat-close').click();
    await expect(page.getByTestId('pd-chat-popup')).not.toBeVisible();
  });

  test('buyer: "ดูการสนทนา" button closes popup and opens chat drawer', async ({ page }) => {
    await openProductChatAsLoggedIn(page);
    await expect(page.getByTestId('pd-chat-popup')).toBeVisible();
    await page.getByTestId('pd-chat-to-drawer').click();
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).not.toBeVisible();
    await expect(page.getByTestId('chat-drawer')).toBeVisible();
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

  // ─── normalizeProduct: images fallback fixes ───────────────────────────────

  test('images:[] + image_url → detail modal shows <img> tag (not placeholder)', async ({ page }) => {
    await page.route('**/api/products*', route => {
      route.fulfill({
        json: [{ id: 55, title: 'รูปจาก image_url (empty array)', price: 2500,
          images: [], image_url: 'https://placekitten.com/400/400',
          seller_name: 'Test', condition: 'มือสอง' }],
      });
    });
    await page.goto('/');
    await page.getByText('รูปจาก image_url (empty array)').click();
    // <img> with the image_url should render in the dark gallery panel
    await expect(page.locator('section img[src*="placekitten"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('images:[null] + image_url → detail modal shows <img> tag (not placeholder)', async ({ page }) => {
    await page.route('**/api/products*', route => {
      route.fulfill({
        json: [{ id: 56, title: 'รูปจาก image_url (null in array)', price: 2500,
          images: [null], image_url: 'https://placekitten.com/401/401',
          seller_name: 'Test', condition: 'มือสอง' }],
      });
    });
    await page.goto('/');
    await page.getByText('รูปจาก image_url (null in array)').click();
    await expect(page.locator('section img[src*="placekitten"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('images:[""] + image_url → detail modal shows <img> tag (not placeholder)', async ({ page }) => {
    await page.route('**/api/products*', route => {
      route.fulfill({
        json: [{ id: 57, title: 'รูปจาก image_url (empty string)', price: 2500,
          images: [''], image_url: 'https://placekitten.com/402/402',
          seller_name: 'Test', condition: 'มือสอง' }],
      });
    });
    await page.goto('/');
    await page.getByText('รูปจาก image_url (empty string)').click();
    await expect(page.locator('section img[src*="placekitten"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('images with valid URL → detail modal renders image directly', async ({ page }) => {
    await page.route('**/api/products*', route => {
      route.fulfill({
        json: [{ id: 58, title: 'รูปอยู่ใน images array', price: 2500,
          images: ['https://placekitten.com/403/403'], image_url: null,
          seller_name: 'Test', condition: 'มือสอง' }],
      });
    });
    await page.goto('/');
    await page.getByText('รูปอยู่ใน images array').click();
    await expect(page.locator('section img[src*="placekitten"]').first()).toBeVisible({ timeout: 5000 });
  });

  // ─── Deep-link: /?product=ID ───────────────────────────────────────────────

  test('navigating to /?product=ID opens ProductDetail modal', async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
    await page.route('**/api/products/1', r => r.fulfill({ json: MOCK_PRODUCTS[0] }));
    await page.goto('/?product=1');
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro 256GB สีม่วง' })).toBeVisible({ timeout: 8000 });
  });

  test('deep-link cleans ?product= from URL after opening modal', async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
    await page.route('**/api/products/1', r => r.fulfill({ json: MOCK_PRODUCTS[0] }));
    await page.goto('/?product=1');
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro 256GB สีม่วง' })).toBeVisible({ timeout: 8000 });
    await expect(page).toHaveURL('/');
  });

  test('deep-link shows correct product price', async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
    await page.route('**/api/products/1', r => r.fulfill({ json: MOCK_PRODUCTS[0] }));
    await page.goto('/?product=1');
    await expect(page.getByText('32,900').first()).toBeVisible({ timeout: 8000 });
  });

  test('closing deep-linked modal leaves user on homepage', async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
    await page.route('**/api/products/1', r => r.fulfill({ json: MOCK_PRODUCTS[0] }));
    await page.goto('/?product=1');
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro 256GB สีม่วง' })).toBeVisible({ timeout: 8000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).not.toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('invalid /?product=ID does not crash page', async ({ page }) => {
    await page.route('**/api/products*', r => r.fulfill({ json: MOCK_PRODUCTS }));
    await page.route('**/api/products/9999', r => r.fulfill({ status: 404, json: { error: 'not found' } }));
    await page.goto('/?product=9999');
    // Page should still render normally (no crash, no modal)
    await expect(page.getByText('iPhone 14 Pro 256GB สีม่วง')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('h1').filter({ hasText: 'iPhone 14 Pro' })).not.toBeVisible();
  });

});
