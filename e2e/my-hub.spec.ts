import { test, expect } from '@playwright/test';

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

// ─── Route helpers ────────────────────────────────────────────────────────────

async function setupBase(page: any, products = MOCK_PRODUCTS) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  // broad route first (LIFO) so specific /my wins
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

async function openSellHub(page: any, products = MOCK_PRODUCTS) {
  await setupBase(page, products);
  await page.goto('/');
  // "ขาย" in navbar — exact to avoid matching "+ ลงขาย" or "ลงขายฟรี"
  await page.getByRole('button', { name: 'ขาย', exact: true }).click();
}

async function openBuyHub(page: any, tab?: string) {
  await setupBase(page);
  await page.goto('/');
  // Open hub in buy mode via "ถูกใจ" (goes to buy→saved) or just open sell then switch
  await page.getByRole('button', { name: 'ถูกใจ', exact: true }).click();
  if (tab && tab !== 'saved') {
    await page.getByRole('button', { name: tab, exact: true }).click();
  }
}

// =============================================================================
// SELL MODE
// =============================================================================

test.describe('V8Hub — Sell mode: opening & navigation', () => {

  test('clicking "ขาย" while logged in opens V8Hub', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('รายการสินค้าของคุณ')).toBeVisible();
  });

  test('hub shows ขาย/ซื้อ mode switch', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByRole('button', { name: 'ขาย', exact: true }).nth(1)).toBeVisible();
    await expect(page.getByRole('button', { name: 'ซื้อ', exact: true })).toBeVisible();
  });

  test('ESC closes the hub', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('รายการสินค้าของคุณ')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('รายการสินค้าของคุณ')).not.toBeVisible();
  });

  test('← Marketplace back button closes the hub', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('รายการสินค้าของคุณ')).toBeVisible();
    // Back button contains "Marketplace" text on desktop
    await page.getByRole('button', { name: /Marketplace/ }).first().click();
    await expect(page.getByText('รายการสินค้าของคุณ')).not.toBeVisible();
  });

  test('sidebar nav shows all sell tabs', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByRole('button', { name: 'รายการสินค้าของคุณ' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ข้อมูลเชิงลึก' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ข่าวประกาศ' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'โปรไฟล์ Marketplace' })).toBeVisible();
  });

  test('clicking "ข้อมูลเชิงลึก" navigates to insights tab', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'ข้อมูลเชิงลึก' }).click();
    await expect(page.getByText('ยอดเข้าชม 30 วัน')).toBeVisible();
  });

  test('clicking "ข่าวประกาศ" navigates to news tab', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'ข่าวประกาศ' }).click();
    await expect(page.getByText('ข่าวและอัปเดตสำหรับผู้ขาย')).toBeVisible();
  });

  test('clicking "โปรไฟล์ Marketplace" shows user name', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'โปรไฟล์ Marketplace' }).first().click();
    await expect(page.getByText('สมชาย ทดสอบ')).toBeVisible();
    await expect(page.getByText('test@ploi.dev')).toBeVisible();
  });

  test('header "สร้างรายการสินค้าใหม่" closes hub and opens ListingFlow', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'สร้างรายการสินค้าใหม่' }).click();
    await expect(page.getByText('รายการสินค้าของคุณ')).not.toBeVisible();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

});

// =============================================================================
// SELL: LISTINGS TAB
// =============================================================================

test.describe('V8Hub — SellListings: product list', () => {

  test('shows all 3 products', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await expect(page.getByText('MacBook Air M2')).toBeVisible();
    await expect(page.getByText('AirPods Pro Gen 2')).toBeVisible();
  });

  test('shows formatted price', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('฿32,900')).toBeVisible();
  });

  test('shows กำลังขาย badge for active product', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('กำลังขาย').first()).toBeVisible();
  });

  test('shows ขายแล้ว badge for sold product', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('ขายแล้ว').first()).toBeVisible();
  });

  test('shows BOOST badge for boosted product', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('BOOST', { exact: true })).toBeVisible();
  });

});

