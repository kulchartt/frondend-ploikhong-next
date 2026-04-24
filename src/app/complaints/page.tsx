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
  fraud: 'ถูกโกง / หลอกลวง', product: 'สินค้าไม่ตรงปก', user: 'พฤติกรรมไม่เหมาะสม', payment: 'ปัญหาการชำระเงิน', other: 'อื่นๆ',
};

const TYPE_OPTIONS = [
  { value: 'fraud',   label: 'ถูกโกง / หลอกลวง' },
  { value: 'product', label: 'สินค้าไม่ตรงปก' },
  { value: 'user',    label: 'พฤติกรรมไม่เหมาะสม' },
  { value: 'payment', label: 'ปัญหาการชำระเงิน' },
  { value: 'other',   label: 'อื่นๆ' },
];

const STATUS_META: Record<string, { label: string; color: string; dot: string; step: number }> = {
  pending:   { label: 'รอตรวจสอบ',     color: '#d97706', dot: '#f59e0b', step: 1 },
  reviewing: { label: 'กำลังตรวจสอบ', color: '#2563eb', dot: '#3b82f6', step: 2 },
  resolved:  { label: 'ปิดเคสแล้ว',   color: '#16a34a', dot: '#22c55e', step: 3 },
  rejected:  { label: 'ปฏิเสธ',       color: '#dc2626', dot: '#ef4444', step: 3 },
};

const PROGRESS_STEPS = ['ส่งเรื่อง', 'รอตรวจสอบ', 'กำลังตรวจสอบ', 'ปิดเคส'];

function fmtDate(d: string) { return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }); }
function fmtTime(d: string) { return new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }); }
function fmtDt(d: string) { return fmtDate(d) + ' ' + fmtTime(d); }

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IcoBack() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>; }
function IcoPlus() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={12} y1={5} x2={12} y2={19}/><line x1={5} y1={12} x2={19} y2={12}/></svg>; }
function IcoSearch() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={11} cy={11} r={8}/><line x1={21} y1={21} x2={16.65} y2={16.65}/></svg>; }
function IcoSend() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={22} y1={2} x2={11} y2={13}/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function IcoClose() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={6} y1={6} x2={18} y2={18}/><line x1={18} y1={6} x2={6} y2={18}/></svg>; }
function IcoAlert() { return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></svg>; }
function IcoHelp() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1={12} y1={17} x2={12.01} y2={17}/></svg>; }

