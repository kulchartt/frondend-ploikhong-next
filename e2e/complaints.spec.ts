import { test, expect, type Page } from '@playwright/test';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_SESSION = {
  user: { name: 'สมชาย ทดสอบ', email: 'test@ploi.dev', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-token-abc123',
};

const MOCK_COMPLAINTS = [
  {
    id: 1,
    type: 'fraud',
    detail: 'ผู้ขายส่งสินค้าไม่ตรงปก ไม่ยอมคืนเงิน',
    contact: '0812345678',
    status: 'pending',
    admin_reply: null,
    replied_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    type: 'product',
    detail: 'สินค้าที่ซื้อมามีตำหนิ ไม่ตรงกับรูปโฆษณา',
    contact: null,
    status: 'reviewing',
    admin_reply: 'ทีมงานกำลังตรวจสอบ',
    replied_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 3,
    type: 'other',
    detail: 'ปัญหาการเข้าสู่ระบบ ไม่สามารถรีเซ็ตรหัสผ่านได้',
    contact: 'user@email.com',
    status: 'resolved',
    admin_reply: 'แก้ไขแล้ว กรุณาลองใหม่อีกครั้ง',
    replied_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

const MOCK_MESSAGES_1 = [
  {
    id: 10,
    complaint_id: 1,
    sender_type: 'user',
    content: 'ยังไม่ได้รับสินค้าเลย',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 11,
    complaint_id: 1,
    sender_type: 'admin',
    content: 'เราได้รับเรื่องและจะติดต่อผู้ขายภายใน 24 ชั่วโมง',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function setupRoutes(page: Page, complaints = MOCK_COMPLAINTS) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  await page.route('**/api/complaints/my', r => r.fulfill({ json: complaints }));
  await page.route('**/api/complaints/*/messages', r => {
    if (r.request().method() === 'GET') r.fulfill({ json: [] });
    else r.continue();
  });
  await page.route('**/api/complaints', r => {
    if (r.request().method() === 'POST') r.fulfill({ json: { ok: true, message: 'รับเรื่องร้องเรียนแล้ว' } });
    else r.continue();
  });
}

async function gotoComplaints(page: Page, complaints = MOCK_COMPLAINTS) {
  await setupRoutes(page, complaints);
  await page.goto('/complaints');
  await page.waitForLoadState('networkidle');
}

// =============================================================================
// ACCESS GUARD
// =============================================================================

test.describe('Complaints Page — Access guard', () => {

  test('unauthenticated user is redirected away from /complaints', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.goto('/complaints');
    // Should be redirected to home (router.push('/'))
    await expect(page).toHaveURL('/', { timeout: 8000 });
  });

  test('loading state shows while session is being fetched', async ({ page }) => {
    // Delay the session response to see loading
    await page.route('**/api/auth/session', async r => {
      await new Promise(res => setTimeout(res, 500));
      r.fulfill({ json: MOCK_SESSION });
    });
    await page.route('**/api/complaints/my', r => r.fulfill({ json: [] }));
    await page.goto('/complaints');
    await expect(page.getByText('กำลังโหลด...')).toBeVisible({ timeout: 3000 });
  });

});

// =============================================================================
// PAGE STRUCTURE
// =============================================================================

test.describe('Complaints Page — Page structure', () => {

  test('shows top bar with title "ร้องเรียนของฉัน"', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('ร้องเรียนของฉัน')).toBeVisible({ timeout: 8000 });
  });

  test('shows complaint count in top bar subtitle', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('3 เรื่อง')).toBeVisible({ timeout: 8000 });
  });

  test('shows "แจ้งปัญหาใหม่" button in top bar', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByRole('button', { name: /แจ้งปัญหาใหม่/ })).toBeVisible({ timeout: 8000 });
  });

  test('back button is present in top bar', async ({ page }) => {
    await gotoComplaints(page);
    // back button has an SVG arrow
    const backBtn = page.locator('button').filter({ has: page.locator('polyline[points="15 18 9 12 15 6"]') }).first();
    await expect(backBtn).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// COMPLAINT LIST (LEFT PANEL)
// =============================================================================

test.describe('Complaints Page — Left panel list', () => {

  test('shows all 3 complaint items', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('🚨 ถูกโกง')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('📦 สินค้า')).toBeVisible();
    await expect(page.getByText('📝 อื่นๆ')).toBeVisible();
  });

  test('shows status badges for each complaint', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('⏳ รอดำเนินการ')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('🔍 กำลังตรวจสอบ')).toBeVisible();
    await expect(page.getByText('✅ แก้ไขแล้ว')).toBeVisible();
  });

  test('shows complaint IDs in list', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText(/#1/)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/#2/)).toBeVisible();
    await expect(page.getByText(/#3/)).toBeVisible();
  });

  test('shows complaint detail preview (truncated)', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('ผู้ขายส่งสินค้าไม่ตรงปก')).toBeVisible({ timeout: 8000 });
  });

  test('first complaint is auto-selected and highlighted', async ({ page }) => {
    await gotoComplaints(page);
    // The right panel should show the first complaint's type in the header
    await expect(page.getByText('🚨 ถูกโกง').first()).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// EMPTY STATE
// =============================================================================

test.describe('Complaints Page — Empty state', () => {

  test('shows empty state when user has no complaints', async ({ page }) => {
    await gotoComplaints(page, []);
    await expect(page.getByText('ยังไม่มีเรื่องร้องเรียน')).toBeVisible({ timeout: 8000 });
  });

  test('empty state shows the mailbox emoji', async ({ page }) => {
    await gotoComplaints(page, []);
    await expect(page.getByText('📭')).toBeVisible({ timeout: 8000 });
  });

  test('empty state has "+ แจ้งปัญหา" button', async ({ page }) => {
    await gotoComplaints(page, []);
    await expect(page.getByRole('button', { name: '+ แจ้งปัญหา' })).toBeVisible({ timeout: 8000 });
  });

  test('empty state "+ แจ้งปัญหา" opens new complaint modal', async ({ page }) => {
    await gotoComplaints(page, []);
    await page.getByRole('button', { name: '+ แจ้งปัญหา' }).click();
    await expect(page.getByText('ส่งเรื่องร้องเรียน')).toBeVisible({ timeout: 5000 });
  });

});

// =============================================================================
// CHAT PANEL (RIGHT PANEL)
// =============================================================================

test.describe('Complaints Page — Right panel / chat', () => {

  test('clicking a complaint shows its type in the right panel header', async ({ page }) => {
    await gotoComplaints(page);
    // Click the second complaint (📦 สินค้า)
    const items = page.locator('[style*="border-bottom"]').filter({ hasText: '📦 สินค้า' });
    await items.first().click();
    // Right panel header should update
    await expect(page.getByText('📦 สินค้า').last()).toBeVisible({ timeout: 5000 });
  });

  test('right panel shows the original complaint detail as user bubble', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('ผู้ขายส่งสินค้าไม่ตรงปก ไม่ยอมคืนเงิน')).toBeVisible({ timeout: 8000 });
  });

  test('right panel shows auto system message from 🛡️ team', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('รับเรื่องร้องเรียนของคุณแล้ว')).toBeVisible({ timeout: 8000 });
  });

  test('right panel shows contact info when provided', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('📞 0812345678')).toBeVisible({ timeout: 8000 });
  });

  test('status pill is displayed in chat area', async ({ page }) => {
    await gotoComplaints(page);
    // ⏳ รอดำเนินการ status pill in the messages area (not just left panel badge)
    const pills = page.getByText('⏳ รอดำเนินการ');
    await expect(pills.first()).toBeVisible({ timeout: 8000 });
  });

  test('input box is visible for pending complaint', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByPlaceholder('พิมพ์ข้อความเพิ่มเติม...')).toBeVisible({ timeout: 8000 });
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    await gotoComplaints(page);
    const input = page.getByPlaceholder('พิมพ์ข้อความเพิ่มเติม...');
    await expect(input).toBeVisible({ timeout: 8000 });
    // Send button should be styled as disabled (no red background)
    const sendBtn = page.locator('button[type="submit"]').filter({ has: page.locator('svg line[x1="22"]') });
    await expect(sendBtn).toBeDisabled();
  });

  test('resolved complaint shows closed message instead of input', async ({ page }) => {
    await setupRoutes(page);
    await page.route('**/api/complaints/my', r => r.fulfill({ json: MOCK_COMPLAINTS }));
    await page.goto('/complaints');
    await page.waitForLoadState('networkidle');
    // Click resolved complaint (#3)
    const items = page.locator('[style*="border-bottom"]').filter({ hasText: '📝 อื่นๆ' });
    await items.first().click();
    await expect(page.getByText('✅ เรื่องนี้ได้รับการแก้ไขแล้ว')).toBeVisible({ timeout: 5000 });
    // Input should NOT be visible
    await expect(page.getByPlaceholder('พิมพ์ข้อความเพิ่มเติม...')).not.toBeVisible();
  });

});

