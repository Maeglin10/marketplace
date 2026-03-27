/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // HSTS uniquement en production
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ]
    : []),
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts : self + Next.js inline scripts (nonce serait idéal mais complexe avec App Router) + Stripe + UploadThing
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.uploadthing.com",
      // Styles : self + inline (Tailwind génère des styles inline)
      "style-src 'self' 'unsafe-inline'",
      // Images : self + data URIs + blob + CDN UploadThing + Stripe
      "img-src 'self' data: blob: https://utfs.io https://*.uploadthing.com https://stripe.com",
      // Fonts
      "font-src 'self' data:",
      // Connexions API : self + Stripe + Upstash
      "connect-src 'self' https://api.stripe.com https://*.upstash.io wss://*.upstash.io https://uploadthing.com https://*.uploadthing.com",
      // Frames : Stripe uniquement (pour Payment Element)
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      // Objects : aucun
      "object-src 'none'",
      // Base URI : self uniquement
      "base-uri 'self'",
      // Form actions : self uniquement
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // eslint-config-next 16.x has a known circular JSON issue with legacy .eslintrc format.
  // TypeScript type checking still runs; only the ESLint pass is skipped here.
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Appliquer les headers de sécurité sur toutes les routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

// Wrap with Sentry only when SENTRY_AUTH_TOKEN is present (production builds).
// In CI and local dev without the token the plain nextConfig is used, avoiding
// build failures when the Sentry token is not configured.
if (process.env.SENTRY_AUTH_TOKEN) {
  const { withSentryConfig } = require('@sentry/nextjs');

  module.exports = withSentryConfig(nextConfig, {
    // Sentry organisation and project slugs (set in CI/Vercel env vars)
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Auth token for uploading source maps (keep secret)
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Upload source maps during production builds only
    silent: true,

    // Automatically tree-shake Sentry logger statements
    disableLogger: true,

    // Automatically instrument server-side fetches
    automaticVercelMonitors: true,
  });
} else {
  module.exports = nextConfig;
}
