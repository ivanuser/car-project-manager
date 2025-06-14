import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/init-schema', '/api/fix-updated-at', '/fix-db', '/demo'];
const protectedRoutes = ['/dashboard', '/projects', '/tasks', '/parts', '/expenses', '/gallery', '/maintenance', '/settings', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Get token (basic check only)
  const token = request.cookies.get('auth-token')?.value;
  const hasToken = token && token.length > 10;
  
  // Root path - let everyone see the landing page, but redirect authenticated users to dashboard
  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Let unauthenticated users see the landing page (don't redirect)
    return NextResponse.next();
  }
  
  // Public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (hasToken && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // Protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasToken) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
