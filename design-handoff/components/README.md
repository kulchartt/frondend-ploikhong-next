# Components

วาง spec ของ component แต่ละตัวที่นี่

## Priority components (ยังไม่มี spec)

| Component | File | สถานะ |
|---|---|---|
| ProductCard | `src/components/ProductCard.tsx` | ⏳ ต้องทำ |
| Navbar + Dropdown | `src/components/Navbar.tsx` | ⏳ ต้องทำ |
| CheckoutModal | `src/app/coins/page.tsx` | ⏳ ต้องทำ |
| ActiveBoostCard | `src/app/coins/page.tsx` | ⏳ ต้องทำ |
| CoinPackCard | `src/app/coins/page.tsx` | ⏳ ต้องทำ |
| AuthModal | `src/components/AuthModal.tsx` | ⏳ ต้องทำ |
| ChatDrawer | `src/components/ChatDrawer.tsx` | ⏳ ต้องทำ |

## Format ที่แนะนำสำหรับแต่ละ spec

```md
# Component: [ชื่อ]

## Variants
- default
- hover / active / disabled

## Props / States
| Prop | Type | Default | หมายเหตุ |

## Anatomy
(รูปหรือ ASCII diagram)

## Do / Don't
```

## วิธีเพิ่ม spec

1. สร้างไฟล์ `[component-name].md` ใน folder นี้
2. วาง screenshot annotated ด้วย (ถ้ามี)
