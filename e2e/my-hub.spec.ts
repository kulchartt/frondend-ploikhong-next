import { test, expect, type Page, type Locator } from '@playwright/test';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_SESSION = {
  user: { name: 'สมชาย ทดสอบ', email: 'test@ploi.dev', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-token-abc123',
};

const MOCK_PRODUCTS = [
  {
    id: 10, title: 'iPhone 14 Pro 256GB', price: 32900,
    image_url: '', images: [], condition: 'มือสอง สภาพดี',
    category: 'มือถือ & แท็บเล็ต', status: 'active',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_boosted: false, description: 'เครื่องศูนย์ไทย ครบกล่อง',
  },
  {
    id: 11, title: 'MacBook Air M2', price: 42000,
    image_url: '', images: [], condition: 'ใหม่ในกล่อง',
    category: 'คอมพิวเตอร์', status: 'sold',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    is_boosted: true, description: 'ยังไม่แกะกล่อง',
  },
  {
    id: 12, title: 'AirPods Pro Gen 2', price: 7900,
    image_url: '', images: [], condition: 'มือสอง สภาพ 95%+',
    category: 'มือถือ & แท็บเล็ต', status: 'active',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_boosted: false, description: 'ใช้น้อย แบตดี',
  },
];

const MOCK_WISHLIST = [
  {
    id: 1, title: 'iPhone 14 Pro 256GB Wishlist', price: 32900,
    original_price: 38900, images: [], image_url: '',
    seller_name: 'สมชาย', location: 'กรุงเทพ · พระราม 9',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2, title: 'MacBook Air M2 Wishlist', price: 42000,
    images: [], image_url: '', seller_name: 'วิชัย',
    location: 'เชียงใหม่',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const MOCK_NOTIFS = {
  notifications: [
    { id: 1, type: 'price-drop', message: 'ราคาลดลงจาก ฿24,900 → ฿18,500', read: false,
      created_at: new Date(Date.now() - 600000).toISOString() },
    { id: 2, type: 'reply', message: 'GameLoop ตอบข้อความของคุณแล้ว', read: true,
      created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  unread: 1,
};

const MOCK_FOLLOWING = [
  { id: 1, seller_id: 20, name: 'TechBKK', items_count: 34,
    followed_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 2, seller_id: 21, name: 'GameLoop', items_count: 12,
    followed_at: new Date(Date.now() - 86400000 * 10).toISOString() },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Scope locators INSIDE the hub overlay to avoid matching Navbar/Sidebar behind it */
function hub(page: Page): Locator {
  return page.locator('[data-testid="v8hub"]');
}

async function setupBase(page: Page, products = MOCK_PRODUCTS) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  // broad first (LIFO — specific /my route wins)
  await page.route('**/api/products*', r => r.fulfill({ json: [] }));
  await page.route('**/api/products/my', r => r.fulfill({ json: products }));
  await page.route('**/api/wishlist', r => {
    if (r.request().method() === 'GET') r.fulfill({ json: MOCK_WISHLIST });
    else r.continue();
  });
  await page.route('**/api/wishlist/**', r => r.fulfill({ json: { success: true } }));
  await page.route('**/api/notifications', r => r.fulfill({ json: MOCK_NOTIFS }));
  await page.route('**/api/notifications/read-all', r => r.fulfill({ json: { success: true } }));
  await page.route('**/api/follows', r => r.fulfill({ json: MOCK_FOLLOWING }));
  await page.route('**/api/follows/toggle', r => r.fulfill({ json: { success: true } }));
}

async function openSellHub(page: Page, products = MOCK_PRODUCTS) {
  await setupBase(page, products);
  await page.goto('/');
  // Wait for session to fully load — nav-user-btn only renders when session?.user is truthy
  await page.waitForSelector('[data-testid="nav-user-btn"]', { timeout: 10000 });
  const sellBtn = page.getByRole('button', { name: 'ขาย', exact: true });
  await expect(sellBtn).toBeVisible({ timeout: 5000 });
  await sellBtn.click();
  await expect(page.locator('[data-testid="v8hub"]')).toBeVisible({ timeout: 8000 });
}

/** Open hub in buy/saved mode via the proven sell→switch path (avoids session race on ถูกใจ click) */
async function openBuyHub(page: Page) {
  await openSellHub(page);
  // switch to buy mode, land on saved tab
  await hub(page).getByRole('button', { name: 'ซื้อ', exact: true }).click();
  await hub(page).getByRole('button', { name: 'บันทึกแล้ว' }).click();
  await expect(hub(page).getByRole('heading', { name: 'บันทึกแล้ว' })).toBeVisible();
}

// =============================================================================
// SELL MODE: opening & navigation
// =============================================================================

test.describe('V8Hub — Sell mode: opening & navigation', () => {

  test('clicking "ขาย" while logged in opens V8Hub', async ({ page }) => {
    await openSellHub(page);
    await expect(hub(page).getByRole('heading', { name: 'รายการสินค้าของคุณ' })).toBeVisible();
  });

  test('hub shows ขาย/ซื้อ mode switch', async ({ page }) => {
    await openSellHub(page);
    // mode switch buttons are inside the hub overlay
    await expect(hub(page).getByRole('button', { name: 'ขาย', exact: true })).toBeVisible();
    await expect(hub(page).getByRole('button', { name: 'ซื้อ', exact: true })).toBeVisible();
  });

  test('ESC closes the hub', async ({ page }) => {
    await openSellHub(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="v8hub"]')).not.toBeVisible();
  });

  test('← back button closes the hub', async ({ page }) => {
    await openSellHub(page);
    // back button text is exactly "Marketplace" on desktop (not "โปรไฟล์ Marketplace")
    await hub(page).getByRole('button', { name: 'Marketplace', exact: true }).click();
    await expect(page.locator('[data-testid="v8hub"]')).not.toBeVisible();
  });

  test('sidebar shows all sell tabs', async ({ page }) => {
    await openSellHub(page);
    const h = hub(page);
    await expect(h.getByRole('button', { name: 'รายการสินค้าของคุณ' })).toBeVisible();
    await expect(h.getByRole('button', { name: 'ข้อมูลเชิงลึก' })).toBeVisible();
    await expect(h.getByRole('button', { name: 'ข่าวประกาศ' })).toBeVisible();
    await expect(h.getByRole('button', { name: 'โปรไฟล์ Marketplace' })).toBeVisible();
  });

  test('clicking "ข้อมูลเชิงลึก" navigates to insights', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ข้อมูลเชิงลึก' }).click();
    await expect(hub(page).getByText('ยอดเข้าชม 30 วัน')).toBeVisible();
  });

  test('clicking "ข่าวประกาศ" navigates to news', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ข่าวประกาศ' }).click();
    await expect(hub(page).getByText('ข่าวและอัปเดตสำหรับผู้ขาย')).toBeVisible();
  });

  test('clicking "โปรไฟล์ Marketplace" shows user profile', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'โปรไฟล์ Marketplace' }).click();
    await expect(hub(page).getByText('สมชาย ทดสอบ')).toBeVisible();
    await expect(hub(page).getByText('test@ploi.dev').first()).toBeVisible();
  });

  test('header "สร้างรายการสินค้าใหม่" closes hub and opens ListingFlow', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'สร้างรายการสินค้าใหม่' }).click();
    await expect(page.locator('[data-testid="v8hub"]')).not.toBeVisible();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

});

