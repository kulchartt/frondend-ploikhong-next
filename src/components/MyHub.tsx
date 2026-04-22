'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

// ─── Props ───────────────────────────────────────────────────────────────────

interface MyHubProps {
  mode?: 'sell' | 'buy';
  initialTab?: string;
  onClose: () => void;
  onNewListing: () => void;
  onOpenChat?: () => void;
  onViewProduct?: (product: any) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const IMG_TINTS = [
  ['#d4a59a','#c8866e'],['#a5c4d4','#7ba8c8'],['#b8d4a5','#8ec87b'],
  ['#d4c4a5','#c8a87b'],['#c4a5d4','#a87bc8'],['#a5d4c4','#7bc8a8'],
  ['#d4d4a5','#c8c87b'],['#c4a5a5','#c87b7b'],['#a5b4d4','#7b8ec8'],
  ['#d4b4a5','#c8987b'],['#b4d4a5','#98c87b'],['#d4a5c4','#c87ba8'],
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'กำลังขาย',  color: 'var(--pos)',   bg: 'rgba(10,122,69,.1)' },
  sold:      { label: 'ขายแล้ว',   color: 'var(--ink-3)', bg: 'var(--surface-2)' },
  'sold-out':{ label: 'ขายแล้ว',   color: 'var(--ink-3)', bg: 'var(--surface-2)' },
  inactive:  { label: 'ปิดประกาศ', color: 'var(--warn)',  bg: 'rgba(168,90,0,.1)' },
  draft:     { label: 'ฉบับร่าง',  color: '#c9a24a',      bg: 'rgba(201,162,74,.1)' },
  hidden:    { label: 'ซ่อนอยู่',  color: 'var(--ink-3)', bg: 'var(--surface-2)' },
};

const SELL_NAV = [
  { k: 'listings',  label: 'สินค้าของฉัน' },
  { k: 'offers',    label: 'คำขอราคา' },
  { k: 'insights',  label: 'สถิติ' },
  { k: 'profile',   label: 'ตั้งค่าร้านค้า' },
];

