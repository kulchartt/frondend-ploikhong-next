// หน้าแสดงรายละเอียดสินค้า — Product Detail Page (Server Component)
// generateMetadata สำหรับ dynamic OG tags, render ผ่าน ProductDetailClient

import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_URL = 'https://khai-claude-production.up.railway.app';
const BASE_URL = 'https://frontend-next-pied.vercel.app';

interface Props {
  params: { id: string };
}

async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProduct(params.id);

  if (!product) {
    return {
      title: 'ไม่พบสินค้า',
      description: 'สินค้าอาจถูกลบหรือไม่มีอยู่ในระบบ',
    };
  }

  const ogImage =
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image_url) ?? `${BASE_URL}/og-default.png`;

  const description = product.description
    ? String(product.description).slice(0, 160)
    : `ราคา ฿${Number(product.price).toLocaleString('th-TH')} — ซื้อขายที่ PloiKhong`;

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: [ogImage],
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
