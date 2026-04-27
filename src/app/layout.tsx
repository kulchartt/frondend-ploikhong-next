import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'PloiKhong — ตลาดซื้อขายของมือสอง',
  description: 'ของดี ราคาโดน ทุกวัน — มือหนึ่งก็มี มือสองก็ดี',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
