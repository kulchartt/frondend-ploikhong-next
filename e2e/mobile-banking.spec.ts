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

const MOCK_MB_RESPONSE = {
  charge_id:     'chrg_mb_test_001',
  authorize_uri: 'https://pay.omise.co/offsites/ofsp_mock/authorize',
  amount:        35,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function setupRoutes(page: Page, opts: { balance?: number } = {}) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  await page.route('**/api/coins/balance**', r => r.fulfill({ json: { balance: opts.balance ?? 250 } }));
  await page.route('**/api/coins/packages**', r => r.fulfill({ json: MOCK_PACKAGES }));
  await page.route('**/api/coins/active-features**', r => r.fulfill({ json: [] }));
  await page.route('**/api/coins/transactions**', r => r.fulfill({ json: [] }));
}

async function gotoCoins(page: Page, opts: { balance?: number } = {}) {
  await setupRoutes(page, opts);
  await page.goto('/coins');
  await page.waitForLoadState('networkidle');
}

async function openCheckout(page: Page) {
  await page.getByRole('button', { name: 'ซื้อแพ็คนี้' }).first().click();
  await expect(page.getByText('ยืนยันการชำระเงิน')).toBeVisible({ timeout: 5000 });
}

async function selectMobileBanking(page: Page) {
  const mbBtn = page.locator('.co-pay', { hasText: 'Mobile Banking' });
  await mbBtn.click();
  await expect(mbBtn).toHaveClass(/on/, { timeout: 3000 });
}

// =============================================================================
// PAYMENT METHOD VISIBILITY
// =============================================================================

test.describe('Mobile Banking — Payment method in checkout', () => {

  test('Mobile Banking option is visible in checkout modal', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await expect(page.locator('.co-pay', { hasText: 'Mobile Banking' })).toBeVisible({ timeout: 5000 });
  });

  test('Mobile Banking option shows subtitle about เด้งแอปธนาคาร', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await expect(page.locator('.co-pay-s', { hasText: 'เด้งแอปธนาคาร' })).toBeVisible({ timeout: 5000 });
  });

  test('Mobile Banking is listed between PromptPay and บัตรเครดิต', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    const methods = page.locator('.co-pay');
    await expect(methods).toHaveCount(3, { timeout: 5000 });
    await expect(methods.nth(0)).toContainText('PromptPay');
    await expect(methods.nth(1)).toContainText('Mobile Banking');
    await expect(methods.nth(2)).toContainText('บัตรเครดิต');
  });

  test('clicking Mobile Banking marks it as active', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    await expect(page.locator('.co-pay', { hasText: 'Mobile Banking' })).toHaveClass(/on/);
  });

  test('selecting Mobile Banking deactivates PromptPay', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    // PromptPay active by default
    await expect(page.locator('.co-pay', { hasText: 'PromptPay' })).toHaveClass(/on/);
    await selectMobileBanking(page);
    await expect(page.locator('.co-pay', { hasText: 'PromptPay' })).not.toHaveClass(/on/);
  });

  test('switching back to PromptPay hides bank selector', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    await expect(page.getByText('เลือกธนาคาร')).toBeVisible({ timeout: 3000 });
    await page.locator('.co-pay', { hasText: 'PromptPay' }).click();
    await expect(page.getByText('เลือกธนาคาร')).not.toBeVisible();
  });

});

// =============================================================================
// BANK SELECTOR UI
// =============================================================================

