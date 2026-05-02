# PloiKhong Logo C10 — Brand Spec & Implementation Guide

> **เลือกใช้:** C10 — Big Rainbow Sack (ถุงกระสอบสายรุ้งใบใหญ่)
> **Concept:** ถุงกระสอบสายรุ้งเป็น icon ของตลาดนัด/ของขนกลับบ้านในวัฒนธรรมไทย — ใบเดียวเน้นๆ ใหญ่ๆ
> **Wordmark:** "PloiKhong" ทั้งคำ ต้องเป็น **rainbow gradient** ตรงกับลายถุง — **ห้ามใช้สีเดี่ยว**

---

## ⚠️ Critical Rules — สำหรับ AI / developer

อ่านก่อนทำ — รายการนี้ถูกฝ่าฝืนบ่อยที่สุด:

1. **Wordmark "PloiKhong" ต้องเป็น rainbow gradient เสมอ** — ไม่ใช่สีดำ ไม่ใช่สีเดียว ไม่ใช่ accent two-tone
2. **Logo เต็ม = mark (sack SVG) + wordmark (rainbow text) อยู่คู่กันเสมอ** เป็น lockup เดียว ไม่แยก
3. **5 สีของถุงคือ brand asset** — ห้ามเปลี่ยน ห้ามเพิ่ม ห้ามเรียงใหม่: `#e63946 #1d4ed8 #16a34a #facc15 #f97316`
4. **Tagline = "marketplace · ขายของออนไลน์"** — ไม่ใช่ "marketplace solution" หรืออื่นๆ
5. **Fallback ถ้า browser ไม่ support background-clip:text** ให้ใช้ `#e63946` (red) — **ไม่ใช่สีดำ #000 หรือ ink**

---

## 1. Logo Component (Single, Complete) — Copy-paste ready

> **อย่าแยก mark กับ wordmark** — เอา component นี้ทั้งก้อน ใช้เลย

### React/JSX (TypeScript optional)
```tsx
type LogoVariant = "lockup" | "mark" | "wordmark";

interface LogoProps {
  variant?: LogoVariant;          // default: "lockup"
  size?: number;                  // mark height in px, default 40
  className?: string;
}

const PK_GRADIENT =
  "linear-gradient(90deg," +
  "#e63946 0%, #e63946 18%," +
  "#1d4ed8 22%, #1d4ed8 38%," +
  "#16a34a 42%, #16a34a 58%," +
  "#facc15 62%, #facc15 78%," +
  "#f97316 82%, #f97316 100%)";

const PK_INK = "#0f172a";

export function Logo({
  variant = "lockup",
  size = 40,
  className = ""
}: LogoProps) {
  const wordmarkSize = size * 0.8;     // 40px mark → 32px text
  const taglineSize = wordmarkSize * 0.42;

  const Mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 78 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PloiKhong"
    >
      <ellipse cx="39" cy="66" rx="24" ry="2" fill={PK_INK} opacity=".12" />
      <defs>
        <clipPath id="pk-sack-clip">
          <path d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z" />
        </clipPath>
      </defs>
      <path
        d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z"
        fill="#ffffff" stroke={PK_INK} strokeWidth="1.4" strokeLinejoin="round"
      />
      <g clipPath="url(#pk-sack-clip)">
        <rect x="14" y="24" width="10" height="42" fill="#e63946" />
        <rect x="24" y="24" width="10" height="42" fill="#1d4ed8" />
        <rect x="34" y="24" width="10" height="42" fill="#16a34a" />
        <rect x="44" y="24" width="10" height="42" fill="#facc15" />
        <rect x="54" y="24" width="10" height="42" fill="#f97316" />
        <line x1="14" y1="32" x2="64" y2="32" stroke={PK_INK} strokeWidth=".5" opacity=".35"/>
        <line x1="14" y1="40" x2="64" y2="40" stroke={PK_INK} strokeWidth=".5" opacity=".35"/>
        <line x1="14" y1="48" x2="64" y2="48" stroke={PK_INK} strokeWidth=".5" opacity=".35"/>
        <line x1="14" y1="56" x2="64" y2="56" stroke={PK_INK} strokeWidth=".5" opacity=".35"/>
      </g>
      <path
        d="M14 24 L64 24 L62 64 Q62 66 60 66 L18 66 Q16 66 16 64 Z"
        fill="none" stroke={PK_INK} strokeWidth="1.4" strokeLinejoin="round"
      />
      <path
        d="M22 24 L56 24 L52 14 L26 14 Z"
        fill="#ffffff" stroke={PK_INK} strokeWidth="1.2" strokeLinejoin="round"
      />
      <ellipse cx="39" cy="12.5" rx="4" ry="2.4" fill={PK_INK} />
      <path d="M34 11 Q39 4 44 11" stroke={PK_INK} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <line x1="30" y1="22" x2="33" y2="16" stroke={PK_INK} strokeWidth=".5" opacity=".5"/>
      <line x1="36" y1="22" x2="37" y2="16" stroke={PK_INK} strokeWidth=".5" opacity=".5"/>
      <line x1="42" y1="22" x2="41" y2="16" stroke={PK_INK} strokeWidth=".5" opacity=".5"/>
      <line x1="48" y1="22" x2="45" y2="16" stroke={PK_INK} strokeWidth=".5" opacity=".5"/>
    </svg>
  );

  // Rainbow wordmark — MUST be gradient, not solid color
  const Wordmark = (
    <span
      style={{
        fontFamily: '"Inter Tight", system-ui, sans-serif',
        fontWeight: 800,
        letterSpacing: "-0.015em",
        fontSize: wordmarkSize,
        lineHeight: 1,
        background: PK_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "#e63946",                    // fallback (NOT black)
        WebkitTextFillColor: "transparent",
      }}
    >
      PloiKhong
    </span>
  );

  if (variant === "mark") return <span className={className}>{Mark}</span>;
  if (variant === "wordmark") {
    return (
      <div className={className} style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
        {Wordmark}
        <span style={{
          fontFamily: '"IBM Plex Sans Thai", system-ui, sans-serif',
          fontSize: taglineSize, color: PK_INK, opacity: 0.6
        }}>
          marketplace · ขายของออนไลน์
        </span>
      </div>
    );
  }

  // lockup (default)
  return (
    <div
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: size * 0.4 }}
    >
      {Mark}
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
        {Wordmark}
        <span style={{
          fontFamily: '"IBM Plex Sans Thai", system-ui, sans-serif',
          fontSize: taglineSize, color: PK_INK, opacity: 0.6, lineHeight: 1
        }}>
          marketplace · ขายของออนไลน์
        </span>
      </div>
    </div>
  );
}
```

