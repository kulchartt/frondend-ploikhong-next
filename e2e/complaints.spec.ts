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
    if (r.request().method() === 'POST') r.fulfill({ json: { ok: true } });
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

  test('unauthenticated user is redirected to /', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.goto('/complaints');
    await expect(page).toHaveURL('/', { timeout: 8000 });
  });

  test('loading state shows while session is fetched', async ({ page }) => {
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

  test('shows topbar with title "ร้องเรียนของฉัน"', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('ร้องเรียนของฉัน')).toBeVisible({ timeout: 8000 });
  });

  test('shows complaint count stat "เรื่องทั้งหมด"', async ({ page }) => {
    await gotoComplaints(page);
    // cx-top-stats shows {complaints.length} + 'เรื่องทั้งหมด'
    await expect(page.getByText('เรื่องทั้งหมด')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.cx-stat').filter({ hasText: '3' }).first()).toBeVisible();
  });

  test('shows "แจ้งปัญหาใหม่" button in topbar', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByRole('button', { name: /แจ้งปัญหาใหม่/ })).toBeVisible({ timeout: 8000 });
  });

  test('back button is present in topbar', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.locator('.cx-back')).toBeVisible({ timeout: 8000 });
  });

  test('search input is visible in left panel', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByPlaceholder('ค้นหาเรื่องร้องเรียน...')).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// COMPLAINT LIST (left panel)
// =============================================================================

test.describe('Complaints Page — Left panel list', () => {

  test('shows type labels without emoji', async ({ page }) => {
    await gotoComplaints(page);
    // TYPE_LABEL: fraud → 'ถูกโกง / หลอกลวง', product → 'สินค้าไม่ตรงปก', other → 'อื่นๆ'
    await expect(page.getByText('ถูกโกง / หลอกลวง').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('สินค้าไม่ตรงปก').first()).toBeVisible();
    await expect(page.getByText('อื่นๆ').first()).toBeVisible();
  });

  test('shows STATUS_META labels in list items', async ({ page }) => {
    await gotoComplaints(page);
    // STATUS_META: pending → 'รอตรวจสอบ', reviewing → 'กำลังตรวจสอบ', resolved → 'ปิดเคสแล้ว'
    await expect(page.getByText('รอตรวจสอบ').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('กำลังตรวจสอบ').first()).toBeVisible();
    await expect(page.getByText('ปิดเคสแล้ว').first()).toBeVisible();
  });

  test('shows complaint IDs in list', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('#1')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('#2')).toBeVisible();
    await expect(page.getByText('#3')).toBeVisible();
  });

  test('shows complaint detail preview in list item', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('ผู้ขายส่งสินค้าไม่ตรงปก')).toBeVisible({ timeout: 8000 });
  });

  test('first complaint is auto-selected (right panel shows detail)', async ({ page }) => {
    await gotoComplaints(page);
    // CaseDetail renders hero with cx-hero-title = TYPE_LABEL for first complaint (fraud)
    await expect(page.locator('.cx-hero-title').first()).toBeVisible({ timeout: 8000 });
  });

  test('cx-item buttons are rendered for each complaint', async ({ page }) => {
    await gotoComplaints(page);
    const items = page.locator('.cx-item');
    await expect(items).toHaveCount(3, { timeout: 8000 });
  });

});

// =============================================================================
// EMPTY STATE
// =============================================================================

test.describe('Complaints Page — Empty state', () => {

  test('shows "ยังไม่มีเรื่องร้องเรียน" when no complaints', async ({ page }) => {
    await gotoComplaints(page, []);
    await expect(page.getByText('ยังไม่มีเรื่องร้องเรียน')).toBeVisible({ timeout: 8000 });
  });

  test('empty state shows IcoAlert icon (SVG triangle)', async ({ page }) => {
    await gotoComplaints(page, []);
    // IcoAlert renders an SVG with a triangle path — no 📭 emoji
    const alertSvg = page.locator('.cx-empty svg').first();
    await expect(alertSvg).toBeVisible({ timeout: 8000 });
  });

  test('empty state has "แจ้งปัญหา" button', async ({ page }) => {
    await gotoComplaints(page, []);
    await expect(page.getByRole('button', { name: 'แจ้งปัญหา' })).toBeVisible({ timeout: 8000 });
  });

  test('empty state "แจ้งปัญหา" opens new complaint modal', async ({ page }) => {
    await gotoComplaints(page, []);
    await page.getByRole('button', { name: 'แจ้งปัญหา' }).click();
    await expect(page.getByText('ส่งเรื่องร้องเรียน')).toBeVisible({ timeout: 5000 });
  });

});

