# Colors — PloiKhong

CSS variables อยู่ใน `frontend-next/src/app/globals.css`

## Core palette

| Token | Light | Dark | ใช้ทำอะไร |
|---|---|---|---|
| `--bg` | `#f8f7f5` | `#0f0f0f` | พื้นหลังหลัก |
| `--surface` | `#ffffff` | `#1a1a1a` | card, sidebar, header |
| `--surface-2` | `#f1efec` | `#242424` | input bg, hover state |
| `--ink` | `#1a1714` | `#f0ede8` | text หลัก |
| `--ink-2` | `#6b6560` | `#a09a94` | text รอง |
| `--ink-3` | `#9e9892` | `#6b6560` | placeholder, hint |
| `--line` | `#e8e4de` | `#2a2a2a` | border ปกติ |
| `--accent` | `#e8531a` | `#f06030` | CTA หลัก (ปุ่ม ลงขาย) |

## Semantic colors

| Token | Value | ใช้ทำอะไร |
|---|---|---|
| `--pos` | `#16a34a` | ราคา / เพิ่มขึ้น / success |
| `--neg` | `#dc2626` | ลด / error / ราคาขีดฆ่า |

## Feature colors (ไม่ใช่ token, hardcoded)

| ใช้กับ | สี | Hex |
|---|---|---|
| Boost badge | Purple | `#7c3aed` |
| Featured badge | Amber | `#f59e0b` |
| ฝั่งขาย accent | Orange | `#f97316` |
| ฝั่งซื้อ accent | Blue | `#2563eb` |
| Coin balance gradient | Amber→Orange | `#f59e0b → #d97706` |
| Success (active feature) | Green | `#16a34a` |

## Status colors (listing)

| Status | Text | Background | Dot |
|---|---|---|---|
| กำลังขาย | `#15803d` | `#dcfce7` | `#22c55e` |
| ขายแล้ว | `#475569` | `#f1f5f9` | `#94a3b8` |
| จองแล้ว | `#7c3aed` | `#ede9fe` | `#a78bfa` |
| ปิดประกาศ | `#c2410c` | `#ffedd5` | `#fb923c` |
| ฉบับร่าง | `#a16207` | `#fef9c3` | `#facc15` |
