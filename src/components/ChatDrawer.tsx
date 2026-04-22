'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

interface ChatDrawerProps {
  onClose: () => void;
  initialRoomId?: number;
}

const IMG_TINTS = [
  ['#d4a59a','#c8866e'],['#a5c4d4','#7ba8c8'],['#b8d4a5','#8ec87b'],
  ['#d4c4a5','#c8a87b'],['#c4a5d4','#a87bc8'],['#a5d4c4','#7bc8a8'],
  ['#d4d4a5','#c8c87b'],['#c4a5a5','#c87b7b'],
];

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Icons
function IconSearch() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={11} cy={11} r={8}/>
      <line x1={21} y1={21} x2={16.65} y2={16.65}/>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1={6} y1={6} x2={18} y2={18}/>
      <line x1={18} y1={6} x2={6} y2={18}/>
    </svg>
  );
}
function IconNewChat() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M12 10v4M10 12h4"/>
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.58a16 16 0 0 0 5.95 5.95l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
function IconVideo() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x={1} y={5} width={15} height={14} rx={2} ry={2}/>
    </svg>
  );
}
function IconInfo() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={10}/>
      <line x1={12} y1={8} x2={12} y2={12}/>
      <line x1={12} y1={16} x2={12.01} y2={16}/>
    </svg>
  );
}
function IconBack() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function IconSend() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1={22} y1={2} x2={11} y2={13}/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
function IconSpin() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
function IconAttach() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 17.2a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  );
}
function IconMute() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      <line x1={1} y1={1} x2={23} y2={23}/>
    </svg>
  );
}
function IconPin() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx={12} cy={10} r={3}/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--pos)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconBlock() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--neg)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={10}/>
      <line x1={4.93} y1={4.93} x2={19.07} y2={19.07}/>
    </svg>
  );
}

