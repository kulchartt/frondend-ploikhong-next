# Typography — PloiKhong

## Font stack (system fonts)

```css
--font-th:      system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono:    ui-monospace, 'Cascadia Code', Consolas, 'Courier New', monospace;
```

- **Windows** → Segoe UI (body) + Leelawadee (Thai, มีหัว)
- **macOS/iOS** → -apple-system / Thonburi (Thai)

> ไม่ใช้ Google Fonts เพื่อให้ตรงกับ preview ที่ render ด้วย system font

## Scale

| ใช้ทำอะไร | Size | Weight | Font |
|---|---|---|---|
| Brand logo | 17px | 900 | `var(--font-display)` |
| Page H1 (hub) | 18px | 800 | `var(--font-display)` |
| Card title | 14–15px | 700 | body |
| Body / menu item | 13px | 400–600 | body |
| Caption / meta | 11–12px | 400–600 | body |
| Coin balance | 20–32px | 800 | `var(--font-mono)` |
| Mono badge | 11px | 700 | `var(--font-mono)` |

## เกณฑ์ตัวหนา

- `font-weight: 700+` → heading, price, badge
- `font-weight: 600` → active nav, button, label
- `font-weight: 400–500` → body, description
