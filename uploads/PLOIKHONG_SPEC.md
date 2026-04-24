# PloiKhong — Online Marketplace (Prototype Spec)

> **Updated:** 2026-04-24
> **Version:** Design Prototype v2 (post-redesign)
> **File scope:** `ploikhong.html` + `ploi/*.jsx`

> ⚠️ นี่คือ spec ของ **design prototype** ไม่ใช่ production app
> production stack (Next.js + Railway) อยู่ใน section 12 ท้ายไฟล์ (reference เก่า)
> สำหรับ code convention ดู `CLAUDE.md`

---

## 1. Product Overview

**PloiKhong (พลอยของ)** — แพลตฟอร์มซื้อ-ขายของมือสองออนไลน์ภาษาไทย ที่รวมฟีเจอร์:
- ลงประกาศขายสินค้ามือสอง + AI ช่วยเขียนคำอธิบาย
- แชทเจรจาราคาแบบ real-time (Messenger-style)
- ระบบเหรียญ (Coins) + Premium features (Boost, Featured, Analytics, ฯลฯ)
- ระบบร้องเรียน 2 ทาง (user ↔ ทีมงาน)
- Admin ops console สำหรับทีม moderation

Prototype นี้เน้น **design fidelity** — mock data ทั้งหมด ยังไม่ต่อ API จริง

---

## 2. Screens & Components (Prototype Map)

### Entry points (ใน `ploikhong.html`)
- **Top bar** — variation switcher (A/B/C) + dark mode + density + tweak panel
- **Navbar** — logo, search, Buy/Sell buttons, account dropdown

### Core screens
| Screen | ไฟล์ | Trigger |
|---|---|---|
| Home / Feed | `ploi/v2.jsx` | default |
| Product Detail | `ploi/v4_detail.jsx` | `window.__openProduct(p)` |
| Create Listing (4-step) | `ploi/v5_listing.jsx` | `window.__openListing()` |
| Login / Signup | `ploi/v7_auth.jsx` | `window.__openAuth()` |
| MyHub (drawer) | `ploi/v8_hub.jsx` | `window.__openHub('sell'\|'buy')` |
| Chat inbox | `ploi/v9_chat.jsx` | `window.__openChat(threadId?)` |
| Stubs (guide/help/terms) | `ploi/v10_stubs.jsx` | footer links |
| Admin Ops Console | `ploi/v11_admin.jsx` | account dropdown (admin only) |
| Complaints Center | `ploi/v11_complaints.jsx` | account dropdown |
| Coins Shop + Premium | `ploi/v11_coins.jsx` | navbar / account dropdown |

### Shared infrastructure
- `ploi/data.jsx` — mock products, users, complaints, coin packages
- `ploi/shared.jsx` — Icon, Avatar, Tag, Modal shell, EmptyState
- `ploi/footer.jsx` — global footer
- `ploi/mount.jsx` — Portal setup + `window.__openXxx()` API surface

---

## 3. Feature Details

### 3.1 Home / Feed (`v2.jsx`)
- Hero CTA + featured grid + category chips + infinite scroll feed
- Sub-nav tags: สำหรับคุณ / ใกล้ฉัน / ของใหม่ / Boost เด่น / ส่งฟรี / ลดราคา / ของสะสม / นัดรับ
- Boost/Featured/Flash-sale badges บน card
- Click card → `__openProduct(p)`

### 3.2 Product Detail (`v4_detail.jsx`)
- Full-screen overlay (Esc = close, body scroll lock)
- Image carousel + description + seller card + reviews + Similar items
- Action: **ซื้อเลย** / **ต่อรอง (Offer)** / **แชทผู้ขาย** / **Save**
- Share via link/QR

### 3.3 Create Listing (`v5_listing.jsx`)
4-step wizard: **Info → Images → Delivery → Review**
- Title, price, category, condition (ใหม่ในกล่อง / สภาพ 90%+ / มือสองทั่วไป / ซ่อมได้)
- Multiple images (drag reorder + delete)
- Delivery: **นัดรับ** หรือ **ส่งฟรี**
- Location text + optional GPS meetup point
- Options: draft save, flash sale (flash_price + countdown), watermark, AI description

