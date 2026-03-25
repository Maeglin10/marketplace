import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import prisma from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (!auth) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              ordersAsBuyer: true,
              ordersAsSeller: true,
              servicesCreated: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return successResponse({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch users', 400);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) return errorResponse('userId and role required', 400);
    if (!['USER', 'SELLER', 'ADMIN'].includes(role)) return errorResponse('Invalid role', 400);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return successResponse(updated);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update user', 400);
  }
}