test.describe('Mobile Banking — Bank selector', () => {

  test('bank selector appears only when Mobile Banking is selected', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await expect(page.getByText('เลือกธนาคาร')).not.toBeVisible();
    await selectMobileBanking(page);
    await expect(page.getByText('เลือกธนาคาร')).toBeVisible({ timeout: 3000 });
  });

  test('bank selector shows all 5 banks', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    await expect(page.getByText('KBank KPlus')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('SCB Easy')).toBeVisible();
    await expect(page.getByText('Krungsri KMA')).toBeVisible();
    await expect(page.getByText('Bangkok Bank')).toBeVisible();
    await expect(page.getByText('Krungthai NEXT')).toBeVisible();
  });

  test('KBank is selected by default', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    const kbankBtn = page.locator('button', { hasText: 'KBank KPlus' });
    // KBank should have accent border (active style)
    const borderColor = await kbankBtn.evaluate(el => getComputedStyle(el).borderColor);
    expect(borderColor).not.toBe('');
    // Check checkmark svg is visible next to KBank
    await expect(kbankBtn.locator('svg')).toBeVisible({ timeout: 3000 });
  });

  test('clicking SCB Easy selects it and shows checkmark', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    const scbBtn = page.locator('button', { hasText: 'SCB Easy' });
    await scbBtn.click();
    await expect(scbBtn.locator('svg')).toBeVisible({ timeout: 3000 });
  });

  test('clicking SCB Easy deselects KBank', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('button', { hasText: 'SCB Easy' }).click();
    const kbankBtn = page.locator('button', { hasText: 'KBank KPlus' });
    await expect(kbankBtn.locator('svg')).not.toBeVisible({ timeout: 3000 });
  });

  test('can cycle through all 5 banks', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    const banks = ['SCB Easy', 'Krungsri KMA', 'Bangkok Bank', 'Krungthai NEXT', 'KBank KPlus'];
    for (const bankLabel of banks) {
      await page.locator('button', { hasText: bankLabel }).click();
      await expect(page.locator('button', { hasText: bankLabel }).locator('svg')).toBeVisible({ timeout: 2000 });
    }
  });

  test('bank selector does not appear when บัตรเครดิต is selected', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await page.locator('.co-pay', { hasText: 'บัตรเครดิต' }).click();
    await expect(page.getByText('เลือกธนาคาร')).not.toBeVisible();
  });

});

// =============================================================================
// API CALL — charge-mobile-banking
// =============================================================================

test.describe('Mobile Banking — API call', () => {

  test('clicking ชำระเงิน with Mobile Banking calls POST /api/coins/charge-mobile-banking', async ({ page }) => {
    let called = false;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', r => {
      called = true;
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    // intercept navigation to authorize_uri
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(called).toBe(true);
  });

  test('request body contains package_key', async ({ page }) => {
    let body: any = null;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      body = JSON.parse(r.request().postData() || '{}');
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(body).toHaveProperty('package_key');
    expect(body.package_key).toBe('coins_100');
  });

  test('request body contains bank field', async ({ page }) => {
    let body: any = null;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      body = JSON.parse(r.request().postData() || '{}');
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(body).toHaveProperty('bank');
  });

  test('default bank (KBank) sends bank=kbank', async ({ page }) => {
    let body: any = null;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      body = JSON.parse(r.request().postData() || '{}');
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(body.bank).toBe('kbank');
  });

  test('selecting SCB Easy sends bank=scb', async ({ page }) => {
    let body: any = null;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      body = JSON.parse(r.request().postData() || '{}');
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('button', { hasText: 'SCB Easy' }).click();
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(body.bank).toBe('scb');
  });

  test('selecting Krungsri sends bank=bay', async ({ page }) => {
    let body: any = null;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      body = JSON.parse(r.request().postData() || '{}');
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('button', { hasText: 'Krungsri KMA' }).click();
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(body.bank).toBe('bay');
  });

  test('selecting Bangkok Bank sends bank=bbl', async ({ page }) => {
    let body: any = null;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      body = JSON.parse(r.request().postData() || '{}');
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('button', { hasText: 'Bangkok Bank' }).click();
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(body.bank).toBe('bbl');
  });

  test('selecting Krungthai sends bank=ktb', async ({ page }) => {
    let body: any = null;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      body = JSON.parse(r.request().postData() || '{}');
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('button', { hasText: 'Krungthai NEXT' }).click();
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(body.bank).toBe('ktb');
  });

  test('request uses POST method', async ({ page }) => {
    let method = '';
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      method = r.request().method();
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(method).toBe('POST');
  });

  test('request includes Authorization: Bearer header', async ({ page }) => {
    let headers: Record<string, string> = {};
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      headers = r.request().headers();
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(headers['authorization']).toMatch(/^Bearer /);
  });

  test('shows paying step (spinner) while API is pending', async ({ page }) => {
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', async r => {
      await new Promise(res => setTimeout(res, 500));
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await expect(page.locator('.co-spinner')).toBeVisible({ timeout: 3000 });
  });

  test('API error shows error message and stays on review step', async ({ page }) => {
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', r => r.fulfill({
      status: 500, json: { error: 'เชื่อมต่อธนาคารไม่สำเร็จ' },
    }));
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    // Should fall back to review step and show error
    await expect(page.getByText('ยืนยันการชำระเงิน')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.co-ck-body')).toContainText('ไม่สำเร็จ', { timeout: 5000 });
  });

  test('API call is NOT made when PromptPay is selected', async ({ page }) => {
    let mbCalled = false;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', r => {
      mbCalled = true;
      r.fulfill({ json: MOCK_MB_RESPONSE });
    });
    await page.route('**/api/coins/charge-promptpay**', r => r.fulfill({
      json: { charge_id: 'chrg_pp', qr_code_url: 'https://example.com/qr.png', amount: 35, expires_at: '' },
    }));
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    // PromptPay is default — do NOT select Mobile Banking
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(mbCalled).toBe(false);
  });

});

