'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

interface WishlistDrawerProps {
  onClose: () => void;
  onProductClick: (product: any) => void;
  /** Called when an item is removed so the grid can sync hearts */
  onRemove: (id: number) => void;
}

const IMG_TINTS = [
  ['#d4a59a','#c8866e'],['#a5c4d4','#7ba8c8'],['#b8d4a5','#8ec87b'],
  ['#d4c4a5','#c8a87b'],['#c4a5d4','#a87bc8'],['#a5d4c4','#7bc8a8'],
  ['#d4d4a5','#c8c87b'],['#c4a5a5','#c87b7b'],['#a5b4d4','#7b8ec8'],
  ['#d4b4a5','#c8987b'],['#b4d4a5','#98c87b'],['#d4a5c4','#c87ba8'],
];

export function WishlistDrawer({ onClose, onProductClick, onRemove }: WishlistDrawerProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const isMobile = useBreakpoint(768);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ESC to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const data = await api.getWishlist(token);
      // Normalise: API may return {product: {...}} or the product directly
      const products = (Array.isArray(data) ? data : []).map((x: any) =>
        x.product ? { ...x.product, _wishlistId: x.id } : x
      );
      setItems(products);
    } catch (e: any) {
      setError(e?.message || 'โหลดรายการถูกใจไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function handleRemove(product: any) {
    if (!token) return;
    const id = product.id;
    setRemoving(prev => new Set(prev).add(id));
    try {
      await api.toggleWishlist(id, token);
      setItems(prev => prev.filter(p => p.id !== id));
      onRemove(id);
    } catch {
      // silently restore
    } finally {
      setRemoving(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }

  function formatPrice(n: number) {
    return '฿' + Number(n).toLocaleString();
  }

  function timeAgo(dateStr?: string) {
    if (!dateStr) return '';
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (d === 0) return 'วันนี้';
    if (d === 1) return 'เมื่อวาน';
    return `${d} วันที่แล้ว`;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 250,
        background: 'rgba(0,0,0,.45)',
        display: 'flex', justifyContent: 'flex-end',
      }}>
      <style>{`
        @keyframes hubSlide { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: isMobile ? '100%' : 440,
          height: '100%',
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,.2)',
          animation: 'hubSlide .28s cubic-bezier(.2,.8,.2,1)',
        }}>

        {/* ── Header ── */}
        <div style={{
          padding: '18px 20px 16px',
          background: 'var(--surface)', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}>
              รายการถูกใจ
              {items.length > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, background: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: 999 }}>
                  {items.length}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>
              สินค้าที่คุณกดหัวใจไว้
            </div>
          </div>
          <button onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" stroke="var(--ink)" fill="none" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ margin: '12px 20px 0', padding: '10px 14px', background: 'rgba(184,50,22,.08)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--neg)' }}>
            {error}
          </div>
        )}

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 24px' }}>

          {/* Not logged in */}
          {!token && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>กรุณาเข้าสู่ระบบ</div>
              <div style={{ fontSize: 13 }}>เพื่อดูรายการสินค้าที่กดถูกใจไว้</div>
            </div>
          )}

          {/* Loading */}
          {token && loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 96, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {token && !loading && items.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🤍</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>
                ยังไม่มีรายการถูกใจ
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
                กดไอคอนหัวใจ ❤️ บนสินค้าที่สนใจ<br/>จะบันทึกไว้ที่นี่ให้
              </div>
              <button onClick={onClose}
                style={{ marginTop: 20, padding: '10px 22px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                เลือกดูสินค้า
              </button>
            </div>
          )}

          {/* Items */}
          {token && !loading && items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(p => {
                const tints = IMG_TINTS[p.id % IMG_TINTS.length];
                const imgUrl = p.images?.[0] || p.image_url || null;
                const price = p.flash_price || p.price;
                const isRemoving = removing.has(p.id);

                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--line)',
                      borderRadius: 'var(--radius)', overflow: 'hidden',
                      opacity: isRemoving ? 0.5 : 1, transition: 'opacity .2s',
                      display: 'flex', gap: 0,
                    }}>

                    {/* Thumbnail — clickable */}
                    <div
                      onClick={() => { onProductClick(p); onClose(); }}
                      style={{
                        width: 88, flexShrink: 0, cursor: 'pointer',
                        background: imgUrl
                          ? `url(${imgUrl}) center/cover`
                          : `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                      }}
                    />

                    {/* Info — clickable */}
                    <div
                      onClick={() => { onProductClick(p); onClose(); }}
                      style={{ flex: 1, padding: '12px 14px', cursor: 'pointer', minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500, color: 'var(--ink)',
                        marginBottom: 4, lineHeight: 1.35,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {p.title}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-.01em', marginBottom: 6 }}>
                        {formatPrice(price)}
                        {p.original_price && p.original_price > price && (
                          <s style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-3)', marginLeft: 6 }}>
                            {formatPrice(p.original_price)}
                          </s>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--ink-3)', alignItems: 'center' }}>
                        {p.seller_name && <span>{p.seller_name}</span>}
                        {p.location && <><span>·</span><span>{p.location?.split('·')[0]?.trim()}</span></>}
                        {p.created_at && <><span>·</span><span>{timeAgo(p.created_at)}</span></>}
                      </div>
                    </div>

                    {/* Remove heart button */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px' }}>
                      <button
                        onClick={() => handleRemove(p)}
                        disabled={isRemoving}
                        title="นำออกจากรายการถูกใจ"
                        style={{
                          width: 36, height: 36, borderRadius: '50%',
                          border: '1px solid var(--line)', background: 'rgba(184,50,22,.06)',
                          display: 'grid', placeItems: 'center', cursor: isRemoving ? 'not-allowed' : 'pointer',
                          flexShrink: 0,
                        }}>
                        {isRemoving ? (
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={2}
                            style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                        ) : (
                          <svg width={16} height={16} viewBox="0 0 24 24" strokeWidth={1.8}
                            stroke="#b83216" fill="#b83216">
                            <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer stats (if items exist) ── */}
        {items.length > 0 && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--line)',
            background: 'var(--surface)', fontSize: 12, color: 'var(--ink-3)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{items.length} รายการ · มูลค่ารวม</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>
              ฿{items.reduce((s, p) => s + (p.flash_price || p.price || 0), 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