test.describe('V8Hub — SellListings: filter chips', () => {

  test('filter chip "ทั้งหมด" shows count 3', async ({ page }) => {
    await openSellHub(page);
    const chip = page.getByRole('button', { name: /ทั้งหมด/ }).first();
    await expect(chip).toContainText('3');
  });

  test('filter chip "กำลังขาย" shows count 2', async ({ page }) => {
    await openSellHub(page);
    const chip = page.getByRole('button', { name: /กำลังขาย/ }).first();
    await expect(chip).toContainText('2');
  });

  test('filter chip "ขายแล้ว" shows count 1', async ({ page }) => {
    await openSellHub(page);
    const chip = page.getByRole('button', { name: /ขายแล้ว/ }).first();
    await expect(chip).toContainText('1');
  });

  test('"กำลังขาย" filter shows only active products', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: /กำลังขาย/ }).first().click();
    await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
    await expect(page.getByText('AirPods Pro Gen 2')).toBeVisible();
    await expect(page.getByText('MacBook Air M2')).not.toBeVisible();
  });

  test('"ขายแล้ว" filter shows only sold products', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: /ขายแล้ว/ }).first().click();
    await expect(page.getByText('MacBook Air M2')).toBeVisible();
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

  test('search input filters products by title', async ({ page }) => {
    await openSellHub(page);
    await page.locator('input[placeholder*="ค้นหารายการสินค้า"]').fill('AirPods');
    await expect(page.getByText('AirPods Pro Gen 2')).toBeVisible();
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

});

test.describe('V8Hub — SellListings: edit', () => {

  test('clicking edit icon expands inline edit form', async ({ page }) => {
    await openSellHub(page);
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await expect(page.getByText('ชื่อประกาศ').first()).toBeVisible();
    await expect(page.getByText('ราคา (฿)').first()).toBeVisible();
    await expect(page.getByText('คำอธิบาย').first()).toBeVisible();
  });

  test('edit form pre-fills current product title', async ({ page }) => {
    await openSellHub(page);
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await expect(page.locator('input[maxlength="80"]')).toHaveValue('iPhone 14 Pro 256GB');
  });

  test('save calls PATCH and updates the list', async ({ page }) => {
    let patchCalled = false;
    await page.route('**/api/products/10', r => {
      if (r.request().method() === 'PATCH') {
        patchCalled = true;
        r.fulfill({ json: { id: 10, title: 'iPhone EDITED', price: 30000 } });
      } else { r.continue(); }
    });
    await openSellHub(page);
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await page.locator('input[maxlength="80"]').fill('iPhone EDITED');
    await page.getByRole('button', { name: 'บันทึก' }).click();
    expect(patchCalled).toBe(true);
    await expect(page.getByText('iPhone EDITED')).toBeVisible();
  });

  test('clicking edit again collapses the form', async ({ page }) => {
    await openSellHub(page);
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await expect(page.getByText('ชื่อประกาศ').first()).toBeVisible();
    await firstEditBtn.click();
    await expect(page.getByText('ชื่อประกาศ')).not.toBeVisible();
  });

  test('"ยกเลิก" in edit form collapses it', async ({ page }) => {
    await openSellHub(page);
    const firstEditBtn = page.locator('button').filter({
      has: page.locator('svg path[d*="M11 4H4"]'),
    }).first();
    await firstEditBtn.click();
    await page.getByRole('button', { name: 'ยกเลิก' }).first().click();
    await expect(page.getByText('ชื่อประกาศ')).not.toBeVisible();
  });

});

