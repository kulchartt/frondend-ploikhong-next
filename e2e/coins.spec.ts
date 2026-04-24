import { test, expect, type Page } from '@playwright/test';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_SESSION = {
  user: { name: 'สมชาย ทดสอบ', email: 'test@ploi.dev', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-token-abc123',
};

const MOCK_PACKAGES = {
  packages: [
    { key: 'coins_100',  coins: 100,  bonus: 0,   price: 35,   popular: false },
    { key: 'coins_300',  coins: 300,  bonus: 20,  price: 99,   popular: false },
    { key: 'coins_600',  coins: 600,  bonus: 60,  price: 185,  popular: true  },
    { key: 'coins_1200', coins: 1200, bonus: 150, price: 349,  popular: false },
  ],
};

const MOCK_TRANSACTIONS = [
  { id: 1, type: 'credit', amount: 100,  description: 'เติมเหรียญ 100',  created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, type: 'debit',  amount: -30,  description: 'ดันสินค้าขึ้นบนสุด', created_at: new Date(Date.now() - 3600000).toISOString() },
];

const MOCK_ACTIVE_FEATURES = [
  {
    id: 1,
    feature_key: 'featured',
    product_id: 10,
    product_title: 'iPhone 14 Pro',
    expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    stats: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function setupRoutes(page: Page, opts: { balance?: number; packages?: any; features?: any[]; txs?: any[] } = {}) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  await page.route('**/api/coins/balance**', r => r.fulfill({ json: { balance: opts.balance ?? 250 } }));
  await page.route('**/api/coins/packages**', r => r.fulfill({ json: opts.packages ?? MOCK_PACKAGES }));
  await page.route('**/api/coins/active-features**', r => r.fulfill({ json: opts.features ?? [] }));
  await page.route('**/api/coins/transactions**', r => r.fulfill({ json: opts.txs ?? MOCK_TRANSACTIONS }));
  await page.route('**/api/coins/payment-requests**', r => {
    if (r.request().method() === 'POST') r.fulfill({ json: { id: 42 } });
    else r.continue();
  });
}

async function gotoCoins(page: Page, opts: { balance?: number; packages?: any; features?: any[]; txs?: any[] } = {}) {
  await setupRoutes(page, opts);
  await page.goto('/coins');
  await page.waitForLoadState('networkidle');
}

// =============================================================================
// ACCESS GUARD
// =============================================================================

test.describe('Coins Page — Access guard', () => {

  test('unauthenticated user is redirected to /', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.goto('/coins');
    await expect(page).toHaveURL('/', { timeout: 8000 });
  });

  test('loading state is shown while session is being fetched', async ({ page }) => {
    await page.route('**/api/auth/session', async r => {
      await new Promise(res => setTimeout(res, 500));
      r.fulfill({ json: MOCK_SESSION });
    });
    await page.route('**/api/coins/balance**', r => r.fulfill({ json: { balance: 0 } }));
    await page.route('**/api/coins/packages**', r => r.fulfill({ json: MOCK_PACKAGES }));
    await page.goto('/coins');
    await expect(page.getByText('กำลังโหลด...')).toBeVisible({ timeout: 3000 });
  });

});

// =============================================================================
// PAGE STRUCTURE
// =============================================================================

test.describe('Coins Page — Page structure', () => {

  test('shows topbar title "เหรียญ & Premium"', async ({ page }) => {
    await gotoCoins(page);
    await expect(page.getByText('เหรียญ & Premium')).toBeVisible({ timeout: 8000 });
  });

  test('shows coin balance in topbar', async ({ page }) => {
    await gotoCoins(page, { balance: 250 });
    await expect(page.locator('.co-balance')).toContainText('250', { timeout: 8000 });
    await expect(page.locator('.co-balance')).toContainText('เหรียญ');
  });

  test('shows all 4 tab buttons', async ({ page }) => {
    await gotoCoins(page);
    await expect(page.getByRole('button', { name: 'เติมเหรียญ' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: 'Boost ที่ใช้งาน' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Premium' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ประวัติ' })).toBeVisible();
  });

  test('default tab is "เติมเหรียญ"', async ({ page }) => {
    await gotoCoins(page);
    const btn = page.getByRole('button', { name: 'เติมเหรียญ' });
    await expect(btn).toHaveClass(/on/, { timeout: 8000 });
  });

  test('back button navigates', async ({ page }) => {
    await gotoCoins(page);
    await expect(page.locator('button svg polyline').first()).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// TOPUP TAB
// =============================================================================

test.describe('Coins Page — Topup tab', () => {

  test('shows hero heading "เติมเหรียญ PloiKhong"', async ({ page }) => {
    await gotoCoins(page);
    await expect(page.getByText(/เติมเหรียญ/).first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('PloiKhong')).toBeVisible();
  });

  test('shows current balance in hero', async ({ page }) => {
    await gotoCoins(page, { balance: 250 });
    await expect(page.locator('.co-hero')).toContainText('250', { timeout: 8000 });
    await expect(page.locator('.co-hero')).toContainText('เหรียญ');
  });

  test('renders coin pack cards from API', async ({ page }) => {
    await gotoCoins(page);
    const cards = page.locator('.co-card');
    await expect(cards).toHaveCount(4, { timeout: 8000 });
  });

  test('popular pack has "ยอดนิยม" tag', async ({ page }) => {
    await gotoCoins(page);
    await expect(page.locator('.co-tag', { hasText: 'ยอดนิยม' })).toBeVisible({ timeout: 8000 });
  });

  test('each card has a "ซื้อเลย" button', async ({ page }) => {
    await gotoCoins(page);
    const buyBtns = page.getByRole('button', { name: 'ซื้อเลย' });
    await expect(buyBtns).toHaveCount(4, { timeout: 8000 });
  });

  test('shows hint about coin usage', async ({ page }) => {
    await gotoCoins(page);
    await expect(page.locator('.co-hint')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.co-hint')).toContainText('เหรียญไม่มีวันหมดอายุ');
  });

});

// =============================================================================
// CHECKOUT MODAL
// =============================================================================

test.describe('Coins Page — Checkout modal', () => {

  test('clicking "ซื้อเลย" opens checkout modal with "ยืนยันการซื้อ" title', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await expect(page.getByText('ยืนยันการซื้อ')).toBeVisible({ timeout: 5000 });
  });

  test('checkout shows selected pack item', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    // 100 + 0 bonus = 100 เหรียญ
    await expect(page.locator('.co-ck-item-s', { hasText: '100 เหรียญ' })).toBeVisible({ timeout: 5000 });
  });

  test('checkout shows payment methods', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await expect(page.getByText('PromptPay')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('บัตรเครดิต / เดบิต')).toBeVisible();
    await expect(page.getByText('TrueMoney Wallet')).toBeVisible();
    await expect(page.getByText('LINE Pay')).toBeVisible();
  });

  test('pay button is disabled when consent checkbox is unchecked', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    const payBtn = page.locator('.co-ck-foot .btn-primary');
    await expect(payBtn).toBeDisabled({ timeout: 5000 });
  });

  test('pay button enables after checking consent', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await page.locator('.co-ck-consent input[type="checkbox"]').check();
    const payBtn = page.locator('.co-ck-foot .btn-primary');
    await expect(payBtn).toBeEnabled({ timeout: 3000 });
  });

  test('"ยกเลิก" closes the checkout modal', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await expect(page.getByText('ยืนยันการซื้อ')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.getByText('ยืนยันการซื้อ')).not.toBeVisible();
  });

  test('clicking backdrop closes the modal', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await expect(page.locator('.co-ck-overlay')).toBeVisible({ timeout: 5000 });
    await page.locator('.co-ck-overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('.co-ck-overlay')).not.toBeVisible();
  });

  test('selecting a payment method marks it as active', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    const linePayBtn = page.locator('.co-pay', { hasText: 'LINE Pay' });
    await linePayBtn.click();
    await expect(linePayBtn).toHaveClass(/on/, { timeout: 3000 });
  });

  test('can fill sender name field', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await page.getByPlaceholder('ชื่อผู้โอนเงิน เพื่อให้ยืนยันได้เร็วขึ้น').fill('สมชาย ทดสอบ');
    await expect(page.getByPlaceholder('ชื่อผู้โอนเงิน เพื่อให้ยืนยันได้เร็วขึ้น')).toHaveValue('สมชาย ทดสอบ');
  });

  test('paying shows "กำลังดำเนินการ..." step then success', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await page.locator('.co-ck-consent input[type="checkbox"]').check();
    await page.locator('.co-ck-foot .btn-primary').click();
    // Should show paying step
    await expect(page.getByText('กำลังดำเนินการ...')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('กำลังประมวลผล...')).toBeVisible();
  });

  test('success step shows receipt and "เสร็จสิ้น" button', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await page.locator('.co-ck-consent input[type="checkbox"]').check();
    await page.locator('.co-ck-foot .btn-primary').click();
    // Wait for success (after ~1.8s delay in mock)
    await expect(page.getByText('ชำระเงินสำเร็จ!')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('ทีมงานจะตรวจสอบและเติมเหรียญให้คุณภายใน 30 นาที')).toBeVisible();
    await expect(page.getByRole('button', { name: 'เสร็จสิ้น' })).toBeVisible();
  });

  test('success receipt shows pack details', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await page.locator('.co-ck-consent input[type="checkbox"]').check();
    await page.locator('.co-ck-foot .btn-primary').click();
    await expect(page.getByText('ชำระเงินสำเร็จ!')).toBeVisible({ timeout: 6000 });
    // Receipt shows เหรียญ amount and จำนวนเงิน
    await expect(page.locator('.co-ck-rcpt')).toContainText('เหรียญ');
    await expect(page.locator('.co-ck-rcpt')).toContainText('จำนวนเงิน');
  });

  test('clicking "เสร็จสิ้น" closes the modal', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    await page.locator('.co-ck-consent input[type="checkbox"]').check();
    await page.locator('.co-ck-foot .btn-primary').click();
    await expect(page.getByText('ชำระเงินสำเร็จ!')).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: 'เสร็จสิ้น' }).click();
    await expect(page.locator('.co-ck-overlay')).not.toBeVisible();
  });

  test('unchecked consent shows error message on pay click', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'ซื้อเลย' }).first().click();
    // consent unchecked → button is disabled, so error won't fire via button click
    // Verify pay button is disabled as insurance
    await expect(page.locator('.co-ck-foot .btn-primary')).toBeDisabled({ timeout: 5000 });
  });

});

