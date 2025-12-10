// Product types
export interface ProductMetadata {
  category: string;
  brand: string;
  sku?: string;
  tags?: string[];
  specifications?: Record<string, string>;
  [key: string]: unknown;
}

export interface Product {
  id: number;
  external_id: string;
  name: string;
  content: string;
  metadata: ProductMetadata;
  image?: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductAvailability {
  product_id: string;
  name: string;
  price: number;
  stock: number;
  is_available: boolean;
  currency: string;
  last_updated: string;
}

export interface ProductWithAvailability extends Product {
  availability?: ProductAvailability;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  productContext?: {
    product_id: string;
    name: string;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  created_at: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError[] | null;
}

export interface ApiError {
  message: string;
  details?: string | Record<string, string>;
}

// Knowledge Base types
export interface KnowledgeNode {
  id: number;
  external_id?: string;
  label: string;
  name: string;
  content: string;
  metadata?: Record<string, unknown>;
  company_id: number;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  company_id: number;
}

// Negotiation types
export interface Negotiation {
  id: number;
  company_id: string;
  user_id: number;
  product_node_id: number;
  proposed_price: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Order types
export interface OrderCustomer {
  name: string;
  phone: string;
  address?: string;
}

export interface CreateOrderRequest {
  product_id: string;
  quantity: number;
  customer: OrderCustomer;
  source: 'ai_agent';
  notes?: string;
}

export interface Order {
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  customer: OrderCustomer;
  payment_link?: string;
  payment_expired_at?: string;
  created_at: string;
}

// Category for filtering
export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}
