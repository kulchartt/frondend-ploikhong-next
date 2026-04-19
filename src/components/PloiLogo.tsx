// PloiMark — black circle + white ก-glyph path + red diagonal accent line
// Matches design handoff shared.jsx PloiMark exactly

export function PloiMark({ size = 32 }: { size?: number }) {
  const sw = Math.max(4, size * 0.09); // stroke width scales with size
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Black circle */}
      <circle cx="28" cy="28" r="26" fill="var(--ink)" />
      {/* White ก glyph — drawn as path, not text */}
      <path
        d="M18 14 h12 a10 10 0 0 1 0 20 h-8 v10 h-4 z M22 20 v8 h8 a4 4 0 0 0 0 -8 z"
        fill="var(--surface)"
      />
      {/* Red diagonal accent line */}
      <line
        x1="8" y1="46"
        x2="48" y2="34"
        stroke="var(--accent)"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}

// PloiWordmark — mark + "PloiKhong." logotype
// size = text size, markSize = circle size
export function PloiWordmark({ size = 20, markSize = 30 }: { size?: number; markSize?: number }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      letterSpacing: '-.02em',
      fontSize: size,
      color: 'var(--ink)',
      textDecoration: 'none',
    }}>
      <PloiMark size={markSize} />
      <span>
        PloiKhong<span style={{ color: 'var(--accent)' }}>.</span>
      </span>
    </span>
  );
}
