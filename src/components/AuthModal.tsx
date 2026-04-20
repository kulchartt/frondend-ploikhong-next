'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { PloiWordmark } from './PloiLogo';
import { X, Eye, EyeOff } from 'lucide-react';

type Mode = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

export function AuthModal({ open, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  // Reset to initialMode whenever modal opens
  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        const r = await signIn('credentials', { email, password, redirect: false });
        if (r?.error) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setSuccess('เข้าสู่ระบบสำเร็จ!');
        setTimeout(onClose, 800);
      } else if (mode === 'signup') {
        const API = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ');
        await signIn('credentials', { email, password, redirect: false });
        setSuccess('สมัครสมาชิกสำเร็จ!');
        setTimeout(onClose, 800);
      } else {
        setSuccess('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider: 'google' | 'facebook') {
    setLoading(true);
    await signIn(provider, { callbackUrl: '/' });
  }

  function switchMode(m: Mode) { setMode(m); setError(''); setSuccess(''); }

  const SOCIALS = [
    { id: 'facebook' as const, label: 'Facebook', color: '#1877F2',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    { id: 'google' as const, label: 'Google', color: '#333',
      icon: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
    { id: 'facebook' as const, label: 'Apple', color: '#000',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#000"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg> },
    { id: 'google' as const, label: 'LINE', color: '#06C755',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#06C755"><path d="M19.952 11.015c0-4.15-4.162-7.525-9.276-7.525-5.115 0-9.276 3.375-9.276 7.525 0 3.72 3.298 6.835 7.757 7.426.302.065.713.2.817.459.094.235.061.604.03.843l-.132.793c-.04.235-.187.919.805.501 1-.42 5.358-3.155 7.311-5.401C19.402 13.784 19.952 12.461 19.952 11.015z"/></svg> },
  ];

  return (
    <div data-testid="auth-modal" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: 'var(--surface)', borderRadius: 16, padding: 36, width: '100%',
          maxWidth: 440, boxShadow: '0 30px 80px rgba(0,0,0,.35)', position: 'relative' }}>

        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: 20 }}><PloiWordmark /></div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--ink)' }}>
          {mode === 'login' ? 'ยินดีต้อนรับกลับ' : mode === 'signup' ? 'สร้างบัญชีใหม่' : 'รีเซ็ตรหัสผ่าน'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          {mode === 'login' ? 'เข้าสู่ระบบเพื่อซื้อ-ขายในตลาด' : mode === 'signup' ? 'เริ่มซื้อขายได้ทันที ฟรี!' : 'กรอกอีเมลเพื่อรับลิงก์'}
        </p>

        {/* Social login */}
        {mode !== 'reset' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {SOCIALS.map((s, i) => (
                <button key={i} onClick={() => handleSocial(s.id)} disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    color: 'var(--ink)' }}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>หรือ</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <input placeholder="ชื่อของคุณ" value={name} onChange={e => setName(e.target.value)}
              required style={inputStyle} />
          )}
          <input type="email" placeholder="อีเมล" value={email} onChange={e => setEmail(e.target.value)}
            required style={inputStyle} />
          {mode !== 'reset' && (
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} placeholder="รหัสผ่าน"
                value={password} onChange={e => setPassword(e.target.value)}
                required minLength={mode === 'signup' ? 8 : undefined}
                style={{ ...inputStyle, paddingRight: 40, width: '100%' }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {error && <div style={{ fontSize: 13, color: 'var(--neg)', padding: '8px 12px',
            background: '#fff5f5', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>{error}</div>}
          {success && <div style={{ fontSize: 13, color: 'var(--pos)', padding: '8px 12px',
            background: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>{success}</div>}

          <button type="submit" disabled={loading}
            style={{ padding: '11px', background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              opacity: loading ? .7 : 1 }}>
            {loading ? 'กำลังดำเนินการ…' : mode === 'login' ? 'เข้าสู่ระบบ' : mode === 'signup' ? 'สมัครสมาชิก' : 'ส่งลิงก์รีเซ็ต'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
          {mode === 'login' && <>
            ยังไม่มีบัญชี? <button onClick={() => switchMode('signup')}
              style={linkStyle}>สมัครสมาชิก</button>
            {' · '}<button onClick={() => switchMode('reset')} style={linkStyle}>ลืมรหัสผ่าน?</button>
          </>}
          {mode === 'signup' && <>
            มีบัญชีแล้ว? <button onClick={() => switchMode('login')} style={linkStyle}>เข้าสู่ระบบ</button>
          </>}
          {mode === 'reset' && <>
            <button onClick={() => switchMode('login')} style={linkStyle}>← กลับไปเข้าสู่ระบบ</button>
          </>}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1.5px solid var(--line)',
  borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none',
  background: 'var(--surface)', color: 'var(--ink)',
};

const linkStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--accent)', fontWeight: 600, fontSize: 13,
};
