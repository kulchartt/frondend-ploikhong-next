# 🎨 Claude.ai Design Brief — ปล่อยของ (PloiKhong)

> **วิธีใช้:** เปิด claude.ai (Pro/Max) → New chat → paste ทั้งไฟล์นี้เป็นข้อความแรก → จากนั้น paste โค้ด component ที่อยากให้ redesign + บอกว่าอยากได้ style ไหน → claude จะสร้าง Artifact ให้ดู preview

---

## 1. โปรเจกต์

**ปล่อยของ (PloiKhong)** — Thai C2C marketplace platform for online buying/selling between users.
**ไม่ใช่** เฉพาะของมือสอง — ขายของออนไลน์ทั่วไป
**Production:** https://ploikhong.com

**Revenue model:** ขาย "premium coin packages" ผ่าน Omise (PromptPay/Card) ให้ผู้ขาย → ใช้เปิดฟีเจอร์เสริม (boost, featured, price alerts, auto-relist, analytics pro)

**Target users:**
- ผู้ขาย — บุคคลทั่วไป (ไม่ใช่ร้านค้า professional) ลงสินค้าขายเป็นรายชิ้น
- ผู้ซื้อ — มองหาของจาก local seller, บ่อยครั้งดูบนมือถือ

---

## 2. Tech Stack (สำคัญ — design ต้อง implement ได้)

- **Framework:** Next.js 16.2.4 (App Router) + React 19.2 + TypeScript
- **Styling:** Tailwind CSS v4 + CSS Variables (ไม่ใช้ inline objects ก็ได้แต่ codebase ปัจจุบันใช้ `style={{}}` เยอะ)
- **Components:** **base-ui** (`@base-ui/react`) + **shadcn** (บางส่วน)
- **Auth:** NextAuth v5
- **Icons:** lucide-react (มีอยู่แล้ว)
- **Mobile-first:** target 390×844 (iPhone), responsive ขึ้น desktop

⚠️ **Constraint:** ห้ามแนะนำ component library ที่ไม่ได้ติดตั้ง (ห้าม Material UI, Chakra, Mantine, Radix UI ตรง ๆ — ใช้ base-ui แทน)

---

## 3. Design Tokens (ต้องคงไว้)

### Brand colors
```css
--accent:       #1d4ed8;  /* Primary blue from logo */
--accent-hover: #1e40af;
--accent-ink:   #ffffff;
--brand-orange: #FF6B35;  /* Secondary orange from logo */
```

### Backgrounds (light mode — cool white)
```css
--bg:        #f8f9fb;  /* Page background */
--surface:   #ffffff;  /* Cards / modals */
--surface-2: #f0f2f5;  /* Subtle background, inputs */
```

### Borders
```css
--line:   #e2e6ec;
--line-2: #d0d5de;
```

### Text
```css
--ink:   #0f172a;  /* Primary */
--ink-2: #55534c;  /* Secondary */
--ink-3: #8a877e;  /* Hint / muted */
```

### Semantic
```css
--pos:  #0a7a45;  /* Success / positive */
--warn: #a85a00;  /* Warning */
--neg:  #b83216;  /* Error / danger */
```

### Dark mode (`[data-theme="dark"]`)
```css
--bg: #0e0e0d; --surface: #171715; --surface-2: #1f1f1c;
--ink: #f3f2ec; --ink-2: #b7b5ad; --ink-3: #7e7c74;
--pos: #4ec38a; --warn: #d79a3a; --neg: #e56a4e;
```

### Typography
- **Body (Thai-friendly):** `var(--font-th)` → IBM Plex Sans Thai, 15px, line-height 1.5
- **Display (headings):** `var(--font-display)` → Inter Tight, letter-spacing -0.01em
- **Mono (numbers/code):** `var(--font-mono)` → ui-monospace

### Radius
```css
--radius:    10px;  /* default */
--radius-sm: 6px;   /* buttons, small elements */
```

---

## 4. Brand voice & vibe

- **Thai casual** — ใช้ ครับ/ค่ะ ไม่เป็นทางการมาก แต่สุภาพ
- **Trustworthy but friendly** — ไม่หรูหราจัด ไม่เด็กจัด
- **Marketplace energy** — เน้นสินค้า, ราคา, รูปภาพ ให้โดดเด่น
- **Mobile usability ก่อน aesthetics** — ปุ่มกดนิ้วโป้งง่าย, อ่านง่ายในแสงแดด

**Reference styles ที่ชอบ:**
- Vinted (UK secondhand) — clean, focused on items
- Depop (US Gen Z) — vibrant but readable
- Kaidee (TH) — Thai familiar, trust-building

