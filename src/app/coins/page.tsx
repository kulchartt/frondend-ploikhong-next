'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CoinPack { key: string; coins: number; bonus: number; price: number; popular?: boolean; }
interface ActiveFeature { id: number; feature_key: string; product_id: number | null; product_title?: string; expires_at: string | null; stats?: any; }
interface TxRow { id: number; type: string; amount: number; description: string; created_at: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const PAY_METHODS = [
  { id: 'promptpay', label: 'PromptPay', sub: 'สแกน QR · โอนทันที', ic: 'PP' },
  { id: 'card',      label: 'บัตรเครดิต / เดบิต', sub: 'Visa · Mastercard · JCB', ic: 'CC' },
  { id: 'truemoney', label: 'TrueMoney Wallet', sub: 'โอนผ่านแอป TrueMoney', ic: 'TM' },
  { id: 'linepay',   label: 'LINE Pay', sub: 'โอนผ่าน LINE', ic: 'LP' },
];

const PREMIUM_PERKS = [
  { ic: '✨', title: 'Boost อัตโนมัติทุก 7 วัน', desc: 'ประกาศของคุณถูกดันขึ้นบนสุดโดยอัตโนมัติทุกสัปดาห์ เลือกได้สูงสุด 3 ประกาศ', live: true },
  { ic: '⭐', title: 'ป้าย Premium สีทอง', desc: 'ได้ป้ายสีทองใต้ชื่อ ผู้ซื้อมั่นใจกว่าเดิม ขายของได้เร็วขึ้น 3 เท่า', live: true },
  { ic: '🔎', title: 'Insight แบบละเอียด', desc: 'ดูข้อมูลผู้เข้าชม ช่วงเวลาที่คนสนใจ เปรียบเทียบกับคู่แข่ง', live: false },
  { ic: '⚡', title: 'ตอบอัตโนมัติ AI', desc: 'ตั้งข้อความตอบกลับเร็วใน 1 วินาที ไม่พลาดลูกค้า', live: false },
  { ic: '🛡️', title: 'ประกันผู้ขาย', desc: 'คืนเหรียญ Boost ถ้าไม่มีข้อความภายใน 48 ชม. หลัง Boost', live: true },
  { ic: '📊', title: 'รายงานรายเดือน', desc: 'สรุปยอดขาย + คำแนะนำจาก AI ส่งทุกต้นเดือน', live: false },
];

const FEATURE_COINS: Record<string, number> = {
  featured: 80, auto_relist: 30, price_alert: 25, analytics_pro: 50, priority_support: 15,
};

function fmtDate(d: string) { return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }); }
function fmtMoney(n: number) { return '฿' + n.toLocaleString('th-TH', { maximumFractionDigits: 0 }); }

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IcoBack() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>; }
function IcoClose() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>; }
function IcoInfo() { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={16} x2={12} y2={12}/><line x1={12} y1={8} x2={12.01} y2={8}/></svg>; }

// ─── Checkout Modal ───────────────────────────────────────────────────────────
type CheckoutStep = 'review' | 'paying' | 'success';
interface CheckoutItem { label: string; coins: number; price: number; packKey: string; }

