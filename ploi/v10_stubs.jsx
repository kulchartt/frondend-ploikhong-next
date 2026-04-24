// ===== V10: Stub screens for Complaints (B5), Coins (B6), Admin (B7) =====
// Structural stubs — layout + nav work, content is mock

// ---------- B5: Complaints (two-panel) ----------
const COMPLAINTS_MOCK = [
  {id:1, subj:'สินค้าไม่ตรงปก', buyer:'สมศรี ท.', status:'open', updated:'2 ชม.ที่แล้ว', last:'ส่งรูปสินค้าจริงแล้วค่ะ', unread:true},
  {id:2, subj:'ไม่ได้รับพัสดุ', buyer:'มานพ ก.', status:'pending', updated:'เมื่อวาน', last:'รอคำตอบจากแอดมิน', unread:false},
  {id:3, subj:'ผู้ขายไม่ตอบ', buyer:'จันทรา ส.', status:'resolved', updated:'3 วันที่แล้ว', last:'ตกลงคืนเงิน 50%', unread:false},
  {id:4, subj:'สินค้าปลอม', buyer:'ก้องภพ ว.', status:'open', updated:'5 ชม.ที่แล้ว', last:'ขอใบเสร็จจากผู้ขาย', unread:true},
];

function V10Complaints({ onClose }) {
  const [active, setActive] = useState(COMPLAINTS_MOCK[0]);
  const [tab, setTab] = useState('all');
  const filtered = COMPLAINTS_MOCK.filter(c => tab==='all' || c.status===tab);

  return (
    <div className="st-overlay">
      <div className="st-top">
        <button className="st-back" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          <span>ปิด</span>
        </button>
        <h1 className="st-title">ร้องเรียนของฉัน</h1>
        <button className="st-primary">+ แจ้งเรื่องใหม่</button>
      </div>
      <div className="cp">
        {/* Left: list */}
        <aside className="cp-list">
          <div className="cp-tabs">
            {[['all','ทั้งหมด',COMPLAINTS_MOCK.length],['open','กำลังดำเนินการ',2],['pending','รอตรวจ',1],['resolved','ปิดแล้ว',1]].map(([k,l,n])=>(
              <button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>{l}<span className="n">{n}</span></button>
            ))}
          </div>
          <div className="cp-items">
            {filtered.map(c=>(
              <button key={c.id} className={'cp-item'+(active.id===c.id?' on':'')} onClick={()=>setActive(c)}>
                <div className="cp-item-head">
                  <span className="cp-item-subj">{c.subj}</span>
                  {c.unread && <span className="cp-dot"/>}
                </div>
                <div className="cp-item-meta">
                  <span>{c.buyer}</span>
                  <span className={'cp-badge '+c.status}>{({open:'กำลังดำเนินการ',pending:'รอตรวจ',resolved:'ปิดแล้ว'})[c.status]}</span>
                </div>
                <div className="cp-item-last">{c.last}</div>
                <div className="cp-item-time">{c.updated}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right: detail */}
        <main className="cp-detail">
          <div className="cp-detail-top">
            <div>
              <h2>{active.subj}</h2>
              <p className="cp-detail-meta">
                <span className={'cp-badge '+active.status}>{({open:'กำลังดำเนินการ',pending:'รอตรวจ',resolved:'ปิดแล้ว'})[active.status]}</span>
                <span>เคสที่ #{String(active.id).padStart(6,'0')}</span>
                <span>เปิดเมื่อ {active.updated}</span>
              </p>
            </div>
            <div className="cp-detail-actions">
              <button className="btn-ghost">แชร์ให้แอดมิน</button>
              <button className="btn-primary">ปิดเคส</button>
            </div>
          </div>

          <section className="cp-section">
            <h3>ข้อมูลเคส</h3>
            <div className="cp-grid">
              <div><label>สินค้า</label><div>iPhone 13 Pro 256GB</div></div>
              <div><label>ผู้ขาย</label><div>บอส ม. · ความเชื่อถือ 4.8</div></div>
              <div><label>มูลค่า</label><div>฿18,500</div></div>
              <div><label>ช่องทาง</label><div>ส่งฟรี — Kerry</div></div>
            </div>
          </section>

          <section className="cp-section">
            <h3>ไทม์ไลน์</h3>
            <ol className="cp-timeline">
              <li><b>วันนี้ 14:22</b><p>คุณอัพโหลดรูปสินค้าจริง 3 รูป</p></li>
              <li><b>เมื่อวาน 18:00</b><p>แอดมินขอเอกสารเพิ่ม</p></li>
              <li><b>2 วันก่อน 09:15</b><p>เปิดเคสร้องเรียน</p></li>
            </ol>
          </section>

          <section className="cp-section">
            <h3>ข้อความกับแอดมิน</h3>
            <div className="cp-msgs">
              <div className="cp-msg"><div className="cp-msg-who">แอดมิน · 2 ชม.ก่อน</div><p>ขอบคุณสำหรับรูปนะครับ กำลังประสานผู้ขายให้</p></div>
              <div className="cp-msg me"><div className="cp-msg-who">คุณ · 3 ชม.ก่อน</div><p>แนบรูปสินค้ามาแล้วค่ะ ขอให้ช่วยประสานด้วย</p></div>
            </div>
            <div className="cp-compose">
              <input placeholder="พิมพ์ข้อความ..."/>
              <button className="btn-primary">ส่ง</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
window.V10Complaints = V10Complaints;

// ---------- B6: Coins Shop + Premium ----------
function V10Coins({ onClose }) {
  const [tab, setTab] = useState('topup');
  const packs = [
    {coins:100, price:29, bonus:0, pop:false},
    {coins:300, price:79, bonus:20, pop:false},
    {coins:600, price:149, bonus:60, pop:true},
    {coins:1200, price:279, bonus:180, pop:false},
    {coins:3000, price:649, bonus:600, pop:false},
    {coins:6000, price:1190, bonus:1500, pop:false},
  ];
  const perks = [
    {ic:'✨', t:'Boost อัตโนมัติทุก 7 วัน', s:'ประกาศของคุณถูกดันขึ้นบนสุดอัตโนมัติ'},
    {ic:'⭐', t:'ป้าย Premium', s:'ได้ป้ายสีทองใต้ชื่อ ผู้ซื้อมั่นใจกว่าเดิม'},
    {ic:'🔎', t:'Insight แบบละเอียด', s:'ดูข้อมูลผู้เข้าชม ช่วงเวลาที่คนสนใจ'},
    {ic:'⚡', t:'ตอบอัตโนมัติ', s:'ตั้งข้อความตอบกลับเร็วใน 1 วินาที'},
    {ic:'🛡️', t:'ประกันผู้ขาย', s:'คืนเงิน Boost ถ้าไม่มีข้อความใน 48 ชม.'},
    {ic:'📊', t:'รายงานรายเดือน', s:'สรุปยอดขาย + คำแนะนำจาก AI'},
  ];

  return (
    <div className="st-overlay">
      <div className="st-top">
        <button className="st-back" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          <span>ปิด</span>
        </button>
        <h1 className="st-title">เหรียญ & Premium</h1>
        <div className="co-balance">
          <span className="co-ic">◎</span>
          <b>1,240</b> เหรียญ
        </div>
      </div>

      <div className="co-tabs">
        <button className={tab==='topup'?'on':''} onClick={()=>setTab('topup')}>เติมเหรียญ</button>
        <button className={tab==='premium'?'on':''} onClick={()=>setTab('premium')}>Premium สมาชิก</button>
        <button className={tab==='history'?'on':''} onClick={()=>setTab('history')}>ประวัติการใช้</button>
      </div>

      <div className="co-body">
        {tab==='topup' && (
          <>
            <div className="co-hero">
              <h2>ใช้เหรียญเพื่อ <b>Boost</b> ประกาศหรือรับป้าย Featured</h2>
              <p>1 Boost = 30 เหรียญ · Featured 7 วัน = 80 เหรียญ</p>
            </div>
            <div className="co-grid">
              {packs.map(p=>(
                <div key={p.coins} className={'co-card'+(p.pop?' pop':'')}>
                  {p.pop && <span className="co-tag">ฮิตสุด</span>}
                  <div className="co-coins">◎ {p.coins.toLocaleString()}</div>
                  {p.bonus>0 && <div className="co-bonus">+{p.bonus} โบนัส</div>}
                  <div className="co-price">฿{p.price.toLocaleString()}</div>
                  <button className="btn-primary">ซื้อ</button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==='premium' && (
          <>
            <div className="co-prem-hero">
              <div>
                <h2>ปลิวคงเป็น Premium</h2>
                <p>ขายของได้เร็วขึ้น 3 เท่า · ได้ป้ายผู้ขายน่าเชื่อถือ · Boost ฟรีทุกสัปดาห์</p>
                <div className="co-price-row">
                  <div><b>฿129</b><span>/เดือน</span></div>
                  <div><b>฿1,290</b><span>/ปี</span><em>ประหยัด 17%</em></div>
                </div>
                <button className="btn-primary lg">เริ่มใช้ Premium ฟรี 7 วัน</button>
              </div>
              <div className="co-prem-badge">⭐ PREMIUM</div>
            </div>
            <div className="co-perks">
              {perks.map(p=>(
                <div key={p.t} className="co-perk">
                  <div className="co-perk-ic">{p.ic}</div>
                  <div>
                    <h4>{p.t}</h4>
                    <p>{p.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==='history' && (
          <div className="co-hist">
            {[
              {t:'ซื้อเหรียญ', d:'วันนี้', n:'+600 ◎', sub:'แพ็ค 600', amt:'฿149'},
              {t:'Boost ประกาศ', d:'เมื่อวาน', n:'-30 ◎', sub:'iPhone 13 Pro'},
              {t:'Featured 7 วัน', d:'3 วันก่อน', n:'-80 ◎', sub:'Macbook Air M1'},
              {t:'ซื้อเหรียญ', d:'1 สัปดาห์ก่อน', n:'+300 ◎', sub:'แพ็ค 300', amt:'฿79'},
            ].map((h,i)=>(
              <div key={i} className="co-hist-row">
                <div>
                  <div className="co-hist-t">{h.t}</div>
                  <div className="co-hist-s">{h.sub} · {h.d}</div>
                </div>
                <div className="co-hist-r">
                  <div className="co-hist-n">{h.n}</div>
                  {h.amt && <div className="co-hist-a">{h.amt}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
window.V10Coins = V10Coins;

// ---------- B7: Admin Dashboard 6 tabs ----------
function V10Admin({ onClose }) {
  const [tab, setTab] = useState('overview');
  const tabs = [
    ['overview','ภาพรวม','📊'],
    ['users','ผู้ใช้','👥'],
    ['listings','ประกาศ','📦'],
    ['reports','รายงานถูกแจ้ง','🚩'],
    ['complaints','เคสร้องเรียน','⚠️'],
    ['finance','การเงิน','💰'],
  ];

  return (
    <div className="st-overlay">
      <div className="ad">
        <aside className="ad-side">
          <div className="ad-brand">
            <PloiLogo size={16} markSize={26}/>
            <span className="ad-brand-sub">ADMIN</span>
          </div>
          <nav className="ad-nav">
            {tabs.map(([k,l,ic])=>(
              <button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>
                <span className="ad-ic">{ic}</span>{l}
              </button>
            ))}
          </nav>
          <button className="ad-close" onClick={onClose}>← กลับหน้าแรก</button>
        </aside>

        <main className="ad-main">
          <div className="ad-top">
            <h1>{tabs.find(t=>t[0]===tab)[1]}</h1>
            <div className="ad-top-r">
              <div className="ad-search">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                <input placeholder="ค้นหา..."/>
              </div>
              <button className="btn-ghost">ส่งออก CSV</button>
            </div>
          </div>

          {tab==='overview' && <AdminOverview/>}
          {tab==='users' && <AdminTable kind="users"/>}
          {tab==='listings' && <AdminTable kind="listings"/>}
          {tab==='reports' && <AdminTable kind="reports"/>}
          {tab==='complaints' && <AdminTable kind="complaints"/>}
          {tab==='finance' && <AdminFinance/>}
        </main>
      </div>
    </div>
  );
}
window.V10Admin = V10Admin;

function AdminOverview() {
  const kpis = [
    {l:'ผู้ใช้ทั้งหมด', v:'48,231', d:'+2.3% สัปดาห์นี้', pos:true},
    {l:'ประกาศขายอยู่', v:'12,874', d:'+840 วันนี้', pos:true},
    {l:'ธุรกรรม 30 วัน', v:'฿8.2M', d:'+12%', pos:true},
    {l:'เคสเปิดอยู่', v:'37', d:'-8 วันนี้', pos:true},
    {l:'Boost 7 วัน', v:'2,104', d:'+18%', pos:true},
    {l:'อัตราปิดเคส', v:'94%', d:'เป้า 92%', pos:true},
  ];
  return (
    <>
      <div className="ad-kpis">
        {kpis.map(k=>(
          <div key={k.l} className="ad-kpi">
            <div className="ad-kpi-l">{k.l}</div>
            <div className="ad-kpi-v">{k.v}</div>
            <div className={'ad-kpi-d '+(k.pos?'pos':'neg')}>{k.d}</div>
          </div>
        ))}
      </div>
      <div className="ad-row-2">
        <div className="ad-card">
          <h3>กิจกรรมล่าสุด</h3>
          <ul className="ad-feed">
            <li><b>มานพ ก.</b> รายงานประกาศ <i>#2418 iPhone ปลอม</i><span>2 นาทีก่อน</span></li>
            <li><b>ร้าน G-Shop</b> เปิด boost 3 ประกาศ<span>5 นาทีก่อน</span></li>
            <li><b>แอดมินเอก</b> ปิดเคส #00184<span>10 นาทีก่อน</span></li>
            <li><b>สมศรี ท.</b> สมัครสมาชิกใหม่<span>15 นาทีก่อน</span></li>
            <li><b>ระบบ</b> ตรวจพบคำต้องห้ามใน 3 ประกาศ<span>28 นาทีก่อน</span></li>
          </ul>
        </div>
        <div className="ad-card">
          <h3>รายได้ 14 วัน</h3>
          <div className="ad-chart">
            {[42,56,48,62,80,72,90,85,72,96,110,98,115,128].map((v,i)=>(
              <span key={i} className="ad-bar" style={{height:`${v*.7}%`}}/>
            ))}
          </div>
          <div className="ad-chart-lbl"><span>2 สัปดาห์ก่อน</span><span>วันนี้</span></div>
        </div>
      </div>
    </>
  );
}

function AdminTable({ kind }) {
  const DATA = {
    users: {
      cols: ['ผู้ใช้','อีเมล','สมัครเมื่อ','สถานะ','ประกาศ','การเงิน'],
      rows: [
        ['บอส ม.','boss@mail.com','มี.ค. 2024','ใช้งานอยู่','24','฿18,400'],
        ['สมศรี ท.','somsri@mail.com','ม.ค. 2024','ใช้งานอยู่','8','฿3,200'],
        ['G-Shop','gshop@mail.com','ก.พ. 2024','Premium','142','฿89,300'],
        ['มานพ ก.','manop@mail.com','พ.ค. 2024','รอยืนยัน','0','฿0'],
        ['จันทรา ส.','jan@mail.com','เม.ย. 2024','ถูกระงับ','3','฿1,800'],
      ],
    },
    listings: {
      cols: ['ประกาศ','ผู้ขาย','ราคา','หมวด','สถานะ','วันที่'],
      rows: [
        ['iPhone 13 Pro 256GB','บอส ม.','฿18,500','มือถือ','Active','วันนี้'],
        ['Macbook Air M1','G-Shop','฿25,900','คอม','Active','เมื่อวาน'],
        ['กระเป๋า LV เก่า','สมศรี ท.','฿12,000','แฟชั่น','รอตรวจ','2 ชม.'],
        ['iPhone 11','มานพ ก.','฿8,500','มือถือ','ถูกแจ้ง','3 วัน'],
      ],
    },
    reports: {
      cols: ['เรื่อง','ประกาศ','ผู้แจ้ง','เหตุผล','สถานะ','วันที่'],
      rows: [
        ['#R-0245','iPhone 11','มานพ ก.','สงสัยของปลอม','กำลังตรวจ','1 ชม.'],
        ['#R-0244','Dior Saddle','จันทรา ส.','รูปไม่ตรงปก','ใหม่','3 ชม.'],
        ['#R-0243','AirPods Pro','สมศรี ท.','ราคาต่ำผิดปกติ','ปิดแล้ว','เมื่อวาน'],
      ],
    },
    complaints: {
      cols: ['เคส','ผู้ร้องเรียน','สินค้า','มูลค่า','สถานะ','อัพเดต'],
      rows: [
        ['#C-00188','สมศรี ท.','iPhone 13 Pro','฿18,500','กำลังดำเนินการ','2 ชม.'],
        ['#C-00187','มานพ ก.','Macbook','฿25,900','รอเอกสาร','เมื่อวาน'],
        ['#C-00185','จันทรา ส.','กระเป๋า LV','฿12,000','ปิดแล้ว','3 วันก่อน'],
      ],
    },
  };
  const d = DATA[kind] || DATA.users;
  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead>
          <tr>{d.cols.map(c=><th key={c}>{c}</th>)}<th/></tr>
        </thead>
        <tbody>
          {d.rows.map((r,i)=>(
            <tr key={i}>
              {r.map((cell,j)=><td key={j}>{cell}</td>)}
              <td><button className="btn-ghost sm">ดู</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminFinance() {
  return (
    <>
      <div className="ad-kpis">
        <div className="ad-kpi"><div className="ad-kpi-l">รายได้รวม เดือนนี้</div><div className="ad-kpi-v">฿284,500</div><div className="ad-kpi-d pos">+18% m/m</div></div>
        <div className="ad-kpi"><div className="ad-kpi-l">Boost + Featured</div><div className="ad-kpi-v">฿142,300</div><div className="ad-kpi-d pos">50% ของรายได้</div></div>
        <div className="ad-kpi"><div className="ad-kpi-l">Premium</div><div className="ad-kpi-v">฿92,700</div><div className="ad-kpi-d pos">723 คน</div></div>
        <div className="ad-kpi"><div className="ad-kpi-l">ค่าคอมมิชชั่น</div><div className="ad-kpi-v">฿49,500</div><div className="ad-kpi-d pos">อัตรา 2%</div></div>
      </div>
      <div className="ad-card">
        <h3>รายการธุรกรรม</h3>
        <table className="ad-table">
          <thead><tr><th>เลขที่</th><th>ผู้ใช้</th><th>ประเภท</th><th>จำนวน</th><th>วิธีจ่าย</th><th>สถานะ</th></tr></thead>
          <tbody>
            {[
              ['TXN-9001','บอส ม.','Boost pack','฿149','บัตร','สำเร็จ'],
              ['TXN-9000','G-Shop','Premium ปี','฿1,290','PromptPay','สำเร็จ'],
              ['TXN-8999','สมศรี ท.','Boost pack','฿29','TrueMoney','สำเร็จ'],
              ['TXN-8998','จันทรา ส.','Featured','฿80','บัตร','คืนเงิน'],
            ].map((r,i)=>(
              <tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
