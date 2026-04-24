// ===== V11: Coins Shop + Premium (full flow) =====
// Replaces V10Coins stub with checkout modal, active boosts panel, premium perks demo

const COIN_PACKS = [
  {coins:100, price:29, bonus:0, pop:false, tag:null},
  {coins:300, price:79, bonus:20, pop:false, tag:'คุ้มเริ่มต้น'},
  {coins:600, price:149, bonus:60, pop:true, tag:'ฮิตสุด'},
  {coins:1200, price:279, bonus:180, pop:false, tag:'คุ้มกลาง'},
  {coins:3000, price:649, bonus:600, pop:false, tag:'VIP'},
  {coins:6000, price:1190, bonus:1500, pop:false, tag:'Whale'},
];

const ACTIVE_BOOSTS = [
  {id:1, product:'iPhone 13 Pro 256GB', img:'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=200&auto=format&fit=crop&q=60', type:'boost', boostLeft:18, views:142, msgs:8, total:2000, used:680},
  {id:2, product:'Macbook Air M1 — สภาพใหม่', img:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&auto=format&fit=crop&q=60', type:'featured', days:5, views:3240, msgs:24, total:7, used:2},
];

const PAY_METHODS = [
  {k:'promptpay', name:'PromptPay', sub:'ฟรีค่าธรรมเนียม', ic:'QR'},
  {k:'card', name:'บัตรเครดิต/เดบิต', sub:'Visa · Mastercard · JCB', ic:'CC'},
  {k:'truemoney', name:'TrueMoney Wallet', sub:'จ่ายจากยอดในกระเป๋า', ic:'TM'},
  {k:'linepay', name:'Rabbit LINE Pay', sub:'ทันที · ไม่มีค่าธรรมเนียม', ic:'LP'},
];

const PREMIUM_PERKS = [
  {ic:'✨', t:'Boost อัตโนมัติทุก 7 วัน', s:'ประกาศของคุณถูกดันขึ้นบนสุดอัตโนมัติทุกสัปดาห์', live:true},
  {ic:'⭐', t:'ป้าย Premium สีทอง', s:'ได้ป้ายสีทองใต้ชื่อ ผู้ซื้อมั่นใจกว่าเดิม', live:true},
  {ic:'🔎', t:'Insight แบบละเอียด', s:'ดูข้อมูลผู้เข้าชม ช่วงเวลาที่คนสนใจ เปรียบเทียบกับคู่แข่ง', live:false},
  {ic:'⚡', t:'ตอบอัตโนมัติ AI', s:'ตั้งข้อความตอบกลับเร็วใน 1 วินาที', live:false},
  {ic:'🛡️', t:'ประกันผู้ขาย', s:'คืนเงิน Boost ถ้าไม่มีข้อความภายใน 48 ชม.', live:true},
  {ic:'📊', t:'รายงานรายเดือน', s:'สรุปยอดขาย + คำแนะนำจาก AI', live:false},
];

function V11Coins({ onClose }) {
  const [tab, setTab] = useState('topup');
  const [checkoutPack, setCheckoutPack] = useState(null);
  const [premiumCheckout, setPremiumCheckout] = useState(null); // 'monthly' | 'yearly'
  const [balance, setBalance] = useState(1240);

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
          <b>{balance.toLocaleString()}</b> เหรียญ
        </div>
      </div>

      <div className="co-tabs">
        <button className={tab==='topup'?'on':''} onClick={()=>setTab('topup')}>เติมเหรียญ</button>
        <button className={tab==='active'?'on':''} onClick={()=>setTab('active')}>Boost ที่ใช้งานอยู่<span className="co-tab-n">{ACTIVE_BOOSTS.length}</span></button>
        <button className={tab==='premium'?'on':''} onClick={()=>setTab('premium')}>Premium</button>
        <button className={tab==='history'?'on':''} onClick={()=>setTab('history')}>ประวัติการใช้</button>
      </div>

      <div className="co-body">
        {tab==='topup' && <TopupTab onBuy={setCheckoutPack}/>}
        {tab==='active' && <ActiveBoostsTab/>}
        {tab==='premium' && <PremiumTab onSubscribe={setPremiumCheckout}/>}
        {tab==='history' && <HistoryTab/>}
      </div>

      {checkoutPack && (
        <CheckoutModal
          item={checkoutPack}
          kind="coins"
          onClose={()=>setCheckoutPack(null)}
          onSuccess={()=>{ setBalance(b => b + checkoutPack.coins + checkoutPack.bonus); setCheckoutPack(null); }}
        />
      )}
      {premiumCheckout && (
        <CheckoutModal
          item={{plan:premiumCheckout, price:premiumCheckout==='monthly'?129:1290}}
          kind="premium"
          onClose={()=>setPremiumCheckout(null)}
          onSuccess={()=>setPremiumCheckout(null)}
        />
      )}
    </div>
  );
}
window.V11Coins = V11Coins;

