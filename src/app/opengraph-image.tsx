import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PloiKhong — ตลาดซื้อขายของมือสอง';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// C10 stripe colors
const S = { red: '#e63946', blue: '#1d4ed8', green: '#16a34a', yellow: '#facc15', orange: '#f97316', ink: '#0f172a' };

export default async function OGImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>

        {/* Rainbow Sack SVG — inlined C10 */}
        <svg width="160" height="160" viewBox="0 0 78 78" fill="none">
          <ellipse cx="39" cy="66" rx="24" ry="2" fill={S.ink} opacity=".12" />
          {/* sack body */}
          <path d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z" fill="#fff" stroke={S.ink} strokeWidth="1.4" strokeLinejoin="round"/>
          {/* stripes */}
          <rect x="14" y="24" width="10" height="42" fill={S.red} />
          <rect x="24" y="24" width="10" height="42" fill={S.blue} />
          <rect x="34" y="24" width="10" height="42" fill={S.green} />
          <rect x="44" y="24" width="10" height="42" fill={S.yellow} />
          <rect x="54" y="24" width="10" height="42" fill={S.orange} />
          {/* weave lines */}
          <line x1="14" y1="32" x2="64" y2="32" stroke={S.ink} strokeWidth=".5" opacity=".35"/>
          <line x1="14" y1="40" x2="64" y2="40" stroke={S.ink} strokeWidth=".5" opacity=".35"/>
          <line x1="14" y1="48" x2="64" y2="48" stroke={S.ink} strokeWidth=".5" opacity=".35"/>
          <line x1="14" y1="56" x2="64" y2="56" stroke={S.ink} strokeWidth=".5" opacity=".35"/>
          {/* re-stroke outline */}
          <path d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z" fill="none" stroke={S.ink} strokeWidth="1.4" strokeLinejoin="round"/>
          {/* cinched top */}
          <path d="M22 24 L56 24 L52 14 L26 14 Z" fill="#fff" stroke={S.ink} strokeWidth="1.2" strokeLinejoin="round"/>
          <ellipse cx="39" cy="12.5" rx="4" ry="2.4" fill={S.ink} />
          <path d="M34 11 Q39 4 44 11" stroke={S.ink} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        </svg>

        {/* Brand name — rainbow gradient via individual colored spans */}
        <div style={{ display: 'flex', marginTop: 28, fontSize: 110, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
          <span style={{ color: S.red }}>P</span>
          <span style={{ color: S.red }}>l</span>
          <span style={{ color: S.blue }}>o</span>
          <span style={{ color: S.blue }}>i</span>
          <span style={{ color: S.green }}>K</span>
          <span style={{ color: S.green }}>h</span>
          <span style={{ color: S.yellow }}>o</span>
          <span style={{ color: S.yellow }}>n</span>
          <span style={{ color: S.orange }}>g</span>
        </div>

        {/* Tagline */}
        <div style={{ display: 'flex', fontSize: 26, color: '#8a877e', marginTop: 16, fontWeight: 400, letterSpacing: 1 }}>
          marketplace · ขายของออนไลน์
        </div>

        {/* Stripe accent bar */}
        <div style={{ display: 'flex', marginTop: 32, height: 5, borderRadius: 4, overflow: 'hidden', width: 240 }}>
          <div style={{ flex: 1, background: S.red }} />
          <div style={{ flex: 1, background: S.blue }} />
          <div style={{ flex: 1, background: S.green }} />
          <div style={{ flex: 1, background: S.yellow }} />
          <div style={{ flex: 1, background: S.orange }} />
        </div>

        <div style={{ display: 'flex', position: 'absolute', bottom: 40, color: '#94a3b8', fontSize: 20 }}>
          ploikhong.com
        </div>
      </div>
    ),
    { ...size }
  );
}
