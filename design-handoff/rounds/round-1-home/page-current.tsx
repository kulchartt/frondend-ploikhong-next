// Snapshot: src/app/page.tsx (home page) — LAYOUT-RELEVANT SECTIONS ONLY
// Original is 783 lines. This snapshot trims modal markup and helper SVG icons
// so claude.ai can focus on the layout.
//
// Removed for brevity (still in production):
//   - Helper SVG icon components (HomeTabIcon, SearchTabIcon, ChatTabIcon, UserTabIcon, GridIcon, ListIcon)
//     → assume <svg> placeholders for those
//   - Complaint Modal (full overlay form, ~110 lines)
//   - Modal renders (AuthModal, ChatDrawer, WishlistDrawer, FilterDrawer, ProductDetail, ListingFlow, BoostModal, MyHub, ShopDrawer)
//
// Components imported (used as black boxes — designs should match their look):
//   - Navbar (sticky top nav, ~64px height, has logo + search + cart/chat/profile icons)
//   - Sidebar (240px wide, vertical category list)
//   - ProductCard (each card in grid; shows image, title, price, condition badge)
//   - PloiMark (logo mark — colored sack icon)
//   - PloiThWordmark (Thai wordmark "ปล่อยของ")
//
// Tokens (CSS variables already defined in globals.css):
//   --accent       #1d4ed8  (primary blue)
//   --brand-orange #FF6B35
//   --bg           #f8f9fb  --surface  #ffffff  --surface-2  #f0f2f5
//   --line         #e2e6ec  --line-2   #d0d5de
//   --ink          #0f172a  --ink-2    #55534c  --ink-3      #8a877e
//   --pos          #0a7a45  --warn     #a85a00  --neg        #b83216
//   --radius       10px     --radius-sm 6px
//   --font-th      IBM Plex Sans Thai
//   --font-display Inter Tight
//   --font-mono    ui-monospace
//   PK_GRADIENT (constant from PloiLogo) — primary brand gradient

'use client';

import { /* ... */ } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { PloiMark, PloiThWordmark, PK_GRADIENT } from '@/components/PloiLogo';
import { Sidebar } from '@/components/Sidebar';
import { ProductCard } from '@/components/ProductCard';
// ... other imports

// Money rail content shown on desktop above product grid
const MONEY_RAIL = [
  { badge: '001', title: 'ลงขายฟรีไม่จำกัด',          desc: 'โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียมลงประกาศ',                              featured: false, cta: true },
  { badge: '002', title: '⭐ สินค้าเด่น',              desc: 'ปักหมุดขึ้นหน้าแนะนำ เพิ่มยอดเห็นสูงสุด 10 เท่า เริ่มเพียง 80 เหรียญ / 7 วัน', featured: true,  cta: true },
  { badge: '003', title: '🔔 แจ้งเตือนผู้ติดตาม',     desc: 'ส่ง push อัตโนมัติถึงทุกคนที่ติดตามร้าน เมื่อคุณลดราคา — ปิดดีลเร็วขึ้น',     featured: false, cta: true },
  { badge: '004', title: 'ฟีเจอร์อื่นๆ',              desc: 'Analytics Pro · ลงประกาศอัตโนมัติ · Priority Support และอีกมากมาย',           featured: false, cta: true, ctaLast: true },
];

// Mobile category chip values
const MOBILE_CATS = ['ทั้งหมด', 'มือถือ & แท็บเล็ต', 'คอมพิวเตอร์', 'เครื่องใช้ไฟฟ้า', 'แฟชั่น', 'กล้อง & อุปกรณ์', 'กีฬา & จักรยาน', 'ของสะสม & เกม', 'หนังสือ', 'อื่นๆ'];