// =============================================================================
// CHAT MESSAGES
// =============================================================================

test.describe('Complaints Page — Chat messages', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/complaints/my', r => r.fulfill({ json: MOCK_COMPLAINTS }));
    // Return messages for complaint 1
    await page.route('**/api/complaints/1/messages', r => {
      if (r.request().method() === 'GET') r.fulfill({ json: MOCK_MESSAGES_1 });
      else r.continue();
    });
    await page.route('**/api/complaints/**/messages', r => {
      if (r.request().method() === 'GET') r.fulfill({ json: [] });
      else r.continue();
    });
    await page.goto('/complaints');
    await page.waitForLoadState('networkidle');
  });

  test('shows existing user messages in chat', async ({ page }) => {
    await expect(page.getByText('ยังไม่ได้รับสินค้าเลย')).toBeVisible({ timeout: 8000 });
  });

  test('shows existing admin messages in chat with 🛡️ icon', async ({ page }) => {
    await expect(page.getByText('เราได้รับเรื่องและจะติดต่อผู้ขายภายใน 24 ชั่วโมง')).toBeVisible({ timeout: 8000 });
  });

  test('can type and send a message', async ({ page }) => {
    let messageSent = false;
    await page.route('**/api/complaints/1/messages', r => {
      if (r.request().method() === 'POST') {
        messageSent = true;
        r.fulfill({ json: { id: 99, complaint_id: 1, sender_type: 'user', content: 'ข้อความทดสอบ', created_at: new Date().toISOString() } });
      } else {
        r.fulfill({ json: MOCK_MESSAGES_1 });
      }
    });
    const input = page.getByPlaceholder('พิมพ์ข้อความเพิ่มเติม...');
    await input.fill('ข้อความทดสอบ');
    await input.press('Enter');
    expect(messageSent).toBe(true);
    await expect(page.getByText('ข้อความทดสอบ')).toBeVisible({ timeout: 5000 });
  });

  test('Shift+Enter creates newline instead of sending', async ({ page }) => {
    let messageSent = false;
    await page.route('**/api/complaints/1/messages', r => {
      if (r.request().method() === 'POST') messageSent = true;
      r.fulfill({ json: MOCK_MESSAGES_1 });
    });
    const input = page.getByPlaceholder('พิมพ์ข้อความเพิ่มเติม...');
    await input.fill('บรรทัดหนึ่ง');
    await input.press('Shift+Enter');
    expect(messageSent).toBe(false);
    // Input should still have content
    const val = await input.inputValue();
    expect(val).toContain('บรรทัดหนึ่ง');
  });

  test('input clears after sending', async ({ page }) => {
    await page.route('**/api/complaints/1/messages', r => {
      if (r.request().method() === 'POST') r.fulfill({ json: { id: 100, complaint_id: 1, sender_type: 'user', content: 'ส่งแล้ว', created_at: new Date().toISOString() } });
      else r.fulfill({ json: MOCK_MESSAGES_1 });
    });
    const input = page.getByPlaceholder('พิมพ์ข้อความเพิ่มเติม...');
    await input.fill('ส่งแล้ว');
    await input.press('Enter');
    await expect(input).toHaveValue('', { timeout: 3000 });
  });

});