export function ChatDrawer({ onClose, initialRoomId }: ChatDrawerProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const myUserId: number | undefined = (session as any)?.userId;
  const isMobile = useBreakpoint(768);
  const isWide = !useBreakpoint(1024); // show right sidebar at ≥1024px

  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all'|'unread'|'pinned'>('all');
  const chatRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Lock scroll + ESC
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRoom && isMobile) setSelectedRoom(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, selectedRoom, isMobile]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  // Load rooms
  useEffect(() => {
    if (!token) { setLoadingRooms(false); return; }
    setLoadingRooms(true);
    api.getChatRooms(token)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setRooms(list);
        if (list.length > 0) {
          // If a specific room was requested (from ProductDetail), open it; else default to first on desktop
          const target = initialRoomId ? list.find((r: any) => r.id === initialRoomId) : null;
          if (target) setSelectedRoom(target);
          else if (window.innerWidth >= 768) setSelectedRoom(list[0]);
        }
      })
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Normalise raw API messages
  const normalise = useCallback((raw: any[], meId?: number) =>
    (Array.isArray(raw) ? raw : []).map(m => ({
      id: m.id,
      who: m.sender_id === meId ? 'me' : 'seller',
      text: m.content ?? m.message ?? '',
      time: m.created_at
        ? new Date(m.created_at).toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' })
        : nowTime(),
    }))
  , []);

  // Load messages for selected room
  useEffect(() => {
    if (!token || !selectedRoom) return;
    setLoadingMsgs(true);
    latestId.current = 0;
    api.getChatMessages(selectedRoom.id, token)
      .then(raw => {
        const normalised = normalise(raw, myUserId);
        setMsgs(normalised);
        if (raw.length) latestId.current = raw[raw.length - 1].id;
      })
      .catch(() => setMsgs([]))
      .finally(() => setLoadingMsgs(false));
  }, [token, selectedRoom, normalise, myUserId]);

  // Poll for new messages every 3s
  useEffect(() => {
    if (!token || !selectedRoom) return;
    pollRef.current = setInterval(async () => {
      try {
        const raw = await api.getChatMessages(selectedRoom.id, token);
        const lastId = raw.length ? raw[raw.length - 1].id : 0;
        if (lastId !== latestId.current) {
          latestId.current = lastId;
          setMsgs(normalise(raw, myUserId));
        }
      } catch {}
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, selectedRoom, normalise, myUserId]);

  async function handleSend(overrideText?: string) {
    const text = overrideText ?? draft.trim();
    if (!text || !token || !selectedRoom) return;
    const optimistic = { id: Date.now(), who: 'me', text, time: nowTime() };
    setMsgs(m => [...m, optimistic]);
    if (!overrideText) setDraft('');
    setSending(true);
    try {
      await api.sendMessage(selectedRoom.id, text, token);
      setRooms(rs => rs.map(r => r.id === selectedRoom.id
        ? { ...r, last_message: text, updated_at: new Date().toISOString() }
        : r
      ));
    } catch {} finally {
      setSending(false);
    }
  }

  async function handleImageUpload(file: File) {
    if (!token || !selectedRoom) return;
    setUploadingImg(true);
    const optimistic = { id: Date.now(), who: 'me', text: '__img__:uploading', time: nowTime() };
    setMsgs(m => [...m, optimistic]);
    try {
      const msg = await api.sendChatImage(selectedRoom.id, file, token);
      const content = msg.content ?? '';
      setMsgs(m => m.map(x => x.id === optimistic.id
        ? { ...x, text: content }
        : x
      ));
      setRooms(rs => rs.map(r => r.id === selectedRoom.id
        ? { ...r, last_message: '📷 รูปภาพ', updated_at: new Date().toISOString() }
        : r
      ));
    } catch {
      setMsgs(m => m.filter(x => x.id !== optimistic.id));
    } finally {
      setUploadingImg(false);
    }
  }

  function insertEmoji(emoji: string) {
    setDraft(d => d + emoji);
    setShowEmoji(false);
  }

  function timeAgo(dateStr?: string) {
    if (!dateStr) return '';
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 1) return 'เมื่อกี้';
    if (d < 60) return `${d} นาที`;
    if (d < 1440) return `${Math.floor(d/60)} ชม.`;
    return `${Math.floor(d/1440)} วัน`;
  }

  const filteredRooms = rooms.filter(r => {
    const name = (r.seller_name ?? r.buyer_name ?? '').toLowerCase();
    const msg = (r.last_message ?? r.product_title ?? '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  // On mobile: show list OR chat (not both)
  const showList = isMobile ? !selectedRoom : true;
  const showChat = isMobile ? !!selectedRoom : true;
  const showRight = !isMobile && isWide && !!selectedRoom;

  // Show the other person's name in the chat header (not the current user)
  const sellerName = selectedRoom
    ? (myUserId === selectedRoom.seller_id
        ? (selectedRoom.buyer_name ?? 'ผู้ซื้อ')
        : (selectedRoom.seller_name ?? 'ผู้ขาย'))
    : '';
  const tints = selectedRoom ? IMG_TINTS[selectedRoom.id % IMG_TINTS.length] : IMG_TINTS[0];

  return (
    <div
      data-testid="chat-drawer"
      style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'chatFadeIn .15s ease' }}>
      <style>{`
        @keyframes chatFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          maxWidth: 1440,
          width: '100%',
          margin: '0 auto',
        }}>

        {/* ── LEFT PANEL: Room list (320px) ── */}
        {showList && (
          <div style={{
            width: isMobile ? '100%' : 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: isMobile ? 'none' : '1px solid var(--line)',
            height: '100%',
            overflow: 'hidden',
            background: 'var(--surface)',
          }}>

            {/* Header */}
            <div style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={onClose}
                style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%', flexShrink: 0 }}
                aria-label="กลับ">
                <IconBack />
              </button>
              <h1 style={{ flex: 1, margin: 0, fontFamily: 'var(--font-th)', fontWeight: 600, fontSize: 17, color: 'var(--ink)' }}>แชท</h1>
              <button style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%' }}>
                <IconNewChat />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '10px 12px 8px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 10, color: 'var(--ink-3)', display: 'flex' }}>
                  <IconSearch />
                </span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ค้นหาในข้อความ"
                  style={{
                    width: '100%', padding: '8px 12px 8px 32px', border: 'none',
                    borderRadius: 20, background: 'var(--surface-2)', fontSize: 13,
                    color: 'var(--ink)', outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '4px 12px 10px', display: 'flex', gap: 6 }}>
              {([['all','ทั้งหมด'],['unread','ยังไม่อ่าน'],['pinned','ปักหมุด']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    padding: '5px 12px', border: 'none', borderRadius: 999, fontSize: 12, fontFamily: 'inherit',
                    cursor: 'pointer', fontWeight: tab === key ? 700 : 400,
                    background: tab === key ? 'var(--ink)' : 'var(--surface-2)',
                    color: tab === key ? 'var(--bg)' : 'var(--ink-2)',
                    transition: '.15s',
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Room list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
              {!token && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>กรุณาเข้าสู่ระบบ</div>
                  <div style={{ fontSize: 13 }}>เพื่อดูข้อความทั้งหมด</div>
                </div>
              )}

              {token && loadingRooms && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-2)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 13, width: '55%', background: 'var(--surface-2)', borderRadius: 4, marginBottom: 6 }} />
                        <div style={{ height: 11, width: '75%', background: 'var(--surface-2)', borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {token && !loadingRooms && filteredRooms.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>ยังไม่มีการสนทนา</div>
                  <div style={{ fontSize: 13 }}>กดแชทกับผู้ขายจากหน้าสินค้า</div>
                </div>
              )}

              {token && !loadingRooms && filteredRooms.map(room => {
                const rtints = IMG_TINTS[room.id % IMG_TINTS.length];
                const isSelected = selectedRoom?.id === room.id;
                // Show the other person's name (not the current user's)
                const other = myUserId === room.seller_id
                  ? (room.buyer_name ?? 'ผู้ซื้อ')
                  : (room.seller_name ?? 'ผู้ขาย');
                const initials = getInitials(other);
                const unreadCount = room.unread_count ?? 0;
                return (
                  <button key={room.id}
                    data-testid={`room-${room.id}`}
                    onClick={() => setSelectedRoom(room)}
                    style={{
                      width: '100%', padding: '10px 12px', border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? '#fff5f5' : 'transparent',
                      borderRadius: 'var(--radius)',
                      display: 'flex', gap: 10, alignItems: 'center',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>

                    {/* Avatar with online dot */}
                    <div style={{ position: 'relative', flexShrink: 0, width: 44, height: 44 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: `linear-gradient(135deg,${rtints[0]},${rtints[1]})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13, color: '#fff', letterSpacing: 0.5,
                      }}>{initials}</div>
                      {/* Online dot */}
                      <div style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#22c55e', border: '2px solid var(--surface)',
                      }} />
                      {/* Product thumbnail */}
                      {room.product_image && (
                        <div style={{
                          position: 'absolute', bottom: -2, right: -2,
                          width: 16, height: 16, borderRadius: 3,
                          background: `url(${room.product_image}) center/cover`,
                          border: '1.5px solid var(--surface)',
                        }} />
                      )}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: unreadCount > 0 ? 700 : 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                        {other}
                      </div>
                      {room.product_title && (
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                          {room.product_title}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {room.last_message ?? 'เริ่มการสนทนา'}
                      </div>
                    </div>

                    {/* Right: time + badge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {timeAgo(room.updated_at ?? room.created_at)}
                      </span>
                      {unreadCount > 0 && (
                        <span style={{
                          minWidth: 18, height: 18, borderRadius: 999, background: 'var(--neg)',
                          color: '#fff', fontSize: 10, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '0 5px',
                        }}>{unreadCount}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CENTER PANEL: Chat ── */}
        {showChat && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--surface)', minWidth: 0 }}>

            {selectedRoom ? (
              <>
                {/* Chat header */}
                <div style={{ padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {isMobile && (
                    <button onClick={() => setSelectedRoom(null)}
                      aria-label="กลับรายการแชท"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--ink-2)', display: 'flex', flexShrink: 0 }}>
                      <IconBack />
                    </button>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sellerName}
                    </div>
                    <div style={{ fontSize: 12, color: '#22c55e', marginTop: 1 }}>ออนไลน์อยู่</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <button style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%' }}>
                      <IconPhone />
                    </button>
                    <button style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%' }}>
                      <IconVideo />
                    </button>
                    <button style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%' }}>
                      <IconInfo />
                    </button>
                  </div>
                </div>

                {/* Product info bar */}
                {(selectedRoom.product_title || selectedRoom.product_image) && (
                  <div style={{
                    padding: '10px 16px', borderBottom: '1px solid var(--line)',
                    background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                      background: selectedRoom.product_image
                        ? `url(${selectedRoom.product_image}) center/cover`
                        : `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                      border: '1px solid var(--line)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedRoom.product_title ?? 'สินค้า'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' as const }}>
                        {selectedRoom.product_price && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                            ฿{selectedRoom.product_price.toLocaleString()}
                          </span>
                        )}
                        {selectedRoom.product_price && (
                          <s style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                            ฿{Math.round(selectedRoom.product_price * 1.2).toLocaleString()}
                          </s>
                        )}
                        <span style={{ color: 'var(--ink-3)' }}>· มือสอง สภาพดี</span>
                      </div>
                    </div>
                    <button style={{
                      padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
                      background: 'none', fontSize: 12, cursor: 'pointer', color: 'var(--ink)', flexShrink: 0,
                      fontFamily: 'inherit', fontWeight: 500,
                    }}>ดูสินค้า</button>
                  </div>
                )}

                {/* Messages area */}
                <div ref={chatRef}
                  style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>

                  {loadingMsgs && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 20, color: 'var(--ink-3)', fontSize: 13, gap: 8, alignItems: 'center' }}>
                      <IconSpin /> กำลังโหลด…
                    </div>
                  )}

                  {!loadingMsgs && msgs.length === 0 && (
                    <>
                      <div style={{ textAlign: 'center', padding: '8px 0 4px', color: 'var(--ink-3)', fontSize: 12 }}>
                        <span style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 999, padding: '3px 12px' }}>วันนี้</span>
                      </div>
                      <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--ink-3)', fontSize: 13 }}>
                        เริ่มการสนทนาด้านล่าง
                      </div>
                    </>
                  )}

                  {!loadingMsgs && msgs.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '4px 0 8px', color: 'var(--ink-3)', fontSize: 12 }}>
                      <span style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 999, padding: '3px 12px' }}>วันนี้</span>
                    </div>
                  )}

                  {msgs.map((m, i) => (
                    <div key={m.id ?? i}
                      style={{ display: 'flex', maxWidth: '78%', alignSelf: m.who === 'me' ? 'flex-end' : 'flex-start', gap: 6, alignItems: 'flex-end' }}>
                      {m.who !== 'me' && (
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 10, color: '#fff', letterSpacing: 0.3,
                        }}>{getInitials(sellerName)}</div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
                        {m.text === '__img__:uploading' ? (
                          <div style={{ padding: '9px 13px', borderRadius: 18, background: m.who === 'me' ? 'var(--accent)' : 'var(--line-2)', color: m.who === 'me' ? '#fff' : 'var(--ink)', opacity: 0.6, fontSize: 13 }}>
                            📷 กำลังอัพโหลด…
                          </div>
                        ) : m.text.startsWith('__img__:') ? (
                          <img
                            src={m.text.slice(8)}
                            alt="รูปภาพ"
                            style={{ maxWidth: 220, maxHeight: 280, borderRadius: 12, display: 'block', cursor: 'pointer', objectFit: 'cover' }}
                            onClick={() => window.open(m.text.slice(8), '_blank')}
                          />
                        ) : (
                          <div style={{
                            padding: '9px 13px', borderRadius: 18, fontSize: 13.5, lineHeight: 1.45, wordBreak: 'break-word',
                            background: m.who === 'me' ? 'var(--accent)' : 'var(--line-2)',
                            color: m.who === 'me' ? '#fff' : 'var(--ink)',
                            borderBottomRightRadius: m.who === 'me' ? 4 : 18,
                            borderBottomLeftRadius: m.who !== 'me' ? 4 : 18,
                          }}>{m.text}</div>
                        )}
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', padding: '0 4px' }}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick replies */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 14px', flexShrink: 0, borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
                  {['สวัสดีครับ ยังมีสินค้านี้อยู่ไหม?','ราคาต่อรองได้ไหมครับ?','ส่งไปรษณีย์ได้ไหมครับ?','ขอดูรูปเพิ่มเติมได้ไหมครับ?','นัดรับได้ที่ไหนบ้าง?'].map((q, i) => (
                    <button key={i} onClick={() => { setDraft(q); }} style={{ padding: '7px 14px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{q}</button>
                  ))}
                </div>

                {/* Input area wrapper (relative for emoji picker) */}
                <div style={{ position: 'relative', flexShrink: 0, width: '100%' }}>

                {/* Emoji picker */}
                {showEmoji && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: 0, marginBottom: 6,
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    padding: 10, zIndex: 300, display: 'flex', flexWrap: 'wrap', gap: 2, maxWidth: 280,
                  }}>
                    {['😊','😂','🥰','😍','🤩','😎','🙏','👍','👏','🎉','❤️','💕','🔥','✨','💯','😅','😭','🤔','😴','🥺','😤','🫡','💪','👀','🙈','🐱','🎁','💰','📦','⭐'].map(e => (
                      <button key={e} type="button" onClick={() => insertEmoji(e)}
                        style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                        onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'none'; }}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <form onSubmit={e => { e.preventDefault(); handleSend(); }}
                  style={{ display: 'flex', gap: 6, padding: '10px 14px', borderTop: '1px solid var(--line)', background: 'var(--surface)', alignItems: 'center' }}>

                  {/* Hidden file input */}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                      e.target.value = '';
                    }}
                  />

                  {/* Attach image button */}
                  <button
                    type="button"
                    disabled={uploadingImg}
                    onClick={() => fileRef.current?.click()}
                    style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: uploadingImg ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%', flexShrink: 0, opacity: uploadingImg ? 0.5 : 1 }}
                    title="แนบรูป">
                    {uploadingImg
                      ? <IconSpin />
                      : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m3 17 5-5 6 6 4-4 3 3"/></svg>
                    }
                  </button>

                  {/* Emoji button */}
                  <button
                    type="button"
                    onClick={() => setShowEmoji(v => !v)}
                    style={{ width: 32, height: 32, border: 'none', background: showEmoji ? 'var(--surface-2)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%', flexShrink: 0 }}
                    title="อิโมจิ">
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
                  </button>

                  <input
                    data-testid="chat-input"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onFocus={() => setShowEmoji(false)}
                    placeholder="พิมพ์ข้อความ…"
                    style={{
                      flex: 1, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 999,
                      background: 'var(--surface-2)', fontFamily: 'inherit', fontSize: 13.5,
                      color: 'var(--ink)', outline: 'none',
                    }}
                  />
                  {draft.trim() ? (
                    <button
                      data-testid="chat-send-btn"
                      type="submit"
                      disabled={sending}
                      style={{
                        width: 36, height: 36, flexShrink: 0,
                        background: 'var(--accent)',
                        color: '#fff',
                        border: 'none', borderRadius: '50%', fontSize: 13, fontWeight: 600,
                        cursor: sending ? 'not-allowed' : 'pointer', transition: '.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      {sending ? <IconSpin /> : <IconSend />}
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid="chat-like-btn"
                      style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}
                      title="ไลค์"
                      onClick={() => { handleSend('👍'); }}>
                      👍
                    </button>
                  )}
                </form>
                </div>{/* end input area wrapper */}
              </>
            ) : (
              /* Empty state - desktop only, no room selected */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--ink-3)' }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>เลือกการสนทนา</div>
                <div style={{ fontSize: 13 }}>เลือกการสนทนาจากรายการทางซ้าย</div>
              </div>
            )}
          </div>
        )}

        {/* ── RIGHT PANEL: Seller info (340px, desktop + room selected only) ── */}
        {showRight && selectedRoom && (
          <div style={{
            width: 340, flexShrink: 0,
            borderLeft: '1px solid var(--line)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            background: 'var(--surface)',
          }}>
            {/* Profile hero */}
            <div style={{ padding: '24px 16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 28, color: '#fff',
              }}>{getInitials(sellerName)}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', textAlign: 'center' }}>{sellerName}</div>
              <div style={{ fontSize: 13, color: '#e6a817', textAlign: 'center' }}>★ 4.8 <span style={{ color: 'var(--ink-3)' }}>(156 รีวิว)</span></div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.5 }}>สมาชิกตั้งแต่ 2564 · ตอบเร็วภายใน 15 นาที</div>
            </div>

            <div style={{ height: 1, minHeight: 1, flexShrink: 0, background: 'var(--line)', margin: '0 16px' }} />
            {/* สินค้าที่คุยกันอยู่ */}
            <div style={{ padding: '14px 16px 16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>สินค้าที่คุยกันอยู่</h4>
              {selectedRoom.product_image ? (
                <div style={{
                  width: '100%', height: 180, borderRadius: 'var(--radius)',
                  background: `url(${selectedRoom.product_image}) center/cover`,
                  border: '1px solid var(--line)', marginBottom: 10,
                }} />
              ) : (
                <div style={{
                  width: '100%', height: 180, borderRadius: 'var(--radius)',
                  background: `linear-gradient(135deg,${tints[0]},${tints[1]})`, marginBottom: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,.6)', fontSize: 36,
                }}>📦</div>
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                {selectedRoom.product_title ?? 'สินค้า'}
              </div>
              {selectedRoom.product_price && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.01em' }}>
                  ฿{selectedRoom.product_price?.toLocaleString()}
                </div>
              )}
            </div>

            <div style={{ height: 1, minHeight: 1, flexShrink: 0, background: 'var(--line)', margin: '0 16px' }} />
            {/* การดำเนินการ */}
            <div style={{ padding: '14px 16px 8px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>การดำเนินการ</h4>
              {[
                { icon: '📎', label: 'ไฟล์ที่แชร์', color: 'var(--ink-2)' },
                { icon: '🔕', label: 'ปิดการแจ้งเตือน', color: 'var(--ink-2)' },
                { icon: '📌', label: 'ปักหมุดข้อความนี้', color: 'var(--ink-2)' },
                { icon: '📦', label: 'ทำเครื่องหมายว่าขายแล้ว', color: 'var(--pos)' },
                { icon: '🚫', label: 'บล็อก & รายงาน', color: 'var(--neg)' },
              ].map(({ icon, label, color }) => (
                <button key={label} style={{
                  width: '100%', minHeight: 44, padding: '0 6px', border: 'none', background: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', borderRadius: 'var(--radius-sm)',
                  color,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 13, fontFamily: 'inherit', color }}>{label}</span>
                </button>
              ))}
            </div>

            <div style={{ height: 1, minHeight: 1, flexShrink: 0, background: 'var(--line)', margin: '0 16px' }} />
            {/* สินค้าอื่นจากผู้ขาย */}
            <div style={{ padding: '14px 16px 20px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>สินค้าอื่นจากผู้ขาย</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { t: 'iPhone 15 Pro 256GB สีดำ', p: 38900, idx: 0 },
                  { t: 'MacBook Air M3 512GB', p: 52000, idx: 1 },
                  { t: 'AirPods Pro Gen 2', p: 7800, idx: 2 },
                ].map((item, j) => {
                  const mt = tints; // reuse tints
                  return (
                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.borderRadius = '8px'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                      <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-sm)', flexShrink: 0, background: `linear-gradient(135deg,${IMG_TINTS[(j+3)%8][0]},${IMG_TINTS[(j+3)%8][1]})` }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{item.t}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>฿{item.p.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
