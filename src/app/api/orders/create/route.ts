import { NextRequest } from 'next/server';
import { orderService } from '@/services/order.service';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import prisma from '@/lib/db';

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
  // Rate limit: max 20 order creations per minute per IP
  const ip = getClientIp(request);
  const rl = await rateLimit(`orders:create:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse('Too many requests, please try again later', 429);
  }

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

    // Envoyer email de confirmation — les erreurs email ne bloquent pas la réponse
    try {
      const buyer = await prisma.user.findUnique({
        where: { id: auth.id },
        select: { name: true, email: true },
      });

      if (buyer?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const items = order.items.map((item: any) => ({
          title: item.service?.title || 'Service',
          quantity: item.quantity,
          price: item.price,
        }));

        await sendEmail({
          to: buyer.email,
          subject: `Confirmation de commande #${order.id.slice(0, 8).toUpperCase()}`,
          template: OrderConfirmationEmail,
          props: {
            buyerName: buyer.name || 'Client',
            orderId: order.id,
            items,
            totalAmount: order.totalAmount,
            orderUrl: `${appUrl}/orders/${order.id}`,
          },
        });
      }
    } catch (emailError) {
      console.error('[email] Échec envoi confirmation commande:', emailError);
    }

    // Notification pour le vendeur
    createNotification(
      validation.data.sellerId,
      'ORDER_PLACED',
      'Nouvelle commande',
      `Vous avez recu une nouvelle commande #${order.id.slice(0, 8).toUpperCase()}`,
      `/orders/${order.id}`
    );

    return successResponse(order, 'Order created', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create order', 400);
  }
}
