import type { Metadata } from 'next';
import { Inter_Tight, IBM_Plex_Sans_Thai } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ploikhong.com'),
  title: {
    default: 'PloiKhong — ตลาดซื้อขายของมือสองออนไลน์ ปล่อยของง่าย',
    template: '%s | PloiKhong ตลาดของมือสอง',
  },
  description: 'PloiKhong ปล่อยของ — ตลาดซื้อขายของมือสองออนไลน์อันดับ 1 ของดีราคาโดนทุกวัน ลงขายง่าย ค้นหาสะดวก มีของทุกประเภท ทั้งเสื้อผ้า อุปกรณ์อิเล็กทรอนิกส์ ของแต่งบ้าน และอีกมากมาย',
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
    title: 'PloiKhong — ตลาดซื้อขายของมือสองออนไลน์ ปล่อยของง่าย',
    description: 'PloiKhong ปล่อยของ — ตลาดซื้อขายของมือสองออนไลน์ ของดีราคาโดนทุกวัน ลงขายง่าย ค้นหาสะดวก มีของทุกประเภท ทั้งเสื้อผ้า อิเล็กทรอนิกส์ ของแต่งบ้าน',
    type: 'website',
    locale: 'th_TH',
    siteName: 'PloiKhong',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'PloiKhong — ตลาดซื้อขายของมือสอง',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PloiKhong — ตลาดซื้อขายของมือสองออนไลน์ ปล่อยของง่าย',
    description: 'PloiKhong ปล่อยของ — ตลาดซื้อขายของมือสองออนไลน์ ของดีราคาโดนทุกวัน ลงขายง่าย ค้นหาสะดวก มีของทุกประเภท ทั้งเสื้อผ้า อิเล็กทรอนิกส์ ของแต่งบ้าน',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${interTight.variable} ${ibmPlexSansThai.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
