import * as Sentry from '@sentry/nextjs';

type SentryLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'log';

interface ErrorContext {
  userId?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

/**
 * Capture an exception and send it to Sentry.
 * Falls back to console.error in development or if Sentry is not configured.
 */
export function captureException(error: unknown, context?: ErrorContext): void {
  if (process.env.NODE_ENV !== 'production' || !process.env.SENTRY_DSN) {
    console.error('[error]', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message and send it to Sentry.
 * Falls back to console.log in development or if Sentry is not configured.
 */
export function captureMessage(
  message: string,
  level: SentryLevel = 'info'
): void {
  if (process.env.NODE_ENV !== 'production' || !process.env.SENTRY_DSN) {
    console.log(`[${level}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}
