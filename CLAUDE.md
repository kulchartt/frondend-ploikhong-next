# PloiKhong — Online Marketplace (Design Prototype)

> อ่านไฟล์นี้ก่อนเริ่มทำงานทุกครั้ง และเคารพ convention ด้านล่างอย่างเคร่งครัด
> นี่เป็น **design prototype** (HTML + inline JSX) ไม่ใช่ production app — ไม่มี build step, ไม่มี backend จริง

---

## 1. Stack & Loading Model

- **Single-page HTML** รันตรงจากไฟล์ ไม่มี bundler, ไม่มี npm, ไม่มี build
- **React 18.3.1 + ReactDOM + Babel Standalone 7.29.0** โหลดจาก `unpkg` ผ่าน `<script>` tags ใน `ploikhong.html` (pinned versions + integrity hashes — **ห้ามเปลี่ยน**)
- **JSX files ทุกไฟล์** โหลดผ่าน `<script type="text/babel" src="ploi/xxx.jsx">` — Babel transpile ใน browser
- **ห้ามใช้ ES module / `type="module"` / `import` statements** — แต่ละ `<script type="text/babel">` มี scope แยกกัน

### กฎสำคัญของการแชร์ component ข้ามไฟล์
ทุก component / helper / data ที่ไฟล์อื่นต้องใช้ ต้อง **export ขึ้น `window`** ที่ท้ายไฟล์:

```jsx
// ท้ายไฟล์ ploi/v4_detail.jsx
Object.assign(window, { V4Detail });
```

แล้วไฟล์อื่นเรียกใช้โดยตรงเป็น global (เช่น `<V4Detail .../>`) — ไม่ต้อง import

### กฎสำคัญของ style objects
**ห้ามตั้งชื่อ `const styles = {...}` เด็ดขาด** — ชน scope กันเมื่อ Babel รวมไฟล์ ใช้ชื่อเฉพาะ component เสมอ:

```jsx
const v4DetailStyles = { ... };   // ✅
const styles = { ... };            // ❌ จะพัง
```

หรือใช้ inline `style={{...}}` / CSS classes ใน `<style>` block ของ `ploikhong.html`

---

## 2. File Structure

```
ploikhong.html          ← root, CSS ทั้งหมด, React/Babel loader, script tags เรียง ploi/*.jsx
ploi/
  data.jsx              ← mock data (products, users, complaints, ...)
  shared.jsx            ← shared UI primitives (Icon, Avatar, Tag, Modal shell, …)
  footer.jsx            ← global footer
  mount.jsx             ← React portals (ProductPortal, HubPortal, AuthPortal, …)
                          + window.__openProduct / __openHub / __openAuth APIs
  v2.jsx                ← home/feed
  v4_detail.jsx         ← product detail overlay
  v5_listing.jsx        ← create listing flow
  v7_auth.jsx           ← login / signup
  v8_hub.jsx            ← MyHub drawer (slide-in 420px from right)
  v9_chat.jsx           ← Messenger-style chat inbox
  v10_stubs.jsx         ← misc stub pages
  v11_admin.jsx         ← admin ops console (current)
  v11_complaints.jsx    ← complaints center (current)
  v11_coins.jsx         ← coins shop + premium
  _backup/              ← old versions — อย่าแก้, อย่าลบ
uploads/
  PLOIKHONG_SPEC.md     ← functional spec (อ่านก่อนเริ่ม scope ใหญ่)
scratch/                ← screenshots ที่ผู้ใช้ debug — เพิกเฉยได้
design_handoff_*/       ← handoff packages เก่า — อย่าแตะ
```

**Script loading order ใน `ploikhong.html`** สำคัญมาก: `data.jsx` → `shared.jsx` → feature jsx files → `mount.jsx` ท้ายสุด เพราะ mount ต้อง resolve component ทุกตัวบน `window` ก่อน

---

## 3. Design System