export default function HomePage() {
  // ... state hooks (search, sort, gridView, filters, products, loading, etc.)
  // ... data loading logic (api.getProducts, api.getWishlist, api.getUnreadCount)

  return (
    <>
      <Navbar /* sticky top: logo + search + cart/chat/profile */ />

      {/* ── Mobile category chips bar (only on mobile) ─────────────────────── */}
      {isMobile && (
        <div style={{
          position: 'sticky', top: 57, zIndex: 90,
          background: 'var(--surface)', borderBottom: '1px solid var(--line)',
          display: 'flex', gap: 6, padding: '8px 10px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {MOBILE_CATS.map(cat => {
            const isActive = cat === 'ทั้งหมด' ? !activeMobileCat : activeMobileCat === cat;
            return (
              <button key={cat}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  background: isActive ? PK_GRADIENT : 'var(--surface-2)',
                  color: isActive ? '#fff' : 'var(--ink)',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main wrapper (key layout!) ──────────────────────────────────────── */}
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: isMobile ? '8px 0 72px' : '20px 20px 60px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
        gap: 24,
        alignItems: 'flex-start',
      }}>

        {/* Sidebar (desktop only) — 240px column with category list */}
        {!isMobile && <Sidebar onFilter={setFilters} />}

        {/* Main content column */}
        <main>

          {/* ── Promo Banner (desktop only) ────────────────────────────────── */}
          {!isMobile && (
            <div style={{
              background: 'linear-gradient(120deg, var(--surface), var(--surface-2))',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '18px 22px',
              marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                background: PK_GRADIENT, color: '#fff',
                display: 'grid', placeItems: 'center',
                fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 18,
                flexShrink: 0,
              }}>✦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                  เรามีฟีเจอร์ที่ช่วยคุณขายของได้ไวอย่างมากมาย
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                  สำหรับ account ใหม่ให้ทดลองใช้งานฟรี 7 วัน
                </div>
              </div>
              <button style={{
                padding: '9px 16px', background: PK_GRADIENT, color: '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(230,57,70,.3)',
              }}>
                ทดลองใช้งานฟรี
              </button>
            </div>
          )}

          {/* ── Money Rail (desktop only) — 4 cards in grid ────────────────── */}
          {!isMobile && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 14, padding: 18,
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14,
              marginBottom: 18,
            }}>
              {MONEY_RAIL.map(m => (
                <div key={m.badge} style={{
                  background: m.featured ? '#4b5563' : 'var(--surface-2)',
                  color: m.featured ? '#fff' : 'var(--ink)',
                  borderRadius: 'var(--radius)', padding: '14px 16px',
                  border: m.ctaLast ? '1.5px dashed var(--line-2)' : `1px solid ${m.featured ? 'var(--ink)' : 'var(--line)'}`,
                  display: 'flex', flexDirection: 'column', gap: 4,
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                }}>
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    fontSize: 10, fontWeight: 700,
                    fontFamily: 'var(--font-mono)', letterSpacing: '.08em',
                    color: '#e63946', textTransform: 'uppercase',
                  }}>{m.badge}</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.5,
                    color: m.featured ? 'rgba(255,255,255,.8)' : 'var(--ink-2)' }}>
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Toolbar (sort + view mode) ─────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--line)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              พบ <strong>{products.length.toLocaleString()}</strong> รายการ
              {filters.activeCat && filters.activeCat !== 'ทั้งหมด' && <span> · หมวด: {filters.activeCat}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select value={sort} style={{
                border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
                padding: '6px 10px', fontSize: 13, background: 'var(--surface)', color: 'var(--ink)',
              }}>
                <option value="newest">ล่าสุด</option>
                <option value="price-asc">ราคา ถูก→แพง</option>
                <option value="price-desc">ราคา แพง→ถูก</option>
                <option value="popular">ยอดนิยม</option>
              </select>
              {/* Grid/list view toggle (joined buttons) */}
              <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button>{/* GridIcon */}</button>
                <button>{/* ListIcon */}</button>
              </div>
            </div>
          </div>

          {/* ── Product Grid ───────────────────────────────────────────────── */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', aspectRatio: '1/1', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>ไม่พบสินค้า</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>ลองปรับตัวกรองหรือคำค้นหาดูครับ</div>
            </div>
          ) : (
            <div style={{
              display: 'grid', gap: isMobile ? 2 : 3,  // ⚠️ very tight gap
              gridTemplateColumns: gridView
                ? (isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))')
                : '1fr',
            }}>
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  layout={gridView ? 'grid' : 'list'}
                  inWishlist={wishlistIds.has(p.id)}
                  onClick={id => setSelectedProduct(/* ... */)}
                  onWishlist={handleWishlist}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Footer (5 columns desktop) ───────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--line)',
        background: 'var(--surface)',
        padding: '32px 24px 24px',
        marginTop: 40,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top row: brand + 4 link columns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, marginBottom: 28 }}>

            {/* Col 1 — Brand */}
            <div style={{ minWidth: 200, flex: '1 1 200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <PloiMark size={44} />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17,
                    background: PK_GRADIENT, backgroundClip: 'text',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>PloiKhong</span>
                  <PloiThWordmark size={11} />
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.7, maxWidth: 220 }}>
                ตลาดซื้อขายออนไลน์<br />ของดี ราคาโดน ทุกวัน
              </div>
            </div>

            {/* Col 2 — ซื้อ-ขาย */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>ซื้อ-ขาย</div>
              {/* "ลงขายสินค้า", "ดูสินค้าทั้งหมด", "Premium & เหรียญ" — buttons triggering modals */}
            </div>

            {/* Col 3 — ความช่วยเหลือ */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>ความช่วยเหลือ</div>
              {/* /help, /guide, /rules — simple anchor links */}
            </div>

            {/* Col 4 — นโยบาย */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>นโยบาย</div>
              {/* /privacy, /terms, /rules, /refund */}
            </div>

            {/* Col 5 — ติดต่อ */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>ติดต่อเรา</div>
              {/* /contact (📋 ข้อมูลผู้ประกอบการ), mailto:contact@ploikhong.com */}
            </div>
          </div>

          {/* Complaint banner */}
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12, marginBottom: 20,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>⚠️ พบสินค้าผิดกฎหมายหรือต้องการร้องเรียน?</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>แจ้งทีมงานได้ทันที เราจะตรวจสอบและดำเนินการภายใน 24 ชั่วโมง</div>
            </div>
            <button style={{
              padding: '9px 20px', background: 'var(--neg)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700,
            }}>
              🚨 ร้องเรียน / แจ้งปัญหา
            </button>
          </div>

          {/* Bottom bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 16, borderTop: '1px solid var(--line)',
            fontSize: 12, color: 'var(--ink-3)',
          }}>
            <span>© 2026 PloiKhong. สงวนลิขสิทธิ์ทุกประการ</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="/privacy">นโยบายความเป็นส่วนตัว</a>
              <a href="/terms">เงื่อนไขการใช้งาน</a>
              <a href="/rules">กฎข้อบังคับ</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile bottom tab bar (mobile only, fixed bottom) ──────────────── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: 'var(--surface)', borderTop: '1px solid var(--line)',
          height: 58, display: 'flex', alignItems: 'center',
        }}>
          <button>{/* HomeTabIcon + "หน้าหลัก" */}</button>
          <button>{/* SearchTabIcon + "ค้นหา" */}</button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button style={{
              width: 44, height: 44, borderRadius: 999,
              background: PK_GRADIENT, color: '#fff', border: 'none',
              fontSize: 22, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(230,57,70,.4)',
            }}>+</button>
          </div>
          <button>{/* ChatTabIcon + "แชท" + unread dot */}</button>
          <button>{/* UserTabIcon + "บัญชี" */}</button>
        </nav>
      )}

      {/* ──── (Modals omitted) — AuthModal, ChatDrawer, WishlistDrawer, FilterDrawer, ProductDetail, ListingFlow, BoostModal, MyHub, ShopDrawer ──── */}
    </>
  );
}
