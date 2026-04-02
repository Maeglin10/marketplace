import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return successResponse({ favorited: false }, 'Not authenticated');
    }

    const { serviceId } = await params;

    const favorite = await prisma.favorite.findUnique({
      where: { userId_serviceId: { userId: auth.id, serviceId } },
    });

    return successResponse({ favorited: !!favorite }, 'Favorite status retrieved');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to check favorite', 500);
  }
}