// =============================================================================
// REDIRECT TO authorize_uri
// =============================================================================

test.describe('Mobile Banking — Redirect to bank app', () => {

  test('successful API call triggers navigation to authorize_uri', async ({ page }) => {
    const authorizeUri = 'https://pay.omise.co/offsites/ofsp_redirect_test/authorize';
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', r => r.fulfill({
      json: { ...MOCK_MB_RESPONSE, authorize_uri: authorizeUri },
    }));

    let navigatedTo = '';
    // Intercept the redirect and capture destination instead of following
    page.on('request', req => {
      if (req.url().includes('ofsp_redirect_test')) navigatedTo = req.url();
    });
    await page.route('**/pay.omise.co/**', r => r.abort());

    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(1000);
    expect(navigatedTo).toContain('ofsp_redirect_test');
  });

});

// =============================================================================
// RETURN FROM BANK — ?payment=success
// =============================================================================

test.describe('Mobile Banking — Return banner (?payment=success)', () => {

  test('banner is shown when arriving at /coins?payment=success', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('/coins?payment=success');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('กำลังตรวจสอบการชำระเงิน')).toBeVisible({ timeout: 8000 });
  });

  test('banner contains "เหรียญจะเข้าบัญชีอัตโนมัติ" text', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('/coins?payment=success');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/เหรียญจะเข้าบัญชีอัตโนมัติ/)).toBeVisible({ timeout: 8000 });
  });

  test('banner has a × dismiss button', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('/coins?payment=success');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('กำลังตรวจสอบการชำระเงิน')).toBeVisible({ timeout: 8000 });
    const dismissBtn = page.locator('button', { hasText: '×' });
    await expect(dismissBtn).toBeVisible({ timeout: 3000 });
  });

  test('clicking × hides the banner', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('/coins?payment=success');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('กำลังตรวจสอบการชำระเงิน')).toBeVisible({ timeout: 8000 });
    await page.locator('button', { hasText: '×' }).click();
    await expect(page.getByText('กำลังตรวจสอบการชำระเงิน')).not.toBeVisible({ timeout: 3000 });
  });

  test('banner is NOT shown on normal /coins page (no ?payment param)', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('กำลังตรวจสอบการชำระเงิน')).not.toBeVisible({ timeout: 3000 });
  });

  test('banner is NOT shown with ?payment=fail', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('/coins?payment=fail');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('กำลังตรวจสอบการชำระเงิน')).not.toBeVisible({ timeout: 3000 });
  });

  test('balance auto-refreshes after return (called more than once)', async ({ page }) => {
    let balCalls = 0;
    await setupRoutes(page);
    await page.route('**/api/coins/balance**', r => {
      balCalls++;
      r.fulfill({ json: { balance: balCalls === 1 ? 250 : 570 } });
    });
    await page.goto('/coins?payment=success');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('กำลังตรวจสอบการชำระเงิน')).toBeVisible({ timeout: 8000 });
    // Wait for the 3s auto-refresh
    await page.waitForTimeout(3500);
    expect(balCalls).toBeGreaterThan(1);
  });

  test('balance shows updated value after auto-refresh', async ({ page }) => {
    let balCalls = 0;
    await setupRoutes(page);
    await page.route('**/api/coins/balance**', r => {
      balCalls++;
      r.fulfill({ json: { balance: balCalls === 1 ? 250 : 570 } });
    });
    await page.goto('/coins?payment=success');
    await page.waitForLoadState('networkidle');
    // Initially 250
    await expect(page.locator('.co-bal-num')).toContainText('250', { timeout: 8000 });
    // After 3s auto-refresh → 570
    await expect(page.locator('.co-bal-num')).toContainText('570', { timeout: 6000 });
  });

  test('topup tab is still accessible after return', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('/coins?payment=success');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'เติมเหรียญ' })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.co-grid')).toBeVisible({ timeout: 5000 });
  });

  test('can still open checkout after return', async ({ page }) => {
    await setupRoutes(page);
    await page.goto('/coins?payment=success');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await expect(page.getByText('ยืนยันการชำระเงิน')).toBeVisible({ timeout: 5000 });
  });

});

