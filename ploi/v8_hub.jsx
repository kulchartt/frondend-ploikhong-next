// ===== V8 Hub: Seller "ขาย" + Buyer "ซื้อ" (FB Marketplace-style) =====
const MY_LISTINGS = [
  { id:101, title:'ขายเกม PS5 Sand Land', price:1730, was:1930, cat:'เกม', status:'active',   flag:'needs-tag',   posted:'31/12/2025', views:210, chats:10, saves:14, img:4,  stock:1, boost:false, tint:['#e4d8e8','#8a6ea1'] },
  { id:102, title:'PS4 Fat 500GB พร้อมจอย 2 อัน',           price:5000,  was:null, cat:'เกม', status:'draft',    flag:null,          posted:'30/12/2025', views:0,   chats:0,  saves:0,  img:11, stock:1, boost:false, tint:['#d8e2ec','#5b7893'] },
  { id:103, title:'ขายเกม PS5 Spider-Man 2',                  price:800,   was:2290, cat:'เกม', status:'sold-out', flag:null,          posted:'25/12/2025', views:320, chats:24, saves:38, img:3,  stock:0, boost:true,  tint:['#ece0dc','#a07d77'] },
  { id:104, title:'MacBook Neo 8/256GB มือ 1 ยังไม่แกะซีล',    price:18990, was:null, cat:'คอม', status:'active',   flag:null,          posted:'20/12/2025', views:880, chats:42, saves:96, img:10, stock:2, boost:true,  tint:['#d9e4df','#6d8a81'] },
  { id:105, title:'เคลียร์สต๊อกเกม PS5 มือ 1 ลดราคาพิเศษ',   price:1000,  was:null, cat:'เกม', status:'active',   flag:'price-low',   posted:'16/12/2025', views:440, chats:18, saves:22, img:5,  stock:12, boost:false, tint:['#e9d7c0','#b5927a'] },
  { id:106, title:'จักรยาน Trek FX 3 Disc Size M ใช้ครั้งเดียว', price:18500, was:24900, cat:'กีฬา', status:'active', flag:null, posted:'10/12/2025', views:512, chats:9, saves:31, img:9, stock:1, boost:false, tint:['#d8ddd4','#6f8170'] },
  { id:107, title:'Herman Miller Aeron Size B ของแท้',        price:38500, was:null, cat:'เฟอร์นิเจอร์', status:'hidden', flag:null, posted:'05/12/2025', views:128, chats:3, saves:18, img:2, stock:1, boost:false, tint:['#dce6d1','#708c7e'] },
];

const BUY_ACTIVITY = [
  { kind:'viewed',    productIdx:0,  when:'5 นาทีที่แล้ว'  },
  { kind:'messaged',  productIdx:3,  when:'1 ชม.ที่แล้ว',  detail:'คุณ: ยังมีอยู่ไหมครับ?' },
  { kind:'saved',     productIdx:9,  when:'3 ชม.ที่แล้ว'  },
  { kind:'offered',   productIdx:5,  when:'วานนี้',       detail:'เสนอซื้อ ฿17,500' },
  { kind:'viewed',    productIdx:8,  when:'2 วันที่แล้ว'   },
  { kind:'messaged',  productIdx:2,  when:'3 วันที่แล้ว',  detail:'ผู้ขาย: สนใจเพิ่มเติมไหมครับ?' },
];

const SAVED_IDS = [1, 9, 3, 5, 8, 11];

