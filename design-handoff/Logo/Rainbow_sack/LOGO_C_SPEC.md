# PloiKhong Logo C10 — Big Rainbow Sack Spec v2

> **เลือกใช้:** C10 — Big Rainbow Sack
> **Concept:** ถุงกระสอบสายรุ้งใบใหญ่ — icon ของตลาดนัด/ของขนกลับบ้านในวัฒนธรรมไทย
> **Spec version:** 2.0 — 2026-05-02

---

## 0. ⚠️ Critical Rules (อ่านก่อนทำอื่น)

> AI ที่อ่าน spec นี้: ต้องตรวจสอบ 4 ข้อนี้ก่อน commit ทุกครั้ง

1. **Wordmark "PloiKhong" ต้องเป็น rainbow gradient เสมอ** — ห้ามใช้สีเดียว (ไม่ว่าจะดำ, น้ำเงิน, แดง, หรือสีใดก็ตาม)
2. **Gradient ต้องเป็น hard color stops** (5 แถบแยกชัด) — ห้ามใช้ smooth blend ที่ไล่สีต่อเนื่อง
3. **ลำดับสีและค่า hex ต้องตรงเป๊ะ** — แดง→น้ำเงิน→เขียว→เหลือง→ส้ม, ห้ามเปลี่ยนลำดับ, ห้ามใช้สีอื่น
4. **Fallback สำหรับ browser ที่ไม่รองรับ background-clip:text ต้องเป็น `color: #e63946`** — ไม่ใช่ดำ (`#000`), ไม่ใช่แดงแก่ (`#b91c1c`), ไม่ใช่ transparent

---

## 1. Mark — SVG (paste-ready)

ขนาด canvas: `78 × 78` viewBox (scale ได้ทุกขนาด vector)

```tsx
function PloiKhongMark({ size = 78, ink = "#0f172a" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 78 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PloiKhong"
    >
      {/* shadow under sack */}
      <ellipse cx="39" cy="66" rx="24" ry="2" fill={ink} opacity=".12" />

      <defs>
        <clipPath id="pk-sack-clip">
          <path d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z" />
        </clipPath>
      </defs>

      {/* sack body — white base */}
      <path
        d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z"
        fill="#ffffff"
        stroke={ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* 5 rainbow vertical stripes (clipped to body shape) */}
      <g clipPath="url(#pk-sack-clip)">
        <rect x="14" y="24" width="10" height="42" fill="#e63946" />
        <rect x="24" y="24" width="10" height="42" fill="#1d4ed8" />
        <rect x="34" y="24" width="10" height="42" fill="#16a34a" />
        <rect x="44" y="24" width="10" height="42" fill="#facc15" />
        <rect x="54" y="24" width="10" height="42" fill="#f97316" />

        {/* horizontal weave lines (subtle texture) */}
        <line x1="14" y1="32" x2="64" y2="32" stroke={ink} strokeWidth=".5" opacity=".35" />
        <line x1="14" y1="40" x2="64" y2="40" stroke={ink} strokeWidth=".5" opacity=".35" />
        <line x1="14" y1="48" x2="64" y2="48" stroke={ink} strokeWidth=".5" opacity=".35" />
        <line x1="14" y1="56" x2="64" y2="56" stroke={ink} strokeWidth=".5" opacity=".35" />
      </g>

      {/* re-stroke outline so it sits cleanly on top */}
      <path
        d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z"
        fill="none"
        stroke={ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* cinched/tied top — trapezoid above body */}
      <path
        d="M22 24 L56 24 L52 14 L26 14 Z"
        fill="#ffffff"
        stroke={ink}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* knot / tie bump */}
      <ellipse cx="39" cy="12.5" rx="4" ry="2.4" fill={ink} />

      {/* handle loop */}
      <path d="M34 11 Q39 4 44 11" stroke={ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* cinch creases on the tie */}
      <line x1="30" y1="22" x2="33" y2="16" stroke={ink} strokeWidth=".5" opacity=".5" />
      <line x1="36" y1="22" x2="37" y2="16" stroke={ink} strokeWidth=".5" opacity=".5" />
      <line x1="42" y1="22" x2="41" y2="16" stroke={ink} strokeWidth=".5" opacity=".5" />
      <line x1="48" y1="22" x2="45" y2="16" stroke={ink} strokeWidth=".5" opacity=".5" />
    </svg>
  );
}
```

