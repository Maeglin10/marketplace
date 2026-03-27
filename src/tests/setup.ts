import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js headers/cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: () => ({
    get: vi.fn(),
  }),
}));

// Suppress console.error in tests (can be re-enabled per test)
beforeEach(() => {
  vi.clearAllMocks();
});
