import { NextResponse } from 'next/server';

// Simple GET handler to make this a valid route file 
// This will be used if the page.tsx file isn't rendered for some reason
export function GET() {
  return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
