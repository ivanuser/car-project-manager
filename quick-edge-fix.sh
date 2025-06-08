#!/bin/bash

echo "⚡ Quick Fix for Edge Runtime Crypto Error"
echo "========================================"

# Backup current middleware
cp middleware.ts middleware.ts.backup

# Replace with minimal Edge Runtime compatible middleware
cat > middleware.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/init-schema'];
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
  
  // Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasToken ? '/dashboard' : '/login', request.url));
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
EOF

echo "✅ Replaced middleware with Edge Runtime compatible version"

# Clear build cache
rm -rf .next
echo "✅ Cleared build cache"

# Test build
echo ""
echo "🏗️ Testing build..."
if npm run build; then
    echo ""
    echo "🎉 SUCCESS! Edge Runtime error fixed!"
    echo ""
    echo "✅ Quick fix applied:"
    echo "   • Middleware no longer uses Node.js crypto modules"
    echo "   • Simple token format checking only"
    echo "   • Full auth validation happens in components/API routes"
    echo ""
    echo "🚀 Ready to run: npm run dev"
else
    echo ""
    echo "❌ Build still failing. Try the comprehensive fix:"
    echo "   ./fix-edge-runtime-error.sh"
fi

echo ""
echo "💾 Backup created: middleware.ts.backup"
echo ""
