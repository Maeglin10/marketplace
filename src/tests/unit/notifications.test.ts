import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma AVANT l'import du module notifications
vi.mock('@/lib/db', () => {
  const prismaMock = {
    notification: {
      create: vi.fn(),
    },
  };
  return { default: prismaMock };
});

// Mock @prisma/client pour exporter NotificationType
vi.mock('@prisma/client', () => ({
  NotificationType: {
    ORDER_UPDATE: 'ORDER_UPDATE',
    MESSAGE: 'MESSAGE',
    REVIEW: 'REVIEW',
    PAYMENT: 'PAYMENT',
    SYSTEM: 'SYSTEM',
  },
}));

import { createNotification } from '@/lib/notifications';
import prisma from '@/lib/db';

const mockPrisma = prisma as any;

describe('createNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('appelle prisma.notification.create avec les bons paramètres', async () => {
    const fakeNotification = {
      id: 'notif-1',
      userId: 'user-abc',
      type: 'ORDER_UPDATE',
      title: 'Commande mise à jour',
      message: 'Votre commande est en cours',
      link: '/orders/1',
      read: false,
      createdAt: new Date(),
    };
    mockPrisma.notification.create.mockResolvedValueOnce(fakeNotification);

    const result = await createNotification(
      'user-abc',
      'ORDER_UPDATE' as any,
      'Commande mise à jour',
      'Votre commande est en cours',
      '/orders/1'
    );

    expect(mockPrisma.notification.create).toHaveBeenCalledOnce();
    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-abc',
        type: 'ORDER_UPDATE',
        title: 'Commande mise à jour',
        message: 'Votre commande est en cours',
        link: '/orders/1',
      },
    });
    expect(result).toEqual(fakeNotification);
  });

  it('appelle prisma.notification.create sans lien (link undefined)', async () => {
    const fakeNotification = { id: 'notif-2' };
    mockPrisma.notification.create.mockResolvedValueOnce(fakeNotification);

    await createNotification(
      'user-xyz',
      'MESSAGE' as any,
      'Nouveau message',
      'Vous avez reçu un message'
    );

    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-xyz',
        type: 'MESSAGE',
        title: 'Nouveau message',
        message: 'Vous avez reçu un message',
        link: undefined,
      },
    });
  });

  it('si Prisma throw, la fonction ne propage pas l\'erreur (silent fail) et retourne null', async () => {
    mockPrisma.notification.create.mockRejectedValueOnce(
      new Error('DB connection error')
    );

    // Ne doit pas throw
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await createNotification(
      'user-abc',
      'SYSTEM' as any,
      'Erreur test',
      'Message test'
    );

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to create notification:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('ne propage pas l\'erreur même si Prisma rejette avec une erreur réseau', async () => {
    mockPrisma.notification.create.mockRejectedValueOnce(
      new Error('Network timeout')
    );

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      createNotification('u', 'PAYMENT' as any, 't', 'm')
    ).resolves.toBeNull();
    consoleSpy.mockRestore();
  });
});
