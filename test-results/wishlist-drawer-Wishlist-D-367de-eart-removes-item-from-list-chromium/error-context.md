# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wishlist-drawer.spec.ts >> Wishlist Drawer >> clicking filled heart removes item from list
- Location: e2e\wishlist-drawer.spec.ts:126:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('v8hub')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('v8hub')

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
        - button "แชท" [ref=e18] [cursor=pointer]:
          - img [ref=e20]
          - generic [ref=e22]: แชท
        - button "ถูกใจ" [active] [ref=e23] [cursor=pointer]:
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
  7   | };
  8   | 
  9   | const MOCK_WISHLIST = [
  10  |   {
  11  |     id: 1, title: 'iPhone 14 Pro 256GB', price: 32900, original_price: 38900,
  12  |     images: [], image_url: '', seller_name: 'สมชาย',
  13  |     location: 'กรุงเทพ · พระราม 9',
  14  |     created_at: new Date(Date.now() - 86400000).toISOString(),
  15  |     condition: 'มือสอง สภาพดี', category: 'มือถือ & แท็บเล็ต',
  16  |   },
  17  |   {
  18  |     id: 2, title: 'MacBook Air M2 256GB', price: 42000,
  19  |     images: [], image_url: '', seller_name: 'วิชัย',
  20  |     location: 'เชียงใหม่',
  21  |     created_at: new Date(Date.now() - 172800000).toISOString(),
  22  |     condition: 'ใหม่ในกล่อง',
  23  |   },
  24  | ];
  25  | 
  26  | async function setupLoggedIn(page: any, wishlist = MOCK_WISHLIST) {
  27  |   await page.route('**/api/auth/session', r => r.fulfill({ json: MOCK_SESSION }));
  28  |   await page.route('**/api/products*', r => r.fulfill({ json: [] }));
  29  |   await page.route('**/api/wishlist', r => {
  30  |     if (r.request().method() === 'GET') r.fulfill({ json: wishlist });
  31  |     else r.continue();
  32  |   });
  33  |   await page.route('**/api/wishlist/**', r => r.fulfill({ json: { success: true } }));
  34  | }
  35  | 
  36  | async function openWishlist(page: any, wishlist = MOCK_WISHLIST) {
  37  |   await setupLoggedIn(page, wishlist);
  38  |   await page.goto('/');
  39  |   // "ถูกใจ" triggers onOpenHub('buy', 'saved') → opens MyHub in saved tab
  40  |   await page.getByRole('button', { name: 'ถูกใจ' }).click();
  41  |   // Wait for MyHub to render
> 42  |   await expect(page.getByTestId('v8hub')).toBeVisible();
      |                                           ^ Error: expect(locator).toBeVisible() failed
  43  | }
  44  | 
  45  | test.describe('Wishlist Drawer', () => {
  46  | 
  47  |   // ─── Opening ───────────────────────────────────────────────────────────────
  48  | 
  49  |   test('clicking "ถูกใจ" navbar button opens saved tab in MyHub', async ({ page }) => {
  50  |     await openWishlist(page);
  51  |     // MyHub opens in buy/saved tab — BuySaved renders h1 "บันทึกแล้ว"
  52  |     await expect(page.getByRole('heading', { name: 'บันทึกแล้ว' })).toBeVisible();
  53  |   });
  54  | 
  55  |   test('unauthenticated user gets auth modal instead of wishlist', async ({ page }) => {
  56  |     await page.route('**/api/auth/session', r => r.fulfill({ json: {} }));
  57  |     await page.route('**/api/products*', r => r.fulfill({ json: [] }));
  58  |     await page.goto('/');
  59  |     await page.getByRole('button', { name: 'ถูกใจ' }).click();
  60  |     // Auth modal should open — check for the submit button scoped to the modal
  61  |     await expect(page.getByTestId('auth-modal').getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  62  |     await expect(page.getByText('รายการถูกใจ')).not.toBeVisible();
  63  |   });
  64  | 
  65  |   test('saved tab shows item count', async ({ page }) => {
  66  |     await openWishlist(page);
  67  |     // BuySaved shows "2 รายการ" in the v8hub
  68  |     await expect(page.getByTestId('v8hub').getByText(/2.*รายการ/)).toBeVisible();
  69  |   });
  70  | 
  71  |   // ─── Closing ───────────────────────────────────────────────────────────────
  72  | 
  73  |   test('ESC closes MyHub', async ({ page }) => {
  74  |     await openWishlist(page);
  75  |     await expect(page.getByTestId('v8hub')).toBeVisible();
  76  |     await page.keyboard.press('Escape');
  77  |     await expect(page.getByTestId('v8hub')).not.toBeVisible();
  78  |   });
  79  | 
  80  |   test('clicking back button closes MyHub', async ({ page }) => {
  81  |     await openWishlist(page);
  82  |     await expect(page.getByTestId('v8hub')).toBeVisible();
  83  |     // Desktop back button in sidebar has exact text "Marketplace"
  84  |     await page.getByTestId('v8hub').getByRole('button', { name: 'Marketplace', exact: true }).click();
  85  |     await expect(page.getByTestId('v8hub')).not.toBeVisible();
  86  |   });
  87  | 
  88  |   // ─── Product list ──────────────────────────────────────────────────────────
  89  | 
  90  |   test('shows all wishlisted products', async ({ page }) => {
  91  |     await openWishlist(page);
  92  |     await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
  93  |     await expect(page.getByText('MacBook Air M2 256GB')).toBeVisible();
  94  |   });
  95  | 
  96  |   test('shows formatted price', async ({ page }) => {
  97  |     await openWishlist(page);
  98  |     await expect(page.getByText('฿32,900')).toBeVisible();
  99  |   });
  100 | 
  101 |   test('shows strikethrough original price', async ({ page }) => {
  102 |     await openWishlist(page);
  103 |     // original_price 38900 should appear as strikethrough
  104 |     await expect(page.locator('s').filter({ hasText: '38,900' })).toBeVisible();
  105 |   });
  106 | 
  107 |   test('shows seller name', async ({ page }) => {
  108 |     await openWishlist(page);
  109 |     await expect(page.getByText('สมชาย')).toBeVisible();
  110 |   });
  111 | 
  112 |   test('shows location', async ({ page }) => {
  113 |     await openWishlist(page);
  114 |     await expect(page.getByText('กรุงเทพ').first()).toBeVisible();
  115 |   });
  116 | 
  117 |   // ─── Footer total (feature removed — no footer sum in BuySaved) ────────────
  118 | 
  119 |   test('footer shows item count', async ({ page }) => {
  120 |     await openWishlist(page);
  121 |     await expect(page.getByText(/2 รายการ/)).toBeVisible();
  122 |   });
  123 | 
  124 |   // ─── Remove ────────────────────────────────────────────────────────────────
  125 | 
  126 |   test('clicking filled heart removes item from list', async ({ page }) => {
  127 |     await openWishlist(page);
  128 |     await expect(page.getByText('iPhone 14 Pro 256GB')).toBeVisible();
  129 |     // Remove buttons: filled red hearts
  130 |     const removeBtns = page.locator('button[title="นำออกจากรายการถูกใจ"]');
  131 |     await removeBtns.first().click();
  132 |     await expect(page.getByText('iPhone 14 Pro 256GB')).not.toBeVisible();
  133 |   });
  134 | 
  135 |   test('removing item calls DELETE/toggle API', async ({ page }) => {
  136 |     let apiCalled = false;
  137 |     await setupLoggedIn(page);
  138 |     await page.route('**/api/wishlist/1', r => {
  139 |       apiCalled = true;
  140 |       r.fulfill({ json: { success: true } });
  141 |     });
  142 |     await page.goto('/');
```