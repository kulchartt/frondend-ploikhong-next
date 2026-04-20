const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app';

async function req<T>(path: string, opts?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
  return data;
}

// ─── Normalize ──────────────────────────────────────────────────────────────

function normalizeProduct(p: any): any {
  if (!p || typeof p !== 'object') return p;
  // Backend returns image_url (string); components expect images (string[])
  if (p.images === undefined || p.images === null) {
    p.images = p.image_url ? [p.image_url] : [];
  }
  return p;
}

// ─── Products ───────────────────────────────────────────────────────────────

export const getProducts = async (params?: Record<string, string | number>): Promise<any[]> => {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
  const data = await req<any[]>(`/api/products${qs}`);
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
};

export const getProduct = async (id: number): Promise<any> => {
  const data = await req<any>(`/api/products/${id}`);
  return normalizeProduct(data);
};

export const createProduct = (body: any, token: string) =>
  req<any>('/api/products', { method: 'POST', body: JSON.stringify(body) }, token);

export const updateProduct = (id: number, body: any, token: string) =>
  req<any>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token);

export const deleteProduct = (id: number, token: string) =>
  req<any>(`/api/products/${id}`, { method: 'DELETE' }, token);

export const getMyProducts = (token: string) =>
  req<any[]>('/api/products/my', {}, token);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginEmail = (email: string, password: string) =>
  req<{ token: string; user: any }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const registerEmail = (name: string, email: string, password: string) =>
  req<{ token: string; user: any }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const getMe = (token: string) => req<any>('/api/auth/me', {}, token);

// ─── Chat ────────────────────────────────────────────────────────────────────

export const getChatRooms = (token: string) =>
  req<any[]>('/api/chat/rooms', {}, token);

export const getChatMessages = (roomId: number, token: string) =>
  req<any[]>(`/api/chat/rooms/${roomId}/messages`, {}, token);

export const createChatRoom = (sellerId: number, productId: number, token: string) =>
  req<any>('/api/chat/rooms', {
    method: 'POST',
    body: JSON.stringify({ seller_id: sellerId, product_id: productId }),
  }, token);

// ─── Wishlist ────────────────────────────────────────────────────────────────

export const getWishlist = (token: string) =>
  req<any[]>('/api/wishlist', {}, token);

export const toggleWishlist = (productId: number, token: string) =>
  req<any>(`/api/wishlist/${productId}`, { method: 'POST' }, token);

// ─── Offers ──────────────────────────────────────────────────────────────────

export const makeOffer = (productId: number, amount: number, token: string) =>
  req<any>('/api/offers', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, amount }),
  }, token);

export const getMyOffers = (token: string) =>
  req<any[]>('/api/offers/my', {}, token);

// ─── Upload ──────────────────────────────────────────────────────────────────

export const uploadImage = async (file: File, token: string): Promise<string> => {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${BASE}/api/products/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
};
