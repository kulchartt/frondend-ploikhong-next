# Round 1 — Home Page Redesign

> **วิธีใช้:** เปิด claude.ai (Pro/Max) → New chat → paste **2 ไฟล์รวมกัน**:
> 1. `design-handoff/CLAUDE_AI_BRIEF.md` (master context)
> 2. ไฟล์นี้ทั้งฉบับ
> แล้ว upload screenshot ของหน้า https://www.ploikhong.com/ ทั้ง mobile (390×844) และ desktop (1280×800)
> Claude จะสร้าง Artifacts 3 versions ให้ดู

---

## หน้าที่ redesign

**Route:** `/`
**File:** `src/app/page.tsx`
**Production URL:** https://www.ploikhong.com/

## Layout overview (ปัจจุบัน)

```
Desktop (max-width: 1440px, padding: 20px L/R)
┌─────────────────────────────────────────────┐
│ Navbar (sticky)                             │
├─────────────────────────────────────────────┤
│ Sidebar │ ┌─────────────────────────────┐  │
│ (240px) │ │ Promo Banner (gradient)     │  │
│ - cats  │ │ "ทดลองใช้งานฟรี" CTA          │  │
│ - sub   │ ├─────────────────────────────┤  │
│         │ │ Money Rail (4 cards grid)   │  │
│         │ │ 001 002 003 004             │  │
│         │ ├─────────────────────────────┤  │
│         │ │ Toolbar (sort + view toggle)│  │
│         │ ├─────────────────────────────┤  │
│         │ │ Product Grid                │  │
│         │ │ ████ ████ ████ ████          │  │
│         │ │ ████ ████ ████ ████          │  │
│         │ └─────────────────────────────┘  │
└─────────────────────────────────────────────┘
│ Footer (5-column: brand + links)            │
│ Complaint banner + bottom bar               │
└─────────────────────────────────────────────┘

Mobile (full-width, padding: 0 L/R)
┌──────────────────────┐
│ Navbar               │
├──────────────────────┤
│ Category chips       │ (sticky, scrollable)
├──────────────────────┤
│ Product Grid         │ (2 cols, gap 2px)
│ ████ ████             │
│ ████ ████             │
├──────────────────────┤
│ Footer (compact)     │
├──────────────────────┤
│ Bottom tab bar       │ (fixed: home, search, +, chat, account)
└──────────────────────┘
```

## Pain points ที่อยากแก้

1. **Promo banner + Money rail** — ดูเหมือน admin dashboard มากกว่า marketplace consumer app
2. **Money rail (4 cards) — กลม ๆ ทื่อ ๆ** — ไม่มี visual hierarchy, badge "001/002/003" ดู geek
3. **Product grid ดูจม** — gap 3px, layout density ดูทึบไม่หายใจ ในขณะเดียวกันถ้าเพิ่ม gap ก็จะรู้สึกห่าง สินค้าจมในความว่าง
4. **Footer 5 columns ดูหนัก** — เหมือน enterprise B2B
5. **บนจอกลาง (1024-1440px) ไม่ได้ใช้ horizontal space ให้คุ้ม** — มีช่องว่างเยอะ
6. **Hero space (กลางจอบนสุด) ไม่มี** — ไม่มี emotional draw
7. **(ผู้ใช้ลอง edge-to-edge มาแล้ว) — รู้สึก "ใหญ่ไป"** เมื่อปิด max-width 1440 + ปิด padding L/R → product cards ใหญ่ผิดสัดส่วน

## ขอให้ทำ — 3 Versions ใน Artifacts

ทุก version ต้อง render ได้จริง (HTML+inline CSS หรือ React+Tailwind ใน Artifact) — ลองที่ viewport **mobile 390×844** และ **desktop 1280×800**

