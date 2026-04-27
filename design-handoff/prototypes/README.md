# Prototypes

วาง HTML prototype files ที่นี่

## ที่มีอยู่แล้ว (ใน project root / frontend-next/)

| ไฟล์ | เวอร์ชัน | หมายเหตุ |
|---|---|---|
| `../../ploikhong.html` | latest | prototype หลัก (claude.ai design) |
| `../../theme-preview.html` | — | preview สี + font |
| `../../ui-feedback-mockup.html` | — | mockup feedback UI |
| `../ploi/v11_coins.jsx` | v11 | coins page prototype (JSX) |
| `../ploi/v11_admin.jsx` | v11 | admin panel prototype |
| `../ploi/v8_hub.jsx` | v8 | seller hub prototype |
| `../ploi/v9_chat.jsx` | v9 | chat prototype |

## วิธีดู prototype

1. เปิดไฟล์ `.html` ใน browser ได้เลย
2. ไฟล์ `.jsx` ดูเป็น reference code (ไม่ run ตรงๆ)
3. ถ้าต้องการดู latest UI → ดูจาก live deploy หรือ `npx next dev`

## Convention สำหรับ prototype ใหม่

```
prototypes/
├── v12-[feature-name].html    ← standalone HTML prototype
└── v12-[feature-name]-mobile.html
```
