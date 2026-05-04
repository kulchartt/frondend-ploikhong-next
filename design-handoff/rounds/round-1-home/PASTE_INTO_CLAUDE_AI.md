# 📋 Paste-ready prompt for claude.ai

> **วิธีใช้:**
> 1. เปิด https://claude.ai/new
> 2. **Attach screenshots** ของ https://www.ploikhong.com/ — ทั้ง mobile (390×844) และ desktop (1280×800)
> 3. Copy-paste ทุกอย่างใต้เส้นแบ่งนี้ลงใน chat ทีเดียว
> 4. รอ Claude ทำ Artifacts 3 versions ให้ดู

---

# 🎨 Round 1 — Home Page Redesign for "ปล่อยของ" (PloiKhong)

## Project context

**ปล่อยของ (PloiKhong)** — Thai C2C marketplace where users buy/sell goods online directly with each other (general goods, not just second-hand). Production: https://www.ploikhong.com/

**Revenue model:** Platform sells "premium coin packages" to sellers via Omise (PromptPay/Card). Coins unlock features: boost (top of category), featured (homepage badge), price alerts, auto-relist, analytics pro.

**Target users:**
- **Sellers** — regular individuals (not pro shops), listing items piece by piece
- **Buyers** — looking for local goods, mostly browsing on mobile

## Tech constraints

- **Framework:** Next.js 16 + React 19 + TypeScript (App Router)
- **Styling:** Tailwind CSS v4 + CSS Variables (existing code uses inline `style={{}}` heavily — Tailwind utilities OK if cleaner)
- **Components:** **base-ui** (`@base-ui/react`) + shadcn (limited)
- **Auth:** NextAuth v5
- **Mobile-first** — primary target 390×844 (iPhone 14)
- **Browser support:** modern only (Chrome/Safari/Firefox last 2 versions)
- ⚠️ **NO Material UI / Chakra / Mantine / Radix UI directly** — must work as plain HTML+CSS or React+Tailwind

## Design tokens (must keep)

```css
/* Brand */
--accent:       #1d4ed8;  /* primary blue */
--accent-hover: #1e40af;
--brand-orange: #FF6B35;  /* secondary orange — use more for warmth */

/* Backgrounds — light mode */
--bg:        #f8f9fb;
--surface:   #ffffff;
--surface-2: #f0f2f5;

/* Borders */
--line:   #e2e6ec;
--line-2: #d0d5de;

/* Text */
--ink:   #0f172a;  /* primary */
--ink-2: #55534c;  /* secondary */
--ink-3: #8a877e;  /* hint/muted */

/* Semantic */
--pos:  #0a7a45;
--warn: #a85a00;
--neg:  #b83216;

/* Typography */
--font-th:      IBM Plex Sans Thai     /* body, 15px / 1.5 */
--font-display: Inter Tight            /* headings, letter-spacing -0.01em */
--font-mono:    ui-monospace            /* numbers, codes, eyebrows */

/* Radius */
--radius:    10px
--radius-sm: 6px

/* Brand gradient (PK_GRADIENT) — already exported from /components/PloiLogo */
linear-gradient(135deg, #1667fe 0%, #FF6B35 100%) /* approximate — use existing if known */
```

## Brand voice & vibe

- **Thai casual** — uses ครับ/ค่ะ politely, not formal
- **Trustworthy but friendly** — not luxury, not childish
- **Marketplace energy** — products, prices, images SHOULD POP
- **Mobile usability before aesthetics** — thumb-friendly buttons, readable in sunlight
- **Reference styles I like:** Vinted (UK), Depop (US Gen Z), Kaidee (TH local familiarity)
- **Avoid:** Shopify-admin enterprise, Apple-luxury, dark-mode-by-default

## Layout (current)

```
Desktop (max-width: 1440px, padding: 20px L/R)
┌────────────────────────────────────────────┐
│ Navbar (sticky, ~64px)                     │
├────────────────────────────────────────────┤
│ Sidebar │ Promo Banner (gradient + CTA)    │
│ (240px) ├──────────────────────────────────┤
│ - cats  │ Money Rail (4 cards: 001-004)    │
│ - sub   ├──────────────────────────────────┤
│         │ Toolbar (count + sort + view)    │
│         ├──────────────────────────────────┤
│         │ Product Grid (auto-fill 240px)   │
│         │ ████ ████ ████ ████              │
│         │ ████ ████ ████ ████              │
└─────────┴──────────────────────────────────┘
│ Footer (5 cols: brand + 4 link groups)     │
│ Complaint banner                           │
│ Copyright bottom bar                       │
└────────────────────────────────────────────┘

Mobile
┌──────────────────┐
│ Navbar           │
├──────────────────┤
│ Category chips   │ (sticky, scrollable)
├──────────────────┤
│ Product Grid     │ (2 cols, gap 2px)
│ ████ ████         │
├──────────────────┤
│ Footer (compact) │
├──────────────────┤
│ Bottom tab bar   │ (fixed: home/search/+/chat/account)
└──────────────────┘
```

