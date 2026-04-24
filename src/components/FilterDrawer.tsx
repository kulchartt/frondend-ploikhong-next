'use client';

import { useState, useEffect } from 'react';

const CATS = [
  { name: 'ทั้งหมด', count: 24580 },
  { name: 'มือถือ & แท็บเล็ต', count: 3420 },
  { name: 'คอมพิวเตอร์', count: 1890 },
  { name: 'เครื่องใช้ไฟฟ้า', count: 2150 },
  { name: 'เฟอร์นิเจอร์', count: 1120 },
  { name: 'แฟชั่น', count: 5200 },
  { name: 'กล้อง & อุปกรณ์', count: 780 },
  { name: 'กีฬา & จักรยาน', count: 940 },
  { name: 'ของสะสม & เกม', count: 2380 },
  { name: 'หนังสือ', count: 1450 },
  { name: 'สัตว์เลี้ยง', count: 620 },
  { name: 'อื่นๆ', count: 4630 },
];

const CONDITIONS = ['ใหม่ในกล่อง', 'สภาพ 90%+', 'มือสองทั่วไป', 'ซ่อมได้'];
const DELIVERY = ['นัดรับ', 'ส่งฟรี'];

interface FilterDrawerProps {
  onClose: () => void;
  onFilter: (f: any) => void;
  initialFilters?: any;
  resultCount?: number;
}

export function FilterDrawer({ onClose, onFilter, initialFilters = {}, resultCount }: FilterDrawerProps) {
  const [activeCat, setActiveCat] = useState(initialFilters.activeCat ?? 'ทั้งหมด');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice ?? '');
  const [conditions, setConditions] = useState<string[]>(initialFilters.conditions ?? []);
  const [delivery, setDelivery] = useState<string[]>(initialFilters.delivery ?? []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  function toggleArr(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  function apply() {
    onFilter({ activeCat, minPrice, maxPrice, conditions, delivery });
    onClose();
  }

  function reset() {
    setActiveCat('ทั้งหมด');
    setMinPrice(''); setMaxPrice('');
    setConditions([]); setDelivery([]);
    onFilter({ activeCat: 'ทั้งหมด', minPrice: '', maxPrice: '', conditions: [], delivery: [] });
  }

  const sec: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '.08em',
    color: 'var(--ink-3)', margin: '18px 0 8px',
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 280, background: 'rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <style>{`@keyframes drawerUp { from { transform:translateY(100%) } to { transform:translateY(0) } }`}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)', borderRadius: '16px 16px 0 0',
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,.2)',
          animation: 'drawerUp .25s cubic-bezier(.2,.8,.2,1)',
        }}>

        {/* Handle + header */}
        <div style={{ padding: '12px 20px 14px', borderBottom: '1px solid var(--line)', background: 'var(--surface)', borderRadius: '16px 16px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--line-2)', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>ตัวกรอง</span>
            <button onClick={reset}
              style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              ล้างทั้งหมด
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px' }}>

          {/* Categories */}
          <div style={sec}>หมวดหมู่</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATS.map(cat => (
              <button key={cat.name}
                onClick={() => setActiveCat(cat.name)}
                style={{
                  padding: '7px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                  border: `1px solid ${activeCat === cat.name ? 'var(--ink)' : 'var(--line)'}`,
                  background: activeCat === cat.name ? 'var(--ink)' : 'var(--surface)',
                  color: activeCat === cat.name ? 'var(--bg)' : 'var(--ink-2)',
                  fontWeight: activeCat === cat.name ? 600 : 400,
                  transition: '.12s',
                }}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Price */}
          <div style={sec}>ช่วงราคา</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="number" placeholder="ต่ำสุด" value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              style={inputSt} />
            <span style={{ color: 'var(--ink-3)' }}>–</span>
            <input type="number" placeholder="สูงสุด" value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              style={inputSt} />
          </div>

          {/* Condition */}
          <div style={sec}>สภาพสินค้า</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CONDITIONS.map(c => (
              <button key={c}
                onClick={() => setConditions(prev => toggleArr(prev, c))}
                style={{
                  padding: '7px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                  border: `1px solid ${conditions.includes(c) ? 'var(--ink)' : 'var(--line)'}`,
                  background: conditions.includes(c) ? 'var(--ink)' : 'var(--surface)',
                  color: conditions.includes(c) ? 'var(--bg)' : 'var(--ink-2)',
                  transition: '.12s',
                }}>
                {c}
              </button>
            ))}
          </div>

          {/* Delivery */}
          <div style={sec}>วิธีรับสินค้า</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DELIVERY.map(d => (
              <button key={d}
                onClick={() => setDelivery(prev => toggleArr(prev, d))}
                style={{
                  padding: '7px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                  border: `1px solid ${delivery.includes(d) ? 'var(--ink)' : 'var(--line)'}`,
                  background: delivery.includes(d) ? 'var(--ink)' : 'var(--surface)',
                  color: delivery.includes(d) ? 'var(--bg)' : 'var(--ink-2)',
                  transition: '.12s',
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Apply button */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
          <button onClick={apply}
            style={{
              width: '100%', padding: '14px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
            ดูผลลัพธ์{resultCount !== undefined ? ` (${resultCount.toLocaleString()})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputSt: React.CSSProperties = {
  flex: 1, padding: '9px 12px', border: '1px solid var(--line)',
  borderRadius: 'var(--radius-sm)', fontSize: 13, background: 'var(--surface)',
  color: 'var(--ink)', fontFamily: 'var(--font-mono)', outline: 'none',
};
