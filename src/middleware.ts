import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { AuthToken } from '@/types';

export const requireAuth = (request: NextRequest): AuthToken | null => {
  const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined);
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
};

export const requireRole = (request: NextRequest, allowedRoles: string[]): AuthToken | null => {
  const auth = requireAuth(request);
  
  if (!auth || !allowedRoles.includes(auth.role)) {
    return null;
  }

  return auth;
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes
  if (pathname.startsWith('/auth') || pathname === '/') {
    return NextResponse.next();
  }

  // Protected routes - check auth
  const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined);
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const auth = verifyToken(token);
  if (!auth) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

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
