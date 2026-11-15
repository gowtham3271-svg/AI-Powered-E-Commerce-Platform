export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock_quantity: number;
  specifications?: Record<string, any>;
  image_url?: string;
  created_at: string;
  average_rating: number;
  review_count: number;
}

export interface ProductReview {
  id: number;
  user_id: number;
  user_name: string;
  product_id: number;
  rating: number;
  review_text?: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_amount: number;
  item_count: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  order_status: string;
  created_at: string;
  items: OrderItem[];
}

export interface ReferencedProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  specifications?: Record<string, any>;
  reason?: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  message: string;
  created_at?: string;
  referenced_products?: ReferencedProduct[];
  sources?: string[];
}

export interface ChatSession {
  id: number;
  user_id?: number;
  created_at: string;
  messages: ChatMessage[];
}

export interface ChatAskResponse {
  session_id: number;
  reply: string;
  referenced_products: ReferencedProduct[];
  sources: string[];
  detected_budget?: number;
  detected_category?: string;
}

export interface ProductComparison {
  products: Product[];
  common_specs: string[];
  differences: Record<string, Record<string, any>>;
  recommendation_summary?: string;
}

export interface AdminStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  low_stock_products: number;
  out_of_stock_products: number;
  vector_chunks_indexed: number;
}
