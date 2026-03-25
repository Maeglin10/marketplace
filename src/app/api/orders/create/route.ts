import { NextRequest } from 'next/server';
import { orderService } from '@/services/order.service';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      serviceId: z.string(),
      quantity: z.number().positive().int(),
    })
  ).min(1),
  sellerId: z.string(),
  paymentMethodId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as any
      );
    }

    const order = await orderService.createOrder(
      auth.id,
      validation.data.sellerId,
      validation.data.items
    );

    return successResponse(order, 'Order created', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create order', 400);
  }
}
