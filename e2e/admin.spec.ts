import { test, expect } from '@playwright/test';

// Admin page — unauthenticated & authenticated scenarios
// These tests cover the access guard and basic UI structure.
// Full tab-data tests require a seeded admin session (covered by mocks below).

test.describe('Admin Page — Access Guard', () => {

  test('redirects / shows lock when not logged in', async ({ page }) => {
    await page.goto('/admin');
    // Should show the lock UI, not the sidebar
    await expect(page.getByText('ไม่มีสิทธิ์เข้าถึง')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('← กลับหน้าแรก')).toBeVisible();
  });

  test('lock page has back-to-home link', async ({ page }) => {
    await page.goto('/admin');
    const link = page.getByRole('link', { name: /กลับหน้าแรก/i });
    await expect(link).toBeVisible({ timeout: 8000 });
    await expect(link).toHaveAttribute('href', '/');
  });

  test('lock icon is displayed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('🔒')).toBeVisible({ timeout: 8000 });
  });

});

test.describe('Admin Page — Layout (mocked admin session)', () => {

  test.beforeEach(async ({ page }) => {
    // Mock NextAuth session to return an admin user
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Admin', email: 'admin@ploikhong.com', is_admin: 1 },
          token: 'mock-admin-token',
          expires: '2099-01-01',
        }),
      });
    });

    // Mock admin stats
    await page.route('**/api/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: 42, products: 100, available: 60, sold: 30, orders: 25, revenue: 125000 }),
      });
    });

    // Mock admin users
    await page.route('**/api/admin/users**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Admin', email: 'admin@ploikhong.com', is_admin: 1, is_banned: 0, created_at: '2025-01-01T00:00:00Z', rating: 5, review_count: 0 },
          { id: 2, name: 'Demo User', email: 'demo@example.com', is_admin: 0, is_banned: 0, created_at: '2025-02-01T00:00:00Z', rating: 4.5, review_count: 3 },
        ]),
      });
    });

    // Mock admin products
    await page.route('**/api/admin/products**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, title: 'iPhone 13 Pro', price: 18500, category: 'มือถือ', seller_name: 'Demo User', status: 'available', created_at: '2025-03-01T00:00:00Z' },
        ]),
      });
    });

    // Mock coin admin stats
    await page.route('**/api/coins/admin/stats**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ total_revenue: 5000, pending_requests: 2, total_coins_issued: 10000, total_coins_outstanding: 3000, monthly_revenue: [], feature_usage: [], revenue_by_package: [] }),
      });
    });

    // Mock payment requests
    await page.route('**/api/coins/payment-requests**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/admin');
  });

  test('shows admin sidebar', async ({ page }) => {
    await expect(page.getByText('Admin Panel')).toBeVisible({ timeout: 8000 });
  });

  test('shows all sidebar nav tabs', async ({ page }) => {
    await expect(page.getByText('📊 ภาพรวม')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('👥 ผู้ใช้')).toBeVisible();
    await expect(page.getByText('📦 สินค้า')).toBeVisible();
    await expect(page.getByText('🪙 Premium')).toBeVisible();
    await expect(page.getByText('💳 คำขอเติมเหรียญ')).toBeVisible();
  });

  test('overview tab shows KPI cards', async ({ page }) => {
    await expect(page.getByText('ผู้ใช้ทั้งหมด')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('42')).toBeVisible();
    await expect(page.getByText('สินค้าทั้งหมด')).toBeVisible();
    await expect(page.getByText('สินค้าขายอยู่')).toBeVisible();
    await expect(page.getByText('สินค้าขายแล้ว')).toBeVisible();
  });

  test('clicking ผู้ใช้ tab shows user table', async ({ page }) => {
    await page.getByText('👥 ผู้ใช้').click();
    await expect(page.getByText('ผู้ใช้ทั้งหมด')).toBeVisible({ timeout: 6000 });
    await expect(page.getByPlaceholder('ค้นหาชื่อหรืออีเมล...')).toBeVisible();
    await expect(page.getByText('Demo User')).toBeVisible();
  });

  test('users tab shows ban and admin buttons', async ({ page }) => {
    await page.getByText('👥 ผู้ใช้').click();
    await expect(page.getByRole('button', { name: 'แบน' }).first()).toBeVisible({ timeout: 6000 });
  });

  test('clicking สินค้า tab shows product table', async ({ page }) => {
    await page.getByText('📦 สินค้า').click();
    await expect(page.getByText('iPhone 13 Pro')).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('button', { name: 'ลบ' })).toBeVisible();
  });

  test('products tab has status filter dropdown', async ({ page }) => {
    await page.getByText('📦 สินค้า').click();
    await expect(page.getByRole('option', { name: 'ทุกสถานะ' })).toBeAttached({ timeout: 6000 });
  });

  test('clicking Premium tab shows coin stats', async ({ page }) => {
    await page.getByText('🪙 Premium').click();
    await expect(page.getByText('Premium & เหรียญ')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('รายได้รวม (฿)')).toBeVisible();
  });

  test('clicking คำขอเติมเหรียญ tab shows filter buttons', async ({ page }) => {
    await page.getByText('💳 คำขอเติมเหรียญ').click();
    await expect(page.getByText('คำขอเติมเหรียญ')).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('button', { name: 'รอยืนยัน' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ยืนยันแล้ว' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ปฏิเสธแล้ว' })).toBeVisible();
  });

  test('sidebar has back-to-site link', async ({ page }) => {
    const link = page.getByRole('link', { name: /กลับเว็บหลัก/i });
    await expect(link).toBeVisible({ timeout: 6000 });
    await expect(link).toHaveAttribute('href', '/');
  });

  test('sidebar shows 🚨 ร้องเรียน tab', async ({ page }) => {
    await expect(page.getByText('🚨 ร้องเรียน')).toBeVisible({ timeout: 6000 });
  });

});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_COMPLAINTS_ADMIN = [
  {
    id: 1,
    type: 'fraud',
    detail: 'ผู้ขายส่งของปลอม',
    contact: '0812345678',
    status: 'pending',
    admin_reply: null,
    replied_at: null,
    user_id: 2,
    user_name: 'Demo User',
    user_email: 'demo@example.com',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    type: 'product',
    detail: 'สินค้าไม่ตรงกับรูป',
    contact: null,
    status: 'reviewing',
    admin_reply: 'กำลังตรวจสอบ',
    replied_at: new Date(Date.now() - 3600000).toISOString(),
    user_id: 3,
    user_name: 'สมชาย',
    user_email: 'somchai@example.com',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

async function setupAdminWithComplaints(page: any) {
  await page.route('**/api/auth/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { name: 'Admin', email: 'admin@ploikhong.com', is_admin: 1 },
        token: 'mock-admin-token',
        expires: '2099-01-01',
      }),
    });
  });
  await page.route('**/api/admin/stats', (r: any) => r.fulfill({ json: { users: 42, products: 100, available: 60, sold: 30, orders: 25, revenue: 125000 } }));
  await page.route('**/api/admin/users**', (r: any) => r.fulfill({ json: [] }));
  await page.route('**/api/admin/products**', (r: any) => r.fulfill({ json: [] }));
  await page.route('**/api/coins/admin/stats**', (r: any) => r.fulfill({ json: { total_revenue: 0, pending_requests: 0, total_coins_issued: 0, total_coins_outstanding: 0, monthly_revenue: [], feature_usage: [], revenue_by_package: [] } }));
  await page.route('**/api/coins/payment-requests**', (r: any) => r.fulfill({ json: [] }));
  await page.route('**/api/complaints**', (r: any) => r.fulfill({ json: MOCK_COMPLAINTS_ADMIN }));
  await page.route('**/api/complaints/*/messages', (r: any) => r.fulfill({ json: [] }));
  await page.goto('/admin');
}

