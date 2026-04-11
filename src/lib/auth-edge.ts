import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { AuthToken } from '@/types';

function getSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV === 'production'
      ? undefined
      : 'dev-secret-key-change-in-production');
  if (!secret) throw new Error('JWT_SECRET is required in production');
  return new TextEncoder().encode(secret);
}

export async function verifyToken(token: string): Promise<AuthToken | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AuthToken;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring('Bearer '.length);
}

export async function requireAuth(request: NextRequest): Promise<AuthToken | null> {
  const token = extractTokenFromHeader(
    request.headers.get('authorization') ?? undefined,
  );
  if (!token) return null;
  return verifyToken(token);
}
