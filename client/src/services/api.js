import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor: attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexapos_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 unauthorized & refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('nexapos_refresh_token')

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          const newAccessToken = res.data?.data?.accessToken

          if (newAccessToken) {
            localStorage.setItem('nexapos_access_token', newAccessToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          }
        } catch (refreshErr) {
          localStorage.removeItem('nexapos_access_token')
          localStorage.removeItem('nexapos_refresh_token')
          localStorage.removeItem('nexapos_user')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
}

export const usersAPI = {
  list: () => api.get('/users'),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

export const categoriesAPI = {
  list: () => api.get('/categories'),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

export const brandsAPI = {
  list: () => api.get('/brands'),
  get: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`),
}

export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addVariant: (productId, data) => api.post(`/products/${productId}/variants`, data),
  updateVariant: (productId, variantId, data) => api.put(`/products/${productId}/variants/${variantId}`, data),
  deleteVariant: (productId, variantId) => api.delete(`/products/${productId}/variants/${variantId}`),
  addImage: (productId, data) => api.post(`/products/${productId}/images`, data),
  deleteImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
}

export const devicesAPI = {
  list: (params) => api.get('/devices', { params }),
  get: (id) => api.get(`/devices/${id}`),
  verify: (imei) => api.get(`/devices/verify/${imei}`),
  register: (data) => api.post('/devices', data),
  bulkRegister: (data) => api.post('/devices/bulk', data),
  updateStatus: (id, data) => api.patch(`/devices/${id}/status`, data),
}

export const inventoryAPI = {
  dashboard: () => api.get('/inventory/dashboard'),
  stock: (params) => api.get('/inventory/stock', { params }),
  adjust: (data) => api.post('/inventory/adjust', data),
  stockIn: (data) => api.post('/inventory/stock-in', data),
  stockOut: (data) => api.post('/inventory/stock-out', data),
  movements: (params) => api.get('/inventory/movements', { params }),
  threshold: (productId, data) => api.put(`/inventory/threshold/${productId}`, data),
  adjustments: (params) => api.get('/inventory/adjustments', { params }),
}

export const suppliersAPI = {
  list: (params) => api.get('/suppliers', { params }),
  get: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
}

export const purchasesAPI = {
  list: (params) => api.get('/purchases', { params }),
  get: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
  receive: (id, data) => api.post(`/purchases/${id}/receive`, data),
  recordPayment: (id, data) => api.post(`/purchases/${id}/payment`, data),
  cancel: (id) => api.patch(`/purchases/${id}/cancel`),
}

export const posAPI = {
  catalog: (params) => api.get('/pos/catalog', { params }),
  lookupIMEI: (imei) => api.get(`/pos/lookup-imei/${imei}`),
  customers: (params) => api.get('/pos/customers', { params }),
  quickCustomer: (data) => api.post('/pos/quick-customer', data),
  checkout: (data) => api.post('/pos/checkout', data),
  receipt: (idOrInvoice) => api.get(`/pos/receipt/${idOrInvoice}`),
  sales: (params) => api.get('/pos/sales', { params }),
}

export const customersAPI = {
  list: (params) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
}

export const warrantiesAPI = {
  list: (params) => api.get('/warranties', { params }),
  lookup: (query) => api.get('/warranties/lookup', { params: { query } }),
  get: (id) => api.get(`/warranties/${id}`),
  createClaim: (data) => api.post('/warranties/claim', data),
  reviewClaim: (id, data) => api.post(`/warranties/claim/${id}/review`, data),
  create: (data) => api.post('/warranties', data),
}

export const repairsAPI = {
  list: (params) => api.get('/repairs', { params }),
  get: (id) => api.get(`/repairs/${id}`),
  create: (data) => api.post('/repairs', data),
  updateStatus: (id, data) => api.put(`/repairs/${id}/status`, data),
  addPart: (id, data) => api.post(`/repairs/${id}/parts`, data),
  removePart: (partId) => api.delete(`/repairs/parts/${partId}`),
  complete: (id, data) => api.post(`/repairs/${id}/complete`, data),
  recordPayment: (id, data) => api.post(`/repairs/${id}/payment`, data),
  myAssigned: (params) => api.get('/repairs/technician/assigned', { params }),
}

export const healthAPI = {
  check: () => api.get('/health'),
}

export default api
