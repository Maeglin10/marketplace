'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { APP_CONFIG } from '@/config/app';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?payment=success`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || !elements || loading}
      >
        {loading
          ? 'Processing...'
          : `Pay ${APP_CONFIG.currencySymbol}${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const serviceId = searchParams.get('serviceId');
  const sellerId = searchParams.get('sellerId');
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!serviceId || !sellerId) {
      router.push('/services');
      return;
    }

    fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ serviceId, sellerId, quantity: 1 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setClientSecret(data.data.clientSecret);
          setOrderId(data.data.orderId);
          setAmount(data.data.amount);
        } else {
          setError(data.error || 'Could not initialize payment.');
        }
      })
      .catch(() => setError('Network error. Please try again.'))
      .finally(() => setLoading(false));
  }, [serviceId, sellerId, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 text-sm">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => router.push('/services')} variant="outline">
          Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Order summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Order total</span>
          <span className="text-2xl font-bold">
            {APP_CONFIG.currencySymbol}{amount.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Platform commission ({APP_CONFIG.commissionPercent}%) included
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <p className="text-xs text-gray-500">
            Secured by Stripe — supports cards, Apple Pay, Google Pay, Link, SEPA,
            iDEAL, Klarna, Afterpay & more.
          </p>
        </CardHeader>
        <CardContent>
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#000000',
                    colorBackground: '#ffffff',
                    borderRadius: '8px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  },
                },
              }}
            >
              <CheckoutForm orderId={orderId} amount={amount} />
            </Elements>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-gray-400">
        By completing your purchase, you agree to our Terms of Service.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading...</p>
          </div>
        }
      >
        <CheckoutPageInner />
      </Suspense>
    </main>
  );
}