### Typography
- **Thai + body**: `IBM Plex Sans Thai`, weights 300/400/500/600/700
- **Display / headings**: `Inter Tight`, weights 500–800
- **Mono / numeric**: `IBM Plex Mono`
- CSS variables: `--font-th`, `--font-display`, `--font-mono` (ตั้งใน `:root` ของ `ploikhong.html`)
- **ห้ามใช้** Inter, Roboto, Arial, system-ui เป็น primary body font

### Color tokens (CSS custom properties)
กำหนดใน `ploikhong.html`:
```
--accent: #0B5FFF            ← brand primary (tweakable)
--bg / --surface / --surface-2  ← backgrounds
--line / --line-2            ← borders
--ink / --ink-2 / --ink-3    ← text
--pos / --warn / --neg       ← status
```
Dark theme อยู่ที่ `html[data-theme="dark"]` — override token เดียวกัน

**อย่าใช้ Tailwind, อย่าสร้าง color ใหม่** — ใช้ token ที่มี ถ้าจำเป็นจริงๆ ใช้ `oklch()` ผสมกับ accent

### Spacing / radius
- `--radius: 10px` (cards, modals), `--radius-sm: 6px` (buttons, inputs, tags)
- Density scale: `--density` multiplier (tweak mode)
- Gap เริ่มต้น: 8/12/16/24 — ยึด scale นี้

