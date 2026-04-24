// ===== V5: Listing Flow (4-step modal) =====
function V5Listing({ onClose }) {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]); // {id, tint}
  const [form, setForm] = useState({
    title:'', desc:'', cat:'มือถือ & แท็บเล็ต', cond:'มือสอง สภาพดี',
    price:'', negotiable:true, loc:'กรุงเทพ · พระราม 9', delivery:'นัดรับ',
    boost:false,
  });
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');

  const tints = window.PLOI_DATA.IMG_TINTS;
  const cats = ['มือถือ & แท็บเล็ต','คอมพิวเตอร์','เครื่องใช้ไฟฟ้า','เฟอร์นิเจอร์','แฟชั่น','กล้อง & อุปกรณ์','กีฬา & จักรยาน','ของสะสม & เกม','หนังสือ','สัตว์เลี้ยง','อื่นๆ'];
  const conds = ['ใหม่ในกล่อง','มือสอง สภาพ 95%+','มือสอง สภาพดี','มือสองทั่วไป','ซ่อมได้ / อะไหล่'];

  function addPhoto(){
    const id = photos.length + 1;
    const tint = Math.floor(Math.random() * tints.length) + 1;
    setPhotos(p => [...p, { id: Date.now() + id, tint }]);
  }
  function removePhoto(id){ setPhotos(p => p.filter(x => x.id !== id)); }
  function reorderPhotos(from, to){
    setPhotos(p => {
      const n = [...p];
      const [x] = n.splice(from,1);
      n.splice(to,0,x);
      return n;
    });
  }

  async function aiWrite(){
    if(!form.title.trim() && !form.desc.trim()){
      setAiError('พิมพ์ชื่อหรือคำอธิบายก่อน แล้วให้ AI ช่วยเรียบเรียงใหม่');
      return;
    }
    setAiBusy(true); setAiError('');
    try{
      const prompt = `คุณเป็นผู้ช่วยเรียบเรียงข้อความประกาศขายของมือสองบนตลาดออนไลน์ไทย ช่วยเรียบเรียงชื่อประกาศและคำอธิบายที่ผู้ขายพิมพ์ไว้ให้อ่านง่าย ดึงดูด และน่าเชื่อถือมากขึ้น โดยยังคงข้อมูลและข้อเท็จจริงเดิมไว้ครบถ้วน ห้ามเพิ่มข้อมูลที่ผู้ขายไม่ได้ระบุ

หมวดหมู่: ${form.cat}
สภาพ: ${form.cond}
ชื่อเดิม: ${form.title || '(ว่าง)'}
คำอธิบายเดิม: ${form.desc || '(ว่าง)'}

ข้อกำหนด:
- ชื่อประกาศไม่เกิน 80 ตัวอักษร ใส่ยี่ห้อ/รุ่น/สภาพให้ชัด
- คำอธิบาย 3-4 ประโยค ภาษาไทย โทนเป็นมิตร
- ห้ามแต่งข้อมูลใหม่ที่ผู้ขายไม่ได้บอก

ตอบเป็น JSON เท่านั้น รูปแบบ:
{"title":"...","desc":"..."}`;
      const text = await window.claude.complete(prompt);
      const m = text.match(/\{[\s\S]*\}/);
      if(!m) throw new Error('parse');
      const data = JSON.parse(m[0]);
      setForm(f => ({...f, title: data.title || f.title, desc: data.desc || f.desc}));
    }catch(e){
      setAiError('ขออภัย ระบบช่วยเรียบเรียงไม่พร้อมใช้งานตอนนี้');
    }finally{
      setAiBusy(false);
    }
  }

  const steps = [
    {n:1, name:'รูปภาพ'},
    {n:2, name:'รายละเอียด'},
    {n:3, name:'ราคา & ส่ง'},
    {n:4, name:'ตรวจ & โพสต์'},
  ];

  const canNext = (
    (step===1 && photos.length >= 1) ||
    (step===2 && form.title.trim().length >= 6 && form.desc.trim().length >= 10) ||
    (step===3 && form.price && +form.price > 0) ||
    step===4
  );

  function next(){ if(step < 4) setStep(step+1); }
  function prev(){ if(step > 1) setStep(step-1); }

  return (
    <div className="pdp-overlay" onClick={onClose}>
      <div className="lst" onClick={e=>e.stopPropagation()}>
        <button className="pdp-close" onClick={onClose} aria-label="ปิด">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        {/* Stepper */}
        <div className="lst-stepper">
          <div className="lst-logo"><PloiLogo size={16} markSize={26}/></div>
          <div className="lst-steps">
            {steps.map((s,i)=>(
              <div key={s.n} className={"lst-s " + (step===s.n?'on':'') + (step>s.n?' done':'')}>
                <span className="lst-s-n mono">{step>s.n ? '✓' : String(s.n).padStart(2,'0')}</span>
                <span className="lst-s-nm">{s.name}</span>
                {i<steps.length-1 && <div className="lst-s-line"/>}
              </div>
            ))}
          </div>
          <div className="lst-sub mono">ลงประกาศฟรี · ไม่จำกัด</div>
        </div>

        {/* Body */}
        <div className="lst-body">
          {step===1 && (
            <div className="lst-step">
              <div className="lst-h">
                <h2>เพิ่มรูปสินค้า</h2>
                <p>ถ่ายให้เห็นทั้งด้านหน้า ด้านข้าง และรอยตำหนิถ้ามี · ลงได้สูงสุด 10 รูป</p>
              </div>
              <div className="lst-photos">
                {photos.map((p,i)=>(
                  <div key={p.id} className={"lst-ph" + (i===0?' cover':'')}>
                    <div className="ph" style={{background:`linear-gradient(135deg,${tints[(p.tint-1)%tints.length][0]},${tints[(p.tint-1)%tints.length][1]})`,aspectRatio:'1/1',borderRadius:'var(--radius-sm)'}}>
                      <span className="ph-lbl">IMG {String(p.tint).padStart(2,'0')}</span>
                    </div>
                    {i===0 && <span className="lst-cover-tag">หน้าปก</span>}
                    <button className="lst-ph-x" onClick={()=>removePhoto(p.id)} aria-label="ลบ">×</button>
                    {i>0 && <button className="lst-ph-mv" onClick={()=>reorderPhotos(i,0)} title="ตั้งเป็นหน้าปก">⇱</button>}
                  </div>
                ))}
                {photos.length < 10 && (
                  <button className="lst-add" onClick={addPhoto}>
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5-11 11"/><path d="M12 8v8M8 12h8" stroke="var(--accent)" strokeWidth="2"/></svg>
                    <span>เพิ่มรูป</span>
                    <span className="lst-add-n mono">{photos.length}/10</span>
                  </button>
                )}
              </div>
              <div className="lst-tips">
                <h4>เคล็ดลับให้ขายเร็ว</h4>
                <ul>
                  <li>แสงธรรมชาติดีสุด ถ่ายใกล้หน้าต่างช่วงเช้า-บ่าย</li>
                  <li>พื้นหลังเรียบ ไม่รก ช่วยให้สินค้าเด่น</li>
                  <li>ถ่ายรอยตำหนิตรงๆ สร้างความไว้ใจให้ผู้ซื้อ</li>
                </ul>
              </div>
            </div>
          )}

          {step===2 && (
            <div className="lst-step">
              <div className="lst-h">
                <h2>รายละเอียดสินค้า</h2>
                <p>ชื่อและคำอธิบายที่ดีช่วยให้ขายเร็วขึ้น 3 เท่า</p>
              </div>

              <button className="ai-write" onClick={aiWrite} disabled={aiBusy}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/>
                </svg>
                <span>{aiBusy ? 'กำลังเรียบเรียง…' : 'AI ช่วยเรียบเรียงใหม่'}</span>
                <span className="ai-beta mono">BETA</span>
              </button>
              {aiError && <div className="lst-err">{aiError}</div>}

              <div className="lst-field">
                <label>ชื่อประกาศ <span className="lst-req">*</span></label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="เช่น iPhone 14 Pro 256GB สีม่วง เครื่องศูนย์ไทย" maxLength={80}/>
                <div className="lst-help mono">{form.title.length}/80 · ใส่ยี่ห้อ รุ่น และสภาพให้ชัด</div>
              </div>

              <div className="lst-row2">
                <div className="lst-field">
                  <label>หมวดหมู่ <span className="lst-req">*</span></label>
                  <select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
                    {cats.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="lst-field">
                  <label>สภาพ <span className="lst-req">*</span></label>
                  <select value={form.cond} onChange={e=>setForm({...form,cond:e.target.value})}>
                    {conds.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="lst-field">
                <label>คำอธิบาย <span className="lst-req">*</span></label>
                <textarea rows={5} value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="บอกรายละเอียดการใช้งาน อายุการใช้ ประกันเหลือ อุปกรณ์ในกล่อง รอยตำหนิ เหตุผลที่ขาย"/>
                <div className="lst-help mono">{form.desc.length} ตัวอักษร · อย่างน้อย 10</div>
              </div>
            </div>
          )}

          {step===3 && (
            <div className="lst-step">
              <div className="lst-h">
                <h2>ราคา & วิธีรับสินค้า</h2>
                <p>ตั้งราคาให้ดีและเลือก Boost เพื่อให้เห็นมากขึ้น</p>
              </div>

              <div className="lst-field">
                <label>ราคา (บาท) <span className="lst-req">*</span></label>
                <div className="lst-price-wrap">
                  <span className="lst-baht mono">฿</span>
                  <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="0" className="lst-price-in"/>
                </div>
                <label className="lst-chk">
                  <input type="checkbox" checked={form.negotiable} onChange={e=>setForm({...form,negotiable:e.target.checked})}/>
                  รับต่อรอง
                </label>
              </div>

              <div className="lst-field">
                <label>ที่ตั้งสินค้า</label>
                <input value={form.loc} onChange={e=>setForm({...form,loc:e.target.value})} placeholder="เขต · แขวง"/>
              </div>

              <div className="lst-field">
                <label>วิธีรับสินค้า</label>
                <div className="lst-chips">
                  {['นัดรับ','ส่งฟรี'].map(d=>(
                    <button key={d} className={"lst-chip" + (form.delivery===d?' on':'')} onClick={()=>setForm({...form,delivery:d})}>{d}</button>
                  ))}
                </div>
                <div className="lst-help">นัดที่สาธารณะ หรือส่งแล้วเก็บ tracking ไว้เป็นหลักฐาน</div>
              </div>

              {/* Boost upsell */}
              <div className={"lst-boost" + (form.boost?' on':'')} onClick={()=>setForm({...form,boost:!form.boost})}>
                <div className="lst-boost-h">
                  <div>
                    <span className="tag boost" style={{marginBottom:6}}>BOOST</span>
                    <h3>ดันประกาศขึ้นบนสุด 48 ชั่วโมง</h3>
                    <p>เห็นเพิ่มขึ้น 8-12 เท่า · ขายเร็วขึ้นเฉลี่ย 3 วัน</p>
                  </div>
                  <div className="lst-boost-price">
                    <div className="mono" style={{fontSize:11,color:'var(--ink-3)'}}>เพียง</div>
                    <div className="mono lst-boost-amt">฿29</div>
                  </div>
                </div>
                <div className="lst-boost-bar">
                  <div className="lb-row">
                    <span>ไม่ Boost</span>
                    <div className="lb-track"><div className="lb-fill" style={{width:'12%',background:'var(--ink-3)'}}/></div>
                    <span className="mono">~120 ครั้ง</span>
                  </div>
                  <div className="lb-row">
                    <span>Boost</span>
                    <div className="lb-track"><div className="lb-fill" style={{width:'92%',background:'var(--accent)'}}/></div>
                    <span className="mono">~1,240 ครั้ง</span>
                  </div>
                </div>
                <label className="lst-boost-foot">
                  <input type="checkbox" checked={form.boost} readOnly/>
                  {form.boost ? 'เลือก Boost แล้ว — เก็บเงินเมื่อโพสต์สำเร็จ' : 'แตะเพื่อเปิด Boost'}
                </label>
              </div>
            </div>
          )}

          {step===4 && (
            <div className="lst-step lst-preview-step">
              <div className="lst-h">
                <h2>ตรวจสอบก่อนโพสต์</h2>
                <p>นี่คือหน้าตาที่ผู้ซื้อจะเห็น</p>
              </div>

              <div className="lst-preview">
                <div className="lst-pv-gal">
                  {photos[0] ? (
                    <div className="ph" style={{background:`linear-gradient(135deg,${tints[(photos[0].tint-1)%tints.length][0]},${tints[(photos[0].tint-1)%tints.length][1]})`,aspectRatio:'1/1',borderRadius:'var(--radius-sm)'}}>
                      <span className="ph-lbl">1/{photos.length}</span>
                    </div>
                  ):<div className="ph" style={{aspectRatio:'1/1',borderRadius:'var(--radius-sm)'}}/>}
                  <div className="lst-pv-strip">
                    {photos.slice(1,5).map(p=>(
                      <div key={p.id} className="ph" style={{background:`linear-gradient(135deg,${tints[(p.tint-1)%tints.length][0]},${tints[(p.tint-1)%tints.length][1]})`,aspectRatio:'1/1',borderRadius:4}}/>
                    ))}
                  </div>
                </div>
                <div className="lst-pv-body">
                  <div className="mono" style={{fontSize:10,color:'var(--ink-3)',letterSpacing:'.08em'}}>{form.cat.toUpperCase()} · {form.loc} · เพิ่งลง</div>
                  <h3 className="lst-pv-title">{form.title || 'ยังไม่ใส่ชื่อประกาศ'}</h3>
                  <div className="lst-pv-price mono">{form.price ? '฿'+(+form.price).toLocaleString() : '฿—'}</div>
                  <div className="lst-pv-tags">
                    <span className="tag">{form.cond}</span>
                    {form.negotiable && <span className="tag">ต่อรองได้</span>}
                    {form.boost && <span className="tag boost">BOOST</span>}
                  </div>
                  <p className="lst-pv-desc">{form.desc || 'ยังไม่ใส่คำอธิบาย'}</p>
                  <div className="lst-pv-meta mono">วิธีรับ: {form.delivery}</div>
                </div>
              </div>

              <div className="lst-summary">
                <h4>สรุปค่าใช้จ่าย</h4>
                <div className="lst-sum-row"><span>ค่าลงประกาศ</span><span className="mono pos">฿0</span></div>
                <div className="lst-sum-row"><span>Boost 48 ชม.</span><span className="mono">{form.boost?'฿29':'—'}</span></div>
                <div className="lst-sum-row total"><span>ชำระตอนนี้</span><span className="mono">{form.boost?'฿29':'฿0'}</span></div>
                <div className="lst-sum-note mono">ลงประกาศฟรี ไม่มีค่าธรรมเนียมเมื่อขายสำเร็จ · ได้เต็มราคาที่คุยกับผู้ซื้อ</div>
              </div>
            </div>
          )}
        </div>

        {/* Foot */}
        <div className="lst-foot">
          <button className="btn btn-ghost" onClick={step===1 ? onClose : prev}>
            {step===1 ? 'ยกเลิก' : '← ย้อนกลับ'}
          </button>
          <div className="lst-foot-progress mono">ขั้นตอน {step} จาก 4</div>
          {step < 4 ? (
            <button className="btn btn-primary" disabled={!canNext} onClick={next}>ต่อไป →</button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={onClose}>
              {form.boost ? 'โพสต์ & Boost ฿29' : 'โพสต์ประกาศ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

window.V5Listing = V5Listing;
