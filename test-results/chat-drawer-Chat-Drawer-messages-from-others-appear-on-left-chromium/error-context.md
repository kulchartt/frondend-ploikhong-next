# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-drawer.spec.ts >> Chat Drawer >> messages from others appear on left
- Location: e2e\chat-drawer.spec.ts:147:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.waitFor: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('room-1') to be visible

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "PloiKhong." [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]:
          - img [ref=e6]
          - generic [ref=e10]: PloiKhong.
      - generic [ref=e11]:
        - textbox "ค้นหาของมือสอง..." [ref=e12]
        - generic [ref=e13] [cursor=pointer]:
          - text: "หมวด: ทั้งหมด"
          - img [ref=e14]
        - button "ค้นหา" [ref=e16] [cursor=pointer]
      - generic [ref=e17]:
        - button "แชท" [active] [ref=e18] [cursor=pointer]:
          - img [ref=e20]
          - generic [ref=e22]: แชท
        - button "ถูกใจ" [ref=e23] [cursor=pointer]:
          - img [ref=e25]
          - generic [ref=e27]: ถูกใจ
        - button "ซื้อ" [ref=e28] [cursor=pointer]:
          - img [ref=e30]
          - generic [ref=e35]: ซื้อ
        - button "ขาย" [ref=e36] [cursor=pointer]:
          - img [ref=e38]
          - generic [ref=e40]: ขาย
        - button "Dark" [ref=e41] [cursor=pointer]:
          - img [ref=e42]
          - generic [ref=e44]: Dark
        - button "ท บัญชี" [ref=e46] [cursor=pointer]:
          - generic [ref=e47]: ท
          - generic [ref=e48]: บัญชี
        - button "+ ลงขาย" [ref=e49] [cursor=pointer]
    - generic [ref=e51]:
      - button "สำหรับคุณ" [ref=e52] [cursor=pointer]
      - button "ใกล้ฉัน" [ref=e53] [cursor=pointer]
      - button "ของใหม่" [ref=e54] [cursor=pointer]
      - button "Boost เด่น" [ref=e55] [cursor=pointer]
      - button "ส่งฟรี" [ref=e56] [cursor=pointer]
      - button "ลดราคา" [ref=e57] [cursor=pointer]
      - button "ของสะสม" [ref=e58] [cursor=pointer]
      - button "ดีลพนักงาน" [ref=e59] [cursor=pointer]
      - button "นัดรับ" [ref=e60] [cursor=pointer]
  - generic [ref=e61]:
    - complementary [ref=e62]:
      - generic [ref=e63]: หมวดหมู่
      - generic [ref=e64]:
        - button "ทั้งหมด 24,580" [ref=e65] [cursor=pointer]:
          - generic [ref=e66]: ทั้งหมด
          - generic [ref=e67]: 24,580
        - button "มือถือ & แท็บเล็ต 3,420" [ref=e68] [cursor=pointer]:
          - generic [ref=e69]: มือถือ & แท็บเล็ต
          - generic [ref=e70]: 3,420
        - button "คอมพิวเตอร์ 1,890" [ref=e71] [cursor=pointer]:
          - generic [ref=e72]: คอมพิวเตอร์
          - generic [ref=e73]: 1,890
        - button "เครื่องใช้ไฟฟ้า 2,150" [ref=e74] [cursor=pointer]:
          - generic [ref=e75]: เครื่องใช้ไฟฟ้า
          - generic [ref=e76]: 2,150
        - button "เฟอร์นิเจอร์ 1,120" [ref=e77] [cursor=pointer]:
          - generic [ref=e78]: เฟอร์นิเจอร์
          - generic [ref=e79]: 1,120
        - button "แฟชั่น 5,200" [ref=e80] [cursor=pointer]:
          - generic [ref=e81]: แฟชั่น
          - generic [ref=e82]: 5,200
        - button "กล้อง & อุปกรณ์ 780" [ref=e83] [cursor=pointer]:
          - generic [ref=e84]: กล้อง & อุปกรณ์
          - generic [ref=e85]: "780"
        - button "กีฬา & จักรยาน 940" [ref=e86] [cursor=pointer]:
          - generic [ref=e87]: กีฬา & จักรยาน
          - generic [ref=e88]: "940"
        - button "ของสะสม & เกม 2,380" [ref=e89] [cursor=pointer]:
          - generic [ref=e90]: ของสะสม & เกม
          - generic [ref=e91]: 2,380
        - button "หนังสือ 1,450" [ref=e92] [cursor=pointer]:
          - generic [ref=e93]: หนังสือ
          - generic [ref=e94]: 1,450
        - button "สัตว์เลี้ยง 620" [ref=e95] [cursor=pointer]:
          - generic [ref=e96]: สัตว์เลี้ยง
          - generic [ref=e97]: "620"
        - button "อื่นๆ 4,630" [ref=e98] [cursor=pointer]:
          - generic [ref=e99]: อื่นๆ
          - generic [ref=e100]: 4,630
      - generic [ref=e102]: ช่วงราคา
      - generic [ref=e103]:
        - spinbutton [ref=e104]
        - spinbutton [ref=e105]
      - generic [ref=e107]: สภาพสินค้า
      - generic [ref=e108] [cursor=pointer]:
        - checkbox "ใหม่ในกล่อง" [ref=e109]
        - text: ใหม่ในกล่อง
      - generic [ref=e110] [cursor=pointer]:
        - checkbox "สภาพ 90%+" [ref=e111]
        - text: สภาพ 90%+
      - generic [ref=e112] [cursor=pointer]:
        - checkbox "มือสองทั่วไป" [ref=e113]
        - text: มือสองทั่วไป
      - generic [ref=e114] [cursor=pointer]:
        - checkbox "ซ่อมได้" [ref=e115]
        - text: ซ่อมได้
      - generic [ref=e117]: พื้นที่
      - generic [ref=e118] [cursor=pointer]:
        - radio "ทุกที่" [checked] [ref=e119]
        - text: ทุกที่
      - generic [ref=e120] [cursor=pointer]:
        - radio "รอบตัว 5 กม." [ref=e121]
        - text: รอบตัว 5 กม.
      - generic [ref=e122] [cursor=pointer]:
        - radio "กรุงเทพฯ-ปริมณฑล" [ref=e123]
        - text: กรุงเทพฯ-ปริมณฑล
      - generic [ref=e124] [cursor=pointer]:
        - radio "ส่งทั่วประเทศ" [ref=e125]
        - text: ส่งทั่วประเทศ
      - generic [ref=e127]: วิธีรับสินค้า
      - generic [ref=e128] [cursor=pointer]:
        - checkbox "นัดรับ" [ref=e129]
        - text: นัดรับ
      - generic [ref=e130] [cursor=pointer]:
        - checkbox "ส่ง PloiShip" [ref=e131]
        - text: ส่ง PloiShip
      - generic [ref=e132] [cursor=pointer]:
        - checkbox "ส่งฟรี" [ref=e133]
        - text: ส่งฟรี
    - main [ref=e134]:
      - generic [ref=e135]:
        - generic [ref=e136]: ฿
        - generic [ref=e137]:
          - generic [ref=e138]: ขายของชิ้นแรกได้ใน 48 ชม. — การันตี
          - generic [ref=e139]: ถ้าประกาศ 3 ชิ้นแรกไม่ได้รับข้อความภายใน 2 วัน เราจะ Boost ฟรีให้ทั้งหมด
        - button "ลงขายฟรี" [ref=e140] [cursor=pointer]
      - generic [ref=e141]:
        - generic [ref=e142]:
          - generic [ref=e143]: "001"
          - generic [ref=e144]: ลงขายฟรีไม่จำกัด
          - generic [ref=e145]: โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียม ลงประกาศ จ่ายเฉพาะเมื่อขายสำเร็จ 3%
        - generic [ref=e146]:
          - generic [ref=e147]: "002"
          - generic [ref=e148]: Boost สินค้า ฿29
          - generic [ref=e149]: ดันโพสต์ขึ้นฟีดบนสุด 48 ชม. เพิ่มยอดคนเห็น 8-12 เท่า
        - generic [ref=e150]:
          - generic [ref=e151]: "003"
          - generic [ref=e152]: รับเงินปลอดภัย
          - generic [ref=e153]: PloiPay ถือเงินไว้จนกว่าผู้ซื้อจะได้รับของ โอนเข้าบัญชีภายใน 1 วันทำการ
        - generic [ref=e154]:
          - generic [ref=e155]: "004"
          - generic [ref=e156]: ค่าส่งคืนได้
          - generic [ref=e157]: เคลมค่าจัดส่งคืนได้สูงสุด ฿60 ถ้าใช้ PloiShip ในการส่ง
      - generic [ref=e158]:
        - generic [ref=e159]:
          - text: พบ
          - strong [ref=e160]: "0"
          - text: รายการ
        - generic [ref=e161]:
          - combobox [ref=e162] [cursor=pointer]:
            - option "ล่าสุด" [selected]
            - option "ราคา ถูก→แพง"
            - option "ราคา แพง→ถูก"
            - option "ยอดนิยม"
          - generic [ref=e163]:
            - button [ref=e164] [cursor=pointer]:
              - img [ref=e165]
            - button [ref=e170] [cursor=pointer]:
              - img [ref=e171]
      - generic [ref=e173]:
        - generic [ref=e174]: 🔍
        - generic [ref=e175]: ไม่พบสินค้า
        - generic [ref=e176]: ลองปรับตัวกรองหรือคำค้นหาดูครับ
  - button "Open Next.js Dev Tools" [ref=e182] [cursor=pointer]:
    - img [ref=e183]
  - alert [ref=e186]
  - generic [ref=e188]:
    - button [ref=e189] [cursor=pointer]:
      - img [ref=e190]
    - generic [ref=e194]:
      - img [ref=e195]
      - generic [ref=e199]: PloiKhong.
    - heading "ยินดีต้อนรับกลับ" [level=2] [ref=e200]
    - paragraph [ref=e201]: เข้าสู่ระบบเพื่อซื้อ-ขายในตลาด
    - generic [ref=e202]:
      - button "Facebook" [ref=e203] [cursor=pointer]:
        - img [ref=e204]
        - text: Facebook
      - button "Google" [ref=e206] [cursor=pointer]:
        - img [ref=e207]
        - text: Google
      - button "Apple" [ref=e212] [cursor=pointer]:
        - img [ref=e213]
        - text: Apple
      - button "LINE" [ref=e215] [cursor=pointer]:
        - img [ref=e216]
        - text: LINE
    - generic [ref=e220]: หรือ
    - generic [ref=e222]:
      - textbox "อีเมล" [ref=e223]
      - generic [ref=e224]:
        - textbox "รหัสผ่าน" [ref=e225]
        - button [ref=e226] [cursor=pointer]:
          - img [ref=e227]
      - button "เข้าสู่ระบบ" [ref=e230] [cursor=pointer]
    - generic [ref=e231]:
      - text: ยังไม่มีบัญชี?
      - button "สมัครสมาชิก" [ref=e232] [cursor=pointer]
      - text: ·
      - button "ลืมรหัสผ่าน?" [ref=e233] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const MOCK_SESSION = {
  4   |   user: { name: 'ทดสอบ', email: 'test@ploi.dev', image: null },
  5   |   expires: new Date(Date.now() + 86400000).toISOString(),
  6   |   token: 'mock-token-abc',
  7   |   userId: 1,
  8   | };
  9   | 
  10  | const MOCK_ROOMS = [
  11  |   {
  12  |     id: 1,
  13  |     seller_name: 'สมชาย',
  14  |     product_title: 'iPhone 14 Pro 256GB',
  15  |     product_image: '',
  16  |     last_message: 'สนใจครับ',
  17  |     updated_at: new Date(Date.now() - 300000).toISOString(),
  18  |     buyer_id: 1,
  19  |   },
  20  |   {
  21  |     id: 2,
  22  |     seller_name: 'วิชัย',
  23  |     product_title: 'MacBook Air M2',
  24  |     product_image: '',
  25  |     last_message: 'ราคาต่อได้ไหม',
  26  |     updated_at: new Date(Date.now() - 3600000).toISOString(),
  27  |     buyer_id: 1,
  28  |   },
  29  | ];
  30  | 
  31  | const MOCK_MESSAGES = [
  32  |   { id: 1, sender_id: 99, content: 'สวัสดีครับ สนใจสินค้าไหม', created_at: new Date(Date.now() - 600000).toISOString() },
  33  |   { id: 2, sender_id: 1,  content: 'สนใจครับ', created_at: new Date(Date.now() - 300000).toISOString() },
  34  | ];
  35  | 
  36  | async function setupLoggedIn(page: any, rooms = MOCK_ROOMS) {
  37  |   await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  38  |   await page.route('**/api/products*', r => r.fulfill({ json: [] }));
  39  |   await page.route('**/api/wishlist', r => r.fulfill({ json: [] }));
  40  |   await page.route('**/api/chat/rooms', r => r.fulfill({ json: rooms }));
  41  |   await page.route('**/api/chat/rooms/*/messages', r => r.fulfill({ json: MOCK_MESSAGES }));
  42  | }
  43  | 
  44  | async function openChat(page: any, rooms = MOCK_ROOMS) {
  45  |   await setupLoggedIn(page, rooms);
  46  |   await page.goto('/');
  47  |   await page.getByRole('button', { name: 'แชท' }).click();
  48  | }
  49  | 
  50  | /** Helper: chat drawer is visible */
  51  | function chatDrawer(page: any) {
  52  |   return page.getByTestId('chat-drawer');
  53  | }
  54  | 
  55  | /** Helper: wait for room list to load then click a room */
  56  | async function clickRoom(page: any, id: number) {
> 57  |   await page.getByTestId(`room-${id}`).waitFor({ state: 'visible' });
      |                                        ^ Error: locator.waitFor: Test timeout of 30000ms exceeded.
  58  |   await page.getByTestId(`room-${id}`).click();
  59  | }
  60  | 
  61  | test.describe('Chat Drawer', () => {
  62  | 
  63  |   // ─── Opening ────────────────────────────────────────────────────────────────
  64  | 
  65  |   test('clicking "แชท" navbar button opens chat drawer when logged in', async ({ page }) => {
  66  |     await openChat(page);
  67  |     await expect(chatDrawer(page)).toBeVisible();
  68  |     await expect(page.getByRole('heading', { name: 'แชท' })).toBeVisible();
  69  |   });
  70  | 
  71  |   test('unauthenticated user gets auth modal instead of chat drawer', async ({ page }) => {
  72  |     await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
  73  |     await page.route('**/api/products*', r => r.fulfill({ json: [] }));
  74  |     await page.goto('/');
  75  |     await page.getByRole('button', { name: 'แชท' }).click();
  76  |     await expect(page.getByTestId('auth-modal')).toBeVisible();
  77  |     await expect(chatDrawer(page)).not.toBeVisible();
  78  |   });
  79  | 
  80  |   // ─── Closing ────────────────────────────────────────────────────────────────
  81  | 
  82  |   test('ESC closes the drawer when no room selected', async ({ page }) => {
  83  |     await openChat(page);
  84  |     await expect(chatDrawer(page)).toBeVisible();
  85  |     await page.keyboard.press('Escape');
  86  |     await expect(chatDrawer(page)).not.toBeVisible();
  87  |   });
  88  | 
  89  |   test('back button closes the drawer', async ({ page }) => {
  90  |     await openChat(page);
  91  |     await page.getByRole('button', { name: 'กลับ' }).first().click();
  92  |     await expect(chatDrawer(page)).not.toBeVisible();
  93  |   });
  94  | 
  95  |   // ─── Room list ──────────────────────────────────────────────────────────────
  96  | 
  97  |   test('shows all rooms with seller names', async ({ page }) => {
  98  |     await openChat(page);
  99  |     await expect(page.getByText('สมชาย').first()).toBeVisible();
  100 |     await expect(page.getByText('วิชัย').first()).toBeVisible();
  101 |   });
  102 | 
  103 |   test('shows product title in room list', async ({ page }) => {
  104 |     await openChat(page);
  105 |     await expect(page.getByText('iPhone 14 Pro 256GB').first()).toBeVisible();
  106 |   });
  107 | 
  108 |   test('shows relative time in room list', async ({ page }) => {
  109 |     await openChat(page);
  110 |     await page.getByTestId('room-1').waitFor({ state: 'visible' });
  111 |     // 5 min ago — use first() to avoid matching "15 นาที" in sidebar bio
  112 |     await expect(page.getByText('5 นาที').first()).toBeVisible();
  113 |   });
  114 | 
  115 |   test('empty state shown when no rooms', async ({ page }) => {
  116 |     await openChat(page, []);
  117 |     await expect(page.getByText('ยังไม่มีการสนทนา')).toBeVisible();
  118 |     await expect(page.getByText(/กดแชทกับผู้ขาย/)).toBeVisible();
  119 |   });
  120 | 
  121 |   test('not-logged-in state shows lock icon and login prompt', async ({ page }) => {
  122 |     await page.route('**/api/auth/session', r => r.fulfill({
  123 |       json: { user: { name: 'test' }, expires: new Date(Date.now() + 86400000).toISOString() },
  124 |     }));
  125 |     await page.route('**/api/products*', r => r.fulfill({ json: [] }));
  126 |     await page.goto('/');
  127 |     await page.getByRole('button', { name: 'แชท' }).click();
  128 |     await expect(page.getByText('กรุณาเข้าสู่ระบบ')).toBeVisible();
  129 |   });
  130 | 
  131 |   // ─── Thread view ────────────────────────────────────────────────────────────
  132 | 
  133 |   test('clicking a room loads the thread', async ({ page }) => {
  134 |     await openChat(page);
  135 |     await clickRoom(page, 1);
  136 |     await expect(page.getByText('สมชาย').first()).toBeVisible();
  137 |     await expect(page.getByText('สวัสดีครับ สนใจสินค้าไหม')).toBeVisible();
  138 |     await expect(page.getByText('สนใจครับ').first()).toBeVisible();
  139 |   });
  140 | 
  141 |   test('thread header shows product title', async ({ page }) => {
  142 |     await openChat(page);
  143 |     await clickRoom(page, 1);
  144 |     await expect(page.getByText('iPhone 14 Pro 256GB').first()).toBeVisible();
  145 |   });
  146 | 
  147 |   test('messages from others appear on left', async ({ page }) => {
  148 |     await openChat(page);
  149 |     await clickRoom(page, 1);
  150 |     await expect(page.getByText('สวัสดีครับ สนใจสินค้าไหม')).toBeVisible();
  151 |   });
  152 | 
  153 |   test('own messages appear on right (accent background)', async ({ page }) => {
  154 |     await openChat(page);
  155 |     await clickRoom(page, 1);
  156 |     // Use nth(1) — first occurrence is in room list preview, second is chat bubble
  157 |     const myMsg = page.getByText('สนใจครับ').nth(1);
```