test.describe('V8Hub — SellListings: delete', () => {

  test('clicking trash icon shows delete confirm bar', async ({ page }) => {
    await openSellHub(page);
    const firstDeleteBtn = page.locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await expect(page.getByText('ลบประกาศนี้? ย้อนกลับไม่ได้')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ลบเลย' })).toBeVisible();
  });

  test('"ยกเลิก" in confirm bar dismisses it', async ({ page }) => {
    await openSellHub(page);
    const firstDeleteBtn = page.locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.getByText('ลบประกาศนี้?')).not.toBeVisible();
  });

  test('"ลบเลย" calls DELETE and removes product', async ({ page }) => {
    let deleteCalled = false;
    await page.route('**/api/products/10', r => {
      if (r.request().method() === 'DELETE') {
        deleteCalled = true;
        r.fulfill({ json: { success: true } });
      } else { r.continue(); }
    });
    await openSellHub(page);
    const firstDeleteBtn = page.locator('button').filter({
      has: page.locator('svg polyline[points="3 6 5 6 21 6"]'),
    }).first();
    await firstDeleteBtn.click();
    await page.getByRole('button', { name: 'ลบเลย' }).click();
    expect(deleteCalled).toBe(true);
    await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  });

});

test.describe('V8Hub — SellListings: empty state', () => {

  test('shows empty state when no products', async ({ page }) => {
    await openSellHub(page, []);
    await expect(page.getByText('ยังไม่มีประกาศ')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ ลงขายฟรี' })).toBeVisible();
  });

  test('"+ ลงขายฟรี" in empty state opens ListingFlow', async ({ page }) => {
    await openSellHub(page, []);
    await page.getByRole('button', { name: '+ ลงขายฟรี' }).click();
    await expect(page.getByText('ยังไม่มีประกาศ')).not.toBeVisible();
    await expect(page.getByText('ขั้นตอน 1 จาก 4')).toBeVisible();
  });

  test('shows loading skeletons while fetching', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.route('**/api/products/my', async r => {
      await new Promise(res => setTimeout(res, 800));
      r.fulfill({ json: MOCK_PRODUCTS });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'ขาย', exact: true }).click();
    const skeletons = page.locator('[style*="animation"]');
    await expect(skeletons.first()).toBeVisible({ timeout: 2000 });
  });

});

// =============================================================================
// SELL: INSIGHTS
// =============================================================================

test.describe('V8Hub — Insights tab', () => {

  test('shows stat cards', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'ข้อมูลเชิงลึก' }).click();
    await expect(page.getByText('ยอดเข้าชม 30 วัน')).toBeVisible();
    await expect(page.getByText('กำลังขายอยู่')).toBeVisible();
    await expect(page.getByText('ขายสำเร็จเดือนนี้')).toBeVisible();
  });

  test('shows chart heading', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'ข้อมูลเชิงลึก' }).click();
    await expect(page.getByText('ยอดเข้าชมรายวัน')).toBeVisible();
  });

  test('shows top-products section when products loaded', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'ข้อมูลเชิงลึก' }).click();
    await expect(page.getByText('สินค้าที่มีผู้สนใจสูงสุด')).toBeVisible();
  });

});

// =============================================================================
// SELL: NEWS
// =============================================================================

test.describe('V8Hub — News tab', () => {

  test('shows news cards', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'ข่าวประกาศ' }).click();
    await expect(page.getByText('Boost ราคาพิเศษ ฿19 ในเดือนนี้')).toBeVisible();
    await expect(page.getByText('ข่าวและอัปเดตสำหรับผู้ขาย')).toBeVisible();
  });

  test('shows tags on news cards', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'ข่าวประกาศ' }).click();
    await expect(page.getByText('ใหม่').first()).toBeVisible();
    await expect(page.getByText('เคล็ดลับ').first()).toBeVisible();
  });

});

// =============================================================================
// MODE SWITCH
// =============================================================================

test.describe('V8Hub — Mode switch', () => {

  test('clicking "ซื้อ" switches to buy mode and shows buy nav', async ({ page }) => {
    await openSellHub(page);
    await expect(page.getByText('รายการสินค้าของคุณ')).toBeVisible();
    // Switch to buy
    await page.getByRole('button', { name: 'ซื้อ', exact: true }).click();
    await expect(page.getByRole('button', { name: 'กิจกรรมล่าสุด' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'บันทึกแล้ว' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'การแจ้งเตือน' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'กำลังติดตาม' })).toBeVisible();
  });

  test('switching back to "ขาย" restores sell nav', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'ซื้อ', exact: true }).click();
    await expect(page.getByRole('button', { name: 'กิจกรรมล่าสุด' })).toBeVisible();
    // Switch back to sell
    await page.getByRole('button', { name: 'ขาย', exact: true }).nth(1).click();
    await expect(page.getByRole('button', { name: 'รายการสินค้าของคุณ' })).toBeVisible();
  });

});

