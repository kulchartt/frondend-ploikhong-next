# Screen: เหรียญ & Premium (/coins)

## Entry points

| จากที่ไหน | วิธี | เปิด tab ไหน |
|---|---|---|
| Navbar dropdown → "เติมเหรียญ & Premium" | `window.location.href = '/coins'` | เติมเหรียญ (default) |
| SellPremium balance chip → "+ เติม" | `window.location.href = '/coins?tab=boosts'` | Boost ที่ใช้งาน |
| Boost empty state CTA | `setTab('topup')` | เติมเหรียญ |

## Layout

```
[← ปิด]  เหรียญ & Premium              [◎ 1,240 เหรียญ]
─────────────────────────────────────────────────────────
[ เติมเหรียญ ] [ Boost ที่ใช้งาน ] [ Premium ] [ ประวัติการใช้ ]
─────────────────────────────────────────────────────────
<tab content>
```

## แต่ละ tab

### เติมเหรียญ
- Hero: "ใช้เหรียญเพื่อ Boost ประกาศ..."
- Grid ของ coin packs (2–3 col)
- แต่ละ pack: จำนวนเหรียญ, bonus, ราคา, ราคาต่อเหรียญ, ปุ่ม "ซื้อแพ็คนี้"
- Popular pack มี badge "ยอดนิยม"
- Checkout modal: PromptPay QR / บัตรเครดิต

### Boost ที่ใช้งาน
- แต่ละ item: thumbnail · ชื่อสินค้า · badge (Boost/Featured)
  - เวลาเหลือ (ชม. ถ้า < 48h / วัน ถ้านานกว่า)
  - views ใช้ไป / ทั้งหมด
  - progress bar (สี purple=Boost, amber=Featured)
  - stats: ผู้เข้าชม | ข้อความใหม่ | +% เทียบก่อน Boost
  - ปุ่ม "ดูประกาศ" + "ต่ออายุ"
- Empty state: icon 🚀 + CTA "+ เริ่ม Boost ประกาศใหม่"
- CTA button ล่าง (dashed border) ทุกกรณี

### Premium
- Hero card (gradient dark) + feature list
- Toggle รายเดือน / รายปี
- Perks grid: 6 รายการ
- FAQ accordion

### ประวัติการใช้
- Summary row: เหรียญที่ได้รับ | ใช้ไป | คงเหลือ
- Filter dropdown: ทั้งหมด / รับเข้า / ใช้ไป
- รายการ: icon วงกลม · description · วันที่ · จำนวน (สีเขียว/ส้ม)

## Assets ที่ต้องการ

- [ ] screenshot desktop (1440px)
- [ ] screenshot mobile (390px)
- [ ] annotated version (เลข callout)