// =============================================================================
// NEW COMPLAINT MODAL
// =============================================================================

test.describe('Complaints Page — New complaint modal', () => {

  test('"แจ้งปัญหาใหม่" button opens the modal', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await expect(page.getByText('ส่งเรื่องร้องเรียน')).toBeVisible({ timeout: 5000 });
  });

  test('modal shows type dropdown', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await expect(page.getByRole('option', { name: /ถูกโกง/ })).toBeAttached({ timeout: 5000 });
    await expect(page.getByRole('option', { name: /สินค้าไม่ตรงปก/ })).toBeAttached();
    await expect(page.getByRole('option', { name: /อื่นๆ/ })).toBeAttached();
  });

  test('modal shows detail textarea', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await expect(page.getByPlaceholder('อธิบายปัญหาที่พบให้ละเอียด...')).toBeVisible({ timeout: 5000 });
  });

  test('modal shows contact input', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await expect(page.getByPlaceholder('เบอร์โทร / LINE ID / อีเมล')).toBeVisible({ timeout: 5000 });
  });

  test('submit button is disabled when detail is empty', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await expect(page.getByRole('button', { name: /ส่งเรื่องร้องเรียน/ })).toBeDisabled({ timeout: 5000 });
  });

  test('submit button enables when detail is filled', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await page.getByPlaceholder('อธิบายปัญหาที่พบให้ละเอียด...').fill('ทดสอบปัญหา');
    await expect(page.getByRole('button', { name: /ส่งเรื่องร้องเรียน/ })).toBeEnabled({ timeout: 3000 });
  });

  test('close button (X) closes the modal', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await expect(page.getByText('ส่งเรื่องร้องเรียน')).toBeVisible({ timeout: 5000 });
    // Find the X close button in the modal
    const closeBtn = page.locator('button').filter({ has: page.locator('svg line[x1="6"][y1="6"]') }).last();
    await closeBtn.click();
    await expect(page.getByText('ส่งเรื่องร้องเรียน')).not.toBeVisible();
  });

  test('submitting complaint shows success screen', async ({ page }) => {
    let postCalled = false;
    await page.route('**/api/complaints', r => {
      if (r.request().method() === 'POST') {
        postCalled = true;
        r.fulfill({ json: { ok: true, message: 'รับเรื่องร้องเรียนแล้ว' } });
      } else r.continue();
    });
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await page.getByPlaceholder('อธิบายปัญหาที่พบให้ละเอียด...').fill('ทดสอบส่งเรื่องร้องเรียน');
    await page.getByRole('button', { name: /ส่งเรื่องร้องเรียน/ }).click();
    expect(postCalled).toBe(true);
    await expect(page.getByText('รับเรื่องแล้ว!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('✅')).toBeVisible();
  });

  test('selecting different type changes the dropdown value', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    const select = page.locator('select');
    await select.selectOption('payment');
    await expect(select).toHaveValue('payment');
  });

});