---

## 2. Color tokens

### Sack stripes — FIXED (ห้ามเปลี่ยน ห้ามสลับลำดับ)

| Stripe | Hex | Name |
|---|---|---|
| 1 ซ้ายสุด | `#e63946` | Sack Red |
| 2 | `#1d4ed8` | Sack Blue |
| 3 กลาง | `#16a34a` | Sack Green |
| 4 | `#facc15` | Sack Yellow |
| 5 ขวาสุด | `#f97316` | Sack Orange |

### Outline / details

| Token | Default | ใช้กับ |
|---|---|---|
| `--pk-ink` | `#0f172a` | outline, ลายถัก, knot, handle, shadow |
| `--pk-sack-base` | `#ffffff` | พื้นถุง + ปากถุง |

---

## 3. Wordmark — rainbow gradient text

### ⚠️ Gradient ที่ถูกต้อง (copy ไปใช้ตรงๆ ห้ามแก้ไข)

```css
/* ✅ CORRECT — hard stops, 5 solid bands matching the sack stripes */
.pk-wordmark {
  font-family: "Inter Tight", system-ui, sans-serif;
  font-weight: 800;
  letter-spacing: -0.015em;
  display: inline-block; /* REQUIRED: ถ้าใช้ block gradient จะยืดเต็ม container */

  color: #e63946;                  /* fallback — NOT black, NOT transparent */
  background: linear-gradient(
    90deg,
    #e63946 0%,  #e63946 18%,    /* แดง */
    #1d4ed8 22%, #1d4ed8 38%,    /* น้ำเงิน */
    #16a34a 42%, #16a34a 58%,    /* เขียว */
    #facc15 62%, #facc15 78%,    /* เหลือง */
    #f97316 82%, #f97316 100%    /* ส้ม */
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### React / inline style (TypeScript)

```tsx
// ✅ CORRECT — copy ไปใช้ได้เลย
const PK_GRADIENT =
  'linear-gradient(90deg, #e63946 0%, #e63946 18%, #1d4ed8 22%, #1d4ed8 38%, #16a34a 42%, #16a34a 58%, #facc15 62%, #facc15 78%, #f97316 82%, #f97316 100%)';

const wordmarkStyle: React.CSSProperties = {
  fontFamily: '"Inter Tight", system-ui, sans-serif',
  fontWeight: 800,
  letterSpacing: '-0.015em',
  display: 'inline-block',         // REQUIRED
  color: '#e63946',                // fallback (NOT '#000' NOT 'transparent')
  background: PK_GRADIENT,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};