function CheckoutModal({ item, token, onClose, onSuccess }: { item: CheckoutItem; token: string; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [payMethod, setPayMethod] = useState('promptpay');
  const [senderName, setSenderName] = useState('');
  const [consent, setConsent] = useState(true);
  const [txId, setTxId] = useState('');
  const [err, setErr] = useState('');

  async function handlePay() {
    if (!consent) { setErr('กรุณายอมรับเงื่อนไขก่อนชำระเงิน'); return; }
    setErr('');
    setStep('paying');
    try {
      const result = await api.requestCoinPayment({ package_key: item.packKey, sender_name: senderName || 'ผู้ใช้' }, token);
      setTxId(result?.id ? `TXN-${result.id}` : `TXN-${Date.now()}`);
      setTimeout(() => setStep('success'), 1800);
    } catch (e: any) {
      setStep('review');
      setErr(e.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  }

  return (
    <div className="co-ck-overlay" onClick={onClose}>
      <div className="co-ck" onClick={e => e.stopPropagation()}>
        <div className="co-ck-head">
          <h2>{step === 'success' ? 'ชำระเงินสำเร็จ' : step === 'paying' ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}</h2>
          {step !== 'paying' && <button className="co-ck-close" onClick={onClose}><IcoClose /></button>}
        </div>

        {step === 'paying' && (
          <div className="co-ck-paying">
            <div className="co-spinner" />
            <h3>กำลังประมวลผล...</h3>
            <p>กรุณารอสักครู่ ห้ามปิดหน้าต่างนี้</p>
          </div>
        )}

        {step === 'success' && (
          <div className="co-ck-success">
            <div className="co-check-ic">
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3>ชำระเงินสำเร็จ!</h3>
            <p>ทีมงานจะตรวจสอบและเติมเหรียญให้คุณภายใน 30 นาที</p>
            <div className="co-ck-rcpt">
              <div><span>แพ็กเกจ</span><b>{item.label}</b></div>
              <div><span>เหรียญ</span><b>{item.coins.toLocaleString()} เหรียญ</b></div>
              <div><span>จำนวนเงิน</span><b>{fmtMoney(item.price)}</b></div>
              <div><span>หมายเลขอ้างอิง</span><b>{txId}</b></div>
            </div>
            <button className="btn btn-primary" onClick={() => { onSuccess(); onClose(); }} style={{ width: '100%', marginTop: 8 }}>เสร็จสิ้น</button>
          </div>
        )}

        {step === 'review' && (
          <>
            <div className="co-ck-body">
              {/* Item */}
              <div className="co-ck-item">
                <div className="co-ck-item-ic">🪙</div>
                <div className="co-ck-item-main">
                  <div className="co-ck-item-t">{item.label}</div>
                  <div className="co-ck-item-s">{item.coins.toLocaleString()} เหรียญ</div>
                </div>
                <div className="co-ck-item-p">{fmtMoney(item.price)}</div>
              </div>

              {/* Payment method */}
              <div className="co-ck-sec">
                <h3>วิธีการชำระเงิน</h3>
                {PAY_METHODS.map(m => (
                  <button key={m.id} className={`co-pay${payMethod === m.id ? ' on' : ''}`} onClick={() => setPayMethod(m.id)}>
                    <div className="co-pay-ic">{m.ic}</div>
                    <div className="co-pay-main">
                      <div className="co-pay-nm">{m.label}</div>
                      <div className="co-pay-s">{m.sub}</div>
                    </div>
                    <div className={`co-pay-radio${payMethod === m.id ? ' on' : ''}`} />
                  </button>
                ))}
              </div>

              {/* Sender name */}
              <div className="co-ck-sec">
                <h3>ชื่อผู้โอน <span style={{ fontWeight: 400, color: 'var(--ink-3)', textTransform: 'none' }}>(ไม่บังคับ)</span></h3>
                <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="ชื่อผู้โอนเงิน เพื่อให้ยืนยันได้เร็วขึ้น"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--ink)', boxSizing: 'border-box' }} />
              </div>

              {/* Summary */}
              <div className="co-ck-sum">
                <div className="co-ck-sum-r"><span>ราคาสินค้า</span><b>{fmtMoney(item.price)}</b></div>
                <div className="co-ck-sum-r"><span>ค่าธรรมเนียม</span><b>฿0</b></div>
                <div className="co-ck-sum-r total"><span>รวมทั้งหมด</span><b>{fmtMoney(item.price)}</b></div>
                <div className="co-ck-sum-note">* เหรียญจะเข้าบัญชีภายใน 30 นาทีหลังยืนยันการชำระเงิน</div>
              </div>

              {/* Consent */}
              <label className="co-ck-consent">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                <span>ยอมรับ <a onClick={e => e.preventDefault()}>เงื่อนไขการให้บริการ</a> และ <a onClick={e => e.preventDefault()}>นโยบายการคืนเงิน</a></span>
              </label>

              {err && <div style={{ fontSize: 13, color: 'var(--neg)', padding: '8px 12px', background: 'color-mix(in srgb,var(--neg) 8%,transparent)', borderRadius: 6 }}>{err}</div>}
            </div>

            <div className="co-ck-foot">
              <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handlePay} disabled={!consent} style={{ flex: 1 }}>
                ชำระเงิน {fmtMoney(item.price)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── TopupTab ─────────────────────────────────────────────────────────────────
function TopupTab({ token, balance, onRefresh }: { token: string; balance: number; onRefresh: () => void }) {
  const [packages, setPackages] = useState<CoinPack[]>([]);
  const [checkout, setCheckout] = useState<CheckoutItem | null>(null);

  useEffect(() => {
    api.getCoinPackages().then(data => {
      const packs: CoinPack[] = (data.packages || []).map((p: any) => ({
        key: p.key || p.package_key,
        coins: p.coins,
        bonus: p.bonus || 0,
        price: p.price,
        popular: p.popular,
      }));
      setPackages(packs.length ? packs : [
        { key: 'coins_100', coins: 100, bonus: 0, price: 35, popular: false },
        { key: 'coins_300', coins: 300, bonus: 20, price: 99, popular: false },
        { key: 'coins_600', coins: 600, bonus: 60, price: 185, popular: true },
        { key: 'coins_1200', coins: 1200, bonus: 150, price: 349, popular: false },
        { key: 'coins_3000', coins: 3000, bonus: 500, price: 799, popular: false },
        { key: 'coins_6000', coins: 6000, bonus: 1500, price: 1490, popular: false },
      ]);
    }).catch(() => {});
  }, []);

  return (
    <div className="co-body">
      <div className="co-hero">
        <h2>ใช้เหรียญเพื่อ <b>Boost</b> ประกาศหรือซื้อป้าย Featured</h2>
        <p>1 Boost = 30 เหรียญ · Featured 7 วัน = 80 เหรียญ · เหรียญไม่หมดอายุ</p>
      </div>

      <div className="co-grid">
        {packages.map(p => (
          <div key={p.key} className={`co-card${p.popular ? ' pop' : ''}`}>
            {p.popular && <div className="co-tag">ยอดนิยม</div>}
            <div className="co-coins">🪙 {(p.coins + p.bonus).toLocaleString()}</div>
            {p.bonus > 0 && <div className="co-bonus">+ โบนัส {p.bonus.toLocaleString()} เหรียญ</div>}
            <div className="co-price">{fmtMoney(p.price)}</div>
            <div className="co-perprice">{(p.price / (p.coins + p.bonus || 1) * 100).toFixed(1)} สต./เหรียญ</div>
            <button className="btn btn-primary" onClick={() => setCheckout({ label: `${(p.coins + p.bonus).toLocaleString()} เหรียญ`, coins: p.coins + p.bonus, price: p.price, packKey: p.key })}>
              ซื้อแพ็คนี้
            </button>
          </div>
        ))}
      </div>

      <div className="co-hint">
        <IcoInfo />
        <span>เหรียญไม่หมดอายุ · สามารถขอเงินคืนได้ภายใน 14 วันถ้ายังไม่ใช้งาน</span>
      </div>

      {checkout && (
        <CheckoutModal
          item={checkout}
          token={token}
          onClose={() => setCheckout(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}

// ─── ActiveBoostsTab ──────────────────────────────────────────────────────────
function ActiveBoostsTab({ token }: { token: string }) {
  const [features, setFeatures] = useState<ActiveFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActiveFeatures(token).then(data => { setFeatures(data || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="co-body" style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>กำลังโหลด...</div>;

  return (
    <div className="co-body">
      <div className="co-actives-head">
        <h2>ประกาศที่กำลัง Boost</h2>
        <p>ดูสถานะการใช้งาน Boost/Featured ของคุณแบบเรียลไทม์</p>
      </div>

      {features.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>ยังไม่มีประกาศที่กำลัง Boost</div>
          <div style={{ fontSize: 14 }}>ไปที่แท็บ "เติมเหรียญ" เพื่อซื้อแพ็กเกจ แล้วเปิด Boost บนหน้าประกาศ</div>
        </div>
      ) : (
        <div className="co-actives">
          {features.map(f => {
            const featureLabels: Record<string, string> = {
              featured: 'สินค้าเด่น', auto_relist: 'ดันสินค้า', price_alert: 'แจ้งเตือนราคา',
            };
            const isFeatured = f.feature_key === 'featured';
            const daysLeft = f.expires_at ? Math.max(0, Math.ceil((new Date(f.expires_at).getTime() - Date.now()) / 86400000)) : null;
            return (
              <div key={f.id} className={`co-active ${isFeatured ? 'featured' : 'boost'}`}>
                <div style={{ width: 90, height: 90, borderRadius: 8, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontSize: 32 }}>
                  {isFeatured ? '⭐' : '🚀'}
                </div>
                <div className="co-active-main">
                  <div className="co-active-top">
                    <h3>{f.product_title || featureLabels[f.feature_key] || f.feature_key}</h3>
                    <span className={`co-active-tag ${isFeatured ? 'featured' : 'boost'}`}>{featureLabels[f.feature_key] || f.feature_key}</span>
                  </div>
                  <div className="co-active-meta">
                    {daysLeft !== null ? `เหลือ <b>${daysLeft} วัน</b>` : 'ไม่มีวันหมดอายุ'}
                    {f.expires_at && ` · หมดอายุ ${fmtDate(f.expires_at)}`}
                  </div>
                  {daysLeft !== null && (
                    <div className="co-active-bar">
                      <div className="co-active-fill" style={{ width: `${Math.min(100, (daysLeft / 7) * 100)}%` }} />
                    </div>
                  )}
                </div>
                <div className="co-active-actions">
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }}>ต่ออายุ</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PremiumTab ───────────────────────────────────────────────────────────────
function PremiumTab() {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const monthly = 129;
  const yearly = 1290;

  return (
    <div className="co-body">
      <div className="co-prem-hero">
        <div className="co-prem-left">
          <span className="co-prem-eyebrow">PLOIKHONG PREMIUM</span>
          <h2>ขายได้มากกว่า ด้วย Premium</h2>
          <p>เข้าถึงทุกฟีเจอร์ระดับพรีเมียม เพิ่มโอกาสการขาย</p>
          <div className="co-plan-toggle">
            <button className={plan === 'monthly' ? 'on' : ''} onClick={() => setPlan('monthly')}>รายเดือน</button>
            <button className={plan === 'yearly' ? 'on' : ''} onClick={() => setPlan('yearly')}>
              รายปี <span className="co-save">-17%</span>
            </button>
          </div>
          <div className="co-price-display">
            <span className="co-price-amt">{plan === 'monthly' ? fmtMoney(monthly) : fmtMoney(yearly)}</span>
            <span className="co-price-per">/ {plan === 'monthly' ? 'เดือน' : 'ปี'}</span>
            {plan === 'yearly' && <div className="co-price-sub">ประหยัด {fmtMoney(monthly * 12 - yearly)} ต่อปี</div>}
          </div>
          <button className="btn btn-primary co-prem-cta" style={{ padding: '12px 24px', fontSize: 15, fontWeight: 700 }}>
            เริ่มใช้ Premium ฟรี 7 วัน
          </button>
          <div className="co-prem-fine">ไม่มีค่าใช้จ่ายใน 7 วันแรก · ยกเลิกได้ทุกเมื่อ</div>
        </div>
        <div className="co-prem-right">
          <div className="co-prem-card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 10 }}>PREMIUM MEMBER</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-.02em' }}>PLOI★</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>ปลดล็อคทุกฟีเจอร์</div>
          </div>
        </div>
      </div>

      <div className="co-perks-h">สิทธิพิเศษที่คุณจะได้รับ</div>
      <div className="co-perks">
        {PREMIUM_PERKS.map(perk => (
          <div key={perk.title} className={`co-perk${perk.live ? ' live' : ''}`}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{perk.ic}</div>
            <div className="co-perk-body">
              <h4>{perk.title}</h4>
              <p>{perk.desc}</p>
              {perk.live && <span className="co-perk-tag">ใช้งานอยู่</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="co-prem-faq">
        <h3>คำถามที่พบบ่อย</h3>
        {[
          { q: 'ยกเลิก Premium ได้ไหม?', a: 'ยกเลิกได้ทุกเมื่อผ่านหน้าตั้งค่าบัญชี เหรียญที่เหลืออยู่ไม่หายไป' },
          { q: 'เหรียญที่ซื้อไว้ใช้ต่อได้ไหม?', a: 'ได้เลย เหรียญไม่มีวันหมดอายุ ใช้ได้ทุกเมื่อ' },
          { q: 'ชำระเงินผ่านช่องทางไหนได้บ้าง?', a: 'PromptPay, บัตรเครดิต/เดบิต, TrueMoney Wallet, LINE Pay' },
        ].map(item => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

// ─── HistoryTab ───────────────────────────────────────────────────────────────
function HistoryTab({ token }: { token: string }) {
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    api.getCoinTransactions(token).then(data => setTxs(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const filtered = typeFilter ? txs.filter(t => (typeFilter === 'credit' ? t.amount > 0 : t.amount < 0)) : txs;
  const totalIn = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  if (loading) return <div className="co-body" style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>กำลังโหลด...</div>;

  return (
    <div className="co-body">
      <div className="co-hist-head">
        <h2>ประวัติการใช้</h2>
        <div className="co-hist-filters">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">ทั้งหมด</option>
            <option value="credit">รับเข้า</option>
            <option value="debit">ใช้ไป</option>
          </select>
        </div>
      </div>

      <div className="co-hist-summary">
        <div><b>{totalIn.toLocaleString()}</b><span>เหรียญที่ได้รับ</span></div>
        <div><b>{totalOut.toLocaleString()}</b><span>เหรียญที่ใช้</span></div>
        <div><b>{(totalIn - totalOut).toLocaleString()}</b><span>คงเหลือ (จากประวัติ)</span></div>
      </div>

      <div className="co-hist">
        {filtered.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--surface)', color: 'var(--ink-3)', fontSize: 14 }}>ยังไม่มีประวัติธุรกรรม</div>
        )}
        {filtered.map(t => {
          const isPos = t.amount > 0;
          return (
            <div key={t.id} className="co-hist-row">
              <div className={`co-hist-ic ${isPos ? 'pos' : 'neg'}`}>
                <span style={{ fontSize: 16 }}>{isPos ? '↓' : '↑'}</span>
              </div>
              <div className="co-hist-main">
                <div className="co-hist-t">{t.description || (isPos ? 'รับเหรียญ' : 'ใช้เหรียญ')}</div>
                <div className="co-hist-s co-hist-method">{fmtDate(t.created_at)}</div>
              </div>
              <div className="co-hist-r">
                <div className={`co-hist-n ${isPos ? 'pos' : 'neg'}`}>{isPos ? '+' : ''}{t.amount.toLocaleString()} 🪙</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoinsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token: string | undefined = (session as any)?.token;

  const [tab, setTab] = useState<'topup' | 'boosts' | 'premium' | 'history'>('topup');
  const [balance, setBalance] = useState(0);

  function refreshBalance() {
    if (!token) return;
    api.getCoinBalance(token).then(data => setBalance(data.balance || 0)).catch(() => {});
  }

  useEffect(() => { refreshBalance(); }, [token]);

  if (status === 'loading') return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>กำลังโหลด...</div>;
  if (!session?.user) { if (typeof window !== 'undefined') router.push('/'); return null; }

  const tabs: Array<{ key: typeof tab; label: string }> = [
    { key: 'topup',   label: 'เติมเหรียญ' },
    { key: 'boosts',  label: 'Boost ที่ใช้งาน' },
    { key: 'premium', label: 'Premium' },
    { key: 'history', label: 'ประวัติการใช้' },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', height: 56, borderBottom: '1px solid var(--line)', background: 'var(--surface)', flexShrink: 0 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', padding: 4, display: 'flex' }}><IcoBack /></button>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', flex: 1 }}>เหรียญ & Premium</div>
        <div className="co-balance">
          <span className="co-ic">◎</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{balance.toLocaleString()}</span>
          <span style={{ fontWeight: 400, fontSize: 11, opacity: .8 }}>เหรียญ</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="co-tabs">
        {tabs.map(t => (
          <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'topup'   && token && <TopupTab    token={token} balance={balance} onRefresh={refreshBalance} />}
      {tab === 'boosts'  && token && <ActiveBoostsTab token={token} />}
      {tab === 'premium' && <PremiumTab />}
      {tab === 'history' && token && <HistoryTab  token={token} />}
    </div>
  );
}