const NOTIFICATIONS = [
  { kind:'price-drop', productIdx:8, when:'10 นาที', text:'ราคาลดลงจาก ฿24,900 → ฿18,500 — ของที่คุณบันทึกไว้', unread:true },
  { kind:'reply',      productIdx:3, when:'1 ชม.',    text:'GameLoop ตอบข้อความของคุณแล้ว',                     unread:true },
  { kind:'new-listing',productIdx:0, when:'2 ชม.',    text:'TechBKK ที่คุณติดตามลงสินค้าใหม่',                  unread:true },
  { kind:'offer',      productIdx:5, when:'วานนี้',   text:'ผู้ขายตอบข้อเสนอของคุณ: ต่อรองเป็น ฿18,200',          unread:false },
  { kind:'similar',    productIdx:2, when:'วานนี้',   text:'พบสินค้าคล้ายของที่คุณดู 4 รายการใหม่',              unread:false },
  { kind:'review',     productIdx:6, when:'3 วัน',    text:'SomchaiC ส่งมอบของเรียบร้อย — รีวิวได้แล้ว',          unread:false },
];

const FOLLOWING = [
  { id:'s1', name:'TechBKK',       ava:'TB', rating:4.9, reviews:482, items:34, lastPost:'2 ชม.', newBadge:2 },
  { id:'s2', name:'BrickHouse',    ava:'BH', rating:4.8, reviews:156, items:89, lastPost:'วานนี้', newBadge:0 },
  { id:'s3', name:'GameLoop',      ava:'GL', rating:4.7, reviews:234, items:12, lastPost:'3 วัน',  newBadge:0 },
  { id:'s4', name:'HomeOffice.th', ava:'HO', rating:4.95,reviews:89,  items:22, lastPost:'1 ชม.',  newBadge:1 },
  { id:'s5', name:'KickSpot',      ava:'KS', rating:4.6, reviews:512, items:67, lastPost:'30 น.',  newBadge:3 },
];

// ----- SELLER NAV -----
const SELL_NAV = [
  { k:'listings',   label:'รายการสินค้าของคุณ', icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>) },
  { k:'insights',   label:'ข้อมูลเชิงลึก',      icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>) },
  { k:'news',       label:'ข่าวประกาศ',         icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 11v3l14 4V7z"/><path d="M17 7v11"/></svg>) },
  { k:'profile',    label:'โปรไฟล์ Marketplace',icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>) },
];

// ----- BUYER NAV -----
const BUY_NAV = [
  { k:'activity',      label:'กิจกรรมล่าสุด',    icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>) },
  { k:'saved',         label:'บันทึกแล้ว',        icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4h12v16l-6-4-6 4z"/></svg>) },
  { k:'notifications', label:'การแจ้งเตือน',      icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>) },
  { k:'following',     label:'กำลังติดตาม',       icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 5v6M14 8h6"/></svg>) },
  { k:'profile',       label:'โปรไฟล์ Marketplace',icon:(<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>) },
];

