# PloiKhong — Design Spec (อัปเดต: เมษายน 2026)

เอกสารนี้สรุป design decisions ปัจจุบันของโปรเจค ใช้เป็น context เริ่มต้นสำหรับ Claude session ใหม่

---

## 1. ภาพรวมโปรเจค

**PloiKhong** — ตลาดซื้อขายของมือสองภาษาไทย (Thai second-hand marketplace)  
Tech: **Next.js 14 App Router**, React 18, TypeScript, NextAuth.js  
Styling: **inline styles ทั้งหมด** (ไม่ใช้ Tailwind / CSS modules สำหรับ component styling)  
Deploy: Vercel (auto-deploy จาก GitHub `master`)

---

## 2. Design Tokens (`globals.css`)

```
Light mode (default)
--accent:       #ff2d1f        ← สี brand หลัก (แดง)
--accent-hover: #e02218
--bg:           #f8f9fb        ← background page
--surface:      #ffffff        ← card / panel
--surface-2:    #f0f2f5        ← hover / input bg
--line:         #e2e6ec        ← border
--line-2:       #d0d5de
--ink:          #111110        ← text หลัก
--ink-2:        #55534c        ← text รอง
--ink-3:        #8a877e        ← text tertiary
--pos:          #0a7a45        ← สีเขียว (สำเร็จ / ราคา)
--warn:         #a85a00        ← สีส้ม (คำเตือน)
--neg:          #b83216        ← สีแดง (error / ลบ)

Dark mode ([data-theme="dark"])
--bg:           #0e0e0d
--surface:      #171715
--surface-2:    #1f1f1c
--line:         #2a2a27
--ink:          #f3f2ec
--ink-2:        #b7b5ad
--ink-3:        #7e7c74
--pos:          #4ec38a
--warn:         #d79a3a
--neg:          #e56a4e
```

```
Typography
--font-th:      'IBM Plex Sans Thai', system-ui, sans-serif  ← default body
--font-display: 'Inter Tight', system-ui, sans-serif         ← headings / ราคา
--font-mono:    'IBM Plex Mono', monospace                   ← badge / code

Radius
--radius:    10px    ← card, panel, popover
--radius-sm: 6px     ← button, input, badge
```

---

## 3. Layout โดยรวม

```
┌─────────────────────────────────────────┐
│  Navbar (sticky top, zIndex: 100)        │
│  - Row 1: logo | search bar | icon btns  │
│  - Row 2: sub-nav category pills         │
├─────────────────────────────────────────┤
│  Page body (SPA — route เดียว "/")       │
│  - Sidebar (left, desktop only)          │
│  - Product grid (main content)           │
│  - Promo rail (below grid)               │
└─────────────────────────────────────────┘

Overlays (fixed, full-screen หรือ drawer):
  AuthModal      zIndex 200
  MyHub (V8Hub)  zIndex 190   ← full-screen panel
  ListingFlow    zIndex 200   ← full-screen panel
  ProductDetail  zIndex 150   ← modal
  ChatDrawer     zIndex 160   ← right drawer
  WishlistDrawer zIndex 150   ← right drawer
  FilterDrawer   zIndex 140   ← bottom sheet (mobile)
  ShopDrawer     zIndex 150   ← right drawer
```

ไม่มี page routing จริง — ทุกอย่างเป็น overlay/panel บน `/`  
**ไม่มี `/products/[id]` route** — product detail เปิดเป็น modal

---

## 4. Navbar

### Layout ปัจจุบัน (Row 1)
```
[PloiWordmark]  [Search bar ──────────────]  [icon group]  [+ ลงขาย]
```

### Icon group (ขวา) — ลำดับซ้ายไปขวา:
```
แชท → ถูกใจ → ซื้อ → ขาย → บัญชี/เข้าสู่ระบบ || [+ ลงขาย]
```

> Dark toggle **ซ่อนทั้งหมดเมื่อไม่ได้ login** — เห็นได้เฉพาะใน account dropdown หลัง login

### Icon button style (`iconBtn()`)
```
flexDirection: 'row'        ← icon ซ้าย, label ขวา (ไม่ใช่ column)
gap: 3
padding: 6px 10px (desktop) / 6px 8px (mobile)
minWidth: 44 (desktop) / 34 (mobile)
borderRadius: var(--radius-sm)
```

### Label style
```
fontSize: 13
fontWeight: 500
color: var(--ink-2)
```

### Container gap
```
gap: 4   ← ระหว่างแต่ละ icon button
```

### "เข้าสู่ระบบ" (ไม่ได้ login)
```
color: var(--accent)
fontWeight: 600
```

### Account dropdown (logged-in)
เปิดด้วยปุ่ม "บัญชี" (avatar + label) — `data-testid="nav-user-btn"`

