import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { JWT_EXPIRY } from '@/config/constants';
import { AuthToken } from '@/types';

function getSecret(): string {
  const secret =
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-key-change-in-production');
  if (!secret) throw new Error('JWT_SECRET is required in production');
  return secret;
}

export const createToken = (payload: AuthToken): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRY });
};

export const verifyToken = (token: string): AuthToken | null => {
  try {
    return jwt.verify(token, getSecret()) as AuthToken;
  } catch {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const extractTokenFromCookie = (cookieString?: string): string | null => {
  if (!cookieString) return null;
  return (
    cookieString
      .split('; ')
      .find((row) => row.startsWith('auth-token='))
      ?.substring('auth-token='.length) ?? null
  );
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring('Bearer '.length);
};

export const requireAuth = (request: NextRequest): AuthToken | null => {
  const headerToken = extractTokenFromHeader(request.headers.get('authorization') ?? undefined);
  const cookieToken = extractTokenFromCookie(request.headers.get('cookie') ?? undefined);
  const token = headerToken || cookieToken;
  if (!token) return null;
  return verifyToken(token);
};

export const requireRole = (request: NextRequest, allowedRoles: string[]): AuthToken | null => {
  const auth = requireAuth(request);
  if (!auth || !allowedRoles.includes(auth.role)) return null;
  return auth;
};
