'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { getMe } from '@/lib/api';

const LS_KEY = 'ploikhong_bg_color';

// Applies saved bg_color to document.body on every session load
function BgColorApplier() {
  const { data: session } = useSession();

  // On mount — apply from localStorage immediately (no flash)
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) document.body.style.background = saved;
  }, []);

  // When session available — fetch from backend and sync
  useEffect(() => {
    const token = (session?.user as any)?.token;
    if (!token) return;
    getMe(token).then((user: any) => {
      if (user?.bg_color) {
        document.body.style.background = user.bg_color;
        localStorage.setItem(LS_KEY, user.bg_color);
      } else {
        // user reset to default — clear
        document.body.style.background = '';
        localStorage.removeItem(LS_KEY);
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
