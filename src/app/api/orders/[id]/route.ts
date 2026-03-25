import { NextRequest } from 'next/server';
import { orderService } from '@/services/order.service';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';
import { updateOrderStatusSchema } from '@/lib/validation';

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
    const order = await orderService.getOrderById(id);
    if (!order) {
      return notFoundResponse();
    }

    // Verify authorization
    if (order.buyerId !== auth.id && order.sellerId !== auth.id) {
      return errorResponse('Unauthorized', 403);
    }

    return successResponse(order);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch order', 400);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const order = await orderService.getOrderById(id);
    if (!order) {
      return notFoundResponse();
    }

    if (order.sellerId !== auth.id) {
      return errorResponse('Only seller can update order status', 403);
    }

    const body = await request.json();
    const validation = updateOrderStatusSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as any
      );
    }

    const updated = await orderService.updateOrderStatus(id, validation.data.status);
    return successResponse(updated);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update order', 400);
  }
}