// ---------- Tabs ----------
function TopupTab({ onBuy }) {
  return (
    <>
      <div className="co-hero">
        <h2>ใช้เหรียญเพื่อ <b>Boost</b> ประกาศหรือซื้อป้าย Featured</h2>
        <p>1 Boost = 30 เหรียญ · Featured 7 วัน = 80 เหรียญ · ส่ง Super Bump = 120 เหรียญ</p>
      </div>
      <div className="co-grid">
        {COIN_PACKS.map(p=>(
          <div key={p.coins} className={'co-card'+(p.pop?' pop':'')}>
            {p.pop && <span className="co-tag">{p.tag || 'ฮิตสุด'}</span>}
            <div className="co-coins">
              <span className="co-coins-ic">◎</span>
              {p.coins.toLocaleString()}
            </div>
            {p.bonus>0 && <div className="co-bonus">+{p.bonus} โบนัส</div>}
            <div className="co-price">฿{p.price.toLocaleString()}</div>
            <div className="co-perprice">฿{(p.price/(p.coins+p.bonus)).toFixed(2)} / เหรียญ</div>
            <button className="btn-primary co-buy" onClick={()=>onBuy(p)}>ซื้อแพ็คนี้</button>
          </div>
        ))}
      </div>
      <div className="co-hint">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        <span>เหรียญไม่หมดอายุ · สามารถขอเงินคืนได้ภายใน 14 วันถ้ายังไม่ใช้งาน</span>
      </div>
    </>
  );
}

function ActiveBoostsTab() {
  return (
    <div className="co-actives">
      <div className="co-actives-head">
        <h2>ประกาศที่กำลัง Boost</h2>
        <p>ดูสถานะการใช้งาน Boost/Featured ของคุณแบบเรียลไทม์</p>
      </div>
      {ACTIVE_BOOSTS.map(b=>(
        <div key={b.id} className={'co-active '+b.type}>
          <img src={b.img} alt="" className="co-active-img"/>
          <div className="co-active-main">
            <div className="co-active-top">
              <h3>{b.product}</h3>
              <span className={'co-active-tag '+b.type}>{b.type==='boost'?'Boost':'⭐ Featured'}</span>
            </div>
            <div className="co-active-meta">
              {b.type==='boost' ? (
                <>เหลือเวลา <b>{b.boostLeft} ชม.</b> · ใช้ไป <b>{b.used}</b> / {b.total} views</>
              ) : (
                <>เหลือ <b>{b.days}</b> วัน · ใช้ไป <b>{b.used}</b> / {b.total} วัน</>
              )}
            </div>
            <div className="co-active-bar">
              <div className="co-active-fill" style={{width:`${(b.used/b.total)*100}%`}}/>
            </div>
            <div className="co-active-stats">
              <div><b>{b.views.toLocaleString()}</b> <span>ผู้เข้าชม</span></div>
              <div><b>{b.msgs}</b> <span>ข้อความใหม่</span></div>
              <div><b>+{Math.round(b.views*0.12)}%</b> <span>เทียบก่อน Boost</span></div>
            </div>
          </div>
          <div className="co-active-actions">
            <button className="btn-ghost sm">ดูประกาศ</button>
            <button className="btn-ghost sm">ต่ออายุ</button>
          </div>
        </div>
      ))}
      <button className="co-active-add">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        เริ่ม Boost ประกาศใหม่
      </button>
    </div>
  );
}

