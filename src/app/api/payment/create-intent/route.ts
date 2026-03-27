import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { orderService } from '@/services/order.service';
import { stripeService } from '@/services/stripe.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({
  serviceId: z.string(),
  sellerId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(request: NextRequest) {
  // Rate limit: max 10 payment intent creations per minute per IP
  const ip = getClientIp(request);
  const rl = await rateLimit(`payment:create-intent:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse('Too many requests, please try again later', 429);
  }

  try {
    const auth = requireAuth(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) return errorResponse('Invalid data', 400);

    const { serviceId, sellerId, quantity } = validation.data;

    // Prevent buying own service
    if (auth.id === sellerId) {
      return errorResponse('You cannot purchase your own service', 400);
    }

    // Create order (PENDING)
    const order = await orderService.createOrder(auth.id, sellerId, [
      { serviceId, quantity },
    ]);

    // Create PaymentIntent with automatic payment methods enabled
    const paymentIntent = await stripeService.createPaymentIntentForOrder({
      id: order.id,
      totalAmount: order.totalAmount,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
    });

    // Attach paymentIntentId to order
    await orderService.markOrderWithIntent(order.id, paymentIntent.id);

    return successResponse({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      amount: order.totalAmount,
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create payment intent', 400);
  }
}