// =============================================================================
// DETAIL PANEL (center — CaseDetail)
// =============================================================================

test.describe('Complaints Page — Detail panel', () => {

  test('right panel shows type label as hero title', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.locator('.cx-hero-title', { hasText: 'ถูกโกง / หลอกลวง' })).toBeVisible({ timeout: 8000 });
  });

  test('clicking second complaint updates the right panel hero', async ({ page }) => {
    await gotoComplaints(page);
    await page.locator('.cx-item').nth(1).click();
    await expect(page.locator('.cx-hero-title', { hasText: 'สินค้าไม่ตรงปก' })).toBeVisible({ timeout: 5000 });
  });

  test('detail panel shows the original complaint detail in cx-reason', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.locator('.cx-reason')).toContainText('ผู้ขายส่งสินค้าไม่ตรงปก', { timeout: 8000 });
  });

  test('detail panel shows system event "รับเรื่องแล้ว"', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.locator('.cx-event-body', { hasText: 'รับเรื่องแล้ว' })).toBeVisible({ timeout: 8000 });
  });

  test('detail panel shows contact info from complaint', async ({ page }) => {
    await gotoComplaints(page);
    // complaint 1 has contact: '0812345678'
    await expect(page.getByText('0812345678')).toBeVisible({ timeout: 8000 });
  });

  test('progress tracker steps are rendered', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.locator('.cx-progress')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('ส่งเรื่อง')).toBeVisible();
    await expect(page.getByText('รอตรวจสอบ').first()).toBeVisible();
    await expect(page.getByText('กำลังตรวจสอบ').first()).toBeVisible();
  });

  test('compose bar is visible for pending complaint', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByPlaceholder('ส่งข้อมูลเพิ่มเติมถึงทีมงาน... (Enter เพื่อส่ง)')).toBeVisible({ timeout: 8000 });
  });

  test('compose bar send button is disabled when input is empty', async ({ page }) => {
    await gotoComplaints(page);
    const send = page.locator('.cx-c-send');
    await expect(send).toBeVisible({ timeout: 8000 });
    await expect(send).toBeDisabled();
  });

  test('resolved complaint shows closed SLA message instead of compose', async ({ page }) => {
    await gotoComplaints(page);
    await page.locator('.cx-item').nth(2).click(); // resolved complaint (#3)
    await expect(page.getByText('เรื่องนี้ได้รับการแก้ไขเรียบร้อยแล้ว')).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder('ส่งข้อมูลเพิ่มเติมถึงทีมงาน... (Enter เพื่อส่ง)')).not.toBeVisible();
  });

});

// =============================================================================
// CHAT MESSAGES
// =============================================================================

