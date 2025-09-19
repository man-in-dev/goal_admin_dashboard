import jwt from 'jsonwebtoken'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super-admin'
}

export function getServerSession(): AdminUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const token = localStorage.getItem('admin-token')
    const userData = localStorage.getItem('admin-user')

    if (!token || !userData) {
      return null
    }

    // Verify token is still valid
    const decoded = jwt.verify(token, 'goalsecrete@123@321') as any
    
    // Return user data from localStorage
    return JSON.parse(userData)
  } catch (error) {
    // Clear invalid data
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user')
    return null
  }
}

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; token?: string; user?: AdminUser; error?: string }> {
  try {
    // In a real application, you would validate against a database
    // For now, we'll use environment variables for demo purposes
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@goalinstitute.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (email === adminEmail && password === adminPassword) {
      const user: AdminUser = {
        id: '1',
        email: adminEmail,
        name: 'Admin User',
        role: 'admin'
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        'goalsecrete@123@321',
        { expiresIn: '24h' }
      )

      return { success: true, token, user }
    }

    return { success: false, error: 'Invalid credentials' }
  } catch (error) {
    return { success: false, error: 'Login failed' }
  }
}