// =============================================================================
// SELL: LISTINGS — product list
// =============================================================================

test.describe('V8Hub — SellListings: product list', () => {

  test('shows all 3 products', async ({ page }) => {
    await openSellHub(page);
    const h = hub(page);
    await expect(h.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await expect(h.getByText('MacBook Air M2')).toBeVisible();
    await expect(h.getByText('AirPods Pro Gen 2')).toBeVisible();
  });

  test('shows formatted price', async ({ page }) => {
    await openSellHub(page);
    await expect(hub(page).getByText('฿32,900')).toBeVisible();
  });

  test('shows กำลังขาย badge', async ({ page }) => {
    await openSellHub(page);
    await expect(hub(page).getByText('กำลังขาย').first()).toBeVisible();
  });

  test('shows ขายแล้ว badge', async ({ page }) => {
    await openSellHub(page);
    await expect(hub(page).getByText('ขายแล้ว').first()).toBeVisible();
  });

  test('shows BOOST badge', async ({ page }) => {
    await openSellHub(page);
    await expect(hub(page).getByText('BOOST', { exact: true })).toBeVisible();
  });

});

// =============================================================================
// SELL: LISTINGS — filter chips
// =============================================================================

test.describe('V8Hub — SellListings: filter chips', () => {

  test('chip "ทั้งหมด" shows count 3', async ({ page }) => {
    await openSellHub(page);
    // scope to hub to avoid Sidebar's "ทั้งหมด" category button
    const chip = hub(page).getByRole('button', { name: /ทั้งหมด/ }).first();
    await expect(chip).toContainText('3');
  });

  test('chip "กำลังขาย" shows count 2', async ({ page }) => {
    await openSellHub(page);
    const chip = hub(page).getByRole('button', { name: /กำลังขาย/ }).first();
    await expect(chip).toContainText('2');
  });

  test('chip "ขายแล้ว" shows count 1', async ({ page }) => {
    await openSellHub(page);
    const chip = hub(page).getByRole('button', { name: /ขายแล้ว/ }).first();
    await expect(chip).toContainText('1');
  });

  test('"กำลังขาย" filter hides sold products', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: /กำลังขาย/ }).first().click();
    await expect(hub(page).getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await expect(hub(page).getByText('AirPods Pro Gen 2')).toBeVisible();
    await expect(hub(page).getByText('MacBook Air M2')).not.toBeVisible();
  });

  test('"ขายแล้ว" filter hides active products', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: /ขายแล้ว/ }).first().click();
    await expect(hub(page).getByText('MacBook Air M2')).toBeVisible();
    await expect(hub(page).getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

  test('search input filters by title', async ({ page }) => {
    await openSellHub(page);
    await hub(page).locator('input[placeholder*="ค้นหารายการสินค้า"]').fill('AirPods');
    await expect(hub(page).getByText('AirPods Pro Gen 2')).toBeVisible();
    await expect(hub(page).getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

});

// =============================================================================
// SELL: LISTINGS — edit
// =============================================================================

test.describe('V8Hub — SellListings: edit', () => {

  test('clicking edit icon opens inline form', async ({ page }) => {
    await openSellHub(page);
    const firstEditBtn = hub(page).locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await expect(hub(page).getByText('ชื่อประกาศ').first()).toBeVisible();
    await expect(hub(page).getByText('ราคา (฿)').first()).toBeVisible();
  });

  test('edit form pre-fills current title', async ({ page }) => {
    await openSellHub(page);
    const firstEditBtn = hub(page).locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await expect(hub(page).locator('input[maxlength="80"]')).toHaveValue('iPhone 14 Pro 256GB');
  });

  test('save calls PATCH and updates list', async ({ page }) => {
    let patchCalled = false;
    await page.route('**/api/products/10', r => {
      if (r.request().method() === 'PATCH') { patchCalled = true; r.fulfill({ json: { id: 10, title: 'iPhone EDITED', price: 30000 } }); }
      else r.continue();
    });
    await openSellHub(page);
    const firstEditBtn = hub(page).locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await hub(page).locator('input[maxlength="80"]').fill('iPhone EDITED');
    await hub(page).getByRole('button', { name: 'บันทึก' }).click();
    expect(patchCalled).toBe(true);
    await expect(hub(page).getByText('iPhone EDITED')).toBeVisible();
  });

  test('clicking edit again collapses form', async ({ page }) => {
    await openSellHub(page);
    const firstEditBtn = hub(page).locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await expect(hub(page).getByText('ชื่อประกาศ').first()).toBeVisible();
    await firstEditBtn.click();
    await expect(hub(page).getByText('ชื่อประกาศ')).not.toBeVisible();
  });

  test('"ยกเลิก" collapses form', async ({ page }) => {
    await openSellHub(page);
    const firstEditBtn = hub(page).locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await hub(page).getByRole('button', { name: 'ยกเลิก' }).first().click();
    await expect(hub(page).getByText('ชื่อประกาศ')).not.toBeVisible();
  });

});

// =============================================================================
// SELL: LISTINGS — delete
// =============================================================================

test.describe('V8Hub — SellListings: delete', () => {

  test('trash icon shows delete confirm bar', async ({ page }) => {
    await openSellHub(page);
    const firstDeleteBtn = hub(page).locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await expect(hub(page).getByText('ลบประกาศนี้? ย้อนกลับไม่ได้')).toBeVisible();
    await expect(hub(page).getByRole('button', { name: 'ลบเลย' })).toBeVisible();
  });

  test('"ยกเลิก" dismisses confirm bar', async ({ page }) => {
    await openSellHub(page);
    const firstDeleteBtn = hub(page).locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await hub(page).getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(hub(page).getByText('ลบประกาศนี้?')).not.toBeVisible();
  });

  test('"ลบเลย" calls DELETE and removes product', async ({ page }) => {
    let deleteCalled = false;
    await page.route('**/api/products/10', r => {
      if (r.request().method() === 'DELETE') { deleteCalled = true; r.fulfill({ json: { success: true } }); }
      else r.continue();
    });
    await openSellHub(page);
    const firstDeleteBtn = hub(page).locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await hub(page).getByRole('button', { name: 'ลบเลย' }).click();
    expect(deleteCalled).toBe(true);
    await expect(hub(page).getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

});

// =============================================================================
// SELL: LISTINGS — empty state
// =============================================================================

test.describe('V8Hub — SellListings: empty state', () => {

  test('shows empty state when no products', async ({ page }) => {
    await openSellHub(page, []);
    await expect(hub(page).getByText('ยังไม่มีประกาศ')).toBeVisible();
    await expect(hub(page).getByRole('button', { name: '+ ลงขายฟรี' })).toBeVisible();
  });

  test('"+ ลงขายฟรี" opens ListingFlow', async ({ page }) => {
    await openSellHub(page, []);
    await hub(page).getByRole('button', { name: '+ ลงขายฟรี' }).click();
    await expect(page.locator('[data-testid="v8hub"]')).not.toBeVisible();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

  test('shows loading skeletons while fetching', async ({ page }) => {
    // Use setupBase for stable session/routes, then override /my with a delayed response (LIFO wins)
    await setupBase(page);
    await page.route('**/api/products/my', async r => {
      await new Promise(res => setTimeout(res, 900));
      r.fulfill({ json: MOCK_PRODUCTS });
    });
    await page.goto('/');
    const sellBtn = page.getByRole('button', { name: 'ขาย', exact: true });
    await expect(sellBtn).toBeVisible({ timeout: 10000 });
    await sellBtn.click();
    await expect(page.locator('[data-testid="v8hub"]')).toBeVisible({ timeout: 8000 });
    // Skeletons appear while the 900ms /my request is in-flight
    const skeletons = page.locator('[data-testid="v8hub"] [style*="animation"]');
    await expect(skeletons.first()).toBeVisible({ timeout: 3000 });
  });

});

// =============================================================================
// SELL: INSIGHTS
// =============================================================================

test.describe('V8Hub — Insights tab', () => {

  test('shows stat cards', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ข้อมูลเชิงลึก' }).click();
    await expect(hub(page).getByText('ยอดเข้าชม 30 วัน')).toBeVisible();
    await expect(hub(page).getByText('กำลังขายอยู่')).toBeVisible();
  });

  test('shows chart', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ข้อมูลเชิงลึก' }).click();
    await expect(hub(page).getByText('ยอดเข้าชมรายวัน')).toBeVisible();
  });

  test('shows top products section', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ข้อมูลเชิงลึก' }).click();
    await expect(hub(page).getByText('สินค้าที่มีผู้สนใจสูงสุด')).toBeVisible();
  });

});

// =============================================================================
// SELL: NEWS
// =============================================================================

test.describe('V8Hub — News tab', () => {

  test('shows news cards', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ข่าวประกาศ' }).click();
    await expect(hub(page).getByText('Boost ราคาพิเศษ ฿19 ในเดือนนี้')).toBeVisible();
  });

  test('shows news tags', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ข่าวประกาศ' }).click();
    await expect(hub(page).getByText('ใหม่').first()).toBeVisible();
  });

});

// =============================================================================
// MODE SWITCH
// =============================================================================

test.describe('V8Hub — Mode switch', () => {

  test('clicking "ซื้อ" switches to buy mode', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ซื้อ', exact: true }).click();
    await expect(hub(page).getByRole('button', { name: 'กิจกรรมล่าสุด' })).toBeVisible();
    await expect(hub(page).getByRole('button', { name: 'บันทึกแล้ว' })).toBeVisible();
    await expect(hub(page).getByRole('button', { name: 'การแจ้งเตือน' })).toBeVisible();
    await expect(hub(page).getByRole('button', { name: 'กำลังติดตาม' })).toBeVisible();
  });

  test('switching back to "ขาย" restores sell nav', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ซื้อ', exact: true }).click();
    await hub(page).getByRole('button', { name: 'ขาย', exact: true }).click();
    await expect(hub(page).getByRole('button', { name: 'รายการสินค้าของคุณ' })).toBeVisible();
  });

  test('buy mode shows activity tab content by default', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'ซื้อ', exact: true }).click();
    // activity tab is default in buy mode
    await expect(hub(page).getByRole('heading', { name: 'กิจกรรมล่าสุด' })).toBeVisible();
  });

});

