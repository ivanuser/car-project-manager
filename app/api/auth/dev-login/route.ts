import { NextResponse } from "next/server"

// Route is completely disabled
export async function POST(request: Request) {
  // Dev login is completely disabled
  return NextResponse.json({ 
    error: "Dev login has been permanently disabled",
    message: "Please use your real Supabase account" 
  }, { status: 403 })
}
