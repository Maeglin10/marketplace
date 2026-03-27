import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
} from '@/lib/response';
import { z } from 'zod';

const updateDisputeSchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
  resolution: z.string().min(5, 'Resolution must be at least 5 characters').optional(),
});

// GET /api/disputes/[id] — get dispute details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            buyerId: true,
            sellerId: true,
          },
        },
        openedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!dispute) {
      return notFoundResponse();
    }

    // Only the buyer, the seller of the related order, or an admin can view the dispute
    const isBuyer = dispute.openedById === auth.id;
    const isSeller = dispute.order.sellerId === auth.id;
    const isAdmin = auth.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return errorResponse('Unauthorized', 403);
    }

    return successResponse(dispute);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch dispute', 400);
  }
}

// PATCH /api/disputes/[id] — admin only: update status and/or resolution
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    if (auth.role !== 'ADMIN') {
      return errorResponse('Only admins can update dispute status', 403);
    }

    const { id } = await params;

    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return notFoundResponse();
    }

    const body = await request.json();
    const validation = updateDisputeSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors as any);
    }

    const { status, resolution } = validation.data;

    if (!status && !resolution) {
      return errorResponse('Provide at least status or resolution to update', 400);
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(resolution !== undefined && { resolution }),
      },
      include: {
        order: { select: { id: true, status: true, totalAmount: true } },
        openedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(updated, 'Dispute updated successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update dispute', 400);
  }
}
