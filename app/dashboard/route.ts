import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Handle POST requests to dashboard - used for redirects from login
export async function POST(request: Request) {
  const formData = await request.formData();
  const timestamp = formData.get("timestamp");
  const email = formData.get("email");

  console.log(`Dashboard POST route called: timestamp=${timestamp}, email=${email}`);
  
  // Get all cookies to log
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  console.log("Cookies in dashboard POST:", allCookies.map(c => c.name).join(', '));
  
  // Return response that redirects to dashboard GET route
  return NextResponse.redirect(new URL("/dashboard", request.url), {
    // Keep status 303 (See Other) for POST -> GET redirect
    status: 303, 
  });
}
