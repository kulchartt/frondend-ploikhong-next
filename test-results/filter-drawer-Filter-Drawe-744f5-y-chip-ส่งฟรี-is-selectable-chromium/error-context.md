# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: filter-drawer.spec.ts >> Filter Drawer (mobile) >> delivery chip "ส่งฟรี" is selectable
- Location: e2e\filter-drawer.spec.ts:138:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'ส่งฟรี' }) resolved to 2 elements:
    1) <button>ส่งฟรี</button> aka getByRole('banner').getByRole('button', { name: 'ส่งฟรี' })
    2) <button>ส่งฟรี</button> aka getByRole('button', { name: 'ส่งฟรี' }).nth(1)

Call log:
  - waiting for getByRole('button', { name: 'ส่งฟรี' })

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
        - button [ref=e18] [cursor=pointer]:
          - img [ref=e20]
        - button [ref=e22] [cursor=pointer]:
          - img [ref=e24]
        - button [ref=e26] [cursor=pointer]:
          - img [ref=e28]
        - button [ref=e33] [cursor=pointer]:
          - img [ref=e35]
        - button "Dark mode" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
        - button [ref=e41] [cursor=pointer]:
          - img [ref=e42]
        - button "+ ลงขาย" [ref=e45] [cursor=pointer]
    - generic [ref=e47]:
      - button "สำหรับคุณ" [ref=e48] [cursor=pointer]
      - button "ใกล้ฉัน" [ref=e49] [cursor=pointer]
      - button "ของใหม่" [ref=e50] [cursor=pointer]
      - button "Boost เด่น" [ref=e51] [cursor=pointer]
      - button "ส่งฟรี" [ref=e52] [cursor=pointer]
      - button "ลดราคา" [ref=e53] [cursor=pointer]
      - button "ของสะสม" [ref=e54] [cursor=pointer]
      - button "ดีลพนักงาน" [ref=e55] [cursor=pointer]
      - button "นัดรับ" [ref=e56] [cursor=pointer]
  - main [ref=e58]:
    - generic [ref=e59]:
      - generic [ref=e60]:
        - generic [ref=e61]: ขายของชิ้นแรกได้ใน 48 ชม. — การันตี
        - generic [ref=e62]: ถ้าประกาศ 3 ชิ้นแรกไม่ได้รับข้อความภายใน 2 วัน เราจะ Boost ฟรีให้ทั้งหมด
      - button "ลงขายฟรี" [ref=e63] [cursor=pointer]
    - generic [ref=e64]:
      - generic [ref=e65]:
        - generic [ref=e66]: "001"
        - generic [ref=e67]: ลงขายฟรีไม่จำกัด
        - generic [ref=e68]: โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียม ลงประกาศ จ่ายเฉพาะเมื่อขายสำเร็จ 3%
      - generic [ref=e69]:
        - generic [ref=e70]: "002"
        - generic [ref=e71]: Boost สินค้า ฿29
        - generic [ref=e72]: ดันโพสต์ขึ้นฟีดบนสุด 48 ชม. เพิ่มยอดคนเห็น 8-12 เท่า
      - generic [ref=e73]:
        - generic [ref=e74]: "003"
        - generic [ref=e75]: รับเงินปลอดภัย
        - generic [ref=e76]: PloiPay ถือเงินไว้จนกว่าผู้ซื้อจะได้รับของ โอนเข้าบัญชีภายใน 1 วันทำการ
      - generic [ref=e77]:
        - generic [ref=e78]: "004"
        - generic [ref=e79]: ค่าส่งคืนได้
        - generic [ref=e80]: เคลมค่าจัดส่งคืนได้สูงสุด ฿60 ถ้าใช้ PloiShip ในการส่ง
    - generic [ref=e81]:
      - generic [ref=e82]:
        - text: พบ
        - strong [ref=e83]: "2"
        - text: รายการ
      - generic [ref=e84]:
        - combobox [ref=e85] [cursor=pointer]:
          - option "ล่าสุด" [selected]
          - option "ราคา ถูก→แพง"
          - option "ราคา แพง→ถูก"
          - option "ยอดนิยม"
        - generic [ref=e86]:
          - button [ref=e87] [cursor=pointer]:
            - img [ref=e88]
          - button [ref=e93] [cursor=pointer]:
            - img [ref=e94]
    - generic [ref=e96]:
      - generic [ref=e97] [cursor=pointer]:
        - button [ref=e99]:
          - img [ref=e100]
        - generic [ref=e102]:
          - generic [ref=e103]: iPhone 14
          - generic [ref=e104]: ฿32,900
      - generic [ref=e105] [cursor=pointer]:
        - button [ref=e107]:
          - img [ref=e108]
        - generic [ref=e110]:
          - generic [ref=e111]: โต๊ะ IKEA
          - generic [ref=e112]: ฿1,500
    - button "ตัวกรอง" [active] [ref=e114] [cursor=pointer]:
      - img [ref=e115]
      - text: ตัวกรอง
  - button "Open Next.js Dev Tools" [ref=e121] [cursor=pointer]:
    - img [ref=e122]
  - alert [ref=e125]
  - generic [ref=e127]:
    - generic [ref=e130]:
      - generic [ref=e131]: ตัวกรอง
      - button "ล้างทั้งหมด" [ref=e132] [cursor=pointer]
    - generic [ref=e133]:
      - generic [ref=e134]: หมวดหมู่
      - generic [ref=e135]:
        - button "ทั้งหมด" [ref=e136] [cursor=pointer]
        - button "มือถือ & แท็บเล็ต" [ref=e137] [cursor=pointer]
        - button "คอมพิวเตอร์" [ref=e138] [cursor=pointer]
        - button "เครื่องใช้ไฟฟ้า" [ref=e139] [cursor=pointer]
        - button "เฟอร์นิเจอร์" [ref=e140] [cursor=pointer]
        - button "แฟชั่น" [ref=e141] [cursor=pointer]
        - button "กล้อง & อุปกรณ์" [ref=e142] [cursor=pointer]
        - button "กีฬา & จักรยาน" [ref=e143] [cursor=pointer]
        - button "ของสะสม & เกม" [ref=e144] [cursor=pointer]
        - button "หนังสือ" [ref=e145] [cursor=pointer]
        - button "สัตว์เลี้ยง" [ref=e146] [cursor=pointer]
        - button "อื่นๆ" [ref=e147] [cursor=pointer]
      - generic [ref=e148]: ช่วงราคา
      - generic [ref=e149]:
        - spinbutton [ref=e150]
        - generic [ref=e151]: –
        - spinbutton [ref=e152]
      - generic [ref=e153]: สภาพสินค้า
      - generic [ref=e154]:
        - button "ใหม่ในกล่อง" [ref=e155] [cursor=pointer]
        - button "สภาพ 90%+" [ref=e156] [cursor=pointer]
        - button "มือสองทั่วไป" [ref=e157] [cursor=pointer]
        - button "ซ่อมได้" [ref=e158] [cursor=pointer]
      - generic [ref=e159]: วิธีรับสินค้า
      - generic [ref=e160]:
        - button "นัดรับ" [ref=e161] [cursor=pointer]
        - button "ส่ง PloiShip" [ref=e162] [cursor=pointer]
        - button "ส่งฟรี" [ref=e163] [cursor=pointer]
    - button "ดูผลลัพธ์ (2)" [ref=e165] [cursor=pointer]
