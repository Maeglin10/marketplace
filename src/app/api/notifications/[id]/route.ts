import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return notFoundResponse();
    }

    if (notification.userId !== auth.id) {
      return errorResponse('Unauthorized', 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return successResponse(updated);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update notification', 400);
  }
}