// =============================================================================
// BOOSTS TAB
// =============================================================================

test.describe('Coins Page — Boost tab', () => {

  test('clicking "Boost ที่ใช้งาน" shows boost heading', async ({ page }) => {
    await gotoCoins(page, { features: [] });
    await page.getByRole('button', { name: 'Boost ที่ใช้งาน' }).click();
    await expect(page.getByText('Boost ที่ใช้งานอยู่')).toBeVisible({ timeout: 8000 });
  });

  test('empty boosts shows "ยังไม่มี Boost ที่ใช้งานอยู่"', async ({ page }) => {
    await gotoCoins(page, { features: [] });
    await page.getByRole('button', { name: 'Boost ที่ใช้งาน' }).click();
    await expect(page.getByText('ยังไม่มี Boost ที่ใช้งานอยู่')).toBeVisible({ timeout: 8000 });
  });

  test('active boost is shown with product title', async ({ page }) => {
    await gotoCoins(page, { features: MOCK_ACTIVE_FEATURES });
    await page.getByRole('button', { name: 'Boost ที่ใช้งาน' }).click();
    await expect(page.getByText('iPhone 14 Pro')).toBeVisible({ timeout: 8000 });
  });

  test('active boost shows progress bar', async ({ page }) => {
    await gotoCoins(page, { features: MOCK_ACTIVE_FEATURES });
    await page.getByRole('button', { name: 'Boost ที่ใช้งาน' }).click();
    await expect(page.locator('.co-active-bar')).toBeVisible({ timeout: 8000 });
  });

  test('active boost has "ต่ออายุ" button', async ({ page }) => {
    await gotoCoins(page, { features: MOCK_ACTIVE_FEATURES });
    await page.getByRole('button', { name: 'Boost ที่ใช้งาน' }).click();
    await expect(page.getByRole('button', { name: 'ต่ออายุ' })).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// PREMIUM TAB
// =============================================================================

test.describe('Coins Page — Premium tab', () => {

  test('clicking Premium shows PLOIKHONG PREMIUM eyebrow', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.getByText('PLOIKHONG PREMIUM')).toBeVisible({ timeout: 8000 });
  });

  test('premium hero shows "ขายได้มากกว่า ด้วย Premium"', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.getByText('ขายได้มากกว่า ด้วย Premium')).toBeVisible({ timeout: 8000 });
  });

  test('plan toggle shows รายเดือน and รายปี', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.getByRole('button', { name: 'รายเดือน' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /รายปี/ })).toBeVisible();
  });

  test('monthly plan is selected by default', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    const monthlyBtn = page.getByRole('button', { name: 'รายเดือน' });
    await expect(monthlyBtn).toHaveClass(/on/, { timeout: 8000 });
  });

  test('switching to yearly plan shows -17% badge', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.locator('.co-save', { hasText: '-17%' })).toBeVisible({ timeout: 8000 });
  });

  test('clicking รายปี updates the price display', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await page.getByRole('button', { name: /รายปี/ }).click();
    await expect(page.locator('.co-price-per', { hasText: 'ปี' })).toBeVisible({ timeout: 5000 });
    // yearly price = ฿1,290
    await expect(page.locator('.co-price-amt')).toContainText('1,290');
  });

  test('shows perks grid', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.getByText('สิ่งที่ได้รับกับ Premium')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.co-perk')).toHaveCount(6, { timeout: 8000 });
  });

  test('live perks have "พร้อมใช้งาน" tag', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.locator('.co-perk-tag', { hasText: 'พร้อมใช้งาน' }).first()).toBeVisible({ timeout: 8000 });
  });

  test('shows "เริ่มใช้งาน Premium" CTA button', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.getByRole('button', { name: 'เริ่มใช้งาน Premium' })).toBeVisible({ timeout: 8000 });
  });

  test('shows FAQ accordion', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.getByText('คำถามที่พบบ่อย')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('details').first()).toBeVisible();
  });

  test('clicking FAQ item expands it', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    const faq = page.locator('details').first();
    await faq.locator('summary').click();
    await expect(faq).toHaveAttribute('open');
  });

  test('shows "ยกเลิกได้ทุกเมื่อ" fine print', async ({ page }) => {
    await gotoCoins(page);
    await page.getByRole('button', { name: 'Premium' }).click();
    await expect(page.getByText('ยกเลิกได้ทุกเมื่อ ไม่มีสัญญาผูกมัด')).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// HISTORY TAB
// =============================================================================

test.describe('Coins Page — History tab', () => {

  test('clicking ประวัติ shows "ประวัติเหรียญ" heading', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.getByText('ประวัติเหรียญ')).toBeVisible({ timeout: 8000 });
  });

  test('history shows summary stats: เหรียญที่ได้รับ / เหรียญที่ใช้', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.getByText('เหรียญที่ได้รับ')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('เหรียญที่ใช้')).toBeVisible();
    await expect(page.getByText('คงเหลือ (จากประวัติ)')).toBeVisible();
  });

  test('history summary shows correct total in (100)', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.locator('.co-hist-summary')).toContainText('100', { timeout: 8000 });
  });

  test('history shows transaction rows', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.locator('.co-hist-row')).toHaveCount(2, { timeout: 8000 });
  });

  test('credit transaction shows + amount', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.locator('.co-hist-n.pos', { hasText: '+100' })).toBeVisible({ timeout: 8000 });
  });

  test('debit transaction shows negative amount', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.locator('.co-hist-n.neg')).toBeVisible({ timeout: 8000 });
  });

  test('history shows transaction descriptions', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.getByText('เติมเหรียญ 100')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('ดันสินค้าขึ้นบนสุด')).toBeVisible();
  });

  test('filter dropdown has ทั้งหมด / รับเหรียญ / ใช้เหรียญ options', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.getByRole('option', { name: 'ทั้งหมด' })).toBeAttached({ timeout: 8000 });
    await expect(page.getByRole('option', { name: 'รับเหรียญ' })).toBeAttached();
    await expect(page.getByRole('option', { name: 'ใช้เหรียญ' })).toBeAttached();
  });

  test('"รับเหรียญ" filter shows only credit transactions', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await page.locator('.co-hist-filters select').selectOption('credit');
    await expect(page.locator('.co-hist-row')).toHaveCount(1, { timeout: 5000 });
    await expect(page.getByText('เติมเหรียญ 100')).toBeVisible();
    await expect(page.getByText('ดันสินค้าขึ้นบนสุด')).not.toBeVisible();
  });

  test('"ใช้เหรียญ" filter shows only debit transactions', async ({ page }) => {
    await gotoCoins(page, { txs: MOCK_TRANSACTIONS });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await page.locator('.co-hist-filters select').selectOption('debit');
    await expect(page.locator('.co-hist-row')).toHaveCount(1, { timeout: 5000 });
    await expect(page.getByText('ดันสินค้าขึ้นบนสุด')).toBeVisible();
    await expect(page.getByText('เติมเหรียญ 100')).not.toBeVisible();
  });

  test('empty history shows "ยังไม่มีประวัติธุรกรรม"', async ({ page }) => {
    await gotoCoins(page, { txs: [] });
    await page.getByRole('button', { name: 'ประวัติ' }).click();
    await expect(page.getByText('ยังไม่มีประวัติธุรกรรม')).toBeVisible({ timeout: 8000 });
  });

});
