/**
 * Edge Runtime Compatible Middleware - No Node.js Dependencies
 * Uses only Web APIs supported by Edge Runtime
 */
import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/init-schema',
  '/_next',
  '/favicon.ico',
  '/static'
];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/tasks',
  '/parts',
  '/expenses',
  '/gallery',
  '/maintenance',
  '/settings',
  '/profile',
  '/api/auth/user',
  '/api/auth/logout'
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Simple token validation without database calls
 * This is a lightweight check - full validation happens in API routes
 */
function isValidToken(token: string): boolean {
  if (!token || token.length < 10) {
    return false;
  }
  
  // Basic format check - real validation happens server-side
  // Just check if it looks like a session token (hex string)
  return /^[a-f0-9]{32,}$/i.test(token);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }
  
  // Get auth token from cookie
  const token = request.cookies.get('auth-token')?.value;
  
  // Basic token validation (lightweight check only)
  const hasValidToken = token ? isValidToken(token) : false;
  
  // Handle root route
  if (pathname === '/') {
    if (hasValidToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Handle public routes
  if (isPublicRoute(pathname)) {
    // If user has token and trying to access login/register, redirect to dashboard
    if (hasValidToken && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!hasValidToken) {
      // Store the attempted URL to redirect back after login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // For pages, redirect to login
      return NextResponse.redirect(loginUrl);
    }
    
    // User has valid token format, allow access
    // Real authentication validation happens in API routes and components
    return NextResponse.next();
  }
  
  // For any other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};