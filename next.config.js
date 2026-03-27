/** @type {import('next').NextConfig} */
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
