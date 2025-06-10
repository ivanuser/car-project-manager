// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const next = searchParams.get("next") || "/dashboard"

    console.log("[Auth Callback] Processing auth callback")

    // Since we're not using OAuth flows that require callbacks, 
    // this route is primarily for legacy compatibility
    
    // Just redirect to the requested destination or dashboard
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error("[Auth Callback] Unexpected error:", error)
    return NextResponse.redirect(new URL("/login?error=Authentication+error", request.url))
  }
}