// =============================================================================
// BUY MODE
// =============================================================================

test.describe('V8Hub — Buy: Activity', () => {

  test('clicking ถูกใจ opens hub in buy/saved mode', async ({ page }) => {
    await openBuyHub(page);
    await expect(page.getByText('บันทึกแล้ว')).toBeVisible();
  });

  test('clicking "กิจกรรมล่าสุด" shows activity items', async ({ page }) => {
    await openBuyHub(page);
    await page.getByRole('button', { name: 'กิจกรรมล่าสุด' }).click();
    await expect(page.getByText('กิจกรรมล่าสุด')).toBeVisible();
    await expect(page.getByText('ของที่คุณดู · ข้อความ · ข้อเสนอ · บันทึก')).toBeVisible();
  });

});

test.describe('V8Hub — Buy: Saved (Wishlist)', () => {

  test('shows wishlist items', async ({ page }) => {
    await openBuyHub(page);
    await expect(page.getByText('iPhone 14 Pro 256GB Wishlist')).toBeVisible();
    await expect(page.getByText('MacBook Air M2 Wishlist')).toBeVisible();
  });

  test('shows formatted prices', async ({ page }) => {
    await openBuyHub(page);
    await expect(page.getByText('฿32,900')).toBeVisible();
  });

  test('shows item count', async ({ page }) => {
    await openBuyHub(page);
    await expect(page.locator('span').filter({ hasText: /^2$/ }).first()).toBeVisible();
  });

  test('shows footer total value', async ({ page }) => {
    await openBuyHub(page);
    // 32900 + 42000 = 74900
    await expect(page.getByText('฿74,900')).toBeVisible();
  });

  test('clicking heart removes item and updates total', async ({ page }) => {
    await openBuyHub(page);
    await page.locator('button[title="นำออกจากรายการถูกใจ"]').first().click();
    await expect(page.getByText('iPhone 14 Pro 256GB Wishlist')).not.toBeVisible();
    // Only MacBook remains
    await expect(page.getByText('฿42,000')).toBeVisible();
  });

  test('shows empty state when wishlist is empty', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.route('**/api/products/my', r => r.fulfill({ json: [] }));
    await page.route('**/api/wishlist', r => r.fulfill({ json: [] }));
    await page.route('**/api/notifications', r => r.fulfill({ json: { notifications: [], unread: 0 } }));
    await page.route('**/api/follows', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ถูกใจ', exact: true }).click();
    await expect(page.getByText('ยังไม่มีรายการถูกใจ')).toBeVisible();
    await expect(page.getByText(/กดไอคอนหัวใจ/)).toBeVisible();
  });

});

test.describe('V8Hub — Buy: Notifications', () => {

  test('shows notifications', async ({ page }) => {
    await openBuyHub(page);
    await page.getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await expect(page.getByText('การแจ้งเตือน')).toBeVisible();
    await expect(page.getByText('ราคาลดลงจาก ฿24,900 → ฿18,500')).toBeVisible();
  });

  test('shows unread count in subtitle', async ({ page }) => {
    await openBuyHub(page);
    await page.getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await expect(page.getByText('1 รายการยังไม่ได้อ่าน')).toBeVisible();
  });

  test('"ทำเครื่องหมายอ่านทั้งหมด" button visible when unread > 0', async ({ page }) => {
    await openBuyHub(page);
    await page.getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await expect(page.getByRole('button', { name: 'ทำเครื่องหมายอ่านทั้งหมด' })).toBeVisible();
  });

  test('clicking mark-all calls API and updates count', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/notifications/read-all', r => {
      apiCalled = true;
      r.fulfill({ json: { success: true } });
    });
    await openBuyHub(page);
    await page.getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await page.getByRole('button', { name: 'ทำเครื่องหมายอ่านทั้งหมด' }).click();
    expect(apiCalled).toBe(true);
    await expect(page.getByText('อ่านหมดแล้ว')).toBeVisible();
  });

  test('shows empty state when no notifications', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.route('**/api/products/my', r => r.fulfill({ json: [] }));
    await page.route('**/api/wishlist', r => r.fulfill({ json: [] }));
    await page.route('**/api/notifications', r => r.fulfill({ json: { notifications: [], unread: 0 } }));
    await page.route('**/api/follows', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ถูกใจ', exact: true }).click();
    await page.getByRole('button', { name: 'การแจ้งเตือน' }).click();
    await expect(page.getByText('ไม่มีการแจ้งเตือน')).toBeVisible();
  });

});

