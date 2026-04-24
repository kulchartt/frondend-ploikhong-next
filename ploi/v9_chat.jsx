// ===== V9 Chat: FB Marketplace Messenger-style inbox =====
const CHAT_THREADS = [
  {
    id:'t1', productIdx:0, with:'TechBKK', ava:'TB', online:true, unread:2, pinned:true,
    lastTime:'2 นาที', archived:false,
    msgs:[
      { from:'them', text:'สวัสดีครับ สนใจ iPhone 14 Pro ใช่ไหมครับ?', time:'14:02' },
      { from:'me',   text:'ครับ สนใจมากครับ เครื่องนี้ยังมีอยู่ไหม?',  time:'14:03' },
      { from:'them', text:'ยังมีอยู่ครับ ประกันเหลือ 4 เดือนเต็ม',       time:'14:05' },
      { from:'me',   text:'ลดได้ไหมครับ เหลือ 23,500 ได้ไหม?',          time:'14:06' },
      { from:'them', text:'ไม่ได้จริงๆครับ ราคาดีสุดแล้ว',              time:'14:08' },
      { from:'them', text:'สะดวกนัดรับที่ BTS พระราม 9 ได้ไหมครับ?',    time:'14:08', preset:true },
      { from:'me',   text:'ได้ครับ เสาร์นี้ว่างช่วงบ่ายไหม?',            time:'14:12' },
      { from:'them', text:'ว่างครับ บ่าย 2 ที่ BTS พระราม 9 ทางออก 2',   time:'14:15' },
      { from:'them', img:true,                                              time:'14:16' },
    ],
  },
  {
    id:'t2', productIdx:5, with:'KickSpot', ava:'KS', online:false, unread:1, pinned:false,
    lastTime:'1 ชม.', archived:false,
    msgs:[
      { from:'them', text:'รองเท้า AJ1 ไซส์ 9 ยังมีครับ',          time:'13:10' },
      { from:'me',   text:'เคยลองหรือยังครับ?',                     time:'13:15' },
      { from:'them', text:'ยังไม่เคยเลยครับ ใหม่ในกล่อง sticker ติด',time:'13:20' },
    ],
  },
  {
    id:'t3', productIdx:3, with:'GameLoop', ava:'GL', online:true, unread:0, pinned:false,
    lastTime:'3 ชม.', archived:false,
    msgs:[
      { from:'me',   text:'ยังมีอยู่ไหมครับ?',       time:'11:30' },
      { from:'them', text:'ครับ ยังมีอยู่ครับ',       time:'11:45' },
      { from:'me',   text:'ส่งไปรษณีย์ได้ไหมครับ?', time:'11:50' },
    ],
  },
  {
    id:'t4', productIdx:8, with:'VeloCafe', ava:'VC', online:false, unread:0, pinned:false,
    lastTime:'วานนี้', archived:false,
    msgs:[
      { from:'them', text:'ขอบคุณที่สนใจครับ',          time:'อังคาร 18:42' },
      { from:'me',   text:'สบายๆครับ ขอบคุณเช่นกัน',   time:'อังคาร 18:45' },
    ],
  },
  {
    id:'t5', productIdx:1, with:'HomeOffice.th', ava:'HO', online:true, unread:0, pinned:false,
    lastTime:'วานนี้', archived:false,
    msgs:[
      { from:'them', text:'เก้าอี้ Aeron ยังมีครับ รูปเพิ่มส่งให้ได้', time:'วานนี้ 16:20' },
      { from:'me',   text:'ดีมากครับ รบกวนด้วยครับ',                  time:'วานนี้ 16:22' },
      { from:'them', img:true,                                             time:'วานนี้ 16:30' },
      { from:'them', text:'สภาพเรียบร้อยครับ',                            time:'วานนี้ 16:30' },
    ],
  },
  {
    id:'t6', productIdx:2, with:'BrickHouse', ava:'BH', online:false, unread:0, pinned:false,
    lastTime:'3 วัน',
    msgs:[
      { from:'them', text:'Lego Mars Rover ส่งแล้วครับ track: EJ123456789TH', time:'จันทร์' },
      { from:'me',   text:'ได้รับแล้วครับ ขอบคุณมากๆ',                        time:'จันทร์' },
    ],
  },
  {
    id:'t7', productIdx:9, with:'AppleGuy', ava:'AG', online:false, unread:0, pinned:false,
    lastTime:'1 สัปดาห์',
    msgs:[
      { from:'me', text:'MacBook Pro M2 ยังมีไหมครับ?',   time:'10/04' },
      { from:'them', text:'ขายไปแล้วครับ ขอโทษด้วย',      time:'10/04' },
    ],
  },
];

