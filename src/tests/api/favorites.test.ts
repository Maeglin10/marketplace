import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock prisma
vi.mock('@/lib/db', () => {
  const prismaMock = {
    favorite: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    service: {
      findUnique: vi.fn(),
    },
  };
  return { default: prismaMock };
});

import prisma from '@/lib/db';
import { createToken } from '@/lib/auth';
import { GET, POST } from '@/app/api/favorites/route';

const mockPrisma = prisma as any;

function makeRequest(
  method: string,
  url: string,
  opts: { token?: string; body?: object } = {}
): NextRequest {
  const headers: Record<string, string> = {};
  if (opts.token) {
    headers['authorization'] = `Bearer ${opts.token}`;
  }
  const reqInit: RequestInit = { method, headers };
  if (opts.body) {
    reqInit.body = JSON.stringify(opts.body);
    (headers as any)['content-type'] = 'application/json';
  }
  return new NextRequest(new URL(url, 'http://localhost'), reqInit);
}

const validToken = createToken({ id: 'user-1', email: 'user@test.com', role: 'BUYER' });

describe('GET /api/favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 401 sans token d\'authentification', async () => {
    const req = makeRequest('GET', '/api/favorites');
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('retourne 200 avec un token valide et une liste de favoris', async () => {
    const fakeFavorites = [
      { id: 'fav-1', serviceId: 'svc-1', userId: 'user-1', service: { id: 'svc-1', title: 'Service 1' } },
    ];
    mockPrisma.favorite.findMany.mockResolvedValueOnce(fakeFavorites);

    const req = makeRequest('GET', '/api/favorites', { token: validToken });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(fakeFavorites);
    expect(mockPrisma.favorite.findMany).toHaveBeenCalledOnce();
    expect(mockPrisma.favorite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );
  });

  it('retourne 200 avec une liste vide si pas de favoris', async () => {
    mockPrisma.favorite.findMany.mockResolvedValueOnce([]);

    const req = makeRequest('GET', '/api/favorites', { token: validToken });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});

describe('POST /api/favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 401 sans token', async () => {
    const req = makeRequest('POST', '/api/favorites', { body: { serviceId: 'svc-1' } });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('retourne 400 si serviceId manquant', async () => {
    const req = makeRequest('POST', '/api/favorites', {
      token: validToken,
      body: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('retourne 404 si le service n\'existe pas', async () => {
    mockPrisma.service.findUnique.mockResolvedValueOnce(null);

    const req = makeRequest('POST', '/api/favorites', {
      token: validToken,
      body: { serviceId: 'svc-inexistant' },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('ajoute un favori (201) quand il n\'existe pas encore', async () => {
    const fakeService = { id: 'svc-1', title: 'Service test' };
    const fakeFavorite = { id: 'fav-new', userId: 'user-1', serviceId: 'svc-1' };

    mockPrisma.service.findUnique.mockResolvedValueOnce(fakeService);
    mockPrisma.favorite.findUnique.mockResolvedValueOnce(null); // pas encore en favori
    mockPrisma.favorite.create.mockResolvedValueOnce(fakeFavorite);

    const req = makeRequest('POST', '/api/favorites', {
      token: validToken,
      body: { serviceId: 'svc-1' },
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.favorited).toBe(true);
    expect(mockPrisma.favorite.create).toHaveBeenCalledOnce();
  });

  it('supprime un favori existant et retourne favorited: false', async () => {
    const fakeService = { id: 'svc-1', title: 'Service test' };
    const existingFavorite = { id: 'fav-existing', userId: 'user-1', serviceId: 'svc-1' };

    mockPrisma.service.findUnique.mockResolvedValueOnce(fakeService);
    mockPrisma.favorite.findUnique.mockResolvedValueOnce(existingFavorite); // déjà en favori
    mockPrisma.favorite.delete.mockResolvedValueOnce(existingFavorite);

    const req = makeRequest('POST', '/api/favorites', {
      token: validToken,
      body: { serviceId: 'svc-1' },
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.favorited).toBe(false);
    expect(mockPrisma.favorite.delete).toHaveBeenCalledOnce();
  });
});
