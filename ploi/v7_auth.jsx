// ===== Login / Signup / Reset password (one modal, three modes) =====
function V7Auth({ onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  function submit(e){
    e.preventDefault();
    setErr(''); setMsg(''); setBusy(true);
    setTimeout(()=>{
      setBusy(false);
      if(mode==='login'){
        if(!email || !pw){ setErr('กรอกอีเมลและรหัสผ่านให้ครบ'); return; }
        setMsg('เข้าสู่ระบบสำเร็จ — ยินดีต้อนรับกลับ');
        setTimeout(onClose, 800);
      } else if(mode==='signup'){
        if(!email || !pw || !name){ setErr('กรอกข้อมูลให้ครบ'); return; }
        if(pw.length < 8){ setErr('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
        setMsg('สมัครสมาชิกสำเร็จ — กำลังเข้าสู่ระบบ');
        setTimeout(onClose, 800);
      } else {
        if(!email){ setErr('กรอกอีเมลที่ใช้สมัคร'); return; }
        setMsg(`ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${email} แล้ว — ตรวจสอบกล่องอีเมลภายใน 5 นาที`);
      }
    }, 700);
  }

  function social(provider){
    setBusy(true); setErr(''); setMsg(`กำลังเชื่อมต่อกับ ${provider}...`);
    setTimeout(()=>{
      setBusy(false);
      setMsg(`เข้าสู่ระบบด้วย ${provider} สำเร็จ`);
      setTimeout(onClose, 700);
    }, 900);
  }

  const titles = {
    login:  { h: 'ยินดีต้อนรับกลับ', s: 'เข้าสู่ระบบเพื่อซื้อ-ขายในตลาด' },
    signup: { h: 'สร้างบัญชีใหม่',   s: 'สมัครฟรี ใช้งานได้ทันที' },
    reset:  { h: 'ลืมรหัสผ่าน',       s: 'กรอกอีเมล เราจะส่งลิงก์รีเซ็ตให้' },
  };

  return (
    <div className="pdp-overlay auth-overlay" onClick={onClose}>
      <div className="auth" onClick={e=>e.stopPropagation()}>
        <button className="pdp-close" onClick={onClose} aria-label="ปิด">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        <div className="auth-logo"><PloiLogo size={18} markSize={32}/></div>

        <h2 className="auth-h">{titles[mode].h}</h2>
        <p className="auth-s">{titles[mode].s}</p>

        {mode !== 'reset' && (
          <>
            <div className="auth-social">
              <button className="auth-soc facebook" onClick={()=>social('Facebook')} disabled={busy}>
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#1877f2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.8-4.67 4.53-4.67 1.32 0 2.7.24 2.7.24v2.97h-1.52c-1.5 0-1.96.93-1.96 1.88V12h3.34l-.53 3.47h-2.81v8.38A12 12 0 0 0 24 12"/></svg>
                <span>Facebook</span>
              </button>
              <button className="auth-soc google" onClick={()=>social('Google')} disabled={busy}>
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.7 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#fbbc04" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.87z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                <span>Google</span>
              </button>
              <button className="auth-soc apple" onClick={()=>social('Apple')} disabled={busy}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <span>Apple</span>
              </button>
              <button className="auth-soc line" onClick={()=>social('LINE')} disabled={busy}>
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#06c755" d="M19.67 11.2c0-4.4-4.4-7.97-9.83-7.97-5.42 0-9.83 3.58-9.83 7.97 0 3.94 3.5 7.25 8.22 7.87.32.07.76.21.87.49.1.25.07.64.03.89l-.14.84c-.04.25-.2.98.86.53 1.05-.44 5.68-3.34 7.76-5.73 1.43-1.57 2.12-3.16 2.12-4.9h-.06z"/><path fill="#fff" d="M17.03 9.06h-.69a.19.19 0 0 0-.19.19v4.28c0 .1.08.19.19.19h.69c.1 0 .19-.08.19-.19V9.25a.19.19 0 0 0-.19-.19zm4.75 0h-.69a.19.19 0 0 0-.19.19v2.54l-1.96-2.65-.02-.02-.01-.01-.01-.01-.01-.01h-.75a.19.19 0 0 0-.19.19v4.28c0 .1.08.19.19.19h.69c.1 0 .19-.08.19-.19v-2.54l1.96 2.65c.01.02.03.04.05.05l.01.01h.74c.1 0 .19-.08.19-.19V9.25a.19.19 0 0 0-.19-.19zm-6.42 3.58h-1.87v-3.4a.19.19 0 0 0-.19-.19h-.69a.19.19 0 0 0-.19.19v4.28c0 .05.02.1.05.13.04.03.08.05.13.05h2.76c.1 0 .19-.08.19-.19v-.69a.19.19 0 0 0-.19-.19zm7.67-2.51c.1 0 .19-.08.19-.19v-.69a.19.19 0 0 0-.19-.19h-2.76a.19.19 0 0 0-.13.05.19.19 0 0 0-.05.13v4.28c0 .05.02.1.05.13.04.03.08.05.13.05h2.76c.1 0 .19-.08.19-.19v-.69a.19.19 0 0 0-.19-.19h-1.87v-.72h1.87c.1 0 .19-.08.19-.19v-.69a.19.19 0 0 0-.19-.19h-1.87v-.72h1.87z" transform="translate(-7)"/></svg>
                <span>LINE</span>
              </button>
            </div>

            <div className="auth-or"><span>หรือ</span></div>
          </>
        )}

        <form className="auth-form" onSubmit={submit}>
          {mode==='signup' && (
            <div className="lst-field">
              <label>ชื่อที่จะแสดง</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น สมชาย ข." autoFocus/>
            </div>
          )}
          <div className="lst-field">
            <label>อีเมล</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoFocus={mode!=='signup'}/>
          </div>

          {mode !== 'reset' && (
            <div className="lst-field">
              <label>
                รหัสผ่าน
                {mode==='login' && (
                  <button type="button" className="auth-linklite" onClick={()=>{setMode('reset');setErr('');setMsg('');}}>ลืมรหัสผ่าน?</button>
                )}
              </label>
              <div className="auth-pw">
                <input type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder={mode==='signup'?'อย่างน้อย 8 ตัวอักษร':'••••••••'}/>
                <button type="button" className="auth-eye" onClick={()=>setShowPw(!showPw)} aria-label="show password">
                  {showPw ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18M10.5 10.7a2 2 0 0 0 2.8 2.8M9.4 5.6A10 10 0 0 1 22 12a13.5 13.5 0 0 1-1.6 2.8M6.6 6.6A13.5 13.5 0 0 0 2 12c1.7 3.7 5.4 7 10 7 1.5 0 2.9-.3 4.2-.9"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {err && <div className="lst-err">{err}</div>}
          {msg && <div className="auth-msg">{msg}</div>}

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={busy}>
            {busy ? 'กำลังดำเนินการ…' : (
              mode==='login' ? 'เข้าสู่ระบบ' :
              mode==='signup' ? 'สมัครสมาชิก' :
              'ส่งลิงก์รีเซ็ต'
            )}
          </button>

          {mode==='signup' && (
            <p className="auth-terms">
              การสมัครถือว่ายอมรับ <a>เงื่อนไขการใช้งาน</a> และ <a>นโยบายความเป็นส่วนตัว</a>
            </p>
          )}
        </form>

        <div className="auth-switch">
          {mode==='login' && (
            <span>ยังไม่มีบัญชี? <button type="button" onClick={()=>{setMode('signup');setErr('');setMsg('');}}>สมัครสมาชิก</button></span>
          )}
          {mode==='signup' && (
            <span>มีบัญชีอยู่แล้ว? <button type="button" onClick={()=>{setMode('login');setErr('');setMsg('');}}>เข้าสู่ระบบ</button></span>
          )}
          {mode==='reset' && (
            <span><button type="button" onClick={()=>{setMode('login');setErr('');setMsg('');}}>← กลับไปเข้าสู่ระบบ</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
window.V7Auth = V7Auth;
