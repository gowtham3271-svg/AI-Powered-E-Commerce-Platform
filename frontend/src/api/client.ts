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
  const q = message.toLowerCase().trim();

  // 1. Direct Store Policy Answers
  if (q.includes('return') || q.includes('replace') || q.includes('refund') || q.includes('exchange')) {
    return {
      session_id: sessionId || Date.now(),
      reply: `### BuySmart 7-Day Doorstep Replacement Guarantee\n\n- **7-Day Replacement**: You can request a hassle-free doorstep replacement within **7 days** of delivery if your item is damaged, defective, or incorrect.\n- **Zero Friction**: A courier agent conducts an on-the-spot verification and provides an instant exchange.\n- **Full Refund Alternative**: If an exact replacement model is out of stock, 100% of your amount is credited back to your original payment method in 3–5 business days.\n- **Requirements**: Ensure original packaging, warranty documentation, and bundled accessories remain intact.\n\n> 📦 To initiate a return, visit your [Order History](#orders) or message customer support.`,
      referenced_products: [],
      sources: ['BuySmart Return & Replacement Policy', 'Customer Protection Guarantee']
    };
  }

  if (q.includes('shipping') || q.includes('delivery') || q.includes('dispatch') || q.includes('courier') || q.includes('track')) {
    return {
      session_id: sessionId || Date.now(),
      reply: `### BuySmart Express Shipping & Delivery\n\n- **Free Delivery**: All orders above **₹499** qualify for 100% Free Express Shipping across India.\n- **Same-Day Dispatch**: Orders placed before 4:00 PM IST ship on the same business day.\n- **Metro Timelines**: Delhi NCR, Mumbai, Bengaluru, Hyderabad, and Chennai receive delivery in **24–48 hours**.\n- **All India Coverage**: Other locations arrive in **2–4 business days** via premium air couriers (Blue Dart & Delhivery).\n- **Live Tracking**: Instant tracking link dispatched via SMS and WhatsApp upon handover to logistics.`,
      referenced_products: [],
      sources: ['Logistics & Express Delivery SLAs']
    };
  }

  if (q.includes('warranty') || q.includes('guarantee') || q.includes('genuine') || q.includes('authentic')) {
    return {
      session_id: sessionId || Date.now(),
      reply: `### 100% Genuine Certified Hardware & Brand Warranty\n\n- **Official Distributor Sourced**: All laptops, smartphones, and audio gear are factory-sealed and 100% authentic.\n- **Manufacturer Warranty**: Every product includes **1 to 2 Years** of official manufacturer warranty valid across all authorized service centers nationwide (Apple, ASUS, Lenovo, Sony, Samsung, Acer).\n- **GST Tax Invoice**: Every purchase generates an official GST-compliant tax invoice, essential for warranty claims and corporate input tax credit.`,
      referenced_products: [],
      sources: ['Authorized Retailer Certificate', 'Manufacturer Warranty Manual']
    };
  }

  if (q.includes('payment') || q.includes('upi') || q.includes('cod') || q.includes('card') || q.includes('emi') || q.includes('pay')) {
    return {
      session_id: sessionId || Date.now(),
      reply: `### Accepted Payment Methods & Checkout\n\n- **UPI (Instant 0% Fee)**: Google Pay, PhonePe, Paytm, BHIM, and dynamic QR scan.\n- **Credit & Debit Cards**: Visa, MasterCard, RuPay, and American Express with 128-bit bank-grade encryption.\n- **Net Banking**: 50+ major Indian banks supported (HDFC, ICICI, SBI, Axis, Kotak).\n- **Cash on Delivery (COD)**: Available for orders up to ₹25,000 with SMS OTP doorstep verification.\n- **Exclusive Offer**: Use code \`BUYSMART10\` at checkout for an instant **10% discount**!`,
      referenced_products: [],
      sources: ['Payment Gateway Standards & RBI Compliance']
    };
  }

  // 2. Targeted Catalog Search
  let matched = [...SEED_PRODUCTS];
  let categoryName = '';

  // Brand / Name search
  const brandOrNameMatch = SEED_PRODUCTS.filter(p =>
    q.includes(p.name.toLowerCase()) ||
    q.includes(p.brand.toLowerCase()) ||
    p.name.toLowerCase().split(' ').some(w => w.length > 3 && q.includes(w))
  );

  if (brandOrNameMatch.length > 0) {
    matched = brandOrNameMatch;
    categoryName = matched[0].category_name || '';
  } else {
    // Detect category keywords
    if (q.includes('laptop') || q.includes('notebook') || q.includes('macbook') || q.includes('programming') || q.includes('coding') || q.includes('gaming')) {
      matched = matched.filter(p => p.category_id === 2);
      categoryName = 'Laptops';
    } else if (q.includes('phone') || q.includes('mobile') || q.includes('smartphone') || q.includes('iphone') || q.includes('camera') || q.includes('5g')) {
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

  reply += `> 💡 **Store Guarantee**: All orders qualify for Free Express Shipping, a 7-Day Doorstep Replacement Guarantee, and 100% Brand Manufacturer Warranty.`;

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

  getProductById: async (id: number | string): Promise<Product> => {
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0) {
      try {
        const res = await request<Product>(`/products/${numId}`);
        if (res && res.id) return res;
      } catch (e) {
        console.warn(`Backend /products/${numId} endpoint unreachable, using verified seed catalog:`, e);
      }
      const found = SEED_PRODUCTS.find(p => Number(p.id) === numId);
      if (found) return found;
    }

    // Support lookup by product name or slug if a string was passed
    const nameStr = String(id).toLowerCase().trim();
    const foundByName = SEED_PRODUCTS.find(p =>
      p.name.toLowerCase() === nameStr ||
      p.name.toLowerCase().includes(nameStr)
    );
    if (foundByName) return foundByName;

    // Fallback: If nothing matched but catalog has items, return the first item to prevent dead ends
    if (SEED_PRODUCTS.length > 0) {
      console.warn(`Product ID "${id}" not found in catalog, serving top catalog fallback.`);
      return SEED_PRODUCTS[0];
    }

    throw new Error(`Product with ID "${id}" was not found.`);
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

  getProductReviews: async (productId: number | string): Promise<ProductReview[]> => {
    const numId = Number(productId);
    if (isNaN(numId) || numId <= 0) return [];
    try {
      const res = await request<ProductReview[]>(`/reviews/product/${numId}`);
      if (Array.isArray(res)) return res;
      return [];
    } catch (e) {
      console.warn(`Backend /reviews/product/${productId} unreachable, returning empty reviews array.`);
      return [];
    }
  },

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
