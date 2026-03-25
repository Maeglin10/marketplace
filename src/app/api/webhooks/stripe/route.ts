import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/response';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error);
      return errorResponse('Webhook signature verification failed', 400);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find and update order
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'PAID' },
          });

          // Update seller earnings
          const seller = await prisma.user.findUnique({
            where: { id: order.sellerId },
            include: { sellerProfile: true },
          });

          if (seller?.sellerProfile) {
            await prisma.sellerProfile.update({
              where: { userId: order.sellerId },
              data: {
                totalEarnings: seller.sellerProfile.totalEarnings + order.sellerAmount,
                totalOrders: seller.sellerProfile.totalOrders + 1,
              },
            });
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        // Handle refund
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: charge.payment_intent as string },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' },
          });
        }
        break;
      }

      case 'account.updated': {
        // Handle Stripe Connect account updates
        break;
      }
    }

    return successResponse({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return errorResponse(error.message || 'Webhook failed', 500);
  }
}
