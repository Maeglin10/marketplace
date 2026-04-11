'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '€0',
    period: '/month',
    description: 'Get started and explore the marketplace',
    cta: 'Get Started',
    ctaHref: '/auth/register',
    highlight: false,
    features: [
      'List up to 3 services',
      '10% platform fee',
      'Basic analytics',
      'Standard support',
      'Public profile',
      'Messaging with buyers',
    ],
    missing: ['Advanced analytics', 'Priority listing', 'Featured badge', 'Reduced fee'],
  },
  {
    name: 'Pro',
    price: '€29',
    period: '/month',
    description: 'For freelancers who want to grow faster',
    cta: 'Start Free Trial',
    ctaHref: '/auth/register?plan=pro',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Unlimited service listings',
      '5% platform fee (save 50%)',
      'Advanced analytics dashboard',
      'Priority placement in search',
      'Featured badge on profile',
      'Priority support (24h SLA)',
      'Custom profile URL',
      'Bulk order discounts',
    ],
    missing: [],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For agencies and large teams',
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@marketplace.com',
    highlight: false,
    features: [
      'Everything in Pro',
      'Custom commission rate',
      'Dedicated account manager',
      'White-label option',
      'API access',
      'Team accounts',
      'SLA guarantee',
      'Custom integrations',
    ],
    missing: [],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free. Upgrade when you're ready to scale. No hidden fees.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col gap-6 ${
                plan.highlight
                  ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-105'
                  : 'border-border bg-card'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>

              <Link
                href={plan.ctaHref}
                className={`w-full text-center py-3 rounded-xl font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-8">
            {[
              {
                q: 'What is the platform fee?',
                a: 'Free accounts pay a 10% platform fee on each completed order. Pro accounts pay only 5%, helping you keep more of what you earn.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel your Pro subscription anytime from your account settings. You keep Pro benefits until the end of your billing period.',
              },
              {
                q: 'Is there a free trial for Pro?',
                a: 'Yes — new Pro subscribers get a 14-day free trial. No credit card required to start.',
              },
              {
                q: 'What payment methods are accepted?',
                a: 'We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. PayPal coming soon.',
              },
              {
                q: 'How do seller payouts work?',
                a: 'Earnings are transferred to your Stripe Connect account 7 days after order completion. Minimum payout: €10.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-border pb-8">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground mb-4">
            Questions? We're here to help.
          </p>
          <Link
            href="mailto:support@marketplace.com"
            className="text-primary hover:underline font-medium"
          >
            Contact support →
          </Link>
        </div>
      </div>
    </div>
  );
}