// =============================================================================
// BUY: ACTIVITY
// =============================================================================

test.describe('V8Hub — Buy: Activity', () => {

  test('ถูกใจ button opens hub in buy/saved mode', async ({ page }) => {
    await setupBase(page);
    await page.goto('/');
    // Wait for the page to be interactive (ลงขาย always shown)
    await page.waitForSelector('button:has-text("ลงขาย")');
    await page.getByRole('button', { name: 'ถูกใจ', exact: true }).click();
    await expect(page.locator('[data-testid="v8hub"]')).toBeVisible({ timeout: 8000 });
    // Hub should land on buy mode, saved tab
    await expect(hub(page).getByRole('heading', { name: 'บันทึกแล้ว' })).toBeVisible();
  });

  test('"กิจกรรมล่าสุด" tab shows activity content', async ({ page }) => {
    await openBuyHub(page);
    await hub(page).getByRole('button', { name: 'กิจกรรมล่าสุด' }).click();
    await expect(hub(page).getByRole('heading', { name: 'กิจกรรมล่าสุด' })).toBeVisible();
    await expect(hub(page).getByText('ของที่คุณดู · ข้อความ · ข้อเสนอ · บันทึก')).toBeVisible();
  });

});

// =============================================================================
// BUY: SAVED (WISHLIST)
// =============================================================================

