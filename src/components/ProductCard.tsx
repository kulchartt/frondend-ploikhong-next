'use client';

import { Heart } from 'lucide-react';
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
  'linear-gradient(135deg,#d4a59a,#c8866e)',
  'linear-gradient(135deg,#a5c4d4,#7ba8c8)',
  'linear-gradient(135deg,#b8d4a5,#8ec87b)',
  'linear-gradient(135deg,#d4c4a5,#c8a87b)',
  'linear-gradient(135deg,#c4a5d4,#a87bc8)',
  'linear-gradient(135deg,#a5d4c4,#7bc8a8)',
  'linear-gradient(135deg,#d4d4a5,#c8c87b)',
  'linear-gradient(135deg,#c4a5a5,#c87b7b)',
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
  const tint = IMG_TINTS[product.id % IMG_TINTS.length];

  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    setLiked(l => !l);
    onWishlist?.(product.id);
  }

  return (
    <div
      onClick={() => onClick?.(product.id)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3' }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: tint }} />
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {product.is_boosted && (
            <span style={{ background: '#111', color: '#fff', fontSize: 10, fontWeight: 700,
              padding: '2px 6px', borderRadius: 4, letterSpacing: '.5px' }}>BOOST</span>
          )}
          {product.flash_price && (
            <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700,
              padding: '2px 6px', borderRadius: 4 }}>SALE</span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist}
          style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32,
            borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,.15)' }}>
          <Heart size={16} fill={liked ? '#ff2d1f' : 'none'} stroke={liked ? '#ff2d1f' : '#555'} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
          ฿{Number(product.flash_price || product.price).toLocaleString()}
          {product.original_price && (
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-3)',
              textDecoration: 'line-through', marginLeft: 6 }}>
              ฿{Number(product.original_price).toLocaleString()}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', lineHeight: 1.4, marginBottom: 6 }}>
          {product.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', gap: 6 }}>
          {product.location && <span>📍 {product.location}</span>}
          {product.created_at && <span>· {timeAgo(product.created_at)}</span>}
        </div>
      </div>
    </div>
  );
}
