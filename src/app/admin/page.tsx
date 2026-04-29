'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import * as api from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app';

async function adminFetch(path: string, token: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...((opts?.headers as Record<string, string>) || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats { users: number; products: number; available: number; sold: number; orders: number; revenue: number; }
interface AdminUser { id: number; name: string; email: string; is_admin: number; is_banned: number; created_at: string; rating: number; review_count: number; }
interface AdminProduct { id: number; title: string; price: number; seller_name: string; status: string; created_at: string; category: string; }
interface PaymentRequest { id: number; user_id: number; package_key: string; coins: number; amount: number; slip_url: string | null; sender_name: string | null; status: string; admin_note: string | null; created_at: string; user_name?: string; user_email?: string; }

// ─── Shared helpers ───────────────────────────────────────────────────────────
const fmt = (n: number) => n?.toLocaleString('th-TH') ?? '0';
const fmtMoney = (n: number) => '฿' + (n ?? 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });
const TZ = { timeZone: 'Asia/Bangkok' } as const;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', ...TZ });
const fmtDateTime = (d: string) => new Date(d).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', ...TZ });

function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'active', available: 'active', success: 'success', confirmed: 'success',
    pending: 'pending', new: 'pending', investigating: 'investigating', reviewing: 'pending',
    suspended: 'suspended', reported: 'reported', banned: 'suspended', rejected: 'suspended',
    resolved: 'resolved', sold: 'resolved', draft: 'resolved',
  };
  return <span className={`ad-status-tag ${map[status] || 'pending'}`}>{status}</span>;
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────
function IcoSearch() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={11} cy={11} r={8}/><line x1={21} y1={21} x2={16.65} y2={16.65}/></svg>; }
function IcoQueue() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={3} width={7} height={7}/><rect x={14} y={3} width={7} height={7}/><rect x={3} y={14} width={7} height={7}/><rect x={14} y={14} width={7} height={7}/></svg>; }
function IcoUsers() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx={9} cy={7} r={4}/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IcoBox() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>; }
function IcoCoin() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><path d="M12 8v8M8.5 10.5a3.5 3.5 0 0 1 7 0v3a3.5 3.5 0 0 1-7 0v-3z"/></svg>; }
function IcoCard() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={1} y={4} width={22} height={16} rx={2}/><line x1={1} y1={10} x2={23} y2={10}/></svg>; }
function IcoAlert() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></svg>; }
function IcoChart() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={18} y1={20} x2={18} y2={10}/><line x1={12} y1={20} x2={12} y2={4}/><line x1={6} y1={20} x2={6} y2={14}/></svg>; }
function IcoClose() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>; }
function IcoSend() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={22} y1={2} x2={11} y2={13}/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function IcoBack() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>; }

