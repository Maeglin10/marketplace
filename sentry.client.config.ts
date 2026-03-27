import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Capture 10% of transactions in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Replay 1% of sessions in production, 100% on errors
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0,
  replaysOnErrorSampleRate: 1.0,

  // Only send events in production to avoid noise during development
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,

  integrations: [
    Sentry.replayIntegration(),
  ],
});