### 3.4 Auth (`v7_auth.jsx`)
- Login / Signup / Reset password tabs
- Email/password + Google OAuth + Facebook OAuth (mock)
- Biometric (WebAuthn) placeholder

### 3.5 MyHub Drawer (`v8_hub.jsx`)
- Slide-in จากขวา 420px
- **Sell mode**: My Listings, Insights, News, Profile
- **Buy mode**: Activity, Saved/Wishlist, Notifications, Following
- Mode toggle ด้านบน drawer

### 3.6 Chat Inbox (`v9_chat.jsx`)
- FB Marketplace-style: room list (left 300px) + message pane (right flex)
- Text / image / voice message bubbles
- Typing indicator + read receipts + online status
- Product card preview ใน thread (buyer-seller-product triplet)

### 3.7 Coins & Premium (`v11_coins.jsx`)

**Coin packages:**
| Package | Price | Coins |
|---|---|---|
| Starter | ฿99 | 100 เหรียญ |
| Popular | ฿299 | 350 เหรียญ (+15%) |
| Pro | ฿599 | 800 เหรียญ (+25%) |
| Business | ฿999 | 1,500 เหรียญ (+33%) |

**Premium features:**
| Feature | Cost | Duration | Effect |
|---|---|---|---|
| ⭐ Featured | 80 | 7 วัน | Badge + featured section |
| 🚀 Boost | 30 | 7 วัน | ดันขึ้นบนสุดหมวด |
| 🔔 Price Alert | 25 | 30 วัน | แจ้งเตือน follower เมื่อลดราคา |
| 🔄 Auto-Relist | 20 | 30 วัน | auto-bump ทุก 7 วัน |
| 📊 Analytics Pro | 50 | 30 วัน | Advanced seller insights |

**Flow (เมื่อต่อ backend จริง):**
User upload PromptPay slip → admin confirm → coins credited → spend

**Prototype flow ปัจจุบัน:** checkout modal → confirm → balance update (local state)

### 3.8 Complaints Center (`v11_complaints.jsx`)

**User side:**
- Two-panel: list (left 300px) + thread (right)
- Status filter chips: ทั้งหมด / ⏳ รอดำเนินการ / 🔍 กำลังตรวจสอบ / ✅ แก้ไขแล้ว / ❌ ปฏิเสธ
- Types: 🚨 ถูกโกง / 📦 สินค้า / 👤 ผู้ใช้ / 💳 การชำระ / 📝 อื่นๆ
- SLA timer + progress stepper
- File evidence upload + evidence viewer
- Input bar ซ่อนเมื่อ resolved/rejected

**Admin side (ใน `v11_admin.jsx` → Complaints tab):**
- Same two-panel structure + decision buttons (ตรวจสอบ / ปิดเรื่อง / ปฏิเสธ)
- Auto-poll every 8s
- Internal note field (not visible to user)

### 3.9 Admin Ops Console (`v11_admin.jsx`)
Sidebar navigation with tabs:
| Tab | Features |
|---|---|
| 📊 ภาพรวม | KPI cards: users / products / orders / revenue + bar chart |
| 👥 ผู้ใช้ | Search + detail drawer, ban/unban, grant admin, verify seller |
| 📦 สินค้า | List all, filter by status, delete/change status |
| 🪙 Premium | Revenue chart, feature usage, package breakdown |
| 💳 คำขอเติมเหรียญ | Pending/confirmed/rejected payment requests |
| 🚨 ร้องเรียน | Complaint management + inline two-way chat |
| 🔔 Reports | Flagged products/sellers queue (moderation queue) |

Shortcuts: Cmd+K command palette, bulk select, keyboard nav

---

## 4. Data Models (mock → DB mapping)

Mock shape ใน `data.jsx` ตรงกับ table plan:

| Mock | → Table | Fields |
|---|---|---|
| `PRODUCTS[]` | `products` | id, title, price, was, cat, cond, seller, loc, posted, boost, free, flag |
| `USERS[]` | `users` | id, name, email, avatar, role (user/admin), coin_balance, is_banned |
| `COMPLAINTS[]` | `complaints` + `complaint_messages` | id, type, status, userId, detail, thread[] |
| `COIN_PACKAGES[]` | static config | id, price, coins, bonus |
| `FEATURES[]` | `feature_activations` | productId, userId, featureType, startsAt, endsAt |
| `THREADS[]` | `chat_rooms` + `messages` | buyerId, sellerId, productId, messages[] |

