const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('fm_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  demoLogin: (payload) => request('/auth/demo-login', { method: 'POST', body: JSON.stringify(payload) }),
  getDemoAccounts: () => request('/auth/demo-accounts'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  getFarmerProducts: () => request('/products/farmer/my-products'),
  getCategoriesAndLocations: () => request('/products/meta/categories-and-locations'),

  // Orders
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: () => request('/orders/my-orders'),
  getFarmerOrders: () => request('/orders/farmer-orders'),
  getOrderById: (id) => request(`/orders/${id}`),
  updateOrderStatus: (id, payload) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/products${query ? `?${query}` : ''}`);
  },
  moderateProduct: (id, payload) => request(`/admin/products/${id}/moderate`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getAdminUsers: () => request('/admin/users'),

  // Price trends
  getPriceTrends: () => request('/trends'),
};

