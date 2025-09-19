"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { AdminUser } from '@/lib/auth'

interface AuthContextType {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('admin-token')
    const userData = localStorage.getItem('admin-user')
    
    if (token && userData) {
      try {
        // Use stored user data from localStorage
        const user = JSON.parse(userData)
        setUser(user)
      } catch (error) {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('Auth provider: Starting login process')
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'
      console.log('Auth provider: API URL:', API_BASE_URL)
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Auth provider: Response status:', response.status)
      const data = await response.json()
      console.log('Auth provider: Response data:', data)

      if (data.success && data.token) {
        console.log('Auth provider: Login successful, storing token')
        // Store in localStorage only
        localStorage.setItem('admin-token', data.token)
        localStorage.setItem('admin-user', JSON.stringify(data.user))
        
        setUser(data.user)
        console.log('Auth provider: User set:', data.user)
        return { success: true }
      } else {
        console.log('Auth provider: Login failed:', data.message)
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Auth provider: Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
