# User Flow: Boost ประกาศ

## Happy path

```
Navbar dropdown
  → "เติมเหรียญ & Premium"  (badge แสดงยอดเหรียญปัจจุบัน)
    → /coins เปิด tab "เติมเหรียญ"
      → เลือก coin pack
        → Checkout modal
          → เลือก PromptPay หรือ บัตรเครดิต
            → ชำระเงิน → เหรียญเข้าบัญชีทันที
              → กลับมาที่ /coins (balance อัปเดต)
```

## จาก Seller Hub (ถ้าเหรียญไม่พอ)

```
Seller Hub → สินค้าของฉัน → [product card] → ปุ่ม Boost
  → เหรียญไม่พอ → "เติมเหรียญก่อน"
    → /coins?tab=boosts
      → ปุ่ม "+ เติมเหรียญ" → switch ไป tab "เติมเหรียญ"
```

## ดู Boost ที่ใช้งานอยู่

```
Navbar dropdown → "เติมเหรียญ & Premium"
  → /coins → tab "Boost ที่ใช้งาน"
    → เห็น list พร้อม stats (views, messages, % increase)
    → ปุ่ม "ดูประกาศ" → ไปหน้า product detail
    → ปุ่ม "ต่ออายุ" → checkout modal (ต่ออายุ)
    → ปุ่ม "+ เริ่ม Boost ประกาศใหม่" → switch tab "เติมเหรียญ"
```

## States

| State | แสดงอะไร |
|---|---|
| ไม่มี Boost | Empty state + 🚀 + CTA |
| มี Boost | List cards + CTA ล่าง |
| เหรียญพอ | ปุ่ม Boost สีทอง |
| เหรียญไม่พอ | ปุ่มสีเทา + "เติมเหรียญก่อน" |