test.describe('V8Hub — Buy: Saved', () => {

  test('shows wishlist items', async ({ page }) => {
    await openBuyHub(page);
    const h = hub(page);
    await expect(h.getByText('iPhone 14 Pro 256GB Wishlist')).toBeVisible();
    await expect(h.getByText('MacBook Air M2 Wishlist')).toBeVisible();
  });

  test('shows formatted price', async ({ page }) => {
    await openBuyHub(page);
    await expect(hub(page).getByText('฿32,900')).toBeVisible();
  });

  test('shows item count badge', async ({ page }) => {
    await openBuyHub(page);
    await expect(hub(page).locator('span').filter({ hasText: /^2$/ }).first()).toBeVisible();
  });

  test('shows footer total value', async ({ page }) => {
    await openBuyHub(page);
    // 32900 + 42000 = 74900
    await expect(hub(page).getByText('฿74,900')).toBeVisible();
  });

  test('heart button removes item and updates total', async ({ page }) => {
    await openBuyHub(page);
    await hub(page).locator('button[title="นำออกจากรายการถูกใจ"]').first().click();
    await expect(hub(page).getByText('iPhone 14 Pro 256GB Wishlist')).not.toBeVisible();
    await expect(hub(page).getByText('฿42,000').first()).toBeVisible();
  });

  test('shows empty state when wishlist is empty', async ({ page }) => {
    // Override wishlist route to return empty (registered after setupBase, so LIFO wins)
    await openSellHub(page);
    await page.route('**/api/wishlist', r => r.fulfill({ json: [] }));
    await hub(page).getByRole('button', { name: 'ซื้อ', exact: true }).click();
    await hub(page).getByRole('button', { name: 'บันทึกแล้ว' }).click();
    await expect(hub(page).getByText('ยังไม่มีรายการถูกใจ')).toBeVisible();
    await expect(hub(page).getByText(/กดไอคอนหัวใจ/)).toBeVisible();
  });

});