// ─── Command Palette ──────────────────────────────────────────────────────────
function CommandPalette({ onClose, onNavigate }: { onClose: () => void; onNavigate: (key: string) => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const navItems = [
    { key: 'queue', label: 'ร้องเรียน Inbox', sub: 'เคสใหม่ · รอดำเนินการ' },
    { key: 'users', label: 'ผู้ใช้', sub: 'จัดการบัญชีผู้ใช้' },
    { key: 'products', label: 'ประกาศ', sub: 'จัดการสินค้า' },
    { key: 'complaints', label: 'ร้องเรียนทั้งหมด', sub: 'ดูและตอบกลับทุกเคส' },
    { key: 'finance', label: 'การเงิน', sub: 'รายการ OPN · เหรียญ' },
  ].filter(i => !q || i.label.includes(q) || i.sub.includes(q));

  return (
    <div className="ad-cmdk-bd" onClick={onClose}>
      <div className="ad-cmdk-box" onClick={e => e.stopPropagation()}>
        <div className="ad-cmdk-inp">
          <IcoSearch />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาเมนูหรือพิมพ์คำสั่ง..." onKeyDown={e => { if (e.key === 'Escape') onClose(); }} />
          <kbd>Esc</kbd>
        </div>
        <div className="ad-cmdk-list">
          <div className="ad-cmdk-group-lbl">นำทาง</div>
          {navItems.map(item => (
            <div key={item.key} className="ad-cmdk-item" onClick={() => onNavigate(item.key)}>
              <div className="ic"><IcoQueue /></div>
              <div className="main">{item.label}<div className="sub">{item.sub}</div></div>
              <span className="arr">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Queue View ───────────────────────────────────────────────────────────────
type QueueKind = 'complaint' | 'payment' | 'listing';
interface QueueItem { id: string; kind: QueueKind; subj: string; meta: string; prio: 'high' | 'mid' | 'low'; raw: any; }

function QueueView({ token }: { token: string }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [filter, setFilter] = useState<'all' | QueueKind>('all');
  const [sel, setSel] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const out: QueueItem[] = [];
      try {
        const complaints = await api.getComplaints('pending', token);
        complaints.forEach((c: any) => out.push({
          id: `c-${c.id}`, kind: 'complaint',
          subj: `[ร้องเรียน] ${c.type} – ${c.detail?.slice(0, 60)}...`,
          meta: `#${c.id} · ${fmtDateTime(c.created_at)} · ${c.user_name || 'ผู้ใช้'}`,
          prio: 'mid', raw: c,
        }));
        const reviewing = await api.getComplaints('reviewing', token);
        reviewing.forEach((c: any) => out.push({
          id: `cr-${c.id}`, kind: 'complaint',
          subj: `[กำลังตรวจ] ${c.type} – ${c.detail?.slice(0, 60)}...`,
          meta: `#${c.id} · ${fmtDateTime(c.created_at)} · ${c.user_name || 'ผู้ใช้'}`,
          prio: 'high', raw: c,
        }));
      } catch {}
      // Manual slip payments ปิดแล้ว — ไม่ต้อง fetch payment requests ใน Queue
      setItems(out);
      setLoading(false);
    })();
  }, [token]);

  const visible = filter === 'all' ? items : items.filter(i => i.kind === filter);

  return (
    <div className="ad-queue">
      {/* List */}
      <div className="ad-queue-list">
        <div className="ad-queue-head">
          <h3>Inbox</h3>
          <span className="count">{visible.length} รายการ</span>
          <div className="ad-queue-tabs">
            {(['all', 'complaint'] as const).map(k => (
              <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k as any)}>
                {k === 'all' ? 'ทั้งหมด' : 'ร้องเรียน'}
              </button>
            ))}
          </div>
        </div>
        <div className="ad-queue-scroll">
          {loading && <div style={{ padding: '20px', color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>กำลังโหลด...</div>}
          {!loading && visible.length === 0 && (
            <div className="ad-q-empty"><IcoQueue /><div>ไม่มีงานรอดำเนินการ</div></div>
          )}
          {visible.map(item => (
            <div key={item.id} className={`ad-q-item${sel?.id === item.id ? ' sel' : ''}`} onClick={() => setSel(item)}>
              <div className="ad-q-item-lbl">
                <span className={`ad-q-kind ${item.kind}`}>{item.kind === 'complaint' ? 'คมต.' : item.kind === 'payment' ? 'เงิน' : 'ลง'}</span>
                <span className={`ad-q-prio-dot ${item.prio}`} />
              </div>
              <div className="ad-q-main">
                <div className="ad-q-subj">{item.subj}</div>
                <div className="ad-q-meta">{item.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="ad-q-detail">
        {!sel ? (
          <div className="ad-q-empty" style={{ height: '100%' }}>
            <IcoQueue />
            <div style={{ fontSize: 15, fontWeight: 600 }}>เลือกรายการ</div>
            <div style={{ fontSize: 12 }}>คลิกรายการจากคิวทางซ้ายเพื่อดูรายละเอียด</div>
          </div>
        ) : sel.kind === 'complaint' ? (
          <ComplaintDetail complaint={sel.raw} token={token} onBack={() => setSel(null)} />
        ) : sel.kind === 'payment' ? (
          <PaymentDetail payment={sel.raw} token={token} onBack={() => setSel(null)} onDone={() => { setSel(null); setItems(prev => prev.filter(i => i.id !== sel.id)); }} />
        ) : null}
      </div>
    </div>
  );
}

// ─── Complaint Detail (Queue) ─────────────────────────────────────────────────
function ComplaintDetail({ complaint, token, onBack }: { complaint: any; token: string; onBack: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(complaint.status);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!complaint?.id) return;
    api.getComplaintMessages(complaint.id, token).then(setMessages).catch(() => {});
  }, [complaint.id, token]);

  const sendReply = async (newStatus?: string) => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const m = await api.sendComplaintMessage(complaint.id, draft.trim(), token);
      setMessages(prev => [...prev, m]);
      setDraft('');
      if (newStatus) {
        await api.updateComplaintStatus(complaint.id, newStatus, token);
        setStatus(newStatus);
        setMsg(`อัปเดตสถานะเป็น "${newStatus}" แล้ว`);
      }
    } catch (e: any) { setMsg(e.message); }
    setSending(false);
  };

  const updateStatus = async (s: string) => {
    try { await api.updateComplaintStatus(complaint.id, s, token); setStatus(s); setMsg(`สถานะเป็น "${s}"`); }
    catch (e: any) { setMsg(e.message); }
  };

  const typeLabel: Record<string, string> = { fraud: 'ถูกโกง', product: 'สินค้า', user: 'ผู้ใช้', payment: 'การชำระ', other: 'อื่นๆ' };
  const slaColor = status === 'pending' ? 'warn' : status === 'reviewing' ? '' : 'neg';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ad-q-dhead">
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: '4px 8px' }}><IcoBack /></button>
        <div className="ad-q-dhead-main">
          <div className="ad-q-dhead-top">
            <span className="ad-q-kind complaint">{typeLabel[complaint.type] || complaint.type}</span>
            <StatusTag status={status} />
          </div>
          <h2 className="ad-q-dhead" style={{ fontSize: 16, margin: 0 }}>ร้องเรียน #{complaint.id}</h2>
          <div className="ad-q-dhead-meta">{complaint.user_name && `${complaint.user_name} · `}{fmtDate(complaint.created_at)}</div>
        </div>
        <div className="ad-q-dhead-acts">
          {status === 'pending' && <button className="btn-sec" onClick={() => updateStatus('reviewing')}>ตรวจสอบ</button>}
          {(status === 'pending' || status === 'reviewing') && <>
            <button className="btn-grad" onClick={() => updateStatus('resolved')}>ปิดเคส</button>
            <button className="btn-sec danger" onClick={() => updateStatus('rejected')}>ปฏิเสธ</button>
          </>}
        </div>
      </div>

      <div className="ad-q-body" style={{ flex: 1, overflow: 'auto' }}>
        {msg && <div style={{ padding: '8px 14px', background: 'color-mix(in srgb,var(--pos) 10%,transparent)', border: '1px solid color-mix(in srgb,var(--pos) 25%,transparent)', borderRadius: 6, fontSize: 13, color: 'var(--pos)' }}>{msg}</div>}

        <div className={`ad-dp-sla ${slaColor}`}>
          <span>สถานะ:</span>
          <b>{status}</b>
          <span style={{ marginLeft: 'auto', fontSize: 12, opacity: .7 }}>{complaint.contact && `ติดต่อ: ${complaint.contact}`}</span>
        </div>

        <div className="ad-dp-sec">
          <h4>รายละเอียด</h4>
          <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{complaint.detail}</p>
        </div>

        {/* Messages thread */}
        <div className="ad-dp-sec">
          <h4>ประวัติสนทนา</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            {messages.length === 0 && <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>ยังไม่มีข้อความ</div>}
            {messages.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: m.sender_type === 'admin' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: m.sender_type === 'admin' ? 'var(--ink)' : 'var(--surface)', border: '1px solid var(--line)', color: m.sender_type === 'admin' ? 'var(--bg)' : 'var(--ink)', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {m.content}
                  <div style={{ fontSize: 10, opacity: .6, marginTop: 3, textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Compose */}
          <div className="ad-dp-compose">
            <textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }} placeholder="พิมพ์ข้อความถึงผู้ใช้... (Enter ส่ง)" rows={3} />
            <div className="ad-dp-compose-row">
              <span className="spacer" />
              <button className="btn-sec" onClick={() => sendReply('resolved')} disabled={sending || !draft.trim()}>ส่ง + ปิดเคส</button>
              <button className="btn-grad" onClick={() => sendReply()} disabled={sending || !draft.trim()}><IcoSend />ส่ง</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Detail (Queue) ───────────────────────────────────────────────────
function PaymentDetail({ payment, token, onBack, onDone }: { payment: PaymentRequest; token: string; onBack: () => void; onDone: () => void }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function confirm() {
    setBusy(true);
    try { const r = await api.confirmPayment(payment.id, token); setMsg(r.message || 'ยืนยันแล้ว'); setTimeout(onDone, 1200); }
    catch (e: any) { setMsg(e.message); }
    setBusy(false);
  }
  async function reject() {
    setBusy(true);
    try { const r = await api.rejectPayment(payment.id, note, token); setMsg(r.message || 'ปฏิเสธแล้ว'); setTimeout(onDone, 1200); }
    catch (e: any) { setMsg(e.message); }
    setBusy(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ad-q-dhead">
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: '4px 8px' }}><IcoBack /></button>
        <div className="ad-q-dhead-main">
          <div className="ad-q-dhead-top"><span className="ad-q-kind payment">เติมเหรียญ</span></div>
          <h2 style={{ fontSize: 16, margin: 0, fontFamily: 'var(--font-disp)' }}>คำขอ #{payment.id}</h2>
          <div className="ad-q-dhead-meta">{fmtDate(payment.created_at)}</div>
        </div>
      </div>
      <div className="ad-q-body" style={{ flex: 1, overflow: 'auto' }}>
        {msg && <div style={{ padding: '10px 14px', borderRadius: 6, fontSize: 13, background: 'color-mix(in srgb,var(--pos) 10%,transparent)', color: 'var(--pos)' }}>{msg}</div>}
        <div className="ad-dp-sec">
          <h4>รายละเอียดคำขอ</h4>
          <div className="ad-dp-kv">
            <div><span className="k">ผู้ใช้</span><b className="v">{payment.user_name || `User #${payment.user_id}`}</b></div>
            <div><span className="k">อีเมล</span><b className="v">{payment.user_email || '—'}</b></div>
            <div><span className="k">แพ็กเกจ</span><b className="v">{payment.package_key}</b></div>
            <div><span className="k">เหรียญ</span><b className="v mono">{fmt(payment.coins)} เหรียญ</b></div>
            <div><span className="k">จำนวนเงิน</span><b className="v">{fmtMoney(payment.amount)}</b></div>
            {payment.sender_name && <div><span className="k">ชื่อผู้โอน</span><b className="v">{payment.sender_name}</b></div>}
          </div>
        </div>
        {payment.slip_url && (
          <a href={payment.slip_url} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ display: 'inline-flex' }}>ดูสลิป →</a>
        )}
        <div className="ad-dp-sec">
          <h4>ตัดสินใจ</h4>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="หมายเหตุ (ถ้าปฏิเสธ)..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-grad" onClick={confirm} disabled={busy} style={{ flex: 1 }}>ยืนยัน ✓</button>
            <button className="btn-sec danger" onClick={reject} disabled={busy}>ปฏิเสธ ✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ token }: { token: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { adminFetch('/api/admin/stats', token).then(setStats).catch(e => setErr(e.message)); }, [token]);
  if (err) return <div style={{ color: 'var(--neg)', padding: 20 }}>ไม่สามารถโหลดข้อมูลได้: {err}</div>;
  if (!stats) return <div style={{ padding: 20, color: 'var(--ink-3)' }}>กำลังโหลด...</div>;
  return (
    <div>
      <div className="ad-home-hero">
        {[
          { l: 'ผู้ใช้', v: fmt(stats.users), d: '' },
          { l: 'สินค้าทั้งหมด', v: fmt(stats.products), d: '' },
          { l: 'ขายอยู่', v: fmt(stats.available), d: 'pos' },
          { l: 'รายได้รวม', v: fmtMoney(stats.revenue), d: 'pos' },
        ].map(s => (
          <div key={s.l} className="ad-home-stat">
            <div className="ad-home-stat-l">{s.l}</div>
            <div className="ad-home-stat-v">{s.v}</div>
            {s.d && <div className={`ad-home-stat-d ${s.d}`}>{s.d === 'pos' ? '↑' : '↓'}</div>}
          </div>
        ))}
      </div>
      <div className="ad-home-grid">
        <div className="ad-panel">
          <div className="ad-panel-head"><h3>สัดส่วนสินค้า</h3></div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ l: 'ขายอยู่', v: stats.available, color: 'var(--pos)' }, { l: 'ขายแล้ว', v: stats.sold, color: 'var(--warn)' }, { l: 'อื่นๆ', v: stats.products - stats.available - stats.sold, color: 'var(--ink-3)' }].map(r => (
              <div key={r.l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: 'var(--ink-2)' }}>{r.l}</span><b style={{ color: 'var(--ink)' }}>{r.v.toLocaleString()}</b></div>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${stats.products > 0 ? Math.round((r.v / stats.products) * 100) : 0}%`, background: r.color, borderRadius: 99 }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="ad-panel">
          <div className="ad-panel-head"><h3>สรุป</h3></div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            {[['คำสั่งซื้อ', fmt(stats.orders)], ['ขายแล้ว', fmt(stats.sold)], ['รายได้', fmtMoney(stats.revenue)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--ink-2)' }}>{l}</span><b style={{ fontFamily: 'var(--font-mono)' }}>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try { const path = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : '/api/admin/users'; setUsers(await adminFetch(path, token)); }
    catch (e: any) { setMsg(e.message); }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);
  async function ban(id: number) { try { const r = await adminFetch(`/api/admin/users/${id}/ban`, token, { method: 'PATCH' }); setMsg(r.message); load(search || undefined); } catch (e: any) { setMsg(e.message); } }
  async function toggleAdmin(id: number) { try { const r = await adminFetch(`/api/admin/users/${id}/toggle-admin`, token, { method: 'PATCH' }); setMsg(r.message); load(search || undefined); } catch (e: any) { setMsg(e.message); } }

  return (
    <div>
      <div className="ad-flt-row">
        <div className="ad-flt-inp"><IcoSearch /><input placeholder="ค้นหาชื่อหรืออีเมล..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search || undefined)} /></div>
        <button className="btn btn-primary" onClick={() => load(search || undefined)}>ค้นหา</button>
        <button className="btn" onClick={() => { setSearch(''); load(); }}>รีเซ็ต</button>
        {msg && <span style={{ fontSize: 12, color: 'var(--pos)', marginLeft: 8 }}>{msg} <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>✕</button></span>}
      </div>
      <div className="ad-tbl-wrap">
        {loading ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div> : (
          <table className="ad-tbl">
            <thead><tr>
              <th>ผู้ใช้</th><th>อีเมล</th><th>สิทธิ์</th><th>สถานะ</th><th>วันที่สมัคร</th><th>การกระทำ</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><div className="ad-user-cell"><div className="ad-user-ava">{u.name?.[0] || '?'}</div><div><div style={{ fontWeight: 500 }}>{u.name}</div><div className="ad-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>#{u.id}</div></div></div></td>
                  <td><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{u.email}</span></td>
                  <td><StatusTag status={u.is_admin ? 'admin' : 'user'} /></td>
                  <td><StatusTag status={u.is_banned ? 'suspended' : 'active'} /></td>
                  <td><span className="ad-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{fmtDate(u.created_at)}</span></td>
                  <td><div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className={`btn-sec ${u.is_banned ? '' : 'danger'}`} onClick={() => ban(u.id)} style={{ fontSize: 11, padding: '4px 10px' }}>{u.is_banned ? 'ปลดแบน' : 'แบน'}</button>
                    <button className="btn-sec" onClick={() => toggleAdmin(u.id)} style={{ fontSize: 11, padding: '4px 10px' }}>{u.is_admin ? 'ถอด Admin' : 'ให้ Admin'}</button>
                  </div></td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>ไม่พบผู้ใช้</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab({ token }: { token: string }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async (q?: string, status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q); if (status) params.set('status', status);
      setProducts(await adminFetch(`/api/admin/products${params.toString() ? '?' + params.toString() : ''}`, token));
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function del(id: number, title: string) {
    if (!confirm(`ลบสินค้า "${title}"?`)) return;
    try { const r = await adminFetch(`/api/admin/products/${id}`, token, { method: 'DELETE' }); setMsg(r.message); load(search || undefined, statusFilter || undefined); }
    catch (e: any) { setMsg(e.message); }
  }

  return (
    <div>
      <div className="ad-flt-row">
        <div className="ad-flt-inp"><IcoSearch /><input placeholder="ค้นหาสินค้า / ผู้ขาย..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search || undefined, statusFilter || undefined)} /></div>
        <div className="ad-flt-grp">
          {['', 'available', 'sold', 'draft'].map(s => (
            <button key={s} className={statusFilter === s ? 'on' : ''} onClick={() => { setStatusFilter(s); load(search || undefined, s || undefined); }}>{s || 'ทั้งหมด'}</button>
          ))}
        </div>
        {msg && <span style={{ fontSize: 12, color: 'var(--pos)' }}>{msg} <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>✕</button></span>}
      </div>
      <div className="ad-tbl-wrap">
        {loading ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div> : (
          <table className="ad-tbl">
            <thead><tr><th>สินค้า</th><th>หมวด</th><th>ราคา</th><th>ผู้ขาย</th><th>สถานะ</th><th>วันที่ลง</th><th></th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontWeight: 500, maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span></td>
                  <td><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{p.category}</span></td>
                  <td><span className="ad-mono">{fmtMoney(p.price)}</span></td>
                  <td><span style={{ fontSize: 12 }}>{p.seller_name}</span></td>
                  <td><StatusTag status={p.status} /></td>
                  <td><span className="ad-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{fmtDate(p.created_at)}</span></td>
                  <td><button className="btn-sec danger" onClick={() => del(p.id, p.title)} style={{ fontSize: 11, padding: '4px 10px' }}>ลบ</button></td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>ไม่พบสินค้า</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Premium Tab ──────────────────────────────────────────────────────────────
function PremiumTab({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.getCoinAdminStats(token).then(setStats).catch((e: any) => setErr(e.message)); }, [token]);
  if (err) return <div style={{ color: 'var(--neg)', padding: 20 }}>{err}</div>;
  if (!stats) return <div style={{ padding: 20, color: 'var(--ink-3)' }}>กำลังโหลด...</div>;

  const totalRevenue = stats.revenue?.total || 0;
  const maxMonthly = Math.max(...(stats.monthly_revenue || []).map((m: any) => m.revenue || 0), 1);

  const ALL_FEATURES = [
    { key: 'featured', label: 'สินค้าเด่น (Featured)', color: 'var(--warn)' },
    { key: 'auto_relist', label: 'ดันสินค้าขึ้นบนสุด', color: 'var(--accent)' },
    { key: 'price_alert', label: 'แจ้งเตือนราคา', color: 'var(--pos)' },
    { key: 'analytics_pro', label: 'Analytics Pro', color: '#8b5cf6' },
    { key: 'priority_support', label: 'Priority Support', color: '#ef4444' },
  ];
  const usageMap: Record<string, any> = {};
  (stats.feature_usage || []).forEach((f: any) => { usageMap[f.feature_key] = f; });

  return (
    <div>
      <div className="ad-home-hero" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { l: 'รายได้รวม', v: fmtMoney(totalRevenue) },
          { l: 'รอยืนยัน', v: String(stats.pending?.count || 0) },
          { l: 'เหรียญแจก', v: fmt(stats.coins?.issued || 0) },
          { l: 'เหรียญคงค้าง', v: fmt(stats.coins?.outstanding || 0) },
        ].map(s => (
          <div key={s.l} className="ad-home-stat">
            <div className="ad-home-stat-l">{s.l}</div>
            <div className="ad-home-stat-v">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="ad-panel" style={{ marginBottom: 14 }}>
        <div className="ad-panel-head"><h3>แหล่งรายได้ตามฟีเจอร์</h3></div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ALL_FEATURES.map(f => {
            const u = usageMap[f.key]; const baht = u?.estimated_baht || 0; const pct = totalRevenue > 0 ? Math.round((baht / totalRevenue) * 100) : 0;
            return (
              <div key={f.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: 'var(--ink-2)' }}>{f.label}</span>
                  <span style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{u?.total || 0} ครั้ง</span>
                    <b style={{ color: baht > 0 ? 'var(--pos)' : 'var(--ink-3)', minWidth: 70, textAlign: 'right' }}>{fmtMoney(baht)} ({pct}%)</b>
                  </span>
                </div>
                <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${totalRevenue > 0 ? Math.round((baht / totalRevenue) * 100) : 0}%`, background: f.color, borderRadius: 99 }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      {stats.monthly_revenue?.length > 0 && (
        <div className="ad-panel">
          <div className="ad-panel-head"><h3>รายได้รายเดือน</h3></div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
            {stats.monthly_revenue.map((m: any) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>฿{(m.revenue || 0).toLocaleString()}</span>
                <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '3px 3px 0 0', height: Math.max(4, Math.round(((m.revenue || 0) / maxMonthly) * 70)), opacity: .8 }} />
                <span style={{ fontSize: 9, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ token }: { token: string }) {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [rejectNote, setRejectNote] = useState<Record<number, string>>({});

  const load = useCallback(async (status: string) => {
    setLoading(true);
    try { setRequests(await api.getPaymentRequests(status, token)); }
    catch (e: any) { setMsg(e.message); }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(filter); }, [load, filter]);

  async function confirm(id: number) { try { const r = await api.confirmPayment(id, token); setMsg(r.message || 'ยืนยันแล้ว'); load(filter); } catch (e: any) { setMsg(e.message); } }
  async function reject(id: number) { try { const r = await api.rejectPayment(id, rejectNote[id] || '', token); setMsg(r.message || 'ปฏิเสธแล้ว'); load(filter); } catch (e: any) { setMsg(e.message); } }

  return (
    <div>
      <div className="ad-flt-row">
        <div className="ad-flt-grp">
          {(['pending', 'confirmed', 'rejected'] as const).map(k => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{k === 'pending' ? 'รอยืนยัน' : k === 'confirmed' ? 'ยืนยันแล้ว' : 'ปฏิเสธแล้ว'}</button>
          ))}
        </div>
        {msg && <span style={{ fontSize: 12, color: 'var(--pos)' }}>{msg} <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>✕</button></span>}
      </div>
      <div className="ad-tbl-wrap">
        {loading ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div> : requests.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>ไม่มีคำขอ</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {requests.map(req => (
              <div key={req.id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{req.user_name || `User #${req.user_id}`} <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 400 }}>{req.user_email}</span></div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>แพ็กเกจ: <b>{req.package_key}</b> · {req.coins} เหรียญ · <b>{fmtMoney(req.amount)}</b></div>
                    {req.sender_name && <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>ชื่อผู้โอน: <b>{req.sender_name}</b></div>}
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{fmtDateTime(req.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    {req.slip_url && <a href={req.slip_url} target="_blank" rel="noreferrer" className="btn-sec" style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}>ดูสลิป</a>}
                    <StatusTag status={req.status} />
                  </div>
                </div>
                {filter === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn-grad" onClick={() => confirm(req.id)} style={{ fontSize: 12, padding: '5px 14px' }}>ยืนยัน ✓</button>
                    <input placeholder="หมายเหตุปฏิเสธ..." value={rejectNote[req.id] || ''} onChange={e => setRejectNote(prev => ({ ...prev, [req.id]: e.target.value }))} style={{ flex: 1, minWidth: 150, padding: '4px 10px', border: '1px solid var(--line)', borderRadius: 5, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                    <button className="btn-sec danger" onClick={() => reject(req.id)} style={{ fontSize: 12, padding: '5px 12px' }}>ปฏิเสธ ✕</button>
                  </div>
                )}
                {req.admin_note && <div style={{ fontSize: 12, color: 'var(--neg)', background: 'color-mix(in srgb,var(--neg) 8%,transparent)', padding: '6px 10px', borderRadius: 5 }}>หมายเหตุ: {req.admin_note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Complaints Tab ───────────────────────────────────────────────────────────
function ComplaintsTableTab({ token }: { token: string }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, any[]>>({});
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [sending, setSending] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(true);
    api.getComplaints(filter, token).then(setComplaints).catch(() => {}).finally(() => setLoading(false));
  }, [filter, token]);

  const toggleExpand = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!messages[id]) {
      const msgs = await api.getComplaintMessages(id, token).catch(() => []);
      setMessages(prev => ({ ...prev, [id]: msgs }));
    }
  };

  const sendReply = async (id: number, newStatus?: string) => {
    const text = draft[id]?.trim();
    if (!text) return;
    setSending(prev => ({ ...prev, [id]: true }));
    try {
      const m = await api.sendComplaintMessage(id, text, token);
      setMessages(prev => ({ ...prev, [id]: [...(prev[id] || []), m] }));
      setDraft(prev => ({ ...prev, [id]: '' }));
      if (newStatus) { await api.updateComplaintStatus(id, newStatus, token); setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c)); }
    } catch {}
    setSending(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div>
      <div className="ad-flt-row">
        <div className="ad-flt-grp">
          {[{ k: 'pending', l: 'รอดำเนินการ' }, { k: 'reviewing', l: 'กำลังตรวจสอบ' }, { k: 'resolved', l: 'แก้ไขแล้ว' }, { k: 'rejected', l: 'ปฏิเสธ' }, { k: '', l: 'ทั้งหมด' }].map(f => (
            <button key={f.k} className={filter === f.k ? 'on' : ''} onClick={() => setFilter(f.k)}>{f.l}</button>
          ))}
        </div>
      </div>
      <div className="ad-tbl-wrap">
        {loading ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {complaints.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>ไม่มีเรื่องร้องเรียน</div>}
            {complaints.map(c => (
              <div key={c.id} style={{ borderBottom: '1px solid var(--line)', borderLeft: `3px solid ${c.status === 'pending' ? 'var(--warn)' : c.status === 'reviewing' ? 'var(--accent)' : c.status === 'resolved' ? 'var(--pos)' : 'var(--neg)'}`, padding: '12px 18px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
                  <StatusTag status={c.status} />
                  <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>{c.type}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>#{c.id} · {fmtDate(c.created_at)}</span>
                  {c.user_name && <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>— {c.user_name}</span>}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {c.status === 'pending' && <button className="btn-sec" onClick={() => api.updateComplaintStatus(c.id, 'reviewing', token).then(() => setComplaints(prev => prev.map(x => x.id === c.id ? { ...x, status: 'reviewing' } : x)))} style={{ fontSize: 11, padding: '3px 9px' }}>ตรวจสอบ</button>}
                    {(c.status === 'pending' || c.status === 'reviewing') && <>
                      <button className="btn-grad" onClick={() => api.updateComplaintStatus(c.id, 'resolved', token).then(() => setComplaints(prev => prev.map(x => x.id === c.id ? { ...x, status: 'resolved' } : x)))} style={{ fontSize: 11, padding: '3px 10px' }}>ปิดเคส</button>
                      <button className="btn-sec danger" onClick={() => api.updateComplaintStatus(c.id, 'rejected', token).then(() => setComplaints(prev => prev.map(x => x.id === c.id ? { ...x, status: 'rejected' } : x)))} style={{ fontSize: 11, padding: '3px 9px' }}>ปฏิเสธ</button>
                    </>}
                    <button className="btn-sec" onClick={() => toggleExpand(c.id)} style={{ fontSize: 11, padding: '3px 9px' }}>{expandedId === c.id ? 'ซ่อน' : 'แชท'}</button>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: expandedId === c.id ? 'pre-wrap' : 'nowrap' }}>{c.detail}</p>
                {expandedId === c.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, maxHeight: 200, overflow: 'auto' }}>
                      {(messages[c.id] || []).map((m: any) => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '75%', padding: '6px 10px', borderRadius: 8, fontSize: 13, background: m.sender_type === 'admin' ? 'var(--ink)' : 'var(--surface-2)', color: m.sender_type === 'admin' ? 'var(--bg)' : 'var(--ink)', lineHeight: 1.5 }}>{m.content}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <textarea value={draft[c.id] || ''} onChange={e => setDraft(prev => ({ ...prev, [c.id]: e.target.value }))} placeholder="พิมพ์ข้อความ... (Enter ส่ง)" rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(c.id); } }} style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
                      <button className="btn-grad" onClick={() => sendReply(c.id)} disabled={sending[c.id] || !draft[c.id]?.trim()} style={{ fontSize: 12, padding: '6px 12px', alignSelf: 'flex-end' }}><IcoSend /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Accounting Tab ───────────────────────────────────────────────────────────
const EXPENSE_CATS = [
  { key: 'server',    label: 'Server / Hosting' },
  { key: 'ai',        label: 'AI / Claude API' },
  { key: 'platform',  label: 'Platform Fee' },
  { key: 'marketing', label: 'การตลาด' },
  { key: 'payment',   label: 'ค่า Payment Gateway' },
  { key: 'legal',     label: 'ทนาย / นักบัญชี' },
  { key: 'salary',    label: 'เงินเดือน / ค่าจ้าง' },
  { key: 'other',     label: 'อื่นๆ' },
];
const CAT_COLOR: Record<string, string> = {
  server: 'var(--accent)', ai: '#8b5cf6', platform: '#f59e0b', marketing: 'var(--warn)',
  payment: 'var(--pos)', legal: '#ef4444', salary: '#06b6d4', other: 'var(--ink-3)',
};
const MONTH_NAMES = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function AccountingTab({ token }: { token: string }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [view, setView]   = useState<'month' | 'year'>('month');
  const [summary, setSummary] = useState<any>(null);
  const [income, setIncome]   = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [yearly, setYearly]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'income' | 'expense' | 'user'>('overview');
  // Form เพิ่ม/แก้ไขรายจ่าย
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ category: 'server', description: '', amount: '', expense_date: now.toISOString().split('T')[0] });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, inc, exp] = await Promise.all([
        api.getAccountingSummary(month, year, token),
        api.getAccountingIncome(month, year, token),
        api.getAccountingExpenses(month, year, token),
      ]);
      setSummary(s); setIncome(inc); setExpenses(exp);
    } catch {}
    setLoading(false);
  };

  const loadYearly = async () => {
    try { setYearly(await api.getAccountingYearly(year, token)); } catch {}
  };

  useEffect(() => { load(); }, [month, year, token]);
  useEffect(() => { if (view === 'year') loadYearly(); }, [view, year, token]);

  const fmt = (n: number) => '฿' + (n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', ...TZ });
  const fmtDateTime = (d: string) => new Date(d).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', ...TZ });

  function resetForm() {
    setForm({ category: 'server', description: '', amount: '', expense_date: now.toISOString().split('T')[0] });
    setReceiptFile(null);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(r: any) {
    setForm({
      category: r.category,
      description: r.description,
      amount: String(r.amount),
      expense_date: r.expense_date?.split('T')[0] || r.expense_date,
    });
    setReceiptFile(null);
    setEditingId(r.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveExpense() {
    if (!form.description) return;
    setSaving(true);
    try {
      if (editingId !== null) {
        await api.updateAccountingExpense(editingId, { ...form, amount: parseFloat(form.amount) || 0 }, token, receiptFile ?? undefined);
        setMsg('บันทึกแล้ว');
      } else {
        await api.addAccountingExpense({ ...form, amount: parseFloat(form.amount) || 0 }, token, receiptFile ?? undefined);
        setMsg('เพิ่มรายจ่ายแล้ว');
      }
      resetForm();
      load();
    } catch (e: any) { setMsg(e.message); }
    setSaving(false);
  }

  async function delExpense(id: number) {
    if (!confirm('ลบรายจ่ายนี้?')) return;
    try { await api.deleteAccountingExpense(id, token); load(); setMsg('ลบแล้ว'); }
    catch (e: any) { setMsg(e.message); }
  }

  const profit = (summary?.profit || 0);
  const profitColor = profit >= 0 ? 'var(--pos)' : 'var(--neg)';
  const maxYearlyBar = yearly ? Math.max(...yearly.months.map((m: any) => Math.max(m.income, m.expense)), 1) : 1;

  return (
    <div>
      {/* Header controls */}
      <div className="ad-flt-row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={view === 'month' ? 'btn btn-primary' : 'btn'} style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setView('month')}>รายเดือน</button>
          <button className={view === 'year'  ? 'btn btn-primary' : 'btn'} style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setView('year')}>รายปี</button>
        </div>
        {view === 'month' && (
          <select value={month} onChange={e => setMonth(+e.target.value)} style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, background: 'var(--surface)', color: 'var(--ink)' }}>
            {MONTH_NAMES.map((n, i) => <option key={i+1} value={i+1}>{n}</option>)}
          </select>
        )}
        <select value={year} onChange={e => setYear(+e.target.value)} style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, background: 'var(--surface)', color: 'var(--ink)' }}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 12, color: 'var(--pos)' }}>{msg} <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>✕</button></span>}
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '5px 14px' }} onClick={() => { if (showForm && editingId) { resetForm(); } else { resetForm(); setShowForm(true); } }}>+ เพิ่มรายจ่าย</button>
        </div>
      </div>

      {/* Add / Edit expense form */}
      {showForm && (
        <div style={{ margin: '0 0 14px', padding: '16px 20px', background: 'var(--surface)', border: `1px solid ${editingId ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 8, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          {editingId && <div style={{ width: '100%', fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: -4 }}>✏️ แก้ไขรายจ่าย #{editingId}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 160px' }}>
            <label style={{ fontSize: 11, color: 'var(--ink-3)' }}>หมวด</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, background: 'var(--surface)', color: 'var(--ink)' }}>
              {EXPENSE_CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '2 1 200px' }}>
            <label style={{ fontSize: 11, color: 'var(--ink-3)' }}>รายละเอียด</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="เช่น Vercel Pro เดือน เม.ย." style={{ padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 120px' }}>
            <label style={{ fontSize: 11, color: 'var(--ink-3)' }}>จำนวนเงิน (฿)</label>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" min="0" style={{ padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 140px' }}>
            <label style={{ fontSize: 11, color: 'var(--ink-3)' }}>วันที่</label>
            <input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} style={{ padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '2 1 200px' }}>
            <label style={{ fontSize: 11, color: 'var(--ink-3)' }}>แนบเอกสาร <span style={{ opacity: .6 }}>(รูป / PDF, ไม่บังคับ)</span></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', border: '1px dashed var(--line)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: receiptFile ? 'var(--pos)' : 'var(--ink-3)', background: 'var(--surface)' }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1={12} y1={3} x2={12} y2={15}/></svg>
              {receiptFile ? receiptFile.name : 'เลือกไฟล์'}
              <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => setReceiptFile(e.target.files?.[0] ?? null)} />
            </label>
            {receiptFile && <button onClick={() => setReceiptFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 11, textAlign: 'left' }}>✕ ลบไฟล์</button>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary" onClick={saveExpense} disabled={saving || !form.description} style={{ fontSize: 12, padding: '7px 16px' }}>{saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'บันทึก'}</button>
            <button className="btn" onClick={resetForm} style={{ fontSize: 12, padding: '7px 12px' }}>ยกเลิก</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div>
      ) : view === 'year' && yearly ? (
        /* ── รายปี ── */
        <div>
          <div className="ad-home-hero" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
            {[
              { l: 'รายรับรวมปี', v: fmt(yearly.months.reduce((s: number, m: any) => s + m.income, 0)), col: 'var(--pos)' },
              { l: 'รายจ่ายรวมปี', v: fmt(yearly.months.reduce((s: number, m: any) => s + m.expense, 0)), col: 'var(--neg)' },
              { l: 'กำไรสุทธิปี', v: fmt(yearly.months.reduce((s: number, m: any) => s + m.profit, 0)), col: yearly.months.reduce((s: number, m: any) => s + m.profit, 0) >= 0 ? 'var(--pos)' : 'var(--neg)' },
            ].map(s => (
              <div key={s.l} className="ad-home-stat">
                <div className="ad-home-stat-l">{s.l}</div>
                <div className="ad-home-stat-v" style={{ color: s.col }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="ad-panel">
            <div className="ad-panel-head"><h3>รายรับ / รายจ่าย รายเดือน {year}</h3></div>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, overflowX: 'auto' }}>
              {yearly.months.map((m: any) => (
                <div key={m.month} style={{ flex: '0 0 auto', width: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 2, height: 120 }}>
                    <div style={{ width: 14, background: 'var(--pos)', borderRadius: '3px 3px 0 0', height: Math.max(2, Math.round((m.income / maxYearlyBar) * 100)), opacity: 0.85, alignSelf: 'center' }} />
                    <div style={{ width: 14, background: 'var(--neg)', borderRadius: '3px 3px 0 0', height: Math.max(2, Math.round((m.expense / maxYearlyBar) * 100)), opacity: 0.85, alignSelf: 'center' }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{MONTH_NAMES[m.month - 1]}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 20px 16px', display: 'flex', gap: 16, fontSize: 11, color: 'var(--ink-3)' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--pos)', borderRadius: 2, marginRight: 4 }} />รายรับ</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--neg)', borderRadius: 2, marginRight: 4 }} />รายจ่าย</span>
            </div>
          </div>
        </div>
      ) : summary ? (
        /* ── รายเดือน ── */
        <div>
          {/* KPI cards */}
          <div className="ad-home-hero" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
            {[
              { l: 'รายรับ', v: fmt(summary.income), sub: `${summary.income_count} รายการ`, col: 'var(--pos)' },
              { l: 'รายจ่าย', v: fmt(summary.expense), sub: `${summary.expense_count} รายการ`, col: 'var(--neg)' },
              { l: profit >= 0 ? 'กำไร' : 'ขาดทุน', v: fmt(Math.abs(profit)), sub: profit >= 0 ? '▲ ดี' : '▼ ขาดทุน', col: profitColor },
            ].map(s => (
              <div key={s.l} className="ad-home-stat">
                <div className="ad-home-stat-l">{s.l}</div>
                <div className="ad-home-stat-v" style={{ color: s.col }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Sub tabs */}
          <div className="ad-flt-row" style={{ marginBottom: 12 }}>
            <div className="ad-flt-grp">
              {([['overview', 'ภาพรวม'], ['income', 'รายรับ'], ['expense', 'รายจ่าย'], ['user', 'ประวัติ User']] as const).map(([k, l]) => (
                <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k as any)}>{l}</button>
              ))}
            </div>
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* รายจ่ายตาม category */}
              <div className="ad-panel">
                <div className="ad-panel-head"><h3>รายจ่ายตามหมวด</h3></div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {summary.expense_by_cat?.length === 0 && <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>ยังไม่มีรายจ่าย</div>}
                  {summary.expense_by_cat?.map((c: any) => {
                    const cat = EXPENSE_CATS.find(x => x.key === c.category);
                    const pct = summary.expense > 0 ? Math.round((c.amount / summary.expense) * 100) : 0;
                    return (
                      <div key={c.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--ink-2)' }}>{cat?.label || c.category}</span>
                          <b style={{ color: 'var(--ink)' }}>{fmt(c.amount)} ({pct}%)</b>
                        </div>
                        <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: CAT_COLOR[c.category] || 'var(--ink-3)', borderRadius: 99 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* สรุป */}
              <div className="ad-panel">
                <div className="ad-panel-head"><h3>สรุปเดือน {MONTH_NAMES[month - 1]} {year}</h3></div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  {[['รายรับ', fmt(summary.income), 'var(--pos)'], ['รายจ่าย', fmt(summary.expense), 'var(--neg)'], [profit >= 0 ? 'กำไรสุทธิ' : 'ขาดทุนสุทธิ', fmt(Math.abs(profit)), profitColor]].map(([l, v, col]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                      <span style={{ color: 'var(--ink-2)' }}>{l}</span>
                      <b style={{ fontFamily: 'var(--font-mono)', color: col as string }}>{v}</b>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                    อัตรากำไร: {summary.income > 0 ? Math.round((profit / summary.income) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* รายรับ */}
          {tab === 'income' && (
            <div className="ad-tbl-wrap">
              {income.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>ยังไม่มีรายรับในเดือนนี้</div>
              ) : (
                <table className="ad-tbl">
                  <thead><tr><th>#</th><th>วันที่</th><th>ผู้ใช้</th><th>แพ็กเกจ</th><th>เหรียญ</th><th>ช่องทาง / Charge ID</th><th style={{ textAlign: 'right' }}>จำนวนเงิน</th></tr></thead>
                  <tbody>
                    {income.map((r: any) => {
                      const isOPN = r.sender_name === 'OPN PromptPay' || r.sender_name === 'OPN Card';
                      const methodLabel = r.sender_name === 'OPN Card' ? '💳 Card' : r.sender_name === 'OPN PromptPay' ? '📱 PromptPay' : r.sender_name || 'โอน';
                      return (
                      <tr key={r.id}>
                        <td><span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>#{r.id}</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtDateTime(r.created_at)}</span></td>
                        <td><div style={{ fontWeight: 500, fontSize: 13 }}>{r.user_name || '—'}</div><div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.user_email}</div></td>
                        <td><span style={{ fontSize: 12 }}>{r.package_key}</span></td>
                        <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.coins?.toLocaleString()}</span></td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isOPN ? 'var(--accent)' : 'var(--ink-2)' }}>{methodLabel}</div>
                          {r.slip_url && <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }} title={r.slip_url}>{r.slip_url.length > 28 ? r.slip_url.slice(0, 28) + '…' : r.slip_url}</div>}
                        </td>
                        <td style={{ textAlign: 'right' }}><b style={{ color: 'var(--pos)', fontFamily: 'var(--font-mono)' }}>{fmt(r.amount)}</b></td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* รายจ่าย */}
          {tab === 'expense' && (
            <div className="ad-tbl-wrap">
              {expenses.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>ยังไม่มีรายจ่ายในเดือนนี้ กด "เพิ่มรายจ่าย" ด้านบน</div>
              ) : (
                <table className="ad-tbl">
                  <thead><tr><th>วันที่</th><th>หมวด</th><th>รายละเอียด</th><th>แพ็กเกจ</th><th>Charge ID</th><th>ผู้ทำรายการ</th><th style={{ textAlign: 'right' }}>จำนวนเงิน</th><th>เอกสาร</th><th></th></tr></thead>
                  <tbody>
                    {expenses.map((r: any) => {
                      const cat = EXPENSE_CATS.find(x => x.key === r.category);
                      const isEditing = editingId === r.id;
                      // Parse OPN fee description: "ค่าธรรมเนียม OPN PromptPay (1.5%) — coins_100 — chrg_xxx"
                      const isOPNFee = r.category === 'payment' && r.description?.includes('OPN');
                      const feeParts = isOPNFee ? r.description.split(' — ') : null;
                      const feeMethod = feeParts?.[0]?.replace('ค่าธรรมเนียม OPN ', '') || '';
                      const feePkg    = feeParts?.[1] || '';
                      const feeCharge = feeParts?.[2] || '';
                      return (
                        <tr key={r.id} style={{ background: isEditing ? 'color-mix(in srgb,var(--accent) 6%,transparent)' : undefined }}>
                          <td><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtDate(r.expense_date)}</span></td>
                          <td><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `color-mix(in srgb,${CAT_COLOR[r.category] || 'var(--ink-3)'} 12%,transparent)`, color: CAT_COLOR[r.category] || 'var(--ink-3)' }}>{cat?.label || r.category}</span></td>
                          <td>
                            {isOPNFee
                              ? <span style={{ fontSize: 12, fontWeight: 600 }}>{feeMethod}</span>
                              : <span style={{ fontSize: 13 }}>{r.description}</span>}
                          </td>
                          <td><span style={{ fontSize: 12, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{feePkg || '—'}</span></td>
                          <td>
                            {feeCharge
                              ? <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }} title={feeCharge}>{feeCharge.length > 22 ? feeCharge.slice(0, 22) + '…' : feeCharge}</span>
                              : <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>—</span>}
                          </td>
                          <td>
                            {r.created_by_name
                              ? <span style={{ fontSize: 12 }}>{r.created_by_name}</span>
                              : isOPNFee
                                ? <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>auto (OPN)</span>
                                : <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>—</span>}
                          </td>
                          <td style={{ textAlign: 'right' }}><b style={{ color: r.amount > 0 ? 'var(--neg)' : 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmt(r.amount)}</b></td>
                          <td>
                            {r.receipt_url ? (
                              <a href={r.receipt_url} target="_blank" rel="noreferrer" className="btn-sec" style={{ fontSize: 11, padding: '3px 9px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                ดูเอกสาร
                              </a>
                            ) : <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>—</span>}
                          </td>
                          <td style={{ display: 'flex', gap: 4 }}>
                            <button className="btn-sec" onClick={() => startEdit(r)} style={{ fontSize: 11, padding: '3px 9px' }}>{isEditing ? '✏️ กำลังแก้' : 'แก้ไข'}</button>
                            <button className="btn-sec danger" onClick={() => delExpense(r.id)} style={{ fontSize: 11, padding: '3px 9px' }}>ลบ</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ประวัติ User */}
          {tab === 'user' && <UserHistoryPanel token={token} />}
        </div>
      ) : null}
    </div>
  );
}

// ─── User History Panel ───────────────────────────────────────────────────────
function UserHistoryPanel({ token }: { token: string }) {
  const [userId, setUserId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    const id = parseInt(userId);
    if (!id) return setErr('กรุณากรอก User ID');
    setErr(''); setLoading(true); setData(null);
    try {
      const d = await api.getAccountingUserHistory(id, token);
      setData(d);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number"
          placeholder="User ID..."
          value={userId}
          onChange={e => setUserId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          style={{ width: 140, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, fontFamily: 'var(--font-mono)', background: 'var(--surface)', color: 'var(--ink)' }}
        />
        <button className="btn-grad" onClick={load} disabled={loading} style={{ padding: '6px 16px', fontSize: 13 }}>
          {loading ? 'กำลังโหลด...' : 'ค้นหา'}
        </button>
        {err && <span style={{ fontSize: 12, color: 'var(--neg)' }}>{err}</span>}
      </div>

      {data && (
        <>
          {/* User info card */}
          <div className="ad-panel" style={{ padding: '14px 18px', display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
              {(data.user.name || '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{data.user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{data.user.email}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>สมัคร: {fmtDate(data.user.created_at)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>ยอดเหรียญ</div>
              <div style={{ fontWeight: 700, fontSize: 22, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>🪙{data.user.coin_balance?.toLocaleString() || 0}</div>
            </div>
          </div>

          {/* Payment requests table */}
          <div className="ad-panel">
            <div className="ad-panel-head"><h3>ประวัติการเติมเงิน ({data.payments.length} รายการ)</h3></div>
            <div className="ad-tbl-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {data.payments.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>ยังไม่มีประวัติการเติมเงิน</div>
              ) : (
                <table className="ad-tbl">
                  <thead><tr><th>#</th><th>วันที่</th><th>แพ็กเกจ</th><th>เหรียญ</th><th>ช่องทาง</th><th>สถานะ</th><th style={{ textAlign: 'right' }}>ราคา</th></tr></thead>
                  <tbody>
                    {data.payments.map((p: any) => (
                      <tr key={p.id}>
                        <td><span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>#{p.id}</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtDateTime(p.created_at)}</span></td>
                        <td><span style={{ fontSize: 12 }}>{p.package_key}</span></td>
                        <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.coins?.toLocaleString()}</span></td>
                        <td>
                          <span style={{ fontSize: 12 }}>
                            {p.sender_name === 'OPN Card' ? '💳 Card' : p.sender_name === 'OPN PromptPay' ? '📱 PromptPay' : p.sender_name || '—'}
                          </span>
                          {p.slip_url && (
                            <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }} title={p.slip_url}>
                              {p.slip_url.length > 24 ? p.slip_url.slice(0, 24) + '…' : p.slip_url}
                            </div>
                          )}
                        </td>
                        <td><StatusTag status={p.status} /></td>
                        <td style={{ textAlign: 'right' }}><b style={{ color: 'var(--pos)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>฿{p.amount?.toLocaleString()}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Coin transactions table */}
          <div className="ad-panel">
            <div className="ad-panel-head"><h3>ประวัติธุรกรรมเหรียญ ({data.transactions.length} รายการ)</h3></div>
            <div className="ad-tbl-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}>
              {data.transactions.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>ยังไม่มีธุรกรรมเหรียญ</div>
              ) : (
                <table className="ad-tbl">
                  <thead><tr><th>#</th><th>วันที่</th><th>ประเภท</th><th>รายละเอียด</th><th style={{ textAlign: 'right' }}>จำนวน</th></tr></thead>
                  <tbody>
                    {data.transactions.map((t: any) => (
                      <tr key={t.id}>
                        <td><span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>#{t.id}</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtDateTime(t.created_at)}</span></td>
                        <td><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: t.delta > 0 ? 'color-mix(in srgb,var(--pos) 12%,transparent)' : 'color-mix(in srgb,var(--neg) 12%,transparent)', color: t.delta > 0 ? 'var(--pos)' : 'var(--neg)' }}>{t.type}</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{t.description || '—'}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <b style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: t.delta > 0 ? 'var(--pos)' : 'var(--neg)' }}>
                            {t.delta > 0 ? '+' : ''}{t.delta?.toLocaleString()} 🪙
                          </b>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Finance Tab ──────────────────────────────────────────────────────────────
function FinanceTab({ token }: { token: string }) {
  const [coinStats, setCoinStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [rejectNote, setRejectNote] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getCoinAdminStats(token).then(setCoinStats).catch(() => {});
  }, [token]);

  useEffect(() => {
    setLoading(true);
    api.getPaymentRequests(filter, token).then(setPayments).catch(() => {}).finally(() => setLoading(false));
  }, [filter, token]);

  async function confirm(id: number) {
    try { const r = await api.confirmPayment(id, token); setMsg(r.message || 'ยืนยันแล้ว'); api.getPaymentRequests(filter, token).then(setPayments); }
    catch (e: any) { setMsg(e.message); }
  }
  async function reject(id: number) {
    try { const r = await api.rejectPayment(id, rejectNote[id] || '', token); setMsg(r.message || 'ปฏิเสธแล้ว'); api.getPaymentRequests(filter, token).then(setPayments); }
    catch (e: any) { setMsg(e.message); }
  }
  async function deleteReq(id: number) {
    try { await api.deletePaymentRequest(id, token); setPayments(prev => prev.filter(p => p.id !== id)); setMsg('ลบแล้ว'); }
    catch (e: any) { setMsg(e.message); }
  }

  const totalRevenue = coinStats?.revenue?.total || 0;
  const maxMonthly = Math.max(...(coinStats?.monthly_revenue || []).map((m: any) => m.revenue || 0), 1);
  const FEAT_ICONS: Record<string, string> = { boost: '🚀', price_alert: '🔔', auto_relist: '🔄', featured: '⭐', analytics_pro: '📊' };

  return (
    <div>
      {/* KPI Row */}
      <div className="ad-home-hero" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { l: 'รายได้รวม', v: fmtMoney(totalRevenue) },
          { l: 'รอ webhook', v: String(coinStats?.pending?.count || 0) },
          { l: 'เหรียญแจก', v: fmt(coinStats?.coins?.issued || 0) },
          { l: 'เหรียญคงค้าง', v: fmt(coinStats?.coins?.outstanding || 0) },
        ].map(s => (
          <div key={s.l} className="ad-home-stat">
            <div className="ad-home-stat-l">{s.l}</div>
            <div className="ad-home-stat-v">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Feature usage + Revenue by package */}
      {coinStats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="ad-panel">
            <div className="ad-panel-head"><h3>⭐ ฟีเจอร์ที่ใช้บ่อย</h3></div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(coinStats.feature_usage || []).length === 0
                ? <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>ยังไม่มีข้อมูล</div>
                : (coinStats.feature_usage || []).map((f: any) => {
                    const maxT = Math.max(...(coinStats.feature_usage || []).map((x: any) => x.total), 1);
                    return (
                      <div key={f.feature_key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>{FEAT_ICONS[f.feature_key] ?? '•'} {f.feature_key.replace(/_/g, ' ')}</span>
                          <span style={{ color: 'var(--ink-3)' }}>{f.total} ครั้ง · 🪙{Number(f.coins_spent).toLocaleString()}</span>
                        </div>
                        <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${(f.total / maxT) * 100}%`, background: 'var(--accent)', borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
          <div className="ad-panel">
            <div className="ad-panel-head"><h3>📦 แพ็กเกจที่ขายดี</h3></div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(coinStats.revenue_by_package || []).length === 0
                ? <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>ยังไม่มีข้อมูล</div>
                : (coinStats.revenue_by_package || []).map((pkg: any) => (
                    <div key={pkg.package_key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                      <span style={{ fontWeight: 600 }}>🪙 {pkg.package_key.replace('coins_', '')} เหรียญ</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--pos)' }}>฿{Number(pkg.revenue).toLocaleString()}</div>
                        <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>{pkg.count} ครั้ง</div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Monthly revenue chart */}
      {(coinStats?.monthly_revenue || []).length > 0 && (
        <div className="ad-panel" style={{ marginBottom: 14 }}>
          <div className="ad-panel-head"><h3>📈 รายได้รายเดือน (6 เดือนล่าสุด)</h3></div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {(coinStats.monthly_revenue || []).map((m: any) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--ink-3)', fontWeight: 600 }}>฿{Number(m.revenue || 0).toLocaleString()}</span>
                <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '3px 3px 0 0', height: Math.max(4, Math.round(((m.revenue || 0) / maxMonthly) * 80)), opacity: .85 }} />
                <span style={{ fontSize: 9, color: 'var(--ink-3)' }}>{m.month.slice(5)}/{m.month.slice(2, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top buyers */}
      {(coinStats?.top_buyers || []).length > 0 && (
        <div className="ad-panel" style={{ marginBottom: 14 }}>
          <div className="ad-panel-head"><h3>👑 ผู้ซื้อเหรียญสูงสุด</h3></div>
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(coinStats.top_buyers || []).map((b: any, i: number) => (
              <div key={b.email} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: ['#f59e0b','#94a3b8','#b45309'][i] ?? 'var(--ink-3)', width: 20 }}>#{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>{b.email}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--pos)' }}>฿{Number(b.total_spent).toLocaleString()}</div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>🪙 {b.coin_balance.toLocaleString()} เหลือ</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Transactions (OPN only — read-only log) */}
      <div className="ad-panel-head" style={{ marginBottom: 8 }}><h3>💳 รายการชำระเงิน OPN</h3></div>
      <div className="ad-flt-row">
        <div className="ad-flt-grp">
          {(['confirmed', 'pending', 'rejected'] as const).map(k => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
              {k === 'confirmed' ? 'สำเร็จ' : k === 'pending' ? 'รอ webhook' : 'ล้มเหลว'}
            </button>
          ))}
        </div>
        {msg && <span style={{ fontSize: 12, color: 'var(--pos)' }}>{msg} <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>✕</button></span>}
      </div>
      <div className="ad-tbl-wrap">
        {loading ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div> : payments.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>ไม่มีคำขอ</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {payments.map(req => {
              const isOPN = req.sender_name === 'OPN PromptPay' || req.sender_name === 'OPN Card';
              return (
                <div key={req.id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8, background: isOPN ? 'color-mix(in srgb,var(--accent) 4%,var(--surface))' : 'var(--surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{req.user_name || `User #${req.user_id}`}</span>
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{req.user_email}</span>
                        {isOPN && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent)', color: '#fff', borderRadius: 4, padding: '1px 7px' }}>OPN อัตโนมัติ</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>แพ็กเกจ: <b>{req.package_key}</b> · {req.coins} เหรียญ · <b>{fmtMoney(req.amount)}</b></div>
                      {req.sender_name && !isOPN && <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>ชื่อผู้โอน: <b>{req.sender_name}</b></div>}
                      {isOPN && <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>charge: {req.slip_url}</div>}
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{fmtDateTime(req.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      {req.slip_url && !isOPN && <a href={req.slip_url} target="_blank" rel="noreferrer" className="btn-sec" style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}>ดูสลิป</a>}
                      <StatusTag status={req.status} />
                    </div>
                  </div>
                  {/* OPN pending → waiting for webhook, admin can delete stale ones */}
                  {filter === 'pending' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--ink-3)', background: 'var(--surface-2)', borderRadius: 5, padding: '6px 10px' }}>
                      <span style={{ flex: 1 }}>⏳ รอ OPN webhook ยืนยันอัตโนมัติ — ไม่ต้องดำเนินการ</span>
                      <button onClick={() => deleteReq(req.id)}
                        style={{ flexShrink: 0, padding: '3px 10px', border: '1px solid var(--line)', borderRadius: 4, background: 'none', color: 'var(--neg)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                        🗑 ลบ
                      </button>
                    </div>
                  )}
                  {req.admin_note && <div style={{ fontSize: 12, color: 'var(--neg)', background: 'color-mix(in srgb,var(--neg) 8%,transparent)', padding: '6px 10px', borderRadius: 5 }}>หมายเหตุ: {req.admin_note}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { data: session, status } = useSession();
  const token = (session as any)?.token as string;
  const isAdmin = !!(session?.user as any)?.is_admin;
  const userName = session?.user?.name || 'Admin';
  const [tab, setTab] = useState('queue');
  const [cmdkOpen, setCmdkOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdkOpen(true); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (status === 'loading') return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div>;
  if (!session?.user || !isAdmin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)' }}>ไม่มีสิทธิ์เข้าถึง</div>
      <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</div>
      <a href="/" style={{ color: 'var(--accent)', fontSize: 14 }}>← กลับหน้าแรก</a>
    </div>
  );

  const navItems = [
    { key: 'queue',      label: 'ร้องเรียน Inbox',  icon: <IcoQueue /> },
    { key: 'users',      label: 'ผู้ใช้',            icon: <IcoUsers /> },
    { key: 'products',   label: 'ประกาศ',            icon: <IcoBox /> },
    { key: 'complaints', label: 'ร้องเรียนทั้งหมด', icon: <IcoAlert /> },
    { key: 'finance',    label: 'การเงิน',            icon: <IcoChart /> },
    { key: 'accounting', label: 'บัญชี',              icon: <IcoCoin /> },
  ];

  const tabLabels: Record<string, string> = { queue: 'ร้องเรียน Inbox', users: 'ผู้ใช้', products: 'ประกาศ', complaints: 'ร้องเรียนทั้งหมด', finance: 'การเงิน', accounting: 'บัญชี' };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="ad">
        {/* Sidebar */}
        <aside className="ad-side">
          <div className="ad-brand">
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-.01em' }}>Admin</div>
            </div>
            <span className="ad-brand-sub">OPS</span>
          </div>

          <div className="ad-side-label">เมนู</div>

          <nav className="ad-nav">
            {navItems.map(item => (
              <button key={item.key} className={tab === item.key ? 'on' : ''} onClick={() => setTab(item.key)}>
                <span className="ad-ic">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ad-side-label">Saved Views</div>
          <div className="ad-saved-views">
            <button onClick={() => setTab('queue')}>
              <span className="dot" style={{ background: 'var(--neg)' }} />
              SLA เสี่ยงตก
            </button>
            <button onClick={() => setTab('users')}>
              <span className="dot" style={{ background: 'var(--warn)' }} />
              สมาชิกใหม่
            </button>
            <button onClick={() => setTab('products')}>
              <span className="dot" style={{ background: 'var(--accent)' }} />
              รอตรวจประกาศ
            </button>
          </div>

          <a href="/" className="ad-close">
            <IcoBack />
            กลับเว็บหลัก
          </a>

          <div className="ad-admin-card">
            <div className="ad-admin-ava">{userName[0]?.toUpperCase()}</div>
            <div>
              <div className="ad-admin-name">{userName}</div>
              <div className="ad-admin-role">ADMIN</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="ad-main">
          <div className="ad-topbar">
            <div className="ad-topbar-title">
              <h1>{tabLabels[tab]}</h1>
              <div className="ad-breadcrumb">Admin → {tabLabels[tab]}</div>
            </div>
            <button className="ad-cmdk" onClick={() => setCmdkOpen(true)}>
              <IcoSearch />
              ค้นหาหรือไปที่...
              <kbd>⌘K</kbd>
            </button>
            <div className="ad-metric-chips">
              <div className="ad-chip live"><span className="dot" /><span>Live</span></div>
            </div>
          </div>

          <div className={`ad-content${tab === 'queue' ? ' no-pad' : ''}`}>
            {tab === 'queue'      && <QueueView         token={token} />}
            {tab === 'users'      && <UsersTab           token={token} />}
            {tab === 'products'   && <ProductsTab        token={token} />}
            {tab === 'complaints' && <ComplaintsTableTab token={token} />}
            {tab === 'finance'    && <FinanceTab         token={token} />}
            {tab === 'accounting' && <AccountingTab      token={token} />}
          </div>
        </div>
      </div>

      {cmdkOpen && (
        <CommandPalette
          onClose={() => setCmdkOpen(false)}
          onNavigate={key => { setTab(key); setCmdkOpen(false); }}
        />
      )}
    </div>
  );
}
