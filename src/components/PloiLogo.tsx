export function PloiLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#111110" />
      <text x="16" y="22" textAnchor="middle" fill="white"
        style={{ fontSize: 18, fontFamily: 'IBM Plex Sans Thai, sans-serif', fontWeight: 700 }}>
        ก
      </text>
      <rect x="22" y="8" width="3" height="16" rx="1.5" fill="#ff2d1f" />
    </svg>
  );
}

export function PloiWordmark() {
  return (
    <div className="flex items-center gap-2">
      <PloiLogo size={28} />
      <span style={{
        fontFamily: 'Inter Tight, sans-serif',
        fontWeight: 700,
        fontSize: 18,
        color: 'var(--ink)',
        letterSpacing: '-0.02em',
      }}>
        PloiKhong<span style={{ color: 'var(--accent)' }}>.</span>
      </span>
    </div>
  );
}
