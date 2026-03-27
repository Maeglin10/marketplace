/**
 * Middleware Next.js
 *
 * Responsabilités :
 * 1. Protection CSRF — validation Origin/Referer sur les requêtes mutantes vers /api/*
 *    (désactivé en développement, exclu pour /api/webhooks/*)
 * 2. Authentification JWT — vérification du Bearer token sur les routes API protégées
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { AuthToken } from '@/types';

// ---------------------------------------------------------------------------
// Helpers d'authentification (ré-exportés pour usage dans les routes si besoin)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Protection CSRF
// ---------------------------------------------------------------------------

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'
  );
}

function extractOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function csrfCheck(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Uniquement pour les routes API avec méthodes mutantes
  if (!pathname.startsWith('/api/') || !MUTATING_METHODS.has(request.method)) {
    return null;
  }

  // Désactivé hors production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // Exclure les webhooks (Stripe signe ses requêtes avec un secret HMAC)
  if (pathname.startsWith('/api/webhooks/')) {
    return null;
  }

  const appOrigin = getAppOrigin();

  // Vérifier Origin en priorité
  const originHeader = request.headers.get('origin');
  if (originHeader) {
    if (originHeader === appOrigin) return null; // OK
    return NextResponse.json(
      { success: false, error: 'Forbidden: Origin header does not match the application domain' },
      { status: 403 }
    );
  }

  // Fallback : Referer
  const refererHeader = request.headers.get('referer');
  if (refererHeader) {
    const refererOrigin = extractOrigin(refererHeader);
    if (refererOrigin === appOrigin) return null; // OK
    return NextResponse.json(
      { success: false, error: 'Forbidden: Referer header does not match the application domain' },
      { status: 403 }
    );
  }

  // Ni Origin ni Referer — bloquer en production
  return NextResponse.json(
    { success: false, error: 'Forbidden: Missing Origin or Referer header' },
    { status: 403 }
  );
}

// ---------------------------------------------------------------------------
// Middleware principal
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Vérification CSRF (uniquement routes API mutantes en production)
  const csrfResponse = csrfCheck(request);
  if (csrfResponse) return csrfResponse;

  // 2. Pages : laissées au client (useAuth gère les redirections côté navigateur)
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 3. Routes API publiques — pas besoin de token
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/services') ||
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/webhooks')
  ) {
    return NextResponse.next();
  }

  // 4. Routes API protégées — token requis dans Authorization header
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
