import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request: NextRequest) {
  // Get the user ID from the cookie
  const userId = request.cookies.get('userId')?.value;

  // Check if this is an API route that requires authentication
  if (request.nextUrl.pathname.startsWith('/api/user/')) {
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/user/:path*',  // Protect all user-related API routes
  ],
} 