import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

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
    <html lang="th">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
