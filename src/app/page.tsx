'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductCard } from '@/components/ProductCard';
import { AuthModal } from '@/components/AuthModal';
import { ProductDetail } from '@/components/ProductDetail';
import { ListingFlow } from '@/components/ListingFlow';
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
    desc: 'โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียม ลงประกาศ จ่ายเฉพาะเมื่อขายสำเร็จ 3%',
    featured: false,
  },
  {
    badge: '002',
    title: 'Boost สินค้า ฿29',
    desc: 'ดันโพสต์ขึ้นฟีดบนสุด 48 ชม. เพิ่มยอดคนเห็น 8-12 เท่า',
    featured: true,
  },
  {
    badge: '003',
    title: 'รับเงินปลอดภัย',
    desc: 'PloiPay ถือเงินไว้จนกว่าผู้ซื้อจะได้รับของ โอนเข้าบัญชีภายใน 1 วันทำการ',
    featured: false,
  },
  {
    badge: '004',
    title: 'ค่าส่งคืนได้',
    desc: 'เคลมค่าจัดส่งคืนได้สูงสุด ฿60 ถ้าใช้ PloiShip ในการส่ง',
    featured: false,
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
  const [listingOpen, setListingOpen] = useState(false);
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
      if (filters.activeCat && filters.activeCat !== 'ทั้งหมด') params.category = filters.activeCat;
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

      {/* Main wrapper */}
      <div style={{ maxWidth: 1440, margin: '0 auto',
        padding: isMobile ? '12px 14px 60px' : '20px 20px 60px',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        {!isMobile && <Sidebar onFilter={setFilters} />}

        {/* Main */}
        <main>

          {/* Promo Banner — gradient, not solid red */}
          <div style={{
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
            }}>฿</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16,
                fontWeight: 700, letterSpacing: '-.01em', marginBottom: 2, color: 'var(--ink)' }}>
                ขายของชิ้นแรกได้ใน 48 ชม. — การันตี
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                ถ้าประกาศ 3 ชิ้นแรกไม่ได้รับข้อความภายใน 2 วัน เราจะ Boost ฟรีให้ทั้งหมด
              </div>
            </div>
            <button
              onClick={openListing}
              style={{
                padding: '9px 16px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontWeight: 500, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              ลงขายฟรี
            </button>
          </div>

          {/* Money Rail — bordered container */}
          <div style={{
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
                style={{
                  background: m.featured ? 'var(--ink)' : 'var(--surface-2)',
                  color: m.featured ? 'var(--bg)' : 'var(--ink)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 16px',
                  border: `1px solid ${m.featured ? 'var(--ink)' : 'var(--line)'}`,
                  display: 'flex', flexDirection: 'column', gap: 4,
                  position: 'relative', overflow: 'hidden',
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
                }}>{m.title}</div>
                <div style={{
                  fontSize: 12, lineHeight: 1.5,
                  color: m.featured ? 'rgba(250,250,247,.72)' : 'var(--ink-2)',
                }}>{m.desc}</div>
              </div>
            ))}
          </div>

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
              display: 'grid', gap: 14,
              gridTemplateColumns: gridView
                ? (isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))')
                : '1fr',
            }}>
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  inWishlist={wishlistIds.has(p.id)}
                  onClick={id => setSelectedProduct(products.find(x => x.id === id))}
                  onWishlist={handleWishlist}
                />
              ))}
            </div>
          )}
          {isMobile && (
            <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
              <button
                onClick={() => setFilterDrawerOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'var(--ink)', color: 'var(--bg)', borderRadius: 999, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,.25)' }}>
                <svg width={16} height={16} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                ตัวกรอง
              </button>
            </div>
          )}
        </main>
      </div>

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
      {listingOpen && <ListingFlow onClose={() => setListingOpen(false)} onPosted={loadProducts} />}
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
        />
      )}
    </>
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
