import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { JWT_EXPIRY } from '@/config/constants';
import { AuthToken } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export const createToken = (payload: AuthToken): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
};

export const verifyToken = (token: string): AuthToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch (error) {
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
  const token = cookieString
    .split('; ')
    .find((row) => row.startsWith('auth-token='))
    ?.substring('auth-token='.length);
  return token || null;
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring('Bearer '.length);
};

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