ดู section 12 สำหรับ full table list (production)

---

## 5. Design Tokens

```css
--accent: #0B5FFF            /* brand primary (tweakable) */
--radius: 10px               /* cards, modals */
--radius-sm: 6px             /* buttons, inputs, tags */
--density: 1                 /* tweak multiplier */

/* Light */
--bg:#f8fafc  --surface:#ffffff  --surface-2:#f1f5f9
--line:#e2e8f0  --line-2:#cbd5e1
--ink:#0f172a  --ink-2:#475569  --ink-3:#94a3b8
--pos:#16a34a  --warn:#d97706  --neg:#dc2626

/* Dark — html[data-theme="dark"] */
--bg:#0f172a  --surface:#1e293b  --surface-2:#334155
--ink:#f1f5f9  --ink-2:#94a3b8  --ink-3:#64748b
```

**Typography:**
- Thai + body: `IBM Plex Sans Thai` (300–700)
- Display: `Inter Tight` (500–800)
- Mono: `IBM Plex Mono` (400, 500)

**Layout patterns:**
- Two-panel (chat, complaints): 300px left + flex-1 right
- Slide-in drawer (MyHub): 420px from right
- Modal overlay (Auth, ProductDetail, Checkout): centered + backdrop blur
- Admin: 220px sidebar + flex-1 main
- Grid: CSS grid (auto-fill, minmax ~200px)

**Chat bubbles:**
- Self: `border-radius: 16px 16px 4px 16px`
- Other: `border-radius: 16px 16px 16px 4px`

---

## 6. Portal / Overlay API

Expose ใน `mount.jsx`:
```js
window.__openProduct(productObj)
window.__openHub('sell' | 'buy')
window.__openAuth()
window.__openListing()
window.__openChat(threadId?)
```
ทุก Portal: Esc = close, `body.overflow='hidden'` while open

---

## 7. Interaction Rules

- **ราคา**: `฿xx,xxx` (comma separator, ไม่มีทศนิยม, `font-mono`)
- **Hit targets**: mobile ≥ 44px / desktop button ≥ 36px
- **Emoji**: ใช้ใน chat messages only — ห้ามในป้าย/ปุ่ม/labels UI
- **Scroll**: ห้ามใช้ `scrollIntoView` → ใช้ `scrollTo` / `scrollTop`
- **Copy style**: label สั้น ไม่ขึ้นต้น "คุณสามารถ..."
- **Error/empty state**: บอกว่าเกิดอะไร + ทำอะไรต่อได้

---

## 8. Feature Flags (Prototype status)

| Feature | Status |
|---|---|
| Home feed + filters | ✅ mocked |
| Product detail overlay | ✅ |
| Create listing wizard (4 steps) | ✅ |
| Auth modal | ✅ mock (no real OAuth) |
| MyHub drawer (Sell + Buy) | ✅ |
| Chat inbox (Messenger-style) | ✅ mock |
| Coins shop + checkout modal | ✅ local state |
| Premium features activation | ✅ mock |
| Complaints user side | ✅ full flow |
| Complaints admin side | ✅ full flow |
| Admin ops console (6+1 tabs) | ✅ |
| Command palette (Cmd+K) | ✅ |
| Dark mode | ✅ token override |
| Tweak mode | ✅ |
| **Live selling** | ❌ not in prototype |
| **Real backend** | ❌ see section 12 |

---

## 9. Known Deltas from Old Spec

เทียบกับ production spec เดิม — prototype นี้มี redesign เยอะ:
- **Complaints** redesigned: detail-focused + SLA timer + progress stepper (เดิมเป็น simple list)
- **Admin** redesigned เป็น ops console: user detail drawer + report queue + command palette + bulk actions
- **MyHub** เป็น slide-in drawer 420px (เดิม full page)
- **Chat** redesigned เป็น Messenger-style (เดิมเป็น drawer ขนาดเล็ก)
- **Coins** + **Premium** รวมเป็นหน้าเดียว + checkout flow ในหน้านั้น
- **Font** เปลี่ยนจาก `system-ui` → IBM Plex Sans Thai + Inter Tight
- **Brand color** เปลี่ยนจาก `#dc2626` → `#0B5FFF` (tweakable)
- **PloiShip** ถูกถอดออก — เหลือ **นัดรับ** กับ **ส่งฟรี** เท่านั้น

