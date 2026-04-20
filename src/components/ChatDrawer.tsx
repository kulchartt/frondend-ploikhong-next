'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

interface ChatDrawerProps {
  onClose: () => void;
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

export function ChatDrawer({ onClose }: ChatDrawerProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const myUserId: number | undefined = (session as any)?.userId;
  const isMobile = useBreakpoint(768);

  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestId = useRef(0);

  // Lock scroll + ESC
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRoom) setSelectedRoom(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, selectedRoom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  // Load rooms
  useEffect(() => {
    if (!token) { setLoadingRooms(false); return; }
    setLoadingRooms(true);
    api.getChatRooms(token)
      .then(data => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
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
        const normalised = normalise(raw, selectedRoom.buyer_id ?? myUserId);
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
          setMsgs(normalise(raw, selectedRoom.buyer_id ?? myUserId));
        }
      } catch {}
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, selectedRoom, normalise, myUserId]);

  async function handleSend() {
    if (!draft.trim() || !token || !selectedRoom) return;
    const text = draft.trim();
    const optimistic = { id: Date.now(), who: 'me', text, time: nowTime() };
    setMsgs(m => [...m, optimistic]);
    setDraft('');
    setSending(true);
    try {
      await api.sendMessage(selectedRoom.id, text, token);
      // Update last message in room list
      setRooms(rs => rs.map(r => r.id === selectedRoom.id
        ? { ...r, last_message: text, updated_at: new Date().toISOString() }
        : r
      ));
    } catch {} finally {
      setSending(false);
    }
  }

  function timeAgo(dateStr?: string) {
    if (!dateStr) return '';
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 1) return 'เมื่อกี้';
    if (d < 60) return `${d} นาที`;
    if (d < 1440) return `${Math.floor(d/60)} ชม.`;
    return `${Math.floor(d/1440)} วัน`;
  }

  const showThreadView = isMobile ? !!selectedRoom : false; // mobile: one view at a time

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(0,0,0,.45)', display: 'flex', justifyContent: 'flex-end' }}>
      <style>{`
        @keyframes hubSlide { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: isMobile ? '100%' : 520,
          height: '100%',
          background: 'var(--bg)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : selectedRoom ? '200px 1fr' : '1fr',
          boxShadow: '-8px 0 40px rgba(0,0,0,.2)',
          animation: 'hubSlide .28s cubic-bezier(.2,.8,.2,1)',
          overflow: 'hidden',
        }}>

        {/* ── Room list (always on desktop, hidden on mobile when thread open) ── */}
        {(!isMobile || !selectedRoom) && (
          <div style={{ display: 'flex', flexDirection: 'column', borderRight: isMobile ? 'none' : '1px solid var(--line)', height: '100%', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '18px 18px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>ข้อความ</div>
                {rooms.length > 0 && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{rooms.length} การสนทนา</div>}
              </div>
              <button onClick={onClose}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <svg width={14} height={14} viewBox="0 0 24 24" stroke="var(--ink)" fill="none" strokeWidth={2}>
                  <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
              </button>
            </div>

            {/* Rooms */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
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
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ height: 14, width: '60%', background: 'var(--surface-2)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                      <div style={{ height: 12, width: '80%', background: 'var(--surface-2)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                    </div>
                  ))}
                </div>
              )}

              {token && !loadingRooms && rooms.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>ยังไม่มีการสนทนา</div>
                  <div style={{ fontSize: 13 }}>กดแชทกับผู้ขายจากหน้าสินค้า</div>
                </div>
              )}

              {token && !loadingRooms && rooms.map(room => {
                const tints = IMG_TINTS[room.id % IMG_TINTS.length];
                const isSelected = selectedRoom?.id === room.id;
                const other = room.seller_name ?? room.buyer_name ?? 'ผู้ใช้';
                return (
                  <button key={room.id}
                    data-testid={`room-${room.id}`}
                    onClick={() => setSelectedRoom(room)}
                    style={{
                      width: '100%', padding: '12px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? 'var(--surface-2)' : 'var(--surface)',
                      borderBottom: '1px solid var(--line)',
                      display: 'flex', gap: 10, alignItems: 'center',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface)'; }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                      background: room.product_image
                        ? `url(${room.product_image}) center/cover`
                        : `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {other}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                          {timeAgo(room.updated_at ?? room.created_at)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {room.product_title ?? room.last_message ?? 'เริ่มการสนทนา'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Thread view ── */}
        {(!isMobile || selectedRoom) && selectedRoom && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--surface)' }}>

            {/* Thread header */}
            <div style={{ padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              {isMobile && (
                <button onClick={() => setSelectedRoom(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--ink-2)', display: 'flex' }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                </button>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedRoom.seller_name ?? selectedRoom.buyer_name ?? 'ผู้ใช้'}
                </div>
                {selectedRoom.product_title && (
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📦 {selectedRoom.product_title}
                  </div>
                )}
              </div>
              {!isMobile && (
                <button onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex' }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 6l12 12M18 6L6 18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Messages */}
            <div ref={chatRef}
              style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>

              {loadingMsgs && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20, color: 'var(--ink-3)', fontSize: 13 }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    style={{ animation: 'spin 1s linear infinite', marginRight: 8 }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  กำลังโหลด…
                </div>
              )}

              {!loadingMsgs && msgs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)', fontSize: 13 }}>
                  เริ่มการสนทนาด้านล่าง
                </div>
              )}

              {msgs.map((m, i) => (
                <div key={m.id ?? i}
                  style={{ display: 'flex', maxWidth: '80%', alignSelf: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '9px 13px', borderRadius: 16, fontSize: 13.5, lineHeight: 1.45, wordBreak: 'break-word',
                      background: m.who === 'me' ? 'var(--accent)' : 'var(--surface)',
                      color: m.who === 'me' ? '#fff' : 'var(--ink)',
                      border: m.who === 'me' ? 'none' : '1px solid var(--line)',
                      borderBottomRightRadius: m.who === 'me' ? 4 : 16,
                      borderBottomLeftRadius: m.who === 'seller' ? 4 : 16,
                    }}>{m.text}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', padding: '0 4px' }}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); handleSend(); }}
              style={{ display: 'flex', gap: 8, padding: '12px 14px', borderTop: '1px solid var(--line)', background: 'var(--surface)', alignItems: 'center' }}>
              <input
                data-testid="chat-input"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="พิมพ์ข้อความ…"
                style={{
                  flex: 1, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 999,
                  background: 'var(--surface-2)', fontFamily: 'inherit', fontSize: 13.5,
                  color: 'var(--ink)', outline: 'none',
                }}
              />
              <button
                data-testid="chat-send-btn"
                type="submit"
                disabled={!draft.trim() || sending}
                style={{
                  padding: '10px 18px', background: draft.trim() ? 'var(--accent)' : 'var(--line)',
                  color: draft.trim() ? '#fff' : 'var(--ink-3)',
                  border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 600,
                  cursor: draft.trim() && !sending ? 'pointer' : 'not-allowed', transition: '.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                {sending && (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                )}
                ส่ง
              </button>
            </form>
          </div>
        )}

        {/* Desktop placeholder when no room selected */}
        {!isMobile && !selectedRoom && rooms.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14 }}>เลือกการสนทนาจากซ้ายมือ</div>
          </div>
        )}
      </div>
    </div>
  );
}