## Pain points to fix

1. **Promo banner + Money rail** — feels like admin dashboard, not consumer marketplace
2. **Money rail badge "001/002/003/004"** is too geeky/typographic, lacks visual hierarchy
3. **Product grid feels suffocated** — gap is 3px, density too tight; but if you increase gap, products feel lonely in whitespace
4. **Footer is heavy** (5 columns) — looks enterprise B2B
5. **On medium screens (1024-1440px) horizontal space is wasted** — too much inset
6. **No emotional hero** — no draw at top of page
7. (User tried full edge-to-edge by removing max-width 1440 + L/R padding) → felt **"too big"**, products looked oversized

## Ask: render 3 versions in Artifacts

Render at viewport **mobile 390×844** AND **desktop 1280×800** for each version. Use HTML+inline CSS or React JSX with the design tokens above (you can hardcode the hex values — I'll wire to CSS variables when applying back).

### V1 — "Polished baseline" (LOW risk to implement)
**Keep:** max-width 1440px + 20px L/R padding + sidebar 240px + 24px gap
**Polish:**
- Money rail → "info chips" style (slimmer, less card-y), maybe horizontal scroll instead of 4-col grid
- Product grid gap 12-16px (from 3px) — give cards air
- Footer reduce to 3 cols (brand+ความช่วยเหลือ / นโยบาย / ติดต่อ) — drop "ซื้อ-ขาย" col
- Add subtle warmth — use `--brand-orange #FF6B35` for accent on headings/highlights
- Better empty/loading states

### V2 — "Edge-to-edge product grid only" (MEDIUM risk)
**Concept:** Container + sidebar keep their inset, but **product grid bleeds to right edge of viewport**
- Sidebar: padding-left 20px (not flush)
- Promo banner + money rail: stay in 1440 + 20px padded container
- Product grid: starts from sidebar's right edge → flows to viewport's right edge
- Card gap 8-12px, image aspect 1:1 (square)
- Sticky filter pill row at top of grid section
- Cards may be slightly smaller (200-220px width)

### V3 — "Compact density" (BOLD rethink)
**Concept:** Use horizontal space efficiently, simplify chrome
- Sidebar 240px → 200px or **icon-only collapsible** in 1024-1280px viewports
- Cap max-width higher (1920px) to use ultrawide screens, not unbounded
- Product grid: **5 cols** at 1280-1600, **6 cols** at 1600+
- Card width 180-200px (smaller, but more visible at once)
- Promo + Money rail compact — **single horizontal strip** above products instead of stacked
- Footer minimal — **1 row** with brand + 3 link clusters separated by `·`
- More **--brand-orange** energy in CTAs and badges

## Important constraints (all 3 versions)

- ✅ Keep `--accent`, `--brand-orange`, `--ink`, `--surface`, `--line` token usage
- ✅ Mobile-first — render mobile preview for ALL three
- ✅ Touch targets ≥ 44×44px
- ✅ Heading font Inter Tight (display) / Body IBM Plex Sans Thai
- ✅ Light mode default
- ✅ No external UI libraries — plain HTML+CSS or React+Tailwind
- ✅ Components used as black-boxes (don't change their interface): `<Navbar>`, `<Sidebar>`, `<ProductCard>`, `<PloiMark>`, `<PloiThWordmark>`, `PK_GRADIENT`

## After rendering, please summarize

For each version, 3-5 bullets:
- What changed vs current
- Which user persona benefits (mobile-first / desktop power user / both)
- Implementation risk (low/medium/high) + why
- Trade-offs

---

## Reference: current code (layout-relevant only, modals omitted)

```tsx
'use client';

// Imports: React hooks, useSession, Navbar, PloiMark, PloiThWordmark, PK_GRADIENT,
// Sidebar, ProductCard, AuthModal, ProductDetail, ListingFlow, BoostModal,
// MyHub, FilterDrawer, WishlistDrawer, ChatDrawer, ShopDrawer, api lib

const MONEY_RAIL = [
  { badge: '001', title: 'ลงขายฟรีไม่จำกัด',          desc: 'โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียมลงประกาศ',                            featured: false },
  { badge: '002', title: '⭐ สินค้าเด่น',              desc: 'ปักหมุดขึ้นหน้าแนะนำ เพิ่มยอดเห็นสูงสุด 10 เท่า เริ่มเพียง 80 เหรียญ / 7 วัน', featured: true  },
  { badge: '003', title: '🔔 แจ้งเตือนผู้ติดตาม',     desc: 'ส่ง push อัตโนมัติถึงทุกคนที่ติดตามร้าน เมื่อคุณลดราคา — ปิดดีลเร็วขึ้น',     featured: false },
  { badge: '004', title: 'ฟีเจอร์อื่นๆ',              desc: 'Analytics Pro · ลงประกาศอัตโนมัติ · Priority Support และอีกมากมาย',           featured: false, ctaLast: true },
];

const MOBILE_CATS = ['ทั้งหมด', 'มือถือ & แท็บเล็ต', 'คอมพิวเตอร์', 'เครื่องใช้ไฟฟ้า', 'แฟชั่น', 'กล้อง & อุปกรณ์', 'กีฬา & จักรยาน', 'ของสะสม & เกม', 'หนังสือ', 'อื่นๆ'];

export default function HomePage() {
  // state: search, sort, gridView (true=grid, false=list), filters{activeCat, minPrice, maxPrice}, products[], wishlistIds (Set), unreadChat, etc.
  // data: api.getProducts(params), api.getWishlist(token), api.getUnreadCount(token)

  return (
    <>
      <Navbar onSearch onOpenAuth onResetPassword onOpenListing unreadChat onOpenChat onOpenHub />

      {/* Mobile category chips bar */}
      {isMobile && (
        <div style={{ position:'sticky', top:57, zIndex:90, background:'var(--surface)', borderBottom:'1px solid var(--line)', display:'flex', gap:6, padding:'8px 10px', overflowX:'auto', scrollbarWidth:'none' }}>
          {MOBILE_CATS.map(cat => {
            const isActive = cat === 'ทั้งหมด' ? !activeMobileCat : activeMobileCat === cat;
            return (
              <button key={cat} style={{
                flexShrink:0, padding:'6px 14px', borderRadius:999, border:'none', cursor:'pointer',
                fontSize:13, fontWeight: isActive ? 600 : 400,
                background: isActive ? PK_GRADIENT : 'var(--surface-2)',
                color: isActive ? '#fff' : 'var(--ink)', whiteSpace:'nowrap',
              }}>{cat}</button>
            );
          })}
        </div>
      )}

      {/* Main wrapper */}
      <div style={{
        maxWidth:1440, margin:'0 auto',
        padding: isMobile ? '8px 0 72px' : '20px 20px 60px',
        display:'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
        gap:24, alignItems:'flex-start',
      }}>
        {!isMobile && <Sidebar onFilter={setFilters} />}

        <main>
          {/* Promo banner — desktop only */}
          {!isMobile && (
            <div style={{
              background:'linear-gradient(120deg, var(--surface), var(--surface-2))',
              border:'1px solid var(--line)', borderRadius:'var(--radius)',
              padding:'18px 22px', marginBottom:18,
              display:'flex', alignItems:'center', gap:16,
            }}>
              <div style={{ width:40, height:40, borderRadius:'var(--radius-sm)', background:PK_GRADIENT, color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontFamily:'var(--font-display)', fontSize:18 }}>✦</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700 }}>เรามีฟีเจอร์ที่ช่วยคุณขายของได้ไวอย่างมากมาย</div>
                <div style={{ fontSize:13, color:'var(--ink-2)' }}>สำหรับ account ใหม่ให้ทดลองใช้งานฟรี 7 วัน</div>
              </div>
              <button style={{ padding:'9px 16px', background:PK_GRADIENT, color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontWeight:600, fontSize:14, boxShadow:'0 2px 10px rgba(230,57,70,.3)' }}>
                ทดลองใช้งานฟรี
              </button>
            </div>
          )}

          {/* Money rail — desktop only, 4 cards */}
          {!isMobile && (
            <div style={{ background:'var(--surface)', border:'1px solid var(--line)', borderRadius:14, padding:18, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
              {MONEY_RAIL.map(m => (
                <div key={m.badge} style={{
                  background: m.featured ? '#4b5563' : 'var(--surface-2)',
                  color: m.featured ? '#fff' : 'var(--ink)',
                  borderRadius:'var(--radius)', padding:'14px 16px',
                  border: m.ctaLast ? '1.5px dashed var(--line-2)' : `1px solid ${m.featured ? 'var(--ink)' : 'var(--line)'}`,
                  display:'flex', flexDirection:'column', gap:4, position:'relative', overflow:'hidden', cursor:'pointer',
                }}>
                  <span style={{ position:'absolute', top:10, right:10, fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)', letterSpacing:'.08em', color:'#e63946', textTransform:'uppercase' }}>{m.badge}</span>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>{m.title}</div>
                  <div style={{ fontSize:12, lineHeight:1.5, color: m.featured ? 'rgba(255,255,255,.8)' : 'var(--ink-2)' }}>{m.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, paddingBottom:12, borderBottom:'1px solid var(--line)' }}>
            <div style={{ fontSize:13, color:'var(--ink-2)' }}>
              พบ <strong>{products.length}</strong> รายการ
              {filters.activeCat && filters.activeCat !== 'ทั้งหมด' && <span> · หมวด: {filters.activeCat}</span>}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <select value={sort} style={{ border:'1px solid var(--line)', borderRadius:'var(--radius-sm)', padding:'6px 10px', fontSize:13 }}>
                <option value="newest">ล่าสุด</option>
                <option value="price-asc">ราคา ถูก→แพง</option>
                <option value="price-desc">ราคา แพง→ถูก</option>
                <option value="popular">ยอดนิยม</option>
              </select>
              <div style={{ display:'flex', border:'1px solid var(--line)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
                <button>{/* GridIcon */}</button>
                <button>{/* ListIcon */}</button>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div style={{
            display:'grid', gap: isMobile ? 2 : 3,  // ⚠️ very tight gap
            gridTemplateColumns: gridView ? (isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))') : '1fr',
          }}>
            {products.map(p => <ProductCard key={p.id} product={p} layout={gridView ? 'grid' : 'list'} ... />)}
          </div>
        </main>
      </div>

      {/* Footer — 5 columns */}
      <footer style={{ borderTop:'1px solid var(--line)', background:'var(--surface)', padding:'32px 24px 24px', marginTop:40 }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:40, marginBottom:28 }}>
            {/* Col 1 — Brand: PloiMark logo + "PloiKhong" gradient text + "ตลาดซื้อขายออนไลน์ ของดี ราคาโดน ทุกวัน" */}
            {/* Col 2 — ซื้อ-ขาย: ลงขายสินค้า, ดูสินค้าทั้งหมด, Premium & เหรียญ */}
            {/* Col 3 — ความช่วยเหลือ: /help, /guide, /rules */}
            {/* Col 4 — นโยบาย: /privacy, /terms, /rules, /refund */}
            {/* Col 5 — ติดต่อเรา: /contact (📋), mailto:contact@ploikhong.com (📧) */}
          </div>

          {/* Complaint banner — แดง CTA */}
          <div style={{ background:'var(--surface-2)', border:'1px solid var(--line)', borderRadius:'var(--radius)', padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700 }}>⚠️ พบสินค้าผิดกฎหมายหรือต้องการร้องเรียน?</div>
              <div style={{ fontSize:12, color:'var(--ink-3)' }}>แจ้งทีมงานได้ทันที เราจะตรวจสอบและดำเนินการภายใน 24 ชั่วโมง</div>
            </div>
            <button style={{ padding:'9px 20px', background:'var(--neg)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:700 }}>🚨 ร้องเรียน / แจ้งปัญหา</button>
          </div>

          {/* Bottom bar */}
          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:16, borderTop:'1px solid var(--line)', fontSize:12, color:'var(--ink-3)' }}>
            <span>© 2026 PloiKhong. สงวนลิขสิทธิ์ทุกประการ</span>
            <div style={{ display:'flex', gap:16 }}>
              <a href="/privacy">นโยบายความเป็นส่วนตัว</a>
              <a href="/terms">เงื่อนไขการใช้งาน</a>
              <a href="/rules">กฎข้อบังคับ</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom tab bar — fixed bottom on mobile only */}
      {isMobile && (
        <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:'var(--surface)', borderTop:'1px solid var(--line)', height:58, display:'flex', alignItems:'center' }}>
          <button>หน้าหลัก</button>
          <button>ค้นหา</button>
          <div style={{ flex:1, display:'grid', placeItems:'center' }}>
            <button style={{ width:44, height:44, borderRadius:999, background:PK_GRADIENT, color:'#fff', fontSize:22, fontWeight:700, boxShadow:'0 4px 16px rgba(230,57,70,.4)' }}>+</button>
          </div>
          <button>แชท (badge if unread)</button>
          <button>บัญชี</button>
        </nav>
      )}
    </>
  );
}
```

---

**Now please render 3 Artifacts (V1, V2, V3) and explain trade-offs!** 🎨