```

### ❌ Common WRONG implementations (ห้ามทำ)

```css
/* ❌ WRONG 1 — smooth gradient (ไม่มี hard stops) */
background: linear-gradient(90deg, #e63946, #1d4ed8, #16a34a, #facc15, #f97316);

/* ❌ WRONG 2 — สีเดียว */
color: #e63946;

/* ❌ WRONG 3 — สีดำ */
color: #0f172a;
color: var(--ink);

/* ❌ WRONG 4 — display:block ทำให้ gradient ยืดเต็ม container */
display: block;

/* ❌ WRONG 5 — fallback transparent = text หายถ้า browser ไม่ support */
color: transparent;

/* ❌ WRONG 6 — ลำดับสีผิด (ห้ามใส่ม่วง ห้ามสลับ) */
background: linear-gradient(90deg, #e63946, #f97316, #facc15, #16a34a, #1d4ed8);
```

### Lockup (mark + wordmark)

```tsx
// ✅ Complete Logo component — copy ไปใช้ได้เลย
export function PloiLogo({ markSize = 44, textSize = 20 }) {
  const PK_GRADIENT =
    'linear-gradient(90deg, #e63946 0%, #e63946 18%, #1d4ed8 22%, #1d4ed8 38%, #16a34a 42%, #16a34a 58%, #facc15 62%, #facc15 78%, #f97316 82%, #f97316 100%)';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: markSize * 0.4 }}>
      <PloiKhongMark size={markSize} />
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        {/* ── Wordmark — MUST be rainbow gradient ── */}
        <span style={{
          fontFamily: '"Inter Tight", system-ui, sans-serif',
          fontWeight: 800,
          letterSpacing: '-0.015em',
          fontSize: textSize,
          lineHeight: 1.1,
          display: 'inline-block',        // REQUIRED — ห้ามเปลี่ยนเป็น block
          color: '#e63946',               // fallback — NOT black NOT transparent
          background: PK_GRADIENT,       // REQUIRED — ห้ามเปลี่ยน
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          PloiKhong
        </span>
        {/* ── Tagline ── */}
        <span style={{
          fontFamily: '"IBM Plex Sans Thai", system-ui, sans-serif',
          fontWeight: 400,
          fontSize: textSize * 0.52,
          color: '#8a877e',
          letterSpacing: '0.01em',
          lineHeight: 1.3,
          marginTop: 1,
        }}>
          marketplace · ขายของออนไลน์
        </span>
      </span>
    </span>
  );
}
```

---

## 4. Sizing

| Use case | ขนาด mark | font-size wordmark |
|---|---|---|
| Header (desktop) | 44px | 18–20px |
| Header (mobile) | 36px | (ซ่อน wordmark) |
| AuthModal / splash | 52px | 22px |
| Hero | 96–128px | 48–64px |
| Favicon | 16–32px | (ซ่อน) |

### Min size rules
- **ต่ำกว่า 24px** — ซ่อน wordmark เหลือเฉพาะ mark
- **ต่ำกว่า 16px** — ลด strokeWidth เหลือ 1

---

## 5. Don'ts

❌ ห้ามเปลี่ยนสีถุงหรือลำดับสี (แดง→น้ำเงิน→เขียว→เหลือง→ส้ม)
❌ ห้ามเปลี่ยน gradient เป็น smooth blend
❌ ห้ามใช้สีเดียวสำหรับ wordmark
❌ ห้าม distort aspect ratio (78×78 fixed)
❌ ห้ามใส่ drop shadow, glow, 3D effect
❌ ห้ามใช้ logo บน background contrast น้อยกว่า 3:1

---

## 6. Files

```
design-handoff/Logo/Rainbow_sack/
├── LOGO_C_SPEC.md          ← เอกสารนี้ (v2)
└── C10-big-rainbow-sack.svg ← standalone SVG
```

---

## 7. Prompt สำหรับ Claude Code (copy ไปใช้เลย)

```
อ่าน design-handoff/Logo/Rainbow_sack/LOGO_C_SPEC.md

⚠️ ก่อนเขียนโค้ดใดๆ ต้องตรวจสอบ Critical Rules ใน section 0 ก่อนทุกครั้ง

สร้าง/แก้ไข src/components/PloiLogo.tsx ให้:
1. export PloiMark — SVG mark จาก section 1
2. export PloiWordmark / PloiLogo — lockup จาก section 3
3. Wordmark "PloiKhong" ต้องใช้ gradient จาก section 3 เป๊ะๆ ห้ามเปลี่ยน
4. ใช้ display: inline-block สำหรับ gradient span (ระบุใน section 3)
5. fallback color: #e63946 (ไม่ใช่ดำ ไม่ใช่ transparent)

หลังทำเสร็จ ตรวจว่าไม่มีข้อใดใน "Common WRONG implementations" (section 3)
```

---

_Spec version: 2.0 — 2026-05-02_
