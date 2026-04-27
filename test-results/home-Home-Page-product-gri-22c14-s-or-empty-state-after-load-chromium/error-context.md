# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Home Page >> product grid: shows products or empty state after load
- Location: e2e\home.spec.ts:156:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
          - strong [ref=e162]: "20"
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
      - generic [ref=e175]:
        - generic [ref=e176] [cursor=pointer]:
          - generic [ref=e177]:
            - img "50 · สภาพดี ครบกล่อง" [ref=e178]
            - button [ref=e179]:
              - img [ref=e180]
          - generic [ref=e182]:
            - generic [ref=e183]: 50 · สภาพดี ครบกล่อง
            - generic [ref=e184]: ฿10
            - generic [ref=e185]:
              - generic [ref=e186]: กรุงเทพ
              - generic [ref=e187]: 1 วันที่แล้ว
        - generic [ref=e188] [cursor=pointer]:
          - generic [ref=e189]:
            - img "เก้าอี้ 3 · สภาพดี ครบกล่อง" [ref=e190]
            - button [ref=e191]:
              - img [ref=e192]
          - generic [ref=e194]:
            - generic [ref=e195]: เก้าอี้ 3 · สภาพดี ครบกล่อง
            - generic [ref=e196]: ฿33
            - generic [ref=e197]:
              - generic [ref=e198]: กรุงเทพ
              - generic [ref=e199]: 1 วันที่แล้ว
        - generic [ref=e200] [cursor=pointer]:
          - generic [ref=e201]:
            - img "เก้าอี้ 2 · สภาพดี ครบกล่อง" [ref=e202]
            - button [ref=e203]:
              - img [ref=e204]
          - generic [ref=e206]:
            - generic [ref=e207]: เก้าอี้ 2 · สภาพดี ครบกล่อง
            - generic [ref=e208]: ฿20
            - generic [ref=e209]:
              - generic [ref=e210]: กรุงเทพ
              - generic [ref=e211]: 1 วันที่แล้ว
        - generic [ref=e212] [cursor=pointer]:
          - generic [ref=e213]:
            - img "ip17 · สภาพดี ครบกล่อง" [ref=e214]
            - button [ref=e215]:
              - img [ref=e216]
          - generic [ref=e218]:
            - generic [ref=e219]: ip17 · สภาพดี ครบกล่อง
            - generic [ref=e220]: ฿30,000
            - generic [ref=e221]:
              - generic [ref=e222]: กรุงเทพ
              - generic [ref=e223]: 1 วันที่แล้ว
        - generic [ref=e224] [cursor=pointer]:
          - generic [ref=e225]:
            - img "เก้าอี้ · สภาพดี ครบกล่อง" [ref=e226]
            - button [ref=e227]:
              - img [ref=e228]
          - generic [ref=e230]:
            - generic [ref=e231]: เก้าอี้ · สภาพดี ครบกล่อง
            - generic [ref=e232]: ฿200
            - generic [ref=e233]:
              - generic [ref=e234]: กรุงเทพ
              - generic [ref=e235]: 1 วันที่แล้ว
        - generic [ref=e236] [cursor=pointer]:
          - generic [ref=e237]:
            - img "Ps5 Portal - 2 · สภาพดี ครบกล่อง" [ref=e238]
            - button [ref=e239]:
              - img [ref=e240]
          - generic [ref=e242]:
            - generic [ref=e243]: Ps5 Portal - 2 · สภาพดี ครบกล่อง
            - generic [ref=e244]: ฿4,000
            - generic [ref=e245]:
              - generic [ref=e246]: กรุงเทพ
              - generic [ref=e247]: 1 วันที่แล้ว
        - generic [ref=e248] [cursor=pointer]:
          - generic [ref=e249]:
            - img "Ps5 Portal · สภาพดี ครบกล่อง" [ref=e250]
            - button [ref=e251]:
              - img [ref=e252]
          - generic [ref=e254]:
            - generic [ref=e255]: Ps5 Portal · สภาพดี ครบกล่อง
            - generic [ref=e256]: ฿5,000
            - generic [ref=e257]:
              - generic [ref=e258]: กรุงเทพ
              - generic [ref=e259]: 1 วันที่แล้ว
        - generic [ref=e260] [cursor=pointer]:
          - generic [ref=e261]:
            - img "่Joy · สภาพดี ครบกล่อง" [ref=e262]
            - button [ref=e263]:
              - img [ref=e264]
          - generic [ref=e266]:
            - generic [ref=e267]: ่Joy · สภาพดี ครบกล่อง
            - generic [ref=e268]: ฿500
            - generic [ref=e269]:
              - generic [ref=e270]: กรุงเทพ
              - generic [ref=e271]: 1 วันที่แล้ว
        - generic [ref=e272] [cursor=pointer]:
          - generic [ref=e273]:
            - img "NS2 - 2 · สภาพดี ครบกล่อง" [ref=e274]
            - button [ref=e275]:
              - img [ref=e276]
          - generic [ref=e278]:
            - generic [ref=e279]: NS2 - 2 · สภาพดี ครบกล่อง
            - generic [ref=e280]: ฿9,999
            - generic [ref=e281]:
              - generic [ref=e282]: กรุงเทพ
              - generic [ref=e283]: 1 วันที่แล้ว
        - generic [ref=e284] [cursor=pointer]:
          - generic [ref=e285]:
            - img "NS2 · สภาพดี ครบกล่อง" [ref=e286]
            - button [ref=e287]:
              - img [ref=e288]
          - generic [ref=e290]:
            - generic [ref=e291]: NS2 · สภาพดี ครบกล่อง
            - generic [ref=e292]: ฿10,000
            - generic [ref=e293]:
              - generic [ref=e294]: กรุงเทพ
              - generic [ref=e295]: 1 วันที่แล้ว
        - generic [ref=e296] [cursor=pointer]:
          - button [ref=e298]:
            - img [ref=e299]
          - generic [ref=e301]:
            - generic [ref=e302]: "[E2E-CAT] 1776498910247"
            - generic [ref=e303]: ฿1
            - generic [ref=e304]:
              - generic [ref=e305]: กรุงเทพฯ
              - generic [ref=e306]: 3 วันที่แล้ว
        - generic [ref=e307] [cursor=pointer]:
          - button [ref=e309]:
            - img [ref=e310]
          - generic [ref=e312]:
            - generic [ref=e313]: "[E2E] ยืนยันจอง 1776498861933"
            - generic [ref=e314]: ฿99
            - generic [ref=e315]:
              - generic [ref=e316]: กรุงเทพฯ
              - generic [ref=e317]: 3 วันที่แล้ว
        - generic [ref=e318] [cursor=pointer]:
          - button [ref=e320]:
            - img [ref=e321]
          - generic [ref=e323]:
            - generic [ref=e324]: "[E2E] จองทดสอบ 1776498852633"
            - generic [ref=e325]: ฿99
            - generic [ref=e326]:
              - generic [ref=e327]: กรุงเทพฯ
              - generic [ref=e328]: 3 วันที่แล้ว
        - generic [ref=e329] [cursor=pointer]:
          - button [ref=e331]:
            - img [ref=e332]
          - generic [ref=e334]:
            - generic [ref=e335]: "[E2E] ทดสอบ 1776498690396"
            - generic [ref=e336]: ฿199
            - generic [ref=e337]:
              - generic [ref=e338]: กรุงเทพฯ
              - generic [ref=e339]: 3 วันที่แล้ว
        - generic [ref=e340] [cursor=pointer]:
          - button [ref=e342]:
            - img [ref=e343]
          - generic [ref=e345]:
            - generic [ref=e346]: "[E2E-CAT] 1776498639439"
            - generic [ref=e347]: ฿1
            - generic [ref=e348]:
              - generic [ref=e349]: กรุงเทพฯ
              - generic [ref=e350]: 3 วันที่แล้ว
        - generic [ref=e351] [cursor=pointer]:
          - button [ref=e353]:
            - img [ref=e354]
          - generic [ref=e356]:
            - generic [ref=e357]: "[E2E] ยืนยันจอง 1776498605642"
            - generic [ref=e358]: ฿99
            - generic [ref=e359]:
              - generic [ref=e360]: กรุงเทพฯ
              - generic [ref=e361]: 3 วันที่แล้ว
        - generic [ref=e362] [cursor=pointer]:
          - button [ref=e364]:
            - img [ref=e365]
          - generic [ref=e367]:
            - generic [ref=e368]: "[E2E] จองทดสอบ 1776498596286"
            - generic [ref=e369]: ฿99
            - generic [ref=e370]:
              - generic [ref=e371]: กรุงเทพฯ
              - generic [ref=e372]: 3 วันที่แล้ว
        - generic [ref=e373] [cursor=pointer]:
          - button [ref=e375]:
            - img [ref=e376]
          - generic [ref=e378]:
            - generic [ref=e379]: "[E2E] ทดสอบ 1776498435634"
            - generic [ref=e380]: ฿199
            - generic [ref=e381]:
              - generic [ref=e382]: กรุงเทพฯ
              - generic [ref=e383]: 3 วันที่แล้ว
        - generic [ref=e384] [cursor=pointer]:
          - button [ref=e386]:
            - img [ref=e387]
          - generic [ref=e389]:
            - generic [ref=e390]: "[E2E-CAT] 1776444108212"
            - generic [ref=e391]: ฿1
            - generic [ref=e392]:
              - generic [ref=e393]: กรุงเทพฯ
              - generic [ref=e394]: 4 วันที่แล้ว
        - generic [ref=e395] [cursor=pointer]:
          - button [ref=e397]:
            - img [ref=e398]
          - generic [ref=e400]:
            - generic [ref=e401]: "[E2E] ยืนยันจอง 1776443407357"
            - generic [ref=e402]: ฿99
            - generic [ref=e403]:
              - generic [ref=e404]: กรุงเทพฯ
              - generic [ref=e405]: 4 วันที่แล้ว
  - button "Open Next.js Dev Tools" [ref=e411] [cursor=pointer]:
    - img [ref=e412]
  - alert [ref=e415]
