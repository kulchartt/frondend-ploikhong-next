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
          backgroundColor: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo mark — Logo C SVG inlined */}
        <svg width="130" height="130" viewBox="0 0 78 78" fill="none">
          <line x1="6" y1="64" x2="72" y2="64" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 60 L68 60 L62 50 L16 50 Z" fill="#1667fe"/>
          <path d="M22 50 L18 60" stroke="#ffffff" strokeWidth="1" opacity=".75"/>
          <path d="M34 50 L32 60" stroke="#ffffff" strokeWidth="1" opacity=".75"/>
          <path d="M46 50 L48 60" stroke="#ffffff" strokeWidth="1" opacity=".75"/>
          <path d="M58 50 L62 60" stroke="#ffffff" strokeWidth="1" opacity=".75"/>
          {/* MacBook */}
          <path d="M13 50 L31 50 L30 47 L14 47 Z" fill="#ffffff" stroke="#0f172a" strokeWidth=".35" strokeLinejoin="round"/>
          <rect x="19" y="48.2" width="6" height="1.2" rx=".3" fill="#0f172a" opacity=".25"/>
          <path d="M14.5 47 L29.5 47 L29.5 40.5 Q29.5 39.5 28.5 39.5 L15.5 39.5 Q14.5 39.5 14.5 40.5 Z" fill="#ffffff" stroke="#0f172a" strokeWidth=".35" strokeLinejoin="round"/>
          <rect x="15.5" y="40.5" width="13" height="6" rx=".5" fill="#001eff" opacity=".85"/>
          <line x1="14" y1="47" x2="30" y2="47" stroke="#0f172a" strokeWidth=".35" opacity=".8"/>
          {/* iPhone */}
          <rect x="34" y="40" width="10" height="13" rx="2" fill="#004bfa" stroke="#0f172a" strokeWidth=".35"/>
          <rect x="34.5" y="40.5" width="9" height="12" rx="1.6" fill="#ffffff"/>
          <rect x="37.8" y="41.4" width="2.4" height=".9" rx=".45" fill="#0f172a"/>
          <line x1="44" y1="44" x2="44" y2="47" stroke="#0f172a" strokeWidth=".5" strokeLinecap="round"/>
          {/* Rainbow Sack */}
          <rect x="50" y="40" width="14" height="10" fill="#ffffff" stroke="#0f172a" strokeWidth=".35"/>
          <rect x="50" y="40" width="3.5" height="10" fill="#e63946"/>
          <rect x="53.5" y="40" width="3.5" height="10" fill="#1d4ed8"/>
          <rect x="57" y="40" width="3.5" height="10" fill="#16a34a"/>
          <rect x="60.5" y="40" width="3.5" height="10" fill="#facc15"/>
          <path d="M53 40 L61 40 L60 37 L54 37 Z" fill="#ffffff" stroke="#0f172a" strokeWidth=".35" strokeLinejoin="round"/>
          <ellipse cx="57" cy="36.5" rx="1.6" ry=".9" fill="#0f172a" opacity=".85"/>
          <path d="M55.5 36 Q57 33.5 58.5 36" stroke="#0f172a" strokeWidth=".7" fill="none" strokeLinecap="round"/>
          {/* Coin */}
          <circle cx="39" cy="26" r="8" fill="#ff3333"/>
          <text x="39" y="30" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="9" fill="#fff">฿</text>
        </svg>

        {/* Brand name */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, marginTop: 28 }}>
          <span style={{ fontSize: 96, fontWeight: 800, color: '#0f172a', letterSpacing: -3, lineHeight: 1 }}>
            PloiKhong
          </span>
        </div>

        {/* Marketplace label */}
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#FF6B35', letterSpacing: 6, textTransform: 'uppercase', marginTop: 8 }}>
          MARKETPLACE
        </div>

        {/* Tagline */}
        <div style={{ display: 'flex', fontSize: 28, color: '#64748b', marginTop: 24, fontWeight: 400 }}>
          ของดี ราคาโดน ทุกวัน
        </div>

        {/* Bottom accent line */}
        <div style={{ display: 'flex', width: 80, height: 4, backgroundColor: '#1667fe', borderRadius: 4, marginTop: 36 }} />

        {/* URL */}
        <div style={{ display: 'flex', position: 'absolute', bottom: 40, color: '#94a3b8', fontSize: 20 }}>
          ploikhong.com
        </div>
      </div>
    ),
    { ...size }
  );
}
