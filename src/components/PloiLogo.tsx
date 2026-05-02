// PloiKhongLogo — Logo C "Ground Mat" (แผ่ผ้าวางพื้น)
// ผ้าปูพื้นในตลาดนัด: MacBook / iPhone / กระเป๋าสายรุ้ง + เหรียญ ฿
// Source: LOGO_C_SPEC.md

export function PloiMark({ size = 78 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}>
      {/* ground line */}
      <line x1="6" y1="64" x2="72" y2="64" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
      {/* mat (ผ้าปูพื้น) */}
      <path d="M10 60 L68 60 L62 50 L16 50 Z" fill="#1667fe"/>
      <path d="M22 50 L18 60" stroke="#ffffff" strokeWidth="1" opacity=".75"/>
      <path d="M34 50 L32 60" stroke="#ffffff" strokeWidth="1" opacity=".75"/>
      <path d="M46 50 L48 60" stroke="#ffffff" strokeWidth="1" opacity=".75"/>
      <path d="M58 50 L62 60" stroke="#ffffff" strokeWidth="1" opacity=".75"/>

      {/* MacBook (open clamshell) */}
      <path d="M13 50 L31 50 L30 47 L14 47 Z" fill="#ffffff" stroke="#0f172a" strokeWidth=".35" strokeLinejoin="round"/>
      <rect x="19" y="48.2" width="6" height="1.2" rx=".3" fill="#0f172a" opacity=".25"/>
      <path d="M14.5 47 L29.5 47 L29.5 40.5 Q29.5 39.5 28.5 39.5 L15.5 39.5 Q14.5 39.5 14.5 40.5 Z"
            fill="#ffffff" stroke="#0f172a" strokeWidth=".35" strokeLinejoin="round"/>
      <rect x="15.5" y="40.5" width="13" height="6" rx=".5" fill="#001eff" opacity=".85"/>
      <line x1="14" y1="47" x2="30" y2="47" stroke="#0f172a" strokeWidth=".35" opacity=".8"/>

      {/* iPhone */}
      <rect x="34" y="40" width="10" height="13" rx="2" fill="#004bfa" stroke="#0f172a" strokeWidth=".35"/>
      <rect x="34.5" y="40.5" width="9" height="12" rx="1.6" fill="#ffffff"/>
      <rect x="37.8" y="41.4" width="2.4" height=".9" rx=".45" fill="#0f172a"/>
      <line x1="44" y1="44" x2="44" y2="47" stroke="#0f172a" strokeWidth=".5" strokeLinecap="round"/>

      {/* Rainbow Sack (ถุงกระสอบสายรุ้ง) */}
      <defs>
        <clipPath id="sackClip">
          <path d="M50 40 L64 40 L64 50 L50 50 Z"/>
        </clipPath>
      </defs>
      <rect x="50" y="40" width="14" height="10" fill="#ffffff" stroke="#0f172a" strokeWidth=".35"/>
      <g clipPath="url(#sackClip)">
        <rect x="50"   y="40" width="3.5" height="10" fill="#e63946"/>
        <rect x="53.5" y="40" width="3.5" height="10" fill="#1d4ed8"/>
        <rect x="57"   y="40" width="3.5" height="10" fill="#16a34a"/>
        <rect x="60.5" y="40" width="3.5" height="10" fill="#facc15"/>
        <line x1="50" y1="42.5" x2="64" y2="42.5" stroke="#0f172a" strokeWidth=".25" opacity=".4"/>
        <line x1="50" y1="45"   x2="64" y2="45"   stroke="#0f172a" strokeWidth=".25" opacity=".4"/>
        <line x1="50" y1="47.5" x2="64" y2="47.5" stroke="#0f172a" strokeWidth=".25" opacity=".4"/>
      </g>
      <path d="M53 40 L61 40 L60 37 L54 37 Z" fill="#ffffff" stroke="#0f172a" strokeWidth=".35" strokeLinejoin="round"/>
      <ellipse cx="57" cy="36.5" rx="1.6" ry=".9" fill="#0f172a" opacity=".85"/>
      <path d="M55.5 36 Q57 33.5 58.5 36" stroke="#0f172a" strokeWidth=".7" fill="none" strokeLinecap="round"/>

      {/* Coin ฿ */}
      <circle cx="39" cy="26" r="8" fill="#ff3333"/>
      <text x="39" y="30" textAnchor="middle" fontFamily="Inter Tight, sans-serif" fontWeight="800" fontSize="9" fill="#fff">฿</text>
    </svg>
  );
}

// PloiWordmark — mark + "PloiKhong" + accent "Marketplace"
// Colors hardcoded from LOGO_C_SPEC.md: ink=#0f172a, accent c2=var(--brand-orange, #FF6B35)
export function PloiWordmark({ size = 22, markSize = 52 }: { size?: number; markSize?: number }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      letterSpacing: '-.02em',
      fontSize: size,
      textDecoration: 'none',
    }}>
      <PloiMark size={markSize} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ color: '#0f172a', fontWeight: 800, letterSpacing: '-.03em' }}>PloiKhong</span>
        <span style={{ color: 'var(--brand-orange, #FF6B35)', fontSize: size * 0.58, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>Marketplace</span>
      </span>
    </span>
  );
}