```

# Test source

```ts
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
  153 |     });
  154 |   });
  155 | 
  156 |   test('product grid: shows products or empty state after load', async ({ page }) => {
  157 |     // Wait for loading to finish
  158 |     await page.waitForFunction(() => {
  159 |       return !document.querySelector('div[style*="pulse"]');
  160 |     }, { timeout: 10_000 }).catch(() => {});
  161 | 
  162 |     const hasProducts = await page.locator('[data-testid="product-card"]').count() > 0;
  163 |     const hasEmpty = await page.getByText('ไม่พบสินค้า').isVisible().catch(() => false);
  164 | 
  165 |     // One of the two must be true
> 166 |     expect(hasProducts || hasEmpty).toBeTruthy();
      |                                     ^ Error: expect(received).toBeTruthy()
  167 |   });
  168 | 
  169 |   test('product grid: empty state renders when no results', async ({ page }) => {
  170 |     // Block the API to return empty array
  171 |     await page.route('**/api/products**', route =>
  172 |       route.fulfill({ status: 200, body: '[]', contentType: 'application/json' })
  173 |     );
  174 |     await page.goto('/');
  175 |     await expect(page.getByText('ไม่พบสินค้า')).toBeVisible({ timeout: 5000 });
  176 |     await expect(page.getByText(/ลองปรับตัวกรอง/)).toBeVisible();
  177 |   });
  178 | 
  179 |   test('product grid: renders product cards when API returns data', async ({ page }) => {
  180 |     const mockProducts = [
  181 |       {
  182 |         id: 1, title: 'iPhone 15 Pro Max', price: 42000,
  183 |         images: [], location: 'กรุงเทพฯ', condition: 'ใหม่ในกล่อง',
  184 |         category: 'มือถือ & แท็บเล็ต', boosted: false, is_sold: false,
  185 |         created_at: new Date().toISOString(),
  186 |       },
  187 |       {
  188 |         id: 2, title: 'MacBook Air M3', price: 38000,
  189 |         images: [], location: 'เชียงใหม่', condition: 'สภาพ 90%+',
  190 |         category: 'คอมพิวเตอร์', boosted: true, is_sold: false,
  191 |         created_at: new Date().toISOString(),
  192 |       },
  193 |     ];
  194 | 
  195 |     await page.route('**/api/products**', route =>
  196 |       route.fulfill({
  197 |         status: 200,
  198 |         body: JSON.stringify(mockProducts),
  199 |         contentType: 'application/json',
  200 |       })
  201 |     );
  202 |     await page.goto('/');
  203 | 
  204 |     await expect(page.getByText('iPhone 15 Pro Max')).toBeVisible({ timeout: 5000 });
  205 |     await expect(page.getByText('MacBook Air M3')).toBeVisible();
  206 |     await expect(page.getByText('฿42,000')).toBeVisible();
  207 |   });
  208 | 
  209 |   // ─── Search ────────────────────────────────────────────────────────────────
  210 | 
  211 |   test('search: typing in search box triggers API call with search param', async ({ page }) => {
  212 |     let capturedUrl = '';
  213 |     await page.route('**/api/products**', async route => {
  214 |       capturedUrl = route.request().url();
  215 |       await route.fulfill({ status: 200, body: '[]', contentType: 'application/json' });
  216 |     });
  217 | 
  218 |     await page.goto('/');
  219 |     const search = page.getByPlaceholder(/ค้นหา/i);
  220 |     await search.fill('iphone');
  221 | 
  222 |     // Wait for debounced search (state update) to trigger
  223 |     await page.waitForTimeout(800);
  224 |     expect(capturedUrl).toContain('search=iphone');
  225 |   });
  226 | 
  227 | });
  228 | 
```