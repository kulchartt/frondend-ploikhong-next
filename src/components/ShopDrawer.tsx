'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

interface ShopDrawerProps {
  sellerId: number;
  onClose: () => void;
  onProductClick: (product: any) => void;
  onMessage?: () => void;
  onOpenAuth?: () => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'ล่าสุด' },
  { value: 'price-asc', label: 'ราคา ถูก→แพง' },
  { value: 'price-desc', label: 'ราคา แพง→ถูก' },
];

export function ShopDrawer({ sellerId, onClose, onProductClick, onMessage, onOpenAuth }: ShopDrawerProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const isMobile = useBreakpoint(768);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);

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

  // Load follow status + follower count
  useEffect(() => {
    api.getFollowerCount(sellerId)
      .then(d => setFollowerCount(d.count))
      .catch(() => {});
    if (token) {
      api.getFollowStatus(sellerId, token)
        .then(d => setFollowing(d.following))
        .catch(() => {});
    }
  }, [sellerId, token]);

  async function handleFollow() {
    if (!token) { onOpenAuth?.(); return; }
    setFollowLoading(true);
    try {
      const res = await api.toggleFollow(sellerId, token);
      setFollowing(res.following);
      setFollowerCount(c => c === null ? null : res.following ? c + 1 : Math.max(0, c - 1));
    } catch {
      // keep current state on error
    } finally {
      setFollowLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q));
    }
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, search, sort]);

  const sellerName = shop?.shop_name || shop?.name || '—';
  const initial = sellerName[0].toUpperCase();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
        zIndex: 250, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center', padding: isMobile ? 0 : 24, overflowY: 'auto',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 720,
          maxHeight: isMobile ? '96vh' : '92vh',
          background: 'var(--bg)', borderRadius: isMobile ? '16px 16px 0 0' : 16,
          overflowY: 'auto', position: 'relative',
          boxShadow: '0 40px 80px rgba(0,0,0,.35)',
          animation: 'shopFade .22s cubic-bezier(.2,.8,.2,1)',
        }}>
        <style>{`@keyframes shopFade { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }`}</style>

        {/* ── Banner ── */}
        <div style={{ position: 'relative', height: isMobile ? 140 : 180, overflow: 'hidden', flexShrink: 0 }}>
          {shop?.shop_banner
            ? <img src={shop.shop_banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))' }} />
          }
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,.9)', border: 'none',
              display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,.2)',
            }}>
            <svg width={18} height={18} viewBox="0 0 24 24" stroke="var(--ink)" fill="none" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        {/* ── Avatar (overlapping banner) ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -48 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            border: '4px solid var(--bg)',
            background: 'var(--surface-2)',
            display: 'grid', placeItems: 'center',
            fontWeight: 700, fontSize: 32, color: 'var(--ink)',
            boxShadow: '0 4px 16px rgba(0,0,0,.15)',
            flexShrink: 0, overflow: 'hidden', position: 'relative',
          }}>
            {shop?.avatar
              ? <img src={shop.avatar} alt={sellerName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : initial
            }
          </div>
        </div>

        {/* ── Name + action buttons ── */}
        <div style={{ textAlign: 'center', padding: '12px 24px 16px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 20 : 24, fontWeight: 700, letterSpacing: '-.015em', marginBottom: 4 }}>
            {loading ? '…' : sellerName}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {shop?.rating > 0 && <span>⭐ {Number(shop.rating).toFixed(1)} · {shop.review_count || 0} รีวิว</span>}
            <span>{products.length} สินค้า</span>
            {followerCount !== null && <span>❤️ {followerCount.toLocaleString()} คนติดตาม</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Follow button */}
            <button
              onClick={handleFollow}
              disabled={followLoading}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                border: following ? '1.5px solid var(--line)' : 'none',
                background: following ? 'var(--surface)' : 'var(--ink)',
                color: following ? 'var(--ink)' : 'var(--bg)',
                fontSize: 13, fontWeight: 600, cursor: followLoading ? 'wait' : 'pointer',
                fontFamily: 'inherit', opacity: followLoading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
              }}>
              {following
                ? <><span>✓</span> กำลังติดตาม</>
                : <><span>+</span> ติดตาม</>
              }
            </button>
            {onMessage && (
              <button
                onClick={() => { onClose(); onMessage(); }}
                style={{
                  padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                  border: 'none', background: '#1877f2',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                ส่งข้อความ
              </button>
            )}
            <button style={{
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--line)', background: 'var(--surface)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--ink-2)',
              fontFamily: 'inherit',
            }}>
              รายงาน
            </button>
          </div>
        </div>

        {/* ── About ── */}
        {(shop?.shop_bio || shop?.location) && (
          <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>เกี่ยวกับ</div>
            {shop?.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                อาศัยอยู่ใน {shop.location}
              </div>
            )}
            {shop?.shop_bio && (
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>{shop.shop_bio}</p>
            )}
          </div>
        )}

        {/* ── Products ── */}
        <div style={{ padding: '16px 24px 32px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
            รายการสินค้าของ {sellerName.split(' ')[0]}
          </div>

          {/* Search + Sort */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={2}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหารายการสินค้า"
                style={{
                  width: '100%', padding: '8px 12px 8px 32px',
                  border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)', fontSize: 13, color: 'var(--ink)',
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                padding: '8px 12px', border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)', background: 'var(--surface)',
                fontSize: 13, color: 'var(--ink)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 10 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
                  <div style={{ aspectRatio: '1/1', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ padding: 8 }}>
                    <div style={{ height: 14, background: 'var(--line)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 11, background: 'var(--line)', borderRadius: 4, width: '70%', animation: 'pulse 1.5s infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 14 }}>{search ? 'ไม่พบสินค้าที่ค้นหา' : 'ยังไม่มีสินค้าในร้านนี้'}</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 10 }}>
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onProductClick(p); onClose(); }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    cursor: 'pointer', textAlign: 'left', borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                  }}>
                  <div style={{
                    aspectRatio: '1/1', borderRadius: 'var(--radius)',
                    background: p.images?.[0]
                      ? `url(${p.images[0]}) center/cover`
                      : 'var(--surface-2)',
                    marginBottom: 6, overflow: 'hidden',
                  }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
                    ฿{Number(p.price).toLocaleString()}
                    {p.original_price && p.original_price > p.price && (
                      <s style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 11, marginLeft: 4 }}>
                        ฿{Number(p.original_price).toLocaleString()}
                      </s>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.4, marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.title}
                  </div>
                  {p.location && (
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{p.location}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
