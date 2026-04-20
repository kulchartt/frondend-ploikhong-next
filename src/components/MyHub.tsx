'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

interface MyHubProps {
  onClose: () => void;
  onNewListing: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'กำลังขาย',  color: 'var(--pos)',  bg: 'rgba(10,122,69,.1)' },
  sold:     { label: 'ขายแล้ว',   color: 'var(--ink-3)', bg: 'var(--surface-2)' },
  inactive: { label: 'ปิดประกาศ', color: 'var(--warn)', bg: 'rgba(168,90,0,.1)' },
};

const IMG_TINTS = [
  ['#d4a59a','#c8866e'],['#a5c4d4','#7ba8c8'],['#b8d4a5','#8ec87b'],
  ['#d4c4a5','#c8a87b'],['#c4a5d4','#a87bc8'],['#a5d4c4','#7bc8a8'],
  ['#d4d4a5','#c8c87b'],['#c4a5a5','#c87b7b'],['#a5b4d4','#7b8ec8'],
  ['#d4b4a5','#c8987b'],['#b4d4a5','#98c87b'],['#d4a5c4','#c87ba8'],
];

type Tab = 'all' | 'active' | 'sold';

export function MyHub({ onClose, onNewListing }: MyHubProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const isMobile = useBreakpoint(768);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ESC to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyProducts(token);
      setProducts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'โหลดสินค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    if (tab === 'all') return true;
    if (tab === 'active') return !p.status || p.status === 'active';
    if (tab === 'sold') return p.status === 'sold';
    return true;
  });

  function startEdit(p: any) {
    setEditId(p.id);
    setEditForm({ title: p.title ?? '', price: String(p.price ?? ''), description: p.description ?? '' });
  }

  async function saveEdit() {
    if (!token || editId === null) return;
    setSaving(true);
    try {
      await api.updateProduct(editId, {
        title: editForm.title.trim(),
        price: Number(editForm.price),
        description: editForm.description.trim(),
      }, token);
      setProducts(ps => ps.map(p => p.id === editId
        ? { ...p, title: editForm.title.trim(), price: Number(editForm.price), description: editForm.description.trim() }
        : p
      ));
      setEditId(null);
    } catch (e: any) {
      setError(e?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: number) {
    if (!token) return;
    setDeleting(true);
    try {
      await api.deleteProduct(id, token);
      setProducts(ps => ps.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      setError(e?.message || 'ลบไม่สำเร็จ');
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(p: any) {
    if (!token) return;
    const next = (!p.status || p.status === 'active') ? 'sold' : 'active';
    try {
      await api.updateProduct(p.id, { status: next }, token);
      setProducts(ps => ps.map(x => x.id === p.id ? { ...x, status: next } : x));
    } catch {}
  }

  const totalActive = products.filter(p => !p.status || p.status === 'active').length;
  const totalSold = products.filter(p => p.status === 'sold').length;
  const avatarLetter = session?.user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 250,
        background: 'rgba(0,0,0,.45)',
        display: 'flex', justifyContent: 'flex-end',
      }}>
      <style>{`
        @keyframes hubSlide { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: isMobile ? '100%' : 480,
          height: '100%',
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,.2)',
          animation: 'hubSlide .28s cubic-bezier(.2,.8,.2,1)',
          overflow: 'hidden',
        }}>

        {/* ── Header ── */}
        <div style={{ padding: '18px 20px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            {/* Avatar */}
            {session?.user?.image ? (
              <img src={session.user.image} alt="" width={44} height={44}
                style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                {avatarLetter}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.user?.name ?? 'ผู้ขาย'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{session?.user?.email}</div>
            </div>
            <button onClick={onClose}
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" stroke="var(--ink)" fill="none" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'ประกาศทั้งหมด', val: products.length },
              { label: 'กำลังขาย', val: totalActive },
              { label: 'ขายแล้ว', val: totalSold },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs + New listing button ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 20px', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
          {(['all', 'active', 'sold'] as Tab[]).map(t => {
            const labels: Record<Tab, string> = { all: 'ทั้งหมด', active: 'กำลังขาย', sold: 'ขายแล้ว' };
            return (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? 'var(--ink)' : 'var(--ink-3)',
                  borderBottom: tab === t ? '2px solid var(--ink)' : '2px solid transparent',
                  transition: '.15s',
                }}>
                {labels[t]}
                <span style={{ marginLeft: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                  {t === 'all' ? products.length : t === 'active' ? totalActive : totalSold}
                </span>
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button onClick={onNewListing}
            style={{ padding: '7px 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + ลงขายใหม่
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ margin: '12px 20px 0', padding: '10px 14px', background: 'rgba(184,50,22,.08)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--neg)' }}>
            {error}
          </div>
        )}

        {/* ── List ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 24px' }}>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 88, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                {tab === 'sold' ? 'ยังไม่มีสินค้าที่ขายได้' : 'ยังไม่มีประกาศ'}
              </div>
              <div style={{ fontSize: 13, marginBottom: 18 }}>เริ่มโพสต์ขายเลยดีกว่า!</div>
              <button onClick={onNewListing}
                style={{ padding: '10px 22px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                + ลงขายฟรี
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(p => {
                const tints = IMG_TINTS[p.id % IMG_TINTS.length];
                const imgUrl = p.images?.[0] || p.image_url || null;
                const st = STATUS_LABELS[p.status ?? 'active'] ?? STATUS_LABELS.active;
                const isEditing = editId === p.id;
                const isDeleting = deleteConfirm === p.id;

                return (
                  <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>

                    {/* Main row */}
                    <div style={{ display: 'flex', gap: 12, padding: '12px 14px', alignItems: 'flex-start' }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: 64, height: 64, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                        background: imgUrl ? `url(${imgUrl}) center/cover` : `linear-gradient(135deg,${tints[0]},${tints[1]})`,
                        backgroundSize: 'cover',
                      }} />

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-.01em', marginBottom: 6 }}>
                          ฿{Number(p.price).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, color: st.color, background: st.bg }}>
                            {st.label}
                          </span>
                          {p.is_boosted && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', background: 'linear-gradient(90deg,#111,#333)', color: '#fff' }}>BOOST</span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {/* Toggle sold */}
                        <button
                          onClick={() => toggleStatus(p)}
                          title={(!p.status || p.status === 'active') ? 'ทำเครื่องหมายว่าขายแล้ว' : 'เปิดประกาศใหม่'}
                          style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={(!p.status || p.status === 'active') ? 'var(--pos)' : 'var(--ink-3)'} strokeWidth={2}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => isEditing ? setEditId(null) : startEdit(p)}
                          style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: `1px solid ${isEditing ? 'var(--ink)' : 'var(--line)'}`, background: isEditing ? 'var(--ink)' : 'var(--surface-2)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={isEditing ? 'var(--bg)' : 'var(--ink-2)'} strokeWidth={2}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirm(isDeleting ? null : p.id)}
                          style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: `1px solid ${isDeleting ? 'var(--neg)' : 'var(--line)'}`, background: isDeleting ? 'rgba(184,50,22,.08)' : 'var(--surface-2)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={isDeleting ? 'var(--neg)' : 'var(--ink-3)'} strokeWidth={2}>
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Delete confirm bar */}
                    {isDeleting && (
                      <div style={{ padding: '10px 14px', background: 'rgba(184,50,22,.06)', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontSize: 13, color: 'var(--neg)' }}>ลบประกาศนี้? ย้อนกลับไม่ได้</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setDeleteConfirm(null)}
                            style={{ padding: '6px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>
                            ยกเลิก
                          </button>
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
                      <div style={{ padding: '14px 14px 16px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, marginBottom: 10 }}>
                          <div>
                            <label style={labelStyle}>ชื่อประกาศ</label>
                            <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                              style={inlineInputStyle} maxLength={80} />
                          </div>
                          <div>
                            <label style={labelStyle}>ราคา (฿)</label>
                            <input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                              style={inlineInputStyle} min={1} />
                          </div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <label style={labelStyle}>คำอธิบาย</label>
                          <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            rows={3} style={{ ...inlineInputStyle, resize: 'vertical' as const }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditId(null)}
                            style={{ padding: '7px 14px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>
                            ยกเลิก
                          </button>
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
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--ink-3)', marginBottom: 4, textTransform: 'uppercase',
  letterSpacing: '.06em', fontFamily: 'var(--font-mono)',
};

const inlineInputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', color: 'var(--ink)',
  fontFamily: 'inherit', fontSize: 13, outline: 'none',
};