### Plain HTML (no React)
```html
<style>
  .pk-lockup { display:inline-flex; align-items:center; gap:16px; }
  .pk-text { display:inline-flex; flex-direction:column; gap:4px; }
  .pk-wordmark {
    font-family: "Inter Tight", system-ui, sans-serif;
    font-weight: 800;
    letter-spacing: -0.015em;
    font-size: 32px;
    line-height: 1;
    background: linear-gradient(90deg,
      #e63946 0%, #e63946 18%,
      #1d4ed8 22%, #1d4ed8 38%,
      #16a34a 42%, #16a34a 58%,
      #facc15 62%, #facc15 78%,
      #f97316 82%, #f97316 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: #e63946;                  /* fallback — NOT black */
    -webkit-text-fill-color: transparent;
  }
  .pk-tagline {
    font-family: "IBM Plex Sans Thai", system-ui, sans-serif;
    font-size: 13px;
    color: #0f172a;
    opacity: 0.6;
    line-height: 1;
  }
</style>

<div class="pk-lockup">
  <!-- paste sack SVG from section 1 here, height=40 -->
  <div class="pk-text">
    <span class="pk-wordmark">PloiKhong</span>
    <span class="pk-tagline">marketplace · ขายของออนไลน์</span>
  </div>
</div>
```

---

## 2. Color Tokens

### Sack stripes — FIXED brand colors (ห้ามเปลี่ยน)
```ts
export const PK_COLORS = {
  sackRed:    "#e63946",   // stripe 1
  sackBlue:   "#1d4ed8",   // stripe 2
  sackGreen:  "#16a34a",   // stripe 3
  sackYellow: "#facc15",   // stripe 4
  sackOrange: "#f97316",   // stripe 5
  ink:        "#0f172a",   // outline / body text
  sackBase:   "#ffffff",   // sack body fill
  bg:         "#ffffff",   // page background
};

export const PK_GRADIENT = `linear-gradient(90deg,
  ${PK_COLORS.sackRed} 0%,    ${PK_COLORS.sackRed} 18%,
  ${PK_COLORS.sackBlue} 22%,  ${PK_COLORS.sackBlue} 38%,
  ${PK_COLORS.sackGreen} 42%, ${PK_COLORS.sackGreen} 58%,
  ${PK_COLORS.sackYellow} 62%,${PK_COLORS.sackYellow} 78%,
  ${PK_COLORS.sackOrange} 82%,${PK_COLORS.sackOrange} 100%)`;
```

