import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, setAccessToken, getAccessToken, User, LoginInput, RegisterInput } from '../services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    // First try to restore from localStorage (instant, no API)
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    
    // Then verify session with server - but only if we have a token
    if (getAccessToken()) {
      authApi.me()
        .then((res) => {
          if (isMounted) {
            setUser(res.data)
            localStorage.setItem('user', JSON.stringify(res.data))
          }
        })
        .catch(() => {
          if (isMounted) {
            setUser(null)
            localStorage.removeItem('user')
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })
    } else {
      // No token - user needs to login
      setIsLoading(false)
    }
    
    return () => {
      isMounted = false
    }
  }, [])

  const login = async (data: LoginInput) => {
    const response = await authApi.login(data)
    const { user: userData, accessToken } = response.data
    
    setAccessToken(accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const register = async (data: RegisterInput) => {
    const response = await authApi.register(data)
    const { user: userData, accessToken } = response.data
    
    setAccessToken(accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore
    } finally {
      setAccessToken(null)
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
