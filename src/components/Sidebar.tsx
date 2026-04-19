'use client';

import { useState } from 'react';

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
const LOCATIONS = ['ทุกที่', 'รอบตัว 5 กม.', 'กรุงเทพฯ-ปริมณฑล', 'ส่งทั่วประเทศ'];
const DELIVERY = ['นัดรับ', 'ส่ง PloiShip', 'ส่งฟรี'];

interface SidebarProps {
  onFilter?: (f: any) => void;
}

export function Sidebar({ onFilter }: SidebarProps) {
  const [activeCat, setActiveCat] = useState('ทั้งหมด');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [location, setLocation] = useState('ทุกที่');
  const [delivery, setDelivery] = useState<string[]>([]);

  function toggleArr(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  function emit(patch: any) {
    onFilter?.({ activeCat, minPrice, maxPrice, conditions, location, delivery, ...patch });
  }

  return (
    <aside style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Categories */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '.06em',
          textTransform: 'uppercase', marginBottom: 8 }}>หมวดหมู่</div>
        {CATS.map(cat => (
          <button key={cat.name}
            onClick={() => { setActiveCat(cat.name); emit({ activeCat: cat.name }); }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', padding: '7px 10px', border: 'none', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: 13,
              background: activeCat === cat.name ? 'var(--surface-2)' : 'transparent',
              fontWeight: activeCat === cat.name ? 600 : 400,
              color: activeCat === cat.name ? 'var(--ink)' : 'var(--ink-2)' }}>
            <span>{cat.name}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{cat.count.toLocaleString()}</span>
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--line)' }} />

      {/* Price range */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '.06em',
          textTransform: 'uppercase', marginBottom: 8 }}>ช่วงราคา</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { placeholder: 'ต่ำสุด', val: minPrice, set: setMinPrice, key: 'minPrice' },
            { placeholder: 'สูงสุด', val: maxPrice, set: setMaxPrice, key: 'maxPrice' },
          ].map(({ placeholder, val, set, key }) => (
            <input key={key} type="number" placeholder={placeholder} value={val}
              onChange={e => { set(e.target.value); emit({ [key]: e.target.value }); }}
              style={{ flex: 1, border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)',
                padding: '6px 8px', fontSize: 13, background: 'var(--surface)',
                color: 'var(--ink)', outline: 'none', width: '100%' }} />
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--line)' }} />

      {/* Condition */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '.06em',
          textTransform: 'uppercase', marginBottom: 8 }}>สภาพสินค้า</div>
        {CONDITIONS.map(c => (
          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
            cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)' }}>
            <input type="checkbox" checked={conditions.includes(c)}
              onChange={() => { const n = toggleArr(conditions, c); setConditions(n); emit({ conditions: n }); }}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
            {c}
          </label>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--line)' }} />

      {/* Location */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '.06em',
          textTransform: 'uppercase', marginBottom: 8 }}>พื้นที่</div>
        {LOCATIONS.map(l => (
          <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
            cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)' }}>
            <input type="radio" name="location" checked={location === l}
              onChange={() => { setLocation(l); emit({ location: l }); }}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
            {l}
          </label>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--line)' }} />

      {/* Delivery */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '.06em',
          textTransform: 'uppercase', marginBottom: 8 }}>วิธีรับสินค้า</div>
        {DELIVERY.map(d => (
          <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
            cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)' }}>
            <input type="checkbox" checked={delivery.includes(d)}
              onChange={() => { const n = toggleArr(delivery, d); setDelivery(n); emit({ delivery: n }); }}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
            {d}
          </label>
        ))}
      </div>

    </aside>
  );
}
