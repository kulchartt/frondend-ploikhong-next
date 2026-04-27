// หน้าแสดงรายละเอียดสินค้า — Product Detail Page
// แสดงข้อมูลสินค้าตาม ID พร้อมปุ่มติดต่อผู้ขาย

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as api from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contacting, setContacting] = useState(false);

  const id = Number(params?.id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProduct(id)
      .then((p) => {
        setProduct(p);
        setNotFound(false);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = async () => {
    if (!product) return;
    const token = (session as any)?.token;
    if (session && token) {
      setContacting(true);
      try {
        await api.createChatRoom(product.seller_id, product.id, token);
      } catch {
        // ignore — room may already exist
      } finally {
        setContacting(false);
      }
    }
    router.push('/');
  };

  const formatPrice = (price: number) =>
    '฿' + price.toLocaleString('th-TH');

  const mainImage: string | undefined =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : product?.image_url;

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '20px',
        color: 'var(--ink)',
        fontFamily: 'var(--font-mono)',
        textAlign: 'center',
        paddingTop: 80,
      }}>
        กำลังโหลด...
      </div>
    );
  }

  // ─── Not Found ──────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '20px',
        color: 'var(--ink)',
        textAlign: 'center',
        paddingTop: 80,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>
          ไม่พบสินค้านี้
        </h2>
        <p style={{ color: 'var(--ink)', opacity: 0.6, marginBottom: 24 }}>
          สินค้าอาจถูกลบหรือไม่มีอยู่ในระบบ
        </p>
        <button
          onClick={() => router.back()}
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
          }}
        >
          ← กลับ
        </button>
      </div>
    );
  }

  // ─── Product Detail ─────────────────────────────────────────────────────────
  return (
    <div style={{
      maxWidth: 680,
      margin: '0 auto',
      padding: '20px',
      color: 'var(--ink)',
    }}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          background: 'none',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: '6px 14px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--ink)',
          marginBottom: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← กลับ
      </button>

      {/* Main Image */}
      {mainImage && (
        <div style={{
          width: '100%',
          aspectRatio: '4/3',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          background: 'var(--surface)',
          marginBottom: 20,
          border: '1px solid var(--line)',
        }}>
          <img
            src={mainImage}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {product.is_featured && (
          <span style={{
            background: '#fbbf24',
            color: '#78350f',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            padding: '2px 10px',
            borderRadius: 999,
            fontWeight: 600,
          }}>
            ⭐ สินค้าเด่น
          </span>
        )}
        {product.bumped_at && (
          <span style={{
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            padding: '2px 10px',
            borderRadius: 999,
            fontWeight: 600,
          }}>
            🚀 บูสต์แล้ว
          </span>
        )}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 26,
        fontWeight: 700,
        margin: '0 0 10px',
        lineHeight: 1.3,
        color: 'var(--ink)',
      }}>
        {product.title}
      </h1>

      {/* Price */}
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        color: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
        marginBottom: 16,
      }}>
        {formatPrice(product.price)}
      </div>

      {/* Meta: Category & Location */}
      {(product.category || product.location) && (
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          color: 'var(--ink)',
          opacity: 0.7,
        }}>
          {product.category && (
            <span>🏷 {product.category}</span>
          )}
          {product.location && (
            <span>📍 {product.location}</span>
          )}
        </div>
      )}

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', marginBottom: 16 }} />

      {/* Description */}
      {product.description && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink)',
            opacity: 0.55,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            รายละเอียด
          </div>
          <p style={{
            fontSize: 15,
            lineHeight: 1.7,
            margin: 0,
            whiteSpace: 'pre-wrap',
            color: 'var(--ink)',
          }}>
            {product.description}
          </p>
        </div>
      )}

      {/* View Count */}
      {typeof product.view_count === 'number' && (
        <div style={{
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          color: 'var(--ink)',
          opacity: 0.45,
          marginBottom: 24,
        }}>
          👁 {product.view_count.toLocaleString('th-TH')} ครั้งที่เข้าชม
        </div>
      )}

      {/* Contact Button */}
      <button
        onClick={handleContact}
        disabled={contacting}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: contacting ? 'var(--line)' : 'var(--accent)',
          color: contacting ? 'var(--ink)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: 16,
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          cursor: contacting ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s',
        }}
      >
        {contacting ? 'กำลังเปิดแชท...' : 'ติดต่อผู้ขาย'}
      </button>
    </div>
  );
}
