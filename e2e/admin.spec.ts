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

});