### V1 — "Polished baseline" (low risk)
**คงไว้:** max-width 1440px + 20px L/R padding + sidebar 240px + gap 24px
**ปรับ:** typography, spacing, micro-details
- ปรับ Money rail ให้ดูน้อยลงเหมือน "info chips" แทน "feature cards"
- Product grid gap 12-16px (จาก 3px) — airy ขึ้น แต่ card ใหญ่ขึ้นพอชดเชย
- Footer ลดเหลือ 3 columns (brand+เกี่ยวกับ / นโยบาย / ติดต่อ) แทน 5
- เพิ่ม subtle warmth ด้วย accent orange (#FF6B35) ที่ heading หรือ badge

### V2 — "Edge-to-edge product grid only" (medium risk)
**Concept:** Container กับ sidebar คงรูปเดิม แต่ **Product grid section ทะลุชนขอบจอ**
- Sidebar: padding-left 20px (ไม่ชิดขอบ)
- Promo banner + Money rail: คงใน container 1440 + 20px padding
- Product grid: เริ่ม edge-to-edge ตั้งแต่ขอบขวาของ sidebar → ขอบขวาของจอ
- Card gap 8-12px, image aspect 1:1 (square) instead of 1.6
- Sticky filter pill row บนสุดของ product section

### V3 — "Full edge-to-edge + reduced sidebar" (bold rethink)
**Concept:** ใช้ horizontal space ทุก pixel + simplify chrome
- Sidebar 240px → 200px หรือ collapsible (icon-only) ใน 1024-1280px
- ตัด max-width 1440 ออก (กว้างไปจอใหญ่ก็ค่อยกัน max ที่ 1920)
- Product grid: 5 cols ที่ 1280-1600, 6 cols ที่ 1600+
- Card อาจเล็กลงนิด (200×200) เพื่อชดเชย
- Promo + Money rail compact (1 row ราบๆ ไม่เป็น cards)
- Footer minimal — 1 row พอ

## สำคัญ

ทั้ง 3 versions:
- ✅ **เก็บ design tokens เดิมไว้** (--accent #1d4ed8, --brand-orange #FF6B35, --ink, --surface, ฯลฯ)
- ✅ **mobile-first** — render mobile preview ด้วยทุก version
- ✅ Touch targets ≥ 44×44px
- ✅ ใช้ Inter Tight สำหรับ display, IBM Plex Sans Thai สำหรับ body
- ✅ Light mode default (dark mode optional)
- ✅ ห้ามใช้ Material UI / Chakra / Mantine — ต้องเป็น HTML+CSS ปกติ หรือ React+Tailwind ที่ map ไปกับ base-ui ได้

หลังจากเสร็จ — อธิบายสั้น ๆ (3-5 bullet) ของแต่ละ version ว่า:
- ปรับอะไรบ้าง
- เหมาะกับ user persona ไหน (เช่น mobile-first / desktop power user)
- Risk ของการ implement (low/medium/high) + ทำไม

---

## Reference: โค้ดปัจจุบัน (homepage layout)

ดูไฟล์ snapshot ในโฟลเดอร์เดียวกัน: [page-current.tsx](./page-current.tsx)

หรือถ้าอยู่ในแชท claude.ai — paste code นี้ตามหลังประมาณนี้:

```tsx
// [PASTE สำคัญ chunks ของ page.tsx — Promo Banner + Money Rail + Toolbar + Product Grid + Footer]
// ดูไฟล์ snapshot ใน round-1-home/page-current.tsx
```

---

## Components ที่ใช้ (ห้ามเปลี่ยน interface เพราะใช้ในหลายหน้า)

- `<Navbar onSearch onOpenAuth onResetPassword onOpenListing unreadChat onOpenChat onOpenHub />`
- `<Sidebar onFilter />`
- `<ProductCard product layout inWishlist onClick onWishlist />`
- `<PloiMark size={44} />` — logo mark
- `<PloiThWordmark size={11} />` — Thai wordmark
- `PK_GRADIENT` — exported brand gradient (CSS string)

ถ้า redesign ต้องเปลี่ยน interface ของ component เหล่านี้ — แจ้งใน comment

---

## เมื่อได้ design ที่ชอบ

1. Copy ลิงก์ Artifact หรือ JSX สุดท้ายที่เลือก
2. กลับมาที่ Claude Code (พื้นที่นี้) — บอก:
   ```
   เลือก V2 จาก Round 1 home — apply ตามนี้: [paste code/link]
   ```
3. ผม:
   - แปลงเป็น TypeScript + base-ui components
   - Map class names → CSS variables
   - คง interface ของ Navbar / Sidebar / ProductCard
   - เขียน Playwright e2e test
   - Auto-merge → Vercel deploy → คุณดูจริง
