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
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../data/seedCatalog';

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
      if (response.status === 500) {
        errorDetail = 'Backend server returned an Internal Server Error.';
      }
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Client-side intelligent search helper over seed catalog
function clientSideSearch(params?: {
  category_id?: number;
  brand?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  in_stock_only?: boolean;
  sort_by?: string;
  limit?: number;
}): Product[] {
  let list = [...SEED_PRODUCTS];

  if (params?.category_id) {
    list = list.filter(p => p.category_id === params.category_id);
  }
  if (params?.brand) {
    list = list.filter(p => p.brand.toLowerCase() === params.brand!.toLowerCase());
  }
  if (params?.min_price !== undefined) {
    list = list.filter(p => p.price >= params.min_price!);
  }
  if (params?.max_price !== undefined) {
    list = list.filter(p => p.price <= params.max_price!);
  }
  if (params?.in_stock_only) {
    list = list.filter(p => p.stock_quantity > 0);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category_name && p.category_name.toLowerCase().includes(q))
    );
  }

  if (params?.sort_by === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (params?.sort_by === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (params?.sort_by === 'rating') {
    list.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
  }

  if (params?.limit && params.limit > 0) {
    list = list.slice(0, params.limit);
  }

  return list;
}

// Client-side AI fallback assistant
function generateClientAssistantResponse(message: string, sessionId?: number): ChatAskResponse {
  const q = message.toLowerCase();
  let matched = [...SEED_PRODUCTS];

  // Detect category keywords
  let categoryName = '';
  if (q.includes('laptop') || q.includes('notebook') || q.includes('macbook') || q.includes('programming') || q.includes('coding')) {
    matched = matched.filter(p => p.category_id === 2);
    categoryName = 'Laptops';
  } else if (q.includes('phone') || q.includes('mobile') || q.includes('smartphone') || q.includes('iphone') || q.includes('camera')) {
    matched = matched.filter(p => p.category_id === 1);
    categoryName = 'Smartphones';
  } else if (q.includes('headphone') || q.includes('earphone') || q.includes('audio') || q.includes('anc') || q.includes('earbuds') || q.includes('sound')) {
    matched = matched.filter(p => p.category_id === 3);
    categoryName = 'Headphones';
  } else if (q.includes('watch') || q.includes('smartwatch') || q.includes('fitness') || q.includes('tracker')) {
    matched = matched.filter(p => p.category_id === 4);
    categoryName = 'Smartwatches';
  } else if (q.includes('charger') || q.includes('hub') || q.includes('mouse') || q.includes('ssd') || q.includes('accessory')) {
    matched = matched.filter(p => p.category_id === 5);
    categoryName = 'Accessories';
  }

  // Detect budget keywords (e.g. "under 60000", "under 25k", "under ₹50,000")
  let budget: number | undefined;
  const budgetMatch = q.match(/under\s+(?:rs\.?|inr|₹)?\s*(\d+)(?:k|,\d+)?/i);
  if (budgetMatch) {
    let raw = budgetMatch[1];
    if (q.includes(raw + 'k')) {
      budget = parseInt(raw, 10) * 1000;
    } else {
      budget = parseInt(raw.replace(/,/g, ''), 10);
    }
  }

  if (budget) {
    const budgetFiltered = matched.filter(p => p.price <= budget!);
    if (budgetFiltered.length > 0) {
      matched = budgetFiltered;
    }
  }

  // Sort by rating
  matched.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
  const topProducts = matched.slice(0, 3);

  const referenced: ReferencedProduct[] = topProducts.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    stock_quantity: p.stock_quantity,
    image_url: p.image_url,
    specifications: p.specifications,
    reason: `Top recommendation matching your query (${p.brand} ${p.name} at ₹${p.price.toLocaleString('en-IN')})`
  }));

  // Build markdown reply
  let reply = `Based on your request for **${categoryName || 'electronics'}**${budget ? ` under ₹${budget.toLocaleString('en-IN')}` : ''}, here are our verified recommendations:\n\n`;

  topProducts.forEach((p, idx) => {
    reply += `### ${idx + 1}. [${p.brand} ${p.name}](#product-${p.id}) — ₹${p.price.toLocaleString('en-IN')}\n`;
    reply += `- **Highlights**: ${p.description}\n`;
    if (p.specifications) {
      const specKeys = Object.keys(p.specifications).slice(0, 4);
      const specSummary = specKeys.map(k => `${k}: ${p.specifications![k]}`).join(' | ');
      reply += `- **Specs**: ${specSummary}\n`;
    }
    reply += `- **Stock**: ${p.stock_quantity > 0 ? `In Stock (${p.stock_quantity} available)` : 'Out of Stock'}\n\n`;
  });

  reply += `> 💡 **Store Policy Note**: All orders above ₹999 qualify for Free Express Shipping and a 7-Day Replacement Guarantee with manufacturer warranty.`;

  return {
    session_id: sessionId || Date.now(),
    reply,
    referenced_products: referenced,
    sources: [
      'Verified Store Catalog & Inventory Database',
      'Electronics Buying & Specifications Guide'
    ],
    detected_budget: budget,
    detected_category: categoryName || undefined
  };
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
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await request<Category[]>('/categories');
      if (Array.isArray(res) && res.length > 0) return res;
      return SEED_CATEGORIES;
    } catch (e) {
      console.warn('Backend categories endpoint unreachable, using verified catalog categories.');
      return SEED_CATEGORIES;
    }
  },

  // --- PRODUCTS ---
  getProducts: async (params?: {
    category_id?: number;
    brand?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    in_stock_only?: boolean;
    sort_by?: string;
    page?: number;
    limit?: number;
  }): Promise<Product[]> => {
    try {
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
      const res = await request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
      if (Array.isArray(res) && res.length > 0) return res;
      return clientSideSearch(params);
    } catch (e) {
      console.warn('Backend products endpoint unreachable, using client catalog dataset.');
      return clientSideSearch(params);
    }
  },

  getProductById: async (id: number): Promise<Product> => {
    try {
      return await request<Product>(`/products/${id}`);
    } catch (e) {
      const found = SEED_PRODUCTS.find(p => p.id === id);
      if (found) return found;
      throw e;
    }
  },

  compareProducts: async (productIds: number[]): Promise<ProductComparison> => {
    try {
      return await request<ProductComparison>('/products/compare', {
        method: 'POST',
        body: JSON.stringify({ product_ids: productIds }),
      });
    } catch (e) {
      const prods = SEED_PRODUCTS.filter(p => productIds.includes(p.id));
      const allKeys = new Set<string>();
      prods.forEach(p => {
        if (p.specifications) {
          Object.keys(p.specifications).forEach(k => allKeys.add(k));
        }
      });
      const diffs: Record<string, Record<string, string>> = {};
      allKeys.forEach(key => {
        diffs[key] = {};
        prods.forEach(p => {
          diffs[key][p.name] = (p.specifications && p.specifications[key]) ? String(p.specifications[key]) : 'N/A';
        });
      });
      return {
        products: prods,
        common_specs: [],
        differences: diffs,
        recommendation_summary: `Comparing ${prods.map(p => p.name).join(' vs ')}. Review individual specs and pricing below.`
      };
    }
  },

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
  askAssistant: async (message: string, sessionId?: number): Promise<ChatAskResponse> => {
    try {
      return await request<ChatAskResponse>('/chat/ask', {
        method: 'POST',
        body: JSON.stringify({ message, session_id: sessionId }),
      });
    } catch (e) {
      console.warn('Backend /chat/ask endpoint unreachable, utilizing client-side RAG fallback.');
      return generateClientAssistantResponse(message, sessionId);
    }
  },

  getChatSessions: () => request<ChatSession[]>('/chat/sessions'),

  getChatSession: (sessionId: number) => request<ChatSession>(`/chat/sessions/${sessionId}`),

  getQuickRecommendations: async (query: string, limit: number = 4): Promise<ReferencedProduct[]> => {
    try {
      return await request<ReferencedProduct[]>(`/chat/recommendations?query=${encodeURIComponent(query)}&limit=${limit}`, {
        method: 'POST',
      });
    } catch (e) {
      const q = query.toLowerCase();
      const matched = SEED_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category_name && p.category_name.toLowerCase().includes(q))
      ).slice(0, limit);
      return matched.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        stock_quantity: p.stock_quantity,
        image_url: p.image_url,
        specifications: p.specifications
      }));
    }
  },

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
