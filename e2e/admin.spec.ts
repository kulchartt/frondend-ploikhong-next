import { test, expect } from '@playwright/test';

// ─── Mock data ────────────────────────────────────────────────────────────────

const ADMIN_SESSION = {
  user: { name: 'Admin', email: 'admin@ploikhong.com', is_admin: 1 },
  token: 'mock-admin-token',
  expires: '2099-01-01',
};

const MOCK_COMPLAINTS_ADMIN = [
  {
    id: 1, type: 'fraud', detail: 'ผู้ขายส่งของปลอม', contact: '0812345678',
    status: 'pending', admin_reply: null, replied_at: null,
    user_id: 2, user_name: 'Demo User', user_email: 'demo@example.com',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2, type: 'product', detail: 'สินค้าไม่ตรงกับรูป', contact: null,
    status: 'reviewing', admin_reply: 'กำลังตรวจสอบ',
    replied_at: new Date(Date.now() - 3600000).toISOString(),
    user_id: 3, user_name: 'สมชาย', user_email: 'somchai@example.com',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function mockAdminBase(page: any, complaints: any[] = []) {
  await page.route('**/api/auth/session', (r: any) => r.fulfill({ json: ADMIN_SESSION }));
  await page.route('**/api/admin/stats', (r: any) => r.fulfill({
    json: { users: 42, products: 100, available: 60, sold: 30, orders: 25, revenue: 125000 },
  }));
  await page.route('**/api/admin/users**', (r: any) => r.fulfill({
    json: [
      { id: 1, name: 'Admin', email: 'admin@ploikhong.com', is_admin: 1, is_banned: 0, created_at: '2025-01-01T00:00:00Z', rating: 5, review_count: 0 },
      { id: 2, name: 'Demo User', email: 'demo@example.com', is_admin: 0, is_banned: 0, created_at: '2025-02-01T00:00:00Z', rating: 4.5, review_count: 3 },
    ],
  }));
  await page.route('**/api/admin/products**', (r: any) => r.fulfill({
    json: [
      { id: 1, title: 'iPhone 13 Pro', price: 18500, category: 'มือถือ', seller_name: 'Demo User', status: 'available', created_at: '2025-03-01T00:00:00Z' },
    ],
  }));
  await page.route('**/api/coins/admin/stats**', (r: any) => r.fulfill({
    json: { total_revenue: 5000, pending_requests: 2, total_coins_issued: 10000, total_coins_outstanding: 3000, monthly_revenue: [], feature_usage: [], revenue_by_package: [] },
  }));
  await page.route('**/api/coins/payment-requests**', (r: any) => r.fulfill({ json: [] }));
  await page.route('**/api/complaints**', (r: any) => {
    if (r.request().method() === 'GET') r.fulfill({ json: complaints });
    else r.continue();
  });
  await page.route('**/api/complaints/*/messages', (r: any) => {
    if (r.request().method() === 'GET') r.fulfill({ json: [] });
    else r.continue();
  });
}

async function gotoAdmin(page: any, complaints: any[] = []) {
  await mockAdminBase(page, complaints);
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
}

// =============================================================================
// ACCESS GUARD
// =============================================================================

test.describe('Admin Page — Access Guard', () => {

  test('shows access denied when not logged in', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('ไม่มีสิทธิ์เข้าถึง')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('หน้านี้สำหรับผู้ดูแลระบบเท่านั้น')).toBeVisible();
  });

  test('access denied page has back-to-home link', async ({ page }) => {
    await page.goto('/admin');
    const link = page.getByRole('link', { name: /กลับหน้าแรก/i });
    await expect(link).toBeVisible({ timeout: 8000 });
    await expect(link).toHaveAttribute('href', '/');
  });

  test('non-admin user sees access denied', async ({ page }) => {
    await page.route('**/api/auth/session', (r: any) => r.fulfill({
      json: { user: { name: 'User', email: 'user@example.com', is_admin: 0 }, token: 'user-token', expires: '2099-01-01' },
    }));
    await page.goto('/admin');
    await expect(page.getByText('ไม่มีสิทธิ์เข้าถึง')).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// LAYOUT — Sidebar & brand
// =============================================================================

test.describe('Admin Page — Layout', () => {

  test('shows "Admin" brand in sidebar', async ({ page }) => {
    await gotoAdmin(page);
    await expect(page.getByText('Admin').first()).toBeVisible({ timeout: 8000 });
  });

  test('shows all 5 sidebar nav items', async ({ page }) => {
    await gotoAdmin(page);
    await expect(page.getByRole('button', { name: 'Queue' })).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('button', { name: 'ผู้ใช้' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ประกาศ' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'เคสร้องเรียน' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'การเงิน' })).toBeVisible();
  });

  test('default tab is Queue — topbar shows "Queue" and queue shows "Inbox"', async ({ page }) => {
    await gotoAdmin(page);
    // Topbar h1 shows current tab label
    await expect(page.locator('.ad-topbar-title h1', { hasText: 'Queue' })).toBeVisible({ timeout: 6000 });
    // QueueView heading
    await expect(page.locator('h3', { hasText: 'Inbox' })).toBeVisible({ timeout: 6000 });
  });

  test('sidebar has กลับเว็บหลัก link', async ({ page }) => {
    await gotoAdmin(page);
    const link = page.getByRole('link', { name: /กลับเว็บหลัก/i });
    await expect(link).toBeVisible({ timeout: 6000 });
    await expect(link).toHaveAttribute('href', '/');
  });

  test('admin card shows ADMIN role', async ({ page }) => {
    await gotoAdmin(page);
    await expect(page.getByText('ADMIN')).toBeVisible({ timeout: 6000 });
  });

  test('⌘K button is visible in topbar', async ({ page }) => {
    await gotoAdmin(page);
    await expect(page.getByText('⌘K')).toBeVisible({ timeout: 6000 });
  });

  test('Saved Views section is shown in sidebar', async ({ page }) => {
    await gotoAdmin(page);
    await expect(page.getByText('Saved Views')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('SLA เสี่ยงตก')).toBeVisible();
    await expect(page.getByText('สมาชิกใหม่')).toBeVisible();
    await expect(page.getByText('รอตรวจประกาศ')).toBeVisible();
  });

});

// =============================================================================
// COMMAND PALETTE (⌘K)
// =============================================================================

test.describe('Admin Page — Command Palette', () => {

  test('opens command palette with ⌘K shortcut', async ({ page }) => {
    await gotoAdmin(page);
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder('ค้นหาเมนูหรือพิมพ์คำสั่ง...')).toBeVisible({ timeout: 5000 });
  });

  test('command palette shows navigation items', async ({ page }) => {
    await gotoAdmin(page);
    await page.keyboard.press('Control+k');
    await expect(page.getByText('นำทาง')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Queue').first()).toBeVisible();
    await expect(page.getByText('ผู้ใช้').first()).toBeVisible();
    await expect(page.getByText('เคสร้องเรียน').first()).toBeVisible();
    await expect(page.getByText('การเงิน').first()).toBeVisible();
  });

  test('Escape closes the command palette', async ({ page }) => {
    await gotoAdmin(page);
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder('ค้นหาเมนูหรือพิมพ์คำสั่ง...')).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder('ค้นหาเมนูหรือพิมพ์คำสั่ง...')).not.toBeVisible();
  });

  test('clicking ⌘K button opens palette', async ({ page }) => {
    await gotoAdmin(page);
    await page.locator('.ad-cmdk').click();
    await expect(page.getByPlaceholder('ค้นหาเมนูหรือพิมพ์คำสั่ง...')).toBeVisible({ timeout: 5000 });
  });

  test('navigating via palette switches to การเงิน tab', async ({ page }) => {
    await gotoAdmin(page);
    await page.keyboard.press('Control+k');
    await page.locator('.ad-cmdk-item').filter({ hasText: 'การเงิน' }).click();
    await expect(page.locator('.ad-topbar-title h1', { hasText: 'การเงิน' })).toBeVisible({ timeout: 5000 });
  });

});

// =============================================================================
// QUEUE VIEW (default tab)
// =============================================================================

test.describe('Admin Page — Queue View', () => {

  test('queue shows "Inbox" heading', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await expect(page.locator('h3', { hasText: 'Inbox' })).toBeVisible({ timeout: 8000 });
  });

  test('queue shows filter tabs: ทั้งหมด / ร้องเรียน / เติมเหรียญ', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await expect(page.getByText('ทั้งหมด').first()).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('ร้องเรียน').first()).toBeVisible();
    await expect(page.getByText('เติมเหรียญ').first()).toBeVisible();
  });

  test('queue shows items from pending complaints', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await expect(page.locator('.ad-q-item').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('[ร้องเรียน]', { exact: false }).first()).toBeVisible();
  });

  test('empty queue shows "ไม่มีงานรอดำเนินการ"', async ({ page }) => {
    await gotoAdmin(page, []);
    await expect(page.getByText('ไม่มีงานรอดำเนินการ')).toBeVisible({ timeout: 8000 });
  });

  test('empty queue detail pane shows "เลือกรายการ"', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await expect(page.getByText('เลือกรายการ')).toBeVisible({ timeout: 8000 });
  });

  test('clicking queue item shows complaint detail', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.locator('.ad-q-item').first().click();
    await expect(page.getByText('ร้องเรียน #', { exact: false })).toBeVisible({ timeout: 6000 });
  });

  test('complaint detail shows action buttons for pending complaint', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.locator('.ad-q-item').first().click();
    await expect(page.getByRole('button', { name: /ตรวจสอบ|ปิดเคส/ }).first()).toBeVisible({ timeout: 6000 });
  });

  test('complaint detail shows "ยังไม่มีข้อความ" when no messages', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.locator('.ad-q-item').first().click();
    await expect(page.getByText('ยังไม่มีข้อความ')).toBeVisible({ timeout: 6000 });
  });

  test('complaint detail compose area has correct placeholder', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.locator('.ad-q-item').first().click();
    await expect(page.getByPlaceholder('พิมพ์ข้อความถึงผู้ใช้... (Enter ส่ง)')).toBeVisible({ timeout: 6000 });
  });

  test('complaint detail has "ส่ง + ปิดเคส" button', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.locator('.ad-q-item').first().click();
    await expect(page.getByRole('button', { name: 'ส่ง + ปิดเคส' })).toBeVisible({ timeout: 6000 });
  });

  test('clicking back in detail clears the selection', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.locator('.ad-q-item').first().click();
    await expect(page.getByText('ร้องเรียน #', { exact: false })).toBeVisible({ timeout: 6000 });
    await page.locator('.ad-q-dhead .btn-ghost').click();
    await expect(page.getByText('เลือกรายการ')).toBeVisible({ timeout: 5000 });
  });

});

