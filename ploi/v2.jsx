// ===== V2: Marketplace Dense =====
function V2() {
  const { PRODUCTS, CATS } = window.PLOI_DATA;
  const [wl, setWl] = useState(new Set([2,10]));
  const [sort, setSort] = useState('ล่าสุด');
  const [activeCat, setActiveCat] = useState('ทั้งหมด');
  const [acctOpen, setAcctOpen] = useState(false);
  const toggleWl = id => setWl(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  const toggleDark = () => {
    const cur = document.documentElement.getAttribute('data-theme')||'light';
    const next = cur==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme', next);
    try{ localStorage.setItem('ploi_theme', next); }catch(e){}
  };

  return (
    <div className="v2">
      <header className="v2-header">
        <div className="v2-header-in">
          <a href="#" className="v2-logo" style={{textDecoration:'none'}}><PloiLogo size={18} markSize={30}/></a>
          <div className="v2-search">
            <input placeholder="ค้นหาของมือสอง..."/>
            <div className="cat-split">หมวด: ทั้งหมด ▾</div>
            <button>ค้นหา</button>
          </div>
          <div className="v2-header-r">
            <button className="v2-icon-btn" onClick={()=>window.__openChat && window.__openChat()}>
              <svg className="ic" viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              แชท<span className="dot"></span>
            </button>
            <button className="v2-icon-btn">
              <svg className="ic" viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/></svg>
              ถูกใจ
            </button>
            <button className="v2-icon-btn" onClick={()=>window.__openHub && window.__openHub('buy')}>
              <svg className="ic" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M6 6L5 3H2"/></svg>
              ซื้อ
            </button>
            <button className="v2-icon-btn" onClick={()=>window.__openHub && window.__openHub('sell')}>
              <svg className="ic" viewBox="0 0 24 24"><path d="M3 7h18M6 7v13h12V7M9 11h6"/></svg>
              ขาย
            </button>
            <button className="v2-sell" onClick={()=>window.__openListing && window.__openListing()}>+ ลงขาย</button>

            {/* Account dropdown */}
            <div className="v2-acct">
              <button className="v2-acct-trigger" onClick={()=>setAcctOpen(v=>!v)} aria-label="บัญชี">
                <span className="v2-acct-ava">SP</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" style={{opacity:.7}}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {acctOpen && (<>
                <div className="v2-acct-backdrop" onClick={()=>setAcctOpen(false)}/>
                <div className="v2-acct-menu" role="menu">
                  <div className="v2-acct-head">
                    <div className="v2-acct-ava lg">SP</div>
                    <div className="v2-acct-meta">
                      <div className="v2-acct-name">สมชาย พฤกษา</div>
                      <div className="v2-acct-sub">somchai@gmail.com</div>
                    </div>
                  </div>
                  <div className="v2-acct-sep"/>
                  <button className="v2-acct-item" onClick={()=>{setAcctOpen(false); window.__openAuth && window.__openAuth();}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                    โปรไฟล์ของฉัน
                  </button>
                  <button className="v2-acct-item" onClick={()=>{setAcctOpen(false); window.__openHub && window.__openHub('sell');}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>
                    สินค้าของฉัน
                  </button>
                  <button className="v2-acct-item" onClick={()=>{setAcctOpen(false); window.__openComplaints && window.__openComplaints();}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l10 18H2L12 2z"/><path d="M12 9v5M12 17v.01"/></svg>
                    ร้องเรียนของฉัน
                  </button>
                  <button className="v2-acct-item" onClick={()=>{setAcctOpen(false); window.__openCoins && window.__openCoins();}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M9 9h4a2 2 0 0 1 0 4H9v5M9 9v4"/></svg>
                    เติมเหรียญ & Premium
                    <span className="v2-acct-badge">1,240</span>
                  </button>
                  <button className="v2-acct-item" onClick={()=>{setAcctOpen(false); window.__openAdmin && window.__openAdmin();}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    แอดมิน
                  </button>
                  <div className="v2-acct-sep"/>
                  <button className="v2-acct-item" onClick={toggleDark}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>
                    โหมดกลางคืน
                    <span className="v2-acct-toggle"/>
                  </button>
                  <button className="v2-acct-item danger">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    ออกจากระบบ
                  </button>
                </div>
              </>)}
            </div>
          </div>
        </div>
        <div className="v2-subnav">
          <div className="v2-subnav-in">
            {['สำหรับคุณ','ใกล้ฉัน','ของใหม่','Boost เด่น','ส่งฟรี','ลดราคา','ของสะสม','ดีลพนักงาน','นัดรับ'].map((t,i)=>(
              <a key={t} className={i===0?'on':''}>{t}</a>
            ))}
          </div>
        </div>
      </header>

      <div className="v2-wrap">
        <aside className="v2-side">
          <h4>หมวดหมู่</h4>
          <ul>
            {CATS.map(c=>(
              <li key={c.n}><a className={c.n===activeCat?'on':''} onClick={()=>setActiveCat(c.n)}>{c.n}<span className="n">{c.c.toLocaleString()}</span></a></li>
            ))}
          </ul>
          <h4>ช่วงราคา</h4>
          <div className="range">
            <input placeholder="ต่ำสุด"/>
            <input placeholder="สูงสุด"/>
          </div>
          <h4>สภาพสินค้า</h4>
          <label className="chk"><input type="checkbox" defaultChecked/> ใหม่ในกล่อง</label>
          <label className="chk"><input type="checkbox" defaultChecked/> สภาพ 90%+</label>
          <label className="chk"><input type="checkbox"/> มือสองทั่วไป</label>
          <label className="chk"><input type="checkbox"/> ซ่อมได้ / สำหรับอะไหล่</label>
          <h4>พื้นที่</h4>
          <label className="chk"><input type="radio" name="loc" defaultChecked/> ทุกที่</label>
          <label className="chk"><input type="radio" name="loc"/> รอบตัว 5 กม.</label>
          <label className="chk"><input type="radio" name="loc"/> กรุงเทพฯ-ปริมณฑล</label>
          <label className="chk"><input type="radio" name="loc"/> ส่งทั่วประเทศ</label>
          <h4>วิธีรับสินค้า</h4>
          <label className="chk"><input type="checkbox" defaultChecked/> นัดรับ</label>
          <label className="chk"><input type="checkbox"/> ส่งฟรี</label>
        </aside>

        <main className="v2-main">
          <div className="v2-banner">
            <div className="vb-mark">฿</div>
            <div className="vb-body">
              <h3>ขายของชิ้นแรกได้ใน 48 ชม. — การันตี</h3>
              <p>ถ้าประกาศ 3 ชิ้นแรกไม่ได้รับข้อความภายใน 2 วัน เราจะ Boost ฟรีให้ทั้งหมด</p>
            </div>
            <button className="btn btn-primary" onClick={()=>window.__openListing && window.__openListing()}>ลงขายฟรี</button>
          </div>

          <MoneyRail/>

          <div className="v2-tools" style={{marginTop:18}}>
            <div className="result-n">พบ <b>{PRODUCTS.length.toLocaleString()}</b> รายการ · หมวด: {activeCat}</div>
            <div className="right">
              <select value={sort} onChange={e=>setSort(e.target.value)}>
                <option>ล่าสุด</option>
                <option>ราคาต่ำ-สูง</option>
                <option>ราคาสูง-ต่ำ</option>
                <option>ใกล้ที่สุด</option>
                <option>ยอดเข้าชม</option>
              </select>
              <div className="layout-toggle">
                <button className="on"><svg className="ic" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button>
                <button><svg className="ic" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
              </div>
            </div>
          </div>

          <div className="v2-grid">
            {PRODUCTS.map(p=>(
              <ProductCard key={p.id} p={p} wishlist={wl} onWishlist={toggleWl}/>
            ))}
          </div>
        </main>
      </div>
      <Footer/>
      <BottomNav/>
    </div>
  );
}
window.V2 = V2;