test.describe('Complaints Page — Chat messages', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/complaints/my', r => r.fulfill({ json: MOCK_COMPLAINTS }));
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

  test('shows user messages in chat thread', async ({ page }) => {
    await expect(page.getByText('ยังไม่ได้รับสินค้าเลย')).toBeVisible({ timeout: 8000 });
  });

  test('shows admin messages with cx-msg-admin class', async ({ page }) => {
    await expect(page.locator('.cx-msg-admin', { hasText: 'เราได้รับเรื่อง' })).toBeVisible({ timeout: 8000 });
  });

  test('shows "ยังไม่มีข้อความเพิ่มเติม" when no extra messages', async ({ page }) => {
    // Switch to complaint #2 (which has no messages from our mock)
    await page.locator('.cx-item').nth(1).click();
    await expect(page.getByText('ยังไม่มีข้อความเพิ่มเติม')).toBeVisible({ timeout: 5000 });
  });

  test('can type and send a message via Enter', async ({ page }) => {
    let messageSent = false;
    await page.route('**/api/complaints/1/messages', r => {
      if (r.request().method() === 'POST') {
        messageSent = true;
        r.fulfill({ json: { id: 99, complaint_id: 1, sender_type: 'user', content: 'ข้อความทดสอบ', created_at: new Date().toISOString() } });
      } else {
        r.fulfill({ json: MOCK_MESSAGES_1 });
      }
    });
    const input = page.getByPlaceholder('ส่งข้อมูลเพิ่มเติมถึงทีมงาน... (Enter เพื่อส่ง)');
    await input.fill('ข้อความทดสอบ');
    await input.press('Enter');
    expect(messageSent).toBe(true);
    await expect(page.getByText('ข้อความทดสอบ')).toBeVisible({ timeout: 5000 });
  });

  test('Shift+Enter does NOT send', async ({ page }) => {
    let messageSent = false;
    await page.route('**/api/complaints/1/messages', r => {
      if (r.request().method() === 'POST') messageSent = true;
      r.fulfill({ json: MOCK_MESSAGES_1 });
    });
    const input = page.getByPlaceholder('ส่งข้อมูลเพิ่มเติมถึงทีมงาน... (Enter เพื่อส่ง)');
    await input.fill('บรรทัดหนึ่ง');
    await input.press('Shift+Enter');
    expect(messageSent).toBe(false);
    const val = await input.inputValue();
    expect(val).toContain('บรรทัดหนึ่ง');
  });

  test('input clears after sending', async ({ page }) => {
    await page.route('**/api/complaints/1/messages', r => {
      if (r.request().method() === 'POST') r.fulfill({ json: { id: 100, complaint_id: 1, sender_type: 'user', content: 'ส่งแล้ว', created_at: new Date().toISOString() } });
      else r.fulfill({ json: MOCK_MESSAGES_1 });
    });
    const input = page.getByPlaceholder('ส่งข้อมูลเพิ่มเติมถึงทีมงาน... (Enter เพื่อส่ง)');
    await input.fill('ส่งแล้ว');
    await input.press('Enter');
    await expect(input).toHaveValue('', { timeout: 3000 });
  });

});

// =============================================================================
// STATUS FILTER CHIPS
// =============================================================================

