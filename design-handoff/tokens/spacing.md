# Spacing & Radius — PloiKhong

## CSS radius tokens

```css
--radius:    10px   /* card, modal, dropdown */
--radius-sm: 7px    /* button, input, tag */
```

## Spacing guide (ไม่มี token, ใช้ค่านี้เป็นมาตรฐาน)

| ใช้ทำอะไร | ค่า |
|---|---|
| Page padding (desktop) | `20px` |
| Page padding (mobile) | `14–16px` |
| Section gap | `24px` |
| Card padding | `16–20px` |
| Item gap ใน list | `8–12px` |
| Inline gap (icon + text) | `6–10px` |
| Button padding | `8–10px 16–24px` |
| Input padding | `8–10px 12–14px` |

## Breakpoints

| ชื่อ | ค่า | พฤติกรรม |
|---|---|---|
| Mobile | `< 768px` | sidebar กลายเป็น horizontal tab bar |
| Desktop | `≥ 768px` | sidebar แนวตั้ง 280px |
| Max width | `1440px` | content ไม่ขยายเกินนี้ |

## Z-index layers

| Layer | ค่า | ใช้กับ |
|---|---|---|
| Navbar | `100` | sticky header |
| MyHub overlay | `190` | full-screen hub |
| Modal / dropdown | `200` | checkout, product picker |
| Toast | `9999` | notification (ถ้ามี) |
