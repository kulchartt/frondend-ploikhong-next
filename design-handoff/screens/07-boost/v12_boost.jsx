// ===== V12: Boost Listing Flow =====
// Drop-in component สำหรับเริ่ม Boost ประกาศใหม่
//
// Usage (จาก feed/MyHub/listing-success):
//   window.__openBoost(productObj)
//
// Variations: 3 layouts สลับด้วย ?bv=A|B|C ใน URL หรือ window.__BOOST_VARIANT
//   A = "Classic Checkout"   (modal กลางจอ - เหมาะ desktop, สั้น กระชับ)
//   B = "Wizard 3-step"      (full-screen overlay - มี progress, preview ใหญ่, reach estimator)
//   C = "Bottom Sheet"       (slide-up จากล่าง - mobile-first, แตะเลือกแพ็คเกจเร็ว)
//
// Dependencies (global): React, useState, useEffect from window
//                        window.PLOI_DATA, fmt(), Thumb (จาก shared.jsx)

const { useState: useBoostState, useEffect: useBoostEffect, useMemo: useBoostMemo, useRef: useBoostRef } = React;

// ----- Boost packages (single source of truth) -----
const BOOST_PACKAGES = [
  {
    k: 'boost',
    name: 'Boost',
    icon: 'rocket',
    desc: 'ดันประกาศขึ้นบนสุดของหมวดและ feed',
    coins: 30,
    durations: [
      { d: '24 ชม.', coins: 30, reach: '~800 คน' },
      { d: '3 วัน', coins: 70, reach: '~2,400 คน' },
      { d: '7 วัน', coins: 140, reach: '~5,800 คน', popular: true },
    ],
    color: 'accent',
  },
  {
    k: 'featured',
    name: 'Featured',
    icon: 'star',
    desc: 'ป้าย Featured + ขึ้น Featured Section หน้าแรก',
    coins: 80,
    durations: [
      { d: '7 วัน', coins: 80, reach: '~12,000 คน', popular: true },
      { d: '14 วัน', coins: 150, reach: '~22,000 คน' },
      { d: '30 วัน', coins: 280, reach: '~42,000 คน' },
    ],
    color: 'warn',
  },
  {
    k: 'super',
    name: 'Super Bump',
    icon: 'bolt',
    desc: 'ส่ง push ให้ผู้ติดตามและคนที่เคยดูสินค้าใกล้เคียง',
    coins: 120,
    durations: [
      { d: 'ยิงครั้งเดียว', coins: 120, reach: '~3,500 คน', popular: true },
    ],
    color: 'accent',
  },
  {
    k: 'autorelist',
    name: 'Auto-Relist',
    icon: 'refresh',
    desc: 'auto-bump ทุก 7 วัน เป็นเวลา 30 วัน',
    coins: 20,
    durations: [
      { d: '30 วัน', coins: 20, reach: '~6,200 คน', popular: true },
    ],
    color: 'pos',
  },
];

const BOOST_BUNDLES = [
  { k: 'b1', name: 'Boost + Featured (7 วัน)', items: ['boost', 'featured'], coins: 180, save: 40, badge: 'ลด 18%' },
  { k: 'b2', name: 'Featured + Auto-Relist', items: ['featured', 'autorelist'], coins: 90, save: 10, badge: 'คุ้ม' },
  { k: 'b3', name: 'All-in (Boost+Featured+Super)', items: ['boost', 'featured', 'super'], coins: 280, save: 70, badge: 'จัดเต็ม' },
];

const BoostIcon = ({ name, size = 18 }) => {
  const paths = {
    rocket: <path d="M5 19c1-4 4-7 8-8l3-3 3 3-3 3c-1 4-4 7-8 8M9 15l-2 2M5 19h-2"/>,
    star: <path d="M12 3l3 6 6 1-4.5 4.5 1 6.5L12 18l-5.5 3 1-6.5L3 10l6-1z"/>,
    bolt: <path d="M13 3L4 14h6l-1 7 9-11h-6z"/>,
    refresh: <><path d="M3 12a9 9 0 1115 6.7M21 21l-2.5-2.5"/><path d="M21 8v5h-5"/></>,
    coin: <><circle cx="12" cy="12" r="9"/><path d="M9 9h4a2 2 0 010 4H9v4M9 9v4M16 9l-2 2"/></>,
    eye: <><circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/></>,
    msg: <path d="M21 11a8 8 0 11-3-6.2L21 4l-1 4.2A8 8 0 0121 11z"/>,
    check: <path d="M5 13l4 4L19 7"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v4h1"/></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
    close: <path d="M6 6l12 12M6 18L18 6"/>,
    back: <path d="M15 18l-6-6 6-6"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.info}
    </svg>
  );
};

