import { cookies } from 'next/headers'
import jwtUtils from '@/lib/auth/jwt'

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return null
    }
    
    // Extract user ID from JWT token
    const userId = jwtUtils.getUserIdFromToken(token)
    return userId
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return null
    }
    
    // Verify and decode the JWT token
    const payload = jwtUtils.verifyToken(token)
    return payload
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
