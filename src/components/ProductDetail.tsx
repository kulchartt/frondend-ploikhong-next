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
  onOpenAuth?: () => void;
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

export function ProductDetail({ product, onClose, onViewShop, onOpenChatDrawer, onOpenAuth }: ProductDetailProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  // sessionUserId may be wrong for social logins — verified below via /api/auth/me
  const [sessionUserId, setSessionUserId] = useState<number | undefined>((session as any)?.userId);
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

  // Verify real DB user ID (social login may have wrong token.sub)
  useEffect(() => {
    if (!token) return;
    api.getMe(token)
      .then(me => { if (me?.id) setSessionUserId(Number(me.id)); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, typing]);

  // Track product view event (fire-and-forget)
  useEffect(() => {
    if (product?.id) {
      api.trackEvent(product.id, 'view', token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

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
      who: Number(m.sender_id) === Number(meId) ? 'me' : 'seller',
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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)',
        zIndex: 200, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
        padding: isMobile ? 0 : '24px 16px',
        animation: 'fadeIn .15s ease',
      }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(.98) } to { opacity:1; transform:none } }
        @keyframes bop { 0%,60%,100% { transform:translateY(0);opacity:.4 } 30% { transform:translateY(-4px);opacity:1 } }
        .pd-right-scroll::-webkit-scrollbar { width: 4px; }
        .pd-right-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 2px; }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          borderRadius: isMobile ? '16px 16px 0 0' : 12,
          width: '100%',
          maxWidth: isMobile ? '100%' : 1100,
          height: isMobile ? 'auto' : '92vh',
          maxHeight: isMobile ? '96vh' : '92vh',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr',
          gridTemplateRows: isMobile ? 'auto 1fr' : '1fr',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,.6)',
          animation: 'slideUp .25s cubic-bezier(.2,.8,.2,1)',
        }}>

        {/* Close button */}
        <button onClick={onClose}
          data-testid="pd-close"
          style={{
            position: 'absolute', top: 14, left: 14, zIndex: 20,
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)', border: 'none',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}>
          <svg width={20} height={20} viewBox="0 0 24 24" stroke="#fff" fill="none" strokeWidth={2.5} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>

        {/* ── LEFT: Gallery (dark, full height) ── */}
        <section style={{
          background: '#1c1e21',
          display: 'flex', flexDirection: 'column',
          height: isMobile ? '58vw' : '100%',
          minHeight: isMobile ? 240 : 0,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Hero image — fills all available space */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
            {!imgs[imgIdx] && (
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${getTint(imgIdx)[0]}44, ${getTint(imgIdx)[1]}44)` }} />
            )}
            {imgs[imgIdx] ? (
              <img
                src={imgs[imgIdx]!}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke={getTint(imgIdx)[0]} strokeWidth={1} style={{ opacity: .4 }}>
                <rect x={3} y={3} width={18} height={18} rx={2}/><circle cx={8.5} cy={8.5} r={1.5}/><path d="M21 15l-5-5L5 21"/>
              </svg>
            )}

            {/* Prev arrow */}
            {imgIdx > 0 && (
              <button onClick={() => setImgIdx(i => i - 1)}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(0,0,0,.5)', border: 'none',
                  display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 2,
                  backdropFilter: 'blur(4px)',
                }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}
            {/* Next arrow */}
            {imgIdx < imgs.length - 1 && (
              <button onClick={() => setImgIdx(i => i + 1)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(0,0,0,.5)', border: 'none',
                  display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 2,
                  backdropFilter: 'blur(4px)',
                }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnail strip — dark themed */}
          {imgs.length > 1 && (
            <div data-testid="thumb-strip" style={{
              display: 'flex', gap: 6, padding: '10px 12px',
              background: 'rgba(0,0,0,.55)', flexShrink: 0,
              overflowX: 'auto', backdropFilter: 'blur(4px)',
            }}>
              {imgs.map((img, i) => (
                <button key={i} data-testid={`thumb-${i}`} onClick={() => setImgIdx(i)}
                  style={{
                    width: 52, height: 52, borderRadius: 6, padding: 0,
                    border: `2px solid ${i === imgIdx ? '#fff' : 'rgba(255,255,255,.2)'}`,
                    overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                    background: `linear-gradient(135deg, ${getTint(i)[0]}, ${getTint(i)[1]})`,
                    opacity: i === imgIdx ? 1 : 0.65,
                    transition: 'opacity .15s, border-color .15s',
                  }}>
                  {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </button>
              ))}
            </div>
          )}

          {/* Image counter overlay (when only 1 image) */}
          {imgs.length <= 1 && (
            <div style={{
              position: 'absolute', bottom: 12, right: 14,
              fontSize: 11, color: 'rgba(255,255,255,.6)',
              fontFamily: 'var(--font-mono)',
            }}>1 / 1</div>
          )}
          {imgs.length > 1 && (
            <div style={{
              position: 'absolute', top: 14, right: 14,
              fontSize: 11, color: 'rgba(255,255,255,.8)',
              background: 'rgba(0,0,0,.45)', padding: '3px 9px',
              borderRadius: 999, fontFamily: 'var(--font-mono)',
              backdropFilter: 'blur(4px)',
            }}>{imgIdx + 1} / {imgs.length}</div>
          )}
        </section>

        {/* ── RIGHT: Details ── */}
        <section style={{
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          height: isMobile ? 'auto' : '100%',
          overflow: 'hidden',
        }}>
          {/* Scrollable content */}
          <div className="pd-right-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

            {/* Price + title block */}
            <div style={{ padding: isMobile ? '18px 18px 14px' : '24px 24px 18px' }}>
              {/* Price — very prominent */}
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: isMobile ? 28 : 34,
                fontWeight: 800, letterSpacing: '-.02em', color: '#1c1e21', lineHeight: 1.1,
              }}>
                ฿{Number(price).toLocaleString()}
                {product.original_price && product.original_price > price && (
                  <s style={{ color: '#aaa', fontWeight: 400, fontSize: isMobile ? 16 : 18, marginLeft: 10 }}>
                    ฿{Number(product.original_price).toLocaleString()}
                  </s>
                )}
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: 'var(--font-disp-th)', fontSize: isMobile ? 17 : 20,
                fontWeight: 600, letterSpacing: '-.01em', lineHeight: 1.35,
                marginTop: 10, color: '#1c1e21',
              }}>
                {product.title}
              </h1>

              {/* Tags row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {product.condition && <Tag>{product.condition}</Tag>}
                {product.is_boosted && <Tag boost>BOOST</Tag>}
                {product.flash_price && <Tag accent>SALE</Tag>}
              </div>

              {/* Location + time */}
              <div style={{
                marginTop: 10, fontSize: 13, color: '#65676b',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {product.location && (
                  <>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#65676b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx={12} cy={10} r={3}/>
                    </svg>
                    {product.location}
                    {product.created_at && <span style={{ color: '#bbb' }}>·</span>}
                  </>
                )}
                {product.created_at && <span style={{ color: '#65676b' }}>{timeAgo(product.created_at)}</span>}
              </div>
            </div>

            <div style={{ height: 1, background: '#e4e6ea', margin: '0 18px' }} />

            {/* Seller strip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: isMobile ? '14px 18px' : '16px 24px',
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: '#e4e6ea',
                display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: 16, color: '#1c1e21', flexShrink: 0,
              }}>
                {sellerInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1c1e21', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {product.seller_name ?? 'ผู้ขาย'}
                </div>
                <div style={{ fontSize: 12, color: '#65676b', marginTop: 2 }}>
                  Marketplace Seller
                </div>
              </div>
              <button
                onClick={() => product?.seller_id && onViewShop?.(product.seller_id)}
                style={{
                  padding: '7px 14px', border: '1px solid #ccd0d5',
                  borderRadius: 6, background: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#1c1e21',
                  fontFamily: 'inherit',
                }}>
                ดูร้าน
              </button>
            </div>

            <div style={{ height: 1, background: '#e4e6ea', margin: '0 18px' }} />

            {/* Description */}
            <div style={{ padding: isMobile ? '14px 18px' : '16px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#65676b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>รายละเอียด</div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#3c3c3c', margin: 0 }}>
                {product.description ?? 'ไม่มีรายละเอียดเพิ่มเติม'}
              </p>
            </div>

            <div style={{ height: 1, background: '#e4e6ea', margin: '0 18px' }} />

            {/* Specs grid */}
            <div style={{ padding: isMobile ? '14px 18px' : '16px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#65676b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>ข้อมูลสินค้า</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['สภาพ', product.condition ?? '-'],
                  ['หมวดหมู่', product.category ?? '-'],
                  ['พื้นที่', product.location ?? '-'],
                  ['วิธีรับของ', 'นัดรับ / ส่งไปรษณีย์'],
                  ['ลงประกาศ', timeAgo(product.created_at)],
                ].filter(([, v]) => v && v !== '-').map(([label, val]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 13, padding: '9px 0', borderBottom: '1px solid #f0f2f5',
                  }}>
                    <span style={{ color: '#65676b' }}>{label}</span>
                    <span style={{ color: '#1c1e21', fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety notice */}
            <div style={{ margin: '0 18px 18px', padding: '10px 14px', background: '#f0f2f5', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: '#65676b' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" stroke="#1877f2" fill="none" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
              </svg>
              <span>ซื้อ-ขายกันเอง นัดที่สาธารณะ ตรวจสอบของก่อนจ่ายเงินเสมอ</span>
            </div>
          </div>

          {/* ── Sticky Chat CTA ── */}
          <div style={{
            padding: isMobile ? '12px 18px 16px' : '14px 24px',
            borderTop: '1px solid #e4e6ea',
            background: '#fff', flexShrink: 0,
          }}>
            {sessionUserId && product?.seller_id && sessionUserId === product.seller_id ? (
              <div style={{
                width: '100%', padding: '13px 0',
                background: '#f0f2f5', borderRadius: 8,
                fontSize: 14, color: '#65676b', textAlign: 'center', fontFamily: 'inherit',
              }}>
                นี่คือสินค้าของคุณ
              </div>
            ) : !session?.user ? (
              <button
                data-testid="pd-chat-btn"
                onClick={() => onOpenAuth?.()}
                style={{
                  width: '100%', padding: '13px 0',
                  background: '#1877f2', color: '#fff',
                  border: 'none', borderRadius: 8,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit',
                }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                เข้าสู่ระบบเพื่อส่งข้อความ
              </button>
            ) : (
              <button
                data-testid="pd-chat-btn"
                onClick={() => { setChatOpen(true); if (product?.id) api.trackEvent(product.id, 'chat_open', token); }}
                style={{
                  width: '100%', padding: '13px 0',
                  background: '#1877f2', color: '#fff',
                  border: 'none', borderRadius: 8,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit',
                }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                ส่งข้อความ
              </button>
            )}
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
    <h3 style={{ fontFamily: 'var(--font-disp-th)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-3)', marginBottom: 10, fontWeight: 600 }}>
      {children}
    </h3>
  );
}
