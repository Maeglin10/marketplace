import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: auth.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: auth.id } }),
      prisma.notification.count({ where: { userId: auth.id, read: false } }),
    ]);

    return successResponse({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch notifications', 400);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    await prisma.notification.updateMany({
      where: { userId: auth.id, read: false },
      data: { read: true },
    });

    return successResponse({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update notifications', 400);
  }
}