// =============================================================================
// USERS TAB
// =============================================================================

test.describe('Admin Page — Users tab', () => {

  test('clicking ผู้ใช้ shows user search input', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'ผู้ใช้' }).click();
    await expect(page.getByPlaceholder('ค้นหาชื่อหรืออีเมล...')).toBeVisible({ timeout: 6000 });
  });

  test('users tab lists Demo User', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'ผู้ใช้' }).click();
    await expect(page.getByText('Demo User')).toBeVisible({ timeout: 6000 });
  });

  test('users tab shows แบน button', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'ผู้ใช้' }).click();
    await expect(page.getByRole('button', { name: 'แบน' }).first()).toBeVisible({ timeout: 6000 });
  });

  test('users tab shows ให้ Admin button', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'ผู้ใช้' }).click();
    await expect(page.getByRole('button', { name: 'ให้ Admin' }).first()).toBeVisible({ timeout: 6000 });
  });

});

// =============================================================================
// PRODUCTS TAB
// =============================================================================

test.describe('Admin Page — Products tab', () => {

  test('clicking ประกาศ shows product table', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'ประกาศ' }).click();
    await expect(page.getByText('iPhone 13 Pro')).toBeVisible({ timeout: 6000 });
  });

  test('products tab has ลบ button', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'ประกาศ' }).click();
    await expect(page.getByRole('button', { name: 'ลบ' })).toBeVisible({ timeout: 6000 });
  });

  test('products tab has status filter buttons', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'ประกาศ' }).click();
    await expect(page.locator('.ad-flt-grp button', { hasText: 'ทั้งหมด' })).toBeVisible({ timeout: 6000 });
    await expect(page.locator('.ad-flt-grp button', { hasText: 'available' })).toBeVisible();
  });

  test('products tab has search input', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'ประกาศ' }).click();
    await expect(page.getByPlaceholder('ค้นหาสินค้า / ผู้ขาย...')).toBeVisible({ timeout: 6000 });
  });

});

