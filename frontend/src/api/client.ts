import {
  User,
  Category,
  Product,
  ProductReview,
  Cart,
  Order,
  ChatAskResponse,
  ChatSession,
  ProductComparison,
  AdminStats,
  ReferencedProduct
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || '/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('buysmart_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = response.statusText || `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (typeof errJson.detail === 'string') {
        errorDetail = errJson.detail;
      } else if (Array.isArray(errJson.detail)) {
        errorDetail = errJson.detail
          .map((d: any) => (typeof d === 'string' ? d : d?.msg || JSON.stringify(d)))
          .join('; ');
      }
    } catch {
      // Keep statusText fallback when response body is not JSON (e.g. proxy 500)
      if (response.status === 500) {
        errorDetail = 'Backend server is not reachable on port 8000 or returned an Internal Server Error.';
      }
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // --- AUTH ---
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => request<User>('/auth/me'),

  // --- CATEGORIES ---
  getCategories: () => request<Category[]>('/categories'),

  // --- PRODUCTS ---
  getProducts: (params?: {
    category_id?: number;
    brand?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    in_stock_only?: boolean;
    sort_by?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.brand) query.append('brand', params.brand);
    if (params?.min_price !== undefined) query.append('min_price', params.min_price.toString());
    if (params?.max_price !== undefined) query.append('max_price', params.max_price.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.in_stock_only) query.append('in_stock_only', 'true');
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  getProductById: (id: number) => request<Product>(`/products/${id}`),

  compareProducts: (productIds: number[]) =>
    request<ProductComparison>('/products/compare', {
      method: 'POST',
      body: JSON.stringify({ product_ids: productIds }),
    }),

  toggleBookmark: (productId: number) =>
    request<{ bookmarked: boolean; message: string }>(`/products/${productId}/bookmark`, {
      method: 'POST',
    }),

  getBookmarks: () => request<Product[]>('/products/bookmarks/my'),

  // --- CART ---
  getCart: () => request<Cart>('/cart'),

  addToCart: (productId: number, quantity: number = 1) =>
    request<Cart>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateCartItem: (itemId: number, quantity: number) =>
    request<Cart>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (itemId: number) =>
    request<Cart>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    request<Cart>('/cart/clear', {
      method: 'DELETE',
    }),

  // --- ORDERS ---
  checkout: () =>
    request<Order>('/orders/checkout', {
      method: 'POST',
    }),

  getOrders: () => request<Order[]>('/orders'),

  getOrderById: (id: number) => request<Order>(`/orders/${id}`),

  // --- REVIEWS ---
  addReview: (productId: number, rating: number, reviewText?: string) =>
    request<ProductReview>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, rating, review_text: reviewText }),
    }),

  getProductReviews: (productId: number) => request<ProductReview[]>(`/reviews/product/${productId}`),

  // --- CHAT / RAG ASSISTANT ---
  askAssistant: (message: string, sessionId?: number) =>
    request<ChatAskResponse>('/chat/ask', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    }),

  getChatSessions: () => request<ChatSession[]>('/chat/sessions'),

  getChatSession: (sessionId: number) => request<ChatSession>(`/chat/sessions/${sessionId}`),

  getQuickRecommendations: (query: string, limit: number = 4) =>
    request<ReferencedProduct[]>(`/chat/recommendations?query=${encodeURIComponent(query)}&limit=${limit}`, {
      method: 'POST',
    }),

  // --- ADMIN ---
  createProduct: (data: any) =>
    request<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: number, data: any) =>
    request<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: number) =>
    request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    }),

  ingestDocument: (data: { title: string; content: string; document_type?: string; source?: string }) =>
    request<{ document_id: number; title: string; chunks_created: number; status: string }>(
      '/admin/documents/ingest',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  getAdminStats: () => request<AdminStats>('/admin/stats'),
};
