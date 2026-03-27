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

/** Supprime les balises HTML et normalise les espaces blancs */
function sanitizeText(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.replace(/[<>]/g, '').trim();
}

const openDisputeSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

// POST /api/disputes — open a dispute on an order
export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const raw = await request.json();
    // Sanitiser les champs texte libres avant validation
    const body = {
      ...raw,
      reason: sanitizeText(raw.reason),
      description: sanitizeText(raw.description),
    };
    const validation = openDisputeSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors as any);
    }

    const { orderId, reason, description } = validation.data;

    // Verify the order exists and the requester is the buyer
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { dispute: true },
    });

    if (!order) {
      return notFoundResponse();
    }

    if (order.buyerId !== auth.id) {
      return errorResponse('Only the buyer can open a dispute', 403);
    }

    // Disputes are only allowed for orders that are in progress or completed
    if (!['IN_PROGRESS', 'COMPLETED'].includes(order.status)) {
      return errorResponse(
        'A dispute can only be opened for orders that are IN_PROGRESS or COMPLETED',
        400
      );
    }

    // Prevent duplicate disputes
    if (order.dispute) {
      return errorResponse('A dispute already exists for this order', 409);
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId,
        openedById: auth.id,
        reason,
        description,
      },
      include: {
        order: { select: { id: true, status: true, totalAmount: true } },
        openedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(dispute, 'Dispute opened successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to open dispute', 400);
  }
}

// GET /api/disputes — list disputes for the current user
export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)));
    const skip = (page - 1) * limit;

    // Admins see all disputes; regular users only see their own
    const where = auth.role === 'ADMIN' ? {} : { openedById: auth.id };

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: { select: { id: true, status: true, totalAmount: true } },
          openedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.dispute.count({ where }),
    ]);

    return successResponse({
      disputes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch disputes', 400);
  }
}