// ============== ROOT ==============
function V12Boost({ product, onClose, onConfirmed, variant: variantProp }) {
  const variant = variantProp || window.__BOOST_VARIANT || 'B';
  if (variant === 'A') return <BoostModalClassic product={product} onClose={onClose} onConfirmed={onConfirmed} />;
  if (variant === 'C') return <BoostBottomSheet product={product} onClose={onClose} onConfirmed={onConfirmed} />;
  return <BoostWizard product={product} onClose={onClose} onConfirmed={onConfirmed} />;
}
window.V12Boost = V12Boost;

// ============== Variation A: Classic Checkout Modal (640px) ==============
function BoostModalClassic({ product, onClose, onConfirmed }) {
  const [pkg, setPkg] = useBoostState('boost');
  const [durIdx, setDurIdx] = useBoostState(BOOST_PACKAGES.find(p=>p.k==='boost').durations.findIndex(d=>d.popular));
  const [step, setStep] = useBoostState('select'); // select | confirm | success
  const balance = 1240;

  const selectedPkg = BOOST_PACKAGES.find(p => p.k === pkg);
  const selectedDur = selectedPkg.durations[Math.max(0, durIdx)];
  const cost = selectedDur.coins;
  const after = balance - cost;
  const insufficient = after < 0;

  const handleConfirm = () => {
    setStep('success');
    setTimeout(() => { onConfirmed && onConfirmed({ pkg: selectedPkg.k, dur: selectedDur, cost }); }, 1200);
  };

  return (
    <div className="bo-overlay" onClick={onClose}>
      <div className="bo-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="bo-modal-head">
          <h2>{step === 'success' ? 'เริ่ม Boost สำเร็จ' : 'Boost ประกาศ'}</h2>
          <button className="bo-x" onClick={onClose} aria-label="ปิด"><BoostIcon name="close" /></button>
        </div>

        {step !== 'success' && (
          <div className="bo-modal-body">
            <BoostProductCard product={product} compact />

            <div className="bo-pkg-tabs">
              {BOOST_PACKAGES.map(p => (
                <button
                  key={p.k}
                  className={'bo-pkg-tab' + (pkg === p.k ? ' on' : '')}
                  onClick={() => { setPkg(p.k); setDurIdx(p.durations.findIndex(d=>d.popular) || 0); }}
                >
                  <BoostIcon name={p.icon} size={16} />
                  <span>{p.name}</span>
                  <span className="bo-pkg-tab-coin">{p.coins}◎</span>
                </button>
              ))}
            </div>

            <div className="bo-pkg-detail">
              <p className="bo-pkg-desc">{selectedPkg.desc}</p>
              <div className="bo-dur-row">
                {selectedPkg.durations.map((d, i) => (
                  <button
                    key={i}
                    className={'bo-dur' + (durIdx === i ? ' on' : '')}
                    onClick={() => setDurIdx(i)}
                  >
                    <div className="bo-dur-d">{d.d}</div>
                    <div className="bo-dur-coins">{d.coins} ◎</div>
                    <div className="bo-dur-reach">{d.reach}</div>
                    {d.popular && <span className="bo-dur-pop">นิยม</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="bo-summary">
              <div className="bo-sum-row">
                <span>คงเหลือปัจจุบัน</span>
                <b>{balance.toLocaleString()} ◎</b>
              </div>
              <div className="bo-sum-row neg">
                <span>ใช้สำหรับ Boost ครั้งนี้</span>
                <b>− {cost} ◎</b>
              </div>
              <div className="bo-sum-row total">
                <span>คงเหลือหลังหัก</span>
                <b className={insufficient ? 'bad' : ''}>{after.toLocaleString()} ◎</b>
              </div>
              {insufficient && (
                <div className="bo-warn">
                  <BoostIcon name="info" size={14} />
                  <span>เหรียญไม่พอ — เติมเหรียญก่อนเริ่ม Boost</span>
                  <button className="bo-warn-cta" onClick={() => window.__openCoins && window.__openCoins()}>เติมเหรียญ</button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'success' && <BoostSuccess pkg={selectedPkg} dur={selectedDur} product={product} />}

        <div className="bo-modal-foot">
          {step === 'success' ? (
            <button className="bo-btn primary lg" onClick={onClose}>เสร็จสิ้น</button>
          ) : (
            <>
              <button className="bo-btn ghost" onClick={onClose}>ยกเลิก</button>
              <button
                className="bo-btn primary"
                disabled={insufficient}
                onClick={handleConfirm}
              >
                ยืนยัน Boost · ใช้ {cost} ◎
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== Variation B: Wizard Full-screen (3 steps) ==============
function BoostWizard({ product, onClose, onConfirmed }) {
  const [step, setStep] = useBoostState(0); // 0=package, 1=schedule, 2=review, 3=success
  const [pkg, setPkg] = useBoostState('boost');
  const [durIdx, setDurIdx] = useBoostState(BOOST_PACKAGES.find(p=>p.k==='boost').durations.findIndex(d=>d.popular));
  const [bundle, setBundle] = useBoostState(null);
  const [scheduleAt, setScheduleAt] = useBoostState('now'); // 'now' | 'morning' | 'evening' | 'custom'
  const [autoRenew, setAutoRenew] = useBoostState(false);
  const balance = 1240;

  const selectedPkg = BOOST_PACKAGES.find(p => p.k === pkg);
  const selectedDur = selectedPkg.durations[Math.max(0, durIdx)];
  const isBundle = !!bundle;
  const bundleData = isBundle ? BOOST_BUNDLES.find(b => b.k === bundle) : null;
  const cost = isBundle ? bundleData.coins : selectedDur.coins;
  const after = balance - cost;
  const insufficient = after < 0;

  const STEPS = ['เลือกแพ็คเกจ', 'ตั้งเวลา & ตัวเลือก', 'ยืนยัน'];

  const next = () => setStep(s => Math.min(s + 1, 3));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const handleConfirm = () => {
    setStep(3);
    setTimeout(() => onConfirmed && onConfirmed({ pkg, dur: selectedDur, cost, bundle, scheduleAt, autoRenew }), 1500);
  };

  return (
    <div className="bo-fs">
      <div className="bo-fs-top">
        <button className="bo-fs-back" onClick={onClose}>
          <BoostIcon name="back" />
          <span>ปิด</span>
        </button>
        <div className="bo-fs-title">
          <BoostIcon name="rocket" size={16} />
          <span>เริ่ม Boost ประกาศ</span>
        </div>
        <div className="bo-balance-pill">
          <BoostIcon name="coin" size={14} />
          <b>{balance.toLocaleString()}</b>
          <span>เหรียญ</span>
        </div>
      </div>

      {step < 3 && (
        <div className="bo-fs-progress">
          {STEPS.map((s, i) => (
            <div key={s} className={'bo-fs-step' + (i === step ? ' on' : '') + (i < step ? ' done' : '')}>
              <span className="bo-fs-step-n">{i < step ? <BoostIcon name="check" size={14} /> : i + 1}</span>
              <span className="bo-fs-step-l">{s}</span>
              {i < STEPS.length - 1 && <span className="bo-fs-step-line" />}
            </div>
          ))}
        </div>
      )}

      <div className="bo-fs-body">
        {step === 0 && (
          <BoostStepSelect
            product={product}
            pkg={pkg} setPkg={setPkg}
            durIdx={durIdx} setDurIdx={setDurIdx}
            bundle={bundle} setBundle={setBundle}
          />
        )}
        {step === 1 && (
          <BoostStepSchedule
            product={product}
            pkg={selectedPkg}
            dur={selectedDur}
            isBundle={isBundle}
            bundleData={bundleData}
            scheduleAt={scheduleAt} setScheduleAt={setScheduleAt}
            autoRenew={autoRenew} setAutoRenew={setAutoRenew}
          />
        )}
        {step === 2 && (
          <BoostStepReview
            product={product}
            pkg={selectedPkg}
            dur={selectedDur}
            isBundle={isBundle}
            bundleData={bundleData}
            scheduleAt={scheduleAt}
            autoRenew={autoRenew}
            balance={balance}
            cost={cost}
            after={after}
          />
        )}
        {step === 3 && (
          <div className="bo-fs-success-wrap">
            <BoostSuccess pkg={selectedPkg} dur={selectedDur} product={product} bundleData={bundleData} />
          </div>
        )}
      </div>

      {step < 3 && (
        <div className="bo-fs-foot">
          <div className="bo-fs-foot-info">
            {!isBundle && (
              <>
                <BoostIcon name={selectedPkg.icon} size={14} />
                <span>{selectedPkg.name} · {selectedDur.d} · ประมาณการ reach {selectedDur.reach}</span>
              </>
            )}
            {isBundle && (
              <>
                <BoostIcon name="bolt" size={14} />
                <span>{bundleData.name} · ประหยัด {bundleData.save} ◎</span>
              </>
            )}
          </div>
          <div className="bo-fs-foot-actions">
            {step > 0 && <button className="bo-btn ghost" onClick={back}>ย้อนกลับ</button>}
            {step < 2 && <button className="bo-btn primary" onClick={next}>ถัดไป — {cost} ◎</button>}
            {step === 2 && (
              <button className="bo-btn primary" disabled={insufficient} onClick={handleConfirm}>
                ยืนยัน Boost · ใช้ {cost} ◎
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bo-fs-foot">
          <div className="bo-fs-foot-info"></div>
          <div className="bo-fs-foot-actions">
            <button className="bo-btn ghost" onClick={() => window.__openHub && window.__openHub('sell')}>ดูใน MyHub</button>
            <button className="bo-btn primary" onClick={onClose}>เสร็จสิ้น</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----- Wizard step 1: package + bundle -----
function BoostStepSelect({ product, pkg, setPkg, durIdx, setDurIdx, bundle, setBundle }) {
  return (
    <div className="bo-step bo-step-select">
      <div className="bo-step-l">
        <h3 className="bo-step-h">เลือกประเภท Boost</h3>
        <p className="bo-step-sub">Boost = ดันบนสุด · Featured = ป้ายเด่น · Super Bump = ส่งแจ้งเตือน</p>

        <div className="bo-pkg-grid">
          {BOOST_PACKAGES.map(p => (
            <button
              key={p.k}
              className={'bo-pkg-card' + (pkg === p.k && !bundle ? ' on' : '') + ' c-' + p.color}
              onClick={() => { setPkg(p.k); setBundle(null); setDurIdx(p.durations.findIndex(d=>d.popular) || 0); }}
            >
              <div className="bo-pkg-card-head">
                <span className="bo-pkg-icon"><BoostIcon name={p.icon} size={20} /></span>
                <div className="bo-pkg-card-titles">
                  <h4>{p.name}</h4>
                  <p>{p.desc}</p>
                </div>
              </div>
              <div className="bo-pkg-card-foot">
                เริ่มต้น <b>{p.coins} ◎</b>
              </div>
            </button>
          ))}
        </div>

        {!bundle && (
          <>
            <h3 className="bo-step-h" style={{marginTop:24}}>เลือกระยะเวลา</h3>
            <div className="bo-dur-row">
              {BOOST_PACKAGES.find(p=>p.k===pkg).durations.map((d, i) => (
                <button
                  key={i}
                  className={'bo-dur' + (durIdx === i ? ' on' : '')}
                  onClick={() => setDurIdx(i)}
                >
                  <div className="bo-dur-d">{d.d}</div>
                  <div className="bo-dur-coins">{d.coins} ◎</div>
                  <div className="bo-dur-reach">เข้าถึง {d.reach}</div>
                  {d.popular && <span className="bo-dur-pop">นิยม</span>}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="bo-bundle-sect">
          <div className="bo-bundle-head">
            <h3 className="bo-step-h" style={{margin:0}}>หรือเลือกชุด Bundle</h3>
            <span className="bo-bundle-tip">ประหยัดสูงสุด 25%</span>
          </div>
          <div className="bo-bundle-row">
            {BOOST_BUNDLES.map(b => (
              <button
                key={b.k}
                className={'bo-bundle' + (bundle === b.k ? ' on' : '')}
                onClick={() => setBundle(bundle === b.k ? null : b.k)}
              >
                <div className="bo-bundle-top">
                  <h4>{b.name}</h4>
                  <span className="bo-bundle-save">{b.badge}</span>
                </div>
                <div className="bo-bundle-icons">
                  {b.items.map(it => {
                    const meta = BOOST_PACKAGES.find(p => p.k === it);
                    return (
                      <span key={it} className={'bo-bundle-pill c-' + meta.color}>
                        <BoostIcon name={meta.icon} size={11} />{meta.name}
                      </span>
                    );
                  })}
                </div>
                <div className="bo-bundle-coins">
                  <b>{b.coins} ◎</b>
                  <span>ประหยัด {b.save} ◎</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bo-step-r">
        <BoostPreviewPanel product={product} pkg={pkg} bundle={bundle} />
      </div>
    </div>
  );
}

// ----- Wizard step 2: schedule + auto-renew -----
function BoostStepSchedule({ product, pkg, dur, isBundle, bundleData, scheduleAt, setScheduleAt, autoRenew, setAutoRenew }) {
  const SLOTS = [
    { k: 'now', label: 'เริ่มทันที', sub: 'Boost จะเริ่มทำงานในไม่กี่วินาที', recommended: true },
    { k: 'morning', label: 'พรุ่งนี้ 09:00', sub: 'ช่วงคนตื่น เริ่มเลื่อน feed' },
    { k: 'evening', label: 'พรุ่งนี้ 19:00', sub: 'Peak hour — ทราฟฟิกสูงสุดของวัน' },
    { k: 'custom', label: 'กำหนดเอง', sub: 'เลือกวันและเวลาเอง' },
  ];

  return (
    <div className="bo-step bo-step-schedule">
      <div className="bo-step-l">
        <h3 className="bo-step-h">เริ่ม Boost เมื่อไหร่?</h3>
        <p className="bo-step-sub">เลือกช่วงเวลาที่กลุ่มเป้าหมายของคุณออนไลน์มากที่สุด</p>

        <div className="bo-slot-grid">
          {SLOTS.map(s => (
            <button
              key={s.k}
              className={'bo-slot' + (scheduleAt === s.k ? ' on' : '')}
              onClick={() => setScheduleAt(s.k)}
            >
              <div className="bo-slot-radio">
                <span></span>
              </div>
              <div className="bo-slot-main">
                <div className="bo-slot-l">
                  {s.label}
                  {s.recommended && <span className="bo-slot-rec">แนะนำ</span>}
                </div>
                <div className="bo-slot-s">{s.sub}</div>
              </div>
              {s.k === 'custom' && <BoostIcon name="calendar" size={16} />}
            </button>
          ))}
        </div>

        {scheduleAt === 'custom' && (
          <div className="bo-custom">
            <label>
              <span>วันที่</span>
              <input type="date" defaultValue={new Date().toISOString().slice(0,10)} />
            </label>
            <label>
              <span>เวลา</span>
              <input type="time" defaultValue="09:00" />
            </label>
          </div>
        )}

        <h3 className="bo-step-h" style={{marginTop:24}}>ตัวเลือกเสริม</h3>
        <label className="bo-toggle">
          <input
            type="checkbox"
            checked={autoRenew}
            onChange={e => setAutoRenew(e.target.checked)}
          />
          <span className="bo-toggle-track"><span className="bo-toggle-knob"/></span>
          <div className="bo-toggle-main">
            <div className="bo-toggle-l">ต่ออายุอัตโนมัติเมื่อ Boost หมดอายุ</div>
            <div className="bo-toggle-s">หักเหรียญและดัน Boost ใหม่ทันทีโดยใช้แพ็คเกจเดิม · ยกเลิกได้ทุกเมื่อ</div>
          </div>
        </label>

        <div className="bo-tips">
          <div className="bo-tips-h"><BoostIcon name="info" size={14}/> <span>เคล็ดลับเพิ่ม reach</span></div>
          <ul>
            <li>สินค้าราคา {'<'} ฿1,000 ขายเร็วใน 24 ชม. — เลือกแพ็ค <b>Boost 24 ชม.</b> ก็พอ</li>
            <li>สินค้าหรู / ของสะสม — แนะนำ <b>Featured 7 วัน</b> เพื่อโชว์ในหน้าแรก</li>
            <li>ตั้งเริ่ม Boost ตรงเวลา <b>19:00</b> ได้ผลดีกว่า 09:00 เฉลี่ย 23%</li>
          </ul>
        </div>
      </div>

      <div className="bo-step-r">
        <BoostReachChart pkg={pkg} dur={dur} isBundle={isBundle} bundleData={bundleData} />
        <BoostPreviewPanel product={product} pkg={pkg.k} bundle={isBundle ? bundleData.k : null} compact />
      </div>
    </div>
  );
}

// ----- Wizard step 3: review -----
function BoostStepReview({ product, pkg, dur, isBundle, bundleData, scheduleAt, autoRenew, balance, cost, after }) {
  const insufficient = after < 0;
  const startLabel = ({
    now: 'เริ่มทันที',
    morning: 'พรุ่งนี้ 09:00',
    evening: 'พรุ่งนี้ 19:00',
    custom: 'ตามที่ตั้งค่า',
  })[scheduleAt];

  return (
    <div className="bo-step bo-step-review">
      <div className="bo-step-l">
        <h3 className="bo-step-h">ตรวจสอบก่อนยืนยัน</h3>
        <p className="bo-step-sub">เมื่อกดยืนยัน เราจะหักเหรียญและเริ่ม Boost ตามเวลาที่คุณเลือก</p>

        <div className="bo-review-card">
          <BoostProductCard product={product} />
        </div>

        <div className="bo-review-list">
          <div className="bo-review-row">
            <span className="bo-review-l">แพ็คเกจ</span>
            <span className="bo-review-r">
              {isBundle ? (
                <>{bundleData.name}</>
              ) : (
                <><BoostIcon name={pkg.icon} size={14}/> {pkg.name} · {dur.d}</>
              )}
            </span>
          </div>
          <div className="bo-review-row">
            <span className="bo-review-l">ประมาณการเข้าถึง</span>
            <span className="bo-review-r">{isBundle ? '20,000+ คน' : dur.reach}</span>
          </div>
          <div className="bo-review-row">
            <span className="bo-review-l">เริ่มเมื่อ</span>
            <span className="bo-review-r">{startLabel}</span>
          </div>
          <div className="bo-review-row">
            <span className="bo-review-l">ต่ออายุอัตโนมัติ</span>
            <span className="bo-review-r">{autoRenew ? 'เปิด' : 'ปิด'}</span>
          </div>
        </div>

        <div className="bo-review-summary">
          <div className="bo-sum-row">
            <span>คงเหลือปัจจุบัน</span>
            <b>{balance.toLocaleString()} ◎</b>
          </div>
          <div className="bo-sum-row neg">
            <span>ใช้สำหรับ Boost</span>
            <b>− {cost} ◎</b>
          </div>
          {isBundle && (
            <div className="bo-sum-row save">
              <span>ประหยัดจาก Bundle</span>
              <b>− {bundleData.save} ◎</b>
            </div>
          )}
          <div className="bo-sum-row total">
            <span>คงเหลือหลังหัก</span>
            <b className={insufficient ? 'bad' : ''}>{after.toLocaleString()} ◎</b>
          </div>
          {insufficient && (
            <div className="bo-warn">
              <BoostIcon name="info" size={14}/>
              <span>เหรียญไม่พอ — เติมเหรียญก่อนเริ่ม Boost</span>
              <button className="bo-warn-cta" onClick={() => window.__openCoins && window.__openCoins()}>เติมเหรียญ</button>
            </div>
          )}
        </div>

        <p className="bo-fine">
          การกดยืนยันถือว่ายอมรับ <a href="#">ข้อกำหนดบริการ Boost</a> ·
          ขอคืนเหรียญได้หาก Boost ไม่มีข้อความใหม่ภายใน 48 ชม. (สำหรับสมาชิก Premium)
        </p>
      </div>

      <div className="bo-step-r">
        <BoostPreviewPanel product={product} pkg={pkg.k} bundle={isBundle ? bundleData.k : null} />
      </div>
    </div>
  );
}

// ============== Variation C: Bottom Sheet (mobile-first) ==============
function BoostBottomSheet({ product, onClose, onConfirmed }) {
  const [pkg, setPkg] = useBoostState('boost');
  const [durIdx, setDurIdx] = useBoostState(BOOST_PACKAGES.find(p=>p.k==='boost').durations.findIndex(d=>d.popular));
  const [step, setStep] = useBoostState('main'); // main | success
  const balance = 1240;

  const selectedPkg = BOOST_PACKAGES.find(p => p.k === pkg);
  const selectedDur = selectedPkg.durations[Math.max(0, durIdx)];
  const cost = selectedDur.coins;
  const after = balance - cost;
  const insufficient = after < 0;

  const handleConfirm = () => {
    setStep('success');
    setTimeout(() => onConfirmed && onConfirmed({ pkg, dur: selectedDur, cost }), 1200);
  };

  return (
    <div className="bo-overlay sheet" onClick={onClose}>
      <div className="bo-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="bo-sheet-handle"><span/></div>

        {step !== 'success' && (
          <>
            <div className="bo-sheet-head">
              <h2>Boost ประกาศ</h2>
              <div className="bo-balance-pill">
                <BoostIcon name="coin" size={12} />
                <b>{balance.toLocaleString()}</b>
              </div>
            </div>

            <div className="bo-sheet-product">
              <BoostProductCard product={product} compact />
            </div>

            <div className="bo-sheet-pkg-row">
              {BOOST_PACKAGES.map(p => (
                <button
                  key={p.k}
                  className={'bo-sheet-pkg' + (pkg === p.k ? ' on' : '') + ' c-' + p.color}
                  onClick={() => { setPkg(p.k); setDurIdx(p.durations.findIndex(d=>d.popular) || 0); }}
                >
                  <BoostIcon name={p.icon} size={20} />
                  <span>{p.name}</span>
                  <small>{p.coins}+◎</small>
                </button>
              ))}
            </div>

            <div className="bo-sheet-dur">
              <h4>{selectedPkg.name} — เลือกระยะเวลา</h4>
              <div className="bo-dur-row sheet">
                {selectedPkg.durations.map((d, i) => (
                  <button
                    key={i}
                    className={'bo-dur' + (durIdx === i ? ' on' : '')}
                    onClick={() => setDurIdx(i)}
                  >
                    <div className="bo-dur-d">{d.d}</div>
                    <div className="bo-dur-coins">{d.coins} ◎</div>
                    <div className="bo-dur-reach">{d.reach}</div>
                    {d.popular && <span className="bo-dur-pop">นิยม</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="bo-sheet-est">
              <div className="bo-sheet-est-row">
                <BoostIcon name="eye" size={14}/>
                <span>ประมาณการเข้าถึง</span>
                <b>{selectedDur.reach}</b>
              </div>
              <div className="bo-sheet-est-row">
                <BoostIcon name="msg" size={14}/>
                <span>คาดการข้อความใหม่</span>
                <b>+{Math.round(parseInt(selectedDur.reach.replace(/[^\d]/g,''))*0.012)} ข้อความ</b>
              </div>
            </div>

            {insufficient && (
              <div className="bo-warn sheet">
                <BoostIcon name="info" size={14}/>
                <span>เหรียญไม่พอ ขาด {Math.abs(after)} ◎</span>
                <button className="bo-warn-cta" onClick={() => window.__openCoins && window.__openCoins()}>เติม</button>
              </div>
            )}
          </>
        )}

        {step === 'success' && (
          <div className="bo-sheet-success">
            <BoostSuccess pkg={selectedPkg} dur={selectedDur} product={product} compact />
          </div>
        )}

        <div className="bo-sheet-foot">
          {step === 'success' ? (
            <button className="bo-btn primary lg full" onClick={onClose}>เสร็จสิ้น</button>
          ) : (
            <button
              className="bo-btn primary lg full"
              disabled={insufficient}
              onClick={handleConfirm}
            >
              <BoostIcon name="rocket" size={16}/>
              เริ่ม Boost · ใช้ {cost} ◎
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== Sub-components ==============

function BoostProductCard({ product, compact }) {
  if (!product) return null;
  return (
    <div className={'bo-prod' + (compact ? ' compact' : '')}>
      <div className="bo-prod-img">
        {window.Thumb ? <window.Thumb id={product.img} /> : <div className="bo-prod-img-ph" />}
      </div>
      <div className="bo-prod-main">
        <div className="bo-prod-title">{product.title}</div>
        <div className="bo-prod-meta">
          <span className="bo-prod-price">฿{product.price.toLocaleString()}</span>
          <span className="bo-prod-cat">{product.cat}</span>
          <span className="bo-prod-loc">{product.loc.split('·')[0].trim()}</span>
        </div>
      </div>
    </div>
  );
}

function BoostPreviewPanel({ product, pkg, bundle, compact }) {
  const has = (k) => bundle ? BOOST_BUNDLES.find(b=>b.k===bundle).items.includes(k) : pkg === k;
  const showBoost = has('boost');
  const showFeatured = has('featured');
  const showSuper = has('super');

  return (
    <div className={'bo-preview' + (compact ? ' compact' : '')}>
      <div className="bo-preview-h">
        <BoostIcon name="eye" size={14}/>
        <span>ตัวอย่างใน feed</span>
      </div>

      <div className="bo-preview-feed">
        {showFeatured && (
          <div className="bo-feed-section">
            <div className="bo-feed-section-h">
              <BoostIcon name="star" size={12}/>
              <span>FEATURED — สินค้าเด่นวันนี้</span>
            </div>
            <BoostFeedCard product={product} highlight tags={['FEATURED']} />
          </div>
        )}

        <div className="bo-feed-section">
          <div className="bo-feed-section-h plain">มือถือ &amp; แท็บเล็ต · ใหม่ล่าสุด</div>
          {showBoost && (
            <BoostFeedCard product={product} tags={['BOOST', ...(showFeatured?['FEATURED']:[])]} pinned />
          )}
          <BoostFeedCard product={null} ghost />
          <BoostFeedCard product={null} ghost />
        </div>

        {showSuper && (
          <div className="bo-feed-toast">
            <BoostIcon name="bolt" size={14}/>
            <div>
              <b>Super Bump ส่งแล้ว</b>
              <span>แจ้งเตือน 3,500 follower และผู้สนใจของใกล้เคียง</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BoostFeedCard({ product, tags = [], pinned, ghost, highlight }) {
  if (ghost) {
    return (
      <div className="bo-feed-card ghost">
        <div className="bo-feed-card-img"/>
        <div className="bo-feed-card-bar a"/>
        <div className="bo-feed-card-bar b"/>
      </div>
    );
  }
  return (
    <div className={'bo-feed-card' + (pinned ? ' pinned' : '') + (highlight ? ' highlight' : '')}>
      <div className="bo-feed-card-img">
        {window.Thumb ? <window.Thumb id={product.img} /> : null}
        <div className="bo-feed-card-tags">
          {tags.map(t => <span key={t} className={'bo-feed-tag t-' + t.toLowerCase()}>{t}</span>)}
        </div>
      </div>
      <div className="bo-feed-card-body">
        <div className="bo-feed-card-t">{product.title}</div>
        <div className="bo-feed-card-p">฿{product.price.toLocaleString()}</div>
      </div>
    </div>
  );
}

function BoostReachChart({ pkg, dur, isBundle, bundleData }) {
  // tiny synthetic 7-day bar chart
  const baseline = 100;
  const boost = isBundle ? 8.4 : (pkg.k === 'boost' ? 4.2 : pkg.k === 'featured' ? 6.8 : pkg.k === 'super' ? 3.1 : 2.0);
  const days = 7;
  const points = Array.from({length: days * 2}, (_, i) => {
    const isBoosted = i >= days;
    return Math.round(baseline * (isBoosted ? boost : 1) * (0.7 + Math.random() * 0.6));
  });
  const max = Math.max(...points);

  return (
    <div className="bo-chart">
      <div className="bo-chart-h">
        <div>
          <h4>ประมาณการ reach</h4>
          <p>เทียบ 7 วันก่อน Boost vs 7 วันหลัง</p>
        </div>
        <div className="bo-chart-mult">×{boost.toFixed(1)}</div>
      </div>
      <div className="bo-chart-bars">
        {points.map((v, i) => (
          <div
            key={i}
            className={'bo-chart-bar' + (i >= days ? ' boosted' : '')}
            style={{height: `${(v / max) * 100}%`}}
          />
        ))}
        <div className="bo-chart-divider" style={{left: '50%'}}>
          <span>เริ่ม Boost</span>
        </div>
      </div>
      <div className="bo-chart-axis">
        <span>−7 วัน</span>
        <span>วันนี้</span>
        <span>+7 วัน</span>
      </div>
    </div>
  );
}

function BoostSuccess({ pkg, dur, product, bundleData, compact }) {
  return (
    <div className={'bo-success' + (compact ? ' compact' : '')}>
      <div className="bo-success-ic">
        <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="28" className="bo-success-ring"/>
          <path d="M20 32l8 8 16-16" className="bo-success-check"/>
        </svg>
      </div>
      <h2>เริ่ม Boost สำเร็จ</h2>
      <p>
        {bundleData
          ? <>ประกาศของคุณกำลังถูกดันด้วย <b>{bundleData.name}</b></>
          : <>ประกาศของคุณกำลังถูก Boost ด้วย <b>{pkg.name} · {dur.d}</b></>}
      </p>
      <div className="bo-success-stats">
        <div><BoostIcon name="eye" size={14}/><b>{bundleData ? '20,000+' : dur.reach}</b><span>ประมาณการ reach</span></div>
        <div><BoostIcon name="msg" size={14}/><b>+{Math.round(parseInt((dur.reach||'').replace(/[^\d]/g,''))*0.012)||40}</b><span>คาดการข้อความใหม่</span></div>
        <div><BoostIcon name="check" size={14}/><b>เริ่มแล้ว</b><span>ติดตามใน MyHub</span></div>
      </div>
    </div>
  );
}

Object.assign(window, { V12Boost, BOOST_PACKAGES, BOOST_BUNDLES });
