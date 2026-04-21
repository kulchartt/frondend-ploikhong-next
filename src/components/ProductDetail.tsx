'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

interface Product {
  id: number;
  title: string;
  price: number;
  original_price?: number;
  flash_price?: number;
  images?: string[];
  location?: string;
  created_at?: string;
  seller_name?: string;
  seller_id?: number;
  condition?: string;
  is_boosted?: boolean;
  category?: string;
  description?: string;
}

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onViewShop?: (sellerId: number) => void;
  onOpenChatDrawer?: (roomId?: number) => void;
}

const IMG_TINTS = [
  ['#d4a59a','#c8866e'],['#a5c4d4','#7ba8c8'],['#b8d4a5','#8ec87b'],
  ['#d4c4a5','#c8a87b'],['#c4a5d4','#a87bc8'],['#a5d4c4','#7bc8a8'],
  ['#d4d4a5','#c8c87b'],['#c4a5a5','#c87b7b'],['#a5b4d4','#7b8ec8'],
  ['#d4b4a5','#c8987b'],['#b4d4a5','#98c87b'],['#d4a5c4','#c87ba8'],
];

const QUICK = ['ยังว่างไหมครับ?', 'ลดราคาได้ไหม?', 'นัดดูของได้ที่ไหน?', 'ส่งได้ไหม?'];

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'วันนี้';
  if (diff === 1) return 'เมื่อวาน';
  return `${diff} วันที่แล้ว`;
}

