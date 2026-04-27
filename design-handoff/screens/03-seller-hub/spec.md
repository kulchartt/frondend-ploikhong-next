# Screen: Seller Hub (MyHub — ฝั่งขาย)

## Entry point
- Navbar → ปุ่ม "ขาย" หรือ dropdown → "สินค้าของฉัน"
- Overlay แบบ full-screen (`position: fixed, inset: 0, z-index: 190`)

## Layout (Desktop)

```
[sidebar 280px] | [main content flex-1]
```

### Sidebar
- Header: ปุ่มปิด + "ศูนย์ซื้อขาย"
- Mode toggle: ฝั่งขาย 🟠 | ฝั่งซื้อ 🔵
- Nav items (ฝั่งขาย):
  - สินค้าของฉัน
  - คำขอราคา (badge จำนวน pending)
  - สถิติ
  - ตั้งค่าร้านค้า
- ปุ่ม "สร้างรายการสินค้าใหม่" ที่ด้านล่าง

> ⚠️ ไม่มี "Premium" ใน nav อีกต่อไป — ย้ายไปอยู่ใน /coins แล้ว

### Nav items (ฝั่งซื้อ)
- สินค้าที่บันทึก
- ข้อเสนอของฉัน
- การแจ้งเตือน
- ร้านที่ติดตาม

## Layout (Mobile)
- Topbar: ปุ่มกลับ + "ศูนย์ซื้อขาย" + mode toggle pill
- Horizontal tab bar (scroll)
- Content ใต้ tab bar

## Assets ที่ต้องการ
- [ ] desktop — listings tab
- [ ] desktop — offers tab (มี badge)
- [ ] mobile — all tabs
