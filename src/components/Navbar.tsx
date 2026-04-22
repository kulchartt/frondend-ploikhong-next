'use client';

import { ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const SUBNAV = ['สำหรับคุณ', 'ใกล้ฉัน', 'ของใหม่', 'Boost เด่น', 'ส่งฟรี', 'ลดราคา', 'ของสะสม', 'ดีลพนักงาน', 'นัดรับ'];

interface NavbarProps {
  onSearch?: (q: string) => void;
  onOpenAuth?: () => void;
  onResetPassword?: () => void;
  onOpenChat?: () => void;
  onOpenHub?: (mode: 'buy' | 'sell', tab?: string) => void;
  onOpenListing?: () => void;
  unreadChat?: number;
}

export function Navbar({
  onSearch, onOpenAuth, onResetPassword, onOpenChat, onOpenHub, onOpenListing, unreadChat = 0,
}: NavbarProps) {
  const { data: session } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const isMobile = useBreakpoint(768);
  const avatarLetter = session?.user?.name?.[0]?.toUpperCase() ?? '?';

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
  }

  /** Shared style for all column icon-nav buttons */
  function iconBtn(extra?: React.CSSProperties): React.CSSProperties {
    return {
      display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 3,
      padding: isMobile ? '6px 8px' : '6px 10px',
      minWidth: isMobile ? 34 : 44,
      background: 'none', border: 'none', cursor: 'pointer',
      color: 'var(--ink-2)', borderRadius: 'var(--radius-sm)',
      fontFamily: 'inherit',
      ...extra,
    };
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
    lineHeight: 1, letterSpacing: '-.01em', whiteSpace: 'nowrap',
  };

  const hoverOn  = (e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'var(--surface-2)');
  const hoverOff = (e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'none');

  // Main icon-nav items
  const navItems = [
    { icon: <ChatIcon />,  label: 'แชท',   badge: unreadChat, action: onOpenChat },
    { icon: <HeartIcon />, label: 'ถูกใจ', action: () => onOpenHub?.('buy', 'saved') },
    { icon: <BagIcon />,   label: 'ซื้อ',  action: () => onOpenHub?.('buy', 'activity') },
    { icon: <StoreIcon />, label: 'ขาย',  action: () => onOpenHub?.('sell') },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)',
      borderBottom: '1px solid var(--line)' }}>

      {/* ── Row 1 ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14,
        padding: isMobile ? '8px 14px' : '10px 20px', maxWidth: 1440, margin: '0 auto' }}>

        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 22 }}>🛍️</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            PloiKhong
          </span>
        </Link>

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: isMobile ? undefined : 640, display: 'flex',
          border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
          overflow: 'hidden', background: 'var(--surface)' }}>
          <input type="text" placeholder="ค้นหาของมือสอง..."
            onChange={e => onSearch?.(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px',
              fontSize: 14, background: 'transparent', color: 'var(--ink)', fontFamily: 'inherit' }} />
          <div style={{ borderLeft: '1px solid var(--line)', padding: '0 14px',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            หมวด: ทั้งหมด <ChevronDown size={13} />
          </div>
          <button style={{ padding: '0 18px', background: 'var(--ink)', color: 'var(--bg)',
            border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            ค้นหา
          </button>
        </div>

        {/* ── Right section ── order: แชท, ถูกใจ, บัญชี, ซื้อ, ขาย, +ลงขาย ───── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>

          {/* แชท, ถูกใจ */}
          {navItems.slice(0, 2).map(({ icon, label, badge, action }) => (
            <button key={label} onClick={action} style={iconBtn()}
              onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
                {!!badge && (
                  <span style={{ position: 'absolute', top: -2, right: -4,
                    width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
                )}
              </span>
              {!isMobile && <span style={labelStyle}>{label}</span>}
            </button>
          ))}

          {/* ซื้อ, ขาย */}
          {navItems.slice(2).map(({ icon, label, action }) => (
            <button key={label} onClick={action} style={iconBtn()}
              onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </span>
              {!isMobile && <span style={labelStyle}>{label}</span>}
            </button>
          ))}

          {/* ── บัญชี / เข้าสู่ระบบ ──────────────────────────────────────────────── */}
          <div style={{ position: 'relative' }}>
            {!session?.user ? (
              /* Not logged in → Login button only (dark toggle hidden) */
              <button onClick={onOpenAuth} style={iconBtn()}
                onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                <UserIcon />
                {!isMobile && (
                  <span style={{ ...labelStyle, color: 'var(--accent)', fontWeight: 600 }}>
                    เข้าสู่ระบบ
                  </span>
                )}
              </button>
            ) : (
              /* Logged in → Account button + dropdown */
              <>
                <button data-testid="nav-user-btn"
                  onClick={() => setAccountOpen(o => !o)}
                  style={iconBtn()}
                  onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
                  {session.user.image ? (
                    <img src={session.user.image} alt="" width={20} height={20}
                      style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--accent)', color: '#fff', display: 'grid',
                      placeItems: 'center', fontSize: 10, fontWeight: 700 }}>
                      {avatarLetter}
                    </div>
                  )}
                  {!isMobile && <span style={labelStyle}>บัญชี</span>}
                </button>

                {accountOpen && (
                  <div onClick={() => setAccountOpen(false)}
                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                      background: 'var(--surface)', border: '1px solid var(--line)',
                      borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                      minWidth: 200, zIndex: 200, overflow: 'hidden' }}>

                    {/* User info header */}
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', gap: 10 }}>
                      {session.user.image ? (
                        <img src={session.user.image} alt="" width={36} height={36}
                          style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--accent)', color: '#fff', display: 'grid',
                          placeItems: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                          {avatarLetter}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.user.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.user.email}
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    {([
                      { label: 'สินค้าของฉัน',  icon: <DropStoreIcon />, action: () => onOpenHub?.('sell') },
                      { label: 'การซื้อของฉัน', icon: <DropBagIcon />,   action: () => onOpenHub?.('buy') },
                      { label: 'รายการถูกใจ',   icon: <DropHeartIcon />, action: () => onOpenHub?.('buy', 'saved') },
                    ] as { label: string; icon: React.ReactNode; action: () => void }[]).map(({ label, icon, action }) => (
                      <button key={label} onClick={action}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '10px 14px', background: 'none', border: 'none',
                          fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        {icon} {label}
                      </button>
                    ))}

                    <div style={{ height: 1, background: 'var(--line)' }} />

                    {/* Dark mode toggle — stopPropagation so dropdown stays open */}
                    <button
                      data-testid="dark-toggle"
                      onClick={e => { e.stopPropagation(); toggleDark(); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                        fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {dark ? <DropSunIcon /> : <DropMoonIcon />}
                        {dark ? 'โหมดสว่าง' : 'โหมดมืด'}
                      </span>
                      {/* Pill switch */}
                      <span style={{ width: 34, height: 20, borderRadius: 999, position: 'relative',
                        flexShrink: 0, display: 'inline-flex', alignItems: 'center',
                        background: dark ? 'var(--ink)' : 'var(--line-2)', transition: 'background .2s' }}>
                        <span style={{ position: 'absolute', top: 4,
                          left: dark ? 18 : 4, width: 12, height: 12,
                          borderRadius: '50%', background: 'var(--surface)', transition: 'left .2s' }} />
                      </span>
                    </button>

                    <div style={{ height: 1, background: 'var(--line)' }} />

                    {/* Reset password */}
                    <button onClick={() => { setAccountOpen(false); onResetPassword?.(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 14px', background: 'none', border: 'none',
                        fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      <KeyIcon /> เปลี่ยนรหัสผ่าน
                    </button>

                    <div style={{ height: 1, background: 'var(--line)' }} />

                    {/* Logout */}
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 14px', background: 'none', border: 'none',
                        fontSize: 13, color: 'var(--neg)', cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      <LogoutIcon /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Admin button */}
          {(session?.user as any)?.is_admin && (
            <a href="/admin"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: '#0f172a', color: '#f59e0b', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: 'none', cursor: 'pointer' }}>
              🛡️ {!isMobile && 'Admin'}
            </a>
          )}

          {/* + ลงขาย */}
          <button onClick={onOpenListing}
            style={{ padding: isMobile ? '8px 12px' : '9px 16px',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600,
              fontSize: isMobile ? 12 : 13, cursor: 'pointer', whiteSpace: 'nowrap',
              flexShrink: 0, marginLeft: 4, fontFamily: 'inherit' }}>
            + ลงขาย
          </button>
        </div>
      </div>

      {/* ── Row 2 — subnav ─────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)',
        overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: 2, padding: isMobile ? '0 14px' : '0 20px',
          maxWidth: 1440, margin: '0 auto' }}>
          {SUBNAV.map((item, i) => (
            <button key={item}
              style={{ padding: isMobile ? '9px 10px' : '11px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: i === 0 ? '2px solid var(--ink)' : '2px solid transparent',
                fontWeight: i === 0 ? 600 : 400,
                fontSize: isMobile ? 12 : 13,
                color: i === 0 ? 'var(--ink)' : 'var(--ink-2)', whiteSpace: 'nowrap',
                fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = i === 0 ? 'var(--ink)' : 'var(--ink-2)')}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

// ─── SVG icons — 20×20, stroke 1.8 ───────────────────────────────────────────
const ic: React.CSSProperties = { width: 20, height: 20, display: 'block', flexShrink: 0 };
const icSm: React.CSSProperties = { width: 14, height: 14, display: 'block', flexShrink: 0 };

function ChatIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>;
}
function HeartIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
  </svg>;
}
function BagIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M6 6L5 3H2"/>
  </svg>;
}
function StoreIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M3 7h18M6 7v13h12V7M9 11h6"/>
  </svg>;
}
function UserIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
  </svg>;
}
function MoonIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>;
}
function SunIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>;
}
// Dropdown icons (smaller)
function DropStoreIcon() {
  return <svg style={icSm} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M3 7h18M6 7v13h12V7M9 11h6"/>
  </svg>;
}
function DropBagIcon() {
  return <svg style={icSm} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M6 6L5 3H2"/>
  </svg>;
}
function DropHeartIcon() {
  return <svg style={icSm} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
  </svg>;
}
function DropMoonIcon() {
  return <svg style={icSm} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>;
}
function DropSunIcon() {
  return <svg style={icSm} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>;
}
function KeyIcon() {
  return <svg style={icSm} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="M21 8.5l-5 5-2-2M21 8.5l-2-2-2 2"/>
  </svg>;
}
function LogoutIcon() {
  return <svg style={icSm} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>;
}
