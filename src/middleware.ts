import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { AuthToken } from '@/types';

export const requireAuth = (request: NextRequest): AuthToken | null => {
  const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined);
  if (!token) return null;
  return verifyToken(token);
};

export const requireRole = (request: NextRequest, allowedRoles: string[]): AuthToken | null => {
  const auth = requireAuth(request);
  if (!auth || !allowedRoles.includes(auth.role)) return null;
  return auth;
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Pages : laissées au client (useAuth gère les redirections côté navigateur)
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Routes API publiques — pas besoin de token
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/services') ||
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/webhooks')
  ) {
    return NextResponse.next();
  }

  // Routes API protégées — token requis dans Authorization header
  const token = extractTokenFromHeader(request.headers.get('authorization') ?? undefined);
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const auth = verifyToken(token);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
