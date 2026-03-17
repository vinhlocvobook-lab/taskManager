import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, {
            refreshToken,
          })
          
          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch {
          // Refresh failed, logout
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
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

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
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
  login: (data: LoginInput) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterInput) => api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
}

export default api