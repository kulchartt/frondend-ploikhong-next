'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { getMe } from '@/lib/api';

const LS_BG    = 'ploikhong_bg_color';
const LS_DARK  = 'ploikhong_dark_mode';
const LS_REMEMBER = 'ploikhong_remember_prefs';

export function applyTheme(darkMode: boolean, bgColor?: string | null) {
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  // bg_color overrides the CSS variable bg only when light mode
  document.body.style.background = (!darkMode && bgColor) ? bgColor : '';
}

// Applies saved preferences to DOM on every session load
function BgColorApplier() {
  const { data: session } = useSession();

  // On mount — apply from localStorage immediately (no flash)
  useEffect(() => {
    const dark = localStorage.getItem(LS_DARK) === '1';
    const bg   = localStorage.getItem(LS_BG) || null;
    applyTheme(dark, bg);
  }, []);

  // When session available — fetch from backend and sync
  useEffect(() => {
    const token = (session?.user as any)?.token;
    if (!token) return;
    getMe(token).then((user: any) => {
      const remember = user?.remember_prefs !== 0; // default true
      if (remember) {
        const dark = !!user?.dark_mode;
        const bg   = user?.bg_color || null;
        applyTheme(dark, bg);
        // sync localStorage
        if (dark) localStorage.setItem(LS_DARK, '1');
        else localStorage.removeItem(LS_DARK);
        if (bg) localStorage.setItem(LS_BG, bg);
        else localStorage.removeItem(LS_BG);
        localStorage.setItem(LS_REMEMBER, '1');
      } else {
        // user opted out — clear stored prefs
        localStorage.removeItem(LS_DARK);
        localStorage.removeItem(LS_BG);
        localStorage.setItem(LS_REMEMBER, '0');
        applyTheme(false, null);
      }
    }).catch(() => {});
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BgColorApplier />
      {children}
    </SessionProvider>
  );
}