// =============================================================================
// Admin Page — Complaints Tab
// =============================================================================

test.describe('Admin Page — Complaints tab', () => {

  test('sidebar shows 🚨 ร้องเรียน nav item', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await expect(page.getByText('🚨 ร้องเรียน')).toBeVisible({ timeout: 8000 });
  });

  test('clicking 🚨 ร้องเรียน shows complaints heading', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await expect(page.getByRole('heading', { name: /🚨 ร้องเรียน/ })).toBeVisible({ timeout: 6000 });
  });

  test('complaints tab shows filter buttons', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await expect(page.getByRole('button', { name: /⏳ รอดำเนินการ/ })).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('button', { name: /🔍 กำลังตรวจสอบ/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /✅ แก้ไขแล้ว/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /❌ ปฏิเสธ/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /📋 ทั้งหมด/ })).toBeVisible();
  });

  test('complaints tab shows complaint cards', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await expect(page.getByText('ผู้ขายส่งของปลอม')).toBeVisible({ timeout: 6000 });
  });

  test('complaint card shows user info', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await expect(page.getByText('Demo User')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('demo@example.com')).toBeVisible();
  });

  test('pending complaint shows status action buttons', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await expect(page.getByRole('button', { name: '🔍 ตรวจสอบ' })).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('button', { name: '✅ ปิดเรื่อง' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '❌ ปฏิเสธ' }).first()).toBeVisible();
  });

  test('complaint with user_id shows 💬 แชท button', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await expect(page.getByRole('button', { name: /💬 แชท/ }).first()).toBeVisible({ timeout: 6000 });
  });

  test('clicking 💬 แชท expands the chat thread', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await page.getByRole('button', { name: /💬 แชท/ }).first().click();
    await expect(page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)')).toBeVisible({ timeout: 6000 });
  });

  test('chat thread shows "ยังไม่มีข้อความ" when empty', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await page.getByRole('button', { name: /💬 แชท/ }).first().click();
    await expect(page.getByText('ยังไม่มีข้อความ')).toBeVisible({ timeout: 6000 });
  });

  test('chat thread shows existing messages', async ({ page }) => {
    await page.route('**/api/complaints/1/messages', (r: any) => r.fulfill({
      json: [
        { id: 1, complaint_id: 1, sender_type: 'user', content: 'ข้อความจากผู้ใช้', created_at: new Date().toISOString() },
        { id: 2, complaint_id: 1, sender_type: 'admin', content: 'ข้อความจากแอดมิน', created_at: new Date().toISOString() },
      ],
    }));
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await page.getByRole('button', { name: /💬 แชท/ }).first().click();
    await expect(page.getByText('ข้อความจากผู้ใช้')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('ข้อความจากแอดมิน')).toBeVisible();
  });

  test('📨 ส่ง button sends the reply message', async ({ page }) => {
    let msgSent = false;
    await page.route('**/api/complaints/1/messages', (r: any) => {
      if (r.request().method() === 'POST') { msgSent = true; r.fulfill({ json: { id: 99, complaint_id: 1, sender_type: 'admin', content: 'ตอบกลับทดสอบ', created_at: new Date().toISOString() } }); }
      else r.fulfill({ json: [] });
    });
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await page.getByRole('button', { name: /💬 แชท/ }).first().click();
    await page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)').fill('ตอบกลับทดสอบ');
    await page.getByRole('button', { name: '📨 ส่ง' }).click();
    expect(msgSent).toBe(true);
    await expect(page.getByText('ตอบกลับทดสอบ')).toBeVisible({ timeout: 5000 });
  });

  test('"ส่ง+ปิด" sends reply and updates status to resolved', async ({ page }) => {
    let msgSent = false;
    let statusUpdated = false;
    await page.route('**/api/complaints/1/messages', (r: any) => {
      if (r.request().method() === 'POST') { msgSent = true; r.fulfill({ json: { id: 99, complaint_id: 1, sender_type: 'admin', content: 'ปิดเรื่อง', created_at: new Date().toISOString() } }); }
      else r.fulfill({ json: [] });
    });
    await page.route('**/api/complaints/1', (r: any) => {
      if (r.request().method() === 'PATCH') { statusUpdated = true; r.fulfill({ json: { ok: true } }); }
      else r.continue();
    });
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await page.getByRole('button', { name: /💬 แชท/ }).first().click();
    await page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)').fill('ปิดเรื่อง');
    await page.getByRole('button', { name: '✅ ส่ง+ปิด' }).click();
    expect(msgSent).toBe(true);
  });

  test('clicking ✅ ปิดเรื่อง updates complaint status', async ({ page }) => {
    let statusPatched = false;
    await page.route('**/api/complaints/1', (r: any) => {
      if (r.request().method() === 'PATCH') { statusPatched = true; r.fulfill({ json: { ok: true } }); }
      else r.continue();
    });
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await page.getByRole('button', { name: '✅ ปิดเรื่อง' }).first().click();
    expect(statusPatched).toBe(true);
  });

  test('empty complaints list shows "ไม่มีเรื่องร้องเรียน"', async ({ page }) => {
    await page.route('**/api/auth/session', async (route: any) => {
      await route.fulfill({ json: { user: { name: 'Admin', email: 'admin@ploikhong.com', is_admin: 1 }, token: 'mock-admin-token', expires: '2099-01-01' } });
    });
    await page.route('**/api/admin/stats', (r: any) => r.fulfill({ json: { users: 0, products: 0, available: 0, sold: 0, orders: 0, revenue: 0 } }));
    await page.route('**/api/admin/users**', (r: any) => r.fulfill({ json: [] }));
    await page.route('**/api/admin/products**', (r: any) => r.fulfill({ json: [] }));
    await page.route('**/api/coins/admin/stats**', (r: any) => r.fulfill({ json: { total_revenue: 0, pending_requests: 0, total_coins_issued: 0, total_coins_outstanding: 0, monthly_revenue: [], feature_usage: [], revenue_by_package: [] } }));
    await page.route('**/api/coins/payment-requests**', (r: any) => r.fulfill({ json: [] }));
    await page.route('**/api/complaints**', (r: any) => r.fulfill({ json: [] }));
    await page.goto('/admin');
    await page.getByText('🚨 ร้องเรียน').click();
    await expect(page.getByText('ไม่มีเรื่องร้องเรียน')).toBeVisible({ timeout: 6000 });
  });

  test('clicking 💬 ซ่อน collapses the chat thread', async ({ page }) => {
    await setupAdminWithComplaints(page);
    await page.getByText('🚨 ร้องเรียน').click();
    await page.getByRole('button', { name: /💬 แชท/ }).first().click();
    await expect(page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)')).toBeVisible({ timeout: 6000 });
    // Click again to collapse
    await page.getByRole('button', { name: /💬 ซ่อน/ }).first().click();
    await expect(page.getByPlaceholder('พิมพ์ข้อความ... (Enter ส่ง)')).not.toBeVisible();
  });

});
