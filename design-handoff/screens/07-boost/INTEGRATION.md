# Boost Listing Flow — Integration Guide

> หน้า "เริ่ม Boost ประกาศใหม่" สำหรับ PloiKhong marketplace
> Drop-in component พร้อม global API: `window.__openBoost(product)`

---

## 1. ภาพรวม

ไฟล์ในชุดนี้ออกแบบให้ patch เข้า codebase ที่มีอยู่ (`ploikhong.html` + `ploi/*.jsx`) **โดยไม่ต้องแก้ไฟล์เดิม** ยกเว้น 2 จุดเล็กๆ ใน `ploikhong.html` (CSS append + script tag) และ optional 1 จุดใน `ploi/mount.jsx` (portal)

**ไฟล์ที่ให้มา:**

| ไฟล์ | หน้าที่ | ปลายทาง |
|---|---|---|
| `v12_boost.jsx` | React component ทั้งหมด (3 variations) | คัดลอกไป `ploi/v12_boost.jsx` |
| `v12_boost.css` | CSS (ใช้ token เดิม ไม่ชน class อื่น — prefix `.bo-`) | append เข้า `<style>` ใน `ploikhong.html` |
| `boost_preview.html` | preview standalone (เปิดดูในเบราว์เซอร์ได้ทันที) | ไม่ต้อง deploy — ใช้ทดสอบเฉยๆ |
| `INTEGRATION.md` | ไฟล์นี้ | — |

---

## 2. Variation มีอะไรบ้าง

| Variant | ชื่อ | ใช้เมื่อ | ขนาด |
|---|---|---|---|
| **A** | Modal Classic | จากปุ่ม Boost ใน feed/MyHub บน desktop | 640px กลางจอ |
| **B** | Wizard 3-step *(default)* | จากหลังลงประกาศเสร็จ หรือ entry หลัก | full-screen |
| **C** | Bottom Sheet | mobile breakpoint หรือ tablet portrait | slide-up จากล่าง |

เลือก variant ได้ 2 ทาง:
1. ส่ง prop ตอน mount: `<V12Boost variant="A" .../>`
2. ตั้ง global ก่อน mount: `window.__BOOST_VARIANT = 'A'`

แนะนำให้ default เป็น **B** ตอนหลังลงประกาศเสร็จ และใช้ **A** ตอนกดปุ่ม Boost บน listing ที่มีอยู่แล้ว

---

## 3. ขั้นตอนติดตั้ง (สำหรับ Claude Code)

### Step 1: คัดลอกไฟล์ component
```bash
cp v12_boost.jsx ploi/v12_boost.jsx
```

### Step 2: append CSS เข้า ploikhong.html
เปิด `ploikhong.html` หา block `<style>` ที่ใหญ่ที่สุด (ประมาณบรรทัด 11) แล้ว **append** เนื้อหาทั้งหมดของ `v12_boost.css` ไปท้าย `</style>` ก่อนปิด tag

> **กฎสำคัญ:** อย่าแก้ token (`--accent`, `--ink`, ฯลฯ) ที่มีอยู่แล้ว
> CSS ทั้งหมด prefix `.bo-` ไม่ชน class อื่นในโปรเจค

### Step 3: เพิ่ม script tag ใน ploikhong.html
หา section ที่ load `ploi/*.jsx` (ก่อน `mount.jsx`) แล้วเพิ่ม:

```html
<script type="text/babel" src="ploi/v12_boost.jsx"></script>
```

**ลำดับสำคัญ** — ต้องอยู่ **ก่อน** `mount.jsx`:
```html
<script type="text/babel" src="ploi/data.jsx"></script>
<script type="text/babel" src="ploi/shared.jsx"></script>
<!-- ... feature jsx files ... -->
<script type="text/babel" src="ploi/v12_boost.jsx"></script>  <!-- ← เพิ่มตรงนี้ -->
<script type="text/babel" src="ploi/mount.jsx"></script>
```

### Step 4: เพิ่ม BoostPortal เข้า mount.jsx
ใน `ploi/mount.jsx` เพิ่ม:

```jsx
function BoostPortal() {
  const [state, setState] = useState(null); // {product, variant}
  useEffect(()=>{
    window.__openBoost = (product, variant) => setState({ product, variant });
  },[]);
  useEffect(()=>{
    const onKey = e => { if(e.key==='Escape') setState(null); };
    document.addEventListener('keydown', onKey);
    return ()=>document.removeEventListener('keydown', onKey);
  },[]);
  useEffect(()=>{
    document.body.style.overflow = state ? 'hidden' : '';
  },[state]);
  if(!state) return null;
  return (
    <V12Boost
      product={state.product}
      variant={state.variant}
      onClose={()=>setState(null)}
      onConfirmed={(result)=>{
        // TODO: เรียก backend deduct coins + activate boost
        // หลัง success state ปิดเอง user จะกดปุ่มเสร็จสิ้นเอง
        console.log('boost confirmed', result);
      }}
    />
  );
}
```

