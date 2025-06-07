// This file has been deprecated in favor of PostgreSQL-based authentication
// Located at /app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'This endpoint has been deprecated. Please use /api/auth/login instead.',
    redirectTo: '/api/auth/login'
  }, { status: 410 });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint has been deprecated. Please use /api/auth/login instead.',
    redirectTo: '/api/auth/login'
  });
}