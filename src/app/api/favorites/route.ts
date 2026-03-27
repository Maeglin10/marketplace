import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: auth.id },
      include: {
        service: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                sellerProfile: true,
              },
            },
            category: true,
            reviews: {
              select: { rating: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(favorites, 'Favorites retrieved');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch favorites', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return errorResponse('serviceId is required', 400);
    }

    // Vérifier que le service existe
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return errorResponse('Service not found', 404);
    }

    // Toggle : si déjà en favori, retirer ; sinon ajouter
    const existing = await prisma.favorite.findUnique({
      where: { userId_serviceId: { userId: auth.id, serviceId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_serviceId: { userId: auth.id, serviceId } },
      });
      return successResponse({ favorited: false }, 'Removed from favorites');
    } else {
      const favorite = await prisma.favorite.create({
        data: { userId: auth.id, serviceId },
      });
      return successResponse({ favorited: true, favorite }, 'Added to favorites', 201);
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to toggle favorite', 500);
  }
}
