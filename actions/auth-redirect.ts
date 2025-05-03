"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Simple server action to check cookies and redirect to dashboard
export async function redirectToDashboard() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  console.log("Auth redirect: Available cookies:", allCookies.map(c => c.name).join(', '))
  
  // Log cookie values for debugging
  for (const cookie of allCookies) {
    if (cookie.name.includes('token')) {
      console.log(`Auth cookie found: ${cookie.name} (length: ${cookie.value.length})`)
    }
  }
  
  // No redirection logic here, just return a success flag
  // This action is used just to validate cookies are being passed correctly
  return { success: true, cookieCount: allCookies.length }
}