test.describe('Complaints Page — Status filter chips', () => {

  test('shows all filter chips (no emoji)', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByRole('button', { name: 'ทั้งหมด' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: 'รอดำเนินการ' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'กำลังตรวจสอบ' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'แก้ไขแล้ว' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ปฏิเสธ' })).toBeVisible();
  });

  test('"รอดำเนินการ" filter shows only pending complaint', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: 'รอดำเนินการ' }).click();
    // fraud (pending) → 'ถูกโกง / หลอกลวง' visible; others hidden
    await expect(page.locator('.cx-item', { hasText: 'ถูกโกง / หลอกลวง' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.cx-item', { hasText: 'สินค้าไม่ตรงปก' })).not.toBeVisible();
    await expect(page.locator('.cx-item', { hasText: 'อื่นๆ' })).not.toBeVisible();
  });

  test('"กำลังตรวจสอบ" filter shows only reviewing complaint', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: 'กำลังตรวจสอบ' }).click();
    await expect(page.locator('.cx-item', { hasText: 'สินค้าไม่ตรงปก' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.cx-item', { hasText: 'ถูกโกง / หลอกลวง' })).not.toBeVisible();
  });

  test('"แก้ไขแล้ว" filter shows only resolved complaint', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: 'แก้ไขแล้ว' }).click();
    await expect(page.locator('.cx-item', { hasText: 'อื่นๆ' })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.cx-item', { hasText: 'ถูกโกง / หลอกลวง' })).not.toBeVisible();
  });

  test('"ทั้งหมด" restores all complaints', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: 'รอดำเนินการ' }).click();
    await expect(page.locator('.cx-item', { hasText: 'สินค้าไม่ตรงปก' })).not.toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: 'ทั้งหมด' }).click();
    await expect(page.locator('.cx-item', { hasText: 'สินค้าไม่ตรงปก' })).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.cx-item', { hasText: 'อื่นๆ' })).toBeVisible();
  });

  test('active filter chip gets .on class', async ({ page }) => {
    await gotoComplaints(page);
    const chip = page.getByRole('button', { name: 'รอดำเนินการ' });
    await chip.click();
    await expect(chip).toHaveClass(/on/, { timeout: 3000 });
  });

  test('filter count badge shows in chip when > 0', async ({ page }) => {
    await gotoComplaints(page);
    // pending count = 1, should show inside the button
    const chip = page.getByRole('button', { name: 'รอดำเนินการ' });
    await expect(chip.locator('span')).toBeVisible({ timeout: 5000 });
  });

  test('search input filters the list', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByPlaceholder('ค้นหาเรื่องร้องเรียน...').fill('รหัสผ่าน');
    await expect(page.locator('.cx-item', { hasText: 'อื่นๆ' })).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.cx-item', { hasText: 'ถูกโกง / หลอกลวง' })).not.toBeVisible();
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

  test('modal shows type dropdown with all options', async ({ page }) => {
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
    // Find close button (IcoClose SVG inside modal header)
    const closeBtn = page.locator('button').filter({ has: page.locator('svg line[x1="6"][y1="6"]') }).last();
    await closeBtn.click();
    await expect(page.getByText('ส่งเรื่องร้องเรียน')).not.toBeVisible();
  });

  test('submitting shows "รับเรื่องแล้ว!" success screen', async ({ page }) => {
    let postCalled = false;
    await page.route('**/api/complaints', r => {
      if (r.request().method() === 'POST') {
        postCalled = true;
        r.fulfill({ json: { ok: true } });
      } else r.continue();
    });
    await gotoComplaints(page);
    await page.getByRole('button', { name: /แจ้งปัญหาใหม่/ }).click();
    await page.getByPlaceholder('อธิบายปัญหาที่พบให้ละเอียด...').fill('ทดสอบส่งเรื่องร้องเรียน');
    await page.getByRole('button', { name: /ส่งเรื่องร้องเรียน/ }).click();
    expect(postCalled).toBe(true);
    await expect(page.getByText('รับเรื่องแล้ว!')).toBeVisible({ timeout: 5000 });
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
// SIDEBAR (right panel)
// =============================================================================

test.describe('Complaints Page — Case sidebar', () => {

  test('sidebar shows status card with สถานะเคส label', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.locator('.cx-sb-label', { hasText: 'สถานะเคส' })).toBeVisible({ timeout: 8000 });
  });

  test('sidebar shows "ส่งเรื่องใหม่" action button', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByRole('button', { name: 'ส่งเรื่องใหม่' })).toBeVisible({ timeout: 8000 });
  });

  test('"ส่งเรื่องใหม่" in sidebar opens new complaint modal', async ({ page }) => {
    await gotoComplaints(page);
    await page.getByRole('button', { name: 'ส่งเรื่องใหม่' }).click();
    await expect(page.getByText('ส่งเรื่องร้องเรียน')).toBeVisible({ timeout: 5000 });
  });

  test('sidebar shows help links', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.getByText('วิธีรายงานการโกง')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('สิทธิ์ผู้ซื้อ')).toBeVisible();
  });

  test('sidebar shows complaint ID and created date', async ({ page }) => {
    await gotoComplaints(page);
    await expect(page.locator('.cx-sb', { hasText: '#1' })).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// NAVBAR — account dropdown
// =============================================================================

test.describe('Navbar — "ร้องเรียนของฉัน" in account dropdown', () => {

  async function openAccountDropdown(page: Page) {
    await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.waitForSelector('[data-testid="nav-user-btn"]', { timeout: 10000 });
    await page.locator('[data-testid="nav-user-btn"]').click();
  }

  test('account dropdown shows "ร้องเรียนของฉัน"', async ({ page }) => {
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
