import Stripe from 'stripe';
import { APP_CONFIG } from '@/config/app';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const stripeService = {
  async createPaymentIntent(amount: number, currency = APP_CONFIG.currency, metadata: Record<string, string> = {}) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });
    return paymentIntent;
  },

  async createPaymentIntentForOrder(order: {
    id: string;
    totalAmount: number;
    buyerId: string;
    sellerId: string;
  }) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: APP_CONFIG.currency,
      // automatic_payment_methods enables ALL payment methods configured in your Stripe dashboard:
      // Cards (Visa, Mastercard, Amex, CB), Apple Pay, Google Pay, Stripe Link,
      // SEPA Debit, iDEAL, Bancontact, Klarna, Afterpay/Clearpay, Sofort, and more.
      // Configure which ones to activate at: https://dashboard.stripe.com/settings/payment_methods
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: order.id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
      },
    });
    return paymentIntent;
  },

  async createConnectedAccount(email: string, country = 'US') {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      country,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    return account;
  },

  async createAccountLink(stripeAccountId: string, returnUrl: string) {
    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      type: 'account_onboarding',
      return_url: returnUrl,
      refresh_url: returnUrl,
    });
    return link;
  },

  async retrieveConnectedAccount(stripeAccountId: string) {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return account;
  },

  async createTransfer(amount: number, stripeAccountId: string, description = '') {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: APP_CONFIG.currency,
      destination: stripeAccountId,
      description,
    });
    return transfer;
  },

  async refundPayment(paymentIntentId: string) {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund;
  },
};