จากนั้น mount portal นี้ที่ท้ายไฟล์ ถัดจาก HubPortal:

```js
const boostPortal = document.createElement('div');
boostPortal.id = 'boost-portal';
document.body.appendChild(boostPortal);
ReactDOM.createRoot(boostPortal).render(<BoostPortal/>);
```

### Step 5: ต่อ entry points
เรียก `window.__openBoost(product)` จากที่ที่ user จะเริ่ม Boost

**5.1 จาก MyHub (`ploi/v8_hub.jsx`)** — ปุ่ม Boost ในแต่ละ listing:
```jsx
<button onClick={()=>window.__openBoost(listing)}>
  Boost
</button>
```

**5.2 จาก Listing success (`ploi/v5_listing.jsx`)** — หลังกด "ลงประกาศ":
```jsx
// หลังจากบันทึก listing สำเร็จ
window.__openBoost(newListing, 'B'); // ใช้ variant B (Wizard) เพราะมี preview สวย
```

**5.3 จาก Coins page (`ploi/v11_coins.jsx`)** — ปุ่ม "เริ่ม Boost ประกาศใหม่" ที่มีอยู่:
หา button แล้วเปลี่ยน:
```jsx
<button className="co-active-add" onClick={()=>window.__openBoost(/* ให้ user เลือกประกาศก่อน */)}>
```

> **Note:** ถ้ายังไม่มี product ที่เลือก → ควรเปิดหน้าเลือกประกาศก่อน (ของเดิมยังไม่มี ทำเพิ่มได้ภายหลัง)

---

## 4. API & Data Contract

### `window.__openBoost(product, variant?)`

**Signature:**
```ts
window.__openBoost(
  product: {
    id: number;
    title: string;
    price: number;
    cat: string;          // category
    loc: string;          // 'กรุงเทพ · พระราม 9'
    img: number;          // 1-12 → maps to PLOI_DATA.IMG_TINTS
    posted?: string;
  },
  variant?: 'A' | 'B' | 'C'   // default = 'B'
): void
```

**ข้อมูล internal ที่ใช้** — มีใน `v12_boost.jsx`:

```js
BOOST_PACKAGES = [
  { k:'boost',      name:'Boost',       coins:30,  durations:[24ชม.,3วัน,7วัน] },
  { k:'featured',   name:'Featured',    coins:80,  durations:[7,14,30 วัน] },
  { k:'super',      name:'Super Bump',  coins:120, durations:[ยิงครั้งเดียว] },
  { k:'autorelist', name:'Auto-Relist', coins:20,  durations:[30 วัน] },
]

BOOST_BUNDLES = [
  { k:'b1', items:['boost','featured'],          coins:180, save:40 },
  { k:'b2', items:['featured','autorelist'],     coins:90,  save:10 },
  { k:'b3', items:['boost','featured','super'],  coins:280, save:70 },
]
```

ตอนนี้เป็น mock — ตอนต่อ backend ให้ย้ายไปไฟล์ `ploi/data.jsx` และ fetch จาก API

### `onConfirmed(result)` callback

```ts
result = {
  pkg: 'boost' | 'featured' | 'super' | 'autorelist',
  dur: { d:string, coins:number, reach:string },
  cost: number,            // จำนวนเหรียญที่หัก
  bundle?: string|null,    // bundle key ถ้าเลือก bundle
  scheduleAt?: 'now'|'morning'|'evening'|'custom',  // เฉพาะ variant B
  autoRenew?: boolean,     // เฉพาะ variant B
}
```

ตอนต่อ backend ให้:
1. POST `/api/boost` ด้วย `{ productId, ...result }`
2. หัก coin balance
3. update listing.boost = true
4. ส่ง notification ให้ admin queue (ถ้ามี moderation)

---

## 5. Coin Balance — ตอนนี้ hardcode

ใน `v12_boost.jsx` มี `const balance = 1240;` ในทุก variant

**TODO ตอนต่อ backend:**
- ย้ายไป read จาก context / global state (เช่น `window.PLOI_USER.coins`)
- ตอน user balance ไม่พอ → ปุ่มเตือน + redirect ไปหน้า Coins (`window.__openCoins()` — ของเดิมมีแล้ว)

---

## 6. Dependency Map

```
v12_boost.jsx
├── React (global)
├── window.Thumb              ← จาก ploi/shared.jsx (graceful fallback ถ้าไม่มี)
├── window.PLOI_DATA          ← จาก ploi/data.jsx (ถ้าไม่มีจะใช้ Thumb fallback)
├── window.__openCoins        ← จาก mount.jsx (เรียกตอน balance ไม่พอ)
├── window.__openHub          ← จาก mount.jsx (เรียกหลัง confirmed → ดูใน MyHub)
└── CSS tokens               ← --accent --surface --ink --line --pos --warn --neg
                                --radius --radius-sm --font-th --font-display --font-mono
```