// =============================================================================
// BUY: NOTIFICATIONS
// =============================================================================

test.describe('V8Hub — Buy: Notifications', () => {

  test('shows notifications list', async ({ page }) => {
    await openBuyHub(page);
    await hub(page).getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await expect(hub(page).getByRole('heading', { name: 'การแจ้งเตือน' })).toBeVisible();
    await expect(hub(page).getByText('ราคาลดลงจาก ฿24,900 → ฿18,500')).toBeVisible();
  });

  test('shows unread count', async ({ page }) => {
    await openBuyHub(page);
    await hub(page).getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await expect(hub(page).getByText('1 รายการยังไม่ได้อ่าน')).toBeVisible();
  });

  test('"ทำเครื่องหมายอ่านทั้งหมด" button visible when unread > 0', async ({ page }) => {
    await openBuyHub(page);
    await hub(page).getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await expect(hub(page).getByRole('button', { name: 'ทำเครื่องหมายอ่านทั้งหมด' })).toBeVisible();
  });

  test('clicking mark-all calls API and shows อ่านหมดแล้ว', async ({ page }) => {
    await openBuyHub(page);
    // Register custom route AFTER setupBase (LIFO — this wins)
    let apiCalled = false;
    await page.route('**/api/notifications/read-all', r => { apiCalled = true; r.fulfill({ json: { success: true } }); });
    await hub(page).getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await hub(page).getByRole('button', { name: 'ทำเครื่องหมายอ่านทั้งหมด' }).click();
    expect(apiCalled).toBe(true);
    await expect(hub(page).getByText('อ่านหมดแล้ว')).toBeVisible();
  });

  test('shows empty state when no notifications', async ({ page }) => {
    await openSellHub(page);
    await page.route('**/api/notifications', r => r.fulfill({ json: { notifications: [], unread: 0 } }));
    await hub(page).getByRole('button', { name: 'ซื้อ', exact: true }).click();
    await hub(page).getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await expect(hub(page).getByText('ไม่มีการแจ้งเตือน')).toBeVisible();
  });

});