ลำดับ item ใน dropdown:
1. User info header (avatar + name + email)
2. สินค้าของฉัน → เปิด MyHub sell
3. การซื้อของฉัน → เปิด MyHub buy
4. รายการถูกใจ → เปิด MyHub buy > saved tab
5. ── divider ──
6. **โหมดมืด / โหมดสว่าง** ← dark toggle (pill switch, ไม่ปิด dropdown)
7. ── divider ──
8. เปลี่ยนรหัสผ่าน
9. ── divider ──
10. ออกจากระบบ (สีแดง)

Dark toggle row:
```
icon + label (โหมดมืด/โหมดสว่าง)    |  [pill switch]
e.stopPropagation() → ไม่ปิด dropdown
pill: width 34, height 20, background: var(--ink) เมื่อ dark
```

### "+ ลงขาย" button
```
marginLeft: 4
padding: 8px 16px
background: var(--accent)
color: #fff (--accent-ink)
borderRadius: var(--radius-sm)
fontSize: 13, fontWeight: 700
```

### Mobile
- ซ่อน label text ทุกปุ่ม (icon อย่างเดียว)
- "+ ลงขาย" ยังแสดง text

### Row 2 (Sub-nav pills)
```
['สำหรับคุณ', 'ใกล้ฉัน', 'ของใหม่', 'Boost เด่น', 'ส่งฟรี', 'ลดราคา', 'ของสะสม', 'ดีลพนักงาน', 'นัดรับ']
scroll horizontal บน mobile
```

---

## 5. MyHub (V8Hub) — Full-screen Panel

`data-testid="v8hub"` — fixed, inset 0, zIndex 190

### สองโหมด
| โหมด | Tab เริ่มต้น | เปิดจาก |
|---|---|---|
| **sell** | listings | ปุ่มขาย / ลงขาย |
| **buy** | activity | ปุ่มซื้อ / ถูกใจ |

### Sidebar navigation
**Sell mode:**
- รายการสินค้าของคุณ (`listings`) ← default
- ข้อมูลเชิงลึก (`insights`)
- ข่าวประกาศ (`news`)
- โปรไฟล์ Marketplace (`profile`)

**Buy mode:**
- กิจกรรมล่าสุด (`activity`) ← default
- บันทึกแล้ว (`saved`)
- การแจ้งเตือน (`notifications`)
- กำลังติดตาม (`following`)
- โปรไฟล์ Marketplace (`profile`)

### SellListings — card layout
```
┌──────────────────────────────────────────┐
│ [Image 180×180] │ Title                  │
│                 │ ราคา ฿XX,XXX           │
│                 │ ● สถานะ · วันที่       │
│                 │ สถิติ (groups · clicks) │
│                 │ [action buttons]        │
└──────────────────────────────────────────┘
```

- card: `border-radius: var(--radius)`, no `overflow: hidden` (ให้ popover โผล่ออกได้)
- image div: `borderRadius: 'var(--radius) 0 0 var(--radius)'` (radius เฉพาะด้านซ้าย)

### Share popover
- เปิดด้วยปุ่ม "แชร์" (share icon)
- `position: absolute, top: calc(100% + 6px), left: 0, zIndex: 300`
- ปิดด้วย mousedown outside (useRef + document listener)
- **Share URL**: `window.location.origin` (ไม่มี product detail page จริง)

**Options ใน popover (บนลงล่าง):**
1. LINE → `social-plugins.line.me/lineit/share`
2. Facebook → `facebook.com/sharer/sharer.php`
3. X (Twitter) → `twitter.com/intent/tweet`
4. WhatsApp → `wa.me`
5. — divider —
6. คัดลอก URL → clipboard, แสดง "คัดลอกแล้ว!" 2 วิ

### Status colors
| สถานะ | label | color |
|---|---|---|
| active | กำลังขาย | `var(--pos)` |
| sold / sold-out | ขายแล้ว | `var(--ink-3)` |
| draft | ฉบับร่าง | `#c9a24a` |
| inactive | ปิดประกาศ | `var(--warn)` |
| hidden | ซ่อนอยู่ | `var(--ink-3)` |

---

## 6. ProductCard

```
┌─────────────────────┐
│  Image / gradient   │  ← aspect-ratio รูปภาพ
│  [BOOST] badge      │
│  ♥ wishlist button  │  ← position: absolute top-right
│─────────────────────│
│  Title              │
│  ฿ราคา  ~~ราคาเดิม~~│
│  📍location · เวลา  │
└─────────────────────┘
```

- Image fallback: gradient สี pastel (12 สี rotate ตาม `id % 12`)
- BOOST badge: dark pill `#111` background, font-mono, `BOOST`
- Wishlist heart: toggle สี accent เมื่อถูกใจ
- Card click → เปิด ProductDetail modal

---

## 7. ListingFlow — Multi-step

