'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { PloiMark, PloiThWordmark, PK_GRADIENT } from '@/components/PloiLogo';
import { Sidebar } from '@/components/Sidebar';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductCard } from '@/components/ProductCard';
import { AuthModal } from '@/components/AuthModal';
import { ProductDetail } from '@/components/ProductDetail';
import { ListingFlow } from '@/components/ListingFlow';
import { BoostModal } from '@/components/BoostModal';
import { MyHub } from '@/components/MyHub';
import { FilterDrawer } from '@/components/FilterDrawer';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { ChatDrawer } from '@/components/ChatDrawer';
import { ShopDrawer } from '@/components/ShopDrawer';
import * as api from '@/lib/api';

const MONEY_RAIL = [
  {
    badge: '001',
    title: 'ลงขายฟรีไม่จำกัด',
    desc: 'โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียมลงประกาศ',
    featured: false,
    cta: true,
  },
  {
    badge: '002',
    title: '⭐ สินค้าเด่น',
    desc: 'ปักหมุดขึ้นหน้าแนะนำ เพิ่มยอดเห็นสูงสุด 10 เท่า เริ่มเพียง 80 เหรียญ / 7 วัน',
    featured: true,
    cta: true,
  },
  {
    badge: '003',
    title: '🔔 แจ้งเตือนผู้ติดตาม',
    desc: 'ส่ง push อัตโนมัติถึงทุกคนที่ติดตามร้าน เมื่อคุณลดราคา — ปิดดีลเร็วขึ้น',
    featured: false,
    cta: true,
  },
  {
    badge: '004',
    title: 'ฟีเจอร์อื่นๆ',
    desc: 'Analytics Pro · ลงประกาศอัตโนมัติ · Priority Support และอีกมากมาย',
    featured: false,
    cta: true,
    ctaLast: true,
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gridView, setGridView] = useState(true);
  const [sort, setSort] = useState('newest');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ type: 'สินค้าผิดกฎหมาย', detail: '', contact: '' });
  const [complaintSent, setComplaintSent] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [listingOpen, setListingOpen] = useState(false);
  const [postBoostProduct, setPostBoostProduct] = useState<any>(null);
  const [hubOpen, setHubOpen] = useState<{ mode: 'sell' | 'buy'; tab?: string } | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialRoomId, setChatInitialRoomId] = useState<number | undefined>();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [shopSellerId, setShopSellerId] = useState<number | null>(null);
  const [unreadChat, setUnreadChat] = useState(0);
  const isMobile = useBreakpoint(768);
  const token: string | undefined = (session as any)?.token;
  const debouncedSearch = useDebounce(search, 400);
  const [activeMobileCat, setActiveMobileCat] = useState<string | undefined>(undefined);

  const MOBILE_CATS = ['ทั้งหมด', 'มือถือ & แท็บเล็ต', 'คอมพิวเตอร์', 'เครื่องใช้ไฟฟ้า', 'แฟชั่น', 'กล้อง & อุปกรณ์', 'กีฬา & จักรยาน', 'ของสะสม & เกม', 'หนังสือ', 'อื่นๆ'];

  function openListing() {
    if (session?.user) setListingOpen(true);
    else setAuthOpen(true);
  }

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (sort) params.sort = sort;
      if (filters.activeCat && filters.activeCat !== 'ทั้งหมด') params.cat = filters.activeCat;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      const data = await api.getProducts(params);
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort, filters]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // open ProductDetail when landing with ?product=ID (e.g. from coins/boosts page)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('product');
    if (!id) return;
    window.history.replaceState({}, '', '/');
    api.getProduct(Number(id)).then(p => setSelectedProduct(p)).catch(() => {});
  }, []);

  // Poll unread chat count every 30s
  useEffect(() => {
    if (!token) { setUnreadChat(0); return; }
    const poll = () => api.getUnreadCount(token).then(d => setUnreadChat(d.unread ?? 0)).catch(() => {});
    poll();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, [token]);

  // Load wishlist from API when logged in
  useEffect(() => {
    if (!token) return;
    api.getWishlist(token)
      .then((items: any[]) => {
        const ids = new Set(items.map((x: any) => x.product_id ?? x.id));
        setWishlistIds(ids as Set<number>);
      })
      .catch(() => {});
  }, [token]);

  async function handleWishlist(id: number) {
    setWishlistIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    if (token) {
      // Track wishlist add (not remove) for analytics
      const wasAdded = !wishlistIds.has(id);
      if (wasAdded) api.trackEvent(id, 'wishlist', token);
      try { await api.toggleWishlist(id, token); } catch {
        // revert on error
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        });
      }
    }
  }

  return (
    <>
      <Navbar
        onSearch={setSearch}
        onOpenAuth={() => { setAuthMode('login'); setAuthOpen(true); }}
        onResetPassword={() => { setAuthMode('reset'); setAuthOpen(true); }}
        onOpenListing={openListing}
        unreadChat={unreadChat}
        onOpenChat={() => { if (!session?.user) { setAuthMode('login'); setAuthOpen(true); return; } setChatOpen(true); setUnreadChat(0); }}
        onOpenHub={(mode, tab) => {
          if (!session?.user) { setAuthMode('login'); setAuthOpen(true); return; }
          setHubOpen({ mode, tab });
        }}
      />

      {/* ── Mobile category chips bar ─────────────────────────────────────────── */}
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
                onClick={() => {
                  const next = cat === 'ทั้งหมด' ? undefined : cat;
                  setActiveMobileCat(next);
                  setFilters((f: any) => ({ ...f, activeCat: next }));
                }}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? PK_GRADIENT : 'var(--surface-2)',
                  color: isActive ? '#fff' : 'var(--ink)',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}>
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Main wrapper */}
      <div style={{ maxWidth: 1440, margin: '0 auto',
        padding: isMobile ? '8px 0 72px' : '20px 20px 60px',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        {!isMobile && <Sidebar onFilter={setFilters} />}

        {/* Main */}
        <main>

          {/* Promo Banner — desktop only */}
          {!isMobile && <div style={{
            background: 'linear-gradient(120deg, var(--surface), var(--surface-2))',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: isMobile ? '14px 16px' : '18px 22px',
            marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)', color: '#fff',
              display: isMobile ? 'none' : 'grid', placeItems: 'center',
              fontWeight: 700, fontFamily: 'var(--font-display)',
              fontSize: 18, flexShrink: 0,
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16,
                fontWeight: 700, letterSpacing: '-.01em', marginBottom: 2, color: 'var(--ink)' }}>
                เรามีฟีเจอร์ที่ช่วยคุณขายของได้ไวอย่างมากมาย
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                สำหรับ account ใหม่ให้ทดลองใช้งานฟรี 7 วัน
              </div>
            </div>
            <button
              onClick={() => { if (session?.user) setHubOpen({ mode: 'sell', tab: 'premium' }); else setAuthOpen(true); }}
              style={{
                padding: '9px 16px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              ทดลองใช้งานฟรี
            </button>
          </div>}

          {/* Money Rail — desktop only */}
          {!isMobile && <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: 18,
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
            gap: 14,
            marginBottom: 18,
          }}>
            {MONEY_RAIL.map(m => (
              <div key={m.badge}
                onClick={() => {
                  if (session?.user) setHubOpen({ mode: 'sell', tab: 'premium' });
                  else setAuthOpen(true);
                }}
                style={{
                  background: m.featured ? 'var(--ink)' : 'var(--surface-2)',
                  color: m.featured ? 'var(--bg)' : 'var(--ink)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 16px',
                  border: (m as any).ctaLast
                    ? '1.5px dashed var(--line-2)'
                    : `1px solid ${m.featured ? 'var(--ink)' : 'var(--line)'}`,
                  display: 'flex', flexDirection: 'column', gap: 4,
                  position: 'relative', overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'opacity .15s',
                }}>
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  fontSize: 10, fontWeight: 700,
                  fontFamily: 'var(--font-mono)', letterSpacing: '.08em',
                  color: m.featured ? 'rgba(255,255,255,.5)' : 'var(--accent)',
                  textTransform: 'uppercase',
                }}>{m.badge}</span>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 15, letterSpacing: '-.01em',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {m.title}
                  {(m as any).ctaLast && <span style={{ fontSize: 13, color: 'var(--accent)' }}>→</span>}
                </div>
                <div style={{
                  fontSize: 12, lineHeight: 1.5,
                  color: m.featured ? 'rgba(250,250,247,.72)' : 'var(--ink-2)',
                }}>{m.desc}</div>
                {(m as any).ctaLast && (
                  <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>
                    ดูทั้งหมด →
                  </div>
                )}
              </div>
            ))}
          </div>}

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--line)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              พบ <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{products.length.toLocaleString()}</strong> รายการ
              {filters.activeCat && filters.activeCat !== 'ทั้งหมด' && (
                <span> · หมวด: {filters.activeCat}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{
                  border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px', fontSize: 13, background: 'var(--surface)',
                  color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                <option value="newest">ล่าสุด</option>
                <option value="price-asc">ราคา ถูก→แพง</option>
                <option value="price-desc">ราคา แพง→ถูก</option>
                <option value="popular">ยอดนิยม</option>
              </select>

              {/* Layout toggle — joined */}
              <div style={{
                display: 'flex', border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)', overflow: 'hidden',
              }}>
                {[
                  { grid: true, icon: <GridIcon /> },
                  { grid: false, icon: <ListIcon /> },
                ].map(({ grid, icon }) => (
                  <button key={String(grid)}
                    onClick={() => setGridView(grid)}
                    style={{
                      padding: '6px 10px', border: 'none', cursor: 'pointer',
                      background: gridView === grid ? 'var(--surface-2)' : 'var(--surface)',
                      color: gridView === grid ? 'var(--ink)' : 'var(--ink-3)',
                      display: 'flex', alignItems: 'center',
                    }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{
                  background: 'var(--surface-2)', borderRadius: 'var(--radius)',
                  aspectRatio: '1/1', animation: 'pulse 1.5s infinite',
                }} />
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
              display: 'grid', gap: isMobile ? 2 : 3,
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
                  onClick={id => setSelectedProduct(products.find(x => x.id === id))}
                  onWishlist={handleWishlist}
                />
              ))}
            </div>
          )}
          {/* Floating filter button — desktop only (replaced by category chips on mobile) */}
          {!isMobile && (
            <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
              <button
                onClick={() => setFilterDrawerOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'var(--accent)', color: '#fff', borderRadius: 999, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(29,78,216,.35)' }}>
                <svg width={16} height={16} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                ตัวกรอง
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--line)',
        background: 'var(--surface)',
        padding: '32px 24px 24px',
        marginTop: 40,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top row: brand + links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, marginBottom: 28 }}>

            {/* Brand */}
            <div style={{ minWidth: 200, flex: '1 1 200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <PloiMark size={44} />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontFamily: 'var(--font-display, "Inter Tight", system-ui, sans-serif)',
                    fontWeight: 800, fontSize: 17, letterSpacing: '-0.015em', lineHeight: 1.1,
                    color: '#e63946',
                    background: PK_GRADIENT, backgroundClip: 'text',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    width: 'fit-content',
                  }}>PloiKhong</span>
                  <PloiThWordmark size={11} />
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.7, maxWidth: 220 }}>
                ตลาดซื้อขายออนไลน์<br />ของดี ราคาโดน ทุกวัน
              </div>
            </div>

            {/* ซื้อ-ขาย */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>ซื้อ-ขาย</div>
              {[
                { label: 'ลงขายสินค้า', action: () => { if (session?.user) setListingOpen(true); else setAuthOpen(true); } },
                { label: 'ดูสินค้าทั้งหมด', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { label: 'Premium & เหรียญ', action: () => { if (session?.user) setHubOpen({ mode: 'sell', tab: 'premium' }); else setAuthOpen(true); } },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 8 }}>
                  <button onClick={item.action} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)', textAlign: 'left', fontFamily: 'inherit' }}>
                    {item.label}
                  </button>
                </div>
              ))}
            </div>

            {/* ความช่วยเหลือ */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>ความช่วยเหลือ</div>
              {[
                { label: 'ศูนย์ช่วยเหลือ',        href: '/help' },
                { label: 'วิธีการใช้งาน',           href: '/guide' },
                { label: 'ความปลอดภัยในการซื้อขาย', href: '/rules' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 8 }}>
                  <a href={item.href} style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>{item.label}</a>
                </div>
              ))}
            </div>

            {/* นโยบาย */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>นโยบาย</div>
              {[
                { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
                { label: 'เงื่อนไขการใช้งาน',       href: '/terms' },
                { label: 'กฎและข้อบังคับ',           href: '/rules' },
                { label: 'นโยบายการคืนสินค้า',       href: '/refund' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 8 }}>
                  <a href={item.href} style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>{item.label}</a>
                </div>
              ))}
            </div>

            {/* ติดต่อ */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>ติดต่อเรา</div>
              {[
                { label: '📧 support@ploikhong.com', href: 'mailto:support@ploikhong.com' },
                { label: '📘 Facebook Page',          href: 'https://facebook.com/ploikhong' },
                { label: '🐦 @ploikhong',             href: 'https://twitter.com/ploikhong' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 8 }}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>{item.label}</a>
                </div>
              ))}
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
            <button
              onClick={() => setComplaintOpen(true)}
              style={{
                padding: '9px 20px', background: 'var(--neg)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              🚨 ร้องเรียน / แจ้งปัญหา
            </button>
          </div>

          {/* Bottom bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 8,
            paddingTop: 16, borderTop: '1px solid var(--line)',
            fontSize: 12, color: 'var(--ink-3)',
          }}>
            <span>© {new Date().getFullYear()} PloiKhong. สงวนลิขสิทธิ์ทุกประการ</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="/privacy" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>นโยบายความเป็นส่วนตัว</a>
              <a href="/terms" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>เงื่อนไขการใช้งาน</a>
              <a href="/rules" style={{ color: 'var(--ink-3)', textDecoration: 'none' }}>กฎข้อบังคับ</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────────── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: 'var(--surface)', borderTop: '1px solid var(--line)',
          height: 58,
          display: 'flex', alignItems: 'center',
        }}>
          {/* หน้าหลัก */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', fontFamily: 'inherit', height: '100%' }}>
            <HomeTabIcon />
            <span style={{ fontSize: 11 }}>หน้าหลัก</span>
          </button>

          {/* ค้นหา */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', fontFamily: 'inherit', height: '100%' }}>
            <SearchTabIcon />
            <span style={{ fontSize: 11 }}>ค้นหา</span>
          </button>

          {/* ➕ center */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={openListing}
              style={{ width: 44, height: 44, borderRadius: 999, background: PK_GRADIENT, color: '#fff', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700, lineHeight: 1, boxShadow: '0 4px 16px rgba(230,57,70,.4)' }}>
              +
            </button>
          </div>

          {/* แชท */}
          <button
            onClick={() => { if (!session?.user) { setAuthMode('login'); setAuthOpen(true); return; } setChatOpen(true); setUnreadChat(0); }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', fontFamily: 'inherit', height: '100%', position: 'relative' }}>
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <ChatTabIcon />
              {!!unreadChat && (
                <span style={{ position: 'absolute', top: -2, right: -4, width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
              )}
            </span>
            <span style={{ fontSize: 11 }}>แชท</span>
          </button>

          {/* บัญชี */}
          <button
            onClick={() => { if (session?.user) setHubOpen({ mode: 'sell' }); else { setAuthOpen(true); setAuthMode('login'); } }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', fontFamily: 'inherit', height: '100%' }}>
            <UserTabIcon />
            <span style={{ fontSize: 11 }}>บัญชี</span>
          </button>
        </nav>
      )}

      {chatOpen && (
        <ChatDrawer
          onClose={() => { setChatOpen(false); setChatInitialRoomId(undefined); }}
          initialRoomId={chatInitialRoomId}
        />
      )}
      {wishlistOpen && (
        <WishlistDrawer
          onClose={() => setWishlistOpen(false)}
          onProductClick={p => setSelectedProduct(p)}
          onRemove={id => setWishlistIds(prev => { const s = new Set(prev); s.delete(id); return s; })}
        />
      )}
      {filterDrawerOpen && (
        <FilterDrawer
          onClose={() => setFilterDrawerOpen(false)}
          onFilter={setFilters}
          initialFilters={filters}
          resultCount={products.length}
        />
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />

      {/* Complaint Modal */}
      {complaintOpen && (
        <div onClick={() => { setComplaintOpen(false); setComplaintSent(false); setComplaintForm({ type: 'สินค้าผิดกฎหมาย', detail: '', contact: '' }); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: 12, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 30px 80px rgba(0,0,0,.3)' }}>
            {complaintSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>รับเรื่องแล้วครับ</div>
                <div style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24 }}>ทีมงานจะตรวจสอบและดำเนินการภายใน 24 ชั่วโมง</div>
                <button onClick={() => { setComplaintOpen(false); setComplaintSent(false); setComplaintForm({ type: 'สินค้าผิดกฎหมาย', detail: '', contact: '' }); }}
                  style={{ padding: '10px 28px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer' }}>
                  ปิด
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🚨 ร้องเรียน / แจ้งปัญหา</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>ทีมงานจะดำเนินการภายใน 24 ชั่วโมง</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>ประเภทปัญหา</div>
                    <select value={complaintForm.type} onChange={e => setComplaintForm(f => ({ ...f, type: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'var(--surface)', color: 'var(--ink)' }}>
                      <option>สินค้าผิดกฎหมาย</option>
                      <option>สินค้าไม่ตรงปก</option>
                      <option>ผู้ใช้ละเมิดกฎ</option>
                      <option>การโกงหรือฉ้อโกง</option>
                      <option>เนื้อหาไม่เหมาะสม</option>
                      <option>อื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>รายละเอียด</div>
                    <textarea value={complaintForm.detail} onChange={e => setComplaintForm(f => ({ ...f, detail: e.target.value }))}
                      placeholder="อธิบายปัญหาที่พบ เช่น ลิงก์สินค้า ชื่อผู้ใช้ หรือรายละเอียดอื่นๆ"
                      rows={4} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>ช่องทางติดต่อกลับ (ไม่บังคับ)</div>
                    <input value={complaintForm.contact} onChange={e => setComplaintForm(f => ({ ...f, contact: e.target.value }))}
                      placeholder="อีเมล หรือเบอร์โทรศัพท์"
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button onClick={() => { setComplaintOpen(false); setComplaintForm({ type: 'สินค้าผิดกฎหมาย', detail: '', contact: '' }); }}
                      style={{ flex: 1, padding: '10px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, cursor: 'pointer' }}>
                      ยกเลิก
                    </button>
                    <button onClick={async () => {
                        if (!complaintForm.detail.trim()) return;
                        setComplaintLoading(true);
                        try {
                          const API = process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app';
                          await fetch(`${API}/api/complaints`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...complaintForm, user_id: (session as any)?.userId || null }),
                          });
                          setComplaintSent(true);
                        } catch { setComplaintSent(true); }
                        finally { setComplaintLoading(false); }
                      }}
                      disabled={!complaintForm.detail.trim() || complaintLoading}
                      style={{ flex: 2, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--neg)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: complaintForm.detail.trim() ? 'pointer' : 'not-allowed', opacity: complaintForm.detail.trim() ? 1 : 0.5 }}>
                      {complaintLoading ? 'กำลังส่ง…' : 'ส่งเรื่องร้องเรียน'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {listingOpen && <ListingFlow onClose={() => setListingOpen(false)} onPosted={loadProducts} onBoostAfterPost={p => setPostBoostProduct(p)} />}
      {postBoostProduct && token && <BoostModal product={postBoostProduct} token={token} onClose={() => setPostBoostProduct(null)} onConfirmed={() => setPostBoostProduct(null)} />}
      {hubOpen && (
        <MyHub
          mode={hubOpen.mode}
          initialTab={hubOpen.tab}
          onClose={() => setHubOpen(null)}
          onNewListing={() => { setHubOpen(null); setListingOpen(true); }}
          onOpenChat={() => { setHubOpen(null); setChatOpen(true); }}
          onViewProduct={(p) => { setHubOpen(null); setSelectedProduct(p); }}
        />
      )}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onViewShop={id => { setSelectedProduct(null); setShopSellerId(id); }}
          onOpenChatDrawer={roomId => {
            setSelectedProduct(null);
            setChatInitialRoomId(roomId);
            setChatOpen(true);
          }}
          onOpenAuth={() => { setAuthMode('login'); setAuthOpen(true); }}
        />
      )}
      {shopSellerId && (
        <ShopDrawer
          sellerId={shopSellerId}
          onClose={() => setShopSellerId(null)}
          onProductClick={p => { setShopSellerId(null); setSelectedProduct(p); }}
          onMessage={() => {
            if (!session?.user) { setAuthMode('login'); setAuthOpen(true); return; }
            setChatOpen(true);
            setUnreadChat(0);
          }}
          onOpenAuth={() => { setAuthMode('login'); setAuthOpen(true); }}
        />
      )}
    </>
  );
}

// ─── Mobile bottom tab icons ─────────────────────────────────────────────────
function HomeTabIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}
function SearchTabIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}
function ChatTabIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function UserTabIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  );
}