const BUY_NAV = [
  { k: 'saved',         label: 'สินค้าที่บันทึก' },
  { k: 'offers',        label: 'ข้อเสนอของฉัน' },
  { k: 'notifications', label: 'การแจ้งเตือน' },
  { k: 'following',     label: 'ร้านที่ติดตาม' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function MyHub({ mode: initialMode = 'sell', initialTab, onClose, onNewListing, onOpenChat, onViewProduct }: MyHubProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const isMobile = useBreakpoint(768);
  const [mode, setMode] = useState<'sell' | 'buy'>(initialMode);
  const [sellTab, setSellTab] = useState(
    initialMode === 'sell' && initialTab ? initialTab : 'listings'
  );
  const [buyTab, setBuyTab] = useState(
    initialMode === 'buy' && initialTab ? initialTab : 'saved'
  );
  const [pendingSellOffers, setPendingSellOffers] = useState(0);
  const [pendingBuyOffers, setPendingBuyOffers] = useState(0);

  // Scroll lock + ESC
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', h); };
  }, [onClose]);

  // Load pending offer counts for badges
  useEffect(() => {
    if (!token) return;
    api.getIncomingOffers(token).then(d => {
      if (Array.isArray(d)) setPendingSellOffers(d.filter((o: any) => o.status === 'pending').length);
    }).catch(() => {});
    api.getOutgoingOffers(token).then(d => {
      if (Array.isArray(d)) setPendingBuyOffers(d.filter((o: any) => o.status === 'pending').length);
    }).catch(() => {});
  }, [token]);

  const nav = mode === 'sell' ? SELL_NAV : BUY_NAV;
  const activeTab = mode === 'sell' ? sellTab : buyTab;
  const setTab = (t: string) => mode === 'sell' ? setSellTab(t) : setBuyTab(t);

  return (
    <div data-testid="v8hub" style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 190, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>

      {/* ── Mobile top bar ── */}
      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>ศูนย์ซื้อขาย</span>
          <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 8, padding: 3, gap: 2, marginLeft: 'auto' }}>
            {(['sell', 'buy'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: 12,
                  fontWeight: 700, borderRadius: 6,
                  background: mode === m ? (m === 'sell' ? '#f97316' : '#2563eb') : 'transparent',
                  color: mode === m ? '#fff' : 'var(--ink-3)',
                  fontFamily: 'inherit', transition: 'all .15s',
                }}>
                {m === 'sell' ? 'ฝั่งขาย' : 'ฝั่งซื้อ'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Body: sidebar + content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', maxWidth: 1440, width: '100%', margin: '0 auto', flexDirection: isMobile ? 'column' : 'row' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: isMobile ? '100%' : 280,
          background: 'var(--surface)',
          borderRight: isMobile ? 'none' : '1px solid var(--line)',
          borderBottom: isMobile ? '1px solid var(--line)' : 'none',
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}>

          {/* Desktop sidebar header */}
          {!isMobile && (
            <div style={{ flexShrink: 0 }}>
              {/* App header */}
              <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={onClose}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                  title="กลับ">
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)', letterSpacing: '-.01em' }}>ศูนย์ซื้อขาย</span>
              </div>

              {/* Mode switch — pill style */}
              <div style={{ padding: '12px 12px 4px' }}>
                <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 10, padding: 3, gap: 2 }}>
                  {(['sell', 'buy'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                      style={{
                        flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700, borderRadius: 8,
                        background: mode === m ? (m === 'sell' ? '#f97316' : '#2563eb') : 'transparent',
                        color: mode === m ? '#fff' : 'var(--ink-3)',
                        fontFamily: 'inherit', transition: 'all .15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      }}>
                      {m === 'sell'
                        ? <><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> ฝั่งขาย</>
                        : <><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> ฝั่งซื้อ</>
                      }
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nav items */}
          <div style={{
            flex: 1,
            overflowY: isMobile ? 'hidden' : 'auto',
            overflowX: isMobile ? 'auto' : 'hidden',
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            scrollbarWidth: 'none',
            padding: isMobile ? '0 8px' : '8px 8px 0',
          }}>
            {nav.map(item => {
              const active = activeTab === item.k;
              const accentColor = mode === 'sell' ? '#f97316' : '#2563eb';
              const badge = item.k === 'offers'
                ? (mode === 'sell' ? pendingSellOffers : pendingBuyOffers)
                : 0;
              return (
                <button key={item.k} onClick={() => setTab(item.k)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 10,
                    padding: isMobile ? '10px 14px' : '10px 12px',
                    background: active ? (mode === 'sell' ? 'rgba(249,115,22,.1)' : 'rgba(37,99,235,.1)') : 'transparent',
                    border: 'none',
                    borderBottom: isMobile ? `2px solid ${active ? accentColor : 'transparent'}` : 'none',
                    borderRadius: isMobile ? 0 : 'var(--radius)',
                    cursor: 'pointer', fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? accentColor : 'var(--ink-2)',
                    whiteSpace: 'nowrap',
                    transition: '.12s',
                    textAlign: 'left',
                    flexShrink: 0,
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  {!isMobile && <NavIcon k={item.k} mode={mode} active={active} />}
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badge > 0 && (
                    <span style={{
                      minWidth: 18, height: 18, borderRadius: 9, fontSize: 10, fontWeight: 700,
                      background: active ? accentColor : '#ef4444',
                      color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 5px', flexShrink: 0,
                    }}>{badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop: new listing button at bottom of sidebar */}
          {!isMobile && mode === 'sell' && (
            <div style={{ padding: '12px 12px 20px', flexShrink: 0 }}>
              <button onClick={onNewListing}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px 0', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
                สร้างรายการสินค้าใหม่
              </button>
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', minWidth: 0 }}>
          {/* Mobile: new listing button at top of content */}
          {isMobile && mode === 'sell' && (
            <div style={{ padding: '12px 16px 0' }}>
              <button onClick={onNewListing}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px 0', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
                สร้างรายการสินค้าใหม่
              </button>
            </div>
          )}
          {mode === 'sell' && sellTab === 'listings'  && <SellListings token={token} onNewListing={onNewListing} />}
          {mode === 'sell' && sellTab === 'offers'    && <SellOffers token={token} onBadgeChange={setPendingSellOffers} />}
          {mode === 'sell' && sellTab === 'insights'  && <SellInsights token={token} />}
          {mode === 'sell' && sellTab === 'profile'   && <HubProfile session={session} mode="sell" />}
          {mode === 'buy'  && buyTab === 'saved'         && <BuySaved token={token} onOpenChat={onOpenChat ? () => { onClose(); onOpenChat(); } : undefined} onViewProduct={onViewProduct ? (p) => { onClose(); onViewProduct(p); } : undefined} />}
          {mode === 'buy'  && buyTab === 'offers'        && <BuyOffers token={token} />}
          {mode === 'buy'  && buyTab === 'notifications' && <BuyNotifications token={token} />}
          {mode === 'buy'  && buyTab === 'following'     && <BuyFollowing token={token} />}
        </main>
      </div>
    </div>
  );
}

// ─── Nav icon helper ──────────────────────────────────────────────────────────

function NavIcon({ k, mode, active }: { k: string; mode: string; active?: boolean }) {
  const color = active ? (mode === 'sell' ? '#f97316' : '#2563eb') : 'var(--ink-3)';
  const ic: React.CSSProperties = { flexShrink: 0, display: 'block', color };
  if (k === 'listings')  return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>;
  if (k === 'offers')    return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
  if (k === 'insights')  return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>;
  if (k === 'saved')     return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 4h12v16l-6-4-6 4z"/></svg>;
  if (k === 'notifications') return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
  if (k === 'following') return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 5v6M14 8h6"/></svg>;
  // profile / settings
  return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: 900, animation: 'fadeIn .2s ease' }}>
      {children}
    </div>
  );
}

function PageH1({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 4, letterSpacing: '-.02em' }}>{children}</h1>;
}

function PageSub({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24, marginTop: 0 }}>{children}</p>;
}

function Skeleton({ h = 72, n = 4 }: { h?: number; n?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ height: h, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite', animationDelay: `${i * .1}s` }} />
      ))}
    </div>
  );
}

function Err({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div style={{ padding: '14px 16px', background: 'rgba(184,50,22,.07)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--neg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
      {msg}
      {onRetry && <button onClick={onRetry} style={{ border: '1px solid var(--neg)', borderRadius: 'var(--radius-sm)', background: 'none', color: 'var(--neg)', fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}>ลองอีกครั้ง</button>}
    </div>
  );
}

// ─── SELL: Listings ───────────────────────────────────────────────────────────

function SellListings({ token, onNewListing }: { token?: string; onNewListing: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'draft' | 'hidden'>('all');
  const [q, setQ] = useState('');
  const [gridView, setGridView] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [warnDismissed, setWarnDismissed] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [shareOpenId, setShareOpenId] = useState<number | null>(null);
  const shareWrapperRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Close share popover on mousedown outside the wrapper
  useEffect(() => {
    if (shareOpenId === null) return;
    function handleMouseDown(e: MouseEvent) {
      const wrapper = shareWrapperRefs.current[shareOpenId!];
      if (wrapper && !wrapper.contains(e.target as Node)) {
        setShareOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [shareOpenId]);

  function getShareUrl(_p: any) {
    // No dedicated product detail pages yet — share the site home page.
    // Update this when /products/[id] routes are added.
    return window.location.origin;
  }

  async function handleCopy(p: any) {
    await navigator.clipboard.writeText(getShareUrl(p));
    setCopiedId(p.id);
    setShareOpenId(null);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleLineShare(p: any) {
    const url = encodeURIComponent(getShareUrl(p));
    const text = encodeURIComponent(`${p.title ?? 'สินค้า'} — ฿${Number(p.price).toLocaleString()}\n`);
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank', 'width=600,height=500');
    setShareOpenId(null);
  }

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try { setProducts(Array.isArray(await api.getMyProducts(token)) ? await api.getMyProducts(token) : []); }
    catch (e: any) { setError(e?.message || 'โหลดสินค้าไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    if (filter === 'active' && p.status && p.status !== 'active') return false;
    if (filter === 'sold' && p.status !== 'sold' && p.status !== 'sold-out') return false;
    if (filter === 'draft' && p.status !== 'draft') return false;
    if (filter === 'hidden' && p.status !== 'hidden') return false;
    if (q && !p.title?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const cntAll    = products.length;
  const cntActive = products.filter(p => !p.status || p.status === 'active').length;
  const cntSold   = products.filter(p => p.status === 'sold' || p.status === 'sold-out').length;
  const cntDraft  = products.filter(p => p.status === 'draft').length;
  const cntHidden = products.filter(p => p.status === 'hidden').length;

  async function saveEdit() {
    if (!token || editId === null) return;
    setSaving(true);
    try {
      await api.updateProduct(editId, { title: editForm.title.trim(), price: Number(editForm.price), description: editForm.description.trim() }, token);
      setProducts(ps => ps.map(p => p.id === editId ? { ...p, ...editForm, price: Number(editForm.price) } : p));
      setEditId(null);
    } catch (e: any) { setError(e?.message || 'บันทึกไม่สำเร็จ'); }
    finally { setSaving(false); }
  }

  async function confirmDelete(id: number) {
    if (!token) return;
    setDeleting(true);
    try {
      await api.deleteProduct(id, token);
      setProducts(ps => ps.filter(p => p.id !== id));
      setDeleteId(null);
    } catch (e: any) { setError(e?.message || 'ลบไม่สำเร็จ'); }
    finally { setDeleting(false); }
  }

  async function toggleStatus(p: any) {
    if (!token) return;
    const next = (!p.status || p.status === 'active') ? 'sold' : 'active';
    try {
      await api.updateProduct(p.id, { status: next }, token);
      setProducts(ps => ps.map(x => x.id === p.id ? { ...x, status: next } : x));
    } catch {}
  }

  if (!token) return <PageWrap><Err msg="กรุณาเข้าสู่ระบบเพื่อดูรายการสินค้า" /></PageWrap>;

  const filterTabs = [
    { k: 'all',    label: 'ทั้งหมด',   count: cntAll },
    { k: 'active', label: 'กำลังขาย',  count: cntActive },
    { k: 'sold',   label: 'ขายแล้ว',   count: cntSold },
    { k: 'draft',  label: 'ฉบับร่าง',  count: cntDraft },
    { k: 'hidden', label: 'ซ่อนอยู่',  count: cntHidden },
  ];

  return (
    <div style={{ padding: '0 0 60px', animation: 'fadeIn .2s ease' }}>

      {/* Warning banner */}
      {!warnDismissed && (
        <div style={{ background: '#fff4ed', borderBottom: '1px solid #fbd9c2', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3200', marginBottom: 2 }}>
              อัพเดตรายการสินค้าของคุณอยู่เสมอ
            </div>
            <div style={{ fontSize: 12, color: '#a04500' }}>
              รายการสินค้าที่ไม่ได้รับการอัพเดตอาจถูกซ่อนจากการค้นหา
            </div>
          </div>
          <button style={{ fontSize: 12, fontWeight: 600, color: '#c05000', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', flexShrink: 0, textDecoration: 'underline' }}>
            เรียนรู้เพิ่มเติม
          </button>
          <button onClick={() => setWarnDismissed(true)}
            style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.08)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, color: '#7c3200' }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      {/* Header row: title + search + toggle */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-.02em', flex: 1 }}>
          รายการสินค้าของคุณ
        </h1>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '7px 12px', background: 'var(--surface)', minWidth: 200 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={2}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหารายการสินค้า..."
            style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--ink)', fontSize: 13, fontFamily: 'inherit', width: '100%' }} />
        </div>
        {/* List/Grid toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <button onClick={() => setGridView(false)}
            style={{ width: 34, height: 34, border: 'none', background: !gridView ? 'var(--ink)' : 'var(--surface)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={!gridView ? 'var(--bg)' : 'var(--ink-3)'} strokeWidth={2}>
              <rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>
            </svg>
          </button>
          <button onClick={() => setGridView(true)}
            style={{ width: 34, height: 34, border: 'none', background: gridView ? 'var(--ink)' : 'var(--surface)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={gridView ? 'var(--bg)' : 'var(--ink-3)'} strokeWidth={2}>
              <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '0 24px', display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filterTabs.map(({ k, label, count }) => (
          <button key={k} onClick={() => setFilter(k as any)}
            style={{
              padding: '6px 14px', borderRadius: 999,
              border: `1px solid ${filter === k ? 'var(--ink)' : 'var(--line)'}`,
              background: filter === k ? 'var(--ink)' : 'var(--surface)',
              color: filter === k ? 'var(--bg)' : 'var(--ink-2)',
              fontSize: 13, fontWeight: filter === k ? 600 : 400, cursor: 'pointer',
            }}>
            {label} <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: .7, marginLeft: 2 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div style={{ padding: '0 24px 12px' }}><Err msg={error} onRetry={load} /></div>}

      {/* List */}
      <div style={{ padding: '0 24px' }}>
        {loading ? <Skeleton h={180} n={3} /> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              {q ? `ไม่พบรายการที่ค้นหา "${q}"` : filter === 'sold' ? 'ยังไม่มีสินค้าที่ขายได้' : 'ยังไม่มีประกาศ'}
            </div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>เริ่มโพสต์ขายสิ่งที่ไม่ใช้แล้วเลยดีกว่า!</div>
            {!q && <button onClick={onNewListing} style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ ลงขายฟรี</button>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => {
              const tints = IMG_TINTS[p.id % IMG_TINTS.length];
              const imgUrl = p.images?.[0] || p.image_url || null;
              const st = STATUS_MAP[p.status ?? 'active'] ?? STATUS_MAP.active;
              const isEditing = editId === p.id;
              const isDel = deleteId === p.id;
              const isActive = !p.status || p.status === 'active';
              const isSold = p.status === 'sold' || p.status === 'sold-out';
              const isDraft = p.status === 'draft';
              // Mock stats based on product id
              const mockGroups = (p.id % 5) + 1;
              const mockClicks = Math.floor(p.id * 17 + 43) % 200 + 10;
              // Stale warning: show for active listings (mocked: every 3rd product)
              const isStale = isActive && p.id % 3 === 0;
              const dateStr = p.created_at
                ? new Date(p.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')
                : '—';

              return (
                <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                    {/* Large image — radius on image itself so card can overflow for popovers */}
                    <div style={{
                      width: 180, minHeight: 180, flexShrink: 0,
                      background: imgUrl ? undefined : `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                      backgroundImage: imgUrl ? `url(${imgUrl})` : undefined,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      borderRadius: 'var(--radius) 0 0 var(--radius)',
                    }} />

                    {/* Content area */}
                    <div style={{ flex: 1, minWidth: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {/* Stale warning */}
                      {isStale && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neg)', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--neg)', fontWeight: 500 }}>เตือน: ต้องอัพเดตรายการสินค้าของคุณแล้วหรือไม่?</span>
                        </div>
                      )}

                      {/* Title */}
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>

                      {/* Price row */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-.01em', color: 'var(--ink)' }}>
                          ฿{Number(p.price).toLocaleString()}
                        </span>
                        {p.original_price && p.original_price > p.price && (
                          <s style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 400 }}>฿{Number(p.original_price).toLocaleString()}</s>
                        )}
                      </div>

                      {/* Status + date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: st.color }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                          {st.label}
                        </span>
                        {p.is_boosted && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', background: 'linear-gradient(90deg,#111,#333)', color: '#fff' }}>BOOST</span>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>ประกาศเมื่อ {dateStr}</span>
                      </div>

                      {/* Stats */}
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>ลงประกาศใน {mockGroups} กลุ่ม · การคลิกจากการค้นหา {mockClicks} ครั้ง</span>
                        <span title="ข้อมูลเชิงลึก" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                        {isActive && (
                          <>
                            <button onClick={() => toggleStatus(p)}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)' }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--pos)" strokeWidth={2.2}><polyline points="20 6 9 17 4 12"/></svg>
                              ทำเครื่องหมายว่าขายแล้ว
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)' }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2}><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                              โปรโมก
                            </button>
                          </>
                        )}
                        {isDraft && (
                          <>
                            <button onClick={() => toggleStatus(p)}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)' }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              ทำเครื่องหมายว่าขายพร้อมจำหน่าย
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)' }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                              ลงประกาศขายสินค้าอีกครั้ง
                            </button>
                          </>
                        )}
                        {isSold && (
                          <>
                            <button onClick={() => toggleStatus(p)}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)' }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--pos)" strokeWidth={2.2}><polyline points="20 6 9 17 4 12"/></svg>
                              ทำเครื่องหมายว่ามีในสต็อก
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)' }}>
                              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                              ลงประกาศขายสินค้านี้อีกครั้ง
                            </button>
                          </>
                        )}

                        {/* Share button + popover */}
                        <div style={{ position: 'relative' }} ref={el => { shareWrapperRefs.current[p.id] = el; }}>
                          <button onClick={() => setShareOpenId(shareOpenId === p.id ? null : p.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: `1px solid ${copiedId === p.id ? 'var(--pos)' : 'var(--line)'}`, borderRadius: 'var(--radius-sm)', background: copiedId === p.id ? 'rgba(10,122,69,.08)' : 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: copiedId === p.id ? 'var(--pos)' : 'var(--ink-2)', transition: 'all .2s' }}>
                            {copiedId === p.id
                              ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>
                              : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                            }
                            {copiedId === p.id ? 'คัดลอกแล้ว!' : 'แชร์'}
                          </button>
                          {shareOpenId === p.id && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: '0 12px 32px rgba(0,0,0,.15)', minWidth: 200, overflow: 'hidden' }}>
                              {/* Header */}
                              <div style={{ padding: '10px 14px 8px', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                                แชร์สินค้านี้ไปยัง
                              </div>
                              {/* Share options */}
                              {[
                                {
                                  label: 'LINE',
                                  color: '#06C755',
                                  icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="#06C755"><path d="M19.952 11.015c0-4.15-4.162-7.525-9.276-7.525-5.115 0-9.276 3.375-9.276 7.525 0 3.72 3.298 6.835 7.757 7.426.302.065.713.2.817.459.094.235.061.604.03.843l-.132.793c-.04.235-.187.919.805.501 1-.42 5.358-3.155 7.311-5.401C19.402 13.784 19.952 12.461 19.952 11.015z"/></svg>,
                                  onClick: () => handleLineShare(p),
                                },
                                {
                                  label: 'Facebook',
                                  color: '#1877F2',
                                  icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
                                  onClick: () => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(p))}`, '_blank', 'width=600,height=500'); setShareOpenId(null); },
                                },
                                {
                                  label: 'X (Twitter)',
                                  color: '#000',
                                  icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                                  onClick: () => { const txt = encodeURIComponent(`${p.title ?? ''} ฿${Number(p.price).toLocaleString()}`); window.open(`https://twitter.com/intent/tweet?text=${txt}&url=${encodeURIComponent(getShareUrl(p))}`, '_blank', 'width=600,height=500'); setShareOpenId(null); },
                                },
                                {
                                  label: 'WhatsApp',
                                  color: '#25D366',
                                  icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
                                  onClick: () => { const msg = encodeURIComponent(`${p.title ?? ''} ฿${Number(p.price).toLocaleString()}\n${getShareUrl(p)}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); setShareOpenId(null); },
                                },
                              ].map(({ label, icon, onClick }) => (
                                <button key={label} onClick={e => { e.stopPropagation(); onClick(); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                  {icon} {label}
                                </button>
                              ))}
                              {/* Divider + Copy URL */}
                              <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
                              <button onClick={e => { e.stopPropagation(); handleCopy(p); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', background: 'none', border: 'none', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                คัดลอก URL
                              </button>
                            </div>
                          )}
                        </div>


                        {/* More / Edit / Delete */}
                        <button onClick={() => { if (isEditing) setEditId(null); else { setEditId(p.id); setEditForm({ title: p.title ?? '', price: String(p.price ?? ''), description: p.description ?? '' }); } }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: `1px solid ${isEditing ? 'var(--ink)' : 'var(--line)'}`, borderRadius: 'var(--radius-sm)', background: isEditing ? 'var(--ink)' : 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: isEditing ? 'var(--bg)' : 'var(--ink-2)' }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          แก้ไข
                        </button>
                        <button onClick={() => setDeleteId(isDel ? null : p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, width: 32, height: 32, border: `1px solid ${isDel ? 'var(--neg)' : 'var(--line)'}`, borderRadius: 'var(--radius-sm)', background: isDel ? 'rgba(184,50,22,.08)' : 'var(--surface-2)', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={isDel ? 'var(--neg)' : 'var(--ink-3)'} strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete confirm */}
                  {isDel && (
                    <div style={{ padding: '10px 16px', background: 'rgba(184,50,22,.05)', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--neg)' }}>ลบประกาศนี้? ย้อนกลับไม่ได้</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setDeleteId(null)} style={{ padding: '6px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>ยกเลิก</button>
                        <button onClick={() => confirmDelete(p.id)} disabled={deleting}
                          style={{ padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--neg)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {deleting && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                          ลบเลย
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit form */}
                  {isEditing && (
                    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 10, marginBottom: 10 }}>
                        <div>
                          <label style={labelSt}>ชื่อประกาศ</label>
                          <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={inputSt} maxLength={80} />
                        </div>
                        <div>
                          <label style={labelSt}>ราคา (฿)</label>
                          <input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} style={inputSt} min={1} />
                        </div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <label style={labelSt}>คำอธิบาย</label>
                        <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputSt, resize: 'vertical' as const }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditId(null)} style={{ padding: '7px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>ยกเลิก</button>
                        <button onClick={saveEdit} disabled={saving}
                          style={{ padding: '7px 18px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--ink)', color: 'var(--bg)', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {saving && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                          บันทึก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SELL: Insights ───────────────────────────────────────────────────────────

function SellInsights({ token }: { token?: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.getMyProducts(token).then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const totalViews = products.reduce((a, p) => a + (p.views ?? Math.floor(Math.random() * 200 + 20)), 0);
  const active = products.filter(p => !p.status || p.status === 'active').length;
  const sold   = products.filter(p => p.status === 'sold' || p.status === 'sold-out').length;

  const stats = [
    { label: 'ยอดเข้าชม 30 วัน',     value: loading ? '…' : totalViews.toLocaleString(), delta: '+18%', up: true },
    { label: 'กำลังขายอยู่',           value: loading ? '…' : String(active),             delta: '',    up: null },
    { label: 'ขายสำเร็จเดือนนี้',      value: loading ? '…' : String(sold),               delta: '',    up: null },
    { label: 'อัตราการตอบแชท',         value: '96%',                                      delta: '+2%', up: true },
  ];

  const chartData = [18,22,19,28,24,31,36,29,33,41,37,44,48,42,51,46,52,58,54,61,55,63,68,64,72,67,74,81,76,84];
  const max = Math.max(...chartData);
  const W = 700, H = 140, P = 18;
  const step = (W - P * 2) / (chartData.length - 1);
  const pts = chartData.map((v, i) => [P + i * step, H - P - (v / max) * (H - P * 2)] as [number, number]);
  const pathD = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const fillD = pathD + ` L${pts[pts.length-1][0]},${H-P} L${pts[0][0]},${H-P} Z`;

  return (
    <PageWrap>
      <PageH1>ข้อมูลเชิงลึก</PageH1>
      <PageSub>ตัวเลขย้อนหลัง 30 วัน · อัปเดตล่าสุด 2 ชม. ที่แล้ว</PageSub>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)', marginBottom: 4 }}>{s.value}</div>
            {s.up !== null && s.delta && (
              <div style={{ fontSize: 12, color: s.up ? 'var(--pos)' : 'var(--neg)' }}>{s.delta} vs. เดือนก่อน</div>
            )}
          </div>
        ))}
      </div>

      {/* Mini chart */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 20px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>ยอดเข้าชมรายวัน</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            ยอดเข้าชม
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <path d={fillD} fill="color-mix(in srgb,var(--accent) 14%,transparent)" />
          <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth={2} />
          {pts.filter((_, i) => i % 5 === 0).map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="var(--accent)" />
          ))}
        </svg>
      </div>

      {/* Top products */}
      {products.length > 0 && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>สินค้าที่มีผู้สนใจสูงสุด</h3>
          {[...products].slice(0, 4).map((p, i) => {
            const tints = IMG_TINTS[p.id % IMG_TINTS.length];
            const imgUrl = p.images?.[0] || p.image_url;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', flexShrink: 0, background: imgUrl ? `url(${imgUrl}) center/cover` : `linear-gradient(135deg,${tints[0]},${tints[1]})`, backgroundSize: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>฿{Number(p.price).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-3)', flexShrink: 0 }}>
                  <span>{(p.views ?? '—')} เข้าชม</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}

// ─── SELL: Offers (incoming from buyers) ─────────────────────────────────────

function SellOffers({ token, onBadgeChange }: { token?: string; onBadgeChange?: (n: number) => void }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'declined' | 'all'>('pending');
  const [responding, setResponding] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const data = await api.getIncomingOffers(token);
      const list = Array.isArray(data) ? data : [];
      setOffers(list);
      onBadgeChange?.(list.filter((o: any) => o.status === 'pending').length);
    } catch (e: any) { setError(e?.message || 'โหลดไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, [token, onBadgeChange]);

  useEffect(() => { load(); }, [load]);

  async function respond(id: number, status: 'accepted' | 'declined') {
    if (!token) return;
    setResponding(id);
    try {
      await api.respondToOffer(id, status, token);
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      onBadgeChange?.(offers.filter(o => o.id !== id && o.status === 'pending').length);
    } catch (e: any) { setError(e?.message || 'ดำเนินการไม่สำเร็จ'); }
    finally { setResponding(null); }
  }

  if (!token) return <PageWrap><Err msg="กรุณาเข้าสู่ระบบ" /></PageWrap>;

  const counts = {
    pending: offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    declined: offers.filter(o => o.status === 'declined').length,
    all: offers.length,
  };
  const filtered = filter === 'all' ? offers : offers.filter(o => o.status === filter);

  return (
    <PageWrap>
      <PageH1>คำขอราคา</PageH1>
      <PageSub>ผู้ซื้อเสนอราคา · รับหรือปฏิเสธได้ที่นี่</PageSub>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {([
          { k: 'pending',  label: 'รอตอบ',        color: '#f97316' },
          { k: 'accepted', label: 'ยอมรับแล้ว',   color: '#16a34a' },
          { k: 'declined', label: 'ปฏิเสธแล้ว',   color: '#64748b' },
          { k: 'all',      label: 'ทั้งหมด',       color: 'var(--ink-2)' },
        ] as const).map(({ k, label, color }) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{
              padding: '6px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${filter === k ? color : 'var(--line)'}`,
              background: filter === k ? color : 'var(--surface)',
              color: filter === k ? '#fff' : 'var(--ink-2)',
              fontSize: 13, fontWeight: filter === k ? 600 : 400,
            }}>
            {label}
            <span style={{ marginLeft: 5, fontFamily: 'var(--font-mono)', fontSize: 11, opacity: .8 }}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {error && <Err msg={error} onRetry={load} />}
      {loading ? <Skeleton h={100} n={3} /> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
          <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
            {filter === 'pending' ? 'ยังไม่มีคำขอราคาที่รอตอบ' : 'ไม่มีรายการในหมวดนี้'}
          </div>
          <div style={{ fontSize: 13 }}>เมื่อผู้ซื้อเสนอราคา จะปรากฏที่นี่</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((o: any) => {
            const tints = IMG_TINTS[o.id % IMG_TINTS.length];
            const imgUrl = o.product_image || o.image_url || null;
            const pct = o.listing_price > 0
              ? Math.round(((o.amount - o.listing_price) / o.listing_price) * 100)
              : 0;
            const isPending = o.status === 'pending';
            return (
              <div key={o.id} style={{ background: 'var(--surface)', border: `1px solid ${isPending ? '#fed7aa' : 'var(--line)'}`, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {isPending && <div style={{ height: 3, background: 'linear-gradient(90deg,#f97316,#fb923c)' }} />}
                <div style={{ display: 'flex', gap: 14, padding: '14px 16px', alignItems: 'flex-start' }}>
                  {/* Product image */}
                  <div style={{
                    width: 60, height: 60, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                    background: imgUrl ? undefined : `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                  }}>
                    {imgUrl && <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Product title */}
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.product_title ?? o.title ?? 'สินค้า'}
                    </div>
                    {/* Buyer */}
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>
                      จาก: <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{o.buyer_name ?? 'ผู้ซื้อ'}</span>
                      {o.created_at && <span style={{ marginLeft: 8 }}>{new Date(o.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    {/* Price comparison */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: pct < 0 ? '#16a34a' : 'var(--ink)' }}>
                        ฿{Number(o.amount).toLocaleString()}
                      </span>
                      {o.listing_price > 0 && (
                        <>
                          <span style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'line-through' }}>
                            ฿{Number(o.listing_price).toLocaleString()}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: pct < 0 ? '#dc2626' : '#16a34a', background: pct < 0 ? '#fef2f2' : '#f0fdf4', padding: '2px 7px', borderRadius: 999 }}>
                            {pct < 0 ? `${pct}%` : `+${pct}%`}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Status or action buttons */}
                    {isPending ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => respond(o.id, 'accepted')}
                          disabled={responding === o.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', border: 'none', borderRadius: 'var(--radius-sm)', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: responding === o.id ? .6 : 1 }}>
                          {responding === o.id ? <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>}
                          ยอมรับ
                        </button>
                        <button
                          onClick={() => respond(o.id, 'declined')}
                          disabled={responding === o.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', color: 'var(--ink-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: responding === o.id ? .6 : 1 }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          ปฏิเสธ
                        </button>
                      </div>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
                        padding: '4px 12px', borderRadius: 999,
                        background: o.status === 'accepted' ? '#f0fdf4' : '#f8fafc',
                        color: o.status === 'accepted' ? '#16a34a' : '#64748b',
                      }}>
                        {o.status === 'accepted' ? '✓ ยอมรับแล้ว' : '✕ ปฏิเสธแล้ว'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}

// ─── BUY: Offers (outgoing, sent by buyer) ───────────────────────────────────

function BuyOffers({ token }: { token?: string }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'declined' | 'all'>('all');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const data = await api.getOutgoingOffers(token);
      setOffers(Array.isArray(data) ? data : []);
    } catch (e: any) { setError(e?.message || 'โหลดไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (!token) return <PageWrap><Err msg="กรุณาเข้าสู่ระบบ" /></PageWrap>;

  const counts = {
    pending: offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    declined: offers.filter(o => o.status === 'declined').length,
    all: offers.length,
  };
  const filtered = filter === 'all' ? offers : offers.filter(o => o.status === filter);

  const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    pending:  { label: 'รอคำตอบ',     color: '#d97706', bg: '#fffbeb', icon: '⏳' },
    accepted: { label: 'ยอมรับแล้ว!', color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
    declined: { label: 'ปฏิเสธแล้ว',  color: '#64748b', bg: '#f8fafc', icon: '✕' },
  };

  return (
    <PageWrap>
      <PageH1>ข้อเสนอของฉัน</PageH1>
      <PageSub>ราคาที่คุณเสนอผู้ขายไว้ · ติดตามสถานะได้ที่นี่</PageSub>

      {/* Summary cards */}
      {offers.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { k: 'pending',  label: 'รอคำตอบ',     color: '#d97706' },
            { k: 'accepted', label: 'ได้รับการยืนยัน', color: '#16a34a' },
            { k: 'declined', label: 'ไม่ผ่าน',      color: '#64748b' },
          ].map(({ k, label, color }) => (
            <div key={k} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px 14px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => setFilter(k as any)}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color }}>{counts[k as keyof typeof counts]}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {([['all','ทั้งหมด'],['pending','รอคำตอบ'],['accepted','ยอมรับแล้ว'],['declined','ไม่ผ่าน']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding: '5px 13px', borderRadius: 999, border: `1px solid ${filter === k ? '#2563eb' : 'var(--line)'}`, background: filter === k ? '#2563eb' : 'var(--surface)', color: filter === k ? '#fff' : 'var(--ink-2)', fontSize: 12, fontWeight: filter === k ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
            {label} <span style={{ opacity: .7 }}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {error && <Err msg={error} onRetry={load} />}
      {loading ? <Skeleton h={90} n={3} /> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
          <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>ยังไม่มีข้อเสนอ</div>
          <div style={{ fontSize: 13 }}>กดปุ่ม "เสนอราคา" ที่หน้าสินค้าเพื่อต่อรองราคากับผู้ขาย</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((o: any) => {
            const tints = IMG_TINTS[o.id % IMG_TINTS.length];
            const imgUrl = o.product_image || o.image_url || null;
            const cfg = STATUS_CFG[o.status] ?? STATUS_CFG.pending;
            const pct = o.listing_price > 0
              ? Math.round(((o.amount - o.listing_price) / o.listing_price) * 100)
              : 0;
            return (
              <div key={o.id} style={{ display: 'flex', gap: 14, padding: '14px 16px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)', alignItems: 'flex-start' }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: imgUrl ? undefined : `linear-gradient(135deg,${tints[0]},${tints[1]})` }}>
                  {imgUrl && <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.product_title ?? o.title ?? 'สินค้า'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>
                    ผู้ขาย: <span style={{ fontWeight: 600 }}>{o.seller_name ?? '—'}</span>
                    {o.created_at && <span style={{ marginLeft: 8 }}>{new Date(o.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>ฉันเสนอ ฿{Number(o.amount).toLocaleString()}</span>
                    {o.listing_price > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        (ราคาตั้ง ฿{Number(o.listing_price).toLocaleString()} · {pct < 0 ? `${pct}%` : `+${pct}%`})
                      </span>
                    )}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color }}>
                    {cfg.icon} {cfg.label}
                  </span>
                  {o.status === 'accepted' && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#16a34a', background: '#f0fdf4', padding: '8px 12px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                      🎉 ผู้ขายยอมรับราคาของคุณแล้ว! ติดต่อผู้ขายผ่านแชทเพื่อนัดรับสินค้า
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}

// ─── BUY: Saved (Wishlist) ────────────────────────────────────────────────────

function BuySaved({ token, onOpenChat, onViewProduct }: { token?: string; onOpenChat?: () => void; onViewProduct?: (p: any) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError('');
    try { setItems(Array.isArray(await api.getWishlist(token)) ? await api.getWishlist(token) : []); }
    catch (e: any) { setError(e?.message || 'โหลดรายการไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function remove(id: number) {
    setItems(prev => prev.filter(x => x.id !== id));
    if (token) { try { await api.toggleWishlist(id, token); } catch {} }
  }


  if (!token) return <PageWrap><Err msg="กรุณาเข้าสู่ระบบเพื่อดูรายการบันทึก" /></PageWrap>;

  return (
    <PageWrap>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
        <PageH1>บันทึกแล้ว</PageH1>
        {items.length > 0 && (
          <span style={{ fontSize: 13, color: 'var(--ink-3)', paddingTop: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)', marginRight: 2 }}>{items.length}</span> รายการ
          </span>
        )}
      </div>
      <PageSub>สินค้าที่คุณกดหัวใจไว้</PageSub>
      {error && <Err msg={error} onRetry={load} />}
      {loading ? <Skeleton h={80} n={4} /> : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤍</div>
          <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>ยังไม่มีรายการถูกใจ</div>
          <div style={{ fontSize: 13 }}>กดไอคอนหัวใจ ❤️ ที่สินค้าเพื่อบันทึกไว้ที่นี่</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
            {items.map(p => {
              const tints = IMG_TINTS[p.id % IMG_TINTS.length];
              const imgUrl = p.images?.[0] || p.image_url;
              return (
                <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', background: imgUrl ? undefined : `linear-gradient(135deg,${tints[0]},${tints[1]})`, backgroundImage: imgUrl ? `url(${imgUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <button onClick={() => remove(p.id)} title="นำออกจากรายการถูกใจ"
                      style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--line)', background: 'rgba(255,255,255,.85)', display: 'grid', placeItems: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', padding: 0 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24" strokeWidth={1.8} stroke="#b83216" fill="#b83216">
                        <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-.01em', color: 'var(--ink)', marginBottom: 2 }}>
                      ฿{Number(p.price).toLocaleString()}
                      {p.original_price && p.original_price > p.price && (
                        <s style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 400, marginLeft: 6 }}>{Number(p.original_price).toLocaleString()}</s>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{p.title}</div>
                    {p.seller_name && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>{p.seller_name}{p.location ? ` · ${p.location.split('·')[0].trim()}` : ''}</div>}
                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => onOpenChat?.()} style={{ flex: 1, padding: '7px 0', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        แชทกับผู้ขาย
                      </button>
                      <button onClick={() => onViewProduct?.({
                        ...p,
                        images: p.images?.length ? p.images : (p.image_url ? [p.image_url] : []),
                      })} style={{ flex: 1, padding: '7px 0', background: 'none', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ดูสินค้า
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PageWrap>
  );
}

// ─── BUY: Notifications ───────────────────────────────────────────────────────

function BuyNotifications({ token }: { token?: string }) {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const data = await api.getNotifications(token);
      setNotifs(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch (e: any) {
      setError(e?.message || 'โหลดการแจ้งเตือนไม่สำเร็จ');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function markAll() {
    setUnread(0);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    if (token) { try { await api.markNotificationsRead(token); } catch {} }
  }

  const KIND: Record<string, { label: string; color: string }> = {
    'price-drop':   { label: 'ราคาลดลง',          color: 'var(--pos)' },
    'reply':        { label: 'ข้อความตอบกลับ',    color: '#2563eb' },
    'new-listing':  { label: 'ของใหม่จากผู้ขาย',   color: '#7c3aed' },
    'offer':        { label: 'ข้อเสนอ',             color: 'var(--accent)' },
    'similar':      { label: 'ของคล้ายกัน',         color: 'var(--ink-3)' },
    'review':       { label: 'ส่งมอบสำเร็จ',        color: 'var(--pos)' },
  };

  if (!token) return <PageWrap><Err msg="กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือน" /></PageWrap>;

  return (
    <PageWrap>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
        <div>
          <PageH1>การแจ้งเตือน</PageH1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            {unread > 0 ? `${unread} รายการยังไม่ได้อ่าน` : 'อ่านหมดแล้ว'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} style={{ padding: '7px 14px', background: 'none', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer', color: 'var(--ink-2)', whiteSpace: 'nowrap', marginTop: 4 }}>
            ทำเครื่องหมายอ่านทั้งหมด
          </button>
        )}
      </div>
      <div style={{ marginBottom: 24 }} />
      {error && <Err msg={error} onRetry={load} />}
      {loading ? <Skeleton h={68} n={5} /> : notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>ไม่มีการแจ้งเตือน</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.map((n: any, i: number) => {
            const cfg = KIND[n.type ?? n.kind ?? ''] ?? { label: n.type ?? 'แจ้งเตือน', color: 'var(--ink-3)' };
            const isUnread = !n.read && n.is_read !== true;
            return (
              <div key={n.id ?? i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: 'var(--surface)', border: `1px solid ${isUnread ? 'var(--line)' : 'var(--line)'}`, borderRadius: 'var(--radius)', position: 'relative', borderLeft: isUnread ? `3px solid var(--accent)` : '1px solid var(--line)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                    {isUnread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 4 }}>{n.message ?? n.text}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{n.created_at ? new Date(n.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : n.when}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}

// ─── BUY: Following ───────────────────────────────────────────────────────────

function BuyFollowing({ token }: { token?: string }) {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true); setError('');
    try { setSellers(Array.isArray(await api.getFollowing(token)) ? await api.getFollowing(token) : []); }
    catch (e: any) { setError(e?.message || 'โหลดรายการไม่สำเร็จ'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function unfollow(id: number) {
    setSellers(prev => prev.filter(s => (s.seller_id ?? s.id) !== id));
    if (token) { try { await api.toggleFollow(id, token); } catch {} }
  }

  if (!token) return <PageWrap><Err msg="กรุณาเข้าสู่ระบบเพื่อดูรายการติดตาม" /></PageWrap>;

  return (
    <PageWrap>
      <PageH1>กำลังติดตาม</PageH1>
      <PageSub>{sellers.length} ผู้ขายที่คุณติดตามอยู่</PageSub>
      {error && <Err msg={error} onRetry={load} />}
      {loading ? <Skeleton h={80} n={4} /> : sellers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>ยังไม่ได้ติดตามผู้ขายคนใด</div>
          <div style={{ fontSize: 13 }}>เข้าไปที่ร้านค้าและกดติดตาม เพื่อรับข่าวสารสินค้าใหม่</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sellers.map((s: any, i: number) => {
            const sellerId = s.seller_id ?? s.id ?? i;
            const name = s.name ?? s.shop_name ?? s.seller_name ?? `ร้านค้า #${sellerId}`;
            const letter = String(name)[0]?.toUpperCase() ?? '?';
            const tints = IMG_TINTS[sellerId % IMG_TINTS.length];
            return (
              <div key={sellerId} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                {s.avatar_url ? (
                  <img src={s.avatar_url} alt="" width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${tints[0]},${tints[1]})`, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16, color: '#fff' }}>{letter}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{name}</span>
                    {(s.new_badge ?? s.newBadge ?? 0) > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'var(--accent)', color: '#fff' }}>
                        {s.new_badge ?? s.newBadge} ใหม่
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#e6a817', marginBottom: 2 }}>
                    ★ {s.rating ?? '4.8'} <span style={{ color: 'var(--ink-3)' }}>({s.reviews ?? s.review_count ?? 0} รีวิว)</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    ลงขายอยู่ {s.items_count ?? s.items ?? '—'} รายการ · ประกาศล่าสุด {s.followed_at ? new Date(s.followed_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : (s.lastPost ?? '—')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button style={{ padding: '7px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                    ดูร้าน
                  </button>
                  <button onClick={() => unfollow(sellerId)}
                    style={{ padding: '7px 14px', border: '1px solid var(--ink)', borderRadius: 'var(--radius-sm)', background: 'var(--ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--bg)', whiteSpace: 'nowrap' }}>
                    กำลังติดตาม ✓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}

// ─── Shared: Hub Profile / Shop Settings ─────────────────────────────────────

function HubProfile({ session, mode }: { session: any; mode: string }) {
  const user = session?.user;
  const letter = user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <PageWrap>
      <PageH1>ตั้งค่าร้านค้า</PageH1>
      <PageSub>ข้อมูลโปรไฟล์และการตั้งค่าของคุณ</PageSub>

      {/* Profile card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {user?.image
            ? <img src={user.image} alt="" width={60} height={60} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>{letter}</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 3 }}>{user?.name ?? 'ผู้ใช้'}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{user?.email ?? '—'}</div>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 22px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, marginTop: 0 }}>ข้อมูลบัญชี</h3>
        {[
          { k: 'ชื่อ', v: user?.name ?? '—' },
          { k: 'อีเมล', v: user?.email ?? '—' },
          { k: 'ประเภทบัญชี', v: user?.image?.includes('google') ? 'Google' : user?.image?.includes('facebook') ? 'Facebook' : 'Email' },
        ].map(({ k, v }) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
            <span style={{ color: 'var(--ink-3)' }}>{k}</span>
            <span style={{ fontWeight: 500, color: 'var(--ink)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Tips section based on mode */}
      <div style={{ background: mode === 'sell' ? '#fff7ed' : '#eff6ff', border: `1px solid ${mode === 'sell' ? '#fed7aa' : '#bfdbfe'}`, borderRadius: 'var(--radius)', padding: '16px 20px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: mode === 'sell' ? '#c2410c' : '#1d4ed8', marginBottom: 12, marginTop: 0 }}>
          {mode === 'sell' ? '💡 เคล็ดลับสำหรับผู้ขาย' : '💡 เคล็ดลับสำหรับผู้ซื้อ'}
        </h3>
        <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mode === 'sell' ? [
            'ถ่ายรูปสินค้าในแสงธรรมชาติ — เพิ่มโอกาสขายได้ถึง 40%',
            'ตอบแชทไวขึ้น → ติดตาม "คำขอราคา" ในแท็บนี้เสมอ',
            'ตั้งราคาเผื่อต่อรองไว้ 10-15% ให้ผู้ซื้อรู้สึกได้ดีล',
            'อัปเดตสถานะสินค้าเมื่อขายแล้วเพื่อรักษาความน่าเชื่อถือ',
          ] : [
            'กด "เสนอราคา" เพื่อต่อรองกับผู้ขายโดยตรง',
            'ติดตามร้านที่ชอบเพื่อรับแจ้งเตือนสินค้าใหม่',
            'นัดรับสินค้าในพื้นที่สาธารณะเสมอ เพื่อความปลอดภัย',
            'ตรวจสอบสินค้าก่อนจ่ายเงินทุกครั้ง',
          ].map((tip, i) => (
            <li key={i} style={{ fontSize: 13, color: mode === 'sell' ? '#9a3412' : '#1e40af', lineHeight: 1.6 }}>{tip}</li>
          ))}
        </ul>
      </div>
    </PageWrap>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const labelSt: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--ink-3)', marginBottom: 4,
  textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-mono)',
};

const inputSt: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', color: 'var(--ink)',
  fontFamily: 'inherit', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};
