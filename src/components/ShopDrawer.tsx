'use client';

import { useState, useEffect } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

const TIER_LABEL: Record<string, string> = {
  bronze: '🥉 Bronze', silver: '🥈 Silver', gold: '🥇 Gold', diamond: '💎 Diamond',
};
const TIER_COLOR: Record<string, string> = {
  bronze: '#cd7f32', silver: '#9e9e9e', gold: '#f5a623', diamond: '#5b8dee',
};

interface ShopDrawerProps {
  sellerId: number;
  onClose: () => void;
  onProductClick: (product: any) => void;
}

export function ShopDrawer({ sellerId, onClose, onProductClick }: ShopDrawerProps) {
  const isMobile = useBreakpoint(768);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getShop(sellerId),
      api.getProductsBySeller(sellerId),
    ]).then(([shopData, prods]) => {
      setShop(shopData);
      setProducts(prods);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [sellerId]);

  const initial = (shop?.shop_name || shop?.name || 'S')[0].toUpperCase();
  const tier = shop?.shop_tier || 'bronze';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        zIndex: 250, display: 'flex', justifyContent: 'flex-end',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: isMobile ? '100%' : 480,
          height: '100%', background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-20px 0 60px rgba(0,0,0,.2)',
          animation: 'slideInRight .22s cubic-bezier(.2,.8,.2,1)',
        }}>
        <style>{`@keyframes slideInRight { from { transform:translateX(100%) } to { transform:none } }`}</style>

        {/* Banner */}
        <div style={{
          height: 130, flexShrink: 0, position: 'relative', overflow: 'hidden',
          background: shop?.shop_banner
            ? `url(${shop.shop_banner}) center/cover`
            : 'linear-gradient(135deg, var(--surface-2), var(--surface))',
          borderBottom: '1px solid var(--line)',
        }}>
          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,.88)', border: '1px solid var(--line)',
            display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 2,
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" stroke="var(--ink)" fill="none" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>

          {/* Avatar */}
          <div style={{
            position: 'absolute', bottom: -28, left: 24,
            width: 60, height: 60, borderRadius: '50%',
            border: '3px solid var(--bg)',
            background: shop?.avatar ? `url(${shop.avatar}) center/cover` : 'var(--surface)',
            display: 'grid', placeItems: 'center',
            fontWeight: 700, fontSize: 22, color: 'var(--ink)',
            boxShadow: '0 2px 12px rgba(0,0,0,.15)',
          }}>
            {!shop?.avatar && initial}
          </div>
        </div>

        {/* Profile */}
        <div style={{ padding: '36px 24px 16px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-.01em' }}>
                {shop?.shop_name || shop?.name || '—'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                {shop?.is_verified && (
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: 'var(--pos)', color: '#fff', fontWeight: 500 }}>
                    ยืนยันตัวตน
                  </span>
                )}
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 600,
                  background: `${TIER_COLOR[tier]}22`, color: TIER_COLOR[tier], border: `1px solid ${TIER_COLOR[tier]}44`,
                }}>
                  {TIER_LABEL[tier]}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>
                ⭐ {Number(shop?.rating || 0).toFixed(1)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                {shop?.review_count || 0} รีวิว
              </div>
            </div>
          </div>
          {shop?.shop_bio && (
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.6 }}>
              {shop.shop_bio}
            </p>
          )}
          <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            {products.length} สินค้า · ขายไปแล้ว {shop?.sales_count || 0} ชิ้น
          </div>
        </div>

        {/* Products grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1/1', borderRadius: 'var(--radius)', background: 'var(--surface-2)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 14 }}>ยังไม่มีสินค้าในร้านนี้</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onProductClick(p); onClose(); }}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)', overflow: 'hidden',
                    cursor: 'pointer', textAlign: 'left', padding: 0,
                  }}>
                  <div style={{
                    aspectRatio: '1/1',
                    background: p.images?.[0]
                      ? `url(${p.images[0]}) center/cover`
                      : 'var(--surface-2)',
                  }} />
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.title}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                      ฿{Number(p.price).toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
