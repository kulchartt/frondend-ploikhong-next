# 🛍️ PloiKhong — Frontend (Next.js 14)

UI ของ PloiKhong marketplace ของมือสอง พัฒนาด้วย Next.js 14 App Router + TypeScript

**Production:** https://frondend-ploikhong-next.vercel.app  
**Backend API:** https://khai-claude-production.up.railway.app

---

## 📁 โครงสร้าง

```
src/
├── app/
│   ├── page.tsx              ← หน้าแรก (marketplace + sidebar + promo)
│   ├── admin/page.tsx        ← Admin panel (KPI, users, products, premium)
│   ├── terms/page.tsx        ← เงื่อนไขการใช้งาน
│   ├── rules/page.tsx        ← กฎและข้อบังคับ (สินค้าต้องห้าม/ควบคุม)
│   ├── refund/page.tsx       ← นโยบายการคืนสินค้า
│   ├── privacy/page.tsx      ← นโยบายความเป็นส่วนตัว
│   ├── layout.tsx            ← Root layout (fonts, metadata)
│   └── providers.tsx         ← SessionProvider + BgColorApplier (theme sync)
├── components/
│   ├── Navbar.tsx            ← Top nav (logo, search, auth, hub, chat)
│   ├── Sidebar.tsx           ← Category filter (real counts from DB)
│   ├── MyHub.tsx             ← User hub: ซื้อ/ขาย/เหรียญ/ตั้งค่า/ธีม
│   ├── ProductCard.tsx       ← Grid + List layout cards
│   ├── ProductDetail.tsx     ← รายละเอียดสินค้า + analytics tracking
│   ├── ListingFlow.tsx       ← Wizard ลงขาย/แก้ไขสินค้า
│   ├── ChatDrawer.tsx        ← Real-time chat (Socket.io)
│   ├── AuthModal.tsx         ← Login / Register modal
│   └── ...
└── lib/
    └── api.ts                ← All API call functions (typed)
```

---

## ✨ ฟีเจอร์หลัก

### หน้า Marketplace (`/`)
- แสดงสินค้าพร้อม Grid / List view toggle
- Sidebar filter: หมวดหมู่ (จำนวนจริงจาก DB), ราคา, สภาพ, พื้นที่, วิธีส่ง
- Promo banner → CTA ไปหน้า Premium
- Feature rail: 4 cards (featured listing, auto-relist, analytics, more) → เปิด Premium tab
- Footer: brand info, legal links, ปุ่มร้องเรียน

### ธีม & Appearance Preferences
- เลือกสีพื้นหลัง 12 สี (BG_PALETTE) พร้อมปุ่ม Apply
- Dark / Light mode toggle
- Checkbox "จำการตั้งค่าข้ามอุปกรณ์" → sync ผ่าน backend DB
- BgColorApplier ใน providers.tsx โหลด localStorage ก่อน (ไม่กระพริบ) แล้ว sync จาก session

### MyHub
- **ซื้อ tab**: wishlist, offers ขาเข้า
- **ขาย tab**: รายการสินค้า + สถานะ, ปุ่มลงขายใหม่, analytics
- **เหรียญ tab**: ยอดเหรียญ, ซื้อเหรียญ PromptPay, เปิด features premium
- **ตั้งค่า tab**: ธีมสี, dark mode, remember preferences

### Admin Panel (`/admin`)
- KPI stats: users, products, revenue
- จัดการ users: ban/unban, toggle admin
- จัดการ products: search + delete
- Premium tab: revenue sources breakdown, per-feature bars (ทุก 5 features เสมอ แม้ไม่มี data)
- อนุมัติ/ปฏิเสธ payment requests

---

## 🔧 Local Development

```bash
cp .env.local.example .env.local
# แก้ไข NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID/SECRET

npm install
npm run dev   # http://localhost:3000
```

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_API_URL=https://khai-claude-production.up.railway.app
NEXTAUTH_SECRET=<random string>
NEXTAUTH_URL=https://frondend-ploikhong-next.vercel.app
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
```

---

## 🛠️ Tech Stack

| | |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Inline styles + CSS variables (`globals.css`) |
| Auth | NextAuth.js v5 (JWT + Google OAuth) |
| Real-time | Socket.io client |
| Deploy | Vercel (auto-deploy จาก GitHub push ที่ branch `master`) |

---

## 🎨 Design Tokens (`globals.css`)

```css
--accent: #e02d2d        /* red CTA */
--ink / --ink-2 / --ink-3
--surface / --surface-2
--line
--radius / --radius-sm
--font-mono
```

Dark mode: `[data-theme="dark"]` selector ใน globals.css  
ตั้งค่าผ่าน `document.documentElement.setAttribute('data-theme', 'dark')`

---

## 🧪 E2E Tests

```bash
npx playwright test          # run all tests
npx playwright test --ui     # interactive mode
```

Reports อยู่ที่ `playwright-report/`
