# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search-debounce.spec.ts >> Search Debounce >> search result count updates after debounce
- Location: e2e\search-debounce.spec.ts:90:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('1 รายการ').or(getByText('1').first())
Expected: visible
Error: strict mode violation: getByText('1 รายการ').or(getByText('1').first()) resolved to 2 elements:
    1) <span>1,890</span> aka getByRole('button', { name: 'คอมพิวเตอร์' })
    2) <div>…</div> aka getByText('พบ 1 รายการ')

Call log:
  - Expect "toBeVisible" with timeout 2000ms
  - waiting for getByText('1 รายการ').or(getByText('1').first())

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
        - textbox "ค้นหาของมือสอง..." [active] [ref=e12]: iphone
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
          - strong [ref=e162]: "1"
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
      - generic [ref=e176] [cursor=pointer]:
        - button [ref=e178]:
          - img [ref=e179]
        - generic [ref=e181]:
          - generic [ref=e182]: iPhone 14
          - generic [ref=e183]: ฿30,000
  - button "Open Next.js Dev Tools" [ref=e189] [cursor=pointer]:
    - img [ref=e190]
  - alert [ref=e193]
```

# Test source

```ts
  11  |     await page.route('**/api/products*', r => {
  12  |       calls.push(r.request().url());
  13  |       r.fulfill({ json: [] });
  14  |     });
  15  | 
  16  |     await page.goto('/');
  17  |     const search = page.getByPlaceholder(/ค้นหา/i);
  18  |     await search.pressSequentially('iphone', { delay: 50 }); // type fast
  19  |     // Wait for debounce (400ms) + a little buffer
  20  |     await page.waitForTimeout(600);
  21  | 
  22  |     // "iphone" = 6 chars typed fast, but should result in ~2 calls:
  23  |     // 1 initial load (no search) + 1 debounced call with "iphone"
  24  |     // Definitely NOT 7 calls (one per char)
  25  |     const searchCalls = calls.filter(u => u.includes('search='));
  26  |     expect(searchCalls.length).toBeLessThanOrEqual(2);
  27  |   });
  28  | 
  29  |   test('debounced search call includes the full search term', async ({ page }) => {
  30  |     const urls: string[] = [];
  31  |     await page.route('**/api/products*', r => {
  32  |       urls.push(r.request().url());
  33  |       r.fulfill({ json: [] });
  34  |     });
  35  | 
  36  |     await page.goto('/');
  37  |     const search = page.getByPlaceholder(/ค้นหา/i);
  38  |     await search.fill('macbook pro');
  39  |     await page.waitForTimeout(600); // wait for debounce
  40  | 
  41  |     const withSearch = urls.filter(u => u.includes('search=macbook'));
  42  |     expect(withSearch.length).toBeGreaterThanOrEqual(1);
  43  |     expect(withSearch[withSearch.length - 1]).toContain('macbook');
  44  |   });
  45  | 
  46  |   test('clearing search field triggers a call with no search param', async ({ page }) => {
  47  |     const urls: string[] = [];
  48  |     await page.route('**/api/products*', r => {
  49  |       urls.push(r.request().url());
  50  |       r.fulfill({ json: [] });
  51  |     });
  52  | 
  53  |     await page.goto('/');
  54  |     const search = page.getByPlaceholder(/ค้นหา/i);
  55  |     await search.fill('iphone');
  56  |     await page.waitForTimeout(600);
  57  |     await search.fill('');
  58  |     await page.waitForTimeout(600);
  59  | 
  60  |     const last = urls[urls.length - 1];
  61  |     expect(last).not.toContain('search=');
  62  |   });
  63  | 
  64  |   test('rapid successive searches result in final term being sent', async ({ page }) => {
  65  |     const searchTerms: string[] = [];
  66  |     await page.route('**/api/products*', r => {
  67  |       const url = new URL(r.request().url());
  68  |       const s = url.searchParams.get('search');
  69  |       if (s) searchTerms.push(s);
  70  |       r.fulfill({ json: [] });
  71  |     });
  72  | 
  73  |     await page.goto('/');
  74  |     const search = page.getByPlaceholder(/ค้นหา/i);
  75  | 
  76  |     // Type multiple searches quickly (each replaces the previous)
  77  |     await search.fill('a');
  78  |     await search.fill('ap');
  79  |     await search.fill('app');
  80  |     await search.fill('appl');
  81  |     await search.fill('apple');
  82  |     await page.waitForTimeout(600);
  83  | 
  84  |     // Only the final "apple" (or near-final) should be sent
  85  |     if (searchTerms.length > 0) {
  86  |       expect(searchTerms[searchTerms.length - 1]).toBe('apple');
  87  |     }
  88  |   });
  89  | 
  90  |   test('search result count updates after debounce', async ({ page }) => {
  91  |     await page.route('**/api/products*', r => {
  92  |       const url = new URL(r.request().url());
  93  |       const s = url.searchParams.get('search');
  94  |       if (s === 'iphone') {
  95  |         r.fulfill({ json: [{ id: 1, title: 'iPhone 14', price: 30000, images: [] }] });
  96  |       } else {
  97  |         r.fulfill({ json: [
  98  |           { id: 1, title: 'iPhone 14', price: 30000, images: [] },
  99  |           { id: 2, title: 'MacBook', price: 40000, images: [] },
  100 |         ]});
  101 |       }
  102 |     });
  103 | 
  104 |     await page.goto('/');
  105 |     await expect(page.getByText('2 รายการ').or(page.getByText('2').first())).toBeVisible({ timeout: 3000 });
  106 | 
  107 |     const search = page.getByPlaceholder(/ค้นหา/i);
  108 |     await search.fill('iphone');
  109 |     await page.waitForTimeout(600);
  110 |     // Result count should reflect filtered results
> 111 |     await expect(page.getByText('1 รายการ').or(page.getByText('1').first())).toBeVisible({ timeout: 2000 });
      |                                                                              ^ Error: expect(locator).toBeVisible() failed
  112 |   });
  113 | 
  114 | });
  115 | 
```