// ─── New Complaint Modal ──────────────────────────────────────────────────────
function NewComplaintModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const { data: session } = useSession();
  const [step, setStep] = useState(0); // 0=type, 1=detail, 2=done
  const [form, setForm] = useState({ type: 'fraud', detail: '', contact: '' });
  const [loading, setLoading] = useState(false);

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
      setStep(2);
      setTimeout(() => { onSent(); onClose(); }, 1800);
    } catch { setStep(2); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn .15s ease' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 30px 80px rgba(0,0,0,.3)', overflow: 'hidden', animation: 'slideUp .22s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'color-mix(in srgb,var(--neg) 12%,transparent)', display: 'grid', placeItems: 'center', color: 'var(--neg)' }}><IcoAlert /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>ส่งเรื่องร้องเรียน</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>ทีมงานจะดำเนินการภายใน 24 ชั่วโมง</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4 }}><IcoClose /></button>
        </div>

        {step === 2 ? (
          <div style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="co-check-ic"><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg></div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>รับเรื่องแล้ว!</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>ทีมงานจะตรวจสอบและติดต่อกลับภายใน 24 ชั่วโมง</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>ประเภทปัญหา</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>รายละเอียด <span style={{ color: 'var(--neg)' }}>*</span></label>
              <textarea value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} required rows={4} placeholder="อธิบายปัญหาที่พบให้ละเอียด..."
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>ช่องทางติดต่อกลับ <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(ไม่บังคับ)</span></label>
              <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="เบอร์โทร / LINE ID / อีเมล"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading || !form.detail.trim()}
              style={{ padding: 12, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: (loading || !form.detail.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !form.detail.trim()) ? .6 : 1, fontFamily: 'inherit' }}>
              {loading ? 'กำลังส่ง...' : 'ส่งเรื่องร้องเรียน'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Progress Tracker ─────────────────────────────────────────────────────────
function ProgressTracker({ status }: { status: string }) {
  const activeStep = status === 'pending' ? 1 : status === 'reviewing' ? 2 : 3;
  const isResolved = status === 'resolved' || status === 'rejected';

  return (
    <div className="cx-progress">
      {PROGRESS_STEPS.map((label, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        const last = i === PROGRESS_STEPS.length - 1;
        const stepClass = done ? 'done' : active ? 'active' : '';
        return (
          <div key={i} className={`cx-prog-step ${stepClass}`}>
            <div className="cx-prog-dot">
              {done ? '✓' : i + 1}
            </div>
            <div className="cx-prog-label">{i === 3 && isResolved && status === 'rejected' ? 'ปฏิเสธ' : label}</div>
            {!last && <div className="cx-prog-line" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Case Detail (center panel) ───────────────────────────────────────────────
function CaseDetail({ complaint, token }: { complaint: Complaint; token: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const s = STATUS_META[complaint.status] || STATUS_META.pending;

  useEffect(() => {
    setMessages([]);
    setDraft('');
    api.getComplaintMessages(complaint.id, token).then(setMessages).catch(() => {});
  }, [complaint.id, token]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
    }
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
    } catch { setDraft(text); }
    finally { setSending(false); }
  }

  const isResolved = complaint.status === 'resolved' || complaint.status === 'rejected';

  return (
    <div className="cx-detail">
      {/* Hero */}
      <div className="cx-hero">
        <div className="cx-hero-head">
          <div>
            <div className="cx-hero-meta">
              <span className="cx-hero-id">#{complaint.id}</span>
              <span className="cx-hero-dot" />
              <span className="cx-hero-cat">{TYPE_LABEL[complaint.type] || complaint.type}</span>
              <span className="cx-hero-dot" />
              <span style={{ fontSize: 12 }}>{fmtDate(complaint.created_at)}</span>
            </div>
            <h1 className="cx-hero-title">{TYPE_LABEL[complaint.type] || complaint.type}</h1>
          </div>
          <div className="cx-hero-status">
            <div className="cx-hero-ic" style={{ background: s.dot }}>
              {complaint.status === 'resolved' ? '✓' : complaint.status === 'rejected' ? '✕' : complaint.status === 'reviewing' ? '🔍' : '⏳'}
            </div>
            <div>
              <small>สถานะ</small>
              <b>{s.label}</b>
            </div>
          </div>
        </div>

        <ProgressTracker status={complaint.status} />

        {complaint.status === 'pending' && (
          <div className="cx-sla" style={{ marginTop: 10 }}>
            <span style={{ marginRight: 4 }}>⏰</span>
            <span>ทีมงานจะตรวจสอบภายใน <b>24 ชั่วโมง</b> นับจากที่ส่งเรื่อง</span>
          </div>
        )}
        {complaint.status === 'reviewing' && (
          <div className="cx-sla" style={{ marginTop: 10 }}>
            <span style={{ marginRight: 4 }}>🔍</span>
            <span>ทีมงานกำลังดำเนินการตรวจสอบ สามารถส่งข้อมูลเพิ่มเติมด้านล่างได้</span>
          </div>
        )}
        {isResolved && (
          <div className="cx-sla" style={{ marginTop: 10, background: complaint.status === 'resolved' ? 'color-mix(in srgb,var(--pos) 8%,transparent)' : 'color-mix(in srgb,var(--neg) 8%,transparent)', borderColor: complaint.status === 'resolved' ? 'color-mix(in srgb,var(--pos) 25%,transparent)' : 'color-mix(in srgb,var(--neg) 25%,transparent)', color: complaint.status === 'resolved' ? '#15803d' : '#991b1b' }}>
            <span style={{ marginRight: 4 }}>{complaint.status === 'resolved' ? '✅' : '❌'}</span>
            <span>{complaint.status === 'resolved' ? 'เรื่องนี้ได้รับการแก้ไขเรียบร้อยแล้ว' : 'เรื่องร้องเรียนนี้ถูกปฏิเสธ'}</span>
          </div>
        )}
      </div>

      {/* Detail section */}
      <div className="cx-sec">
        <div className="cx-sec-h">รายละเอียดที่แจ้ง</div>
        <div className="cx-reason">{complaint.detail}</div>
        {complaint.contact && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-2)' }}>ช่องทางติดต่อกลับ: <b style={{ color: 'var(--ink)' }}>{complaint.contact}</b></div>
        )}
      </div>

      {/* Thread */}
      <div className="cx-sec">
        <div className="cx-sec-h">ประวัติการสื่อสาร</div>
        <div className="cx-thread" ref={bottomRef} style={{ maxHeight: 400, overflowY: 'auto' }}>
          {/* System message */}
          <div className="cx-event">
            <div className="cx-event-dot" />
            <div className="cx-event-body">
              <span><b>รับเรื่องแล้ว</b> ทีมงานจะดำเนินการภายใน 24 ชั่วโมง</span>
              <span className="cx-event-at">{fmtDt(complaint.created_at)}</span>
            </div>
          </div>

          {/* Messages */}
          {messages.map(m => {
            const isAdmin = m.sender_type === 'admin';
            return (
              <div key={m.id} className={`cx-msg ${isAdmin ? 'cx-msg-admin' : 'cx-msg-me'}`}>
                <div className="cx-msg-ava">{isAdmin ? 'A' : 'U'}</div>
                <div className="cx-msg-body">
                  <div className="cx-msg-who">
                    {isAdmin ? 'ทีมงาน PloiKhong' : 'คุณ'}
                    <span>{fmtDt(m.created_at)}</span>
                  </div>
                  <div className="cx-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic', padding: '8px 0' }}>ยังไม่มีข้อความเพิ่มเติม</div>
          )}
        </div>
      </div>

      {/* Compose bar */}
      {!isResolved && (
        <div className="cx-compose-bar">
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); } }}
              placeholder="ส่งข้อมูลเพิ่มเติมถึงทีมงาน... (Enter เพื่อส่ง)"
              rows={1}
              className="cx-c-input"
              style={{ maxHeight: 100 }}
            />
            <button type="submit" disabled={!draft.trim() || sending} className="cx-c-send">
              <IcoSend /> ส่ง
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Case Sidebar ─────────────────────────────────────────────────────────────
function CaseSidebar({ complaint, onNewComplaint }: { complaint: Complaint; onNewComplaint: () => void }) {
  const s = STATUS_META[complaint.status] || STATUS_META.pending;
  return (
    <div className="cx-side">
      <div className="cx-sb">
        {/* Status card */}
        <div className="cx-sb-card">
          <span className="cx-sb-label">สถานะเคส</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
            <b style={{ fontSize: 14, color: 'var(--ink)' }}>{s.label}</b>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>สร้างเมื่อ: {fmtDate(complaint.created_at)}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>ID: #{complaint.id}</div>
        </div>

        {/* Actions */}
        <div className="cx-sb-card">
          <span className="cx-sb-label">การดำเนินการ</span>
          <div className="cx-actions">
            <button className="cx-action" onClick={onNewComplaint}>
              <span><IcoPlus /></span>
              ส่งเรื่องใหม่
            </button>
            <a href="/" className="cx-action" style={{ textDecoration: 'none' }}>
              <span><IcoBack /></span>
              กลับหน้าแรก
            </a>
          </div>
        </div>

        {/* Help */}
        <div className="cx-sb-card">
          <span className="cx-sb-label">ช่วยเหลือ</span>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'วิธีรายงานการโกง',
              'สิทธิ์ผู้ซื้อ',
              'ขั้นตอนการร้องเรียน',
              'ติดต่อทีมงาน',
            ].map(link => (
              <li key={link} style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <IcoHelp />
                <span style={{ color: 'var(--ink-2)', textDecoration: 'underline', cursor: 'pointer' }}>{link}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  if (status === 'loading') return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div>;
  if (!session?.user) { if (typeof window !== 'undefined') router.push('/'); return null; }

  const filtered = complaints.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (search && !c.detail.toLowerCase().includes(search.toLowerCase()) && !c.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts: Record<string, number> = {};
  complaints.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Topbar */}
      <div className="cx-top">
        <button className="cx-back" onClick={() => router.back()}><IcoBack /></button>
        <div className="cx-top-crumbs">
          <span className="cx-crumb-home">หน้าแรก</span>
          <span className="cx-crumb-sep">/</span>
          <span>ร้องเรียนของฉัน</span>
        </div>
        <div className="cx-top-stats">
          <div className="cx-stat"><b>{complaints.length}</b>เรื่องทั้งหมด</div>
          <div className="cx-stat-sep" />
          <div className="cx-stat"><b>{statusCounts.pending || 0}</b>รอดำเนินการ</div>
        </div>
        <button className="cx-help"><IcoHelp /> ช่วยเหลือ</button>
        <button className="cx-new" onClick={() => setShowNew(true)}><IcoPlus /> แจ้งปัญหาใหม่</button>
      </div>

      {/* Body: 3 columns */}
      <div className="cx">
        {/* Left: list */}
        <div className="cx-list">
          <div className="cx-search">
            <IcoSearch />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาเรื่องร้องเรียน..."
            />
          </div>
          <div className="cx-filters">
            {[
              { k: '', l: 'ทั้งหมด', n: complaints.length },
              { k: 'pending', l: 'รอดำเนินการ', n: statusCounts.pending || 0 },
              { k: 'reviewing', l: 'กำลังตรวจสอบ', n: statusCounts.reviewing || 0 },
              { k: 'resolved', l: 'แก้ไขแล้ว', n: statusCounts.resolved || 0 },
              { k: 'rejected', l: 'ปฏิเสธ', n: statusCounts.rejected || 0 },
            ].map(f => (
              <button key={f.k} className={`cx-filter${statusFilter === f.k ? ' on' : ''}`} onClick={() => setStatusFilter(f.k)}>
                {f.l}
                {f.n > 0 && <span>{f.n}</span>}
              </button>
            ))}
          </div>
          <div className="cx-items">
            {loading && <div className="cx-empty">กำลังโหลด...</div>}
            {!loading && filtered.length === 0 && (
              <div className="cx-empty">
                {complaints.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 20 }}>
                    <IcoAlert />
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>ยังไม่มีเรื่องร้องเรียน</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6 }}>กด "แจ้งปัญหาใหม่" เพื่อส่งเรื่อง</div>
                    <button onClick={() => setShowNew(true)} className="btn btn-primary" style={{ marginTop: 4, fontSize: 13 }}>แจ้งปัญหา</button>
                  </div>
                ) : 'ไม่มีเรื่องในหมวดนี้'}
              </div>
            )}
            {filtered.map(c => {
              const s = STATUS_META[c.status] || STATUS_META.pending;
              const isActive = selected?.id === c.id;
              return (
                <button key={c.id} className={`cx-item${isActive ? ' on' : ''}`} onClick={() => setSelected(c)}>
                  <div className="cx-item-row1">
                    <span className="cx-item-id">#{c.id}</span>
                    <div className="cx-item-dot" style={{ background: s.dot }} />
                    <span className="cx-item-status">{s.label}</span>
                  </div>
                  <div className="cx-item-subj">{TYPE_LABEL[c.type] || c.type}</div>
                  <div className="cx-item-last">{c.detail}</div>
                  <div className="cx-item-foot">
                    <span>{fmtDate(c.created_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: detail */}
        <div className="cx-main">
          {!selected ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--ink-3)', padding: 40, textAlign: 'center' }}>
              <IcoAlert />
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>เลือกเรื่องร้องเรียน</div>
              <div style={{ fontSize: 13 }}>คลิกรายการทางซ้ายเพื่อดูรายละเอียด</div>
            </div>
          ) : token ? (
            <CaseDetail key={selected.id} complaint={selected} token={token} />
          ) : null}
        </div>

        {/* Right: sidebar */}
        {selected ? (
          <CaseSidebar complaint={selected} onNewComplaint={() => setShowNew(true)} />
        ) : (
          <div className="cx-side">
            <div className="cx-sb">
              <div className="cx-sb-card">
                <span className="cx-sb-label">การดำเนินการ</span>
                <div className="cx-actions">
                  <button className="cx-action" onClick={() => setShowNew(true)}>
                    <span><IcoPlus /></span>
                    แจ้งปัญหาใหม่
                  </button>
                </div>
              </div>
              <div className="cx-sb-card">
                <span className="cx-sb-label">ช่วยเหลือ</span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['วิธีรายงานการโกง', 'สิทธิ์ผู้ซื้อ', 'ขั้นตอนการร้องเรียน'].map(link => (
                    <li key={link} style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <IcoHelp />
                      <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {showNew && <NewComplaintModal onClose={() => setShowNew(false)} onSent={load} />}
    </div>
  );
}