// =============================================================================
// FINANCE TAB (replaces Premium + Payments tabs)
// =============================================================================

test.describe('Admin Page — Finance tab', () => {

  test('clicking การเงิน shows revenue stats', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'การเงิน' }).click();
    await expect(page.getByText('รายได้รวม')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('รอยืนยัน')).toBeVisible();
  });

  test('finance tab shows coin stats: เหรียญแจก and เหรียญคงค้าง', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'การเงิน' }).click();
    await expect(page.getByText('เหรียญแจก')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('เหรียญคงค้าง')).toBeVisible();
  });

  test('finance tab shows payment request filter buttons', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'การเงิน' }).click();
    await expect(page.getByRole('button', { name: 'รอยืนยัน' })).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('button', { name: 'ยืนยันแล้ว' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ปฏิเสธแล้ว' })).toBeVisible();
  });

  test('empty payment requests shows "ไม่มีคำขอ"', async ({ page }) => {
    await gotoAdmin(page);
    await page.getByRole('button', { name: 'การเงิน' }).click();
    await expect(page.getByText('ไม่มีคำขอ')).toBeVisible({ timeout: 6000 });
  });

});

// =============================================================================
// COMPLAINTS TAB (accordion table)
// =============================================================================

test.describe('Admin Page — Complaints tab', () => {

  test('clicking เคสร้องเรียน shows filter buttons (no emoji)', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await expect(page.locator('.ad-flt-grp button', { hasText: 'รอดำเนินการ' })).toBeVisible({ timeout: 6000 });
    await expect(page.locator('.ad-flt-grp button', { hasText: 'กำลังตรวจสอบ' })).toBeVisible();
    await expect(page.locator('.ad-flt-grp button', { hasText: 'แก้ไขแล้ว' })).toBeVisible();
    await expect(page.locator('.ad-flt-grp button', { hasText: 'ปฏิเสธ' })).toBeVisible();
    await expect(page.locator('.ad-flt-grp button', { hasText: 'ทั้งหมด' })).toBeVisible();
  });

  test('complaints tab shows complaint rows', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await expect(page.getByText('ผู้ขายส่งของปลอม')).toBeVisible({ timeout: 6000 });
  });

  test('complaint row shows user name', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await expect(page.getByText('Demo User')).toBeVisible({ timeout: 6000 });
  });

  test('pending complaint shows ตรวจสอบ button (no emoji)', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await expect(page.getByRole('button', { name: 'ตรวจสอบ' }).first()).toBeVisible({ timeout: 6000 });
  });

  test('pending complaint shows ปิดเคส button', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await expect(page.getByRole('button', { name: 'ปิดเคส' }).first()).toBeVisible({ timeout: 6000 });
  });

  test('complaint row shows แชท button (no emoji)', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await expect(page.getByRole('button', { name: 'แชท' }).first()).toBeVisible({ timeout: 6000 });
  });

  test('clicking แชท expands the message thread', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await page.getByRole('button', { name: 'แชท' }).first().click();
    await expect(page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)')).toBeVisible({ timeout: 6000 });
  });

  test('clicking ซ่อน collapses the thread', async ({ page }) => {
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await page.getByRole('button', { name: 'แชท' }).first().click();
    await expect(page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)')).toBeVisible({ timeout: 6000 });
    await page.getByRole('button', { name: 'ซ่อน' }).first().click();
    await expect(page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)')).not.toBeVisible();
  });

  test('expanded thread shows existing messages', async ({ page }) => {
    await page.route('**/api/complaints/1/messages', (r: any) => r.fulfill({
      json: [
        { id: 1, complaint_id: 1, sender_type: 'user', content: 'ข้อความจากผู้ใช้', created_at: new Date().toISOString() },
        { id: 2, complaint_id: 1, sender_type: 'admin', content: 'ข้อความจากแอดมิน', created_at: new Date().toISOString() },
      ],
    }));
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await page.getByRole('button', { name: 'แชท' }).first().click();
    await expect(page.getByText('ข้อความจากผู้ใช้')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('ข้อความจากแอดมิน')).toBeVisible();
  });

  test('Enter in textarea sends the message', async ({ page }) => {
    let msgSent = false;
    await page.route('**/api/complaints/1/messages', (r: any) => {
      if (r.request().method() === 'POST') {
        msgSent = true;
        r.fulfill({ json: { id: 99, complaint_id: 1, sender_type: 'admin', content: 'ทดสอบส่ง', created_at: new Date().toISOString() } });
      } else {
        r.fulfill({ json: [] });
      }
    });
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await page.getByRole('button', { name: 'แชท' }).first().click();
    const textarea = page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)');
    await textarea.fill('ทดสอบส่ง');
    await textarea.press('Enter');
    expect(msgSent).toBe(true);
  });

  test('clicking ปิดเคส PATCHes complaint status', async ({ page }) => {
    let patched = false;
    await page.route('**/api/complaints/1', (r: any) => {
      if (r.request().method() === 'PATCH') { patched = true; r.fulfill({ json: { ok: true } }); }
      else r.continue();
    });
    await gotoAdmin(page, MOCK_COMPLAINTS_ADMIN);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await page.getByRole('button', { name: 'ปิดเคส' }).first().click();
    expect(patched).toBe(true);
  });

  test('empty complaints list shows "ไม่มีเรื่องร้องเรียน"', async ({ page }) => {
    await gotoAdmin(page, []);
    await page.getByRole('button', { name: 'เคสร้องเรียน' }).click();
    await expect(page.getByText('ไม่มีเรื่องร้องเรียน')).toBeVisible({ timeout: 6000 });
  });

});
