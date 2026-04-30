import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PloiKhong — ตลาดซื้อขายของมือสอง';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const font = await fetch(
    'https://fonts.gstatic.com/s/notosansthai/v21/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1xyN9wd43SofCTQ.woff2'
  ).then(r => r.arrayBuffer()).catch(() => null);

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
          background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: font ? 'NotoSansThai' : 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.5)',
          borderRadius: 99, padding: '6px 18px', marginBottom: 28,
          color: '#c084fc', fontSize: 18, fontWeight: 600,
        }}>
          🛍️ ตลาดซื้อขายของมือสอง
        </div>

        {/* Brand name */}
        <div style={{
          fontSize: 96, fontWeight: 800, color: '#ffffff',
          letterSpacing: -2, lineHeight: 1,
          textShadow: '0 4px 40px rgba(168,85,247,0.6)',
          display: 'flex',
        }}>
          PloiKhong
        </div>

        {/* Thai subtitle */}
        <div style={{
          fontSize: 36, color: '#e2e8f0', marginTop: 20,
          fontWeight: 500, display: 'flex',
        }}>
          ปล่อยของ — ของดี ราคาโดน ทุกวัน
        </div>

        {/* Divider */}
        <div style={{
          width: 80, height: 3, borderRadius: 99, marginTop: 32,
          background: 'linear-gradient(90deg, #a855f7, #ec4899)',
          display: 'flex',
        }} />

        {/* URL */}
        <div style={{
          position: 'absolute', bottom: 36,
          color: 'rgba(255,255,255,0.4)', fontSize: 20,
          display: 'flex',
        }}>
          frontend-next-pied.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      ...(font ? { fonts: [{ name: 'NotoSansThai', data: font, weight: 400 }] } : {}),
    }
  );
}