**Style ที่หลีกเลี่ยง:**
- เกินไปจน enterprise (เช่น Shopify admin)
- หรูหราจัด (เช่น Apple-style)
- Dark mode by default (เป็น option แต่ default = light)

---

## 5. Pain points ปัจจุบัน

(ผู้ใช้เพิ่งบอกว่าอยาก redesign — กรุณาแก้)
- สีน้ำเงินอาจดูเฉยเกินไป → อาจเพิ่ม warmth ด้วย accent ส้ม `--brand-orange`
- หน้าบางหน้าข้อมูลแน่น layout ไม่หายใจ
- Footer / global navigation ดูเหมือน admin panel มากกว่า consumer app
- บาง element ยังใช้ inline `style={{}}` แทน Tailwind utilities (refactor เป็น Tailwind ได้ถ้า designer แนะนำ)

---

## 6. ขอให้ claude.ai ทำ

**ในหน้าที่ paste โค้ดมาให้:**
1. **Critique design ปัจจุบัน** — บอก 3-5 จุดที่ improve ได้
2. **เสนอ direction 2-3 versions** เป็น Artifacts ที่ render ได้:
   - V1: Polished current — ปรับเล็ก ๆ น้อย ๆ ให้สวยขึ้น (low risk)
   - V2: Modern refresh — ใช้ accent orange มากขึ้น, generous spacing, ใหญ่ขึ้น typography (medium risk)
   - V3: Bold rethink — เปลี่ยน layout / interaction pattern ใหม่ (high risk, may not implement easily)
3. **คงไว้:** brand color tokens, base-ui components ที่ใช้, accessibility (touch targets ≥44px, contrast ≥4.5:1, keyboard nav)
4. **Mobile preview** — Artifact ควรตั้ง viewport 390×844 default
5. **อธิบายเหตุผล** ของแต่ละ version สั้น ๆ

---

## 7. หลังจากเลือก design ที่ชอบแล้ว

1. กลับมา Claude Code (ที่ผู้ช่วยนี้)
2. paste link Artifact หรือโค้ดสุดท้ายที่เลือก
3. บอกชื่อหน้า/component ที่ redesign
4. ผู้ช่วยจะ apply เข้าโค้ดจริง:
   - แปลงเป็น base-ui components ที่ใช้จริง
   - ใช้ design tokens เดิม (--accent, --ink, ฯลฯ)
   - เพิ่ม TypeScript types
   - เขียน Playwright e2e test
   - Auto-merge เข้า master → deploy บน Vercel ที่ ploikhong.com

---

## 8. Inventory หน้าทั้งหมด (ไว้เลือกหน้าแรกที่จะ redesign)

| Route | Component | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Home — product grid + sidebar + footer |
| `/products/[id]` | `ProductDetailClient.tsx` | Product detail — gallery, price, seller, chat |
| `/contact` | `app/contact/page.tsx` | Business info (DBD compliance) |
| `/coins` | `app/coins/page.tsx` | Premium coin packages + checkout |
| `/admin` | `app/admin/page.tsx` | Admin panel |
| `/complaints` | `app/complaints/page.tsx` | User complaints + chat |
| `/help` | `app/help/page.tsx` | FAQ |
| `/guide` | `app/guide/page.tsx` | How-to-use guide (tabbed) |
| `/privacy`, `/terms`, `/refund`, `/rules` | static legal | |

**Component หลักที่ใช้ซ้ำ:**
- `Navbar.tsx` — top navigation
- `Sidebar.tsx` — category list (desktop)
- `ProductCard.tsx` — product grid card
- `FilterDrawer.tsx` — mobile filter sheet
- `AuthModal.tsx` — login/signup
- `ChatDrawer.tsx`, `WishlistDrawer.tsx`, `MyHub.tsx`, `ListingFlow.tsx`, `ShopDrawer.tsx`

---

## 9. Templates pasted หลังจากนี้

ทุกครั้งที่ขอ redesign ใหม่ paste ในรูปแบบนี้:

```
[paste content of CLAUDE_AI_BRIEF.md ทั้งหมด]

---

# Round X — redesign <ชื่อ component/page>

**ไฟล์:** `src/components/ProductCard.tsx`

**ปัจจุบัน:**
\`\`\`tsx
[paste โค้ดเดิม]
\`\`\`

**สิ่งที่อยากได้:**
- (เช่น) "ทำให้รูปสินค้าโดดเด่นกว่านี้, badge boost/featured สวยขึ้น, ราคาเด่น, condition tag เล็กลง"
- "Mobile 390×844 + desktop 1280px"
- "ใช้ accent orange เป็น highlight"

ทำ 2-3 versions ใน Artifacts ให้ดู
```
