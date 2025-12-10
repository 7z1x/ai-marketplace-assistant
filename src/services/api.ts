import { API_CONFIG, ENDPOINTS } from '@/config/api';
import type { 
  ApiResponse, 
  Product, 
  ProductAvailability, 
  KnowledgeNode,
  FAQ,
  Negotiation,
  Order,
  CreateOrderRequest
} from '@/types';

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {},
  useAuth = false
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (useAuth && API_CONFIG.BACKEND_API_KEY) {
      headers['Authorization'] = `Bearer ${API_CONFIG.BACKEND_API_KEY}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Request failed',
        data: null,
        error: data.error || [{ message: 'Unknown error' }],
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timeout',
        data: null,
        error: [{ message: 'Request timed out after 5 seconds' }],
      };
    }

    return {
      success: false,
      message: 'Network error',
      data: null,
      error: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
    };
  }
}

// Knowledge Base API (Engine)
export const knowledgeApi = {
  // Products
  async createProduct(product: Omit<Product, 'id'>): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.knowledge.products,
      {
        method: 'POST',
        body: JSON.stringify({
          company_id: parseInt(API_CONFIG.COMPANY_ID),
          product_id: product.external_id,
          name: product.name,
          content: product.content,
          metadata: product.metadata,
        }),
      }
    );
  },

  async getProductByExternalId(productId: string): Promise<ApiResponse<KnowledgeNode>> {
    return apiRequest<KnowledgeNode>(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.knowledge.byExternalId(productId, API_CONFIG.COMPANY_ID)
    );
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.knowledge.byExternalId(productId, API_CONFIG.COMPANY_ID),
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },

  async deleteProduct(productId: string): Promise<ApiResponse<null>> {
    return apiRequest<null>(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.knowledge.byExternalId(productId, API_CONFIG.COMPANY_ID),
      { method: 'DELETE' }
    );
  },

  // FAQs
  async createFAQ(question: string, answer: string): Promise<ApiResponse<FAQ>> {
    return apiRequest<FAQ>(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.knowledge.faqs,
      {
        method: 'POST',
        body: JSON.stringify({
          company_id: parseInt(API_CONFIG.COMPANY_ID),
          question,
          answer,
        }),
      }
    );
  },

  // Generic Nodes
  async getNodes(params: { label?: string; search?: string; limit?: number } = {}): Promise<ApiResponse<KnowledgeNode[]>> {
    const searchParams = new URLSearchParams({
      company_id: API_CONFIG.COMPANY_ID,
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ),
    });

    return apiRequest<KnowledgeNode[]>(
      API_CONFIG.ENGINE_BASE_URL,
      `${ENDPOINTS.knowledge.nodes}?${searchParams}`
    );
  },

  async createNode(node: { label: string; name: string; content: string }): Promise<ApiResponse<KnowledgeNode>> {
    return apiRequest<KnowledgeNode>(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.knowledge.nodes,
      {
        method: 'POST',
        body: JSON.stringify({
          company_id: parseInt(API_CONFIG.COMPANY_ID),
          ...node,
        }),
      }
    );
  },
};

// Backend API (Real-time data)
export const backendApi = {
  async getProductAvailability(productId: string): Promise<ApiResponse<ProductAvailability>> {
    return apiRequest<ProductAvailability>(
      API_CONFIG.BACKEND_BASE_URL,
      ENDPOINTS.backend.availability(productId),
      {},
      true
    );
  },

  async getBulkAvailability(productIds: string[]): Promise<ApiResponse<ProductAvailability[]>> {
    return apiRequest<ProductAvailability[]>(
      API_CONFIG.BACKEND_BASE_URL,
      ENDPOINTS.backend.bulkAvailability,
      {
        method: 'POST',
        body: JSON.stringify({ product_ids: productIds }),
      },
      true
    );
  },

  async createOrder(order: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiRequest<Order>(
      API_CONFIG.BACKEND_BASE_URL,
      ENDPOINTS.backend.createOrder,
      {
        method: 'POST',
        body: JSON.stringify(order),
      },
      true
    );
  },
};

// Negotiation API
export const negotiationApi = {
  async create(data: {
    user_id: number;
    product_node_id: number;
    proposed_price: number;
  }): Promise<ApiResponse<Negotiation>> {
    return apiRequest<Negotiation>(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.negotiations.base,
      {
        method: 'POST',
        body: JSON.stringify({
          company_id: API_CONFIG.COMPANY_ID,
          status: 'pending',
          ...data,
        }),
      }
    );
  },

  async list(params: { status?: string; user_id?: number } = {}): Promise<ApiResponse<Negotiation[]>> {
    const searchParams = new URLSearchParams({
      company_id: API_CONFIG.COMPANY_ID,
      ...Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ),
    });

    return apiRequest<Negotiation[]>(
      API_CONFIG.ENGINE_BASE_URL,
      `${ENDPOINTS.negotiations.base}?${searchParams}`
    );
  },

  async update(id: number, updates: Partial<Negotiation>): Promise<ApiResponse<Negotiation>> {
    return apiRequest<Negotiation>(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.negotiations.detail(id),
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },
};

// Document API
export const documentApi = {
  async upload(file: File): Promise<ApiResponse<{ document_id: number; filename: string; chunks_count: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', API_CONFIG.COMPANY_ID);

    try {
      const response = await fetch(
        `${API_CONFIG.ENGINE_BASE_URL}${ENDPOINTS.documents.upload}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Upload failed',
        data: null,
        error: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
      };
    }
  },

  async list(): Promise<ApiResponse<Array<{ id: number; filename: string; created_at: string }>>> {
    return apiRequest(
      API_CONFIG.ENGINE_BASE_URL,
      `${ENDPOINTS.documents.list}?company_id=${API_CONFIG.COMPANY_ID}`
    );
  },

  async getDetail(documentId: number): Promise<ApiResponse<{ id: number; filename: string; content: string; metadata: Record<string, unknown> }>> {
    return apiRequest(
      API_CONFIG.ENGINE_BASE_URL,
      ENDPOINTS.documents.detail(documentId)
    );
  },
};