// =============================================================================
// MOBILE BANKING UX — DOES NOT BREAK OTHER FLOWS
// =============================================================================

test.describe('Mobile Banking — No regression on other payment methods', () => {

  test('PromptPay flow still works after Mobile Banking is added', async ({ page }) => {
    await setupRoutes(page);
    await page.route('**/api/coins/charge-promptpay**', r => r.fulfill({
      json: { charge_id: 'chrg_pp_reg', qr_code_url: 'https://example.com/qr.png', amount: 35, expires_at: new Date(Date.now() + 300000).toISOString() },
    }));
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    // PromptPay is default — go straight to pay
    await page.locator('.co-ck-foot .btn-primary').click();
    await expect(page.getByText('สแกน QR PromptPay')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('img[alt="PromptPay QR"]')).toBeVisible({ timeout: 5000 });
  });

  test('PromptPay subtitle mentions QR สแกน', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await expect(page.locator('.co-pay-s', { hasText: 'QR สแกนด้วยแอปธนาคาร' })).toBeVisible({ timeout: 5000 });
  });

  test('charge-mobile-banking is NOT called when PromptPay is selected and paid', async ({ page }) => {
    let mbCalled = false;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', r => { mbCalled = true; r.fulfill({ json: MOCK_MB_RESPONSE }); });
    await page.route('**/api/coins/charge-promptpay**', r => r.fulfill({
      json: { charge_id: 'chrg_pp_no_mb', qr_code_url: 'https://example.com/qr.png', amount: 35, expires_at: '' },
    }));
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(mbCalled).toBe(false);
  });

  test('charge-promptpay is NOT called when Mobile Banking is selected and paid', async ({ page }) => {
    let ppCalled = false;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-promptpay**', r => { ppCalled = true; r.fulfill({ json: {} }); });
    await page.route('**/api/coins/charge-mobile-banking**', r => r.fulfill({ json: MOCK_MB_RESPONSE }));
    await page.route('**/pay.omise.co/**', r => r.abort());
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(ppCalled).toBe(false);
  });

  test('consent checkbox still disables pay button for Mobile Banking', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.locator('.co-ck-consent input[type="checkbox"]').uncheck();
    await expect(page.locator('.co-ck-foot .btn-primary')).toBeDisabled({ timeout: 3000 });
  });

  test('ยกเลิก still closes modal when Mobile Banking is selected', async ({ page }) => {
    await gotoCoins(page);
    await openCheckout(page);
    await selectMobileBanking(page);
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.locator('.co-ck-overlay')).not.toBeVisible({ timeout: 3000 });
  });

  test('switching from Mobile Banking to Card does NOT call charge-mobile-banking', async ({ page }) => {
    let mbCalled = false;
    await setupRoutes(page);
    await page.route('**/api/coins/charge-mobile-banking**', r => { mbCalled = true; r.fulfill({ json: MOCK_MB_RESPONSE }); });
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    await openCheckout(page);
    await selectMobileBanking(page);
    // Switch back to card
    await page.locator('.co-pay', { hasText: 'บัตรเครดิต' }).click();
    // Try to pay → OmiseCard.open fires (not MB)
    await page.locator('.co-ck-foot .btn-primary').click();
    await page.waitForTimeout(500);
    expect(mbCalled).toBe(false);
  });

});
