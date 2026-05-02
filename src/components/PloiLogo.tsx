// PloiKhong Logo C10 — Big Rainbow Sack
// Source: design-handoff/Logo/Rainbow_sack/LOGO_C_SPEC.md
// Concept: ถุงกระสอบสายรุ้งใบใหญ่ — icon ของตลาดนัด/ของขนกลับบ้านในวัฒนธรรมไทย
// Stripes (fixed, brand asset): แดง → น้ำเงิน → เขียว → เหลือง → ส้ม

// Rainbow gradient CSS string (shared across components)
export const PK_GRADIENT =
  'linear-gradient(90deg, #e63946 0%, #e63946 18%, #1d4ed8 22%, #1d4ed8 38%, #16a34a 42%, #16a34a 58%, #facc15 62%, #facc15 78%, #f97316 82%, #f97316 100%)';

export const PK_COLORS = {
  sackRed:    '#e63946',
  sackBlue:   '#1d4ed8',
  sackGreen:  '#16a34a',
  sackYellow: '#facc15',
  sackOrange: '#f97316',
  ink:        '#0f172a',
  sackBase:   '#ffffff',
};

// ─── Mark ─────────────────────────────────────────────────────────────────────
export function PloiMark({ size = 78, ink = '#0f172a' }: { size?: number; ink?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 78 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PloiKhong"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* shadow under sack */}
      <ellipse cx="39" cy="66" rx="24" ry="2" fill={ink} opacity=".12" />

      <defs>
        <clipPath id="pk-sack-clip">
          <path d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z" />
        </clipPath>
      </defs>

      {/* sack body — white base */}
      <path
        d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z"
        fill="#ffffff"
        stroke={ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* 5 rainbow vertical stripes */}
      <g clipPath="url(#pk-sack-clip)">
        <rect x="14" y="24" width="10" height="42" fill="#e63946" />
        <rect x="24" y="24" width="10" height="42" fill="#1d4ed8" />
        <rect x="34" y="24" width="10" height="42" fill="#16a34a" />
        <rect x="44" y="24" width="10" height="42" fill="#facc15" />
        <rect x="54" y="24" width="10" height="42" fill="#f97316" />
        {/* horizontal weave texture */}
        <line x1="14" y1="32" x2="64" y2="32" stroke={ink} strokeWidth=".5" opacity=".35" />
        <line x1="14" y1="40" x2="64" y2="40" stroke={ink} strokeWidth=".5" opacity=".35" />
        <line x1="14" y1="48" x2="64" y2="48" stroke={ink} strokeWidth=".5" opacity=".35" />
        <line x1="14" y1="56" x2="64" y2="56" stroke={ink} strokeWidth=".5" opacity=".35" />
      </g>

      {/* re-stroke outline on top */}
      <path
        d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z"
        fill="none"
        stroke={ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* cinched top — trapezoid */}
      <path
        d="M22 24 L56 24 L52 14 L26 14 Z"
        fill="#ffffff"
        stroke={ink}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* knot */}
      <ellipse cx="39" cy="12.5" rx="4" ry="2.4" fill={ink} />

      {/* handle loop */}
      <path d="M34 11 Q39 4 44 11" stroke={ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* cinch creases */}
      <line x1="30" y1="22" x2="33" y2="16" stroke={ink} strokeWidth=".5" opacity=".5" />
      <line x1="36" y1="22" x2="37" y2="16" stroke={ink} strokeWidth=".5" opacity=".5" />
      <line x1="42" y1="22" x2="41" y2="16" stroke={ink} strokeWidth=".5" opacity=".5" />
      <line x1="48" y1="22" x2="45" y2="16" stroke={ink} strokeWidth=".5" opacity=".5" />
    </svg>
  );
}

// ─── Wordmark (rainbow gradient text) ─────────────────────────────────────────
// "PloiKhong" = rainbow gradient | tagline = IBM Plex Sans Thai, gray
export function PloiWordmark({ size = 22, markSize = 52 }: { size?: number; markSize?: number }) {
  const gradientText: React.CSSProperties = {
    fontFamily: 'var(--font-display, "Inter Tight", system-ui, sans-serif)',
    fontWeight: 800,
    letterSpacing: '-0.015em',
    /* fallback: browsers ที่ไม่ support background-clip:text จะเห็นสีนี้ */
    color: '#e63946',
    /* gradient overlay */
    background: PK_GRADIENT,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: size,
    lineHeight: 1.1,
    display: 'block',
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: markSize * 0.4, textDecoration: 'none' }}>
      <PloiMark size={markSize} />
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={gradientText}>PloiKhong</span>
        <span style={{
          fontFamily: 'var(--font-th, "IBM Plex Sans Thai", system-ui, sans-serif)',
          fontWeight: 400,
          fontSize: size * 0.52,
          color: '#8a877e',
          letterSpacing: '0.01em',
          lineHeight: 1.3,
          marginTop: 1,
        }}>
          marketplace · ขายของออนไลน์
        </span>
      </span>
    </span>
  );
}
