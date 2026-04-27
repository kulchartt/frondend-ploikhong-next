'use client';

import { useState, useEffect } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface BoostProduct {
  id: number;
  title: string;
  price: number;
  images?: string[];
  image_url?: string;
  category?: string;
  location?: string;
}

interface BoostDuration { d: string; coins: number; reach: string; popular?: boolean; }
interface BoostPackage { k: string; name: string; icon: string; desc: string; coins: number; durations: BoostDuration[]; color: string; }

interface BoostResult { pkg: string; dur: BoostDuration; cost: number; }

export interface BoostModalProps {
  product: BoostProduct | null;
  token: string;
  onClose: () => void;
  onConfirmed?: (result: BoostResult) => void;
  variant?: 'A' | 'C';
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const BOOST_PACKAGES: BoostPackage[] = [
  {
    k: 'boost', name: 'Boost', icon: 'rocket', color: 'accent',
    desc: 'ดันประกาศขึ้นบนสุดของหมวดและ feed', coins: 30,
    durations: [
      { d: '24 ชม.', coins: 30, reach: '~800 คน' },
      { d: '3 วัน', coins: 70, reach: '~2,400 คน' },
      { d: '7 วัน', coins: 140, reach: '~5,800 คน', popular: true },
    ],
  },
  {
    k: 'featured', name: 'Featured', icon: 'star', color: 'warn',
    desc: 'ป้าย Featured + ขึ้น Featured Section หน้าแรก', coins: 80,
    durations: [
      { d: '7 วัน', coins: 80, reach: '~12,000 คน', popular: true },
      { d: '14 วัน', coins: 150, reach: '~22,000 คน' },
      { d: '30 วัน', coins: 280, reach: '~42,000 คน' },
    ],
  },
  {
    k: 'super', name: 'Super Bump', icon: 'bolt', color: 'accent',
    desc: 'ส่ง push ให้ผู้ติดตามและคนที่เคยดูสินค้าใกล้เคียง', coins: 120,
    durations: [
      { d: 'ยิงครั้งเดียว', coins: 120, reach: '~3,500 คน', popular: true },
    ],
  },
  {
    k: 'autorelist', name: 'Auto-Relist', icon: 'refresh', color: 'pos',
    desc: 'auto-bump ทุก 7 วัน เป็นเวลา 30 วัน', coins: 20,
    durations: [
      { d: '30 วัน', coins: 20, reach: '~6,200 คน', popular: true },
    ],
  },
];

// backend feature key map — backend uses 'featured'/'auto_relist', not 'boost'/'super'
const FEATURE_KEY_MAP: Record<string, string> = {
  boost: 'featured',
  featured: 'featured',
  super: 'featured',
  autorelist: 'auto_relist',
};

// ─── Icons ─────────────────────────────────────────────────────────────────────

function BoostIcon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    rocket:  <path d="M5 19c1-4 4-7 8-8l3-3 3 3-3 3c-1 4-4 7-8 8M9 15l-2 2M5 19h-2"/>,
    star:    <path d="M12 3l3 6 6 1-4.5 4.5 1 6.5L12 18l-5.5 3 1-6.5L3 10l6-1z"/>,
    bolt:    <path d="M13 3L4 14h6l-1 7 9-11h-6z"/>,
    refresh: <><path d="M3 12a9 9 0 1015 6.7M21 21l-2.5-2.5"/><path d="M21 8v5h-5"/></>,
    coin:    <><circle cx="12" cy="12" r="9"/><path d="M9 9h4a2 2 0 010 4H9v4M9 9v4M16 9l-2 2"/></>,
    eye:     <><circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/></>,
    msg:     <path d="M21 11a8 8 0 11-3-6.2L21 4l-1 4.2A8 8 0 0121 11z"/>,
    check:   <path d="M5 13l4 4L19 7"/>,
    info:    <><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v4h1"/></>,
    close:   <path d="M6 6l12 12M6 18L18 6"/>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.info}
    </svg>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function BoostProductCard({ product, compact }: { product: BoostProduct; compact?: boolean }) {
  const img = product.images?.[0] || product.image_url;
  return (
    <div className={'bo-prod' + (compact ? ' compact' : '')}>
      <div className="bo-prod-img">
        {img
          ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div className="bo-prod-img-ph" />}
      </div>
      <div className="bo-prod-main">
        <div className="bo-prod-title">{product.title}</div>
        <div className="bo-prod-meta">
          <span className="bo-prod-price">฿{product.price.toLocaleString()}</span>
          {product.category && <span className="bo-prod-cat">{product.category}</span>}
          {product.location && <span className="bo-prod-loc">{product.location.split('·')[0].trim()}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Success ───────────────────────────────────────────────────────────────────

function BoostSuccess({ pkg, dur }: { pkg: BoostPackage; dur: BoostDuration }) {
  const msgCount = Math.round(parseInt(dur.reach.replace(/[^\d]/g, '')) * 0.012) || 40;
  return (
    <div className="bo-success">
      <div className="bo-success-ic">
        <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="28" className="bo-success-ring" />
          <path d="M20 32l8 8 16-16" className="bo-success-check" />
        </svg>
      </div>
      <h2>เริ่ม Boost สำเร็จ</h2>
      <p>ประกาศของคุณกำลังถูก Boost ด้วย <b>{pkg.name} · {dur.d}</b></p>
      <div className="bo-success-stats">
        <div><BoostIcon name="eye" size={14} /><b>{dur.reach}</b><span>ประมาณการ reach</span></div>
        <div><BoostIcon name="msg" size={14} /><b>+{msgCount}</b><span>คาดการข้อความใหม่</span></div>
        <div><BoostIcon name="check" size={14} /><b>เริ่มแล้ว</b><span>ติดตามใน MyHub</span></div>
      </div>
    </div>
  );
}

// ─── Product Picker ────────────────────────────────────────────────────────────

function BoostProductPicker({ token, onSelect, onClose }: { token: string; onSelect: (p: BoostProduct) => void; onClose: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.getMyProducts(token)
      .then(ps => setProducts(Array.isArray(ps) ? ps.filter((p: any) => p.status !== 'sold' && p.status !== 'hidden') : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = q ? products.filter(p => p.title?.toLowerCase().includes(q.toLowerCase())) : products;

  return (
    <div className="bo-overlay" onClick={onClose}>
      <div className="bo-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="bo-modal-head">
          <h2>เลือกประกาศที่จะ Boost</h2>
          <button className="bo-x" onClick={onClose} aria-label="ปิด"><BoostIcon name="close" /></button>
        </div>
        <div className="bo-modal-body" style={{ gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }}>
              <BoostIcon name="search" size={15} />
            </span>
            <input
              placeholder="ค้นหาประกาศ..."
              value={q} onChange={e => setQ(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 14, background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'inherit', outline: 'none' }}
            />
          </div>

          {loading && <div style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>กำลังโหลด...</div>}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--ink-3)' }}>
              {q ? 'ไม่พบประกาศ' : 'ยังไม่มีประกาศที่กำลังขาย'}
            </div>
          )}

          {filtered.map(p => {
            const img = p.images?.[0] || p.image_url;
            return (
              <button key={p.id} onClick={() => onSelect(p)}
                style={{ display: 'flex', gap: 12, padding: '12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)' }}>
                  {img
                    ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'var(--line)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>฿{(p.price || 0).toLocaleString()}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Shared boost flow hook ────────────────────────────────────────────────────

function useBoostFlow(token: string, product: BoostProduct, onConfirmed?: (r: BoostResult) => void) {
  const [balance, setBalance] = useState<number | null>(null);
  const [pkg, setPkgKey] = useState('boost');
  const [durIdx, setDurIdx] = useState(() => {
    const p = BOOST_PACKAGES.find(p => p.k === 'boost')!;
    return Math.max(0, p.durations.findIndex(d => d.popular));
  });
  const [step, setStep] = useState<'select' | 'success'>('select');
  const [err, setErr] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api.getCoinBalance(token).then(d => setBalance(d.balance)).catch(() => setBalance(null));
  }, [token]);

  const selectedPkg = BOOST_PACKAGES.find(p => p.k === pkg)!;
  const safeIdx = Math.max(0, Math.min(durIdx, selectedPkg.durations.length - 1));
  const selectedDur = selectedPkg.durations[safeIdx];
  const cost = selectedDur.coins;
  const after = balance !== null ? balance - cost : null;
  const insufficient = after !== null && after < 0;
  const balanceLoading = balance === null;

  function switchPkg(k: string) {
    setPkgKey(k);
    const p = BOOST_PACKAGES.find(x => x.k === k)!;
    setDurIdx(Math.max(0, p.durations.findIndex(d => d.popular)));
    setErr('');
  }

  async function handleConfirm() {
    setErr(''); setConfirming(true);
    try {
      const mappedKey = FEATURE_KEY_MAP[selectedPkg.k] || selectedPkg.k;
      await api.activateFeature(mappedKey, product.id, token);
      setStep('success');
      onConfirmed?.({ pkg: selectedPkg.k, dur: selectedDur, cost });
    } catch (e: any) {
      setErr(e.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally { setConfirming(false); }
  }

  return { balance, pkg, switchPkg, durIdx, setDurIdx, step, err, confirming, handleConfirm, selectedPkg, selectedDur, cost, after, insufficient, balanceLoading };
}

// ─── Variant A: Classic Modal ──────────────────────────────────────────────────

function BoostVariantA({ product, token, onClose, onConfirmed }: { product: BoostProduct; token: string; onClose: () => void; onConfirmed?: (r: BoostResult) => void }) {
  const { balance, pkg, switchPkg, durIdx, setDurIdx, step, err, confirming, handleConfirm, selectedPkg, selectedDur, cost, after, insufficient, balanceLoading } = useBoostFlow(token, product, onConfirmed);

  return (
    <div className="bo-overlay" onClick={step !== 'success' ? onClose : undefined}>
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
                <button key={p.k} className={'bo-pkg-tab' + (pkg === p.k ? ' on' : '')} onClick={() => switchPkg(p.k)}>
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
                  <button key={i} className={'bo-dur' + (durIdx === i ? ' on' : '')} onClick={() => setDurIdx(i)}>
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
                <b>{balanceLoading ? '...' : balance!.toLocaleString()} ◎</b>
              </div>
              <div className="bo-sum-row neg">
                <span>ใช้สำหรับ Boost ครั้งนี้</span>
                <b>− {cost} ◎</b>
              </div>
              <div className="bo-sum-row total">
                <span>คงเหลือหลังหัก</span>
                <b className={insufficient ? 'bad' : ''}>{after !== null ? after.toLocaleString() : '...'} ◎</b>
              </div>
              {insufficient && (
                <div className="bo-warn">
                  <BoostIcon name="info" size={14} />
                  <span>เหรียญไม่พอ — เติมเหรียญก่อนเริ่ม Boost</span>
                  <button className="bo-warn-cta" onClick={() => { window.location.href = '/coins'; }}>เติมเหรียญ</button>
                </div>
              )}
              {err && (
                <div className="bo-warn">
                  <BoostIcon name="info" size={14} />
                  <span>{err}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'success' && <BoostSuccess pkg={selectedPkg} dur={selectedDur} />}

        <div className="bo-modal-foot">
          {step === 'success' ? (
            <button className="bo-btn primary lg" onClick={onClose}>เสร็จสิ้น</button>
          ) : (
            <>
              <button className="bo-btn ghost" onClick={onClose}>ยกเลิก</button>
              <button className="bo-btn primary" disabled={insufficient || confirming || balanceLoading} onClick={handleConfirm}>
                {confirming ? 'กำลังดำเนินการ...' : `ยืนยัน Boost · ใช้ ${cost} ◎`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Variant C: Bottom Sheet (mobile) ─────────────────────────────────────────

function BoostVariantC({ product, token, onClose, onConfirmed }: { product: BoostProduct; token: string; onClose: () => void; onConfirmed?: (r: BoostResult) => void }) {
  const { balance, pkg, switchPkg, durIdx, setDurIdx, step, err, confirming, handleConfirm, selectedPkg, selectedDur, cost, insufficient, balanceLoading } = useBoostFlow(token, product, onConfirmed);

  return (
    <div className="bo-overlay sheet" onClick={step !== 'success' ? onClose : undefined}>
      <div className="bo-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="bo-sheet-handle"><span /></div>

        {step !== 'success' && (
          <>
            <div className="bo-sheet-head">
              <h2>Boost ประกาศ</h2>
              <div className="bo-balance-pill">
                <BoostIcon name="coin" size={12} />
                <b>{balanceLoading ? '...' : balance!.toLocaleString()}</b>
              </div>
            </div>

            <div className="bo-sheet-product"><BoostProductCard product={product} compact /></div>

            <div className="bo-sheet-pkg-row">
              {BOOST_PACKAGES.map(p => (
                <button key={p.k} className={'bo-sheet-pkg' + (pkg === p.k ? ' on' : '') + ' c-' + p.color} onClick={() => switchPkg(p.k)}>
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
                  <button key={i} className={'bo-dur' + (durIdx === i ? ' on' : '')} onClick={() => setDurIdx(i)}>
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
                <BoostIcon name="eye" size={14} />
                <span>ประมาณการเข้าถึง</span>
                <b>{selectedDur.reach}</b>
              </div>
            </div>

            {insufficient && (
              <div className="bo-warn sheet">
                <BoostIcon name="info" size={14} />
                <span>เหรียญไม่พอ</span>
                <button className="bo-warn-cta" onClick={() => { window.location.href = '/coins'; }}>เติม</button>
              </div>
            )}
            {err && (
              <div className="bo-warn sheet">
                <BoostIcon name="info" size={14} />
                <span>{err}</span>
              </div>
            )}
          </>
        )}

        {step === 'success' && <div className="bo-sheet-success"><BoostSuccess pkg={selectedPkg} dur={selectedDur} /></div>}

        <div className="bo-sheet-foot">
          {step === 'success' ? (
            <button className="bo-btn primary lg full" onClick={onClose}>เสร็จสิ้น</button>
          ) : (
            <button className="bo-btn primary lg full" disabled={insufficient || confirming || balanceLoading} onClick={handleConfirm}>
              <BoostIcon name="rocket" size={16} />
              {confirming ? 'กำลังดำเนินการ...' : `เริ่ม Boost · ใช้ ${cost} ◎`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export function BoostModal({ product, token, onClose, onConfirmed, variant }: BoostModalProps) {
  const isMobile = useBreakpoint(640);
  const [selectedProduct, setSelectedProduct] = useState<BoostProduct | null>(product);

  // when product prop changes (e.g. opened from different listing), reset
  useEffect(() => { setSelectedProduct(product); }, [product]);

  if (!selectedProduct) {
    return <BoostProductPicker token={token} onSelect={setSelectedProduct} onClose={onClose} />;
  }

  const v = variant || (isMobile ? 'C' : 'A');
  if (v === 'C') return <BoostVariantC product={selectedProduct} token={token} onClose={onClose} onConfirmed={onConfirmed} />;
  return <BoostVariantA product={selectedProduct} token={token} onClose={onClose} onConfirmed={onConfirmed} />;
}