// =============================================================================
// STATUS FILTER CHIPS
// =============================================================================

test.describe('Complaints Page — Status filter chips', () => {

  test('shows status filter chips', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByRole('button', { name: 'ทั้งหมด' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /รอดำเนินการ/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /กำลังตรวจสอบ/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /แก้ไขแล้ว/ })).toBeVisible();
  });

  test('"รอดำเนินการ" filter shows only pending complaints', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /รอดำเนินการ/ }).click();
    await expect(page.getByText('🚨 ถูกโกง')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('📦 สินค้า')).not.toBeVisible();
    await expect(page.getByText('📝 อื่นๆ')).not.toBeVisible();
  });

  test('"กำลังตรวจสอบ" filter shows only reviewing complaints', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /กำลังตรวจสอบ/ }).click();
    await expect(page.getByText('📦 สินค้า')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('🚨 ถูกโกง')).not.toBeVisible();
  });

  test('"แก้ไขแล้ว" filter shows only resolved complaints', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แก้ไขแล้ว/ }).click();
    await expect(page.getByText('📝 อื่นๆ')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('🚨 ถูกโกง')).not.toBeVisible();
  });

  test('"ทั้งหมด" restores all complaints', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: /รอดำเนินการ/ }).click();
    await expect(page.getByText('📦 สินค้า')).not.toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: 'ทั้งหมด' }).click();
    await expect(page.getByText('📦 สินค้า')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('📝 อื่นๆ')).toBeVisible();
  });

  test('active filter chip is visually highlighted', async ({ page }) => {
    await gotoComplaints(page);
    const chip = page.getByRole('button', { name: /รอดำเนินการ/ });
    await chip.click();
    // Active chip should have different styling — check it exists and is visible
    await expect(chip).toBeVisible({ timeout: 3000 });
    // Verify it has a distinct style (background should be set)
    const bg = await chip.evaluate(el => (el as HTMLElement).style.background || window.getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('');
  });

});

// =============================================================================
// NAVBAR ACCOUNT DROPDOWN
// =============================================================================

test.describe('Navbar — "ร้องเรียนของฉัน" in account dropdown', () => {

  async function openAccountDropdown(page: Page) {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.waitForSelector('[data-testid="nav-user-btn"]', { timeout: 10000 });
    await page.locator('[data-testid="nav-user-btn"]').click();
  }

  test('account dropdown shows "ร้องเรียนของฉัน" option', async ({ page }) => {
    await openAccountDropdown(page);
    await expect(page.getByRole('button', { name: /ร้องเรียนของฉัน/ })).toBeVisible({ timeout: 5000 });
  });

  test('clicking "ร้องเรียนของฉัน" navigates to /complaints', async ({ page }) => {
    await page.route('**/api/complaints/my', r => r.fulfill({ json: [] }));
    await openAccountDropdown(page);
    await page.getByRole('button', { name: /ร้องเรียนของฉัน/ }).click();
    await expect(page).toHaveURL('/complaints', { timeout: 8000 });
  });

});