---

## 10. Next Steps (ถ้าจะต่อ production)

1. เลือก backend stack (แนะนำ: คง Next.js + Railway เดิมถ้ามีอยู่แล้ว)
2. สร้าง `ploi/api.js` wrapper — fetch + JWT + error handling
3. แปลง mock data ใน `data.jsx` → React Query / SWR
4. ต่อ Socket.io สำหรับ chat + complaints real-time
5. ต่อ Cloudinary สำหรับ image upload
6. eKYC + WebAuthn — ใช้ library เดิม (SimpleWebAuthn + Anthropic)

---

## 11. Testing Checklist

เวลา redesign / เพิ่ม feature ใน prototype:
- [ ] เปิด overlay ทุกตัวผ่าน `window.__openXxx()` ได้
- [ ] Esc ปิด overlay ได้
- [ ] Body scroll ไม่หลุดเมื่อ modal เปิด
- [ ] Dark mode: toggle แล้วสีถูกทุก component
- [ ] Tweak: change accent → สีอัพเดททั้งหน้า
- [ ] Mobile viewport (≤768px) ไม่เพี้ยน layout
- [ ] ไม่มี console error
- [ ] Cross-file shared components ถูก `Object.assign(window, …)` ครบ

---

## 12. Production Reference (เก่า — ใช้เมื่อจะ wire backend)

### Stack
**Frontend:** Next.js 14 App Router, TypeScript, NextAuth v5 beta, CSS variables
**Backend:** Node.js + Express 4, PostgreSQL, Socket.io 4.7, JWT, Multer, Cloudinary
**AI:** Anthropic Claude, Google Gen AI, Groq
**Biometric:** SimpleWebAuthn
**Deploy:** Vercel (frontend) + Railway (backend)

### URLs
- Frontend: `https://frontend-next-pied.vercel.app`
- Backend: `https://khai-claude-production.up.railway.app`

### API prefixes
`/api/auth`, `/api/products`, `/api/cart`, `/api/orders`, `/api/chat`, `/api/reviews`, `/api/buyer-reviews`, `/api/wishlist`, `/api/offers`, `/api/shop`, `/api/follows`, `/api/users`, `/api/addresses`, `/api/notifications`, `/api/disputes`, `/api/reports`, `/api/complaints`, `/api/feedback`, `/api/promo`, `/api/bundles`, `/api/blocks`, `/api/saved-searches`, `/api/community`, `/api/stories`, `/api/live`, `/api/ekyc`, `/api/webauthn`, `/api/coins`, `/api/ai`, `/api/analytics`, `/api/admin`, `/api/backup`

### DB tables
`users`, `products`, `product_images`, `cart_items`, `wishlist_items`, `orders`, `order_items`, `chat_rooms`, `messages`, `reviews`, `buyer_reviews`, `notifications`, `offers`, `follows`, `addresses`, `disputes`, `reports`, `promo_codes`, `bundles`, `points_log`, `referrals`, `verify_requests`, `saved_searches`, `complaints`, `complaint_messages`, `posts`, `post_comments`, `post_likes`, `stories`, `product_events`, `coin_transactions`, `payment_requests`, `feature_activations`, `webauthn_credentials`, `webauthn_challenges`, `response_logs`, `blocked_users`

### Socket.io events
`join_room`, `send_message`, `new_message`, `live:start`, `live:end`, `live:join`, `live:leave`, `live:product`, `live:chat`, `live:offer`, `live:answer`, `live:ice`, `live:viewer-joined`

### Environment variables
**Backend:** `PORT`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `ANTHROPIC_API_KEY`, `CLOUDINARY_*`
**Frontend:** `NEXT_PUBLIC_API_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_*`, `FACEBOOK_CLIENT_*`
