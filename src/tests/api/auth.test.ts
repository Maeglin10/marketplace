import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock prisma
vi.mock('@/lib/db', () => {
  const prismaMock = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
  return { default: prismaMock };
});

// Mock user service
vi.mock('@/services/user.service', () => ({
  userService: {
    login: vi.fn(),
  },
}));

// Mock rate-limit module - par défaut tout est autorisé
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({ allowed: true, remaining: 9, resetAt: Date.now() + 60_000 })),
  getClientIp: vi.fn(() => '127.0.0.1'),
}));

import { POST } from '@/app/api/auth/login/route';
import { userService } from '@/services/user.service';
import { rateLimit } from '@/lib/rate-limit';

const mockUserService = userService as any;
const mockRateLimit = rateLimit as any;

function makeLoginRequest(body: object): NextRequest {
  return new NextRequest(new URL('/api/auth/login', 'http://localhost'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Par défaut : rate limit autorisé
    mockRateLimit.mockReturnValue({ allowed: true, remaining: 9, resetAt: Date.now() + 60_000 });
  });

  it('retourne 422/400 si les credentials sont invalides (validation schema)', async () => {
    const req = makeLoginRequest({ email: 'pas-un-email', password: '123' });
    const res = await POST(req);
    // La validation Zod échoue → 400
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('retourne 401 si l\'utilisateur n\'existe pas', async () => {
    mockUserService.login.mockRejectedValueOnce(new Error('User not found'));

    const req = makeLoginRequest({ email: 'unknown@test.com', password: 'Password123!' });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('retourne 401 si le mot de passe est incorrect', async () => {
    mockUserService.login.mockRejectedValueOnce(new Error('Invalid password'));

    const req = makeLoginRequest({ email: 'user@test.com', password: 'WrongPassword123!' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('retourne 200 avec token et informations utilisateur pour des credentials valides', async () => {
    const fakeUser = {
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
      role: 'BUYER',
      password: 'hashed',
    };
    mockUserService.login.mockResolvedValueOnce(fakeUser);

    const req = makeLoginRequest({ email: 'user@test.com', password: 'ValidPassword123!' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('token');
    expect(body.data.user.email).toBe('user@test.com');
    expect(body.data.user.id).toBe('user-1');
    // Le mot de passe ne doit jamais être exposé
    expect(body.data.user).not.toHaveProperty('password');
  });

  it('set un cookie auth-token dans la réponse', async () => {
    const fakeUser = {
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
      role: 'BUYER',
      password: 'hashed',
    };
    mockUserService.login.mockResolvedValueOnce(fakeUser);

    const req = makeLoginRequest({ email: 'user@test.com', password: 'ValidPassword123!' });
    const res = await POST(req);

    const cookie = res.headers.get('set-cookie');
    expect(cookie).toContain('auth-token=');
    expect(cookie).toContain('HttpOnly');
  });

  it('retourne 429 quand le rate limit est dépassé', async () => {
    mockRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetAt: Date.now() + 60_000 });

    const req = makeLoginRequest({ email: 'user@test.com', password: 'Password123!' });
    const res = await POST(req);

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.success).toBe(false);
    // userService.login ne doit pas être appelé
    expect(mockUserService.login).not.toHaveBeenCalled();
  });
});