// =================== MAIN COMPONENT ===================
function V8Hub({ onClose, initialMode='sell' }) {
  const [mode, setMode] = useState(initialMode); // 'sell' | 'buy'
  const [sellTab, setSellTab] = useState('listings');
  const [buyTab, setBuyTab] = useState('activity');

  const nav = mode==='sell' ? SELL_NAV : BUY_NAV;
  const activeTab = mode==='sell' ? sellTab : buyTab;
  const setTab = mode==='sell' ? setSellTab : setBuyTab;

  return (
    <div className="hub-overlay" onClick={onClose}>
      <div className="hub" onClick={e=>e.stopPropagation()}>
        {/* Top: mode switch + close */}
        <aside className="hub-side">
          <div className="hub-side-top">
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{flex:1,fontFamily:'var(--font-disp)',fontSize:15,fontWeight:700,letterSpacing:'-.01em'}}>บัญชีของฉัน</div>
              <button className="hub-back" onClick={onClose} aria-label="Close" style={{padding:6,marginLeft:0}}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
              </button>
            </div>
            <div className="hub-mode-switch">
              <button className={mode==='sell'?'on':''} onClick={()=>setMode('sell')}>ขาย</button>
              <button className={mode==='buy'?'on':''} onClick={()=>setMode('buy')}>ซื้อ</button>
            </div>
          </div>

          {mode==='sell' && (
            <button className="hub-create" onClick={()=>{ onClose(); setTimeout(()=>window.__openListing && window.__openListing(), 60); }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>
              สร้างรายการสินค้าใหม่
            </button>
          )}

          <nav className="hub-nav">
            {nav.map(it => (
              <button key={it.k} className={'hub-nav-item'+(activeTab===it.k?' on':'')} onClick={()=>setTab(it.k)}>
                <span className="hub-nav-ic">{it.icon}</span>
                <span className="hub-nav-l">{it.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="hub-main">
          {mode==='sell' && sellTab==='listings'  && <SellListings/>}
          {mode==='sell' && sellTab==='insights'  && <SellInsights/>}
          {mode==='sell' && sellTab==='news'      && <SellNews/>}
          {mode==='sell' && sellTab==='profile'   && <HubProfile mode="sell"/>}

          {mode==='buy'  && buyTab==='activity'      && <BuyActivity/>}
          {mode==='buy'  && buyTab==='saved'         && <BuySaved/>}
          {mode==='buy'  && buyTab==='notifications' && <BuyNotifications/>}
          {mode==='buy'  && buyTab==='following'     && <BuyFollowing/>}
          {mode==='buy'  && buyTab==='profile'       && <HubProfile mode="buy"/>}
        </main>
      </div>
    </div>
  );
}

// =================== SELLER: LISTINGS ===================
function SellListings() {
  const [view, setView] = useState('list'); // 'list' | 'grid'
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  const summary = {
    active: MY_LISTINGS.filter(l=>l.status==='active').length,
    sold:   MY_LISTINGS.filter(l=>l.status==='sold-out').length,
    draft:  MY_LISTINGS.filter(l=>l.status==='draft').length,
    hidden: MY_LISTINGS.filter(l=>l.status==='hidden').length,
  };

  const filtered = MY_LISTINGS.filter(l => {
    if(filter!=='all' && l.status!==filter) return false;
    if(q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="hub-page">
      {/* Info banner */}
      <div className="hub-banner">
        <div className="hub-banner-ic">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>
        </div>
        <div className="hub-banner-body">
          <h4>อัพเดตรายการสินค้าของคุณอยู่เสมอ</h4>
          <p>การทำเครื่องหมายสินค้าว่าขายแล้วจะช่วยเพิ่มความน่าเชื่อถือและยืนยันความโปร่งใสแก่ผู้ซื้อเป้าหมาย</p>
          <button className="hub-banner-cta">เรียนรู้เพิ่มเติม</button>
        </div>
        <button className="hub-banner-close" aria-label="ปิด">×</button>
      </div>

      {/* Header row */}
      <div className="hub-h-row">
        <h1 className="hub-h1">รายการสินค้าของคุณ</h1>
        <div className="hub-search">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="ค้นหารายการสินค้าของคุณ"/>
        </div>
        <div className="hub-viewtog">
          <button className={view==='list'?'on':''} onClick={()=>setView('list')} aria-label="list">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <button className={view==='grid'?'on':''} onClick={()=>setView('grid')} aria-label="grid">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>
      </div>

      {/* Status chips */}
      <div className="hub-chips">
        <button className={filter==='all'?'on':''}      onClick={()=>setFilter('all')}>ทั้งหมด <span>{MY_LISTINGS.length}</span></button>
        <button className={filter==='active'?'on':''}   onClick={()=>setFilter('active')}>กำลังขาย <span>{summary.active}</span></button>
        <button className={filter==='sold-out'?'on':''} onClick={()=>setFilter('sold-out')}>ขายแล้ว <span>{summary.sold}</span></button>
        <button className={filter==='draft'?'on':''}    onClick={()=>setFilter('draft')}>ฉบับร่าง <span>{summary.draft}</span></button>
        <button className={filter==='hidden'?'on':''}   onClick={()=>setFilter('hidden')}>ซ่อนอยู่ <span>{summary.hidden}</span></button>
      </div>

      {/* Listings */}
      {view==='list' ? (
        <div className="hub-list">
          {filtered.map(l => <ListingRow key={l.id} l={l}/>)}
          {filtered.length===0 && <EmptyState msg="ไม่มีรายการสินค้าในหมวดนี้"/>}
        </div>
      ) : (
        <div className="hub-list hub-list-grid">
          {filtered.map(l => <ListingGridCard key={l.id} l={l}/>)}
        </div>
      )}
    </div>
  );
}

function StatusDot({ s }) {
  const cfg = {
    'active':   { c:'var(--pos)',  t:'กำลังขาย' },
    'sold-out': { c:'var(--ink-3)',t:'ขายแล้ว' },
    'draft':    { c:'#c9a24a',     t:'ฉบับร่าง' },
    'hidden':   { c:'var(--ink-3)',t:'ซ่อนอยู่' },
  }[s] || { c:'var(--ink-3)', t:s };
  return <span className="st-dot"><i style={{background:cfg.c}}/>{cfg.t}</span>;
}

function ListingRow({ l }) {
  return (
    <div className="lr">
      <div className="lr-ph" style={{background:`linear-gradient(135deg,${l.tint[0]},${l.tint[1]})`}}>
        {l.img && <svg viewBox="0 0 100 100" className="lr-ph-mark"><circle cx="50" cy="50" r="28" fill="rgba(255,255,255,.35)"/></svg>}
        {l.boost && <span className="lr-boost">BOOSTED</span>}
      </div>
      <div className="lr-body">
        {l.flag==='needs-tag' && <div className="lr-notice"><b>•</b> เหตือนใจ: ต้องอัพเดทรายการสินค้าของคุณแล้วหรือไม่</div>}
        <div className="lr-title">{l.title}</div>
        <div className="lr-price">
          ฿{l.price.toLocaleString()}
          {l.was && <s>฿{l.was.toLocaleString()}</s>}
        </div>
        <div className="lr-meta">
          <StatusDot s={l.status}/> · ประกาศเมื่อ {l.posted}
        </div>
        <div className="lr-stats">
          ลงประกาศใน Marketplace และในกลุ่มแล้ว <b>{Math.max(1, Math.floor(l.chats/3))}</b> กลุ่ม · การคลิกจากการค้นหา <b>{l.views}</b> ครั้ง <span className="lr-info">ⓘ</span>
        </div>

        <div className="lr-actions">
          {l.status==='active' && (
            <>
              <button className="lr-btn primary"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> ทำเครื่องหมายว่าขายแล้ว</button>
              <button className="lr-btn"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg> โปรโมท</button>
            </>
          )}
          {l.status==='draft' && (
            <>
              <button className="lr-btn primary"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21"/></svg> ทำเครื่องหมายว่าพร้อมจำหน่าย</button>
              <button className="lr-btn"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg> ลงประกาศขายสินค้านี้อีกครั้ง</button>
            </>
          )}
          {l.status==='sold-out' && (
            <>
              <button className="lr-btn primary"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> ทำเครื่องหมายว่ามีในสต็อก</button>
              <button className="lr-btn"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg> ลงประกาศขายสินค้านี้อีกครั้ง</button>
            </>
          )}
          {l.status==='hidden' && (
            <button className="lr-btn primary"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg> แสดงสินค้าอีกครั้ง</button>
          )}
          <button className="lr-btn"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> แชร์</button>
          <button className="lr-btn lr-more" aria-label="more"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button>
        </div>
      </div>
    </div>
  );
}

function ListingGridCard({ l }) {
  return (
    <div className="lg">
      <div className="lg-ph" style={{background:`linear-gradient(135deg,${l.tint[0]},${l.tint[1]})`}}>
        {l.boost && <span className="lr-boost">BOOSTED</span>}
        <div className="lg-st"><StatusDot s={l.status}/></div>
      </div>
      <div className="lg-body">
        <div className="lg-title">{l.title}</div>
        <div className="lr-price">฿{l.price.toLocaleString()}{l.was && <s>฿{l.was.toLocaleString()}</s>}</div>
        <div className="lg-stats"><span>👁 {l.views}</span><span>💬 {l.chats}</span><span>♡ {l.saves}</span></div>
      </div>
    </div>
  );
}

// =================== SELLER: INSIGHTS ===================
function SellInsights() {
  const total = MY_LISTINGS.reduce((a,l)=>a+l.views,0);
  const chats = MY_LISTINGS.reduce((a,l)=>a+l.chats,0);
  const saves = MY_LISTINGS.reduce((a,l)=>a+l.saves,0);
  const sold  = MY_LISTINGS.filter(l=>l.status==='sold-out').length;

  const stats = [
    { k:'ยอดเข้าชม 30 วัน',  v:total.toLocaleString(), delta:'+18%', up:true },
    { k:'ข้อความจากผู้สนใจ', v:chats.toLocaleString(), delta:'+5',   up:true },
    { k:'บันทึกเป็นที่ชื่นชอบ', v:saves.toLocaleString(), delta:'+22', up:true },
    { k:'ขายสำเร็จเดือนนี้',   v:sold.toString(),       delta:'—',    up:null },
  ];

  const top = [...MY_LISTINGS].sort((a,b)=>b.views-a.views).slice(0,4);

  return (
    <div className="hub-page">
      <h1 className="hub-h1">ข้อมูลเชิงลึก</h1>
      <p className="hub-sub">ตัวเลขย้อนหลัง 30 วัน · อัปเดตล่าสุด 2 ชม. ที่แล้ว</p>

      <div className="ins-grid">
        {stats.map(s=>(
          <div key={s.k} className="ins-card">
            <div className="ins-k">{s.k}</div>
            <div className="ins-v">{s.v}</div>
            {s.up!==null && <div className={'ins-d '+(s.up?'up':'down')}>{s.delta} vs. เดือนก่อน</div>}
            {s.up===null && <div className="ins-d">เท่าเดิม</div>}
          </div>
        ))}
      </div>

      <div className="ins-chart">
        <div className="ins-chart-h">
          <h3>ยอดเข้าชมรายวัน</h3>
          <div className="ins-chart-legend"><span className="dot" style={{background:'var(--accent)'}}/> ยอดเข้าชม</div>
        </div>
        <MiniChart/>
      </div>

      <div className="ins-top">
        <h3>สินค้าที่มีผู้สนใจสูงสุด</h3>
        <div className="ins-top-list">
          {top.map((l,i)=>(
            <div key={l.id} className="ins-top-row">
              <span className="ins-rank">{i+1}</span>
              <div className="ins-top-ph" style={{background:`linear-gradient(135deg,${l.tint[0]},${l.tint[1]})`}}/>
              <div className="ins-top-body">
                <div className="ins-top-t">{l.title}</div>
                <div className="ins-top-m">฿{l.price.toLocaleString()} · <StatusDot s={l.status}/></div>
              </div>
              <div className="ins-top-n">
                <div><b>{l.views}</b><span>เข้าชม</span></div>
                <div><b>{l.chats}</b><span>แชท</span></div>
                <div><b>{l.saves}</b><span>บันทึก</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const data = [18,22,19,28,24,31,36,29,33,41,37,44,48,42,51,46,52,58,54,61,55,63,68,64,72,67,74,81,76,84];
  const max = Math.max(...data);
  const W = 720, H = 160, P = 20;
  const step = (W - P*2) / (data.length - 1);
  const pts = data.map((v,i)=>[P + i*step, H - P - (v/max)*(H - P*2)]);
  const path = pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const fill = path + ` L${pts[pts.length-1][0]},${H-P} L${pts[0][0]},${H-P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ins-svg">
      <path d={fill} fill="color-mix(in srgb,var(--accent) 14%,transparent)"/>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2"/>
      {pts.filter((_,i)=>i%5===0).map((p,i)=>(
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--accent)"/>
      ))}
    </svg>
  );
}

// =================== SELLER: NEWS ===================
function SellNews() {
  const items = [
    { tag:'ใหม่',       h:'Boost ราคาพิเศษ ฿19 ในเดือนนี้', d:'เพิ่มยอดคนเห็น 8-12 เท่า สำหรับประกาศที่ลงในช่วง 1-31 ของเดือนนี้', when:'2 วันที่แล้ว' },
    { tag:'นโยบาย',     h:'เงื่อนไขการซื้อขายสินค้าสะสม',    d:'สำหรับหมวดของสะสม ต้องระบุสภาพและรูปจริงอย่างชัดเจน เพื่อป้องกันการคืน',     when:'1 สัปดาห์ที่แล้ว' },
    { tag:'เคล็ดลับ',   h:'5 เคล็ดลับถ่ายรูปสินค้าให้ขายดีกว่า', d:'แสงธรรมชาติ · มุมมอง 3 ด้าน · ฉากหลังเรียบ · ระยะชิด · รายละเอียดตำหนิ',       when:'2 สัปดาห์ที่แล้ว' },
    { tag:'สำคัญ',      h:'ช่องทางร้องเรียน — หน้าใหม่', d:'เปิดใช้งานหน้าร้องเรียนกับทีมงาน พร้อมแชทสองทางแล้วที่ /complaints. บำรุงรักษาช่วงเช้ามืด 02:00-04:00 น. วันอาทิตย์ที่ 26 เม.ย. 2569',   when:'3 สัปดาห์ที่แล้ว' },
  ];
  return (
    <div className="hub-page">
      <h1 className="hub-h1">ข่าวประกาศ</h1>
      <p className="hub-sub">ข่าวและอัปเดตสำหรับผู้ขาย</p>
      <div className="news-list">
        {items.map((it,i)=>(
          <article key={i} className="news-card">
            <span className={'news-tag t-'+i}>{it.tag}</span>
            <h3>{it.h}</h3>
            <p>{it.d}</p>
            <footer>{it.when} · <a>อ่านเพิ่มเติม →</a></footer>
          </article>
        ))}
      </div>
    </div>
  );
}

// =================== BUY: ACTIVITY ===================
function BuyActivity() {
  const { PRODUCTS } = window.PLOI_DATA;
  return (
    <div className="hub-page">
      <h1 className="hub-h1">กิจกรรมล่าสุด</h1>
      <p className="hub-sub">ของที่คุณดู · ข้อความ · ข้อเสนอ · บันทึก</p>
      <div className="act-list">
        {BUY_ACTIVITY.map((a,i)=>{
          const p = PRODUCTS[a.productIdx];
          if(!p) return null;
          const tint = window.PLOI_DATA.IMG_TINTS[(p.img-1)%12];
          const kindCfg = {
            viewed:   { t:'เพิ่งดู',        ic:<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg> },
            messaged: { t:'ส่งข้อความ',     ic:<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
            saved:    { t:'บันทึก',         ic:<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4h12v16l-6-4-6 4z"/></svg> },
            offered:  { t:'ยื่นข้อเสนอ',    ic:<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6h-8l-2-2H4a2 2 0 0 0-2 2v14h20V8a2 2 0 0 0-2-2z"/></svg> },
          }[a.kind] || { t:a.kind, ic:null };
          return (
            <div key={i} className="act-row" onClick={()=>window.__openProduct && window.__openProduct(p)}>
              <div className="act-ph" style={{background:`linear-gradient(135deg,${tint[0]},${tint[1]})`}}/>
              <div className="act-body">
                <div className="act-kind">{kindCfg.ic} {kindCfg.t}</div>
                <div className="act-title">{p.title}</div>
                {a.detail && <div className="act-det">{a.detail}</div>}
                <div className="act-meta">฿{p.price.toLocaleString()} · {p.seller} · {p.loc}</div>
              </div>
              <div className="act-when">{a.when}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =================== BUY: SAVED ===================
function BuySaved() {
  const { PRODUCTS, IMG_TINTS } = window.PLOI_DATA;
  const items = SAVED_IDS.map(id => PRODUCTS.find(p=>p.id===id)).filter(Boolean);
  return (
    <div className="hub-page">
      <h1 className="hub-h1">บันทึกแล้ว</h1>
      <p className="hub-sub">{items.length} รายการที่คุณบันทึกไว้</p>
      <div className="hub-sgrid">
        {items.map(p => {
          const tint = IMG_TINTS[(p.img-1)%12];
          return (
            <div key={p.id} className="sv-card" onClick={()=>window.__openProduct && window.__openProduct(p)}>
              <div className="sv-ph" style={{background:`linear-gradient(135deg,${tint[0]},${tint[1]})`}}>
                <button className="sv-unsave" title="เอาออกจากที่บันทึก" onClick={e=>e.stopPropagation()}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 4h12v16l-6-4-6 4z"/></svg>
                </button>
              </div>
              <div className="sv-body">
                <div className="lr-price">฿{p.price.toLocaleString()}{p.was && <s>฿{p.was.toLocaleString()}</s>}</div>
                <div className="sv-title">{p.title}</div>
                <div className="sv-meta">{p.loc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =================== BUY: NOTIFICATIONS ===================
function BuyNotifications() {
  const { PRODUCTS, IMG_TINTS } = window.PLOI_DATA;
  const [items, setItems] = useState(NOTIFICATIONS);
  const markAll = ()=>setItems(items.map(n=>({...n, unread:false})));
  const unread = items.filter(n=>n.unread).length;
  const kindCfg = {
    'price-drop':  { ic:'▼',  cls:'drop',   t:'ราคาลดลง' },
    'reply':       { ic:'💬', cls:'reply',  t:'ข้อความตอบกลับ' },
    'new-listing': { ic:'★',  cls:'star',   t:'ของใหม่จากผู้ขาย' },
    'offer':       { ic:'⇄',  cls:'offer',  t:'ข้อเสนอ' },
    'similar':     { ic:'≈',  cls:'similar',t:'ของคล้ายกัน' },
    'review':      { ic:'✓',  cls:'review', t:'ส่งมอบสำเร็จ' },
  };
  return (
    <div className="hub-page">
      <div className="hub-h-row">
        <div>
          <h1 className="hub-h1">การแจ้งเตือน</h1>
          <p className="hub-sub">{unread>0 ? `${unread} รายการยังไม่ได้อ่าน` : 'อ่านหมดแล้ว'}</p>
        </div>
        {unread>0 && <button className="hub-textbtn" onClick={markAll}>ทำเครื่องหมายอ่านทั้งหมด</button>}
      </div>

      <div className="nt-list">
        {items.map((n,i)=>{
          const p = PRODUCTS[n.productIdx];
          const tint = p ? IMG_TINTS[(p.img-1)%12] : ['#eee','#ccc'];
          const cfg = kindCfg[n.kind] || {ic:'•', cls:'', t:n.kind};
          return (
            <div key={i} className={'nt-row'+(n.unread?' unread':'')}>
              <span className={'nt-ic '+cfg.cls}>{cfg.ic}</span>
              <div className="nt-ph" style={{background:`linear-gradient(135deg,${tint[0]},${tint[1]})`}}/>
              <div className="nt-body">
                <div className="nt-kind">{cfg.t}</div>
                <div className="nt-text">{n.text}</div>
                {p && <div className="nt-sub">{p.title}</div>}
                <div className="nt-when">{n.when}</div>
              </div>
              {n.unread && <span className="nt-dot"/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =================== BUY: FOLLOWING ===================
function BuyFollowing() {
  return (
    <div className="hub-page">
      <h1 className="hub-h1">กำลังติดตาม</h1>
      <p className="hub-sub">{FOLLOWING.length} ผู้ขายที่คุณติดตามอยู่</p>
      <div className="fl-list">
        {FOLLOWING.map(s=>(
          <div key={s.id} className="fl-row">
            <div className="fl-ava">{s.ava}</div>
            <div className="fl-body">
              <div className="fl-top">
                <div className="fl-name">{s.name}{s.newBadge>0 && <span className="fl-new">{s.newBadge} ใหม่</span>}</div>
                <div className="fl-rating">★ {s.rating} <span>({s.reviews} รีวิว)</span></div>
              </div>
              <div className="fl-meta">ลงขายอยู่ {s.items} รายการ · ประกาศล่าสุด {s.lastPost}</div>
            </div>
            <div className="fl-actions">
              <button className="lr-btn">ดูร้าน</button>
              <button className="lr-btn primary">กำลังติดตาม ✓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== HUB PROFILE (shared between sell/buy) ===================
function HubProfile({ mode }) {
  return (
    <div className="hub-page">
      <h1 className="hub-h1">โปรไฟล์ Marketplace</h1>
      <p className="hub-sub">ข้อมูลที่ผู้ซื้อ-ผู้ขายรายอื่นจะเห็น</p>

      <div className="pr-card">
        <div className="pr-ava">K</div>
        <div className="pr-body">
          <h3>Kulchart Tanyuwattana</h3>
          <div className="pr-rating">★ 4.9 <span>(48 รีวิว)</span> · สมาชิกตั้งแต่ 2563</div>
          <div className="pr-stats">
            <div><b>{MY_LISTINGS.filter(l=>l.status==='active').length}</b><span>กำลังขาย</span></div>
            <div><b>{MY_LISTINGS.filter(l=>l.status==='sold-out').length}</b><span>ขายแล้ว</span></div>
            <div><b>{FOLLOWING.length}</b><span>กำลังติดตาม</span></div>
            <div><b>124</b><span>ผู้ติดตาม</span></div>
          </div>
        </div>
        <button className="lr-btn">แก้ไขโปรไฟล์</button>
      </div>

      <div className="pr-section">
        <h3>ข้อมูลติดต่อ</h3>
        <div className="pr-kv"><span>อีเมล</span><b>kulchart@example.com</b></div>
        <div className="pr-kv"><span>เบอร์โทร</span><b>08x-xxx-4421</b></div>
        <div className="pr-kv"><span>พื้นที่</span><b>กรุงเทพฯ · พระราม 9</b></div>
      </div>

      <div className="pr-section">
        <h3>รีวิวล่าสุด</h3>
        {[
          { ava:'W', n:'Warot S.', s:5, d:'ของตรงปก ส่งเร็วมาก แพ็คดี แนะนำเลยครับ', when:'3 วันที่แล้ว' },
          { ava:'N', n:'Napat T.', s:5, d:'ผู้ขายใจดี ตอบเร็ว สินค้าเหมือนรูปเป๊ะ', when:'1 สัปดาห์' },
          { ava:'P', n:'Ploy K.', s:4, d:'สินค้าโอเค แต่กล่องบุบนิดหน่อย ผู้ขายขอโทษและชดเชย', when:'2 สัปดาห์' },
        ].map((r,i)=>(
          <div key={i} className="pr-rev">
            <div className="pr-rev-ava">{r.ava}</div>
            <div className="pr-rev-body">
              <div className="pr-rev-h"><b>{r.n}</b> <span className="pr-rev-stars">{'★'.repeat(r.s)}{'☆'.repeat(5-r.s)}</span></div>
              <div className="pr-rev-d">{r.d}</div>
              <div className="pr-rev-w">{r.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({msg}){
  return <div className="hub-empty"><div className="hub-empty-ic">📦</div><div>{msg}</div></div>;
}

window.V8Hub = V8Hub;
