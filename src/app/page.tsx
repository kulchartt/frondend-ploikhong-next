'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ProductCard } from '@/components/ProductCard';
import { AuthModal } from '@/components/AuthModal';
import { LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import * as api from '@/lib/api';

const MONEY_RAIL = [
  { num: '001', title: 'ลงขายฟรีไม่จำกัด', desc: 'โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียม ลงประกาศ จ่ายเฉพาะเมื่อขายสำเร็จ 3%', bg: 'var(--surface-2)' },
  { num: '002', title: 'Boost สินค้า ฿29', desc: 'ดันโพสต์ขึ้นฟีดบนสุด 48 ชม. เพิ่มยอดคนเห็น 8-12 เท่า', bg: 'var(--ink)', color: '#fff' },
  { num: '003', title: 'รับเงินปลอดภัย', desc: 'PloiPay ถือเงินไว้วนกว่าผู้ซื้อจะได้รับของ โอนเข้าบัญชีภายใน 1 วันทำการ', bg: 'var(--surface-2)' },
  { num: '004', title: 'ค่าส่งคืนได้', desc: 'เคลมค่าจัดส่งคืนได้สูงสุด ฿60 ถ้าใช้ PloiShip ในการส่ง', bg: 'var(--surface-2)' },
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gridView, setGridView] = useState(true);
  const [sort, setSort] = useState('newest');
  const [authOpen, setAuthOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
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
  }, [search, sort, filters]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  return (
    <>
      <Navbar
        onSearch={setSearch}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenListing={() => setAuthOpen(true)}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px',
        display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <Sidebar onFilter={setFilters} />

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* Promo Banner */}
          <div style={{ background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)',
            padding: '20px 28px', marginBottom: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800 }}>฿</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>ขายของชิ้นแรกได้ใน 48 ชม. — การันตี</div>
                <div style={{ fontSize: 13, opacity: .85 }}>ทำประกาศ 3 ชิ้นแรกไม่ได้รับข้อความภายใน 2 วัน เราจะ Boost ฟรีให้ทั้งหมด</div>
              </div>
            </div>
            <button style={{ padding: '8px 18px', background: '#fff', color: 'var(--accent)',
              border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ลงขายฟรี
            </button>
          </div>

          {/* Money Rail */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
            {MONEY_RAIL.map(m => (
              <div key={m.num} style={{ background: m.bg || 'var(--surface-2)', color: m.color || 'var(--ink)',
                borderRadius: 'var(--radius)', padding: '14px 16px', position: 'relative',
                border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: .4, marginBottom: 6,
                  fontFamily: 'var(--font-mono)' }}>{m.num}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{m.title}</div>
                <div style={{ fontSize: 11, opacity: .65, lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              พบ <strong>{products.length}</strong> รายการ
              {filters.activeCat && filters.activeCat !== 'ทั้งหมด' && ` · หมวด: ${filters.activeCat}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px', fontSize: 13, background: 'var(--surface)',
                  color: 'var(--ink)', cursor: 'pointer' }}>
                <option value="newest">ล่าสุด</option>
                <option value="price-asc">ราคา ถูก→แพง</option>
                <option value="price-desc">ราคา แพง→ถูก</option>
                <option value="popular">ยอดนิยม</option>
              </select>
              <button onClick={() => setGridView(true)}
                style={{ padding: 7, border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)',
                  background: gridView ? 'var(--ink)' : 'var(--surface)', cursor: 'pointer',
                  color: gridView ? '#fff' : 'var(--ink-2)', display: 'flex' }}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setGridView(false)}
                style={{ padding: 7, border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)',
                  background: !gridView ? 'var(--ink)' : 'var(--surface)', cursor: 'pointer',
                  color: !gridView ? '#fff' : 'var(--ink-2)', display: 'flex' }}>
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)',
                  aspectRatio: '4/3', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>ไม่พบสินค้า</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>ลองปรับตัวกรองหรือคำค้นหาดูครับ</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12,
              gridTemplateColumns: gridView ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr' }}>
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  inWishlist={wishlistIds.has(p.id)}
                  onWishlist={id => {
                    setWishlistIds(prev => {
                      const next = new Set(prev);
                      next.has(id) ? next.delete(id) : next.add(id);
                      return next;
                    });
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