### Primitives ที่มีแล้ว — ใช้ของเดิมก่อนเขียนใหม่
- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.btn-lg`
- `.tag` (pill-shape)
- `<Icon name="...">` ใน `ploi/shared.jsx` — ดูชุด icon ที่มีก่อนเพิ่มใหม่
- `<Avatar>`, `<EmptyState>` ฯลฯ ใน `shared.jsx`

---

## 4. App Patterns

### Portals (overlay screens)
ทุก overlay/drawer/modal ผ่าน `window.__openXxx()` API ที่ `mount.jsx` เปิดไว้:
```js
window.__openProduct(productObj)   // เปิด product detail
window.__openHub('sell' | 'buy')   // เปิด MyHub drawer
window.__openAuth()                // เปิด login modal
window.__openListing()             // เปิด create-listing flow
window.__openChat(threadId?)       // เปิด chat inbox
```
เมื่อเพิ่ม overlay ใหม่: สร้าง `XxxPortal` ใน `mount.jsx`, handle Escape key + body scroll lock, expose `window.__openXxx`

### Variation switcher (top bar)
`.top-switch` ที่ด้านบนสุดมีปุ่ม A/B/C toggle ระหว่าง `.variant` divs — ใช้สำหรับเทียบ design option ไม่ใช่ app navigation จริง

### Tweak mode
`ploikhong.html` มี `/*EDITMODE-BEGIN*/...{JSON}.../*EDITMODE-END*/` block สำหรับ tweakable defaults (accent, radius, font, theme) — ใช้ protocol `__edit_mode_*` postMessage กับ host **ถ้า user ไม่ได้สั่งให้แก้ tweak อย่าไปยุ่ง**

---

## 5. Content & UX Rules

- **ภาษาหลัก: ไทย** (copy, labels, placeholders) — ใช้ภาษาอังกฤษเฉพาะ technical term ที่ไทยไม่มีคำดี
- **ราคา**: แสดงเป็น `฿xx,xxx` (comma separator, ไม่มีทศนิยม) ด้วย `font-mono`
- **Emoji**: ห้ามใช้ใน UI production — OK เฉพาะใน mock chat messages
- **รูปภาพ**: ใช้ placeholder (gradient + initials หรือ icon) — ห้าม generate SVG illustration เลียนแบบรูปจริง
- **Hit targets mobile ≥ 44px**, desktop button ≥ 36px

### Writing style
- Label สั้น กระชับ ไม่ต้องขึ้นต้น "คุณสามารถ..."
- Error / empty state: บอกว่าเกิดอะไรและทำอะไรต่อได้
- Admin / moderation copy: เป็นทางการแต่ไม่แข็ง

---

## 6. Common Tasks

### เพิ่ม screen / feature ใหม่
1. สร้าง `ploi/vNN_xxx.jsx`
2. ประกาศ component + `Object.assign(window, { XxxComponent })`
3. เพิ่ม `<script type="text/babel" src="ploi/vNN_xxx.jsx"></script>` ใน `ploikhong.html` **ก่อน** `mount.jsx`
4. ถ้าเป็น overlay → เพิ่ม Portal ใน `mount.jsx` + expose `window.__openXxx`
5. เชื่อม entry point (ปุ่มใน navbar / feed / account menu) ให้เรียก `window.__openXxx()`

### แก้ design token
แก้ที่ `:root` block ใน `ploikhong.html` เท่านั้น — อย่า hardcode สีใน jsx

### Mock data
เพิ่ม / แก้ใน `ploi/data.jsx` แล้ว export ทาง `window` — อย่ากระจาย mock data ไปหลายไฟล์

---

## 7. ข้อห้าม (เจอแล้วห้ามข้าม)

1. ❌ `type="module"`, `import`/`export` statements — ใช้ `window` globals
2. ❌ `const styles = {...}` — ต้องตั้งชื่อเฉพาะ component
3. ❌ สร้าง build step, เพิ่ม npm, ใช้ bundler
4. ❌ Tailwind / CSS-in-JS library / styled-components
5. ❌ สร้างสีใหม่ไม่ผ่าน token, hardcode hex ใน jsx
6. ❌ แก้ไฟล์ใน `ploi/_backup/` หรือ `design_handoff_*/`
7. ❌ ใช้ `scrollIntoView` — ใช้ `scrollTo` / `scrollTop` แทน
8. ❌ เพิ่ม title screen / hero ที่ user ไม่ได้ขอ
9. ❌ ใส่ emoji ใน UI production
10. ❌ Generate SVG illustration เองเลียนแบบรูปจริง — ใช้ placeholder

---

## 8. Backend Integration (เมื่อจะต่อของจริง)

ตอนนี้เป็น mock ล้วน เมื่อจะต่อ API จริง:
- สร้าง `ploi/api.js` (ธรรมดา JS, ไม่ต้อง JSX)
- ใส่ fetch wrapper + auth token handling
- เปลี่ยน data source ใน `data.jsx` จาก hardcode เป็น API call + `useState`/`useEffect`
- ห้ามใส่ API key / secret ใน client code
- ปรึกษา user ก่อนเลือก backend stack (REST / GraphQL / Firebase / Supabase)

ดู `uploads/PLOIKHONG_SPEC.md` สำหรับ functional requirements

---

## 9. Design Handoff — กฎสำคัญ

**Design handoff ทุกชิ้นให้ integrate เข้า Next.js app (`src/`) เสมอ — ไม่ใช่ legacy HTML project**

โครงสร้างของ folder นี้มีสองโปรเจคอยู่ด้วยกัน:

| โปรเจค | ที่อยู่ | Stack | สถานะ |
|---|---|---|---|
| **Next.js app** (production) | `src/`, `app/` | Next.js 14, TypeScript, Tailwind | ใช้งานจริง — integrate handoff ที่นี่ |
| **Legacy HTML prototype** | `ploikhong.html`, `ploi/` | HTML + inline JSX + Babel standalone | Reference เท่านั้น — อย่าแก้ |

เมื่อได้รับ handoff (jsx + css + INTEGRATION.md) ที่เขียนสำหรับ legacy project ให้:
1. อ่าน handoff component เพื่อเข้าใจ UI และ logic
2. Rewrite เป็น proper TypeScript React component ใน `src/components/`
3. แปลง CSS ที่ใช้ token legacy (`--accent`, `--ink`, ฯลฯ) ให้ใช้ Tailwind หรือ CSS Modules แทน
4. แปลง `window.__openXxx()` API ให้เป็น React state / router navigation
5. แปลง `const balance = 1240` hardcode ให้ดึงจาก API จริง (`src/lib/api.ts`)

**ห้าม** copy JSX ไปวางใน `ploi/` หรือแก้ `ploikhong.html` เพราะนั้นคือ legacy ที่ไม่ได้ใช้งานจริง
