import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai, IBM_Plex_Mono, Inter_Tight } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-th',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const interTight = Inter_Tight({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PloiKhong — ตลาดซื้อขายของมือสอง',
  description: 'ของดี ราคาโดน ทุกวัน — มือหนึ่งก็มี มือสองก็ดี',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${ibmPlexSansThai.variable} ${ibmPlexMono.variable} ${interTight.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
