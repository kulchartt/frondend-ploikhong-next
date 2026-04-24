// ===== V11 Admin — Ops Console (v2) =====
// Full redesign: unified Queue inbox, split view, ⌘K palette,
// dense tables with bulk actions, metric chips, activity drawer

// ---------- Data ----------
const ADMIN_DATA = {
  users: [
    {id:'U-1001', name:'บอส มาร์เก็ต', email:'boss@mail.com', joined:'15 มี.ค. 2024', status:'active', listings:24, revenue:18400, trust:4.8, phone:'081-234-5678', city:'กรุงเทพฯ', last:'ออนไลน์ 2 นาทีก่อน', avatar:'BM', premium:false, reports:0},
    {id:'U-1002', name:'สมศรี ทองดี', email:'somsri@mail.com', joined:'8 ม.ค. 2024', status:'active', listings:8, revenue:3200, trust:4.5, phone:'089-876-5432', city:'นนทบุรี', last:'ออนไลน์ 10 นาทีก่อน', avatar:'ST', premium:false, reports:0},
    {id:'U-1003', name:'G-Shop', email:'gshop@mail.com', joined:'22 ก.พ. 2024', status:'premium', listings:142, revenue:89300, trust:4.9, phone:'02-123-4567', city:'กรุงเทพฯ', last:'ออนไลน์ตอนนี้', avatar:'GS', premium:true, reports:2},
    {id:'U-1004', name:'มานพ กิตติ', email:'manop@mail.com', joined:'12 พ.ค. 2024', status:'pending', listings:0, revenue:0, trust:0, phone:'085-555-4444', city:'เชียงใหม่', last:'สมัคร 3 วันก่อน', avatar:'MK', premium:false, reports:0},
    {id:'U-1005', name:'จันทรา สมบูรณ์', email:'jan@mail.com', joined:'4 เม.ย. 2024', status:'suspended', listings:3, revenue:1800, trust:2.1, phone:'091-222-3333', city:'ภูเก็ต', last:'ถูกระงับ 5 วันก่อน', avatar:'JS', premium:false, reports:5, suspendReason:'ขายสินค้าปลอมซ้ำ'},
    {id:'U-1006', name:'ก้องภพ วิชญ์', email:'kong@mail.com', joined:'19 พ.ค. 2024', status:'active', listings:12, revenue:7600, trust:4.6, phone:'083-777-8888', city:'ขอนแก่น', last:'ออนไลน์เมื่อวาน', avatar:'KW', premium:false, reports:1},
  ],
  listings: [
    {id:'L-2418', product:'iPhone 13 Pro 256GB', seller:'บอส มาร์เก็ต', price:18500, category:'มือถือ', status:'active', date:'15 ต.ค. 2025', views:1240, msgs:18, img:'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=200&auto=format&fit=crop&q=60', reports:0, boosted:true},
    {id:'L-2419', product:'Macbook Air M1 — สภาพใหม่', seller:'G-Shop', price:25900, category:'คอมพิวเตอร์', status:'active', date:'14 ต.ค. 2025', views:3240, msgs:24, img:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&auto=format&fit=crop&q=60', reports:0, boosted:true, featured:true},
    {id:'L-2420', product:'กระเป๋า LV เก่า', seller:'สมศรี ทองดี', price:12000, category:'แฟชั่น', status:'pending', date:'15 ต.ค. 2025', views:42, msgs:1, img:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&auto=format&fit=crop&q=60', reports:0},
    {id:'L-2421', product:'iPhone 11 ของแท้ 100%', seller:'มานพ กิตติ', price:8500, category:'มือถือ', status:'reported', date:'12 ต.ค. 2025', views:820, msgs:6, img:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&auto=format&fit=crop&q=60', reports:3, boosted:false},
    {id:'L-2422', product:'AirPods Pro Gen 2', seller:'เก่งเทค', price:2900, category:'หูฟัง', status:'active', date:'10 ต.ค. 2025', views:2104, msgs:32, img:'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&auto=format&fit=crop&q=60', reports:1},
  ],
  reports: [
    {id:'R-0245', listing:'iPhone 11 ของแท้ 100%', listingId:'L-2421', reporter:'มานพ กิตติ', reason:'สงสัยของปลอม', detail:'ราคาต่ำกว่าตลาดมาก รูปดูเหมือนดึงจาก Google + ไม่มีกล่องและอุปกรณ์ครบ', status:'investigating', date:'1 ชม.ที่แล้ว', evidenceCount:3, slaHours:3, priority:'high'},
    {id:'R-0244', listing:'Dior Saddle Bag', listingId:'L-2390', reporter:'จันทรา สมบูรณ์', reason:'รูปไม่ตรงปก', detail:'รูปที่ลงดูเป็นรูป stock photo จากเว็บไซต์ Dior', status:'new', date:'3 ชม.ที่แล้ว', evidenceCount:1, slaHours:21, priority:'mid'},
    {id:'R-0243', listing:'AirPods Pro Gen 2', listingId:'L-2422', reporter:'สมศรี ทองดี', reason:'ราคาต่ำผิดปกติ', detail:'฿2,900 ถูกกว่าท้องตลาดมาก น่าสงสัย', status:'resolved', date:'เมื่อวาน', evidenceCount:0, decision:'ไม่พบการฉ้อโกง', priority:'low'},
  ],
  complaints: [
    {id:'C-00188', reporter:'สมศรี ทองดี', product:'iPhone 13 Pro 256GB', amount:18500, status:'investigating', date:'2 ชม.ที่แล้ว', seller:'บอส มาร์เก็ต', slaHours:18, priority:'high', detail:'ได้รับสินค้าแต่หน้าจอมีรอยแตกชัดเจน ไม่ตรงกับรูปที่ลงขายที่บอกว่าสภาพเยี่ยม'},
    {id:'C-00187', reporter:'มานพ กิตติ', product:'Macbook Air M1', amount:25900, status:'pending', date:'เมื่อวาน', seller:'G-Shop', slaHours:42, priority:'mid', detail:'รอเอกสารจากผู้ซื้อ — หลักฐานการส่ง'},
    {id:'C-00185', reporter:'จันทรา สมบูรณ์', product:'กระเป๋า LV', amount:12000, status:'resolved', date:'3 วันก่อน', seller:'BrandShop', decision:'คืนเงิน 50% พร้อมตักเตือนผู้ขาย', priority:'low'},
  ],
};

// Build unified queue
function buildQueue() {
  const items = [];
  ADMIN_DATA.reports.forEach(r=>{
    if(r.status==='resolved') return;
    items.push({
      key:`r-${r.id}`, kind:'report', id:r.id, priority:r.priority, status:r.status,
      subject:`${r.reason} — ${r.listing}`, meta:`${r.reporter} แจ้ง · ${r.evidenceCount} หลักฐาน`,
      slaHours:r.slaHours, date:r.date, unread:r.status==='new',
      ref:r,
    });
  });
  ADMIN_DATA.complaints.forEach(c=>{
    if(c.status==='resolved') return;
    items.push({
      key:`c-${c.id}`, kind:'complaint', id:c.id, priority:c.priority, status:c.status,
      subject:`${c.product} — ผู้ซื้อร้องเรียน`, meta:`${c.reporter} vs ${c.seller} · ฿${c.amount.toLocaleString()}`,
      slaHours:c.slaHours, date:c.date, unread:false,
      ref:c,
    });
  });
  ADMIN_DATA.listings.filter(l=>l.status==='pending').forEach(l=>{
    items.push({
      key:`l-${l.id}`, kind:'listing', id:l.id, priority:'low', status:'pending',
      subject:`${l.product} — รอตรวจประกาศใหม่`, meta:`${l.seller} · ฿${l.price.toLocaleString()}`,
      slaHours:46, date:'2 ชม.ที่แล้ว', unread:true,
      ref:l,
    });
  });
  ADMIN_DATA.users.filter(u=>u.status==='pending').forEach(u=>{
    items.push({
      key:`u-${u.id}`, kind:'user', id:u.id, priority:'low', status:'pending',
      subject:`${u.name} — สมัครสมาชิกใหม่ รอตรวจ`, meta:`${u.email} · ${u.city}`,
      slaHours:68, date:'3 วันก่อน', unread:true,
      ref:u,
    });
  });
  // Sort by SLA (asc) + priority
  const prioOrder = {high:0, mid:1, low:2};
  items.sort((a,b)=>{
    if(a.priority !== b.priority) return prioOrder[a.priority] - prioOrder[b.priority];
    return (a.slaHours||999) - (b.slaHours||999);
  });
  return items;
}

// ---------- Icons ----------
const I = {
  queue: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>,
  listings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  reports: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  complaints: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  finance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  search: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  bell: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  back: <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>,
  x: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  check: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  warn: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>,
  trash: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>,
  lock: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  chat: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  ext: <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>,
  chev: <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  dots: <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  filter: <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46"/></svg>,
  cal: <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  act: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  dl: <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  star: <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  moreFilters: <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
};

// SLA helper
function slaClass(hours){
  if(!hours && hours !== 0) return '';
  if(hours < 6) return 'neg';
  if(hours < 24) return 'warn';
  return '';
}
function slaText(hours){
  if(hours == null) return '';
  if(hours < 1) return '< 1ชม.';
  if(hours < 24) return `${Math.round(hours)}ชม.`;
  return `${Math.round(hours/24)}วัน`;
}

// ---------- Main ----------
function V11Admin({ onClose }) {
  const [tab, setTab] = useState('queue');
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [queueItems] = useState(buildQueue);
  const [selectedKey, setSelectedKey] = useState(queueItems[0]?.key);
  const [queueFilter, setQueueFilter] = useState('all');
  const [bulkSel, setBulkSel] = useState(new Set());
  const [actOpen, setActOpen] = useState(false);

  // ⌘K
  useEffect(()=>{
    const onKey = e=>{
      if((e.metaKey||e.ctrlKey) && e.key==='k'){
        e.preventDefault(); setCmdkOpen(o=>!o);
      } else if(e.key==='Escape' && cmdkOpen){
        setCmdkOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  }, [cmdkOpen]);

  const filteredQueue = queueItems.filter(it=>{
    if(queueFilter==='all') return true;
    if(queueFilter==='mine') return it.priority==='high';
    return it.kind===queueFilter;
  });

  const selected = queueItems.find(it=>it.key===selectedKey);

  const nav = [
    ['queue','Queue', I.queue, queueItems.filter(i=>i.status==='new'||i.priority==='high').length],
    ['users','ผู้ใช้', I.users, null],
    ['listings','ประกาศ', I.listings, null],
    ['reports','รายงาน', I.reports, ADMIN_DATA.reports.filter(r=>r.status!=='resolved').length],
    ['complaints','เคสร้องเรียน', I.complaints, ADMIN_DATA.complaints.filter(c=>c.status!=='resolved').length],
    ['finance','การเงิน', I.finance, null],
  ];
  const tabLabel = nav.find(n=>n[0]===tab)?.[1];

  const setAllSel = (all)=>{
    if(all) setBulkSel(new Set(ADMIN_DATA.users.map(u=>u.id)));
    else setBulkSel(new Set());
  };
  // reset bulk when tab changes
  useEffect(()=>setBulkSel(new Set()), [tab]);

  return (
    <div className="st-overlay" style={{animation:'none'}}>
      <div className="ad">
        <aside className="ad-side">
          <div className="ad-brand">
            <PloiLogo size={15} markSize={24}/>
            <span className="ad-brand-sub">ADMIN</span>
          </div>

          <nav className="ad-nav">
            {nav.map(([k,l,ic,n])=>(
              <button key={k} className={tab===k?'on':''} onClick={()=>setTab(k)}>
                <span className="ad-ic">{ic}</span>
                {l}
                {n>0 && <span className="ad-nav-n">{n}</span>}
              </button>
            ))}
          </nav>

          <div className="ad-side-label">Saved Views</div>
          <div className="ad-saved-views">
            <button onClick={()=>{setTab('queue');setQueueFilter('report');}}>
              <span className="dot" style={{background:'var(--neg)'}}/>
              SLA เสี่ยงตก
              <span className="count">3</span>
            </button>
            <button onClick={()=>{setTab('users');}}>
              <span className="dot" style={{background:'var(--warn)'}}/>
              สมาชิกใหม่
              <span className="count">1</span>
            </button>
            <button onClick={()=>{setTab('listings');}}>
              <span className="dot" style={{background:'var(--accent)'}}/>
              รอตรวจประกาศ
              <span className="count">1</span>
            </button>
          </div>

          <div style={{flex:1}}/>

          <button className="ad-close" onClick={onClose}>
            {I.back} กลับหน้าแรก
          </button>

          <div className="ad-admin-card">
            <div className="ad-admin-ava">EK</div>
            <div style={{minWidth:0,flex:1}}>
              <div className="ad-admin-name">เอก แอดมิน</div>
              <div className="ad-admin-role">Super Admin</div>
            </div>
            <button className="ad-admin-menu">{I.dots}</button>
          </div>
        </aside>

        <main className="ad-main">
          {/* Topbar */}
          <div className="ad-topbar">
            <div className="ad-topbar-title">
              <h1>{tabLabel}</h1>
              <div className="ad-breadcrumb">Admin / {tabLabel}</div>
            </div>
            <button className="ad-cmdk" onClick={()=>setCmdkOpen(true)}>
              {I.search}
              <span>ค้นหา ผู้ใช้ / ประกาศ / เคส หรือรันคำสั่ง...</span>
              <kbd>⌘K</kbd>
            </button>
            <div className="ad-metric-chips">
              <div className="ad-chip live"><span className="dot"/>Live <b>238</b></div>
              <div className="ad-chip warn"><span className="dot"/>Open <b>{queueItems.length}</b></div>
              <div className="ad-chip neg"><span className="dot"/>SLA risk <b>{queueItems.filter(i=>i.slaHours<12).length}</b></div>
            </div>
            <button className="ad-icon-btn" onClick={()=>setActOpen(true)} title="Activity">
              {I.act}
            </button>
            <button className="ad-icon-btn" title="Notifications">
              {I.bell}
              <span className="ad-bell-dot"/>
            </button>
          </div>

          {/* Body per tab */}
          {tab==='queue' && (
            <QueueView
              items={filteredQueue}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              filter={queueFilter}
              setFilter={setQueueFilter}
              selected={selected}
              totalOpen={queueItems.length}
            />
          )}
          {tab==='users' && <UsersTable bulkSel={bulkSel} setBulkSel={setBulkSel}/>}
          {tab==='listings' && <ListingsTable bulkSel={bulkSel} setBulkSel={setBulkSel}/>}
          {tab==='reports' && <ReportsTable/>}
          {tab==='complaints' && <ComplaintsTable/>}
          {tab==='finance' && <FinanceView/>}
        </main>

        {cmdkOpen && <CommandPalette onClose={()=>setCmdkOpen(false)} onNav={(t)=>{setTab(t);setCmdkOpen(false);}}/>}
        {actOpen && <ActivityDrawer onClose={()=>setActOpen(false)}/>}
      </div>
    </div>
  );
}
window.V11Admin = V11Admin;

// ---------- Queue (unified inbox split view) ----------
function QueueView({ items, selectedKey, onSelect, filter, setFilter, selected, totalOpen }){
  const tabs = [
    ['all','ทั้งหมด', items.length],
    ['report','รายงาน', items.filter(i=>i.kind==='report').length],
    ['complaint','ร้องเรียน', items.filter(i=>i.kind==='complaint').length],
    ['listing','ประกาศ', items.filter(i=>i.kind==='listing').length],
  ];

  return (
    <div className="ad-queue">
      <div className="ad-queue-list">
        <div className="ad-queue-head">
          <h3>Inbox</h3>
          <span className="count">{items.length}</span>
          <div className="ad-queue-tabs">
            {tabs.map(([k,l,n])=>(
              <button key={k} className={filter===k?'on':''} onClick={()=>setFilter(k)}>{l} {n>0 && <span style={{opacity:.6}}>{n}</span>}</button>
            ))}
          </div>
        </div>
        <div className="ad-queue-scroll">
          {items.map(it=>(
            <QueueItem key={it.key} it={it} sel={selectedKey===it.key} onClick={()=>onSelect(it.key)}/>
          ))}
          {items.length===0 && (
            <div style={{padding:40,textAlign:'center',color:'var(--ink-3)',fontSize:13}}>
              ไม่มีรายการในกลุ่มนี้
            </div>
          )}
        </div>
      </div>

      <div className="ad-q-detail">
        {selected ? <QueueDetail it={selected}/> : <QueueEmpty/>}
      </div>
    </div>
  );
}

function QueueItem({ it, sel, onClick }){
  const kindLbl = {report:'Report', complaint:'Claim', listing:'Listing', user:'User'}[it.kind];
  const slaCls = slaClass(it.slaHours);
  return (
    <div className={'ad-q-item '+(sel?'sel':'')} onClick={onClick}>
      <div className="ad-q-item-lbl">
        <span className={'ad-q-kind '+it.kind}>{kindLbl}</span>
      </div>
      <div className="ad-q-main">
        <div className="ad-q-top">
          <span className={'ad-q-prio-dot '+it.priority}/>
          <span className="ad-q-id">{it.id}</span>
        </div>
        <div className="ad-q-subj">{it.subject}</div>
        <div className="ad-q-meta">{it.meta}</div>
      </div>
      <div className="ad-q-sla">
        <span className={'ad-q-sla-time '+slaCls}>{slaText(it.slaHours)}</span>
        <span className="ad-q-sla-lbl">SLA</span>
      </div>
      {it.unread && <span className="ad-q-unread"/>}
    </div>
  );
}

function QueueEmpty(){
  return (
    <div className="ad-q-empty">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
      <div style={{fontSize:14,fontWeight:600,color:'var(--ink-2)'}}>เลือกรายการเพื่อดูรายละเอียด</div>
      <div className="ad-q-empty-kbd">
        <span><kbd>↑</kbd> <kbd>↓</kbd> เลือก</span>
        <span><kbd>Enter</kbd> เปิด</span>
        <span><kbd>E</kbd> ปิดเคส</span>
        <span><kbd>⌘K</kbd> ค้นหา</span>
      </div>
    </div>
  );
}

function QueueDetail({ it }){
  if(it.kind==='report') return <ReportDetail r={it.ref}/>;
  if(it.kind==='complaint') return <ComplaintDetail c={it.ref}/>;
  if(it.kind==='listing') return <ListingDetail l={it.ref}/>;
  if(it.kind==='user') return <UserDetail u={it.ref}/>;
  return null;
}

// ---------- Detail panes ----------
function ReportDetail({ r }){
  const [dec, setDec] = useState(null);
  return (
    <>
      <div className="ad-q-dhead">
        <div className="ad-q-dhead-main">
          <div className="ad-q-dhead-top">
            <span className="ad-status-tag investigating">{r.status==='new'?'ใหม่':r.status==='investigating'?'กำลังตรวจ':'ปิดแล้ว'}</span>
            <span className="ad-id-mono">{r.id}</span>
            <span style={{fontSize:11,color:'var(--ink-3)',fontFamily:'var(--font-mono)'}}>• {r.date}</span>
          </div>
          <h2>{r.reason} — {r.listing}</h2>
          <div className="ad-q-dhead-meta">รายงานโดย {r.reporter} · {r.evidenceCount} หลักฐาน</div>
        </div>
        <div className="ad-q-dhead-acts">
          <button className="btn-ghost sm">{I.chat}</button>
          <button className="btn-ghost sm">{I.dots}</button>
        </div>
      </div>

      <div className="ad-q-body">
        {r.slaHours != null && (
          <div className={'ad-dp-sla '+slaClass(r.slaHours)}>
            <div className="ad-dp-sla-ic">{I.warn}</div>
            <div>ต้องตอบภายใน <b>{slaText(r.slaHours)}</b> • deadline {(r.slaHours<24?'วันนี้ 18:00':'18 ต.ค. 2025 18:00')}</div>
          </div>
        )}

        <div className="ad-dp-sec">
          <h4>ประกาศที่ถูกรายงาน</h4>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0'}}>
            <div>
              <div style={{fontWeight:600,fontSize:14}}>{r.listing}</div>
              <div className="ad-id-mono">{r.listingId}</div>
            </div>
            <button className="btn-ghost sm">ดู {I.ext}</button>
          </div>
        </div>

        <div className="ad-dp-sec">
          <h4>เหตุผล</h4>
          <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>{r.reason}</div>
          <p style={{fontSize:13.5,color:'var(--ink-2)',lineHeight:1.6,margin:0}}>{r.detail}</p>
        </div>

        {r.evidenceCount>0 && (
          <div className="ad-dp-sec">
            <h4>หลักฐาน ({r.evidenceCount} ไฟล์)</h4>
            <div className="ad-dp-evidence">
              {Array.from({length:r.evidenceCount}).map((_,i)=>(
                <div key={i} className="ad-dp-ev-item">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>#{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {r.decision ? (
          <div className="ad-dr-alert pos"><b>คำตัดสิน:</b> {r.decision}</div>
        ) : (
          <div className="ad-dp-sec">
            <h4>ตัดสินใจ</h4>
            <div className="ad-dp-decision">
              <button className={'ad-dp-dec '+(dec==='dismiss'?'on':'')} onClick={()=>setDec('dismiss')}>
                <div className="ad-dp-dec-t"><span className="ic">{I.x}</span>ยกคำร้อง</div>
                <div className="ad-dp-dec-d">ไม่พบการกระทำผิด</div>
              </button>
              <button className={'ad-dp-dec warn '+(dec==='warn'?'on':'')} onClick={()=>setDec('warn')}>
                <div className="ad-dp-dec-t"><span className="ic">{I.warn}</span>ตักเตือนผู้ขาย</div>
                <div className="ad-dp-dec-d">ส่งข้อความเตือน</div>
              </button>
              <button className={'ad-dp-dec neg '+(dec==='remove'?'on':'')} onClick={()=>setDec('remove')}>
                <div className="ad-dp-dec-t"><span className="ic">{I.trash}</span>ลบประกาศ</div>
                <div className="ad-dp-dec-d">ผิดกฎแน่นอน</div>
              </button>
              <button className={'ad-dp-dec neg '+(dec==='suspend'?'on':'')} onClick={()=>setDec('suspend')}>
                <div className="ad-dp-dec-t"><span className="ic">{I.lock}</span>ระงับบัญชี</div>
                <div className="ad-dp-dec-d">ร้ายแรง / ซ้ำซาก</div>
              </button>
            </div>

            <div className="ad-dp-compose" style={{marginTop:10}}>
              <textarea placeholder="หมายเหตุภายใน (ลูกค้าไม่เห็น) — ทำไมถึงตัดสินแบบนี้"/>
              <div className="ad-dp-compose-row">
                <span style={{fontSize:11,color:'var(--ink-3)',fontFamily:'var(--font-mono)'}}>TEMPLATES</span>
                <button className="btn-ghost sm">ละเมิดกฎ #4</button>
                <button className="btn-ghost sm">ของปลอม</button>
                <button className="btn-ghost sm">รูปสต็อก</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ad-dp-actions">
        <button className="btn-sec">{I.chat} ส่งข้อความผู้แจ้ง</button>
        <button className="btn-sec">Snooze 24ชม.</button>
        <div className="spacer"/>
        <button className="btn-sec" onClick={()=>window.toast?.({title:'บันทึกร่างแล้ว',kind:'info',duration:2500})}>บันทึกร่าง</button>
        <button className="btn-grad" disabled={!dec} onClick={()=>{
          const labels={dismiss:'ยกคำร้อง',warn:'ตักเตือนผู้ขาย',remove:'ลบประกาศ',suspend:'ระงับบัญชี'};
          window.toast?.({title:'ปิดเคสเรียบร้อย', desc:`${r.id} — ${labels[dec]||''}`, kind:'pos', duration:4000});
        }}>
          {I.check} ยืนยันและปิดเคส
          <kbd style={{fontFamily:'var(--font-mono)',fontSize:9,padding:'1px 4px',borderRadius:2,background:'rgba(255,255,255,.2)',marginLeft:4}}>E</kbd>
        </button>
      </div>
    </>
  );
}

function ComplaintDetail({ c }){
  const [pct, setPct] = useState(50);
  return (
    <>
      <div className="ad-q-dhead">
        <div className="ad-q-dhead-main">
          <div className="ad-q-dhead-top">
            <span className="ad-status-tag investigating">{c.status==='pending'?'รอเอกสาร':c.status==='investigating'?'กำลังดำเนินการ':'ปิดแล้ว'}</span>
            <span className="ad-id-mono">{c.id}</span>
            <span style={{fontSize:11,color:'var(--ink-3)',fontFamily:'var(--font-mono)'}}>• อัพเดต {c.date}</span>
          </div>
          <h2>{c.product} — ผู้ซื้อร้องเรียน</h2>
          <div className="ad-q-dhead-meta">{c.reporter} (ผู้ซื้อ) vs {c.seller} (ผู้ขาย) · มูลค่า ฿{c.amount.toLocaleString()}</div>
        </div>
        <div className="ad-q-dhead-acts">
          <button className="btn-ghost sm">{I.chat}</button>
          <button className="btn-ghost sm">{I.dots}</button>
        </div>
      </div>

      <div className="ad-q-body">
        {c.slaHours != null && (
          <div className={'ad-dp-sla '+slaClass(c.slaHours)}>
            <div className="ad-dp-sla-ic">{I.warn}</div>
            <div>ต้องตอบภายใน <b>{slaText(c.slaHours)}</b> • deadline 17 ต.ค. 2025 18:00</div>
          </div>
        )}

        <div className="ad-dp-sec">
          <h4>สรุปเคส</h4>
          <p style={{fontSize:13.5,color:'var(--ink-2)',lineHeight:1.6,margin:0}}>{c.detail||'—'}</p>
        </div>

        <div className="ad-dp-sec">
          <h4>ข้อมูลเคส</h4>
          <div className="ad-dp-kv">
            <div><span className="k">ผู้ซื้อ</span><span className="v">{c.reporter}</span></div>
            <div><span className="k">ผู้ขาย</span><span className="v">{c.seller}</span></div>
            <div><span className="k">สินค้า</span><span className="v">{c.product}</span></div>
            <div><span className="k">มูลค่า</span><span className="v mono">฿{c.amount.toLocaleString()}</span></div>
          </div>
        </div>

        <div className="ad-dp-sec">
          <h4>ไทม์ไลน์</h4>
          <div className="ad-dp-time">
            <div className="ad-dp-time-item"><span className="ad-dp-time-dot acc"/><div className="ad-dp-time-main"><b>ผู้ซื้อส่งเรื่อง</b> — อัปโหลดรูป 3 ไฟล์</div><div className="ad-dp-time-t">2 ชม.</div></div>
            <div className="ad-dp-time-item"><span className="ad-dp-time-dot acc"/><div className="ad-dp-time-main"><b>แอดมินยืนยันรับเรื่อง</b></div><div className="ad-dp-time-t">1 ชม. 40 นาที</div></div>
            <div className="ad-dp-time-item"><span className="ad-dp-time-dot"/><div className="ad-dp-time-main"><b>กำลังตรวจสอบ</b> — รอผู้ขายตอบ</div><div className="ad-dp-time-t">50 นาที</div></div>
          </div>
        </div>

        {c.decision ? (
          <div className="ad-dr-alert pos"><b>ผลการตัดสิน:</b> {c.decision}</div>
        ) : (
          <div className="ad-dp-sec">
            <h4>การชดเชย</h4>
            <div className="ad-dp-refund-opts">
              {[0,25,50,75,100].map(p=>(
                <button key={p} className={pct===p?'on':''} onClick={()=>setPct(p)}>{p}%</button>
              ))}
            </div>
            <div style={{display:'flex',gap:14,padding:'10px 14px',background:'var(--surface-2)',borderRadius:6,fontSize:13,marginBottom:10,color:'var(--ink-2)'}}>
              <div>คืนผู้ซื้อ <b className="ad-mono" style={{color:'var(--pos)'}}>฿{Math.round(c.amount*pct/100).toLocaleString()}</b></div>
              <div>หักผู้ขาย <b className="ad-mono" style={{color:'var(--neg)'}}>฿{Math.round(c.amount*pct/100).toLocaleString()}</b></div>
            </div>
            <div className="ad-dp-compose">
              <textarea placeholder="เหตุผลการตัดสิน (ทั้งสองฝ่ายจะเห็น)"/>
            </div>
          </div>
        )}
      </div>

      <div className="ad-dp-actions">
        <button className="btn-sec">{I.chat} เชิญคู่กรณีแชท</button>
        <button className="btn-sec">ขอหลักฐานเพิ่ม</button>
        <div className="spacer"/>
        <button className="btn-sec" onClick={()=>window.toast?.({title:'บันทึกร่างแล้ว',kind:'info',duration:2500})}>บันทึกร่าง</button>
        <button className="btn-grad" onClick={()=>window.toast?.({title:'ตัดสินเคสเรียบร้อย', desc:`${c.id} — คืนผู้ซื้อ ${pct}% (฿${Math.round(c.amount*pct/100).toLocaleString()})`, kind:'pos', duration:4500})}>{I.check} ยืนยันการตัดสิน</button>
      </div>
    </>
  );
}

function ListingDetail({ l }){
  return (
    <>
      <div className="ad-q-dhead">
        <div className="ad-q-dhead-main">
          <div className="ad-q-dhead-top">
            <span className={'ad-status-tag '+l.status}>{l.status==='pending'?'รอตรวจ':l.status==='reported'?'ถูกแจ้ง':'ใช้งาน'}</span>
            <span className="ad-id-mono">{l.id}</span>
          </div>
          <h2>{l.product}</h2>
          <div className="ad-q-dhead-meta">ผู้ขาย: {l.seller} · {l.category}</div>
        </div>
        <div className="ad-q-dhead-acts">
          <button className="btn-ghost sm">ดู {I.ext}</button>
        </div>
      </div>
      <div className="ad-q-body">
        <div className="ad-dp-hero">
          <img src={l.img} alt=""/>
          <div className="main">
            <h3>{l.product}</h3>
            <div className="meta">ลงเมื่อ {l.date} · {l.views.toLocaleString()} views · {l.msgs} ข้อความ</div>
          </div>
          <div className="price">฿{l.price.toLocaleString()}</div>
        </div>
        <div className="ad-dp-sec">
          <h4>รายละเอียด</h4>
          <p style={{fontSize:13.5,color:'var(--ink-2)',lineHeight:1.6,margin:0}}>สภาพเยี่ยม ใช้งานไม่นาน มีกล่องและอุปกรณ์ครบ ประกันเหลือ 8 เดือน ไม่เคยซ่อม รับประกันของแท้</p>
        </div>
        <div className="ad-dp-sec">
          <h4>AI Check</h4>
          <div className="ad-dp-kv">
            <div><span className="k">รูปภาพซ้ำ</span><span className="v" style={{color:'var(--pos)'}}>✓ ไม่พบ</span></div>
            <div><span className="k">คำต้องห้าม</span><span className="v" style={{color:'var(--pos)'}}>✓ ไม่พบ</span></div>
            <div><span className="k">ราคาผิดปกติ</span><span className="v" style={{color:'var(--pos)'}}>✓ ปกติ</span></div>
            <div><span className="k">ผู้ขาย risk</span><span className="v" style={{color:'var(--pos)'}}>Low (4.6★)</span></div>
          </div>
        </div>
      </div>
      <div className="ad-dp-actions">
        <button className="btn-sec danger" onClick={()=>window.toast?.({title:'ปฏิเสธประกาศแล้ว', desc:l.id, kind:'neg', duration:3000})}>{I.trash} ปฏิเสธ</button>
        <div className="spacer"/>
        <button className="btn-grad" onClick={()=>window.toast?.({title:'อนุมัติประกาศเรียบร้อย', desc:`${l.id} — ${l.product}`, kind:'pos', duration:3000})}>{I.check} อนุมัติประกาศ</button>
      </div>
    </>
  );
}

function UserDetail({ u }){
  return (
    <>
      <div className="ad-q-dhead">
        <div className="ad-q-dhead-main">
          <div className="ad-q-dhead-top">
            <span className={'ad-status-tag '+u.status}>{({active:'ใช้งาน',premium:'Premium',pending:'รอยืนยัน',suspended:'ถูกระงับ'})[u.status]}</span>
            <span className="ad-id-mono">{u.id}</span>
          </div>
          <h2>{u.name}</h2>
          <div className="ad-q-dhead-meta">{u.email} · {u.last}</div>
        </div>
      </div>
      <div className="ad-q-body">
        <div className="ad-dp-sec">
          <h4>ข้อมูลติดต่อ</h4>
          <div className="ad-dp-kv">
            <div><span className="k">เบอร์</span><span className="v mono">{u.phone}</span></div>
            <div><span className="k">จังหวัด</span><span className="v">{u.city}</span></div>
            <div><span className="k">สมัครเมื่อ</span><span className="v">{u.joined}</span></div>
            <div><span className="k">Trust</span><span className="v">{u.trust>0?<span style={{color:'var(--warn)'}}>★ {u.trust}</span>:'—'}</span></div>
          </div>
        </div>
        <div className="ad-dp-sec">
          <h4>สถิติ</h4>
          <div className="ad-dp-kv" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
            <div><span className="k">ประกาศ</span><span className="v mono">{u.listings}</span></div>
            <div><span className="k">รายได้รวม</span><span className="v mono">฿{u.revenue.toLocaleString()}</span></div>
            <div><span className="k">ถูกรายงาน</span><span className="v mono">{u.reports}</span></div>
          </div>
        </div>
      </div>
      <div className="ad-dp-actions">
        <button className="btn-sec">{I.chat} ส่งข้อความ</button>
        <div className="spacer"/>
        {u.status==='pending' ? <button className="btn-grad">{I.check} ยืนยันบัญชี</button> :
         u.status==='suspended' ? <button className="btn-grad">ยกเลิกระงับ</button> :
         <button className="btn-sec danger">{I.lock} ระงับบัญชี</button>}
      </div>
    </>
  );
}

// ---------- Tables ----------
function FilterBar({ groups, right, searchValue, onSearch }){
  return (
    <div className="ad-flt-row">
      {groups.map((g,gi)=>(
        <div key={gi} className="ad-flt-grp">
          {g.options.map(o=>(
            <button key={o.k} className={g.value===o.k?'on':''} onClick={()=>g.onChange(o.k)}>
              {o.l} {o.n!=null && <span className="n">{o.n}</span>}
            </button>
          ))}
        </div>
      ))}
      <div className="ad-flt-inp">
        {I.search}
        <input placeholder="ค้นหา..." value={searchValue||''} onChange={e=>onSearch?.(e.target.value)}/>
      </div>
      <button className="ad-flt-date">{I.cal} 7 วัน{I.chev}</button>
      {right}
    </div>
  );
}

function Cb({ on, onClick }){
  return <span className={'ad-cb '+(on?'on':'')} onClick={e=>{e.stopPropagation();onClick();}}/>;
}

function BulkBar({ count, onClear, actions }){
  if(count===0) return null;
  return (
    <div className="ad-bulk-bar">
      <span className="count">เลือก {count} รายการ</span>
      <span className="sep">·</span>
      {actions}
      <button className="close" onClick={onClear}>✕</button>
    </div>
  );
}

function UsersTable({ bulkSel, setBulkSel }){
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const rows = ADMIN_DATA.users.filter(u=>{
    if(filter!=='all' && u.status!==filter) return false;
    if(q && !(u.name.includes(q)||u.email.includes(q)||u.id.includes(q))) return false;
    return true;
  });
  const toggle = (id)=>{const n=new Set(bulkSel);n.has(id)?n.delete(id):n.add(id);setBulkSel(n);};
  const allSel = rows.length>0 && rows.every(r=>bulkSel.has(r.id));

  return (
    <div className="ad-content" style={{position:'relative'}}>
      <FilterBar
        groups={[{
          value:filter, onChange:setFilter,
          options:[
            {k:'all',l:'ทั้งหมด',n:ADMIN_DATA.users.length},
            {k:'active',l:'ใช้งาน',n:ADMIN_DATA.users.filter(u=>u.status==='active').length},
            {k:'premium',l:'Premium',n:ADMIN_DATA.users.filter(u=>u.status==='premium').length},
            {k:'pending',l:'รอยืนยัน',n:ADMIN_DATA.users.filter(u=>u.status==='pending').length},
            {k:'suspended',l:'ถูกระงับ',n:ADMIN_DATA.users.filter(u=>u.status==='suspended').length},
          ]
        }]}
        searchValue={q}
        onSearch={setQ}
        right={
          <div style={{marginLeft:'auto',display:'flex',gap:6}}>
            <button className="btn-ghost sm">{I.moreFilters} ตัวกรอง</button>
            <button className="btn-ghost sm">{I.dl} Export CSV</button>
          </div>
        }
      />
      <div className="ad-tbl-wrap">
        <div className="ad-tbl-toolbar">
          <Cb on={allSel} onClick={()=>allSel?setBulkSel(new Set()):setBulkSel(new Set(rows.map(r=>r.id)))}/>
          <span className="count">{rows.length.toLocaleString()} ผู้ใช้</span>
          <div style={{marginLeft:'auto',display:'flex',gap:6,fontSize:11,color:'var(--ink-3)',fontFamily:'var(--font-mono)'}}>
            เรียงตาม: <b style={{color:'var(--ink-2)'}}>สมัครล่าสุด</b> {I.chev}
          </div>
        </div>
        <table className="ad-tbl">
          <thead>
            <tr>
              <th style={{width:26}}></th>
              <th>ผู้ใช้</th>
              <th>สถานะ</th>
              <th>สมัครเมื่อ</th>
              <th>ประกาศ</th>
              <th>รายได้</th>
              <th>Trust</th>
              <th>รายงาน</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {rows.map(u=>(
              <tr key={u.id} className={bulkSel.has(u.id)?'sel':''}>
                <td><Cb on={bulkSel.has(u.id)} onClick={()=>toggle(u.id)}/></td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span className="ad-user-ava">{u.avatar}</span>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:500,display:'flex',gap:6,alignItems:'center'}}>
                        {u.name}
                        {u.premium && <span className="ad-premium-tag">⭐</span>}
                      </div>
                      <div className="ad-id-mono">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={'ad-status-tag '+u.status}>{({active:'ใช้งาน',premium:'Premium',pending:'รอยืนยัน',suspended:'ถูกระงับ'})[u.status]}</span></td>
                <td className="ad-mono">{u.joined}</td>
                <td className="ad-mono">{u.listings}</td>
                <td className="ad-mono">฿{u.revenue.toLocaleString()}</td>
                <td>{u.trust>0 ? <span className="ad-trust">★ {u.trust}</span> : '—'}</td>
                <td>{u.reports>0 ? <span className="ad-report-tag">{u.reports}</span> : '—'}</td>
                <td><button className="btn-ghost sm">{I.chev}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ad-tbl-pager">
          <span>1–{rows.length} จาก {ADMIN_DATA.users.length.toLocaleString()}</span>
          <div className="ad-tbl-pager-ctrls">
            <button disabled>‹</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <button>›</button>
          </div>
        </div>
      </div>
      <BulkBar
        count={bulkSel.size}
        onClear={()=>setBulkSel(new Set())}
        actions={<>
          <button>{I.chat} ส่งข้อความ</button>
          <button>{I.check} ยืนยันบัญชี</button>
          <button>{I.lock} ระงับ</button>
          <button className="danger">{I.trash} ลบ</button>
        </>}
      />
    </div>
  );
}

function ListingsTable({ bulkSel, setBulkSel }){
  const [filter, setFilter] = useState('all');
  const rows = ADMIN_DATA.listings.filter(l=>filter==='all' || l.status===filter);
  const toggle = (id)=>{const n=new Set(bulkSel);n.has(id)?n.delete(id):n.add(id);setBulkSel(n);};
  return (
    <div className="ad-content" style={{position:'relative'}}>
      <FilterBar
        groups={[{
          value:filter,onChange:setFilter,
          options:[
            {k:'all',l:'ทั้งหมด',n:ADMIN_DATA.listings.length},
            {k:'active',l:'ใช้งาน',n:ADMIN_DATA.listings.filter(l=>l.status==='active').length},
            {k:'pending',l:'รอตรวจ',n:ADMIN_DATA.listings.filter(l=>l.status==='pending').length},
            {k:'reported',l:'ถูกแจ้ง',n:ADMIN_DATA.listings.filter(l=>l.status==='reported').length},
          ]
        }]}
        right={<div style={{marginLeft:'auto'}}><button className="btn-ghost sm">{I.dl} Export</button></div>}
      />
      <div className="ad-tbl-wrap">
        <div className="ad-tbl-toolbar">
          <span className="count">{rows.length} ประกาศ</span>
        </div>
        <table className="ad-tbl">
          <thead>
            <tr>
              <th style={{width:26}}></th>
              <th>ประกาศ</th>
              <th>ผู้ขาย</th>
              <th>ราคา</th>
              <th>หมวด</th>
              <th>สถานะ</th>
              <th>Views</th>
              <th>ข้อความ</th>
              <th>แจ้ง</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {rows.map(l=>(
              <tr key={l.id} className={bulkSel.has(l.id)?'sel':''}>
                <td><Cb on={bulkSel.has(l.id)} onClick={()=>toggle(l.id)}/></td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <img src={l.img} alt="" style={{width:38,height:38,borderRadius:5,objectFit:'cover',flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                      <div style={{display:'flex',gap:6,alignItems:'center',fontWeight:500}}>
                        {l.product}
                        {l.featured && <span className="ad-premium-tag">FEAT</span>}
                        {l.boosted && !l.featured && <span className="ad-boost-tag">BOOST</span>}
                      </div>
                      <div className="ad-id-mono">{l.id}</div>
                    </div>
                  </div>
                </td>
                <td>{l.seller}</td>
                <td className="ad-mono">฿{l.price.toLocaleString()}</td>
                <td>{l.category}</td>
                <td><span className={'ad-status-tag '+l.status}>{({active:'ใช้งาน',pending:'รอตรวจ',reported:'ถูกแจ้ง'})[l.status]}</span></td>
                <td className="ad-mono">{l.views.toLocaleString()}</td>
                <td className="ad-mono">{l.msgs}</td>
                <td>{l.reports>0 ? <span className="ad-report-tag">{l.reports}</span> : '—'}</td>
                <td><button className="btn-ghost sm">{I.chev}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BulkBar
        count={bulkSel.size}
        onClear={()=>setBulkSel(new Set())}
        actions={<>
          <button>{I.check} อนุมัติ</button>
          <button>Boost ฟรี</button>
          <button>ย้ายหมวด</button>
          <button className="danger">{I.trash} ลบ</button>
        </>}
      />
    </div>
  );
}

function ReportsTable(){
  return (
    <div className="ad-content">
      <FilterBar
        groups={[{
          value:'all',onChange:()=>{},
          options:[{k:'all',l:'ทั้งหมด',n:3},{k:'new',l:'ใหม่',n:1},{k:'investigating',l:'กำลังตรวจ',n:1},{k:'resolved',l:'ปิดแล้ว',n:1}]
        }]}
      />
      <div className="ad-tbl-wrap">
        <table className="ad-tbl">
          <thead><tr><th>ID</th><th>ประกาศ</th><th>ผู้แจ้ง</th><th>เหตุผล</th><th>หลักฐาน</th><th>สถานะ</th><th>SLA</th><th>เวลา</th></tr></thead>
          <tbody>
            {ADMIN_DATA.reports.map(r=>(
              <tr key={r.id}>
                <td className="ad-mono" style={{fontWeight:600}}>{r.id}</td>
                <td>{r.listing}</td>
                <td>{r.reporter}</td>
                <td>{r.reason}</td>
                <td>{r.evidenceCount>0?<span className="ad-evidence-tag">{r.evidenceCount} ไฟล์</span>:'—'}</td>
                <td><span className={'ad-status-tag '+r.status}>{({new:'ใหม่',investigating:'กำลังตรวจ',resolved:'ปิดแล้ว'})[r.status]}</span></td>
                <td><span className={'ad-mono '+slaClass(r.slaHours)} style={{fontWeight:600,color:slaClass(r.slaHours)==='neg'?'var(--neg)':slaClass(r.slaHours)==='warn'?'var(--warn)':'var(--ink-2)'}}>{slaText(r.slaHours)||'—'}</span></td>
                <td className="ad-mono" style={{color:'var(--ink-3)'}}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComplaintsTable(){
  return (
    <div className="ad-content">
      <FilterBar
        groups={[{
          value:'all',onChange:()=>{},
          options:[{k:'all',l:'ทั้งหมด',n:3},{k:'pending',l:'รอเอกสาร',n:1},{k:'investigating',l:'กำลังดำเนินการ',n:1},{k:'resolved',l:'ปิดแล้ว',n:1}]
        }]}
      />
      <div className="ad-tbl-wrap">
        <table className="ad-tbl">
          <thead><tr><th>ID</th><th>ผู้ซื้อ</th><th>ผู้ขาย</th><th>สินค้า</th><th>มูลค่า</th><th>สถานะ</th><th>SLA</th><th>อัพเดต</th></tr></thead>
          <tbody>
            {ADMIN_DATA.complaints.map(c=>(
              <tr key={c.id}>
                <td className="ad-mono" style={{fontWeight:600}}>{c.id}</td>
                <td>{c.reporter}</td>
                <td>{c.seller}</td>
                <td>{c.product}</td>
                <td className="ad-mono">฿{c.amount.toLocaleString()}</td>
                <td><span className={'ad-status-tag '+c.status}>{({investigating:'กำลังดำเนินการ',pending:'รอเอกสาร',resolved:'ปิดแล้ว'})[c.status]}</span></td>
                <td><span className={'ad-mono '+slaClass(c.slaHours)} style={{fontWeight:600,color:slaClass(c.slaHours)==='neg'?'var(--neg)':slaClass(c.slaHours)==='warn'?'var(--warn)':'var(--ink-2)'}}>{slaText(c.slaHours)||'—'}</span></td>
                <td className="ad-mono" style={{color:'var(--ink-3)'}}>{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Finance ----------
function FinanceView(){
  return (
    <div className="ad-content">
      <div className="ad-home-hero">
        <div className="ad-home-stat">
          <div className="ad-home-stat-l">รายได้เดือนนี้</div>
          <div className="ad-home-stat-v">฿284,500</div>
          <div className="ad-home-stat-d pos">▲ +18% m/m</div>
        </div>
        <div className="ad-home-stat">
          <div className="ad-home-stat-l">Boost + Featured</div>
          <div className="ad-home-stat-v">฿142,300</div>
          <div className="ad-home-stat-d">50% ของรายได้</div>
        </div>
        <div className="ad-home-stat">
          <div className="ad-home-stat-l">Premium</div>
          <div className="ad-home-stat-v">฿92,700</div>
          <div className="ad-home-stat-d">723 สมาชิก</div>
        </div>
        <div className="ad-home-stat">
          <div className="ad-home-stat-l">ค่าคอม 2%</div>
          <div className="ad-home-stat-v">฿49,500</div>
          <div className="ad-home-stat-d pos">▲ +12%</div>
        </div>
      </div>

      <div className="ad-panel">
        <div className="ad-panel-head">
          <h3>รายการธุรกรรมล่าสุด</h3>
          <span className="sub">48 รายการวันนี้</span>
          <div className="right"><button className="btn-ghost sm">{I.dl} Export</button></div>
        </div>
        <table className="ad-tbl">
          <thead>
            <tr><th>TXN</th><th>ผู้ใช้</th><th>ประเภท</th><th>จำนวน</th><th>วิธีจ่าย</th><th>สถานะ</th><th>เวลา</th></tr>
          </thead>
          <tbody>
            {[
              ['TXN-9001','บอส มาร์เก็ต','Boost pack 600','฿149','บัตรเครดิต','success','14:32'],
              ['TXN-9000','G-Shop','Premium ปี','฿1,290','PromptPay','success','13:18'],
              ['TXN-8999','สมศรี ทองดี','Boost pack 100','฿29','TrueMoney','success','11:42'],
              ['TXN-8998','จันทรา สมบูรณ์','Featured 7 วัน','฿80','บัตรเครดิต','refunded','10:05'],
              ['TXN-8997','ก้องภพ วิชญ์','Boost pack 300','฿79','LINE Pay','success','09:37'],
            ].map((r,i)=>(
              <tr key={i}>
                <td className="ad-mono" style={{fontWeight:600}}>{r[0]}</td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td className="ad-mono">{r[3]}</td>
                <td>{r[4]}</td>
                <td><span className={'ad-status-tag '+r[5]}>{r[5]==='success'?'สำเร็จ':'คืนเงิน'}</span></td>
                <td className="ad-mono" style={{color:'var(--ink-3)'}}>{r[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Command Palette ----------
function CommandPalette({ onClose, onNav }){
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const cmds = [
    {g:'คำสั่งด่วน', items:[
      {id:'nav-queue', ic:I.queue, main:'ไปที่ Queue', sub:'g q', act:()=>onNav('queue')},
      {id:'nav-users', ic:I.users, main:'ไปที่ ผู้ใช้', sub:'g u', act:()=>onNav('users')},
      {id:'nav-listings', ic:I.listings, main:'ไปที่ ประกาศ', sub:'g l', act:()=>onNav('listings')},
      {id:'nav-finance', ic:I.finance, main:'ไปที่ การเงิน', sub:'g f', act:()=>onNav('finance')},
    ]},
    {g:'ผู้ใช้', items: ADMIN_DATA.users.slice(0,4).map(u=>({
      id:u.id, ic:<span style={{fontSize:10,fontWeight:700}}>{u.avatar}</span>,
      main:u.name, sub:`${u.id} · ${u.email}`, act:()=>onNav('users')
    }))},
    {g:'ประกาศ', items: ADMIN_DATA.listings.slice(0,3).map(l=>({
      id:l.id, ic:I.listings,
      main:l.product, sub:`${l.id} · ฿${l.price.toLocaleString()}`, act:()=>onNav('listings')
    }))},
  ];

  // filter
  const filtered = q ? cmds.map(g=>({...g, items:g.items.filter(it=>it.main.toLowerCase().includes(q.toLowerCase())||it.sub.toLowerCase().includes(q.toLowerCase()))})).filter(g=>g.items.length>0) : cmds;
  const flat = filtered.flatMap(g=>g.items);

  useEffect(()=>{
    const onKey = e=>{
      if(e.key==='ArrowDown'){e.preventDefault();setIdx(i=>Math.min(flat.length-1,i+1));}
      else if(e.key==='ArrowUp'){e.preventDefault();setIdx(i=>Math.max(0,i-1));}
      else if(e.key==='Enter'){e.preventDefault();flat[idx]?.act?.();}
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[flat,idx]);

  return (
    <div className="ad-cmdk-bd" onClick={onClose}>
      <div className="ad-cmdk-box" onClick={e=>e.stopPropagation()}>
        <div className="ad-cmdk-inp">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input autoFocus placeholder="ค้นหา ผู้ใช้ / ประกาศ / เคส หรือพิมพ์คำสั่ง..." value={q} onChange={e=>{setQ(e.target.value);setIdx(0);}}/>
          <kbd>ESC</kbd>
        </div>
        <div className="ad-cmdk-list">
          {filtered.length===0 && <div style={{padding:'24px',textAlign:'center',color:'var(--ink-3)',fontSize:13}}>ไม่พบผลลัพธ์</div>}
          {filtered.map(g=>(
            <div key={g.g}>
              <div className="ad-cmdk-group-lbl">{g.g}</div>
              {g.items.map((it,i)=>{
                const globalIdx = flat.indexOf(it);
                return (
                  <div key={it.id} className={'ad-cmdk-item '+(globalIdx===idx?'on':'')} onClick={it.act} onMouseEnter={()=>setIdx(globalIdx)}>
                    <span className="ic">{it.ic}</span>
                    <div className="main">
                      <div>{it.main}</div>
                      <div className="sub">{it.sub}</div>
                    </div>
                    <span className="arr">↵</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Activity drawer ----------
function ActivityDrawer({ onClose }){
  const acts = [
    {kind:'neg', b:'มานพ กิตติ', t:'รายงานประกาศ', meta:'iPhone ปลอม #L-2421', time:'2 นาที'},
    {kind:'acc', b:'G-Shop', t:'เปิด Boost 3 ประกาศ', meta:'จ่าย ฿149', time:'5 นาที'},
    {kind:'pos', b:'แอดมินเอก', t:'ปิดเคส', meta:'#C-00184 คืน 50%', time:'10 นาที'},
    {kind:'warn', b:'สมศรี ทองดี', t:'สมัครสมาชิกใหม่', meta:'somsri@mail.com', time:'15 นาที'},
    {kind:'neg', b:'ระบบ', t:'ตรวจพบคำต้องห้าม', meta:'ใน 3 ประกาศ', time:'28 นาที'},
    {kind:'pos', b:'TXN-9001', t:'ชำระเงินสำเร็จ', meta:'฿149 Boost', time:'35 นาที'},
    {kind:'acc', b:'จันทรา ส.', t:'อัพเดทโปรไฟล์', meta:'เปลี่ยนเบอร์โทร', time:'1 ชม.'},
    {kind:'neg', b:'U-1005', t:'ถูกระงับบัญชี', meta:'ขายของปลอมซ้ำ', time:'2 ชม.'},
  ];
  return (
    <>
      <div style={{position:'fixed',inset:0,zIndex:199}} onClick={onClose}/>
      <div className="ad-act-drawer">
        <div className="ad-panel-head" style={{flexShrink:0}}>
          <h3>Activity</h3>
          <span className="sub">Live feed</span>
          <div className="right">
            <button className="ad-icon-btn" onClick={onClose}>{I.x}</button>
          </div>
        </div>
        <ul className="ad-activity" style={{overflowY:'auto'}}>
          {acts.map((a,i)=>(
            <li key={i}>
              <span className={'ad-activity-ic '+a.kind}>
                {a.kind==='pos'?I.check:a.kind==='neg'?I.warn:a.kind==='acc'?I.star:I.users}
              </span>
              <div className="ad-activity-main">
                <b>{a.b}</b> {a.t} <span style={{color:'var(--ink-3)'}}>— {a.meta}</span>
              </div>
              <span className="ad-activity-time">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
