'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

// ─── Props ───────────────────────────────────────────────────────────────────

interface MyHubProps {
  mode?: 'sell' | 'buy';
  initialTab?: string;
  onClose: () => void;
  onNewListing: () => void;
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
  { k: 'listings',  label: 'รายการสินค้าของคุณ' },
  { k: 'insights',  label: 'ข้อมูลเชิงลึก' },
  { k: 'news',      label: 'ข่าวประกาศ' },
  { k: 'profile',   label: 'โปรไฟล์ Marketplace' },
];

const BUY_NAV = [
  { k: 'activity',      label: 'กิจกรรมล่าสุด' },
  { k: 'saved',         label: 'บันทึกแล้ว' },
  { k: 'notifications', label: 'การแจ้งเตือน' },
  { k: 'following',     label: 'กำลังติดตาม' },
  { k: 'profile',       label: 'โปรไฟล์ Marketplace' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function MyHub({ mode: initialMode = 'sell', initialTab, onClose, onNewListing }: MyHubProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const isMobile = useBreakpoint(768);
  const [mode, setMode] = useState<'sell' | 'buy'>(initialMode);
  const [sellTab, setSellTab] = useState(
    initialMode === 'sell' && initialTab ? initialTab : 'listings'
  );
  const [buyTab, setBuyTab] = useState(
    initialMode === 'buy' && initialTab ? initialTab : 'activity'
  );

  // Scroll lock + ESC
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', h); };
  }, [onClose]);

  const nav = mode === 'sell' ? SELL_NAV : BUY_NAV;
  const activeTab = mode === 'sell' ? sellTab : buyTab;
  const setTab = (t: string) => mode === 'sell' ? setSellTab(t) : setBuyTab(t);

  return (
    <div data-testid="v8hub" style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 190, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>

      {/* ── Top bar (mobile: full header; desktop: logo row) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: isMobile ? '14px 16px' : '14px 20px',
        background: 'var(--surface)', borderBottom: '1px solid var(--line)',
        flexShrink: 0,
      }}>
        <button onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', fontSize: 13, padding: '6px 10px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          {!isMobile && 'Marketplace'}
        </button>

        {/* Mode switch */}
        <div style={{
          display: 'flex', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--line)', background: 'var(--surface-2)',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {(['sell', 'buy'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                padding: isMobile ? '7px 16px' : '7px 20px', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: mode === m ? 'var(--ink)' : 'transparent',
                color: mode === m ? 'var(--bg)' : 'var(--ink-2)',
                transition: '.15s',
              }}>
              {m === 'sell' ? 'ขาย' : 'ซื้อ'}
            </button>
          ))}
        </div>

        {/* Mobile: current tab label */}
        {isMobile && (
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', flex: 1, textAlign: 'center' }}>
            {nav.find(n => n.k === activeTab)?.label ?? ''}
          </span>
        )}

        <div style={{ marginLeft: 'auto' }}>
          {mode === 'sell' && (
            <button onClick={onNewListing}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14"/></svg>
              {isMobile ? 'ลงขายใหม่' : 'สร้างรายการสินค้าใหม่'}
            </button>
          )}
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div style={{ flex: 1, display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '300px 1fr', overflow: 'hidden' }}>

        {/* ── Sidebar (desktop) / Tab strip (mobile) ── */}
        <aside style={{
          borderRight: isMobile ? 'none' : '1px solid var(--line)',
          borderBottom: isMobile ? '1px solid var(--line)' : 'none',
          background: 'var(--surface)',
          display: 'flex', flexDirection: isMobile ? 'row' : 'column',
          overflowX: isMobile ? 'auto' : 'hidden',
          overflowY: isMobile ? 'hidden' : 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none',
          padding: isMobile ? '0 8px' : '12px 0',
        }}>
          {nav.map(item => {
            const active = activeTab === item.k;
            return (
              <button key={item.k} onClick={() => setTab(item.k)}
                style={{
                  display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 12,
                  padding: isMobile ? '10px 14px' : '10px 20px',
                  background: active ? 'var(--surface-2)' : 'none',
                  border: 'none',
                  borderBottom: isMobile ? (active ? '2px solid var(--ink)' : '2px solid transparent') : 'none',
                  borderLeft: isMobile ? 'none' : (active ? '3px solid var(--ink)' : '3px solid transparent'),
                  cursor: 'pointer', fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--ink)' : 'var(--ink-2)',
                  whiteSpace: 'nowrap',
                  borderRadius: isMobile ? 0 : undefined,
                  transition: '.12s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}>
                {!isMobile && <NavIcon k={item.k} mode={mode} />}
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          {mode === 'sell' && sellTab === 'listings'  && <SellListings token={token} onNewListing={onNewListing} />}
          {mode === 'sell' && sellTab === 'insights'  && <SellInsights token={token} />}
          {mode === 'sell' && sellTab === 'news'      && <SellNews />}
          {mode === 'sell' && sellTab === 'profile'   && <HubProfile session={session} mode="sell" />}
          {mode === 'buy'  && buyTab === 'activity'      && <BuyActivity />}
          {mode === 'buy'  && buyTab === 'saved'         && <BuySaved token={token} />}
          {mode === 'buy'  && buyTab === 'notifications' && <BuyNotifications token={token} />}
          {mode === 'buy'  && buyTab === 'following'     && <BuyFollowing token={token} />}
          {mode === 'buy'  && buyTab === 'profile'       && <HubProfile session={session} mode="buy" />}
        </main>
      </div>
    </div>
  );
}

// ─── Nav icon helper ──────────────────────────────────────────────────────────

function NavIcon({ k, mode }: { k: string; mode: string }) {
  const ic: React.CSSProperties = { flexShrink: 0, display: 'block' };
  if (k === 'listings')  return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>;
  if (k === 'insights')  return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>;
  if (k === 'news')      return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 6h16M4 10h12M4 14h8M4 18h6"/></svg>;
  if (k === 'activity')  return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;
  if (k === 'saved')     return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 4h12v16l-6-4-6 4z"/></svg>;
  if (k === 'notifications') return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
  if (k === 'following') return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 5v6M14 8h6"/></svg>;
  // profile
  return <svg style={ic} viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
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
                <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                    {/* Large image */}
                    <div style={{
                      width: 180, minHeight: 180, flexShrink: 0,
                      background: imgUrl ? undefined : `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                      backgroundImage: imgUrl ? `url(${imgUrl})` : undefined,
                      backgroundSize: 'cover', backgroundPosition: 'center',
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

                        {/* Share button */}
                        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--ink-2)' }}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                          แชร์
                        </button>

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

// ─── SELL: News ───────────────────────────────────────────────────────────────

function SellNews() {
  const items = [
    { tag: 'ใหม่',     tagColor: '#2563eb', h: 'Boost ราคาพิเศษ ฿19 ในเดือนนี้',            d: 'เพิ่มยอดคนเห็น 8-12 เท่า สำหรับประกาศที่ลงในช่วง 1-31 ของเดือน',         when: '2 วันที่แล้ว' },
    { tag: 'นโยบาย',   tagColor: '#7c3aed', h: 'เงื่อนไขการซื้อขายสินค้าสะสม',              d: 'สำหรับหมวดของสะสม ต้องระบุสภาพและรูปจริงอย่างชัดเจน เพื่อป้องกันการคืน', when: '1 สัปดาห์ที่แล้ว' },
    { tag: 'เคล็ดลับ', tagColor: '#059669', h: '5 เคล็ดลับถ่ายรูปสินค้าให้ขายดีกว่า',       d: 'แสงธรรมชาติ · มุมมอง 3 ด้าน · ฉากหลังเรียบ · ระยะชิด · รายละเอียดตำหนิ', when: '2 สัปดาห์ที่แล้ว' },
    { tag: 'สำคัญ',    tagColor: '#dc2626', h: 'บำรุงรักษาระบบ — PloiShip ช่วงเช้ามืด',    d: 'ระบบ PloiShip อาจหยุดชั่วคราว 02:00-04:00 น. วันอาทิตย์ที่ 26 เม.ย.',    when: '3 สัปดาห์ที่แล้ว' },
  ];
  return (
    <PageWrap>
      <PageH1>ข่าวประกาศ</PageH1>
      <PageSub>ข่าวและอัปเดตสำหรับผู้ขาย</PageSub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: it.tagColor + '18', color: it.tagColor, letterSpacing: '.04em', textTransform: 'uppercase' as const }}>{it.tag}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 'auto' }}>{it.when}</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px' }}>{it.h}</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 12px', lineHeight: 1.6 }}>{it.d}</p>
            <button style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>อ่านเพิ่มเติม →</button>
          </div>
        ))}
      </div>
    </PageWrap>
  );
}

// ─── BUY: Activity ────────────────────────────────────────────────────────────

function ActivityIcon({ kind }: { kind: string }) {
  if (kind === 'viewed') return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.8}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  if (kind === 'messaged') return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={1.8}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
  if (kind === 'saved') return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth={1.8}>
      <path d="M6 4h12v16l-6-4-6 4z"/>
    </svg>
  );
  // offered
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.8}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

function BuyActivity() {
  const items: { kind: string; title: string; seller: string; location: string; price: number; when: string }[] = [
    { kind: 'viewed',   title: 'iPhone 15 Pro Max 256GB สีดำ',       seller: 'TechBKK',     location: 'กรุงเทพ · พระราม 9',    price: 38900, when: '5 นาทีที่แล้ว' },
    { kind: 'messaged', title: 'MacBook Air M3 512GB Space Gray',      seller: 'iShopThana',  location: 'นนทบุรี · บางใหญ่',     price: 52000, when: '1 ชม.ที่แล้ว' },
    { kind: 'saved',    title: 'AirPods Pro 2nd Gen ของแท้มือหนึ่ง', seller: 'GadgetHub',   location: 'กรุงเทพ · ลาดพร้าว',    price: 7800,  when: '3 ชม.ที่แล้ว' },
    { kind: 'offered',  title: 'จักรยาน Trek FX 3 Disc Size M',       seller: 'BikeStation', location: 'เชียงใหม่ · นิมมาน',    price: 18500, when: 'วานนี้' },
    { kind: 'viewed',   title: 'Sony WH-1000XM5 สภาพเยี่ยม',          seller: 'SoundGear',   location: 'กรุงเทพ · อโศก',        price: 8500,  when: '2 วันที่แล้ว' },
    { kind: 'saved',    title: 'Nintendo Switch OLED สีขาว',           seller: 'GameZone',    location: 'กรุงเทพ · สยาม',        price: 11500, when: '3 วันที่แล้ว' },
  ];

  const kindColor: Record<string, string> = {
    viewed: 'var(--ink-3)',
    messaged: '#2563eb',
    saved: '#7c3aed',
    offered: 'var(--accent)',
  };
  const kindLabel: Record<string, string> = {
    viewed: 'เพิ่งดู',
    messaged: 'ส่งข้อความ',
    saved: 'บันทึก',
    offered: 'ยื่นข้อเสนอ',
  };

  return (
    <PageWrap>
      <PageH1>กิจกรรมล่าสุด</PageH1>
      <PageSub>ของที่คุณดู · ข้อความ · ข้อเสนอ · บันทึก</PageSub>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((a, i) => {
          const tints = IMG_TINTS[i % IMG_TINTS.length];
          const color = kindColor[a.kind] ?? 'var(--ink-3)';
          const label = kindLabel[a.kind] ?? a.kind;
          return (
            <div key={i}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer', borderRadius: 0, transition: 'background .12s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

              {/* Type icon */}
              <div style={{ width: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIcon kind={a.kind} />
              </div>

              {/* Product thumbnail */}
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                background: `linear-gradient(135deg,${tints[0]},${tints[1]})`,
              }} />

              {/* Info column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.seller} · {a.location}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>฿{a.price.toLocaleString()}</div>
              </div>

              {/* Timestamp */}
              <div style={{ fontSize: 12, color: 'var(--ink-3)', flexShrink: 0, whiteSpace: 'nowrap' }}>{a.when}</div>
            </div>
          );
        })}
      </div>
    </PageWrap>
  );
}

// ─── BUY: Saved (Wishlist) ────────────────────────────────────────────────────

function BuySaved({ token }: { token?: string }) {
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

  const total = items.reduce((s, x) => s + (Number(x.price) || 0), 0);

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
                    {p.seller_name && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.seller_name}{p.location ? ` · ${p.location.split('·')[0].trim()}` : ''}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Footer total */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>มูลค่ารวม {items.length} รายการ</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)' }}>฿{total.toLocaleString()}</span>
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

// ─── Shared: Hub Profile ──────────────────────────────────────────────────────

function HubProfile({ session, mode }: { session: any; mode: string }) {
  const user = session?.user;
  const letter = user?.name?.[0]?.toUpperCase() ?? '?';
  return (
    <PageWrap>
      <PageH1>โปรไฟล์ Marketplace</PageH1>
      <PageSub>ข้อมูลที่ผู้ซื้อ-ผู้ขายรายอื่นจะเห็น</PageSub>

      {/* Profile card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {user?.image ? (
            <img src={user.image} alt="" width={60} height={60} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>{letter}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{user?.name ?? 'ผู้ใช้'}</div>
            <div style={{ fontSize: 13, color: '#e6a817', marginBottom: 2 }}>★ 4.9 <span style={{ color: 'var(--ink-3)' }}>(48 รีวิว)</span> · <span style={{ color: 'var(--ink-3)' }}>สมาชิกตั้งแต่ 2563</span></div>
          </div>
          <button style={{ padding: '8px 16px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', fontSize: 13, cursor: 'pointer', color: 'var(--ink-2)', fontWeight: 600, alignSelf: 'flex-start' }}>
            แก้ไขโปรไฟล์
          </button>
        </div>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {[
            { v: 3, l: 'กำลังขาย' },
            { v: 1, l: 'ขายแล้ว' },
            { v: 5, l: 'กำลังติดตาม' },
            { v: 124, l: 'ผู้ติดตาม' },
          ].map(({ v, l }) => (
            <div key={l} style={{ background: 'var(--surface)', padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 22px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, marginTop: 0 }}>ข้อมูลติดต่อ</h3>
        {[
          { k: 'อีเมล', v: user?.email ?? '—' },
          { k: 'พื้นที่', v: 'กรุงเทพฯ · พระราม 9' },
        ].map(({ k, v }) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
            <span style={{ color: 'var(--ink-3)' }}>{k}</span>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Reviews section */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 22px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, marginTop: 0 }}>รีวิวล่าสุด</h3>
        {[
          { ava: 'W', n: 'Warot S.',  s: 5, d: 'ของตรงปก ส่งเร็วมาก แพ็คดี แนะนำเลยครับ', when: '3 วันที่แล้ว' },
          { ava: 'N', n: 'Napat T.',  s: 5, d: 'ผู้ขายใจดี ตอบเร็ว สินค้าเหมือนรูปเป๊ะ', when: '1 สัปดาห์' },
          { ava: 'P', n: 'Ploy K.',   s: 4, d: 'สินค้าโอเค แต่กล่องบุบนิดหน่อย ผู้ขายขอโทษและชดเชย', when: '2 สัปดาห์' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', flexShrink: 0 }}>{r.ava}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{r.n}</span>
                <span style={{ fontSize: 12, color: '#e6a817', letterSpacing: 1 }}>{'★'.repeat(r.s)}{'☆'.repeat(5 - r.s)}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 4 }}>{r.d}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{r.when}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 22px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, marginTop: 0 }}>การตั้งค่าความเป็นส่วนตัว</h3>
        {[
          { label: 'แสดงเบอร์โทรแก่ผู้ซื้อ', on: false },
          { label: 'รับข่าวสารทางอีเมล', on: true },
          { label: 'แสดงสถานะออนไลน์', on: true },
        ].map(({ label, on }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
            <span style={{ color: 'var(--ink-2)' }}>{label}</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? 'var(--accent)' : 'var(--line)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 2, left: on ? 18 : 2, transition: '.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </div>
          </div>
        ))}
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
