import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Create a simple dev authentication token
    const devUser = {
      id: 'dev-user-001',
      email: 'dev@cajpro.local',
      isAdmin: true
    }
    
    const response = NextResponse.json({
      success: true,
      user: devUser,
      message: 'Development login successful'
    })
    
    // Set a simple dev cookie
    response.cookies.set('cajpro_auth_token', 'dev-token-12345', {
      httpOnly: true,
      secure: false, // Allow HTTP in development
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error("Dev login error:", error)
    return NextResponse.json(
      { error: "Development login failed" },
      { status: 500 }
    )
  }
}

export async function POST() {
  return GET() // Same as GET for simplicity
}
