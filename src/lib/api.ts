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
  // Backend may return seller's id as user_id; components expect seller_id
  if (p.seller_id === undefined && p.user_id !== undefined) {
    p.seller_id = p.user_id;
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

export const sendMessage = (roomId: number, content: string, token: string) =>
  req<any>(`/api/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }, token);

export const getUnreadCount = (token: string) =>
  req<{ unread: number }>('/api/chat/unread', {}, token);

export const sendChatImage = async (roomId: number, file: File, token: string): Promise<any> => {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${BASE}/api/chat/rooms/${roomId}/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'อัพโหลดรูปไม่สำเร็จ');
  return data;
};

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

export const getIncomingOffers = (token: string) =>
  req<any[]>('/api/offers/incoming', {}, token);

export const getOutgoingOffers = (token: string) =>
  req<any[]>('/api/offers/outgoing', {}, token);

export const respondToOffer = (id: number, status: 'accepted' | 'declined', token: string) =>
  req<any>(`/api/offers/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);

// ─── Notifications ───────────────────────────────────────────────────────────

export const getNotifications = (token: string) =>
  req<{ notifications: any[]; unread: number }>('/api/notifications', {}, token);

export const markNotificationsRead = (token: string) =>
  req<any>('/api/notifications/read-all', { method: 'POST' }, token);

// ─── Follows ──────────────────────────────────────────────────────────────────

export const getFollowing = (token: string) =>
  req<any[]>('/api/follows', {}, token);

export const toggleFollow = (sellerId: number, token: string) =>
  req<{ following: boolean; message: string }>('/api/follows/toggle', {
    method: 'POST',
    body: JSON.stringify({ seller_id: sellerId }),
  }, token);

export const getFollowStatus = (sellerId: number, token: string) =>
  req<{ following: boolean }>(`/api/follows/status/${sellerId}`, {}, token);

export const getFollowerCount = (sellerId: number) =>
  req<{ count: number }>(`/api/follows/count/${sellerId}`);

// ─── Shop ────────────────────────────────────────────────────────────────────

export const getShop = (userId: number) =>
  req<any>(`/api/shop/${userId}`);

export const getProductsBySeller = (sellerId: number) =>
  req<any[]>(`/api/products?seller_id=${sellerId}`).then(d => Array.isArray(d) ? d.map(normalizeProduct) : []);

// ─── Analytics ───────────────────────────────────────────────────────────────

export const trackEvent = (productId: number, eventType: 'view' | 'wishlist' | 'chat_open' | 'offer' | 'share', token?: string) =>
  req<any>('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, event_type: eventType }),
  }, token).catch(() => {}); // fire-and-forget, never throw

export const getSellerAnalytics = (token: string) =>
  req<any[]>('/api/analytics/seller', {}, token);

export const getProductRecommendations = (productId: number, token: string) =>
  req<{ product_id: number; stats: any; recommendations: any[] }>(`/api/analytics/recommendations/${productId}`, {}, token);

// ─── Coins / Premium ─────────────────────────────────────────────────────────

export const getCoinPackages = () =>
  req<{ packages: any[]; features: any; promptpay: string; promptpay_name: string }>('/api/coins/packages');

export const getCoinBalance = (token: string) =>
  req<{ balance: number }>('/api/coins/balance', {}, token);

export const getCoinTransactions = (token: string) =>
  req<any[]>('/api/coins/transactions', {}, token);

export const requestCoinPayment = (body: { package_key: string; sender_name: string; slip_url?: string }, token: string) =>
  req<any>('/api/coins/request-payment', { method: 'POST', body: JSON.stringify(body) }, token);

export const getMyPaymentRequests = (token: string) =>
  req<any[]>('/api/coins/payment-requests/my', {}, token);

export const activateFeature = (featureKey: string, productId: number | null, token: string) =>
  req<any>('/api/coins/activate-feature', {
    method: 'POST',
    body: JSON.stringify({ feature_key: featureKey, product_id: productId }),
  }, token);

export const getActiveFeatures = (token: string) =>
  req<any[]>('/api/coins/active-features', {}, token);

// Admin coin management
export const getPaymentRequests = (status: string, token: string) =>
  req<any[]>(`/api/coins/payment-requests?status=${status}`, {}, token);

export const confirmPayment = (id: number, token: string) =>
  req<any>(`/api/coins/payment-requests/${id}/confirm`, { method: 'POST' }, token);

export const rejectPayment = (id: number, note: string, token: string) =>
  req<any>(`/api/coins/payment-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) }, token);

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