```

# Test source

```ts
  41  |     await expect(page.getByRole('button', { name: 'มือถือ & แท็บเล็ต' })).toBeVisible();
  42  |     await expect(page.getByRole('button', { name: 'เฟอร์นิเจอร์' })).toBeVisible();
  43  |   });
  44  | 
  45  |   // ─── Closing ───────────────────────────────────────────────────────────────
  46  | 
  47  |   test('pressing ESC closes the drawer', async ({ page }) => {
  48  |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  49  |     await expect(page.getByText('ล้างทั้งหมด')).toBeVisible();
  50  |     await page.keyboard.press('Escape');
  51  |     await expect(page.getByText('ล้างทั้งหมด')).not.toBeVisible();
  52  |   });
  53  | 
  54  |   test('clicking backdrop closes the drawer', async ({ page }) => {
  55  |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  56  |     await expect(page.getByText('ล้างทั้งหมด')).toBeVisible();
  57  |     await page.mouse.click(5, 5);
  58  |     await expect(page.getByText('ล้างทั้งหมด')).not.toBeVisible();
  59  |   });
  60  | 
  61  |   test('"ดูผลลัพธ์" button closes the drawer', async ({ page }) => {
  62  |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  63  |     await page.getByRole('button', { name: /ดูผลลัพธ์/ }).click();
  64  |     await expect(page.getByText('ล้างทั้งหมด')).not.toBeVisible();
  65  |   });
  66  | 
  67  |   // ─── Category filter ───────────────────────────────────────────────────────
  68  | 
  69  |   test('selecting a category chip highlights it', async ({ page }) => {
  70  |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  71  |     const chip = page.getByRole('button', { name: 'มือถือ & แท็บเล็ต' });
  72  |     await chip.click();
  73  |     // Selected chip has dark background (var(--ink))
  74  |     await expect(chip).toHaveCSS('font-weight', '600');
  75  |   });
  76  | 
  77  |   test('applying category filter passes it to product API', async ({ page }) => {
  78  |     const calls: string[] = [];
  79  |     await page.route('**/api/products*', r => {
  80  |       calls.push(r.request().url());
  81  |       r.fulfill({ json: [] });
  82  |     });
  83  | 
  84  |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  85  |     await page.getByRole('button', { name: 'คอมพิวเตอร์' }).click();
  86  |     await page.getByRole('button', { name: /ดูผลลัพธ์/ }).click();
  87  |     await page.waitForTimeout(300);
  88  | 
  89  |     const filtered = calls.filter(u => u.includes('category='));
  90  |     expect(filtered.length).toBeGreaterThanOrEqual(1);
  91  |     const lastUrl = decodeURIComponent(filtered[filtered.length - 1]);
  92  |     expect(lastUrl).toContain('คอมพิวเตอร์');
  93  |   });
  94  | 
  95  |   // ─── Price filter ──────────────────────────────────────────────────────────
  96  | 
  97  |   test('price inputs accept numbers', async ({ page }) => {
  98  |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  99  |     const minInput = page.getByPlaceholder('ต่ำสุด');
  100 |     const maxInput = page.getByPlaceholder('สูงสุด');
  101 |     await minInput.fill('1000');
  102 |     await maxInput.fill('50000');
  103 |     await expect(minInput).toHaveValue('1000');
  104 |     await expect(maxInput).toHaveValue('50000');
  105 |   });
  106 | 
  107 |   test('applying price filter passes min/max to API', async ({ page }) => {
  108 |     const urls: string[] = [];
  109 |     await page.route('**/api/products*', r => {
  110 |       urls.push(r.request().url());
  111 |       r.fulfill({ json: [] });
  112 |     });
  113 | 
  114 |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  115 |     await page.getByPlaceholder('ต่ำสุด').fill('5000');
  116 |     await page.getByPlaceholder('สูงสุด').fill('40000');
  117 |     await page.getByRole('button', { name: /ดูผลลัพธ์/ }).click();
  118 |     await page.waitForTimeout(300);
  119 | 
  120 |     const priceFiltered = urls.filter(u => u.includes('min_price='));
  121 |     expect(priceFiltered.length).toBeGreaterThanOrEqual(1);
  122 |     expect(priceFiltered[priceFiltered.length - 1]).toContain('min_price=5000');
  123 |     expect(priceFiltered[priceFiltered.length - 1]).toContain('max_price=40000');
  124 |   });
  125 | 
  126 |   // ─── Condition & delivery chips ────────────────────────────────────────────
  127 | 
  128 |   test('condition chip toggles on/off', async ({ page }) => {
  129 |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  130 |     const chip = page.getByRole('button', { name: 'ใหม่ในกล่อง' });
  131 |     await chip.click();
  132 |     await expect(chip).toHaveCSS('font-weight', '600'); // selected? no weight set, check border instead
  133 |     await chip.click(); // deselect
  134 |     // After double-click should not have selected style
  135 |     await expect(chip).not.toHaveCSS('border-color', 'rgb(17, 17, 16)');
  136 |   });
  137 | 
  138 |   test('delivery chip "ส่งฟรี" is selectable', async ({ page }) => {
  139 |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  140 |     const chip = page.getByRole('button', { name: 'ส่งฟรี' });
> 141 |     await chip.click();
      |                ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'ส่งฟรี' }) resolved to 2 elements:
  142 |     await expect(chip).toBeVisible();
  143 |   });
  144 | 
  145 |   // ─── Reset ─────────────────────────────────────────────────────────────────
  146 | 
  147 |   test('"ล้างทั้งหมด" resets category to ทั้งหมด', async ({ page }) => {
  148 |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  149 |     await page.getByRole('button', { name: 'คอมพิวเตอร์' }).click();
  150 |     await page.getByRole('button', { name: 'ล้างทั้งหมด' }).click();
  151 |     // ทั้งหมด chip should now be selected (dark)
  152 |     const allChip = page.getByRole('button', { name: 'ทั้งหมด' }).first();
  153 |     await expect(allChip).toBeVisible();
  154 |   });
  155 | 
  156 |   test('"ล้างทั้งหมด" clears price inputs', async ({ page }) => {
  157 |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  158 |     await page.getByPlaceholder('ต่ำสุด').fill('999');
  159 |     await page.getByRole('button', { name: 'ล้างทั้งหมด' }).click();
  160 |     await expect(page.getByPlaceholder('ต่ำสุด')).toHaveValue('');
  161 |   });
  162 | 
  163 |   // ─── Result count ──────────────────────────────────────────────────────────
  164 | 
  165 |   test('"ดูผลลัพธ์" button shows current product count', async ({ page }) => {
  166 |     await page.getByRole('button', { name: /ตัวกรอง/ }).click();
  167 |     // 2 products loaded → button should show (2)
  168 |     await expect(page.getByRole('button', { name: /ดูผลลัพธ์.*2/ })).toBeVisible();
  169 |   });
  170 | 
  171 |   // ─── Desktop: drawer not shown ─────────────────────────────────────────────
  172 | 
  173 |   test('floating filter button is hidden on desktop viewport', async ({ page }) => {
  174 |     await page.setViewportSize({ width: 1280, height: 800 });
  175 |     await page.goto('/');
  176 |     // The floating button is only rendered when isMobile=true (≤768px)
  177 |     const filterBtn = page.getByRole('button', { name: /^ตัวกรอง$/ });
  178 |     await expect(filterBtn).not.toBeVisible();
  179 |   });
  180 | 
  181 |   test('desktop shows sidebar instead of filter button', async ({ page }) => {
  182 |     await page.setViewportSize({ width: 1280, height: 800 });
  183 |     await page.goto('/');
  184 |     // Sidebar is visible on desktop
  185 |     await expect(page.getByText('หมวดหมู่').first()).toBeVisible();
  186 |   });
  187 | 
  188 | });
  189 | 
```