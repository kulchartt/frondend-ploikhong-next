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

      {/* Row 1: Logo + Search + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 20px', maxWidth: 1400, margin: '0 auto' }}>
        <Link href="/"><PloiWordmark /></Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 720, display: 'flex', gap: 0, border: '1.5px solid var(--line)',
          borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface)' }}>
          <input type="text" placeholder="ค้นหาของมือสอง..."
            onChange={e => onSearch?.(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 14px',
              fontSize: 14, background: 'transparent', color: 'var(--ink)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px',
            borderLeft: '1px solid var(--line)', cursor: 'pointer', color: 'var(--ink-2)', fontSize: 13 }}>
            <span>หมวด: ทั้งหมด</span><ChevronDown size={14} />
          </div>
          <button style={{ padding: '0 16px', background: 'var(--ink)', color: '#fff',
            border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            ค้นหา
          </button>
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { icon: <MessageSquare size={18} />, label: 'แชท', badge: unreadChat, action: onOpenChat },
            { icon: <Heart size={18} />, label: 'ถูกใจ', action: () => onOpenHub?.('buy') },
            { icon: <User size={18} />, label: 'บัญชี', action: session ? () => onOpenHub?.('sell') : onOpenAuth },
            { icon: <ShoppingBag size={18} />, label: 'ซื้อ', action: () => onOpenHub?.('buy') },
            { icon: <Store size={18} />, label: 'ขาย', action: () => onOpenHub?.('sell') },
          ].map(({ icon, label, badge, action }) => (
            <button key={label} onClick={action}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ink-2)', fontSize: 11, position: 'relative', borderRadius: 'var(--radius-sm)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              {icon}
              <span>{label}</span>
              {!!badge && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8,
                  background: 'var(--accent)', borderRadius: '50%' }} />
              )}
            </button>
          ))}

          <button onClick={onOpenListing}
            style={{ marginLeft: 8, padding: '8px 16px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + ลงขาย
          </button>

          {/* User avatar / dropdown when logged in */}
          {session?.user && (
            <div style={{ position: 'relative', marginLeft: 4 }}>
              <button onClick={() => setDropdownOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                  background: 'var(--surface-2)', border: '1.5px solid var(--line)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                {session.user.image ? (
                  <img src={session.user.image} alt="" width={26} height={26}
                    style={{ borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700 }}>{avatarLetter}</div>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', maxWidth: 100,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.user.name?.split(' ')[0]}
                </span>
                <ChevronDown size={13} color="var(--ink-3)" />
              </button>

              {dropdownOpen && (
                <div onClick={() => setDropdownOpen(false)}
                  style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                    background: 'var(--surface)', border: '1.5px solid var(--line)',
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

      {/* Row 2: Subnav */}
      <div style={{ borderTop: '1px solid var(--line)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 0, padding: '0 20px', maxWidth: 1400, margin: '0 auto' }}>
          {SUBNAV.map((item, i) => (
            <button key={item}
              style={{ padding: '10px 14px', background: 'none', border: 'none',
                borderBottom: i === 0 ? '2px solid var(--ink)' : '2px solid transparent',
                fontWeight: i === 0 ? 600 : 400, fontSize: 13, cursor: 'pointer',
                color: i === 0 ? 'var(--ink)' : 'var(--ink-2)', whiteSpace: 'nowrap' }}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