test.describe('V8Hub — Buy: Following', () => {

  test('shows followed sellers', async ({ page }) => {
    await openBuyHub(page);
    await page.getByRole('button', { name: 'กำลังติดตาม' }).click();
    await expect(page.getByText('TechBKK')).toBeVisible();
    await expect(page.getByText('GameLoop')).toBeVisible();
  });

  test('shows seller count in subtitle', async ({ page }) => {
    await openBuyHub(page);
    await page.getByRole('button', { name: 'กำลังติดตาม' }).click();
    await expect(page.getByText('2 ผู้ขายที่คุณติดตามอยู่')).toBeVisible();
  });

  test('"กำลังติดตาม ✓" unfollow button calls API and removes seller', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/follows/toggle', r => {
      apiCalled = true;
      r.fulfill({ json: { success: true } });
    });
    await openBuyHub(page);
    await page.getByRole('button', { name: 'กำลังติดตาม' }).click();
    await page.getByRole('button', { name: /กำลังติดตาม ✓/ }).first().click();
    expect(apiCalled).toBe(true);
    await expect(page.getByText('TechBKK')).not.toBeVisible();
  });

  test('shows empty state when not following anyone', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.route('**/api/products/my', r => r.fulfill({ json: [] }));
    await page.route('**/api/wishlist', r => r.fulfill({ json: [] }));
    await page.route('**/api/notifications', r => r.fulfill({ json: { notifications: [], unread: 0 } }));
    await page.route('**/api/follows', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ถูกใจ', exact: true }).click();
    await page.getByRole('button', { name: 'กำลังติดตาม' }).click();
    await expect(page.getByText('ยังไม่ได้ติดตามผู้ขายคนใด')).toBeVisible();
  });

});

// =============================================================================
// PROFILE TAB
// =============================================================================

test.describe('V8Hub — Profile tab', () => {

  test('shows user name in profile', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'โปรไฟล์ Marketplace' }).first().click();
    await expect(page.getByText('สมชาย ทดสอบ')).toBeVisible();
  });

  test('shows user email in profile', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'โปรไฟล์ Marketplace' }).first().click();
    await expect(page.getByText('test@ploi.dev')).toBeVisible();
  });

  test('profile accessible from buy mode too', async ({ page }) => {
    await openBuyHub(page);
    await page.getByRole('button', { name: 'โปรไฟล์ Marketplace' }).first().click();
    await expect(page.getByText('สมชาย ทดสอบ')).toBeVisible();
  });

  test('shows privacy settings toggles', async ({ page }) => {
    await openSellHub(page);
    await page.getByRole('button', { name: 'โปรไฟล์ Marketplace' }).first().click();
    await expect(page.getByText('รับข่าวสารทางอีเมล')).toBeVisible();
    await expect(page.getByText('แสดงสถานะออนไลน์')).toBeVisible();
  });

});

// =============================================================================
// AUTH GUARD
// =============================================================================

test.describe('V8Hub — Auth guard', () => {

  test('unauthenticated user gets auth modal when clicking ขาย', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'ขาย', exact: true }).click();
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
    await expect(page.getByText('รายการสินค้าของคุณ')).not.toBeVisible();
  });

});
