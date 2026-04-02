'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Suspense } from 'react';

function OnboardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [error, setError] = useState('');

  const returnedFromStripe = searchParams.get('stripe_account');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setProfile(data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeSeller = async () => {
    setOnboarding(true);
    setError('');
    try {
      const res = await fetch('/api/seller/onboard', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.onboardingUrl;
      } else {
        setError(data.error || 'Failed to start onboarding');
      }
    } finally {
      setOnboarding(false);
    }
  };

  const handleResumeOnboarding = async () => {
    setOnboarding(true);
    setError('');
    try {
      const res = await fetch('/api/seller/onboard', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.onboardingUrl;
      } else {
        setError(data.error || 'Failed to resume onboarding');
      }
    } finally {
      setOnboarding(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSeller = profile?.role === 'SELLER';
  const hasStripeAccount = !!profile?.stripeAccountId;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Seller Settings</h1>

      {returnedFromStripe && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Welcome back! Your Stripe account setup is in progress. It may take a few minutes to verify.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!isSeller ? (
        <Card>
          <CardHeader>
            <CardTitle>Become a Seller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Join our marketplace as a seller and start earning by offering your services.
            </p>

            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Create and list your services
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Receive secure payments via Stripe
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Manage orders and communicate with buyers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Get paid directly to your bank account
              </li>
            </ul>

            <div className="p-4 bg-gray-50 rounded-lg border text-xs text-gray-500">
              You will be redirected to Stripe to complete identity verification and connect your
              bank account. This is required to receive payments.
            </div>

            <Button
              onClick={handleBecomeSeller}
              disabled={onboarding}
              className="w-full"
              size="lg"
            >
              {onboarding ? 'Redirecting to Stripe...' : 'Start Seller Setup'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seller Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-medium">Active Seller Account</span>
              </div>

              {profile?.sellerProfile && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
                  <div>
                    <p className="text-2xl font-bold">{profile.sellerProfile.totalOrders}</p>
                    <p className="text-xs text-gray-500 mt-1">Orders Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${profile.sellerProfile.totalEarnings.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Total Earned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {profile.sellerProfile.averageRating.toFixed(1)}★
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Avg Rating</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stripe Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasStripeAccount ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    <span>Stripe account connected</span>
                    <span className="text-gray-400 font-mono text-xs ml-2">
                      {profile.stripeAccountId}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleResumeOnboarding}
                    disabled={onboarding}
                    size="sm"
                  >
                    {onboarding ? 'Loading...' : 'Update Stripe Settings'}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Connect your Stripe account to receive payments.
                  </p>
                  <Button
                    onClick={handleBecomeSeller}
                    disabled={onboarding}
                    size="sm"
                  >
                    {onboarding ? 'Redirecting...' : 'Connect Stripe Account'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function SellerOnboardPage() {
  return (
    <main>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <OnboardPageInner />
      </Suspense>
    </main>
  );
}