4 ขั้นตอน:
1. **รูปภาพ** — อัปโหลดรูป (max 8 รูป), drag-to-reorder
2. **รายละเอียด** — ชื่อ, หมวดหมู่, สภาพ, คำอธิบาย
3. **ราคา & ส่ง** — ราคา, ราคาเดิม (optional), วิธีส่ง
4. **ตรวจ & โพสต์** — preview + submit

Categories: `['มือถือ & แท็บเล็ต', 'คอมพิวเตอร์', 'เครื่องใช้ไฟฟ้า', 'เฟอร์นิเจอร์', 'แฟชั่น', 'กล้อง & อุปกรณ์', 'กีฬา & จักรยาน', 'ของสะสม & เกม', 'หนังสือ', 'สัตว์เลี้ยง', 'อื่นๆ']`

Conditions: `['ใหม่ในกล่อง', 'มือสอง สภาพ 95%+', 'มือสอง สภาพดี', 'มือสองทั่วไป', 'ซ่อมได้ / อะไหล่']`

---

## 8. Home Page Features

### Promo rail (MONEY_RAIL)
```
001 — ลงขายฟรีไม่จำกัด  (จ่ายเฉพาะเมื่อขายสำเร็จ 3%)
002 — Boost สินค้า ฿29   ← featured card (accent border)
003 — รับเงินปลอดภัย    (PloiPay)
004 — ค่าส่งคืนได้       (PloiShip, สูงสุด ฿60)
```

### Sort options
`newest`, `price_asc`, `price_desc`

### Search
debounce 400ms → API `/api/products?search=...`

---

## 9. ฟีเจอร์ที่ปิดไว้ (`FEATURES` flag)

| Feature | สถานะ | เหตุผล |
|---|---|---|
| `LIVE` | ❌ ปิด | ยังไม่พร้อม, เปิดเมื่อ backend websocket พร้อม |
| `HOLIDAY_MODE` | ❌ ปิด | เปิดเฉพาะช่วงเทศกาล |

---

## 10. Interaction Patterns

### การเปิด overlay
```typescript
// ใน page.tsx
hubOpen: { mode: 'sell' | 'buy'; tab?: string } | null

onOpenHub?.('buy', 'saved')    // เปิด MyHub buy mode > saved tab
onOpenHub?.('sell')            // เปิด MyHub sell mode
```

### Auth guard
- ถ้าไม่ได้ login แล้วกด "ขาย" / "ลงขาย" → เปิด AuthModal แทน
- Session จาก NextAuth (`useSession()`)
- JWT token อยู่ใน `(session as any).token`

### Dark mode
- **ไม่ได้ login**: ซ่อน ไม่มีปุ่มแสดง
- **Login แล้ว**: toggle row อยู่ใน account dropdown พร้อม pill switch
- Set `data-theme="dark"` บน `<html>`
- ไม่ได้ persist (refresh แล้ว reset)

### Responsive breakpoint
```typescript
useBreakpoint(768)   // true = mobile (<768px)
```

---

## 11. Components ที่มีอยู่

| File | หน้าที่ |
|---|---|
| `Navbar.tsx` | navbar sticky + sub-nav |
| `MyHub.tsx` | hub panel (sell/buy) |
| `ProductCard.tsx` | card ในตาราง product |
| `ProductDetail.tsx` | modal รายละเอียดสินค้า |
| `ListingFlow.tsx` | flow ลงขาย 4 ขั้นตอน |
| `AuthModal.tsx` | login / signup / reset password |
| `ChatDrawer.tsx` | chat drawer (right side) |
| `WishlistDrawer.tsx` | wishlist drawer |
| `FilterDrawer.tsx` | filter drawer (mobile bottom sheet) |
| `ShopDrawer.tsx` | shop/seller profile drawer |
| `Sidebar.tsx` | category sidebar (desktop) |
| `PloiLogo.tsx` | wordmark + icon |

---

## 12. สิ่งที่ยังไม่มี / TODO

- `/products/[id]` route — product ยังเปิดเป็น modal ใน SPA เท่านั้น
- Dark mode persistence (localStorage)
- Share URL ที่ deep-link ไปถึงสินค้าจริง (ตอนนี้ share แค่ `window.location.origin`)
- `LIVE` feature (real-time)
- `HOLIDAY_MODE` feature

---

## 13. Coding Conventions

- **Inline styles เท่านั้น** สำหรับ component UI — ไม่ใช้ className / Tailwind
- CSS variables (`var(--...)`) สำหรับ color/radius ทุกจุด
- `'use client'` ทุกไฟล์ใน `src/components/`
- ภาษาไทย: label, placeholder, error message ทุกที่
- e2e tests: `frontend-next/e2e/*.spec.ts` (Playwright)
- ทุก code change ต้องมี e2e test ที่เกี่ยวข้องด้วย
