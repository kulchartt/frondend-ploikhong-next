'use client';

import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    original_price?: number;
    images?: string[];
    location?: string;
    created_at?: string;
    seller_name?: string;
    condition?: string;
    is_boosted?: boolean;
    flash_price?: number;
    status?: string;
    is_featured?: boolean;
  };
  inWishlist?: boolean;
  onWishlist?: (id: number) => void;
  onClick?: (id: number) => void;
  layout?: 'grid' | 'list';
}

const IMG_TINTS = [
  ['#d4a59a','#c8866e'],
  ['#a5c4d4','#7ba8c8'],
  ['#b8d4a5','#8ec87b'],
  ['#d4c4a5','#c8a87b'],
  ['#c4a5d4','#a87bc8'],
  ['#a5d4c4','#7bc8a8'],
  ['#d4d4a5','#c8c87b'],
  ['#c4a5a5','#c87b7b'],
  ['#a5b4d4','#7b8ec8'],
  ['#d4b4a5','#c8987b'],
  ['#b4d4a5','#98c87b'],
  ['#d4a5c4','#c87ba8'],
];

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `${diff} นาทีที่แล้ว`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ชม.ที่แล้ว`;
  return `${Math.floor(diff / 1440)} วันที่แล้ว`;
}

export function ProductCard({ product, inWishlist = false, onWishlist, onClick, layout = 'grid' }: ProductCardProps) {
  const [liked, setLiked] = useState(inWishlist);
  useEffect(() => { setLiked(inWishlist); }, [inWishlist]);
  const [hovered, setHovered] = useState(false);
  const tints = IMG_TINTS[product.id % IMG_TINTS.length];
  const price = product.flash_price || product.price;

  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    setLiked(l => !l);
    onWishlist?.(product.id);
  }

  // ── List layout ───────────────────────────────────────────────────────────
  if (layout === 'list') {
    return (
      <div
        onClick={() => onClick?.(product.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'var(--surface)',
          border: `1px solid ${hovered ? 'var(--ink)' : 'var(--line)'}`,
          borderRadius: 'var(--radius)',
          overflow: 'hidden', cursor: 'pointer',
          transition: 'border-color .18s',
          padding: 10,
        }}
      >
        {/* Thumbnail — fixed 80×80 */}
        <div style={{
          width: 80, height: 80, flexShrink: 0, borderRadius: 8, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg,${tints[0]},${tints[1]})`,
        }}>
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {product.is_featured && (
            <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#f59e0b', color: '#fff', fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 999 }}>⭐</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
            {product.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>
              ฿{Number(price).toLocaleString()}
            </span>
            {product.original_price && product.original_price > price && (
              <s style={{ color: 'var(--ink-3)', fontSize: 12 }}>฿{Number(product.original_price).toLocaleString()}</s>
            )}
            {product.flash_price && (
              <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>SALE</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 10 }}>
            {product.condition && <span>{product.condition}</span>}
            {product.location && <span>📍 {product.location.split('·')[0]?.trim()}</span>}
            <span style={{ marginLeft: 'auto' }}>{timeAgo(product.created_at)}</span>
          </div>
        </div>

        {/* Wishlist button */}
        <button onClick={handleWishlist}
          style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width={15} height={15} viewBox="0 0 24 24" strokeWidth={1.8}
            stroke={liked ? '#b83216' : 'var(--ink-3)'} fill={liked ? '#b83216' : 'none'}>
            <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
          </svg>
        </button>
      </div>
    );
  }

  // ── Grid layout (default) ─────────────────────────────────────────────────
  return (
    <div
      onClick={() => onClick?.(product.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        border: 'none',
        borderRadius: 6,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transition: 'opacity .15s',
        opacity: hovered ? .88 : 1,
      }}
    >
      {/* Image — 4:3 landscape (bigger feel like FB) */}
      <div style={{ position: 'relative', aspectRatio: '4/3', width: '100%',
        background: `linear-gradient(135deg, ${tints[0]} 0%, ${tints[1]} 100%)` }}>
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        {/* Badges top-left */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {product.is_featured && (
            <span style={{ background: '#f59e0b', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 999, letterSpacing: '.05em' }}>
              ⭐ FEATURED
            </span>
          )}
          {product.is_boosted && (
            <span style={{ background: 'linear-gradient(90deg,#111,#333)', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '3px 8px',
              borderRadius: 999, letterSpacing: '.01em', fontFamily: 'var(--font-mono)' }}>BOOST</span>
          )}
          {product.flash_price && (
            <span style={{ background: 'var(--accent)', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>SALE</span>
          )}
        </div>

        {/* Wishlist top-right */}
        <button onClick={handleWishlist}
          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28,
            borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.32)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            backdropFilter: 'blur(4px)', padding: 0 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" strokeWidth={1.8}
            stroke={liked ? '#ff6b6b' : '#fff'} fill={liked ? '#ff6b6b' : 'none'}>
            <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
          </svg>
        </button>

        {/* Price overlay — bottom-left */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '18px 10px 6px 8px',
          background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 100%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)', textShadow: '0 1px 3px rgba(0,0,0,.4)' }}>
            ฿{Number(price).toLocaleString()}
            {product.original_price && product.original_price > price && (
              <s style={{ color: 'rgba(255,255,255,.65)', fontWeight: 400, fontSize: 11, marginLeft: 5 }}>
                ฿{Number(product.original_price).toLocaleString()}
              </s>
            )}
          </span>
          {product.flash_price && (
            <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 999 }}>SALE</span>
          )}
        </div>
      </div>

      {/* Body — title only */}
      <div style={{ padding: '5px 8px 8px' }}>
        <div style={{
          fontSize: 12, fontWeight: 500, lineHeight: 1.35, color: 'var(--ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {product.title}
        </div>
      </div>
    </div>
  );
}
