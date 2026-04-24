// ===== V4: Product Detail (modal overlay, opens from any card) =====
function V4Detail({ product, onClose }) {
  const [idx, setIdx] = useState(0);
  const [msgs, setMsgs] = useState([
    { who:'seller', t:'สวัสดีครับ สินค้ายังว่างนะครับ :)', time:'14:02' },
    { who:'me', t:'สนใจครับ ของอยู่สภาพยังไงบ้าง มีรอยเยอะไหม?', time:'14:03' },
    { who:'seller', t:'สภาพประมาณ 95% ครับ ใช้งานมา 4 เดือน ไม่มีรอยร้าว มีรอยขนแมวเล็กน้อยตรงข้างเครื่อง ขัดออกได้', time:'14:04' },
    { who:'seller', t:'แบตยัง 98% ครับ ประกันศูนย์เหลืออีก 4 เดือน', time:'14:04' },
    { who:'me', t:'โอเคครับ นัดดูของที่ไหนได้บ้าง?', time:'14:06' },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(()=>{ if(endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; }, [msgs, typing]);

  if(!product) return null;

  const imgs = [product.img, ((product.img % 12) + 1), (((product.img+3) % 12) + 1), (((product.img+7) % 12) + 1)];
  const tints = window.PLOI_DATA.IMG_TINTS;

  function send(text){
    if(!text.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setMsgs(m => [...m, { who:'me', t:text, time }]);
    setDraft('');
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMsgs(m => [...m, { who:'seller', t:'เดี๋ยวตอบให้นะครับ ขอเช็คของก่อน', time }]);
    }, 1800);
  }

  const quick = ['ยังว่างไหมครับ?', 'ลดราคาได้ไหม?', 'นัดดูของได้ที่ไหน?', 'ส่งได้ไหม?'];

  return (
    <div className="pdp-overlay" onClick={onClose}>
      <div className="pdp" onClick={e=>e.stopPropagation()}>
        <button className="pdp-close" onClick={onClose} aria-label="ปิด">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        {/* LEFT: gallery */}
        <section className="pdp-gal">
          <div className="pdp-big ph" style={{background:`linear-gradient(135deg,${tints[(imgs[idx]-1)%tints.length][0]},${tints[(imgs[idx]-1)%tints.length][1]})`}}>
            <span className="ph-lbl">IMG {String(imgs[idx]).padStart(2,'0')} · {idx+1}/{imgs.length}</span>
            {idx>0 && <button className="pdp-arr l" onClick={()=>setIdx(idx-1)}>‹</button>}
            {idx<imgs.length-1 && <button className="pdp-arr r" onClick={()=>setIdx(idx+1)}>›</button>}
          </div>
          <div className="pdp-thumbs">
            {imgs.map((im,i)=>(
              <button key={i} className={"pdp-th ph" + (i===idx?' on':'')} onClick={()=>setIdx(i)} style={{background:`linear-gradient(135deg,${tints[(im-1)%tints.length][0]},${tints[(im-1)%tints.length][1]})`}}/>
            ))}
          </div>
        </section>

        {/* RIGHT: details + chat */}
        <section className="pdp-side">
          <div className="pdp-head">
            <div className="pdp-crumb mono">{product.cat.toUpperCase()} · {product.loc} · {product.posted}</div>
            <h1 className="pdp-title">{product.title}</h1>
            <div className="pdp-price mono">{fmt(product.price)}{product.was && <s>{fmt(product.was)}</s>}</div>
            <div className="pdp-tags">
              <span className="tag">{product.cond}</span>
              {product.boost && <span className="tag boost">BOOST</span>}
              {product.flag && <span className="tag accent">{product.flag}</span>}
            </div>
          </div>

          {/* seller strip */}
          <div className="pdp-seller">
            <div className="pdp-av">{product.sellerAva}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="pdp-sname">{product.seller} <span className="pdp-badge">ยืนยันตัวตน</span></div>
              <div className="pdp-smeta mono">4.9 ★ · 342 รีวิว · ตอบภายใน 10 นาที · ออนไลน์อยู่</div>
            </div>
            <button className="btn btn-sm">ดูร้าน</button>
          </div>

          {/* description */}
          <div className="pdp-desc">
            <h3>รายละเอียด</h3>
            <p>เครื่องศูนย์ไทย ใช้งานปกติทุกฟังก์ชัน แบตเตอรี่ 98% ประกันศูนย์เหลืออีก 4 เดือน อุปกรณ์ครบกล่อง (สายชาร์จ เข็มจิ้มซิม คู่มือ) มีรอยขนแมวเล็กน้อยตรงข้างเครื่อง ไม่กระทบการใช้งาน</p>
            <dl className="pdp-spec">
              <div><dt>สภาพ</dt><dd>{product.cond}</dd></div>
              <div><dt>หมวดหมู่</dt><dd>{product.cat}</dd></div>
              <div><dt>พื้นที่</dt><dd>{product.loc}</dd></div>
              <div><dt>วิธีรับของ</dt><dd>นัดรับ · หรือส่งฟรี</dd></div>
              <div><dt>ลงประกาศ</dt><dd>{product.posted}</dd></div>
              <div><dt>ยอดเข้าชม</dt><dd>1,284 ครั้ง · 47 คนถูกใจ</dd></div>
            </dl>
            <div className="pdp-safe">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>
              <span>ซื้อ-ขายกันเอง นัดที่สาธารณะ ตรวจสอบของก่อนจ่ายเงินเสมอ</span>
            </div>
          </div>

          {/* CHAT (main action — no checkout) */}
          <div className="pdp-chat">
            <div className="pdp-chat-h">
              <h3>คุยกับผู้ขาย</h3>
              <span className="mono" style={{fontSize:11,color:'var(--ink-3)'}}>ออนไลน์ · ปลอดภัยกว่าใช้เบอร์โทร</span>
            </div>
            <div className="pdp-chat-body" ref={endRef}>
              <div className="pdp-chat-pin">
                <div className="pin-prod">
                  <div className="pin-img ph" style={{background:`linear-gradient(135deg,${tints[(product.img-1)%tints.length][0]},${tints[(product.img-1)%tints.length][1]})`}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="pin-t">{product.title}</div>
                    <div className="pin-p mono">{fmt(product.price)}</div>
                  </div>
                </div>
                <div className="pin-note mono">เริ่มคุยเกี่ยวกับสินค้านี้</div>
              </div>
              {msgs.map((m,i)=>(
                <div key={i} className={"msg " + m.who}>
                  {m.who==='seller' && <div className="msg-av">{product.sellerAva}</div>}
                  <div className="msg-grp">
                    <div className="msg-b">{m.t}</div>
                    <div className="msg-t mono">{m.time}</div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="msg seller">
                  <div className="msg-av">{product.sellerAva}</div>
                  <div className="msg-grp">
                    <div className="msg-b typing"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="pdp-quick">
              {quick.map(q=>(
                <button key={q} onClick={()=>send(q)}>{q}</button>
              ))}
            </div>

            <form className="pdp-input" onSubmit={e=>{e.preventDefault();send(draft);}}>
              <button type="button" className="pdp-inp-btn" title="แนบรูป">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5-11 11"/></svg>
              </button>
              <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="พิมพ์ข้อความ..."/>
              <button type="submit" className="pdp-send" disabled={!draft.trim()}>ส่ง</button>
            </form>
          </div>

          {/* related */}
          <div className="pdp-related">
            <h3>จากผู้ขายคนนี้</h3>
            <div className="pdp-rel-row">
              {window.PLOI_DATA.PRODUCTS.filter(x=>x.id!==product.id).slice(0,4).map(r=>(
                <div key={r.id} className="pdp-rel">
                  <div className="pdp-rel-img ph" style={{background:`linear-gradient(135deg,${tints[(r.img-1)%tints.length][0]},${tints[(r.img-1)%tints.length][1]})`}}/>
                  <div className="pdp-rel-p mono">{fmt(r.price)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

window.V4Detail = V4Detail;
