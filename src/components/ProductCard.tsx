'use client';

import { useState } from 'react';

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
  };
  inWishlist?: boolean;
  onWishlist?: (id: number) => void;
  onClick?: (id: number) => void;
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

export function ProductCard({ product, inWishlist = false, onWishlist, onClick }: ProductCardProps) {
  const [liked, setLiked] = useState(inWishlist);
  const [hovered, setHovered] = useState(false);
  const tints = IMG_TINTS[product.id % IMG_TINTS.length];
  const price = product.flash_price || product.price;

  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    setLiked(l => !l);
    onWishlist?.(product.id);
  }

  return (
    <div
      onClick={() => onClick?.(product.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--ink)' : 'var(--line)'}`,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color .18s, transform .18s',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      {/* Image — square 1:1 */}
      <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%',
        background: `linear-gradient(135deg, ${tints[0]} 0%, ${tints[1]} 100%)` }}>
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        {/* Badges top-left */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
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
          style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30,
            borderRadius: '50%', border: '1px solid var(--line)', background: 'rgba(255,255,255,.82)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            backdropFilter: 'blur(6px)', padding: 0 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" strokeWidth={1.8}
            stroke={liked ? '#b83216' : 'var(--ink)'} fill={liked ? '#b83216' : 'none'}>
            <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 14px' }}>
        {/* Title first */}
        <div style={{
          fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4,
          color: 'var(--ink)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: '2.8em',
        }}>
          {product.title}
        </div>

        {/* Price — font-display, 18px */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          letterSpacing: '-.01em', color: 'var(--ink)' }}>
          ฿{Number(price).toLocaleString()}
          {product.original_price && product.original_price > price && (
            <s style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 13, marginLeft: 6 }}>
              ฿{Number(product.original_price).toLocaleString()}
            </s>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>
          <span>{product.location?.split('·')[0]?.trim() ?? ''}</span>
          <span>{timeAgo(product.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