function PremiumTab({ onSubscribe }) {
  const [plan, setPlan] = useState('yearly');
  return (
    <>
      <div className="co-prem-hero">
        <div className="co-prem-left">
          <span className="co-prem-eyebrow">⭐ PLOIKHONG PREMIUM</span>
          <h2>ปลิวคงเป็น Premium</h2>
          <p>ขายของได้เร็วขึ้น 3 เท่า · ได้ป้ายผู้ขายน่าเชื่อถือ · Boost ฟรีทุกสัปดาห์ · ประกันผู้ขาย</p>

          <div className="co-plan-toggle">
            <button className={plan==='monthly'?'on':''} onClick={()=>setPlan('monthly')}>รายเดือน</button>
            <button className={plan==='yearly'?'on':''} onClick={()=>setPlan('yearly')}>รายปี <span className="co-save">-17%</span></button>
          </div>

          <div className="co-price-display">
            <span className="co-price-amt">฿{plan==='monthly'?129:1290}</span>
            <span className="co-price-per">/ {plan==='monthly'?'เดือน':'ปี'}</span>
            {plan==='yearly' && <div className="co-price-sub">เฉลี่ยเพียง ฿107.5 / เดือน · ประหยัด ฿258 / ปี</div>}
          </div>

          <button className="btn-primary lg co-prem-cta" onClick={()=>onSubscribe(plan)}>
            เริ่มใช้ Premium ฟรี 7 วัน
          </button>
          <div className="co-prem-fine">ไม่มีค่าใช้จ่ายใน 7 วันแรก · ยกเลิกได้ทุกเมื่อ</div>
        </div>
        <div className="co-prem-right">
          <div className="co-prem-card">
            <div className="co-prem-card-top">
              <div className="co-prem-ava">SP</div>
              <div>
                <div className="co-prem-name">
                  สมชาย ปลิวคง
                  <span className="co-prem-star">⭐ Premium</span>
                </div>
                <div className="co-prem-meta">ผู้ขายน่าเชื่อถือ · 142 ดีล · ★ 4.9</div>
              </div>
            </div>
            <div className="co-prem-stat">
              <div><b>3.2x</b><span>ยอดวิวเฉลี่ย</span></div>
              <div><b>+18%</b><span>อัตราปิดดีล</span></div>
              <div><b>-42%</b><span>เวลาขาย</span></div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="co-perks-h">สิทธิพิเศษที่คุณจะได้รับ</h3>
      <div className="co-perks">
        {PREMIUM_PERKS.map(p=>(
          <div key={p.t} className={'co-perk'+(p.live?' live':'')}>
            <div className="co-perk-ic">{p.ic}</div>
            <div className="co-perk-body">
              <h4>{p.t}</h4>
              <p>{p.s}</p>
              {p.live && <span className="co-perk-tag">ใช้งานอยู่</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="co-prem-faq">
        <h3>คำถามที่พบบ่อย</h3>
        {[
          ['ยกเลิกได้ทุกเมื่อไหร่?','ใช่ ยกเลิกเมื่อไหร่ก็ได้ ระบบจะไม่หักเงินในรอบบิลถัดไป สิทธิ์ใช้ได้จนครบระยะเวลาที่จ่ายไปแล้ว'],
          ['Boost ฟรีทำงานอย่างไร?','ทุก 7 วัน ระบบจะดันประกาศของคุณขึ้นบนสุดโดยอัตโนมัติ เลือกได้สูงสุด 3 ประกาศ/สัปดาห์'],
          ['ประกันผู้ขายคุ้มครองอะไร?','ถ้าไม่มีข้อความจากผู้ซื้อภายใน 48 ชม. หลัง Boost เราจะคืนเหรียญให้ 100%'],
        ].map(([q,a],i)=>(
          <details key={i}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </>
  );
}

function HistoryTab() {
  const rows = [
    {t:'ซื้อเหรียญ', d:'วันนี้ 14:22', n:'+600', pos:true, sub:'แพ็ค 600 + 60 โบนัส', amt:'฿149', method:'PromptPay'},
    {t:'Boost ประกาศ', d:'เมื่อวาน 10:15', n:'-30', pos:false, sub:'iPhone 13 Pro 256GB', duration:'24 ชม.'},
    {t:'Featured 7 วัน', d:'3 วันก่อน', n:'-80', pos:false, sub:'Macbook Air M1 — สภาพใหม่', duration:'7 วัน'},
    {t:'โบนัสแนะนำเพื่อน', d:'5 วันก่อน', n:'+50', pos:true, sub:'เพื่อน 1 คนสมัครสมาชิก'},
    {t:'ซื้อเหรียญ', d:'1 สัปดาห์ก่อน', n:'+320', pos:true, sub:'แพ็ค 300 + 20 โบนัส', amt:'฿79', method:'บัตรเครดิต'},
    {t:'Super Bump', d:'2 สัปดาห์ก่อน', n:'-120', pos:false, sub:'iPhone 11 Pro Max'},
    {t:'คืนเหรียญ (ยกเลิก Boost)', d:'3 สัปดาห์ก่อน', n:'+30', pos:true, sub:'ระบบคืนอัตโนมัติ'},
  ];
  return (
    <div className="co-hist">
      <div className="co-hist-head">
        <h2>ประวัติการใช้</h2>
        <div className="co-hist-filters">
          <select><option>ทั้งหมด</option><option>รับเข้า</option><option>ใช้ไป</option></select>
          <select><option>7 วัน</option><option>30 วัน</option><option>90 วัน</option></select>
        </div>
      </div>
      <div className="co-hist-summary">
        <div><b>+970</b><span>รับเข้า (30 วัน)</span></div>
        <div><b>-230</b><span>ใช้ไป (30 วัน)</span></div>
        <div><b>1,240</b><span>คงเหลือปัจจุบัน</span></div>
      </div>
      {rows.map((h,i)=>(
        <div key={i} className="co-hist-row">
          <div className={'co-hist-ic '+(h.pos?'pos':'neg')}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              {h.pos ? <path d="M12 5v14M5 12l7-7 7 7"/> : <path d="M12 5v14M19 12l-7 7-7-7"/>}
            </svg>
          </div>
          <div className="co-hist-main">
            <div className="co-hist-t">{h.t}</div>
            <div className="co-hist-s">
              {h.sub} · {h.d}
              {h.method && <span className="co-hist-method"> · {h.method}</span>}
              {h.duration && <span className="co-hist-method"> · ระยะ {h.duration}</span>}
            </div>
          </div>
          <div className="co-hist-r">
            <div className={'co-hist-n '+(h.pos?'pos':'neg')}>{h.pos?'+':''}{h.n} ◎</div>
            {h.amt && <div className="co-hist-a">{h.amt}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Checkout Modal ----------
function CheckoutModal({ item, kind, onClose, onSuccess }) {
  const [step, setStep] = useState('review'); // review | paying | success
  const [method, setMethod] = useState('promptpay');

  const title = kind==='coins' ? `แพ็ค ${item.coins.toLocaleString()} เหรียญ` : `Premium ${item.plan==='monthly'?'รายเดือน':'รายปี'}`;
  const subtitle = kind==='coins' ? `${item.coins.toLocaleString()} เหรียญ${item.bonus>0?` + ${item.bonus} โบนัส`:''}` : 'ทดลองฟรี 7 วัน จากนั้น';
  const price = item.price;
  const vat = Math.round(price * 0.07);
  const total = price + vat;

  const handlePay = () => {
    setStep('paying');
    setTimeout(()=>setStep('success'), 1800);
  };

  return (
    <div className="co-ck-overlay" onClick={step==='paying'?undefined:onClose}>
      <div className="co-ck" onClick={e=>e.stopPropagation()}>
        <div className="co-ck-head">
          <h2>{step==='success'?'สำเร็จ!':step==='paying'?'กำลังดำเนินการ...':'ยืนยันการชำระเงิน'}</h2>
          {step!=='paying' && (
            <button className="co-ck-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"/></svg>
            </button>
          )}
        </div>

        {step==='review' && (
          <div className="co-ck-body">
            {/* Item summary */}
            <div className="co-ck-item">
              <div className="co-ck-item-ic">{kind==='coins'?'◎':'⭐'}</div>
              <div className="co-ck-item-main">
                <div className="co-ck-item-t">{title}</div>
                <div className="co-ck-item-s">{subtitle}</div>
              </div>
              <div className="co-ck-item-p">฿{price.toLocaleString()}</div>
            </div>

            {/* Payment method */}
            <div className="co-ck-sec">
              <h3>วิธีการชำระเงิน</h3>
              {PAY_METHODS.map(m=>(
                <button key={m.k} className={'co-pay'+(method===m.k?' on':'')} onClick={()=>setMethod(m.k)}>
                  <span className="co-pay-ic">{m.ic}</span>
                  <div className="co-pay-main">
                    <div className="co-pay-nm">{m.name}</div>
                    <div className="co-pay-s">{m.sub}</div>
                  </div>
                  <span className={'co-pay-radio'+(method===m.k?' on':'')}/>
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="co-ck-sum">
              <div className="co-ck-sum-r"><span>ราคา</span><b>฿{price.toLocaleString()}</b></div>
              <div className="co-ck-sum-r"><span>VAT 7%</span><b>฿{vat.toLocaleString()}</b></div>
              {kind==='premium' && item.plan==='yearly' && (
                <div className="co-ck-sum-r pos"><span>ส่วนลดรายปี</span><b>-฿258</b></div>
              )}
              <div className="co-ck-sum-r total"><span>รวมทั้งหมด</span><b>฿{total.toLocaleString()}</b></div>
              {kind==='premium' && <div className="co-ck-sum-note">ทดลอง 7 วันฟรี · หักเงินครั้งแรกวันที่ {new Date(Date.now()+7*86400000).toLocaleDateString('th-TH')}</div>}
            </div>

            <label className="co-ck-consent">
              <input type="checkbox" defaultChecked/>
              ยอมรับ <a>เงื่อนไขการใช้งาน</a> และ <a>นโยบายการคืนเงิน</a>
            </label>
          </div>
        )}

        {step==='paying' && (
          <div className="co-ck-paying">
            <div className="co-spinner"/>
            <h3>กำลังดำเนินการชำระเงิน</h3>
            <p>กรุณาอย่าปิดหน้าต่างนี้ · ใช้เวลาไม่เกิน 30 วินาที</p>
          </div>
        )}

        {step==='success' && (
          <div className="co-ck-success">
            <div className="co-check-ic">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3>ชำระเงินสำเร็จ!</h3>
            <p>
              {kind==='coins'
                ? `เหรียญ ${(item.coins+item.bonus).toLocaleString()} ◎ ได้ถูกเพิ่มในบัญชีแล้ว`
                : 'สิทธิ์ Premium ของคุณเปิดใช้งานแล้ว — เริ่มทดลองฟรี 7 วัน'}
            </p>
            <div className="co-ck-rcpt">
              <div><span>เลขที่รายการ</span><b>TXN-{Date.now().toString().slice(-7)}</b></div>
              <div><span>จำนวนเงิน</span><b>฿{total.toLocaleString()}</b></div>
              <div><span>วิธีชำระ</span><b>{PAY_METHODS.find(m=>m.k===method)?.name}</b></div>
            </div>
          </div>
        )}

        {step!=='paying' && (
          <div className="co-ck-foot">
            {step==='review' ? (
              <>
                <button className="btn-ghost" onClick={onClose}>ยกเลิก</button>
                <button className="btn-primary" onClick={handlePay}>ชำระเงิน ฿{total.toLocaleString()}</button>
              </>
            ) : (
              <button className="btn-primary" style={{width:'100%'}} onClick={onSuccess}>เสร็จสิ้น</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
