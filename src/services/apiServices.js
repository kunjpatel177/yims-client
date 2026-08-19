import api from './api';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  export: (format) => api.get('/products/export', { params: { format }, responseType: 'blob' }),
};

export const rawMaterialAPI = {
  getAll: (params) => api.get('/raw-materials', { params }),
  getById: (id) => api.get(`/raw-materials/${id}`),
  create: (data) => api.post('/raw-materials', data),
  update: (id, data) => api.put(`/raw-materials/${id}`, data),
  delete: (id) => api.delete(`/raw-materials/${id}`),
  export: (format) => api.get('/raw-materials/export', { params: { format }, responseType: 'blob' }),
};

export const bomAPI = {
  getAll: (params) => api.get('/bom', { params }),
  getById: (id) => api.get(`/bom/${id}`),
  getByProduct: (productId) => api.get(`/bom/product/${productId}`),
  create: (data) => api.post('/bom', data),
  update: (id, data) => api.put(`/bom/${id}`, data),
  delete: (id) => api.delete(`/bom/${id}`),
  duplicate: (data) => api.post('/bom/duplicate', data),
};

export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const dashboardAPI = {
  getStats: (params) => api.get('/dashboard', { params }),
  search: (q) => api.get('/search', { params: { q } }),
  getPurchaseReport: (params) => api.get('/reports/purchase', { params }),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getInventoryReport: (params) => api.get('/reports/inventory', { params }),
  getLowStockReport: (params) => api.get('/reports/low-stock', { params }),
  getConsumptionReport: (params) => api.get('/reports/consumption', { params }),
  getManufacturingReport: (params) => api.get('/reports/manufacturing', { params }),
  getWarehouseStockReport: (params) => api.get('/reports/warehouse-stock', { params }),
  getWarehouseTransferReport: (params) => api.get('/reports/warehouse-transfers', { params }),
  getProductStockByWarehouseReport: (params) => api.get('/reports/product-stock-warehouse', { params }),
  getRawMaterialStockByWarehouseReport: (params) => api.get('/reports/raw-material-stock-warehouse', { params }),
};

export const warehouseAPI = {
  getAll: (params) => api.get('/warehouses', { params }),
  getActive: () => api.get('/warehouses/active'),
  getById: (id) => api.get(`/warehouses/${id}`),
  getInventory: (warehouseId, params) => api.get(`/warehouses/inventory/${warehouseId}`, { params }),
  exportInventory: (warehouseId, params) => api.get(`/warehouses/inventory/${warehouseId}/export`, { params, responseType: 'blob' }),
};

export const warehouseTransferAPI = {
  getAll: (params) => api.get('/warehouse-transfers', { params }),
  getById: (id) => api.get(`/warehouse-transfers/${id}`),
  create: (data) => api.post('/warehouse-transfers', data),
  updateStatus: (id, status) => api.patch(`/warehouse-transfers/${id}/status`, { status }),
  delete: (id) => api.delete(`/warehouse-transfers/${id}`),
  export: (params) => api.get('/warehouse-transfers/export', { params, responseType: 'blob' }),
};
