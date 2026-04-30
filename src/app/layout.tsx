import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://frontend-next-pied.vercel.app'),
  title: {
    default: 'PloiKhong — ตลาดซื้อขายของมือสอง',
    template: '%s | PloiKhong',
  },
  description: 'ของดี ราคาโดน ทุกวัน — ตลาดซื้อขายของมือสองออนไลน์ที่ใหญ่ที่สุด มือหนึ่งก็มี มือสองก็ดี',
  keywords: [
    'ของมือสอง',
    'ตลาดนัดออนไลน์',
    'ซื้อขายของมือสอง',
    'สินค้ามือสอง',
    'พลอยของ',
    'PloiKhong',
    'ขายของออนไลน์',
    'ของแต่งบ้านมือสอง',
    'เสื้อผ้ามือสอง',
    'มือสองราคาถูก',
  ],
  openGraph: {
    title: 'PloiKhong — ตลาดซื้อขายของมือสอง',
    description: 'ของดี ราคาโดน ทุกวัน — ตลาดซื้อขายของมือสองออนไลน์ที่ใหญ่ที่สุด',
    type: 'website',
    locale: 'th_TH',
    siteName: 'PloiKhong',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'PloiKhong — ตลาดซื้อขายของมือสอง',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PloiKhong — ตลาดซื้อขายของมือสอง',
    description: 'ของดี ราคาโดน ทุกวัน — ตลาดซื้อขายของมือสองออนไลน์ที่ใหญ่ที่สุด',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