type Msg = { who: 'me' | 'seller'; text: string; time: string };

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export function ProductDetail({ product, onClose, onViewShop, onOpenChatDrawer }: ProductDetailProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const isMobile = useBreakpoint(768);
  const [imgIdx, setImgIdx] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [chatReady, setChatReady] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestMsgId = useRef<number>(0);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, typing]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Normalise API messages → internal Msg format
  const normaliseMsgs = useCallback((raw: any[], meId: number): Msg[] =>
    raw.map(m => ({
      who: m.sender_id === meId ? 'me' : 'seller',
      text: m.content ?? m.message ?? '',
      time: m.created_at
        ? new Date(m.created_at).toLocaleTimeString('th', { hour: '2-digit', minute: '2-digit' })
        : nowTime(),
    }))
  , []);

  // Create/find chat room + load initial messages
  useEffect(() => {
    if (!token || !product?.seller_id) {
      // Guest: show simulated preview messages
      setMsgs([
        { who: 'seller', text: 'สวัสดีครับ สินค้ายังว่างนะครับ 😊', time: '14:02' },
        { who: 'me',     text: 'สนใจครับ ของสภาพยังไงบ้าง?',         time: '14:03' },
        { who: 'seller', text: 'สภาพ 95% ครับ ใช้มา 4 เดือน ไม่มีรอยร้าว', time: '14:04' },
      ]);
      setChatReady(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const room = await api.createChatRoom(product.seller_id!, product.id, token);
        if (cancelled) return;
        const meId: number = room.buyer_id ?? room.user_id ?? 0;
        setRoomId(room.id);
        setMyUserId(meId);
        const rawMsgs = await api.getChatMessages(room.id, token);
        if (cancelled) return;
        const normalised = normaliseMsgs(rawMsgs, meId);
        setMsgs(normalised);
        if (rawMsgs.length) latestMsgId.current = rawMsgs[rawMsgs.length - 1].id;
        setChatReady(true);
      } catch {
        // Fall back to simulated
        setMsgs([{ who: 'seller', text: 'สวัสดีครับ ยินดีให้ข้อมูลเลยครับ 😊', time: nowTime() }]);
        setChatReady(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, product?.id, product?.seller_id, normaliseMsgs]);

  // Poll for new messages every 3 s
  useEffect(() => {
    if (!token || !roomId || !myUserId) return;
    pollRef.current = setInterval(async () => {
      try {
        const rawMsgs = await api.getChatMessages(roomId, token);
        const lastId = rawMsgs.length ? rawMsgs[rawMsgs.length - 1].id : 0;
        if (lastId !== latestMsgId.current) {
          latestMsgId.current = lastId;
          setMsgs(normaliseMsgs(rawMsgs, myUserId));
        }
      } catch {}
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, roomId, myUserId, normaliseMsgs]);

  if (!product) return null;

  const tints = IMG_TINTS[product.id % IMG_TINTS.length];
  const imgs = product.images?.length
    ? product.images
    : [null, null, null, null];

  const price = product.flash_price || product.price;
  const sellerInitial = (product.seller_name ?? 'S')[0].toUpperCase();

  function getTint(i: number) {
    return IMG_TINTS[((product?.id ?? 0) + i) % IMG_TINTS.length];
  }

  async function send(text: string) {
    if (!text.trim()) return;
    const optimistic: Msg = { who: 'me', text, time: nowTime() };
    setMsgs(m => [...m, optimistic]);
    setDraft('');

    if (chatReady && token && roomId) {
      try {
        await api.sendMessage(roomId, text, token);
      } catch {} // keep optimistic even on error
    } else {
      // Simulated reply for guests
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs(m => [...m, { who: 'seller', text: 'เดี๋ยวตอบให้นะครับ ขอเช็คของก่อน 🙏', time: nowTime() }]);
      }, 1800);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
        zIndex: 200, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
        padding: isMobile ? 0 : 24, overflowY: 'auto',
        animation: 'fadeIn .15s ease',
      }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(.98) } to { opacity:1; transform:none } }
        @keyframes bop { 0%,60%,100% { transform:translateY(0);opacity:.4 } 30% { transform:translateY(-4px);opacity:1 } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)', borderRadius: isMobile ? '16px 16px 0 0' : 16, width: '100%',
          maxWidth: isMobile ? '100%' : 1240, maxHeight: isMobile ? '96vh' : '92vh',
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr',
          overflowY: 'auto', position: 'relative',
          boxShadow: '0 40px 80px rgba(0,0,0,.35)',
          animation: 'slideUp .25s cubic-bezier(.2,.8,.2,1)',
        }}>

        {/* Close */}
        <button onClick={onClose}
          data-testid="pd-close"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,.92)', border: '1px solid var(--line)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            backdropFilter: 'blur(6px)',
          }}>
          <svg width={18} height={18} viewBox="0 0 24 24" stroke="var(--ink)" fill="none" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>

        {/* ── LEFT: Gallery ── */}
        <section style={{ background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line)' }}>
          {/* Hero image */}
          <div style={{ height: isMobile ? 240 : 420, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(135deg, ${getTint(imgIdx)[0]}, ${getTint(imgIdx)[1]})`,
            }}>
              {imgs[imgIdx] && (
                <img src={imgs[imgIdx]!} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
            </div>

            {/* Prev */}
            {imgIdx > 0 && (
              <button onClick={() => setImgIdx(i => i - 1)}
                style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%', fontSize: 22,
                  background: 'rgba(255,255,255,.88)', border: '1px solid var(--line)',
                  display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 2,
                  backdropFilter: 'blur(4px)',
                }}>‹</button>
            )}
            {/* Next */}
            {imgIdx < imgs.length - 1 && (
              <button onClick={() => setImgIdx(i => i + 1)}
                style={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%', fontSize: 22,
                  background: 'rgba(255,255,255,.88)', border: '1px solid var(--line)',
                  display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 2,
                  backdropFilter: 'blur(4px)',
                }}>›</button>
            )}

            {/* Counter */}
            <span style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff',
              background: 'rgba(0,0,0,.45)', padding: '3px 10px',
              borderRadius: 999, backdropFilter: 'blur(4px)',
            }}>{imgIdx + 1} / {imgs.length}</span>
          </div>

          {/* Thumbnails */}
          <div data-testid="thumb-strip" style={{
            display: 'flex', gap: 8, padding: 12,
            background: 'var(--surface)', borderTop: '1px solid var(--line)',
          }}>
            {imgs.map((img, i) => (
              <button key={i} data-testid={`thumb-${i}`} onClick={() => setImgIdx(i)}
                style={{
                  width: isMobile ? 54 : 70, height: isMobile ? 54 : 70, borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${i === imgIdx ? 'var(--ink)' : 'transparent'}`,
                  overflow: 'hidden', cursor: 'pointer', flexShrink: 0, padding: 0,
                  background: `linear-gradient(135deg, ${getTint(i)[0]}, ${getTint(i)[1]})`,
                }}>
                {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </button>
            ))}
          </div>
        </section>

        {/* ── RIGHT: Details + Chat ── */}
        <section style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--surface)' }}>

          {/* Header */}
          <div style={{ padding: isMobile ? '16px 18px 14px' : '22px 26px 18px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.08em', marginBottom: 10 }}>
              {(product.category ?? 'สินค้า').toUpperCase()} · {product.location ?? ''} · {timeAgo(product.created_at)}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: '-.015em', lineHeight: 1.3, marginBottom: 10, color: 'var(--ink)' }}>
              {product.title}
            </h1>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 26 : 32, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)' }}>
              ฿{Number(price).toLocaleString()}
              {product.original_price && product.original_price > price && (
                <s style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 18, marginLeft: 10 }}>
                  ฿{Number(product.original_price).toLocaleString()}
                </s>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {product.condition && <Tag>{product.condition}</Tag>}
              {product.is_boosted && <Tag boost>BOOST</Tag>}
              {product.flash_price && <Tag accent>SALE</Tag>}
            </div>
          </div>

          {/* Seller strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '12px 18px' : '16px 26px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, color: 'var(--ink)', flexShrink: 0 }}>
              {sellerInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {product.seller_name ?? 'ผู้ขาย'}
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'var(--pos)', color: '#fff', fontWeight: 500 }}>ยืนยันตัวตน</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                4.9 ★ · 342 รีวิว · ตอบภายใน 10 นาที
              </div>
            </div>
            <button
              onClick={() => product?.seller_id && onViewShop?.(product.seller_id)}
              style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', fontSize: 13, cursor: 'pointer', color: 'var(--ink)' }}>
              ดูร้าน
            </button>
          </div>

          {/* Description + specs */}
          <div style={{ padding: isMobile ? '14px 18px' : '18px 26px', borderBottom: '1px solid var(--line)' }}>
            <SectionTitle>รายละเอียด</SectionTitle>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {product.description ?? 'เครื่องศูนย์ไทย ใช้งานปกติทุกฟังก์ชัน อุปกรณ์ครบกล่อง มีรอยขนแมวเล็กน้อย ไม่กระทบการใช้งาน'}
            </p>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px' }}>
              {[
                ['สภาพ', product.condition ?? '-'],
                ['หมวดหมู่', product.category ?? '-'],
                ['พื้นที่', product.location ?? '-'],
                ['วิธีรับของ', 'นัดรับ / ส่งไปรษณีย์'],
                ['ลงประกาศ', timeAgo(product.created_at)],
                ['ยอดเข้าชม', '1,284 ครั้ง · 47 ถูกใจ'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>
                  <span style={{ color: 'var(--ink-3)' }}>{label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Safety notice */}
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--ink-2)', border: '1px solid var(--line)' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" stroke="var(--pos)" fill="none" strokeWidth={1.8} style={{ flexShrink: 0 }}>
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
              </svg>
              ซื้อ-ขายกันเอง นัดที่สาธารณะ ตรวจสอบของก่อนจ่ายเงินเสมอ
            </div>
          </div>

          {/* Chat CTA button */}
          <div style={{ padding: isMobile ? '14px 18px' : '16px 26px', borderBottom: '1px solid var(--line)' }}>
            <button
              data-testid="pd-chat-btn"
              onClick={() => setChatOpen(true)}
              style={{
                width: '100%', padding: '14px 0',
                background: 'rgba(255,45,31,.07)', color: 'var(--accent)',
                border: '1.5px solid rgba(255,45,31,.22)', borderRadius: 'var(--radius-sm)',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit',
              }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              แชทกับผู้ขาย
            </button>
          </div>

          {/* Related from seller */}
          <div style={{ padding: '16px 26px 26px' }}>
            <SectionTitle>จากผู้ขายคนนี้</SectionTitle>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {[1, 2, 3, 4].map(i => {
                const t = IMG_TINTS[(product.id + i * 3) % IMG_TINTS.length];
                return (
                  <div key={i} style={{ flex: 1, cursor: 'pointer' }}>
                    <div style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-sm)', background: `linear-gradient(135deg,${t[0]},${t[1]})`, marginBottom: 4 }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>฿{(Math.floor(Math.random() * 40 + 5) * 1000).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ── Chat popup ── */}
      {chatOpen && (
        <div
          data-testid="pd-chat-popup"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            bottom: isMobile ? 0 : 24,
            right: isMobile ? 0 : 24,
            left: isMobile ? 0 : 'auto',
            width: isMobile ? '100%' : 360,
            maxHeight: isMobile ? '70vh' : 480,
            background: 'var(--surface)',
            border: isMobile ? 'none' : '1px solid var(--line)',
            borderRadius: isMobile ? '16px 16px 0 0' : 16,
            boxShadow: '0 20px 60px rgba(0,0,0,.3)',
            zIndex: 310,
            display: 'flex', flexDirection: 'column',
            animation: 'slideUp .2s cubic-bezier(.2,.8,.2,1)',
          }}>
          {/* Popup header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, color: 'var(--ink)', flexShrink: 0 }}>
              {sellerInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{product.seller_name ?? 'ผู้ขาย'}</div>
              <div style={{ fontSize: 12, color: 'var(--pos)' }}>ออนไลน์อยู่</div>
            </div>
            {onOpenChatDrawer && (
              <button
                data-testid="pd-chat-to-drawer"
                onClick={() => { setChatOpen(false); onClose(); onOpenChatDrawer(roomId ?? undefined); }}
                title="ดูการสนทนาทั้งหมด"
                style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%', flexShrink: 0 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <polyline points="9 10 12 13 15 10"/>
                </svg>
              </button>
            )}
            <button
              data-testid="pd-chat-close"
              onClick={() => setChatOpen(false)}
              style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', borderRadius: '50%', flexShrink: 0 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Product pin */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 4 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', background: `linear-gradient(135deg, ${tints[0]}, ${tints[1]})`, flexShrink: 0, overflow: 'hidden' }}>
                  {imgs[0] && <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--ink)' }}>{product.title}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginTop: 2, color: 'var(--ink)' }}>฿{Number(price).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', textAlign: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--line)', letterSpacing: '.06em', textTransform: 'uppercase' }}>เริ่มคุยเกี่ยวกับสินค้านี้</div>
            </div>

            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '85%', alignSelf: m.who === 'me' ? 'flex-end' : 'flex-start', flexDirection: m.who === 'me' ? 'row-reverse' : 'row' }}>
                {m.who === 'seller' && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0, color: 'var(--ink)' }}>{sellerInitial}</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '9px 13px', borderRadius: 16, fontSize: 13.5, lineHeight: 1.45, wordBreak: 'break-word',
                    background: m.who === 'me' ? 'var(--accent)' : 'var(--surface)',
                    color: m.who === 'me' ? '#fff' : 'var(--ink)',
                    border: m.who === 'me' ? 'none' : '1px solid var(--line)',
                    borderBottomRightRadius: m.who === 'me' ? 4 : 16,
                    borderBottomLeftRadius: m.who === 'seller' ? 4 : 16,
                  }}>{m.text}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', padding: '0 6px' }}>{m.time}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '85%' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0, color: 'var(--ink)' }}>{sellerInitial}</div>
                <div style={{ padding: '12px 14px', borderRadius: 16, borderBottomLeftRadius: 4, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 150, 300].map(d => (
                    <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-3)', display: 'inline-block', animation: `bop 1.2s ${d}ms infinite ease-in-out` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', flexShrink: 0, borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)}
                style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 999, fontSize: 12, color: 'var(--ink-2)', background: 'var(--surface)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); send(draft); }}
            style={{ display: 'flex', gap: 8, padding: '10px 12px', alignItems: 'center', background: 'var(--surface)', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              style={{ flex: 1, padding: '9px 14px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--surface-2)', fontFamily: 'inherit', fontSize: 13, color: 'var(--ink)', outline: 'none' }} />
            <button type="submit" disabled={!draft.trim()}
              style={{ padding: '8px 16px', background: draft.trim() ? 'var(--accent)' : 'var(--line)', color: draft.trim() ? '#fff' : 'var(--ink-3)', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: draft.trim() ? 'pointer' : 'not-allowed', transition: '.15s', fontFamily: 'inherit' }}>
              ส่ง
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Tag({ children, boost, accent }: { children: React.ReactNode; boost?: boolean; accent?: boolean }) {
  const bg = boost ? 'linear-gradient(90deg,#111,#333)'
    : accent ? 'var(--accent)'
    : 'var(--surface)';
  const color = (boost || accent) ? '#fff' : 'var(--ink-2)';
  const border = (boost || accent) ? 'none' : '1px solid var(--line)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999, background: bg, color, border }}>
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-3)', marginBottom: 10, fontWeight: 600 }}>
      {children}
    </h3>
  );
}