ทุก dependency มี graceful fallback (ถ้าไม่มีไม่ crash)

---

## 7. ทดสอบหน้านี้แบบ standalone

เปิด `boost_preview.html` ในเบราว์เซอร์ — มีทุกอย่าง self-contained:
- React + Babel จาก unpkg
- Thumb fallback inline
- Mock product
- ปุ่มสลับ variant A/B/C
- Theme toggle (light/dark)

---

## 8. Acceptance Checklist

ก่อนส่งงานเช็คให้ครบ:

**ทุก variant:**
- [ ] เลือกแพ็คเกจ → cost อัพเดทใน summary
- [ ] balance < cost → ปุ่ม disabled + warning + ปุ่ม "เติมเหรียญ"
- [ ] กดยืนยัน → ขึ้น success state พร้อม stats
- [ ] กด Esc / คลิก backdrop → ปิด overlay (ยกเว้นตอน paying)
- [ ] body scroll lock ตอนเปิด

**Variant B (Wizard) เพิ่มเติม:**
- [ ] Step indicator update ตามขั้น (current = accent, done = pos check)
- [ ] กดปุ่ม "ย้อนกลับ" กลับ step ก่อน
- [ ] เลือก bundle → ซ่อน duration row, แสดง "ประหยัด N ◎"
- [ ] schedule = custom → แสดง date+time picker
- [ ] preview panel update real-time ตามที่เลือก

**Variant C (Sheet) เพิ่มเติม:**
- [ ] Animation slide-up จากล่างนุ่มนวล
- [ ] Drag handle ด้านบน
- [ ] CTA full-width ติดล่าง + safe-area-inset

**Theme:**
- [ ] ทำงานทั้ง light + dark (toggle ใน preview ทดสอบได้)
- [ ] ไม่มี hardcode hex color ใน jsx (ใช้ token หมด)

**Accessibility:**
- [ ] role="dialog" + aria-modal="true" บน overlay container
- [ ] focus trap (TODO — ปัจจุบันยังไม่มี implement; ฝาก Claude Code เพิ่ม)
- [ ] Esc key ปิด modal

---

## 9. ข้อจำกัดที่ทราบ (TODOs สำหรับ Claude Code)

1. **ยังไม่มี focus trap** — แตะ Tab ออกนอก modal ได้ ฝากเพิ่ม
2. **Schedule custom** ใช้ native `<input type="date|time">` — UX ยังไม่ดีบนทุก browser
3. **Reach numbers** เป็น mock คงที่ — ตอนต่อ backend ให้ดึงจาก analytics ของแต่ละ listing
4. **No animation บน step transition** ใน Wizard — ปัจจุบันแค่ render component คนละตัว เพิ่ม fade/slide ให้ดู smooth ขึ้นได้
5. **Coin balance hardcode 1240** — ต่อกับ user state เมื่อมี backend
6. **Bundle reach** แสดงเป็น "20,000+" คงที่ — ควรคำนวณจริงจาก items ที่อยู่ใน bundle

---

## 10. Convention ที่เคารพ (จาก CLAUDE.md)

- ✅ ไม่มี `type="module"` / import statements
- ✅ ไม่มี `const styles = {...}` (ใช้ `const v12...Styles` ก็ไม่มี — ใช้ CSS class หมด)
- ✅ Export ขึ้น `window` ที่ท้ายไฟล์ (`V12Boost`, `BOOST_PACKAGES`, `BOOST_BUNDLES`)
- ✅ ใช้ token เดิมหมด ไม่ hardcode hex
- ✅ ภาษาไทยเป็นหลัก ราคา `฿xx,xxx` mono font
- ✅ ไม่มี emoji ใน UI (มีแต่สัญลักษณ์ ◎ สำหรับเหรียญ — pseudo-symbol เป็นที่ใช้ทั่วโปรเจค)
- ✅ Hit target ≥ 36px desktop button
- ✅ ไม่ใช้ `scrollIntoView`

---

## คำสั่งสำหรับ Claude Code (paste ตามนี้)

```
อ่าน CLAUDE.md และ INTEGRATION.md ในโฟลเดอร์ boost_handoff
แล้วทำตาม section 3 ทั้ง 5 step:

1. คัดลอก v12_boost.jsx ไป ploi/
2. append v12_boost.css เข้า <style> ใน ploikhong.html
3. เพิ่ม script tag ก่อน mount.jsx
4. เพิ่ม BoostPortal ใน mount.jsx
5. ต่อ entry point ใน v8_hub.jsx, v5_listing.jsx, v11_coins.jsx ตามที่ระบุใน 5.1-5.3

ห้ามแก้ token CSS เดิม ห้ามใช้ import statements
เสร็จแล้วเปิด ploikhong.html แล้วคลิก Boost จาก MyHub เพื่อทดสอบ
```
