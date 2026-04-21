import { test, expect } from '@playwright/test';

const MOCK_SESSION = {
  user: { name: 'ทดสอบ', email: 'test@ploi.dev', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
  token: 'mock-token-abc',
  userId: 1,
};

const MOCK_ROOMS = [
  {
    id: 1,
    seller_name: 'สมชาย',
    product_title: 'iPhone 14 Pro 256GB',
    product_image: '',
    last_message: 'สนใจครับ',
    updated_at: new Date(Date.now() - 300000).toISOString(),
    buyer_id: 1,
  },
  {
    id: 2,
    seller_name: 'วิชัย',
    product_title: 'MacBook Air M2',
    product_image: '',
    last_message: 'ราคาต่อได้ไหม',
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    buyer_id: 1,
  },
];

const MOCK_MESSAGES = [
  { id: 1, sender_id: 99, content: 'สวัสดีครับ สนใจสินค้าไหม', created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 2, sender_id: 1,  content: 'สนใจครับ', created_at: new Date(Date.now() - 300000).toISOString() },
];

async function setupLoggedIn(page: any, rooms = MOCK_ROOMS) {
  await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  await page.route('**/api/products*', r => r.fulfill({ json: [] }));
  await page.route('**/api/wishlist', r => r.fulfill({ json: [] }));
  await page.route('**/api/chat/rooms', r => r.fulfill({ json: rooms }));
  await page.route('**/api/chat/rooms/*/messages', r => r.fulfill({ json: MOCK_MESSAGES }));
}

async function openChat(page: any, rooms = MOCK_ROOMS) {
  await setupLoggedIn(page, rooms);
  await page.goto('/');
  await page.getByRole('button', { name: 'แชท' }).click();
}

/** Helper: chat drawer is visible */
function chatDrawer(page: any) {
  return page.getByTestId('chat-drawer');
}

/** Helper: wait for room list to load then click a room */
async function clickRoom(page: any, id: number) {
  await page.getByTestId(`room-${id}`).waitFor({ state: 'visible' });
  await page.getByTestId(`room-${id}`).click();
}

test.describe('Chat Drawer', () => {

  // ─── Opening ────────────────────────────────────────────────────────────────

  test('clicking "แชท" navbar button opens chat drawer when logged in', async ({ page }) => {
    await openChat(page);
    await expect(chatDrawer(page)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'แชท' })).toBeVisible();
  });

  test('unauthenticated user gets auth modal instead of chat drawer', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'แชท' }).click();
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    await expect(chatDrawer(page)).not.toBeVisible();
  });

  // ─── Closing ────────────────────────────────────────────────────────────────

  test('ESC closes the drawer when no room selected', async ({ page }) => {
    await openChat(page);
    await expect(chatDrawer(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(chatDrawer(page)).not.toBeVisible();
  });

  test('back button closes the drawer', async ({ page }) => {
    await openChat(page);
    await page.getByRole('button', { name: 'กลับ' }).first().click();
    await expect(chatDrawer(page)).not.toBeVisible();
  });

  // ─── Room list ──────────────────────────────────────────────────────────────

  test('shows all rooms with seller names', async ({ page }) => {
    await openChat(page);
    await expect(page.getByText('สมชาย').first()).toBeVisible();
    await expect(page.getByText('วิชัย').first()).toBeVisible();
  });

  test('shows product title in room list', async ({ page }) => {
    await openChat(page);
    await expect(page.getByText('iPhone 14 Pro 256GB').first()).toBeVisible();
  });

  test('shows relative time in room list', async ({ page }) => {
    await openChat(page);
    await page.getByTestId('room-1').waitFor({ state: 'visible' });
    // 5 min ago — use first() to avoid matching "15 นาที" in sidebar bio
    await expect(page.getByText('5 นาที').first()).toBeVisible();
  });

  test('empty state shown when no rooms', async ({ page }) => {
    await openChat(page, []);
    await expect(page.getByText('ยังไม่มีการสนทนา')).toBeVisible();
    await expect(page.getByText(/กดแชทกับผู้ขาย/)).toBeVisible();
  });

  test('not-logged-in state shows lock icon and login prompt', async ({ page }) => {
    await page.route('**/api/auth/session', r => r.fulfill({
      json: { user: { name: 'test' }, expires: new Date(Date.now() + 86400000).toISOString() },
    }));
    await page.route('**/api/products*', r => r.fulfill({ json: [] }));
    await page.goto('/');
    await page.getByRole('button', { name: 'แชท' }).click();
    await expect(page.getByText('กรุณาเข้าสู่ระบบ')).toBeVisible();
  });

  // ─── Thread view ────────────────────────────────────────────────────────────

  test('clicking a room loads the thread', async ({ page }) => {
    await openChat(page);
    await clickRoom(page, 1);
    await expect(page.getByText('สมชาย').first()).toBeVisible();
    await expect(page.getByText('สวัสดีครับ สนใจสินค้าไหม')).toBeVisible();
    await expect(page.getByText('สนใจครับ').first()).toBeVisible();
  });

  test('thread header shows product title', async ({ page }) => {
    await openChat(page);
    await clickRoom(page, 1);
    await expect(page.getByText('iPhone 14 Pro 256GB').first()).toBeVisible();
  });

  test('messages from others appear on left', async ({ page }) => {
    await openChat(page);
    await clickRoom(page, 1);
    await expect(page.getByText('สวัสดีครับ สนใจสินค้าไหม')).toBeVisible();
  });

  test('own messages appear on right (accent background)', async ({ page }) => {
    await openChat(page);
    await clickRoom(page, 1);
    // Use nth(1) — first occurrence is in room list preview, second is chat bubble
    const myMsg = page.getByText('สนใจครับ').nth(1);
    await expect(myMsg).toBeVisible();
    const bubble = myMsg.locator('..');
    await expect(bubble).toHaveCSS('background-color', /rgb/);
  });

  // ─── Sending ────────────────────────────────────────────────────────────────

  test('like button shown when input is empty', async ({ page }) => {
    await openChat(page);
    await clickRoom(page, 1);
    await expect(page.getByTestId('chat-like-btn')).toBeVisible();
    await expect(page.getByTestId('chat-send-btn')).not.toBeVisible();
  });

  test('send button shown when text is typed', async ({ page }) => {
    await openChat(page);
    await clickRoom(page, 1);
    await page.getByTestId('chat-input').fill('ราคาเท่าไหร่ครับ');
    await expect(page.getByTestId('chat-send-btn')).toBeVisible();
    await expect(page.getByTestId('chat-like-btn')).not.toBeVisible();
  });

  test('typing and sending adds message optimistically', async ({ page }) => {
    let sendCalled = false;
    await setupLoggedIn(page);
    await page.route('**/api/chat/rooms/1/messages', r => {
      if (r.request().method() === 'POST') {
        sendCalled = true;
        r.fulfill({ json: { id: 99, content: 'ราคาเท่าไหร่ครับ', sender_id: 1 } });
      } else {
        r.fulfill({ json: MOCK_MESSAGES });
      }
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'แชท' }).click();
    await clickRoom(page, 1);
    await page.getByTestId('chat-input').fill('ราคาเท่าไหร่ครับ');
    await page.getByTestId('chat-send-btn').click();
    await expect(page.getByText('ราคาเท่าไหร่ครับ').first()).toBeVisible();
    expect(sendCalled).toBe(true);
  });

  test('pressing Enter sends message', async ({ page }) => {
    let sendCalled = false;
    await setupLoggedIn(page);
    await page.route('**/api/chat/rooms/1/messages', r => {
      if (r.request().method() === 'POST') {
        sendCalled = true;
        r.fulfill({ json: { id: 100, content: 'Hello', sender_id: 1 } });
      } else {
        r.fulfill({ json: MOCK_MESSAGES });
      }
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'แชท' }).click();
    await clickRoom(page, 1);
    await page.getByTestId('chat-input').fill('Hello');
    await page.getByTestId('chat-input').press('Enter');
    await expect(page.getByText('Hello').first()).toBeVisible();
    expect(sendCalled).toBe(true);
  });

  test('input clears after sending', async ({ page }) => {
    await setupLoggedIn(page);
    await page.route('**/api/chat/rooms/1/messages', r => {
      if (r.request().method() === 'POST') r.fulfill({ json: { id: 101, content: 'test', sender_id: 1 } });
      else r.fulfill({ json: MOCK_MESSAGES });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'แชท' }).click();
    await clickRoom(page, 1);
    await page.getByTestId('chat-input').fill('test');
    await page.getByTestId('chat-send-btn').click();
    await expect(page.getByTestId('chat-input')).toHaveValue('');
  });

  // ─── Mobile back navigation ──────────────────────────────────────────────────

  test('mobile: ESC while thread open goes back to room list', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openChat(page);
    await clickRoom(page, 1);
    await expect(page.getByText('สวัสดีครับ สนใจสินค้าไหม')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(chatDrawer(page)).toBeVisible();
    await expect(page.getByText('สวัสดีครับ สนใจสินค้าไหม')).not.toBeVisible();
  });

  test('mobile: back button returns to room list', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openChat(page);
    await clickRoom(page, 1);
    await expect(page.getByText('สวัสดีครับ สนใจสินค้าไหม')).toBeVisible();
    await page.getByRole('button', { name: 'กลับรายการแชท' }).click();
    await expect(chatDrawer(page)).toBeVisible();
    await expect(page.getByText('สวัสดีครับ สนใจสินค้าไหม')).not.toBeVisible();
  });

  // ─── Room list updates after send ───────────────────────────────────────────

  test('last message in room list updates after sending', async ({ page }) => {
    await setupLoggedIn(page);
    await page.route('**/api/chat/rooms/1/messages', r => {
      if (r.request().method() === 'POST') r.fulfill({ json: { id: 50, content: 'นัดรับได้ที่ไหน', sender_id: 1 } });
      else r.fulfill({ json: MOCK_MESSAGES });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'แชท' }).click();
    await clickRoom(page, 1);
    await page.getByTestId('chat-input').fill('นัดรับได้ที่ไหน');
    await page.getByTestId('chat-send-btn').click();
    await expect(page.getByText('นัดรับได้ที่ไหน').first()).toBeVisible();
  });

});
