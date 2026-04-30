import { MetadataRoute } from 'next';

const BASE_URL = 'https://frontend-next-pied.vercel.app';
const API_URL = 'https://khai-claude-production.up.railway.app';

const staticPages: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/refund`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/rules`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/api/products`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch products');

    const data = await res.json();
    const products: Array<{ id: number; updated_at?: string; created_at?: string }> =
      Array.isArray(data) ? data : data.products ?? [];

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE_URL}/products/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...productEntries];
  } catch {
    // Return static pages only if the API is unreachable
    return staticPages;
  }
}
