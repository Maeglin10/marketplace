import { describe, it, expect, vi, beforeEach } from 'vitest';

// On doit importer le module après avoir manipulé les timers si besoin.
// Le store est un singleton module-level, donc on réimporte à chaque suite via un import dynamique
// pour avoir un store propre. On utilise vi.resetModules().

describe('rateLimit — comportement du limiteur sliding window', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('première requête : autorisée, remaining = limit - 1', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = rateLimit('test-key-1', { limit: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('requêtes sous la limite : toutes autorisées', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const key = 'test-key-under-limit';
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, { limit: 5, windowMs: 60_000 });
      expect(result.allowed).toBe(true);
    }
  });

  it('requête dépassant la limite : bloquée (allowed = false, remaining = 0)', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const key = 'test-key-over-limit';
    // Consomme toute la capacité
    for (let i = 0; i < 3; i++) {
      rateLimit(key, { limit: 3, windowMs: 60_000 });
    }
    // La 4ème dépasse la limite
    const result = rateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('after the window expires, requests are allowed again', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const key = 'test-key-reset';
    // Sature la fenêtre
    for (let i = 0; i < 2; i++) {
      rateLimit(key, { limit: 2, windowMs: 1_000 });
    }
    // Vérifie que c'est bien bloqué
    expect(rateLimit(key, { limit: 2, windowMs: 1_000 }).allowed).toBe(false);

    // Avance le temps au-delà de la fenêtre
    vi.advanceTimersByTime(2_000);

    // Maintenant les requêtes doivent être à nouveau autorisées
    const result = rateLimit(key, { limit: 2, windowMs: 1_000 });
    expect(result.allowed).toBe(true);
  });

  it('resetAt est dans le futur quand bloqué', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const key = 'test-key-reset-at';
    for (let i = 0; i < 2; i++) {
      rateLimit(key, { limit: 2, windowMs: 60_000 });
    }
    const result = rateLimit(key, { limit: 2, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it('utilise les valeurs par défaut (limit=60, windowMs=60000) quand aucune option', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = rateLimit('default-opts-key');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });
});

describe('getClientIp', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('retourne la première IP du header x-forwarded-for', async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('retourne x-real-ip si x-forwarded-for est absent', async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.10.11.12' },
    });
    expect(getClientIp(req)).toBe('9.10.11.12');
  });

  it('retourne "unknown" si aucun header IP', async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });
});
