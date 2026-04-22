'use client';
import { useState, useEffect, useCallback } from 'react';
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  users: number;
  products: number;
  available: number;
  sold: number;
  orders: number;
  revenue: number;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: number;
  is_banned: number;
  created_at: string;
  rating: number;
  review_count: number;
}

interface AdminProduct {
  id: number;
  title: string;
  price: number;
  seller_name: string;
  status: string;
  created_at: string;
  category: string;
}

interface PaymentRequest {
  id: number;
  user_id: number;
  package_key: string;
  coins: number;
  amount: number;
  slip_url: string | null;
  sender_name: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: '20px 24px',
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
  marginBottom: 20,
};

const tbl: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '2px solid #e2e8f0',
  color: '#64748b',
  fontWeight: 600,
  fontSize: 12,
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #f1f5f9',
  color: '#1e293b',
  verticalAlign: 'middle',
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, background: color + '20', color,
    }}>
      {label}
    </span>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,.08)', flex: '1 1 160px', minWidth: 140,
    }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || '#0f172a', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ActionBtn({ children, onClick, variant = 'default' }: { children: React.ReactNode; onClick: () => void; variant?: 'default' | 'danger' | 'warning' | 'success' }) {
  const colors: Record<string, { bg: string; color: string }> = {
    default: { bg: '#e2e8f0', color: '#475569' },
    danger:  { bg: '#fee2e2', color: '#dc2626' },
    warning: { bg: '#fef3c7', color: '#d97706' },
    success: { bg: '#dcfce7', color: '#16a34a' },
  };
  const c = colors[variant];
  return (
    <button onClick={onClick} style={{
      padding: '4px 10px', border: 'none', borderRadius: 6, cursor: 'pointer',
      fontSize: 12, fontWeight: 600, background: c.bg, color: c.color, fontFamily: 'inherit',
    }}>
      {children}
    </button>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab({ token }: { token: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    adminFetch('/api/admin/stats', token)
      .then(setStats)
      .catch(e => setErr(e.message));
  }, [token]);

  if (err) return <div style={{ color: '#dc2626', padding: 20 }}>ไม่สามารถโหลดข้อมูลได้: {err}</div>;
  if (!stats) return <div style={{ padding: 20, color: '#94a3b8' }}>กำลังโหลด...</div>;

  const fmt = (n: number) => n.toLocaleString('th-TH');
  const fmtMoney = (n: number) => '฿' + n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>ภาพรวมแพลตฟอร์ม</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <KpiCard label="ผู้ใช้ทั้งหมด" value={fmt(stats.users)} color="#2563eb" />
        <KpiCard label="สินค้าทั้งหมด" value={fmt(stats.products)} />
        <KpiCard label="สินค้าขายอยู่" value={fmt(stats.available)} color="#16a34a" />
        <KpiCard label="สินค้าขายแล้ว" value={fmt(stats.sold)} color="#d97706" />
        <KpiCard label="คำสั่งซื้อ" value={fmt(stats.orders)} color="#7c3aed" />
        <KpiCard label="รายได้รวม" value={fmtMoney(stats.revenue)} color="#0f172a" />
      </div>
      <div style={card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>สัดส่วนสินค้า</h3>
        {stats.products > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'ขายอยู่', val: stats.available, color: '#16a34a' },
              { label: 'ขายแล้ว', val: stats.sold, color: '#f59e0b' },
              { label: 'อื่นๆ', val: stats.products - stats.available - stats.sold, color: '#94a3b8' },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: '#475569' }}>{row.label}</span>
                  <span style={{ fontWeight: 600 }}>{row.val.toLocaleString()}</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((row.val / stats.products) * 100)}%`, background: row.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────
function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const path = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : '/api/admin/users';
      const data = await adminFetch(path, token);
      setUsers(data);
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function ban(id: number) {
    try {
      const r = await adminFetch(`/api/admin/users/${id}/ban`, token, { method: 'PATCH' });
      setMsg(r.message);
      load(search || undefined);
    } catch (e: any) { setMsg(e.message); }
  }

  async function toggleAdmin(id: number) {
    try {
      const r = await adminFetch(`/api/admin/users/${id}/toggle-admin`, token, { method: 'PATCH' });
      setMsg(r.message);
      load(search || undefined);
    } catch (e: any) { setMsg(e.message); }
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>ผู้ใช้ทั้งหมด</h2>
      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d' }}>
          {msg} <button onClick={() => setMsg('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          placeholder="ค้นหาชื่อหรืออีเมล..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(search || undefined)}
          style={{ flex: 1, maxWidth: 320, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={() => load(search || undefined)}
          style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
          ค้นหา
        </button>
        <button onClick={() => { setSearch(''); load(); }}
          style={{ padding: '8px 14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
          รีเซ็ต
        </button>
      </div>
      <div style={card}>
        {loading ? (
          <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>กำลังโหลด...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={th}>ID</th>
                  <th style={th}>ชื่อ</th>
                  <th style={th}>อีเมล</th>
                  <th style={th}>สิทธิ์</th>
                  <th style={th}>สถานะ</th>
                  <th style={th}>วันที่สมัคร</th>
                  <th style={th}>การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ transition: 'background .1s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = '')}>
                    <td style={td}><span style={{ color: '#94a3b8', fontSize: 11 }}>#{u.id}</span></td>
                    <td style={td}><strong>{u.name}</strong></td>
                    <td style={td}><span style={{ color: '#475569' }}>{u.email}</span></td>
                    <td style={td}>
                      {u.is_admin ? <Badge label="Admin" color="#7c3aed" /> : <Badge label="User" color="#64748b" />}
                    </td>
                    <td style={td}>
                      {u.is_banned ? <Badge label="Banned" color="#dc2626" /> : <Badge label="Active" color="#16a34a" />}
                    </td>
                    <td style={td}><span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString('th-TH')}</span></td>
                    <td style={{ ...td, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <ActionBtn onClick={() => ban(u.id)} variant={u.is_banned ? 'success' : 'danger'}>
                        {u.is_banned ? 'ปลดแบน' : 'แบน'}
                      </ActionBtn>
                      <ActionBtn onClick={() => toggleAdmin(u.id)} variant="warning">
                        {u.is_admin ? 'ถอด Admin' : 'ให้ Admin'}
                      </ActionBtn>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: 32 }}>ไม่พบผู้ใช้</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Products ────────────────────────────────────────────────────────────
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
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      const qs = params.toString() ? '?' + params.toString() : '';
      const data = await adminFetch(`/api/admin/products${qs}`, token);
      setProducts(data);
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function del(id: number, title: string) {
    if (!confirm(`ลบสินค้า "${title}" จริงหรือ?`)) return;
    try {
      const r = await adminFetch(`/api/admin/products/${id}`, token, { method: 'DELETE' });
      setMsg(r.message);
      load(search || undefined, statusFilter || undefined);
    } catch (e: any) { setMsg(e.message); }
  }

  const statusColor: Record<string, string> = {
    available: '#16a34a',
    sold: '#64748b',
    reserved: '#d97706',
    draft: '#94a3b8',
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>สินค้าทั้งหมด</h2>
      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d' }}>
          {msg} <button onClick={() => setMsg('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="ค้นหาชื่อสินค้า / ชื่อผู้ขาย..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(search || undefined, statusFilter || undefined)}
          style={{ flex: 1, minWidth: 220, maxWidth: 320, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); load(search || undefined, e.target.value || undefined); }}
          style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', color: '#1e293b' }}>
          <option value="">ทุกสถานะ</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="reserved">Reserved</option>
          <option value="draft">Draft</option>
        </select>
        <button onClick={() => load(search || undefined, statusFilter || undefined)}
          style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
          ค้นหา
        </button>
        <button onClick={() => { setSearch(''); setStatusFilter(''); load(); }}
          style={{ padding: '8px 14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
          รีเซ็ต
        </button>
      </div>
      <div style={card}>
        {loading ? (
          <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>กำลังโหลด...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={th}>ID</th>
                  <th style={th}>ชื่อสินค้า</th>
                  <th style={th}>หมวด</th>
                  <th style={th}>ราคา</th>
                  <th style={th}>ผู้ขาย</th>
                  <th style={th}>สถานะ</th>
                  <th style={th}>วันที่ลง</th>
                  <th style={th}>การกระทำ</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}
                    onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = '')}>
                    <td style={td}><span style={{ color: '#94a3b8', fontSize: 11 }}>#{p.id}</span></td>
                    <td style={td}><strong style={{ maxWidth: 240, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</strong></td>
                    <td style={td}><span style={{ fontSize: 12, color: '#475569' }}>{p.category}</span></td>
                    <td style={td}><strong style={{ color: '#0f172a' }}>฿{p.price.toLocaleString()}</strong></td>
                    <td style={td}><span style={{ fontSize: 12 }}>{p.seller_name}</span></td>
                    <td style={td}><Badge label={p.status} color={statusColor[p.status] || '#64748b'} /></td>
                    <td style={td}><span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(p.created_at).toLocaleDateString('th-TH')}</span></td>
                    <td style={td}>
                      <ActionBtn onClick={() => del(p.id, p.title)} variant="danger">ลบ</ActionBtn>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: 32 }}>ไม่พบสินค้า</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Premium ─────────────────────────────────────────────────────────────
function PremiumTab({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.getCoinAdminStats(token)
      .then(setStats)
      .catch((e: any) => setErr(e.message));
  }, [token]);

  if (err) return <div style={{ color: '#dc2626', padding: 20 }}>ไม่สามารถโหลดข้อมูลได้: {err}</div>;
  if (!stats) return <div style={{ padding: 20, color: '#94a3b8' }}>กำลังโหลด...</div>;

  const maxMonthly = Math.max(...(stats.monthly_revenue || []).map((m: any) => m.revenue || 0), 1);
  const totalRevenue = stats.revenue?.total || 0;
  const totalCoinsIssued = stats.coins?.issued || 0;
  const totalCoinsOutstanding = stats.coins?.outstanding || 0;
  const pendingCount = stats.pending?.count || 0;

  const FEATURE_LABELS: Record<string, string> = {
    auto_relist: '🔄 ลงประกาศอัตโนมัติ',
    featured: '⭐ ปักหมุดสินค้า',
    price_alert: '🔔 แจ้งเตือนราคา',
    analytics_pro: '📊 Analytics Pro',
    priority_support: '💬 Priority Support',
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Premium & เหรียญ</h2>

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <KpiCard label="รายได้รวม (฿)" value={'฿' + totalRevenue.toLocaleString()} color="#0f172a" />
        <KpiCard label="รอยืนยัน" value={pendingCount} color="#d97706" />
        <KpiCard label="เหรียญแจก" value={totalCoinsIssued.toLocaleString()} color="#7c3aed" />
        <KpiCard label="เหรียญคงค้าง" value={totalCoinsOutstanding.toLocaleString()} color="#2563eb" />
      </div>

      {/* Revenue Sources Breakdown */}
      {stats.revenue_sources && stats.revenue_sources.length > 0 && (
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>แหล่งรายได้</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.revenue_sources.map((src: any) => {
              const pct = totalRevenue > 0 ? Math.round((src.total / totalRevenue) * 100) : 0;
              return (
                <div key={src.source}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: '#475569' }}>{src.label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      ฿{(src.total || 0).toLocaleString()}
                      <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 6 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#f59e0b', borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
            * ค่าธรรมเนียมการขาย 3% จะถูกเปิดใช้งานในอนาคต
          </p>
        </div>
      )}

      {/* Monthly Revenue Chart */}
      {stats.monthly_revenue && stats.monthly_revenue.length > 0 && (
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>รายได้รายเดือน</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {stats.monthly_revenue.map((m: any) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>฿{(m.revenue || 0).toLocaleString()}</div>
                <div style={{
                  width: '100%', background: '#f59e0b', borderRadius: '4px 4px 0 0',
                  height: Math.max(4, Math.round(((m.revenue || 0) / maxMonthly) * 80)),
                }} />
                <div style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature usage + estimated baht revenue */}
      {stats.feature_usage && stats.feature_usage.length > 0 && (
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>การใช้งาน Feature & ยอดรายได้ประมาณ</h3>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>Feature</th>
                <th style={{ ...th, textAlign: 'center' }}>ครั้งที่ใช้</th>
                <th style={{ ...th, textAlign: 'right' }}>เหรียญที่ใช้ไป</th>
                <th style={{ ...th, textAlign: 'right' }}>รายได้ประมาณ (฿)</th>
              </tr>
            </thead>
            <tbody>
              {stats.feature_usage.map((f: any) => (
                <tr key={f.feature_key}>
                  <td style={td}>{FEATURE_LABELS[f.feature_key] || f.feature_key}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{(f.total || 0).toLocaleString()}</td>
                  <td style={{ ...td, textAlign: 'right', color: '#7c3aed', fontWeight: 600 }}>{(f.coins_spent || 0).toLocaleString()}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <strong style={{ color: '#15803d' }}>฿{(f.estimated_baht || 0).toLocaleString()}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ ...td, fontWeight: 700 }} colSpan={2}>รวม</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                  {stats.feature_usage.reduce((s: number, f: any) => s + (f.coins_spent || 0), 0).toLocaleString()}
                </td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                  ฿{stats.feature_usage.reduce((s: number, f: any) => s + (f.estimated_baht || 0), 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
            * รายได้ประมาณ คำนวณจาก เหรียญที่ใช้ × มูลค่าเฉลี่ยต่อเหรียญ
          </p>
        </div>
      )}

      {/* Revenue by package */}
      {stats.revenue_by_package && stats.revenue_by_package.length > 0 && (
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>รายได้ตามแพ็กเกจ</h3>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>แพ็กเกจ</th>
                <th style={{ ...th, textAlign: 'center' }}>จำนวนคำขอ</th>
                <th style={{ ...th, textAlign: 'right' }}>รายได้รวม</th>
              </tr>
            </thead>
            <tbody>
              {stats.revenue_by_package.map((pkg: any) => (
                <tr key={pkg.package_key}>
                  <td style={td}><strong>{pkg.package_key}</strong></td>
                  <td style={{ ...td, textAlign: 'center' }}>{pkg.count}</td>
                  <td style={{ ...td, textAlign: 'right' }}><strong style={{ color: '#0f172a' }}>฿{(pkg.revenue || 0).toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Payments ────────────────────────────────────────────────────────────
function PaymentsTab({ token }: { token: string }) {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [rejectNote, setRejectNote] = useState<Record<number, string>>({});

  const load = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const data = await api.getPaymentRequests(status, token);
      setRequests(data);
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(filter); }, [load, filter]);

  async function confirm(id: number) {
    try {
      const r = await api.confirmPayment(id, token);
      setMsg(r.message || 'ยืนยันแล้ว');
      load(filter);
    } catch (e: any) { setMsg(e.message); }
  }

  async function reject(id: number) {
    const note = rejectNote[id] || '';
    try {
      const r = await api.rejectPayment(id, note, token);
      setMsg(r.message || 'ปฏิเสธแล้ว');
      setRejectNote(prev => { const n = { ...prev }; delete n[id]; return n; });
      load(filter);
    } catch (e: any) { setMsg(e.message); }
  }

  const filterBtns: Array<{ key: 'pending' | 'confirmed' | 'rejected'; label: string; color: string }> = [
    { key: 'pending',   label: 'รอยืนยัน',  color: '#d97706' },
    { key: 'confirmed', label: 'ยืนยันแล้ว', color: '#16a34a' },
    { key: 'rejected',  label: 'ปฏิเสธแล้ว', color: '#dc2626' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>คำขอเติมเหรียญ</h2>
      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d' }}>
          {msg} <button onClick={() => setMsg('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {filterBtns.map(btn => (
          <button key={btn.key} onClick={() => setFilter(btn.key)}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              background: filter === btn.key ? btn.color : '#f1f5f9',
              color: filter === btn.key ? '#fff' : '#475569',
            }}>
            {btn.label}
          </button>
        ))}
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>กำลังโหลด...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 32, color: '#94a3b8', textAlign: 'center' }}>ไม่มีคำขอ</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.map(req => (
              <div key={req.id} style={{
                border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px',
                background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                      {req.user_name || `User #${req.user_id}`}
                      {req.user_email && <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>{req.user_email}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                      แพ็กเกจ: <strong>{req.package_key}</strong> · {req.coins} เหรียญ · <strong style={{ color: '#0f172a' }}>฿{req.amount.toLocaleString()}</strong>
                    </div>
                    {req.sender_name && <div style={{ fontSize: 12, color: '#475569' }}>ชื่อผู้โอน: <strong>{req.sender_name}</strong></div>}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{new Date(req.created_at).toLocaleString('th-TH')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    {req.slip_url && (
                      <a href={req.slip_url} target="_blank" rel="noreferrer"
                        style={{ padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        ดูสลิป
                      </a>
                    )}
                    <Badge
                      label={req.status === 'pending' ? 'รอยืนยัน' : req.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ปฏิเสธแล้ว'}
                      color={req.status === 'pending' ? '#d97706' : req.status === 'confirmed' ? '#16a34a' : '#dc2626'}
                    />
                  </div>
                </div>

                {filter === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <ActionBtn onClick={() => confirm(req.id)} variant="success">ยืนยัน ✓</ActionBtn>
                    <input
                      placeholder="หมายเหตุปฏิเสธ..."
                      value={rejectNote[req.id] || ''}
                      onChange={e => setRejectNote(prev => ({ ...prev, [req.id]: e.target.value }))}
                      style={{ flex: 1, minWidth: 160, padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, outline: 'none', fontFamily: 'inherit' }}
                    />
                    <ActionBtn onClick={() => reject(req.id)} variant="danger">ปฏิเสธ ✕</ActionBtn>
                  </div>
                )}

                {req.admin_note && (
                  <div style={{ fontSize: 12, color: '#dc2626', background: '#fff5f5', padding: '6px 10px', borderRadius: 6 }}>
                    หมายเหตุ: {req.admin_note}
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

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { data: session, status } = useSession();
  const token = (session as any)?.token as string;
  const isAdmin = !!(session?.user as any)?.is_admin;
  const [tab, setTab] = useState('overview');

  if (status === 'loading') return (
    <div style={{ padding: 40, fontFamily: 'inherit', color: '#475569' }}>กำลังโหลด...</div>
  );

  if (!session?.user || !isAdmin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12, fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>ไม่มีสิทธิ์เข้าถึง</div>
      <div style={{ fontSize: 14, color: '#64748b' }}>หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</div>
      <a href="/" style={{ color: '#2563eb', fontSize: 14, textDecoration: 'none' }}>← กลับหน้าแรก</a>
    </div>
  );

  const navTabs = [
    { key: 'overview',  label: '📊 ภาพรวม' },
    { key: 'users',     label: '👥 ผู้ใช้' },
    { key: 'products',  label: '📦 สินค้า' },
    { key: 'premium',   label: '🪙 Premium' },
    { key: 'payments',  label: '💳 คำขอเติมเหรียญ' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#0f172a', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b', letterSpacing: '-.02em' }}>
            🛡️ Admin Panel
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Ploikhong Marketplace</div>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {navTabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 12px', border: 'none', cursor: 'pointer',
                borderRadius: 8, marginBottom: 2, fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit',
                background: tab === t.key ? '#1e293b' : 'none',
                color: tab === t.key ? '#f59e0b' : '#94a3b8',
                borderLeft: tab === t.key ? '3px solid #f59e0b' : '3px solid transparent',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (tab !== t.key) (e.currentTarget as HTMLButtonElement).style.background = '#1e293b'; }}
              onMouseLeave={e => { if (tab !== t.key) (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
          <a href="/" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>← กลับเว็บหลัก</a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', minWidth: 0 }}>
        {tab === 'overview'  && <OverviewTab  token={token} />}
        {tab === 'users'     && <UsersTab     token={token} />}
        {tab === 'products'  && <ProductsTab  token={token} />}
        {tab === 'premium'   && <PremiumTab   token={token} />}
        {tab === 'payments'  && <PaymentsTab  token={token} />}
      </main>
    </div>
  );
}
