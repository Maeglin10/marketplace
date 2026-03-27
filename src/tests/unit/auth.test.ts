import { describe, it, expect } from 'vitest';
import { createToken, verifyToken, hashPassword, comparePasswords, extractTokenFromCookie, extractTokenFromHeader } from '@/lib/auth';

// Force dev environment so JWT_SECRET uses the fallback
process.env.NODE_ENV = 'test';

describe('auth — createToken / verifyToken', () => {
  it('createToken retourne un string JWT non vide', () => {
    const token = createToken({ id: 'user-123', email: 'test@example.com', role: 'BUYER' });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
    // Format JWT : 3 segments séparés par des points
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifyToken retourne le payload avec id et email', () => {
    const payload = { id: 'user-123', email: 'test@example.com', role: 'BUYER' as const };
    const token = createToken(payload);
    const result = verifyToken(token);

    expect(result).not.toBeNull();
    expect(result?.id).toBe('user-123');
    expect(result?.email).toBe('test@example.com');
    expect(result?.role).toBe('BUYER');
  });

  it('verifyToken retourne null pour un token invalide', () => {
    const result = verifyToken('invalid.token.here');
    expect(result).toBeNull();
  });

  it('verifyToken retourne null pour un token vide', () => {
    const result = verifyToken('');
    expect(result).toBeNull();
  });

  it('verifyToken retourne null pour un token malformé', () => {
    const result = verifyToken('not-a-jwt-at-all');
    expect(result).toBeNull();
  });
});

describe('auth — hashPassword / comparePasswords', () => {
  it('hashPassword retourne un hash différent du mot de passe original', async () => {
    const hash = await hashPassword('monMotDePasse123');
    expect(hash).not.toBe('monMotDePasse123');
    expect(hash.startsWith('$2')).toBe(true); // bcrypt hash prefix
  });

  it('comparePasswords retourne true pour le bon mot de passe', async () => {
    const hash = await hashPassword('monMotDePasse123');
    const match = await comparePasswords('monMotDePasse123', hash);
    expect(match).toBe(true);
  });

  it('comparePasswords retourne false pour un mauvais mot de passe', async () => {
    const hash = await hashPassword('monMotDePasse123');
    const match = await comparePasswords('mauvaisMotDePasse', hash);
    expect(match).toBe(false);
  });
});

describe('auth — extractTokenFromCookie', () => {
  it('extrait le token depuis un cookie auth-token', () => {
    const token = createToken({ id: 'u1', email: 'a@b.com', role: 'BUYER' });
    const cookieString = `auth-token=${token}; Path=/; HttpOnly`;
    expect(extractTokenFromCookie(cookieString)).toBe(token);
  });

  it('retourne null si le cookie auth-token est absent', () => {
    expect(extractTokenFromCookie('other=value; foo=bar')).toBeNull();
  });

  it('retourne null si la chaîne de cookie est undefined', () => {
    expect(extractTokenFromCookie(undefined)).toBeNull();
  });
});

describe('auth — extractTokenFromHeader', () => {
  it('extrait le token depuis un header Authorization Bearer', () => {
    const token = createToken({ id: 'u1', email: 'a@b.com', role: 'BUYER' });
    expect(extractTokenFromHeader(`Bearer ${token}`)).toBe(token);
  });

  it('retourne null si le header ne commence pas par Bearer', () => {
    expect(extractTokenFromHeader('Token abc123')).toBeNull();
  });

  it('retourne null si le header est undefined', () => {
    expect(extractTokenFromHeader(undefined)).toBeNull();
  });
});
