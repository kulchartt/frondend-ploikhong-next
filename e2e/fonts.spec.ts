/**
 * e2e tests: Font loading (globals.css fix)
 *
 * Root cause that was fixed:
 *   globals.css :root defined --font-th / --font-display / --font-mono with
 *   plain font-name strings.  Those had the same CSS specificity (0,1,0) as
 *   Next.js font-loader class selectors on <html> but loaded later in the
 *   cascade, so they silently overrode the real font references Next.js
 *   injected.  The browser could not resolve the bare names → fell back to
 *   system-ui for body text.
 *
 * After fix:
 *   - :root no longer defines those three variables.
 *   - Next.js sets them via its generated class on <html>.
 *   - body / headings use var(--font-th, …fallback…) so they always resolve.
 */

import { test, expect } from '@playwright/test';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Read a CSS custom property from an element, trimmed. */
function cssVar(page: import('@playwright/test').Page, selector: string, prop: string) {
  return page.evaluate(
    ([sel, p]) => {
      const el = document.querySelector(sel as string) as Element;
      return getComputedStyle(el).getPropertyValue(p as string).trim();
    },
    [selector, prop] as const,
  );
}

/** Read the computed font-family of a selector. */
function computedFont(page: import('@playwright/test').Page, selector: string) {
  return page.evaluate(
    (sel) => getComputedStyle(document.querySelector(sel as string) as Element).fontFamily,
    selector,
  );
}

// ─── suite ───────────────────────────────────────────────────────────────────

test.describe('Font loading', () => {
  test.beforeEach(async ({ page }) => {
    // Stub the products API so the page loads fast without a real backend.
    await page.route('**/api/products**', route =>
      route.fulfill({ status: 200, body: '[]', contentType: 'application/json' }),
    );
    await page.route('**/api/products/categories**', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ total: 0, categories: [] }),
        contentType: 'application/json',
      }),
    );
    await page.goto('/');
    // Wait for fonts to have been injected (Next.js does this synchronously
    // on initial HTML, but give a tick for hydration).
    await page.waitForLoadState('domcontentloaded');
  });

  // ── 1. Next.js font-loader class is present on <html> ────────────────────

  test('html element has Next.js font variable class(es)', async ({ page }) => {
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    // next/font injects classes like __variable_xxxxxx for each font
    expect(htmlClass).toMatch(/__variable_/);
  });

  // ── 2. --font-th is set (not empty) ──────────────────────────────────────

  test('--font-th CSS variable is defined on the document', async ({ page }) => {
    const val = await cssVar(page, 'html', '--font-th');
    expect(val.length).toBeGreaterThan(0);
  });

  test('--font-display CSS variable is defined on the document', async ({ page }) => {
    const val = await cssVar(page, 'html', '--font-display');
    expect(val.length).toBeGreaterThan(0);
  });

  test('--font-mono CSS variable is defined on the document', async ({ page }) => {
    const val = await cssVar(page, 'html', '--font-mono');
    expect(val.length).toBeGreaterThan(0);
  });

  // ── 3. globals.css no longer overrides the variables in :root ────────────
  //
  // Before the fix: --font-th on <body> started with the literal font-name
  // string `"IBM Plex Sans Thai"` (no obfuscated Next.js prefix).
  // After the fix: the value is the Next.js-injected reference which begins
  // with the internal font name (contains "__" prefix) or is the fallback.
  // Either way it must NOT be the bare plain-string list that globals.css
  // previously set.

  test('body --font-th is NOT the bare globals.css plain-string override', async ({ page }) => {
    // The old globals.css value started with exactly this sequence:
    const oldValue = `'IBM Plex Sans Thai', 'IBM Plex Sans', system-ui, sans-serif`;

    const val = await cssVar(page, 'body', '--font-th');
    // If globals.css still wins, val equals the old value above.
    // After the fix the variable is set by Next.js with an obfuscated name.
    expect(val).not.toBe(oldValue);
  });

  // ── 4. body font-family is not just the system-ui fallback ───────────────
  //
  // When the override was active the browser silently fell back to system-ui
  // because the plain font names had no @font-face backing them.

  test('body computed font-family is not solely system-ui', async ({ page }) => {
    const fam = await computedFont(page, 'body');
    // system-ui alone (or "-apple-system") means all custom fonts failed.
    // After the fix the value should contain the Next.js internal font name.
    const onlySystem = /^(system-ui|-apple-system|BlinkMacSystemFont)$/i.test(fam.replace(/['"]/g, '').trim());
    expect(onlySystem).toBe(false);
  });

  // ── 5. body and headings use DIFFERENT font families ─────────────────────
  //
  // Spec: body → IBM Plex Sans Thai, headings → Inter Tight.
  // Before fix: both fell back to system-ui → identical.

  test('body and h1 have different computed font-family (heading ≠ body)', async ({ page }) => {
    // Inject a visible h1 so we have something to measure.
    await page.evaluate(() => {
      const h = document.createElement('h1');
      h.id = '__test_h1__';
      h.textContent = 'test heading';
      h.style.position = 'absolute';
      h.style.opacity = '0';
      h.style.pointerEvents = 'none';
      document.body.appendChild(h);
    });

    const bodyFont = await computedFont(page, 'body');
    const h1Font   = await computedFont(page, '#__test_h1__');

    // They must differ — that's the whole point of having two separate fonts.
    expect(bodyFont).not.toBe(h1Font);
  });

  // ── 6. .mono class resolves correctly ────────────────────────────────────

  test('.mono element computed font-family differs from body', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.createElement('span');
      el.id = '__test_mono__';
      el.className = 'mono';
      el.style.position = 'absolute';
      el.style.opacity = '0';
      document.body.appendChild(el);
    });

    const bodyFont = await computedFont(page, 'body');
    const monoFont = await computedFont(page, '#__test_mono__');

    expect(monoFont).not.toBe(bodyFont);
  });

  // ── 7. Font-family inheritance works across page sections ─────────────────

  test('nav / header text inherits body font (not system-ui alone)', async ({ page }) => {
    const navFont = await computedFont(page, 'nav, header');
    const onlySystem = /^(system-ui|-apple-system)$/i.test(navFont.replace(/['"]/g, '').trim());
    expect(onlySystem).toBe(false);
  });

  // ── 8. Computed font references a loaded @font-face name ─────────────────
  //
  // Next.js registers @font-face rules with an obfuscated font-family name
  // that starts with "__".  After the fix, --font-th resolves to that name
  // so the computed font-family on body contains it.

  test('computed body font-family references the Next.js internal font name (__)', async ({ page }) => {
    const fam = await computedFont(page, 'body');
    // Next.js internal names look like: "__IBM_Plex_Sans_Thai_abc123"
    expect(fam).toContain('__');
  });

  // ── 9. Heading font-family also references the Next.js internal font name ─

  test('computed h1 font-family references the Next.js internal font name (__)', async ({ page }) => {
    await page.evaluate(() => {
      const h = document.createElement('h1');
      h.id = '__test_h1_b__';
      document.body.appendChild(h);
    });
    const fam = await computedFont(page, '#__test_h1_b__');
    expect(fam).toContain('__');
  });

  // ── 10. Regression: page still renders without JS errors from fonts ───────

  test('no console errors about fonts on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const fontErrors = errors.filter(e => /font|typeface|IBM|Inter/i.test(e));
    expect(fontErrors).toHaveLength(0);
  });
});