### Tailwind config (ถ้าใช้ Tailwind)
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        pk: {
          red:    "#e63946",
          blue:   "#1d4ed8",
          green:  "#16a34a",
          yellow: "#facc15",
          orange: "#f97316",
          ink:    "#0f172a",
        },
      },
      fontFamily: {
        display: ['"Inter Tight"', "system-ui", "sans-serif"],
        thai:    ['"IBM Plex Sans Thai"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "pk-rainbow":
          "linear-gradient(90deg,#e63946 0%,#e63946 18%,#1d4ed8 22%,#1d4ed8 38%,#16a34a 42%,#16a34a 58%,#facc15 62%,#facc15 78%,#f97316 82%,#f97316 100%)",
      },
    },
  },
};
```

ใช้ Tailwind class:
```jsx
<span className="font-display font-extrabold text-[32px] tracking-tight bg-pk-rainbow bg-clip-text text-transparent">
  PloiKhong
</span>
```

---

## 3. Visual Reference

### What it should look like (✅)
```
[🟪 sack icon]   PloiKhong            ← rainbow gradient text
                 marketplace · ขายของออนไลน์
```
- "PloiKhong" ทั้งคำเป็น gradient รุ้ง 5 สี ไล่ซ้ายไปขวา
- ตัว "P" เริ่มสีแดง, ตัว "g" จบสีส้ม

### Common WRONG implementations (❌)
- ❌ "PloiKhong" สีดำทั้งคำ
- ❌ "Ploi" สีหนึ่ง + "Khong" อีกสี (two-tone)
- ❌ "Ploi**Khong**" ที่ Khong bold สีน้ำเงิน
- ❌ Solid red `#e63946` ทั้งคำ (ใช้แค่เป็น fallback)
- ❌ Wordmark อยู่คนละบรรทัด/คนละ component กับ mark

---

## 4. Sizing Guidelines

| Use case | Mark | Wordmark | หมายเหตุ |
|---|---|---|---|
| Favicon | 16–32px | hidden | mark only |
| Mobile header | 28px | 22px font | lockup horizontal |
| Desktop header | 36–40px | 28–32px font | lockup horizontal |
| Hero/splash | 96–128px | 56–72px font | อาจ stack แนวตั้ง |
| Email signature | 80px PNG | 24px text | flatten เป็น PNG |
| Print | 12–18mm | 10–12pt | export PDF/SVG |

### Rules
- Wordmark height = 0.7–0.8× mark height
- Tagline = 0.42× wordmark size
- Gap mark↔wordmark = 0.4× mark size
- Clear space รอบ logo ≥ ความสูงตัว "P"

---

## 5. Don'ts (สรุป)

1. ❌ Wordmark สีเดียว / ดำ / accent two-tone
2. ❌ เปลี่ยนสี / ลำดับ / จำนวนแถบของถุง
3. ❌ Drop shadow, glow, gradient ซ้อนบน mark
4. ❌ Distort aspect ratio
5. ❌ ใส่บนพื้นหลัง contrast < 3:1
6. ❌ ตัด tagline ออก (ยกเว้น variant="mark")
7. ❌ เปลี่ยน font (Inter Tight + IBM Plex Sans Thai เท่านั้น)

---

## 6. Files in repo

```
docs/branding/
└── LOGO_C10_SPEC.md                     ← ไฟล์นี้

public/logo/
└── sack.svg                              ← static SVG (สำหรับ <img>, og-image)

src/components/brand/
├── Logo.tsx                              ← React component (จาก section 1)
└── tokens.ts                             ← color tokens (จาก section 2)

src/styles/
└── brand.css                             ← (optional) global brand classes
```

---

## 7. Prompt สำหรับ Claude Code

Copy-paste ทั้งก้อนนี้ลงในห้องแชท Claude Code:

```
อ่าน docs/branding/LOGO_C10_SPEC.md ทั้งไฟล์ก่อนเริ่ม

Implement:

1. src/components/brand/Logo.tsx
   - Copy โค้ด TSX จาก section 1 ของ spec (ทั้งก้อน รวม Mark + Wordmark)
   - Export <Logo variant="lockup|mark|wordmark" size={number} />
   - Wordmark "PloiKhong" ต้องเป็น rainbow gradient ผ่าน background-clip: text
   - Fallback color = #e63946 (RED) ถ้า browser ไม่ support — ห้ามเป็นสีดำ

2. src/components/brand/tokens.ts
   - Copy PK_COLORS + PK_GRADIENT จาก section 2

3. ถ้าใช้ Tailwind:
   - เพิ่ม config จาก section 2 เข้า tailwind.config.js
   - Import "Inter Tight" + "IBM Plex Sans Thai" จาก Google Fonts

4. ใส่ <Logo variant="lockup" size={36} /> ใน app header
   - Component นี้ render ทั้ง icon + "PloiKhong" rainbow + tagline
   - ห้ามแยก wordmark ออกแล้วเขียน text ปกติ

5. แสดง screenshot/preview ของ header ที่มี logo ติดตั้งแล้ว

ตรวจสอบ critical rules ที่ section 0 ของ spec ก่อนส่งงาน
```

---

_Spec version: 2.0 — 2026-05-02 (rewritten for clarity)_