const QUICK_REPLIES = [
  'สวัสดีครับ ยังมีสินค้านี้อยู่ไหม?',
  'ราคาต่อรองได้ไหมครับ?',
  'ส่งไปรษณีย์ได้ไหมครับ?',
  'ขอดูรูปเพิ่มเติมได้ไหมครับ?',
  'นัดรับได้ที่ไหนบ้าง?',
];

function V9Chat({ onClose, initialThreadId=null }) {
  const [threads, setThreads] = useState(CHAT_THREADS);
  const [activeId, setActiveId] = useState(initialThreadId || CHAT_THREADS[0].id);
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread | pinned
  const bodyRef = useRef(null);

  const { PRODUCTS, IMG_TINTS } = window.PLOI_DATA;

  const active = threads.find(t=>t.id===activeId) || threads[0];
  const activeProduct = PRODUCTS[active.productIdx];

  useEffect(()=>{
    // mark read when opening
    setThreads(ts => ts.map(t => t.id===activeId ? {...t, unread:0} : t));
  },[activeId]);

  useEffect(()=>{
    if(bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  },[activeId, active.msgs.length]);

  const filtered = threads.filter(t=>{
    if(filter==='unread' && t.unread===0) return false;
    if(filter==='pinned' && !t.pinned) return false;
    if(q && !(t.with.toLowerCase().includes(q.toLowerCase()) ||
             PRODUCTS[t.productIdx]?.title.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  function send(text){
    if(!text.trim()) return;
    setThreads(ts => ts.map(t => t.id===active.id
      ? {...t, lastTime:'ตอนนี้', msgs:[...t.msgs, {from:'me', text, time:'เดี๋ยวนี้'}]}
      : t
    ));
    setDraft('');
    // simulated reply
    setTimeout(()=>{
      setThreads(ts => ts.map(t => t.id===active.id
        ? {...t, lastTime:'ตอนนี้', msgs:[...t.msgs, {from:'them', text:'รับทราบครับ เดี๋ยวตอบรายละเอียดให้นะครับ', time:'เดี๋ยวนี้'}]}
        : t
      ));
    }, 1400);
  }

  return (
    <div className="ch-overlay">
      <div className="ch">
        {/* ===== LEFT: Thread list ===== */}
        <aside className="ch-list">
          <div className="ch-list-top">
            <button className="ch-back" onClick={onClose} aria-label="กลับ">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h1>แชท</h1>
            <button className="ch-iconbtn" title="แชทใหม่">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 10v4M10 12h4"/></svg>
            </button>
          </div>
          <div className="ch-search">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="ค้นหาในข้อความ"/>
          </div>
          <div className="ch-tabs">
            <button className={filter==='all'?'on':''}    onClick={()=>setFilter('all')}>ทั้งหมด</button>
            <button className={filter==='unread'?'on':''} onClick={()=>setFilter('unread')}>ยังไม่อ่าน</button>
            <button className={filter==='pinned'?'on':''} onClick={()=>setFilter('pinned')}>ปักหมุด</button>
          </div>
          <div className="ch-threads">
            {filtered.map(t=>{
              const p = PRODUCTS[t.productIdx];
              const tint = p ? IMG_TINTS[(p.img-1)%12] : ['#eee','#ccc'];
              const last = t.msgs[t.msgs.length-1];
              const lastText = last?.img ? '📷 รูปภาพ' : (last?.text || '');
              return (
                <button key={t.id} className={'ch-th'+(t.id===active.id?' on':'')+(t.unread>0?' unread':'')} onClick={()=>setActiveId(t.id)}>
                  <div className="ch-th-ava">
                    <div className="ch-ava" style={{background:`linear-gradient(135deg,${tint[0]},${tint[1]})`}}>{t.ava}</div>
                    {t.online && <span className="ch-online"/>}
                  </div>
                  <div className="ch-th-body">
                    <div className="ch-th-top">
                      <span className="ch-th-name">{t.with}</span>
                      <span className="ch-th-time">{t.lastTime}</span>
                    </div>
                    <div className="ch-th-mid">{p?.title}</div>
                    <div className="ch-th-last">
                      {last?.from==='me' && <span className="ch-you">คุณ: </span>}
                      {lastText}
                    </div>
                  </div>
                  {t.unread>0 && <span className="ch-unread-dot">{t.unread}</span>}
                  {t.pinned && <span className="ch-pin" title="ปักหมุด">📌</span>}
                </button>
              );
            })}
            {filtered.length===0 && (
              <div className="ch-empty-list">ไม่พบข้อความในตัวกรองนี้</div>
            )}
          </div>
        </aside>

        {/* ===== MIDDLE: Active conversation ===== */}
        <section className="ch-conv">
          <header className="ch-conv-h">
            <div className="ch-ava sm" style={{background:`linear-gradient(135deg,${IMG_TINTS[(activeProduct.img-1)%12][0]},${IMG_TINTS[(activeProduct.img-1)%12][1]})`}}>{active.ava}</div>
            <div className="ch-conv-who">
              <h2>{active.with}</h2>
              <p>{active.online ? 'ออนไลน์อยู่' : 'ไม่ออนไลน์'}</p>
            </div>
            <div className="ch-conv-actions">
              <button className="ch-iconbtn" title="โทร"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.8 2z"/></svg></button>
              <button className="ch-iconbtn" title="วิดีโอคอล"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5zM1 5h14v14H1z"/></svg></button>
              <button className="ch-iconbtn" title="ข้อมูล"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></button>
            </div>
          </header>

          {/* Product pill */}
          <div className="ch-prod-pill" onClick={()=>window.__openProduct && window.__openProduct(activeProduct)}>
            <div className="ch-prod-ph" style={{background:`linear-gradient(135deg,${IMG_TINTS[(activeProduct.img-1)%12][0]},${IMG_TINTS[(activeProduct.img-1)%12][1]})`}}/>
            <div className="ch-prod-body">
              <div className="ch-prod-t">{activeProduct.title}</div>
              <div className="ch-prod-p">฿{activeProduct.price.toLocaleString()} {activeProduct.was && <s>฿{activeProduct.was.toLocaleString()}</s>} · {activeProduct.cond}</div>
            </div>
            <button className="ch-prod-view" onClick={e=>{e.stopPropagation(); window.__openProduct && window.__openProduct(activeProduct);}}>ดูสินค้า</button>
          </div>

          {/* Messages */}
          <div className="ch-body" ref={bodyRef}>
            <div className="ch-daymark">วันนี้</div>
            {active.msgs.map((m,i)=>{
              const prev = active.msgs[i-1];
              const grouped = prev && prev.from===m.from;
              return (
                <div key={i} className={'ch-msg '+m.from+(grouped?' grouped':'')}>
                  {!grouped && m.from==='them' && <div className="ch-msg-ava">{active.ava}</div>}
                  {grouped && m.from==='them' && <div className="ch-msg-ava placeholder"/>}
                  <div className="ch-msg-col">
                    {m.img ? (
                      <div className="ch-msg-img" style={{background:`linear-gradient(135deg,${IMG_TINTS[(activeProduct.img-1)%12][0]},${IMG_TINTS[(activeProduct.img-1)%12][1]})`}}/>
                    ) : (
                      <div className="ch-msg-b">{m.text}</div>
                    )}
                    <span className="ch-msg-t">{m.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick replies */}
          <div className="ch-quick">
            {QUICK_REPLIES.map((q,i)=>(
              <button key={i} onClick={()=>send(q)}>{q}</button>
            ))}
          </div>

          {/* Composer */}
          <div className="ch-comp">
            <button className="ch-iconbtn" title="แนบรูป"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m3 17 5-5 6 6 4-4 3 3"/></svg></button>
            <button className="ch-iconbtn" title="อิโมจิ"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg></button>
            <button className="ch-iconbtn" title="GIF"><span style={{fontSize:10,fontWeight:800,letterSpacing:0}}>GIF</span></button>
            <input
              className="ch-comp-inp"
              value={draft}
              onChange={e=>setDraft(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(draft);} }}
              placeholder="พิมพ์ข้อความ…"
            />
            {draft.trim() ? (
              <button className="ch-send" onClick={()=>send(draft)} aria-label="ส่ง">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>
              </button>
            ) : (
              <button className="ch-iconbtn" title="ไลค์"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2 10h3v11H2zm19.8 2.2-1-1A2 2 0 0 0 19.4 11H14l1-4.5a1.5 1.5 0 0 0-2.8-.9L7 11v10h12a2 2 0 0 0 2-1.5l1-6a2 2 0 0 0-.2-1.3z"/></svg></button>
            )}
          </div>
        </section>

        {/* ===== RIGHT: Product / seller info sidebar ===== */}
        <aside className="ch-info">
          <div className="ch-info-hero">
            <div className="ch-info-ava" style={{background:`linear-gradient(135deg,${IMG_TINTS[(activeProduct.img-1)%12][0]},${IMG_TINTS[(activeProduct.img-1)%12][1]})`}}>{active.ava}</div>
            <h3>{active.with}</h3>
            <div className="ch-info-rate">★ 4.8 <span>(156 รีวิว)</span></div>
            <div className="ch-info-bio">สมาชิกตั้งแต่ 2564 · ตอบเร็วใน 15 นาที</div>
          </div>

          <div className="ch-info-section">
            <h4>สินค้าที่คุยกันอยู่</h4>
            <div className="ch-info-prod" onClick={()=>window.__openProduct && window.__openProduct(activeProduct)}>
              <div className="ch-info-prod-ph" style={{background:`linear-gradient(135deg,${IMG_TINTS[(activeProduct.img-1)%12][0]},${IMG_TINTS[(activeProduct.img-1)%12][1]})`}}/>
              <div className="ch-info-prod-t">{activeProduct.title}</div>
              <div className="ch-info-prod-p">฿{activeProduct.price.toLocaleString()}</div>
              <div className="ch-info-prod-m">{activeProduct.loc} · {activeProduct.cond}</div>
            </div>
          </div>

          <div className="ch-info-section">
            <h4>การดำเนินการ</h4>
            <button className="ch-act"><span>📎</span> ไฟล์ที่แชร์</button>
            <button className="ch-act"><span>🔕</span> ปิดการแจ้งเตือน</button>
            <button className="ch-act"><span>📌</span> ปักหมุดข้อความนี้</button>
            <button className="ch-act"><span>📦</span> ทำเครื่องหมายว่าขายแล้ว</button>
            <button className="ch-act danger"><span>🚫</span> บล็อก & รายงาน</button>
          </div>

          <div className="ch-info-section">
            <h4>สินค้าอื่นจากผู้ขาย</h4>
            {PRODUCTS.slice(0,3).filter(p=>p.id!==activeProduct.id).slice(0,3).map(p=>{
              const tint = IMG_TINTS[(p.img-1)%12];
              return (
                <div key={p.id} className="ch-info-more" onClick={()=>window.__openProduct && window.__openProduct(p)}>
                  <div className="ch-info-more-ph" style={{background:`linear-gradient(135deg,${tint[0]},${tint[1]})`}}/>
                  <div>
                    <div className="ch-info-more-t">{p.title}</div>
                    <div className="ch-info-more-p">฿{p.price.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

window.V9Chat = V9Chat;
