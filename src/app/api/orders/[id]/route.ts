import { NextRequest } from 'next/server';
import { orderService } from '@/services/order.service';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { updateOrderStatusSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/email';
import { OrderStatusUpdateEmail } from '@/emails/order-status-update';
import prisma from '@/lib/db';

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

    // Envoyer email de mise à jour au buyer pour les statuts importants
    const notifiableStatuses = ['PAID', 'IN_PROGRESS', 'COMPLETED'];
    if (notifiableStatuses.includes(validation.data.status)) {
      try {
        const buyer = await prisma.user.findUnique({
          where: { id: order.buyerId },
          select: { name: true, email: true },
        });

        if (buyer?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const statusLabels: Record<string, string> = {
            PAID: 'Paiement confirme',
            IN_PROGRESS: 'En cours de traitement',
            COMPLETED: 'Commande terminee',
          };

          await sendEmail({
            to: buyer.email,
            subject: `Commande #${id.slice(0, 8).toUpperCase()} — ${statusLabels[validation.data.status]}`,
            template: OrderStatusUpdateEmail,
            props: {
              recipientName: buyer.name || 'Client',
              orderId: id,
              status: validation.data.status,
              orderUrl: `${appUrl}/orders/${id}`,
            },
          });
        }
      } catch (emailError) {
        console.error('[email] Échec envoi mise à jour statut commande:', emailError);
      }
    }

    // Notification pour l'acheteur apres changement de statut
    const statusMessages: Record<string, string> = {
      PAID: 'Votre paiement a ete confirme.',
      IN_PROGRESS: 'Le vendeur a commence a traiter votre commande.',
      COMPLETED: 'Votre commande est terminee.',
      CANCELLED: 'Votre commande a ete annulee.',
    };
    const statusMessage = statusMessages[validation.data.status];
    if (statusMessage) {
      createNotification(
        order.buyerId,
        'ORDER_STATUS_UPDATE',
        `Commande #${id.slice(0, 8).toUpperCase()} mise a jour`,
        statusMessage,
        `/orders/${id}`
      );
    }

    return successResponse(updated);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update order', 400);
  }
}

// PATCH /api/orders/[id] — cancel an order
// - Buyer can cancel when status is PENDING
// - Seller can cancel when status is PAID or IN_PROGRESS
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
    const order = await orderService.getOrderById(id);
    if (!order) {
      return notFoundResponse();
    }

    const isBuyer = order.buyerId === auth.id;
    const isSeller = order.sellerId === auth.id;

    if (!isBuyer && !isSeller) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { status } = body;

    if (status !== 'CANCELLED') {
      return errorResponse('PATCH only supports cancellation (status: CANCELLED)', 400);
    }

    // Buyer can cancel only PENDING orders
    if (isBuyer && order.status !== 'PENDING') {
      return errorResponse('Buyers can only cancel orders that are PENDING', 400);
    }

    // Seller can cancel PAID or IN_PROGRESS orders
    if (isSeller && !['PAID', 'IN_PROGRESS'].includes(order.status)) {
      return errorResponse('Sellers can only cancel orders that are PAID or IN_PROGRESS', 400);
    }

    const updated = await orderService.updateOrderStatus(id, 'CANCELLED');
    return successResponse(updated, 'Order cancelled successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to cancel order', 400);
  }
}
