import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Separate axios instance for refresh - NO interceptors to avoid infinite loop
const refreshAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Access token in memory only
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Skip refresh for auth endpoints to avoid loop
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true
        originalRequest._retry = true
        
        try {
          // Use refreshAxios (no interceptor) to avoid infinite loop
          const response = await refreshAxios.post('/auth/refresh', {})
          const { accessToken: newAccessToken } = response.data
          
          setAccessToken(newAccessToken)
          onTokenRefreshed(newAccessToken)
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed - clear everything
          setAccessToken(null)
          localStorage.removeItem('user')
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
      
      // Queue this request
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(api(originalRequest))
        })
      })
    }
    
    return Promise.reject(error)
  }
)

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
  tenantName?: string
}

export interface User {
  id: string
  email: string
  name: string | null
  role: string
  tenantId: string
  tenant: {
    id: string
    name: string
    slug: string
  }
}

export const authApi = {
  login: (data: LoginInput) => api.post('/auth/login', data),
  register: (data: RegisterInput) => api.post('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post('/auth/logout', {}),
}

export default api
