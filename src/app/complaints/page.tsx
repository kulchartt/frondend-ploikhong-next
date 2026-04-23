'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';

interface Complaint {
  id: number;
  type: string;
  detail: string;
  contact: string | null;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

interface Message {
  id: number;
  complaint_id: number;
  sender_type: 'user' | 'admin';
  content: string;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  fraud: '🚨 ถูกโกง', product: '📦 สินค้า', user: '👤 ผู้ใช้', payment: '💳 การชำระ', other: '📝 อื่นๆ',
};

const TYPE_OPTIONS = [
  { value: 'fraud',   label: '🚨 ถูกโกง / หลอกลวง' },
  { value: 'product', label: '📦 สินค้าไม่ตรงปก' },
  { value: 'user',    label: '👤 พฤติกรรมไม่เหมาะสม' },
  { value: 'payment', label: '💳 ปัญหาการชำระเงิน' },
  { value: 'other',   label: '📝 อื่นๆ' },
];

const STATUS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: 'รอดำเนินการ',   color: '#d97706', bg: '#fef3c7', icon: '⏳' },
  reviewing: { label: 'กำลังตรวจสอบ', color: '#2563eb', bg: '#eff6ff', icon: '🔍' },
  resolved:  { label: 'แก้ไขแล้ว',     color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
  rejected:  { label: 'ปฏิเสธ',        color: '#dc2626', bg: '#fff5f5', icon: '❌' },
};

// ─── Icons ───────────────────────────────────────────────────────────────────
function IconBack() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function IconPlus() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1={12} y1={5} x2={12} y2={19}/><line x1={5} y1={12} x2={19} y2={12}/></svg>;
}
function IconAlert() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></svg>;
}
function IconSend() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1={22} y1={2} x2={11} y2={13}/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function IconClose() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1={6} y1={6} x2={18} y2={18}/><line x1={18} y1={6} x2={6} y2={18}/></svg>;
}

