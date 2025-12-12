// API Configuration
// These would typically come from environment variables

export const API_CONFIG = {
  // Sales Agent Engine API (Knowledge Base)
  ENGINE_BASE_URL: import.meta.env.VITE_ENGINE_API_URL || 'http://localhost:8001',

  // --- BAGIAN INI YANG DIUBAH ---
  // WebSocket URL menggunakan Cloudflare Tunnel Anda
  // Kita ubah 'https://...' dari Cloudflare menjadi 'wss://...'
  WS_BASE_URL: 'wss://greg-car-driven-mechanism.trycloudflare.com/',
  // ------------------------------

  // Backend API (Products, Orders, Stock)
  BACKEND_BASE_URL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000',
  BACKEND_API_KEY: import.meta.env.VITE_BACKEND_API_KEY || '',

  // Company ID for multi-tenancy
  COMPANY_ID: import.meta.env.VITE_COMPANY_ID || '1',

  // Request timeouts
  TIMEOUT: 5000,
};

// API Endpoints
export const ENDPOINTS = {
  // Knowledge Base (Engine)
  knowledge: {
    products: '/api/knowledge/products',
    byExternalId: (productId: string, companyId: string) =>
      `/api/knowledge/by-external-id/${productId}?company_id=${companyId}`,
    faqs: '/api/knowledge/faqs',
    nodes: '/api/knowledge/nodes',
    documents: '/api/knowledge/documents',
  },

  // Document Management
  documents: {
    upload: '/api/documents/upload',
    list: '/api/documents',
    detail: (id: number) => `/api/documents/${id}`,
  },

  // Negotiations
  negotiations: {
    base: '/api/negotiations',
    detail: (id: number) => `/api/negotiations/${id}`,
  },

  // Templates
  templates: {
    base: '/api/templates',
  },

  // Backend API
  backend: {
    availability: (productId: string) => `/api/products/${productId}/availability`,
    bulkAvailability: '/api/products/availability/bulk',
    createOrder: '/api/orders/create',
  },
};