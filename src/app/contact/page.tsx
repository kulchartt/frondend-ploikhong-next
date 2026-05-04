'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as api from '@/lib/api';

const FIELD_LABELS: Record<keyof api.SiteSettings, string> = {
  business_name: 'ชื่อกิจการ',
  owner_name: 'ผู้ประกอบการ',
  address: 'ที่อยู่',
  phone: 'เบอร์โทรศัพท์',
  email: 'อีเมล',
  website: 'เว็บไซต์',
  registration_number: 'เลขทะเบียนพาณิชย์',
  updated_at: 'อัปเดตล่าสุด',
};

function formatPhone(p?: string) {
  if (!p) return '';
  const digits = p.replace(/\D/g, '');
  if (digits.length === 10) return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
  return p;
}

export default function ContactPage() {
  const { data: session } = useSession();
  const isAdmin = !!(session?.user as any)?.is_admin;
  const token = (session as any)?.token as string | undefined;

  const [data, setData] = useState<api.SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const s = await api.getSiteSettings();
      setData(s);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'โหลดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← กลับหน้าหลัก</Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>ติดต่อเรา</h1>
          {isAdmin && data && !editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '8px 16px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              ✏️ แก้ไข
            </button>
          )}
        </div>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 0, marginBottom: 40 }}>ข้อมูลผู้ประกอบการตามพระราชบัญญัติทะเบียนพาณิชย์ พ.ศ. 2499</p>

        {loading && <div style={{ padding: 24, color: 'var(--ink-3)' }}>กำลังโหลด...</div>}
        {error && <div style={{ padding: 16, background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: 14 }}>⚠️ {error}</div>}

        {!loading && !error && data && !editing && <ContactDisplay data={data} />}
        {!loading && data && editing && (
          <ContactEdit
            data={data}
            token={token}
            onCancel={() => setEditing(false)}
            onSaved={(updated) => { setData(updated); setEditing(false); }}
          />
        )}

        <div style={{ marginTop: 48, padding: '24px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>💬 ช่องทางอื่นในการติดต่อ</div>
          <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: 13, lineHeight: 1.8, color: 'var(--ink-2)' }}>
            <li>หากมีปัญหาเกี่ยวกับสินค้าหรือผู้ใช้งาน — ใช้ <Link href="/" style={{ color: 'var(--accent)' }}>ปุ่ม &quot;🚨 ร้องเรียน&quot;</Link> ที่ footer หน้าแรก</li>
            <li>คำถามทั่วไป — ดูที่ <Link href="/help" style={{ color: 'var(--accent)' }}>ศูนย์ช่วยเหลือ</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ContactDisplay({ data }: { data: api.SiteSettings }) {
  const phone = formatPhone(data.phone);
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (data.business_name) rows.push({ label: FIELD_LABELS.business_name, value: data.business_name });
  if (data.owner_name) rows.push({ label: FIELD_LABELS.owner_name, value: data.owner_name });
  if (data.address) rows.push({ label: FIELD_LABELS.address, value: data.address });
  if (data.phone) rows.push({ label: FIELD_LABELS.phone, value: <a href={`tel:${data.phone}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{phone}</a> });
  if (data.email) rows.push({ label: FIELD_LABELS.email, value: <a href={`mailto:${data.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{data.email}</a> });
  if (data.website) rows.push({ label: FIELD_LABELS.website, value: <a href={data.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{data.website}</a> });
  if (data.registration_number) rows.push({ label: FIELD_LABELS.registration_number, value: data.registration_number });

  if (!rows.length) return <div style={{ padding: 24, color: 'var(--ink-3)' }}>ยังไม่ได้ตั้งข้อมูลผู้ประกอบการ</div>;

  return (
    <div data-testid="contact-info" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {rows.map((r, i) => (
        <div key={r.label} style={{ display: 'flex', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none', padding: '14px 20px', fontSize: 14, gap: 16 }}>
          <div style={{ flex: '0 0 140px', color: 'var(--ink-3)', fontWeight: 600 }}>{r.label}</div>
          <div style={{ flex: 1, color: 'var(--ink)', wordBreak: 'break-word' }}>{r.value}</div>
        </div>
      ))}
    </div>
  );
}

function ContactEdit({
  data, token, onCancel, onSaved,
}: {
  data: api.SiteSettings;
  token?: string;
  onCancel: () => void;
  onSaved: (updated: api.SiteSettings) => void;
}) {
  const [form, setForm] = useState<api.SiteSettings>({ ...data });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof api.SiteSettings>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setErr('ต้องเข้าสู่ระบบในฐานะ admin ก่อน'); return; }
    setSaving(true);
    setErr(null);
    try {
      const updated = await api.updateSiteSettings(form, token);
      onSaved(updated);
    } catch (e: any) {
      setErr(e.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', color: 'var(--ink)', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 };

  return (
    <form onSubmit={save} data-testid="contact-edit-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>{FIELD_LABELS.business_name}</label>
        <input type="text" value={form.business_name || ''} onChange={e => set('business_name', e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>{FIELD_LABELS.owner_name}</label>
        <input type="text" value={form.owner_name || ''} onChange={e => set('owner_name', e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>{FIELD_LABELS.address}</label>
        <textarea value={form.address || ''} onChange={e => set('address', e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
      </div>
      <div>
        <label style={labelStyle}>{FIELD_LABELS.phone}</label>
        <input type="tel" value={form.phone || ''} onChange={e => set('phone', e.target.value)} style={inputStyle} placeholder="08xxxxxxxx" />
      </div>
      <div>
        <label style={labelStyle}>{FIELD_LABELS.email}</label>
        <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} style={inputStyle} placeholder="contact@ploikhong.com" />
      </div>
      <div>
        <label style={labelStyle}>{FIELD_LABELS.website}</label>
        <input type="url" value={form.website || ''} onChange={e => set('website', e.target.value)} style={inputStyle} placeholder="https://ploikhong.com" />
      </div>
      <div>
        <label style={labelStyle}>{FIELD_LABELS.registration_number} <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(ไม่บังคับ)</span></label>
        <input type="text" value={form.registration_number || ''} onChange={e => set('registration_number', e.target.value)} style={inputStyle} placeholder="ใส่เมื่อจดทะเบียน DBD เสร็จ" />
      </div>

      {err && <div style={{ padding: 12, background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>⚠️ {err}</div>}

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button type="submit" disabled={saving} style={{
          flex: 1, padding: '10px 20px', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700,
          cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1,
        }}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        <button type="button" onClick={onCancel} disabled={saving} style={{
          padding: '10px 20px', background: 'var(--surface)', color: 'var(--ink)',
          border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700,
          cursor: 'pointer',
        }}>ยกเลิก</button>
      </div>
    </form>
  );
}