// ─── New Complaint Modal ──────────────────────────────────────────────────────
function NewComplaintModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const { data: session } = useSession();
  const [form, setForm] = useState({ type: 'fraud', detail: '', contact: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app';
      await fetch(`${API}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, user_id: (session as any)?.userId || null }),
      });
      setSent(true);
      setTimeout(() => { onSent(); onClose(); }, 1500);
    } catch { setSent(true); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,.2)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', color: '#dc2626' }}><IconAlert /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>ส่งเรื่องร้องเรียน</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>ทีมงานจะดำเนินการภายใน 24 ชั่วโมง</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4 }}><IconClose /></button>
        </div>
        {sent ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 6 }}>รับเรื่องแล้ว!</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>ทีมงานจะตรวจสอบภายใน 24 ชั่วโมง</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>ประเภทปัญหา</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>รายละเอียด <span style={{ color: 'var(--neg)' }}>*</span></label>
              <textarea value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
                required rows={4} placeholder="อธิบายปัญหาที่พบให้ละเอียด..."
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>ช่องทางติดต่อกลับ <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(ไม่บังคับ)</span></label>
              <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                placeholder="เบอร์โทร / LINE ID / อีเมล"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading || !form.detail.trim()}
              style={{ padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !form.detail.trim()) ? .6 : 1, fontFamily: 'inherit' }}>
              {loading ? 'กำลังส่ง…' : '📨 ส่งเรื่องร้องเรียน'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({ complaint, token }: { complaint: Complaint; token: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const s = STATUS[complaint.status] || { label: complaint.status, color: '#64748b', bg: '#f1f5f9', icon: '📋' };

  useEffect(() => {
    setMessages([]);
    setDraft('');
    api.getComplaintMessages(complaint.id, token)
      .then(setMessages)
      .catch(() => {});
  }, [complaint.id, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setSending(true);
    setDraft('');
    try {
      const msg = await api.sendComplaintMessage(complaint.id, text, token);
      setMessages(prev => [...prev, msg]);
    } catch { setDraft(text); } // restore on error
    finally { setSending(false); }
  }

  function fmt(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  const isResolved = complaint.status === 'resolved' || complaint.status === 'rejected';

  return (
    <>
      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
        {/* Status pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ padding: '6px 14px', background: s.bg, borderRadius: 999, fontSize: 12, color: s.color, fontWeight: 600 }}>
            {s.icon} {s.label}
          </div>
        </div>

        {/* Original complaint as first user bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ maxWidth: '75%' }}>
            <div style={{ background: '#dc2626', color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {complaint.detail}
            </div>
            {complaint.contact && (
              <div style={{ background: '#fca5a5', color: '#7f1d1d', borderRadius: '4px 4px 4px 16px', padding: '8px 14px', fontSize: 13, marginTop: 3 }}>
                📞 {complaint.contact}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, textAlign: 'right' }}>
              คุณ · {fmt(complaint.created_at)}
            </div>
          </div>
        </div>

        {/* Auto system message */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '75%' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 14 }}>🛡️</div>
            <div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                รับเรื่องร้องเรียนของคุณแล้ว ทีมงานจะดำเนินการตรวจสอบภายใน 24 ชั่วโมง
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3, paddingLeft: 4 }}>ทีมงาน PloiKhong · {fmt(complaint.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        {messages.map(m => {
          const isAdmin = m.sender_type === 'admin';
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-start' : 'flex-end', marginBottom: 12 }}>
              {isAdmin ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '75%' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 14 }}>🛡️</div>
                  <div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3, paddingLeft: 4 }}>ทีมงาน PloiKhong · {fmt(m.created_at)}</div>
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ background: '#dc2626', color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {m.content}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3, textAlign: 'right' }}>คุณ · {fmt(m.created_at)}</div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', background: 'var(--surface)', flexShrink: 0 }}>
        {isResolved ? (
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', padding: '6px 0' }}>
            {complaint.status === 'resolved' ? '✅ เรื่องนี้ได้รับการแก้ไขแล้ว' : '❌ เรื่องนี้ถูกปฏิเสธแล้ว'}
          </div>
        ) : (
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); } }}
              placeholder="พิมพ์ข้อความเพิ่มเติม... (Enter เพื่อส่ง)"
              rows={1}
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--line)', borderRadius: 22, fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', background: 'var(--bg)', color: 'var(--ink)', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto' }}
            />
            <button type="submit" disabled={!draft.trim() || sending}
              style={{ width: 40, height: 40, borderRadius: '50%', background: draft.trim() ? '#dc2626' : 'var(--line)', color: '#fff', border: 'none', cursor: draft.trim() ? 'pointer' : 'default', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'background .15s' }}>
              <IconSend />
            </button>
          </form>
        )}
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ComplaintsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token: string | undefined = (session as any)?.token;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  function load() {
    if (!token) return;
    setLoading(true);
    api.getMyComplaints(token)
      .then(data => {
        setComplaints(data);
        setSelected(prev => prev ? (data.find((c: Complaint) => c.id === prev.id) || data[0] || null) : (data[0] || null));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [token]);

  if (status === 'loading') return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontFamily: 'system-ui, sans-serif' }}>กำลังโหลด...</div>
  );
  if (!session?.user) { if (typeof window !== 'undefined') router.push('/'); return null; }

  const s = selected ? (STATUS[selected.status] || { label: selected.status, color: '#64748b', bg: '#f1f5f9', icon: '📋' }) : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', padding: 4 }}>
          <IconBack />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', color: '#dc2626', flexShrink: 0 }}><IconAlert /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', lineHeight: 1.2 }}>ร้องเรียนของฉัน</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{complaints.length} เรื่อง</div>
          </div>
        </div>
        <button onClick={() => setShowNew(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          <IconPlus /> แจ้งปัญหาใหม่
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: list */}
        <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--line)', display: showDetail ? 'none' : 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>กำลังโหลด...</div>
          ) : complaints.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>📭</div>
              <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 15 }}>ยังไม่มีเรื่องร้องเรียน</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>กดปุ่ม "แจ้งปัญหาใหม่" เพื่อส่งเรื่องร้องเรียน</div>
              <button onClick={() => setShowNew(true)}
                style={{ marginTop: 8, padding: '9px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                + แจ้งปัญหา
              </button>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {complaints.map(c => {
                const st = STATUS[c.status] || { label: c.status, color: '#64748b', bg: '#f1f5f9', icon: '📋' };
                const isActive = selected?.id === c.id;
                return (
                  <div key={c.id} onClick={() => { setSelected(c); setShowDetail(true); }}
                    style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', cursor: 'pointer', background: isActive ? 'var(--surface-2)' : 'transparent', borderLeft: isActive ? '3px solid #dc2626' : '3px solid transparent', transition: 'background .1s' }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{TYPE_LABEL[c.type] || c.type}</span>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: st.bg, color: st.color, fontWeight: 600 }}>{st.icon} {st.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{c.detail}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>#{c.id} · {new Date(c.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--ink-3)' }}>
              <div style={{ fontSize: 48 }}>🚨</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>เลือกเรื่องร้องเรียน</div>
              <div style={{ fontSize: 13 }}>คลิกรายการทางซ้ายเพื่อดูรายละเอียด</div>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div style={{ padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)', background: 'var(--surface)', flexShrink: 0 }}>
                <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', padding: 4, display: 'flex' }}>
                  <IconBack />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{TYPE_LABEL[selected.type] || selected.type}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>#{selected.id} · {new Date(selected.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {s && <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: s.bg, color: s.color, fontWeight: 700 }}>{s.icon} {s.label}</span>}
              </div>

              {/* Chat panel */}
              {token && <ChatPanel key={selected.id} complaint={selected} token={token} />}
            </>
          )}
        </div>
      </div>

      {showNew && <NewComplaintModal onClose={() => setShowNew(false)} onSent={load} />}
    </div>
  );
}
