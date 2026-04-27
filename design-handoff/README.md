# PloiKhong — Design Handoff

ไฟล์ใน folder นี้คือ source of truth สำหรับ design ทั้งหมดของ PloiKhong
ใช้เป็นอ้างอิงเมื่อ implement UI หรือ review งาน

---

## โครงสร้าง

```
design-handoff/
├── tokens/               ← สี, typography, spacing, CSS variables
├── screens/              ← mockup แต่ละหน้า (desktop + mobile)
│   ├── 01-home/
│   ├── 02-product-detail/
│   ├── 03-seller-hub/
│   ├── 04-coins/
│   ├── 05-auth/
│   └── 06-chat/
├── components/           ← spec ของ component แต่ละตัว
├── assets/               ← logo, icons, illustrations
│   ├── icons/
│   └── logo/
├── flows/                ← user flow diagrams / อธิบาย flow
└── prototypes/           ← HTML prototype ไฟล์ (.html)
```

---

## วิธีใช้

| ต้องการอะไร | ไปที่ |
|---|---|
| รู้ว่า component ควรหน้าตาเป็นยังไง | `screens/` + `components/` |
| เช็คสี / font / spacing | `tokens/` |
| เข้าใจ user journey | `flows/` |
| ดู prototype แบบ interactive | `prototypes/` |
| หา logo / icon ไปใช้ | `assets/` |

---

## Naming convention

- **Screens**: `[ชื่อ]-desktop.png` / `[ชื่อ]-mobile.png`
- **Annotated**: `[ชื่อ]-annotated.png` (มี callout/เลข)
- **Spec doc**: `spec.md` ในแต่ละ screen folder
- **Flow**: `[ชื่อ-flow].md` ใน `flows/`

---

## สถานะ design

| หน้า | สถานะ | หมายเหตุ |
|---|---|---|
| Home | ✅ Done | — |
| Product Detail | ✅ Done | — |
| Seller Hub | ✅ Done | ไม่มี Premium tab แล้ว |
| เหรียญ & Premium | ✅ Done | อยู่ใน /coins |
| Auth (Login/Register) | ✅ Done | — |
| Chat | 🚧 In progress | — |
