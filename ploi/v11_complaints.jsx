// ===== V11: Complaints — Redesign =====
// Detail-focused 3-col: narrow list (280px) · rich detail center · context sidebar (320px)
// Adds: SLA countdown · Progress tracker · Evidence gallery · Sticky compose bar
// Compose + Lightbox components kept below.

const COMPLAINTS_FULL = [
  {
    id:188, subj:'สินค้าไม่ตรงปก — iPhone 13 Pro', buyer:'สมศรี ทองดี', seller:'บอส มาร์เก็ต',
    sellerTrust:4.8, sellerSales:1284, status:'investigating', priority:'high', updated:'2 ชม.ที่แล้ว',
    last:'ส่งรูปสินค้าจริงแล้วค่ะ', unread:true,
    product:'iPhone 13 Pro 256GB', productImg:'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=200&auto=format&fit=crop&q=60',
    amount:18500, shipping:'Kerry — ส่งฟรี',
    orderId:'O-9001',
    openedAt:'15 ต.ค. 2025 09:15', openedRel:'2 วันก่อน',
    slaDeadline:'17 ต.ค. 2025 18:00',
    slaRemainingHours:18,
    category:'สินค้าไม่ตรงปก',
    reason:'สินค้าที่ได้รับมีรอยขีดข่วนเยอะกว่าที่ผู้ขายแจ้ง และรุ่นที่ระบุในประกาศเป็น 256GB แต่กล่องจริงเป็น 128GB ต้องการคืนเงินเต็มจำนวน',
    handler:{name:'เอก ศรีประเสริฐ', avatar:'อ', role:'Senior Admin'},
    evidence:[
      {type:'image', src:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=60', cap:'กล่องด้านหลังระบุ 128GB', by:'คุณ', at:'2 ชม.ก่อน'},
      {type:'image', src:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=60', cap:'รอยขีดข่วนด้านหลัง', by:'คุณ', at:'2 ชม.ก่อน'},
      {type:'image', src:'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&auto=format&fit=crop&q=60', cap:'ใบเสร็จจากผู้ขาย', by:'คุณ', at:'3 ชม.ก่อน'},
      {type:'image', src:'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=60', cap:'หน้าประกาศเดิม (screenshot)', by:'คุณ', at:'เมื่อวาน'},
    ],
    timeline:[
      {at:'วันนี้ 14:22', actor:'คุณ', act:'อัพโหลดรูปสินค้าจริง 3 รูป', type:'user'},
      {at:'เมื่อวาน 18:00', actor:'เอก (แอดมิน)', act:'ขอเอกสารเพิ่มเติม — ใบเสร็จและรูปกล่อง', type:'admin'},
      {at:'เมื่อวาน 14:30', actor:'บอส มาร์เก็ต', act:'ตอบกลับว่าสินค้าตรงตามที่ลงประกาศ', type:'seller'},
      {at:'เมื่อวาน 10:12', actor:'เอก (แอดมิน)', act:'รับเคส เริ่มตรวจสอบ', type:'admin'},
      {at:'2 วันก่อน 09:15', actor:'คุณ', act:'เปิดเคสร้องเรียน', type:'user'},
    ],
    messages:[
      {who:'admin', name:'เอก (แอดมิน)', at:'2 ชม.ก่อน', text:'ขอบคุณสำหรับรูปนะครับ กำลังประสานผู้ขายให้ — คาดว่าจะได้คำตอบภายใน 24 ชม.'},
      {who:'me', name:'คุณ', at:'3 ชม.ก่อน', text:'แนบรูปสินค้ามาแล้วค่ะ ขอให้ช่วยประสานด้วย รบกวนดูใบเสร็จที่แนบด้วยนะคะ'},
      {who:'admin', name:'เอก (แอดมิน)', at:'เมื่อวาน 18:00', text:'รบกวนขอรูปกล่องด้านหลังที่ระบุความจุ และใบเสร็จตอนซื้อด้วยครับ'},
    ],
    progress:2, // 0=submitted 1=review 2=investigating 3=resolved
    related:[
      {id:184, subj:'สินค้าปลอม — กระเป๋า LV', status:'investigating'},
      {id:176, subj:'สินค้าไม่ตรงปก — Samsung Galaxy', status:'resolved', verdict:'คืนเงิน 100%'},
    ],
  },
  {id:187, subj:'ไม่ได้รับพัสดุ — Macbook Air M1', buyer:'มานพ กิตติ', seller:'G-Shop', sellerTrust:4.9, sellerSales:2103, status:'pending', priority:'mid', updated:'เมื่อวาน', last:'รอคำตอบจากแอดมิน', unread:false, product:'Macbook Air M1', productImg:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=60', amount:25900, shipping:'Kerry — ส่งฟรี', orderId:'O-8945', openedAt:'14 ต.ค. 2025', openedRel:'3 วันก่อน', slaRemainingHours:42, category:'ไม่ได้รับสินค้า', handler:null, progress:1, timeline:[{at:'3 วันก่อน', actor:'คุณ', act:'เปิดเคส', type:'user'}]},
  {id:186, subj:'สินค้าชำรุด — โคมไฟโมเดิร์น', buyer:'นิดา ภิรมย์', seller:'DecoHome', sellerTrust:4.6, sellerSales:524, status:'investigating', priority:'mid', updated:'6 ชม.ที่แล้ว', last:'ผู้ขายเสนอซ่อม', unread:false, product:'โคมไฟ pendant', amount:2800, openedAt:'13 ต.ค. 2025', openedRel:'4 วันก่อน', slaRemainingHours:12, category:'สินค้าชำรุด', progress:2},
  {id:185, subj:'ผู้ขายไม่ตอบ — AirPods Pro', buyer:'จันทรา สมบูรณ์', seller:'เก่งเทค', sellerTrust:4.3, sellerSales:89, status:'resolved', priority:'low', updated:'3 วันที่แล้ว', last:'ตกลงคืนเงิน 50%', unread:false, amount:5500, openedAt:'12 ต.ค. 2025', openedRel:'5 วันก่อน', verdict:'คืนเงิน 50% (฿2,750)', category:'ผู้ขายไม่ตอบ', progress:3},
  {id:184, subj:'สินค้าปลอม — กระเป๋า LV', buyer:'ก้องภพ วิชญ์', seller:'BrandShop', sellerTrust:4.1, sellerSales:312, status:'investigating', priority:'high', updated:'5 ชม.ที่แล้ว', last:'ขอใบเสร็จจากผู้ขาย', unread:true, amount:12000, openedAt:'15 ต.ค. 2025', openedRel:'2 วันก่อน', slaRemainingHours:6, category:'สินค้าปลอม', progress:2},
  {id:182, subj:'ขอคืนเงิน — รองเท้า Nike', buyer:'อัครชัย ธนา', seller:'SneakerHub', sellerTrust:4.7, sellerSales:876, status:'rejected', priority:'low', updated:'1 สัปดาห์ที่แล้ว', last:'ไม่เข้าเงื่อนไขการคืน', unread:false, amount:3900, openedAt:'8 ต.ค. 2025', openedRel:'1 สัปดาห์ก่อน', verdict:'ปฏิเสธ — ไม่เข้าเงื่อนไขคืนเงิน', category:'อื่นๆ', progress:3},
];

const STATUS_META = {
  pending:     {l:'รอตรวจสอบ',      color:'#f59e0b', icon:'⏳'},
  investigating:{l:'กำลังตรวจสอบ',  color:'#3b82f6', icon:'🔍'},
  resolved:    {l:'แก้ไขแล้ว',      color:'#10b981', icon:'✓'},
  rejected:    {l:'ปฏิเสธ',         color:'#94a3b8', icon:'✕'},
};

const PROGRESS_STEPS = ['ส่งเรื่อง', 'รอตรวจสอบ', 'กำลังตรวจสอบ', 'ปิดเคส'];

function V11Complaints({ onClose }) {
  const [active, setActive] = useState(COMPLAINTS_FULL[0]);
  const [tab, setTab] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [evidenceIdx, setEvidenceIdx] = useState(null);
  const [search, setSearch] = useState('');

  const counts = useMemo(()=>({
    all: COMPLAINTS_FULL.length,
    pending: COMPLAINTS_FULL.filter(c=>c.status==='pending').length,
    investigating: COMPLAINTS_FULL.filter(c=>c.status==='investigating').length,
    resolved: COMPLAINTS_FULL.filter(c=>c.status==='resolved').length,
    rejected: COMPLAINTS_FULL.filter(c=>c.status==='rejected').length,
  }), []);

  const filtered = useMemo(()=>{
    let list = tab==='all' ? COMPLAINTS_FULL : COMPLAINTS_FULL.filter(c=>c.status===tab);
    if(search) list = list.filter(c => c.subj.toLowerCase().includes(search.toLowerCase()) || String(c.id).includes(search));
    return list;
  }, [tab, search]);

  return (
    <div className="cx-overlay">
      {/* Top bar */}
      <header className="cx-top">
        <button className="cx-back" onClick={onClose} aria-label="ปิด">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="cx-top-crumbs">
          <span className="cx-crumb-home">หน้าหลัก</span>
          <span className="cx-crumb-sep">/</span>
          <span>ร้องเรียนของฉัน</span>
        </div>
        <div className="cx-top-stats">
          <span className="cx-stat"><b>{counts.investigating + counts.pending}</b> กำลังดำเนินการ</span>
          <span className="cx-stat-sep"/>
          <span className="cx-stat"><b>{counts.resolved}</b> ปิดแล้ว</span>
        </div>
        <button className="cx-help">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
          คู่มือ
        </button>
        <button className="cx-new" onClick={()=>setComposeOpen(true)}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          แจ้งเรื่องใหม่
        </button>
      </header>

      <div className="cx">
        {/* Left: list */}
        <aside className="cx-list">
          <div className="cx-search">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="ค้นหาเคส..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>

          <div className="cx-filters">
            {[
              ['all','ทั้งหมด',counts.all],
              ['investigating','กำลังตรวจ',counts.investigating],
              ['pending','รอตรวจ',counts.pending],
              ['resolved','ปิดแล้ว',counts.resolved],
              ['rejected','ปฏิเสธ',counts.rejected],
            ].map(([k,l,n])=>(
              <button key={k} className={'cx-filter'+(tab===k?' on':'')} onClick={()=>setTab(k)}>
                {l}<span>{n}</span>
              </button>
            ))}
          </div>

          <div className="cx-items">
            {filtered.length===0 && (
              <div className="cx-empty">ไม่พบเคสที่ตรงกับคำค้น</div>
            )}
            {filtered.map(c=>{
              const s = STATUS_META[c.status];
              return (
                <button key={c.id} className={'cx-item'+(active.id===c.id?' on':'')} onClick={()=>setActive(c)}>
                  <div className="cx-item-row1">
                    <span className="cx-item-id">#{c.id}</span>
                    <span className="cx-item-dot" style={{background:s.color}}/>
                    <span className="cx-item-status">{s.l}</span>
                    {c.priority==='high' && <span className="cx-item-prio">!</span>}
                    {c.unread && <span className="cx-item-unread"/>}
                  </div>
                  <div className="cx-item-subj">{c.subj}</div>
                  <div className="cx-item-last">{c.last}</div>
                  <div className="cx-item-foot">
                    <span>{c.updated}</span>
                    {c.slaRemainingHours!==undefined && c.status!=='resolved' && c.status!=='rejected' && (
                      <span className={'cx-item-sla'+(c.slaRemainingHours<=12?' urgent':'')}>
                        ⏱ {c.slaRemainingHours}ชม.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: detail */}
        <main className="cx-main">
          <CaseDetail key={active.id} c={active} onEvidence={setEvidenceIdx}/>
        </main>

        {/* Right: context sidebar */}
        <aside className="cx-side">
          <CaseSidebar c={active}/>
        </aside>
      </div>

      {composeOpen && <ComplaintCompose onClose={()=>setComposeOpen(false)}/>}
      {evidenceIdx!==null && active.evidence && (
        <EvidenceLightbox items={active.evidence} idx={evidenceIdx} onIdx={setEvidenceIdx} onClose={()=>setEvidenceIdx(null)}/>
      )}
    </div>
  );
}
window.V11Complaints = V11Complaints;

// ==================== Case Detail ====================
function CaseDetail({ c, onEvidence }) {
  const [reply, setReply] = useState('');
  const s = STATUS_META[c.status];
  const progress = c.progress ?? 0;
  const isClosed = c.status==='resolved' || c.status==='rejected';

  return (
    <div className="cx-detail">
      {/* Hero */}
      <div className="cx-hero">
        <div className="cx-hero-head">
          <div>
            <div className="cx-hero-meta">
              <span className="cx-hero-id">#{String(c.id).padStart(6,'0')}</span>
              <span className="cx-hero-cat">{c.category}</span>
              <span className="cx-hero-dot"/>
              <span>เปิดเมื่อ {c.openedAt}</span>
            </div>
            <h1 className="cx-hero-title">{c.subj}</h1>
          </div>
          <div className="cx-hero-status" style={{'--sc':s.color}}>
            <span className="cx-hero-ic">{s.icon}</span>
            <div>
              <small>สถานะ</small>
              <b>{s.l}</b>
            </div>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="cx-progress">
          {PROGRESS_STEPS.map((l,i)=>{
            const done = i<=progress;
            const active = i===progress && !isClosed;
            return (
              <div key={l} className={'cx-prog-step'+(done?' done':'')+(active?' active':'')}>
                <span className="cx-prog-dot">{done ? (i===progress&&!isClosed ? (i+1) : '✓') : i+1}</span>
                <span className="cx-prog-label">{l}</span>
                {i<PROGRESS_STEPS.length-1 && <span className="cx-prog-line"/>}
              </div>
            );
          })}
        </div>

        {/* SLA banner */}
        {!isClosed && c.slaRemainingHours!==undefined && (
          <div className={'cx-sla'+(c.slaRemainingHours<=12?' urgent':'')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>
              แอดมินจะตอบภายใน <b>{c.slaRemainingHours} ชม.</b>
              {c.slaDeadline && <em> · deadline {c.slaDeadline}</em>}
            </span>
          </div>
        )}

        {isClosed && c.verdict && (
          <div className="cx-verdict">
            <b>ผลการตัดสิน:</b> {c.verdict}
          </div>
        )}
      </div>

      {/* Order snapshot */}
      <section className="cx-sec">
        <h3 className="cx-sec-h">คำสั่งซื้อที่เกี่ยวข้อง</h3>
        <div className="cx-order">
          {c.productImg && <img src={c.productImg} alt=""/>}
          <div className="cx-order-info">
            <div className="cx-order-t">{c.product || '—'}</div>
            <div className="cx-order-s">ผู้ขาย <b>{c.seller}</b> · #{c.orderId || '—'} · {c.shipping || '—'}</div>
          </div>
          <div className="cx-order-amt">
            <small>มูลค่า</small>
            <b>฿{(c.amount||0).toLocaleString()}</b>
          </div>
          <button className="cx-btn-out">ดูประกาศ →</button>
        </div>
      </section>

      {/* Description */}
      {c.reason && (
        <section className="cx-sec">
          <h3 className="cx-sec-h">รายละเอียดที่แจ้ง</h3>
          <div className="cx-reason">{c.reason}</div>
        </section>
      )}

      {/* Evidence gallery */}
      {c.evidence && c.evidence.length>0 && (
        <section className="cx-sec">
          <div className="cx-sec-h-row">
            <h3 className="cx-sec-h">หลักฐาน <span className="cx-sec-n">{c.evidence.length}</span></h3>
            <button className="cx-btn-out sm">+ เพิ่มหลักฐาน</button>
          </div>
          <div className="cx-gallery">
            {c.evidence.map((e,i)=>(
              <button key={i} className="cx-gal-item" onClick={()=>onEvidence(i)}>
                <div className="cx-gal-img"><img src={e.src} alt={e.cap}/></div>
                <div className="cx-gal-cap">{e.cap}</div>
                <div className="cx-gal-by">{e.by} · {e.at}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Timeline + Messages combined */}
      <section className="cx-sec">
        <h3 className="cx-sec-h">ประวัติและข้อความ</h3>
        <div className="cx-thread">
          {c.messages && c.messages.map((m,i)=>(
            <div key={'m'+i} className={'cx-msg cx-msg-'+m.who}>
              <div className="cx-msg-ava">{m.who==='admin'?'🛡':m.who==='me'?'ฉ':'ผ'}</div>
              <div className="cx-msg-body">
                <div className="cx-msg-who">{m.name}<span>· {m.at}</span></div>
                <div className="cx-msg-bubble">{m.text}</div>
              </div>
            </div>
          ))}
          {c.timeline && c.timeline.map((t,i)=>(
            <div key={'t'+i} className={'cx-event cx-event-'+t.type}>
              <span className="cx-event-dot"/>
              <div className="cx-event-body">
                <b>{t.actor}</b> {t.act}
                <span className="cx-event-at">{t.at}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky compose */}
      {!isClosed && (
        <div className="cx-compose-bar">
          <button className="cx-c-attach" title="แนบไฟล์">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 1 1 5.66 5.66L9.41 17.42a2 2 0 1 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input
            className="cx-c-input"
            placeholder="พิมพ์ข้อความถึงแอดมิน..."
            value={reply}
            onChange={e=>setReply(e.target.value)}
          />
          <button className="cx-c-send" disabled={!reply.trim()}>
            ส่ง
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== Sidebar ====================
function CaseSidebar({ c }) {
  const isClosed = c.status==='resolved' || c.status==='rejected';

  return (
    <div className="cx-sb">
      {/* Handler */}
      {c.handler ? (
        <div className="cx-sb-card">
          <div className="cx-sb-label">แอดมินผู้ดูแล</div>
          <div className="cx-handler">
            <div className="cx-handler-ava">{c.handler.avatar}</div>
            <div>
              <b>{c.handler.name}</b>
              <small>{c.handler.role}</small>
            </div>
          </div>
          <button className="cx-btn-out full">ส่งข้อความส่วนตัว</button>
        </div>
      ) : (
        <div className="cx-sb-card cx-sb-pending">
          <div className="cx-sb-label">แอดมินผู้ดูแล</div>
          <div className="cx-sb-empty">รอการมอบหมาย — จะได้รับภายใน 24 ชม.</div>
        </div>
      )}

      {/* Seller card */}
      <div className="cx-sb-card">
        <div className="cx-sb-label">ผู้ขาย</div>
        <div className="cx-seller">
          <div className="cx-seller-ava">{(c.seller||'?')[0]}</div>
          <div>
            <b>{c.seller}</b>
            <small>★ {c.sellerTrust} · ขายไปแล้ว {(c.sellerSales||0).toLocaleString()}</small>
          </div>
        </div>
        <div className="cx-seller-actions">
          <button className="cx-btn-out">ดูโปรไฟล์</button>
          <button className="cx-btn-out">แชท</button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="cx-sb-card">
        <div className="cx-sb-label">การจัดการเคส</div>
        <div className="cx-actions">
          {!isClosed && (
            <>
              <button className="cx-action"><span>✓</span> ยอมรับข้อเสนอผู้ขาย</button>
              <button className="cx-action"><span>📎</span> เพิ่มหลักฐาน</button>
              <button className="cx-action"><span>⚖</span> ขอแอดมินตัดสิน</button>
              <button className="cx-action danger"><span>✕</span> ยกเลิกเคส</button>
            </>
          )}
          {isClosed && (
            <>
              <button className="cx-action"><span>★</span> ให้คะแนนการบริการ</button>
              <button className="cx-action"><span>↺</span> เปิดเคสใหม่</button>
            </>
          )}
        </div>
      </div>

      {/* Related cases */}
      {c.related && c.related.length>0 && (
        <div className="cx-sb-card">
          <div className="cx-sb-label">เคสที่คล้ายกัน</div>
          <div className="cx-related">
            {c.related.map(r=>{
              const s = STATUS_META[r.status];
              return (
                <a key={r.id} className="cx-rel">
                  <div className="cx-rel-head">
                    <span className="cx-rel-id">#{r.id}</span>
                    <span className="cx-rel-status" style={{color:s.color}}>{s.l}</span>
                  </div>
                  <div className="cx-rel-subj">{r.subj}</div>
                  {r.verdict && <div className="cx-rel-verdict">{r.verdict}</div>}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Self-help */}
      <div className="cx-sb-card cx-sb-help">
        <div className="cx-sb-label">ต้องการความช่วยเหลือ?</div>
        <ul>
          <li>📖 <a>วิธีการเตรียมหลักฐาน</a></li>
          <li>⚖️ <a>เงื่อนไขการคืนเงิน</a></li>
          <li>💬 <a>คุยกับทีมช่วยเหลือ</a></li>
        </ul>
      </div>
    </div>
  );
}

// ==================== Compose (kept from previous) ====================
function ComplaintCompose({ onClose }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({subj:'', category:'', order:'', reason:'', files:[]});

  const cats = [
    {k:'not-as-desc', l:'สินค้าไม่ตรงปก', ic:'📸'},
    {k:'not-received', l:'ไม่ได้รับสินค้า', ic:'📦'},
    {k:'fake', l:'สินค้าปลอม/เลียนแบบ', ic:'⚠️'},
    {k:'damaged', l:'สินค้าชำรุด', ic:'💥'},
    {k:'seller-no-reply', l:'ผู้ขายไม่ตอบ', ic:'🔇'},
    {k:'other', l:'อื่น ๆ', ic:'📝'},
  ];
  const orders = [
    {id:'O-9001', product:'iPhone 13 Pro 256GB', seller:'บอส มาร์เก็ต', amt:18500, date:'14 ต.ค.'},
    {id:'O-8999', product:'AirPods Pro Gen 2', seller:'เก่งเทค', amt:5500, date:'10 ต.ค.'},
    {id:'O-8997', product:'กระเป๋า Longchamp', seller:'BrandShop', amt:3200, date:'28 ก.ย.'},
  ];
  const canNext = (step===1 && data.category) || (step===2 && data.order) || (step===3 && data.reason.length>=10);

  return (
    <div className="cp-compose-overlay" onClick={onClose}>
      <div className="cp-compose-modal" onClick={e=>e.stopPropagation()}>
        <div className="cp-compose-head">
          <h2>แจ้งเรื่องร้องเรียน</h2>
          <button className="cp-compose-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        </div>
        <div className="cp-steps">
          {['ประเภท','คำสั่งซื้อ','รายละเอียด','หลักฐาน'].map((l,i)=>(
            <div key={l} className={'cp-step'+(i+1===step?' on':'')+(i+1<step?' done':'')}>
              <span className="cp-step-n">{i+1<step?'✓':i+1}</span>
              <span>{l}</span>
            </div>
          ))}
        </div>
        <div className="cp-compose-body">
          {step===1 && (
            <div className="cp-step-body">
              <p className="cp-step-hint">เลือกประเภทปัญหาที่ใกล้เคียงที่สุด</p>
              <div className="cp-cats">
                {cats.map(c=>(
                  <button key={c.k} className={'cp-cat'+(data.category===c.k?' on':'')} onClick={()=>setData({...data, category:c.k, subj:c.l})}>
                    <span className="cp-cat-ic">{c.ic}</span>
                    <span>{c.l}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step===2 && (
            <div className="cp-step-body">
              <p className="cp-step-hint">เลือกคำสั่งซื้อที่ต้องการร้องเรียน</p>
              <div className="cp-orders">
                {orders.map(o=>(
                  <button key={o.id} className={'cp-order'+(data.order===o.id?' on':'')} onClick={()=>setData({...data, order:o.id})}>
                    <div className="cp-order-main">
                      <div className="cp-order-t">{o.product}</div>
                      <div className="cp-order-s">{o.seller} · #{o.id} · {o.date}</div>
                    </div>
                    <div className="cp-order-amt">฿{o.amt.toLocaleString()}</div>
                  </button>
                ))}
              </div>
              <button className="cp-manual">ไม่พบคำสั่งซื้อ — กรอกเอง</button>
            </div>
          )}
          {step===3 && (
            <div className="cp-step-body">
              <p className="cp-step-hint">อธิบายปัญหาให้ละเอียดที่สุด (อย่างน้อย 10 ตัวอักษร)</p>
              <input className="cp-input" placeholder="หัวข้อ" value={data.subj} onChange={e=>setData({...data, subj:e.target.value})}/>
              <textarea className="cp-textarea" rows={8} placeholder="อธิบายสิ่งที่เกิดขึ้น..." value={data.reason} onChange={e=>setData({...data, reason:e.target.value})}/>
              <div className="cp-count">{data.reason.length} / 2000</div>
            </div>
          )}
          {step===4 && (
            <div className="cp-step-body">
              <p className="cp-step-hint">แนบรูปถ่าย ใบเสร็จ หรือหลักฐานอื่นๆ (สูงสุด 10 ไฟล์)</p>
              <div className="cp-drop">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div><b>ลากไฟล์มาวาง</b> หรือคลิกเพื่อเลือก</div>
                <div className="cp-drop-hint">รองรับ JPG, PNG, PDF — ไม่เกิน 10MB ต่อไฟล์</div>
              </div>
              <div className="cp-consent">
                <label><input type="checkbox" defaultChecked/> ยืนยันว่าข้อมูลและหลักฐานที่ให้เป็นความจริง และเข้าใจว่าการแจ้งเท็จอาจถูกระงับบัญชี</label>
              </div>
            </div>
          )}
        </div>
        <div className="cp-compose-foot">
          {step>1 && <button className="btn-ghost" onClick={()=>setStep(step-1)}>ย้อนกลับ</button>}
          <div style={{flex:1}}/>
          {step<4 && <button className="st-primary" disabled={!canNext} onClick={()=>setStep(step+1)}>ถัดไป</button>}
          {step===4 && <button className="st-primary" onClick={onClose}>ส่งเรื่อง</button>}
        </div>
      </div>
    </div>
  );
}

// ==================== Lightbox ====================
function EvidenceLightbox({ items, idx, onIdx, onClose }) {
  return (
    <div className="cp-lb" onClick={onClose}>
      <button className="cp-lb-close" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
      </button>
      {idx>0 && (
        <button className="cp-lb-nav left" onClick={e=>{e.stopPropagation();onIdx(idx-1);}}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      )}
      {idx<items.length-1 && (
        <button className="cp-lb-nav right" onClick={e=>{e.stopPropagation();onIdx(idx+1);}}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      )}
      <div className="cp-lb-body" onClick={e=>e.stopPropagation()}>
        <img src={items[idx].src} alt={items[idx].cap}/>
        <div className="cp-lb-cap">{items[idx].cap} <span>{idx+1} / {items.length}</span></div>
      </div>
    </div>
  );
}
