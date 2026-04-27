# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Home Page >> sidebar: category list is visible
- Location: e2e\home.spec.ts:51:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('ทั้งหมด')
Expected: visible
Error: strict mode violation: getByText('ทั้งหมด') resolved to 3 elements:
    1) <div>…</div> aka getByText('หมวด: ทั้งหมด')
    2) <span>ทั้งหมด</span> aka getByRole('button', { name: 'ทั้งหมด' })
    3) <div>ถ้าประกาศ 3 ชิ้นแรกไม่ได้รับข้อความภายใน 2 วัน เร…</div> aka getByText('ถ้าประกาศ 3')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('ทั้งหมด')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
        - button "เข้าสู่ระบบ" [ref=e46] [cursor=pointer]:
          - img [ref=e47]
          - generic [ref=e50]: เข้าสู่ระบบ
        - button "+ ลงขาย" [ref=e51] [cursor=pointer]
    - generic [ref=e53]:
      - button "สำหรับคุณ" [ref=e54] [cursor=pointer]
      - button "ใกล้ฉัน" [ref=e55] [cursor=pointer]
      - button "ของใหม่" [ref=e56] [cursor=pointer]
      - button "Boost เด่น" [ref=e57] [cursor=pointer]
      - button "ส่งฟรี" [ref=e58] [cursor=pointer]
      - button "ลดราคา" [ref=e59] [cursor=pointer]
      - button "ของสะสม" [ref=e60] [cursor=pointer]
      - button "ดีลพนักงาน" [ref=e61] [cursor=pointer]
      - button "นัดรับ" [ref=e62] [cursor=pointer]
  - generic [ref=e63]:
    - complementary [ref=e64]:
      - generic [ref=e65]: หมวดหมู่
      - generic [ref=e66]:
        - button "ทั้งหมด 24,580" [ref=e67] [cursor=pointer]:
          - generic [ref=e68]: ทั้งหมด
          - generic [ref=e69]: 24,580
        - button "มือถือ & แท็บเล็ต 3,420" [ref=e70] [cursor=pointer]:
          - generic [ref=e71]: มือถือ & แท็บเล็ต
          - generic [ref=e72]: 3,420
        - button "คอมพิวเตอร์ 1,890" [ref=e73] [cursor=pointer]:
          - generic [ref=e74]: คอมพิวเตอร์
          - generic [ref=e75]: 1,890
        - button "เครื่องใช้ไฟฟ้า 2,150" [ref=e76] [cursor=pointer]:
          - generic [ref=e77]: เครื่องใช้ไฟฟ้า
          - generic [ref=e78]: 2,150
        - button "เฟอร์นิเจอร์ 1,120" [ref=e79] [cursor=pointer]:
          - generic [ref=e80]: เฟอร์นิเจอร์
          - generic [ref=e81]: 1,120
        - button "แฟชั่น 5,200" [ref=e82] [cursor=pointer]:
          - generic [ref=e83]: แฟชั่น
          - generic [ref=e84]: 5,200
        - button "กล้อง & อุปกรณ์ 780" [ref=e85] [cursor=pointer]:
          - generic [ref=e86]: กล้อง & อุปกรณ์
          - generic [ref=e87]: "780"
        - button "กีฬา & จักรยาน 940" [ref=e88] [cursor=pointer]:
          - generic [ref=e89]: กีฬา & จักรยาน
          - generic [ref=e90]: "940"
        - button "ของสะสม & เกม 2,380" [ref=e91] [cursor=pointer]:
          - generic [ref=e92]: ของสะสม & เกม
          - generic [ref=e93]: 2,380
        - button "หนังสือ 1,450" [ref=e94] [cursor=pointer]:
          - generic [ref=e95]: หนังสือ
          - generic [ref=e96]: 1,450
        - button "สัตว์เลี้ยง 620" [ref=e97] [cursor=pointer]:
          - generic [ref=e98]: สัตว์เลี้ยง
          - generic [ref=e99]: "620"
        - button "อื่นๆ 4,630" [ref=e100] [cursor=pointer]:
          - generic [ref=e101]: อื่นๆ
          - generic [ref=e102]: 4,630
      - generic [ref=e104]: ช่วงราคา
      - generic [ref=e105]:
        - spinbutton [ref=e106]
        - spinbutton [ref=e107]
      - generic [ref=e109]: สภาพสินค้า
      - generic [ref=e110] [cursor=pointer]:
        - checkbox "ใหม่ในกล่อง" [ref=e111]
        - text: ใหม่ในกล่อง
      - generic [ref=e112] [cursor=pointer]:
        - checkbox "สภาพ 90%+" [ref=e113]
        - text: สภาพ 90%+
      - generic [ref=e114] [cursor=pointer]:
        - checkbox "มือสองทั่วไป" [ref=e115]
        - text: มือสองทั่วไป
      - generic [ref=e116] [cursor=pointer]:
        - checkbox "ซ่อมได้" [ref=e117]
        - text: ซ่อมได้
      - generic [ref=e119]: พื้นที่
      - generic [ref=e120] [cursor=pointer]:
        - radio "ทุกที่" [checked] [ref=e121]
        - text: ทุกที่
      - generic [ref=e122] [cursor=pointer]:
        - radio "รอบตัว 5 กม." [ref=e123]
        - text: รอบตัว 5 กม.
      - generic [ref=e124] [cursor=pointer]:
        - radio "กรุงเทพฯ-ปริมณฑล" [ref=e125]
        - text: กรุงเทพฯ-ปริมณฑล
      - generic [ref=e126] [cursor=pointer]:
        - radio "ส่งทั่วประเทศ" [ref=e127]
        - text: ส่งทั่วประเทศ
      - generic [ref=e129]: วิธีรับสินค้า
      - generic [ref=e130] [cursor=pointer]:
        - checkbox "นัดรับ" [ref=e131]
        - text: นัดรับ
      - generic [ref=e132] [cursor=pointer]:
        - checkbox "ส่ง PloiShip" [ref=e133]
        - text: ส่ง PloiShip
      - generic [ref=e134] [cursor=pointer]:
        - checkbox "ส่งฟรี" [ref=e135]
        - text: ส่งฟรี
    - main [ref=e136]:
      - generic [ref=e137]:
        - generic [ref=e138]: ฿
        - generic [ref=e139]:
          - generic [ref=e140]: ขายของชิ้นแรกได้ใน 48 ชม. — การันตี
          - generic [ref=e141]: ถ้าประกาศ 3 ชิ้นแรกไม่ได้รับข้อความภายใน 2 วัน เราจะ Boost ฟรีให้ทั้งหมด
        - button "ลงขายฟรี" [ref=e142] [cursor=pointer]
      - generic [ref=e143]:
        - generic [ref=e144]:
          - generic [ref=e145]: "001"
          - generic [ref=e146]: ลงขายฟรีไม่จำกัด
          - generic [ref=e147]: โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียม ลงประกาศ จ่ายเฉพาะเมื่อขายสำเร็จ 3%
        - generic [ref=e148]:
          - generic [ref=e149]: "002"
          - generic [ref=e150]: Boost สินค้า ฿29
          - generic [ref=e151]: ดันโพสต์ขึ้นฟีดบนสุด 48 ชม. เพิ่มยอดคนเห็น 8-12 เท่า
        - generic [ref=e152]:
          - generic [ref=e153]: "003"
          - generic [ref=e154]: รับเงินปลอดภัย
          - generic [ref=e155]: PloiPay ถือเงินไว้จนกว่าผู้ซื้อจะได้รับของ โอนเข้าบัญชีภายใน 1 วันทำการ
        - generic [ref=e156]:
          - generic [ref=e157]: "004"
          - generic [ref=e158]: ค่าส่งคืนได้
          - generic [ref=e159]: เคลมค่าจัดส่งคืนได้สูงสุด ฿60 ถ้าใช้ PloiShip ในการส่ง
      - generic [ref=e160]:
        - generic [ref=e161]:
          - text: พบ
          - strong [ref=e162]: "0"
          - text: รายการ
        - generic [ref=e163]:
          - combobox [ref=e164] [cursor=pointer]:
            - option "ล่าสุด" [selected]
            - option "ราคา ถูก→แพง"
            - option "ราคา แพง→ถูก"
            - option "ยอดนิยม"
          - generic [ref=e165]:
            - button [ref=e166] [cursor=pointer]:
              - img [ref=e167]
            - button [ref=e172] [cursor=pointer]:
              - img [ref=e173]
  - button "Open Next.js Dev Tools" [ref=e189] [cursor=pointer]:
    - img [ref=e190]
  - alert [ref=e193]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Home Page', () => {
  4   | 
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await page.goto('/');
  7   |   });
  8   | 
  9   |   // ─── Navbar ────────────────────────────────────────────────────────────────
  10  | 
  11  |   test('navbar: logo is visible', async ({ page }) => {
  12  |     // PloiWordmark renders an SVG inside the navbar
  13  |     const navbar = page.locator('nav, header').first();
  14  |     await expect(navbar).toBeVisible();
  15  |   });
  16  | 
  17  |   test('navbar: search box is visible and accepts input', async ({ page }) => {
  18  |     const search = page.getByPlaceholder(/ค้นหา/i);
  19  |     await expect(search).toBeVisible();
  20  |     await search.fill('iphone');
  21  |     await expect(search).toHaveValue('iphone');
  22  |   });
  23  | 
  24  |   test('navbar: "+ ลงขาย" button is visible', async ({ page }) => {
  25  |     const btn = page.getByRole('button', { name: /ลงขาย/i });
  26  |     await expect(btn.first()).toBeVisible();
  27  |   });
  28  | 
  29  |   test('navbar: sub-nav pills are rendered', async ({ page }) => {
  30  |     await expect(page.getByText('สำหรับคุณ')).toBeVisible();
  31  |     await expect(page.getByText('ของใหม่')).toBeVisible();
  32  |   });
  33  | 
  34  |   // ─── Promo Banner ──────────────────────────────────────────────────────────
  35  | 
  36  |   test('promo banner: visible with 48-hour guarantee text', async ({ page }) => {
  37  |     await expect(page.getByText(/48 ชม/)).toBeVisible();
  38  |   });
  39  | 
  40  |   // ─── Money Rail ────────────────────────────────────────────────────────────
  41  | 
  42  |   test('money rail: shows 4 feature cards', async ({ page }) => {
  43  |     await expect(page.getByText('ลงขายฟรีไม่จำกัด')).toBeVisible();
  44  |     await expect(page.getByText(/Boost สินค้า/)).toBeVisible();
  45  |     await expect(page.getByText('รับเงินปลอดภัย')).toBeVisible();
  46  |     await expect(page.getByText('ค่าส่งคืนได้')).toBeVisible();
  47  |   });
  48  | 
  49  |   // ─── Sidebar ───────────────────────────────────────────────────────────────
  50  | 
  51  |   test('sidebar: category list is visible', async ({ page }) => {
> 52  |     await expect(page.getByText('ทั้งหมด')).toBeVisible();
      |                                             ^ Error: expect(locator).toBeVisible() failed
  53  |     await expect(page.getByText('มือถือ & แท็บเล็ต')).toBeVisible();
  54  |     await expect(page.getByText('แฟชั่น')).toBeVisible();
  55  |   });
  56  | 
  57  |   test('sidebar: price range inputs accept numbers', async ({ page }) => {
  58  |     const minInput = page.getByPlaceholder('ต่ำสุด');
  59  |     const maxInput = page.getByPlaceholder('สูงสุด');
  60  |     await expect(minInput).toBeVisible();
  61  |     await expect(maxInput).toBeVisible();
  62  |     await minInput.fill('100');
  63  |     await maxInput.fill('5000');
  64  |     await expect(minInput).toHaveValue('100');
  65  |     await expect(maxInput).toHaveValue('5000');
  66  |   });
  67  | 
  68  |   test('sidebar: condition checkboxes are present', async ({ page }) => {
  69  |     await expect(page.getByLabel('ใหม่ในกล่อง')).toBeVisible();
  70  |     await expect(page.getByLabel('มือสองทั่วไป')).toBeVisible();
  71  |   });
  72  | 
  73  |   test('sidebar: clicking a condition checkbox toggles it', async ({ page }) => {
  74  |     const checkbox = page.getByLabel('ใหม่ในกล่อง');
  75  |     await expect(checkbox).not.toBeChecked();
  76  |     await checkbox.click();
  77  |     await expect(checkbox).toBeChecked();
  78  |     await checkbox.click();
  79  |     await expect(checkbox).not.toBeChecked();
  80  |   });
  81  | 
  82  |   test('sidebar: location radio buttons are present', async ({ page }) => {
  83  |     await expect(page.getByLabel('ทุกที่')).toBeVisible();
  84  |     await expect(page.getByLabel('กรุงเทพฯ-ปริมณฑล')).toBeVisible();
  85  |   });
  86  | 
  87  |   test('sidebar: delivery checkboxes are present', async ({ page }) => {
  88  |     await expect(page.getByLabel('นัดรับ')).toBeVisible();
  89  |     await expect(page.getByLabel('ส่ง PloiShip')).toBeVisible();
  90  |   });
  91  | 
  92  |   test('sidebar: clicking a category updates the active category', async ({ page }) => {
  93  |     const catBtn = page.getByRole('button', { name: /แฟชั่น/ });
  94  |     await catBtn.click();
  95  |     // The button should now have bold/highlighted styling (fontWeight 600)
  96  |     // We verify the filter result count label changes to include the category
  97  |     await page.waitForTimeout(500); // allow state to propagate
  98  |     const resultLabel = page.locator('text=/หมวด: แฟชั่น/');
  99  |     await expect(resultLabel).toBeVisible();
  100 |   });
  101 | 
  102 |   // ─── Toolbar ───────────────────────────────────────────────────────────────
  103 | 
  104 |   test('toolbar: result count is displayed', async ({ page }) => {
  105 |     await expect(page.getByText(/พบ/)).toBeVisible();
  106 |     await expect(page.getByText(/รายการ/)).toBeVisible();
  107 |   });
  108 | 
  109 |   test('toolbar: sort dropdown has expected options', async ({ page }) => {
  110 |     const select = page.getByRole('combobox');
  111 |     await expect(select).toBeVisible();
  112 |     await expect(select).toContainText('ล่าสุด');
  113 |   });
  114 | 
  115 |   test('toolbar: sort dropdown changes value', async ({ page }) => {
  116 |     const select = page.getByRole('combobox');
  117 |     await select.selectOption('price-asc');
  118 |     await expect(select).toHaveValue('price-asc');
  119 |   });
  120 | 
  121 |   test('toolbar: grid/list toggle buttons are visible', async ({ page }) => {
  122 |     // Two icon buttons: LayoutGrid and List
  123 |     const buttons = page.locator('button').filter({ has: page.locator('svg') });
  124 |     await expect(buttons.first()).toBeVisible();
  125 |   });
  126 | 
  127 |   test('toolbar: clicking list view toggles layout', async ({ page }) => {
  128 |     // Wait for products to load first
  129 |     await page.waitForTimeout(1500);
  130 |     // Click the List button (second toggle)
  131 |     const listBtn = page.locator('button').nth(-1);
  132 |     await listBtn.click();
  133 |     // Grid becomes single column: gridTemplateColumns: '1fr'
  134 |     const grid = page.locator('div').filter({ hasText: /รายการ/ }).last();
  135 |     // Just verify no crash and page still shows products label
  136 |     await expect(page.getByText(/พบ/)).toBeVisible();
  137 |   });
  138 | 
  139 |   // ─── Product Grid ──────────────────────────────────────────────────────────
  140 | 
  141 |   test('product grid: shows loading skeletons initially', async ({ page }) => {
  142 |     // Intercept the API to delay it so we can see skeletons
  143 |     await page.route('**/api/products**', async route => {
  144 |       await new Promise(resolve => setTimeout(resolve, 500));
  145 |       await route.continue();
  146 |     });
  147 |     await page.goto('/');
  148 |     // Skeletons are divs with aspectRatio 4/3 and animation
  149 |     const skeletons = page.locator('div[style*="aspectRatio"]');
  150 |     // They should appear briefly
  151 |     await expect(skeletons.first()).toBeVisible({ timeout: 2000 }).catch(() => {
  152 |       // Skeletons may have already disappeared — that's acceptable
```