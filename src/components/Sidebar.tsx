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

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '.08em',
  color: 'var(--ink-3)',
  margin: '18px 0 8px',
};

const divider: React.CSSProperties = {
  height: 1,
  background: 'var(--line)',
  margin: '4px 0',
};

export function Sidebar({ onFilter }: SidebarProps) {
  const [activeCat, setActiveCat] = useState('ทั้งหมด');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [location, setLocation] = useState('ทุกที่');
  const [delivery, setDelivery] = useState<string[]>([]);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  function toggleArr(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  function emit(patch: any) {
    onFilter?.({ activeCat, minPrice, maxPrice, conditions, location, delivery, ...patch });
  }

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      position: 'sticky', top: 120, alignSelf: 'flex-start',
      maxHeight: 'calc(100vh - 140px)', overflowY: 'auto',
      paddingRight: 6,
    }}>

      {/* Categories */}
      <div style={{ ...sectionLabel, marginTop: 0 }}>หมวดหมู่</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {CATS.map(cat => (
          <button key={cat.name}
            onClick={() => { setActiveCat(cat.name); emit({ activeCat: cat.name }); }}
            onMouseEnter={() => setHoveredCat(cat.name)}
            onMouseLeave={() => setHoveredCat(null)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', padding: '6px 8px', border: 'none', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: 13,
              background: activeCat === cat.name || hoveredCat === cat.name ? 'var(--surface-2)' : 'transparent',
              fontWeight: activeCat === cat.name ? 500 : 400,
              color: activeCat === cat.name ? 'var(--ink)' : 'var(--ink-2)',
            }}>
            <span>{cat.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
              {cat.count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <div style={divider} />

      {/* Price range */}
      <div style={sectionLabel}>ช่วงราคา</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { placeholder: 'ต่ำสุด', val: minPrice, set: setMinPrice, key: 'minPrice' },
          { placeholder: 'สูงสุด', val: maxPrice, set: setMaxPrice, key: 'maxPrice' },
        ].map(({ placeholder, val, set, key }) => (
          <input key={key} type="number" placeholder={placeholder} value={val}
            onChange={e => { set(e.target.value); emit({ [key]: e.target.value }); }}
            style={{
              flex: 1, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
              padding: '7px 9px', fontSize: 12, background: 'var(--surface)',
              color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-mono)', width: '100%',
            }} />
        ))}
      </div>

      <div style={divider} />

      {/* Condition */}
      <div style={sectionLabel}>สภาพสินค้า</div>
      {CONDITIONS.map(c => (
        <CheckRow key={c} label={c}
          checked={conditions.includes(c)}
          onChange={() => { const n = toggleArr(conditions, c); setConditions(n); emit({ conditions: n }); }}
        />
      ))}

      <div style={divider} />

      {/* Location */}
      <div style={sectionLabel}>พื้นที่</div>
      {LOCATIONS.map(l => (
        <CheckRow key={l} label={l} type="radio"
          checked={location === l}
          onChange={() => { setLocation(l); emit({ location: l }); }}
        />
      ))}

      <div style={divider} />

      {/* Delivery */}
      <div style={sectionLabel}>วิธีรับสินค้า</div>
      {DELIVERY.map(d => (
        <CheckRow key={d} label={d}
          checked={delivery.includes(d)}
          onChange={() => { const n = toggleArr(delivery, d); setDelivery(n); emit({ delivery: n }); }}
        />
      ))}

    </aside>
  );
}

function CheckRow({ label, checked, onChange, type = 'checkbox' }: {
  label: string; checked: boolean; onChange: () => void; type?: 'checkbox' | 'radio';
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 13, color: 'var(--ink-2)', padding: '5px 8px',
        cursor: 'pointer', borderRadius: 'var(--radius-sm)',
        background: hovered ? 'var(--surface-2)' : 'transparent',
      }}>
      <input type={type} name={type === 'radio' ? 'location' : undefined}
        checked={checked} onChange={onChange}
        style={{ accentColor: 'var(--accent)', width: 14, height: 14, cursor: 'pointer' }} />
      {label}
    </label>
  );
}
