import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PloiKhong — ตลาดซื้อขายของมือสอง';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
        }}
      >
        {/* Top badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1e1b4b',
          border: '1px solid #4c1d95',
          borderRadius: 50,
          padding: '8px 24px',
          marginBottom: 32,
          color: '#a78bfa',
          fontSize: 22,
          fontWeight: 600,
        }}>
          🛍️  ตลาดซื้อขายของมือสอง
        </div>

        {/* Brand */}
        <div style={{
          display: 'flex',
          fontSize: 100,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: -2,
          lineHeight: 1,
        }}>
          PloiKhong
        </div>

        {/* Tagline */}
        <div style={{
          display: 'flex',
          fontSize: 34,
          color: '#94a3b8',
          marginTop: 20,
          fontWeight: 400,
        }}>
          ปล่อยของ — ของดี ราคาโดน ทุกวัน
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          width: 80,
          height: 4,
          backgroundColor: '#7c3aed',
          borderRadius: 4,
          marginTop: 36,
        }} />

        {/* URL */}
        <div style={{
          display: 'flex',
          position: 'absolute',
          bottom: 40,
          color: '#475569',
          fontSize: 20,
        }}>
          frontend-next-pied.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
