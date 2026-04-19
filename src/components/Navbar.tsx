'use client';

import { MessageSquare, Heart, User, ShoppingBag, Store, ChevronDown, LogOut } from 'lucide-react';
import { PloiWordmark } from './PloiLogo';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

const SUBNAV = ['สำหรับคุณ', 'ใกล้ฉัน', 'ของใหม่', 'Boost เด่น', 'ส่งฟรี', 'ลดราคา', 'ของสะสม', 'ดีลพนักงาน', 'นัดรับ'];

interface NavbarProps {
  onSearch?: (q: string) => void;
  onOpenAuth?: () => void;
  onOpenChat?: () => void;
  onOpenHub?: (mode: 'buy' | 'sell') => void;
  onOpenListing?: () => void;
  unreadChat?: number;
}

export function Navbar({ onSearch, onOpenAuth, onOpenChat, onOpenHub, onOpenListing, unreadChat = 0 }: NavbarProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarLetter = session?.user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface)',
      borderBottom: '1px solid var(--line)' }}>

      {/* Row 1 — gap:14px, padding:12px 20px, maxWidth:1440 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 20px', maxWidth: 1440, margin: '0 auto' }}>

        <Link href="/"><PloiWordmark /></Link>

        {/* Search — radius-sm, max 640px, border 1px */}
        <div style={{ flex: 1, maxWidth: 640, display: 'flex',
          border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
          overflow: 'hidden', background: 'var(--surface)' }}>
          <input type="text" placeholder="ค้นหาของมือสอง..."
            onChange={e => onSearch?.(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px',
              fontSize: 14, background: 'transparent', color: 'var(--ink)',
              fontFamily: 'inherit' }} />
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

        {/* Right — icon buttons horizontal, gap 4 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          {[
            { icon: <MsgIcon />, label: 'แชท', badge: unreadChat, action: onOpenChat },
            { icon: <HeartIcon />, label: 'ถูกใจ', action: () => onOpenHub?.('buy') },
            { icon: <UserIcon />, label: 'บัญชี', action: session ? () => onOpenHub?.('sell') : onOpenAuth },
            { icon: <BagIcon />, label: 'ซื้อ', action: () => onOpenHub?.('buy') },
            { icon: <StoreIcon />, label: 'ขาย', action: () => onOpenHub?.('sell') },
          ].map(({ icon, label, badge, action }) => (
            <button key={label} onClick={action}
              style={{
                /* HORIZONTAL: icon + text side by side */
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6,
                padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ink-2)', fontSize: 13, position: 'relative',
                borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              {icon}
              {label}
              {!!badge && (
                <span style={{ position: 'absolute', top: 6, right: 8,
                  width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
              )}
            </button>
          ))}

          {/* + ลงขาย — 13px, 9px 16px */}
          <button onClick={onOpenListing}
            style={{ padding: '9px 16px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600,
              fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            + ลงขาย
          </button>

          {/* User avatar dropdown */}
          {session?.user && (
            <div style={{ position: 'relative', marginLeft: 4 }}>
              <button onClick={() => setDropdownOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                  background: 'var(--surface-2)', border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                {session.user.image ? (
                  <img src={session.user.image} alt="" width={24} height={24}
                    style={{ borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff', display: 'grid',
                    placeItems: 'center', fontSize: 11, fontWeight: 700 }}>{avatarLetter}</div>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', maxWidth: 90,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.user.name?.split(' ')[0]}
                </span>
                <ChevronDown size={13} color="var(--ink-3)" />
              </button>

              {dropdownOpen && (
                <div onClick={() => setDropdownOpen(false)}
                  style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    minWidth: 180, zIndex: 200, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{session.user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{session.user.email}</div>
                  </div>
                  {[
                    { label: 'สินค้าของฉัน', icon: <Store size={14} /> },
                    { label: 'การซื้อของฉัน', icon: <ShoppingBag size={14} /> },
                    { label: 'รายการถูกใจ', icon: <Heart size={14} /> },
                  ].map(({ label, icon }) => (
                    <button key={label}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 14px', background: 'none', border: 'none',
                        fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      {icon} {label}
                    </button>
                  ))}
                  <div style={{ height: 1, background: 'var(--line)' }} />
                  <button onClick={() => signOut({ callbackUrl: '/' })}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 14px', background: 'none', border: 'none',
                      fontSize: 13, color: 'var(--neg)', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <LogOut size={14} /> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — subnav: padding 11px 16px, gap 2px, maxWidth 1440 */}
      <div style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)',
        overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: 2, padding: '0 20px',
          maxWidth: 1440, margin: '0 auto' }}>
          {SUBNAV.map((item, i) => (
            <button key={item}
              style={{ padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: i === 0 ? '2px solid var(--ink)' : '2px solid transparent',
                fontWeight: i === 0 ? 600 : 400, fontSize: 13,
                color: i === 0 ? 'var(--ink)' : 'var(--ink-2)', whiteSpace: 'nowrap' }}
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

/* Inline SVG icons — matches design's 16px stroke icons */
const ic: React.CSSProperties = { width: 16, height: 16, display: 'block', flexShrink: 0 };

function MsgIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>;
}
function HeartIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
  </svg>;
}
function UserIcon() {
  return <svg style={ic} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8}>
    <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
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