// =============================================================================
// BUY: FOLLOWING
// =============================================================================

test.describe('V8Hub — Buy: Following', () => {

  test('shows followed sellers', async ({ page }) => {
    await openBuyHub(page);
    await hub(page).getByRole('button', { name: 'กำลังติดตาม' }).click();
    await expect(hub(page).getByText('TechBKK')).toBeVisible();
    await expect(hub(page).getByText('GameLoop')).toBeVisible();
  });

  test('shows seller count in subtitle', async ({ page }) => {
    await openBuyHub(page);
    await hub(page).getByRole('button', { name: 'กำลังติดตาม' }).click();
    await expect(hub(page).getByText('2 ผู้ขายที่คุณติดตามอยู่')).toBeVisible();
  });

  test('"กำลังติดตาม ✓" calls API and removes seller', async ({ page }) => {
    await openBuyHub(page);
    // Register AFTER openBuyHub (LIFO — wins over setupBase's follows/toggle route)
    let apiCalled = false;
    await page.route('**/api/follows/toggle', r => { apiCalled = true; r.fulfill({ json: { success: true } }); });
    await hub(page).getByRole('button', { name: 'กำลังติดตาม' }).click();
    await hub(page).getByRole('button', { name: /กำลังติดตาม ✓/ }).first().click();
    expect(apiCalled).toBe(true);
    await expect(hub(page).getByText('TechBKK')).not.toBeVisible();
  });

  test('shows empty state when not following anyone', async ({ page }) => {
    await openSellHub(page);
    await page.route('**/api/follows', r => r.fulfill({ json: [] }));
    await hub(page).getByRole('button', { name: 'ซื้อ', exact: true }).click();
    await hub(page).getByRole('button', { name: 'กำลังติดตาม' }).click();
    await expect(hub(page).getByText('ยังไม่ได้ติดตามผู้ขายคนใด')).toBeVisible();
  });

});

// =============================================================================
// PROFILE TAB
// =============================================================================

test.describe('V8Hub — Profile tab', () => {

  test('shows user name', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'โปรไฟล์ Marketplace' }).click();
    await expect(hub(page).getByText('สมชาย ทดสอบ')).toBeVisible();
  });

  test('shows user email', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'โปรไฟล์ Marketplace' }).click();
    await expect(hub(page).getByText('test@ploi.dev').first()).toBeVisible();
  });

  test('accessible from buy mode too', async ({ page }) => {
    await openBuyHub(page);
    await hub(page).getByRole('button', { name: 'โปรไฟล์ Marketplace' }).click();
    await expect(hub(page).getByText('สมชาย ทดสอบ')).toBeVisible();
  });

  test('shows privacy settings toggles', async ({ page }) => {
    await openSellHub(page);
    await hub(page).getByRole('button', { name: 'โปรไฟล์ Marketplace' }).click();
    await expect(hub(page).getByText('รับข่าวสารทางอีเมล')).toBeVisible();
    await expect(hub(page).getByText('แสดงสถานะออนไลน์')).toBeVisible();
  });

});

// =============================================================================
// AUTH GUARD
// =============================================================================

test.describe('V8Hub — Auth guard', () => {

  test('unauthenticated user gets auth modal on clicking ขาย', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ขาย', exact: true }).click();
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
    await expect(page.locator('[data-testid="v8hub"]')).not.toBeVisible();
  });

});
