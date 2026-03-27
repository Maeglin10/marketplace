/**
 * Validation des variables d'environnement au démarrage.
 *
 * En production, toute variable requise manquante provoque une erreur fatale
 * qui empêche le serveur de démarrer. En développement, un avertissement est
 * affiché mais le serveur démarre quand même.
 *
 * Importer ce module (ou les variables exportées) plutôt que d'accéder
 * directement à process.env.X dans le code applicatif.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schéma de validation
// ---------------------------------------------------------------------------

const envSchema = z.object({
  // Base de données
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requise'),

  // Authentification
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET doit faire au moins 32 caractères pour être sûr'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY est requise'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET est requise'),

  // App URL (on accepte l'une ou l'autre des deux variables)
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL doit être une URL valide').optional(),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL doit être une URL valide').optional(),

  // UploadThing
  UPLOADTHING_TOKEN: z.string().min(1, 'UPLOADTHING_TOKEN est requise'),

  // Resend (email)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY est requise'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM est requise'),

  // Upstash Redis (optionnel — fallback in-memory si absent)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Sentry (optionnel)
  SENTRY_DSN: z.string().url().optional(),

  // Next.js / Node
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `  - ${field}: ${(messages ?? []).join(', ')}`)
      .join('\n');

    const message = `\n[env] Variables d'environnement invalides ou manquantes :\n${errorMessages}\n`;

    if (process.env.NODE_ENV === 'production') {
      // En production : erreur fatale — le serveur ne doit pas démarrer
      console.error(message);
      process.exit(1);
    } else {
      // En développement : avertissement, on utilise les valeurs disponibles
      console.warn(message);
    }
  }

  // Vérification supplémentaire : au moins une URL d'app doit être définie
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (!appUrl && process.env.NODE_ENV === 'production') {
    console.error(
      '[env] FATAL: NEXT_PUBLIC_APP_URL ou NEXTAUTH_URL doit être définie en production\n'
    );
    process.exit(1);
  }

  return parsed.data ?? ({} as z.infer<typeof envSchema>);
}

const env = validateEnv();

// ---------------------------------------------------------------------------
// Export des variables typées
// ---------------------------------------------------------------------------

export const DATABASE_URL = process.env.DATABASE_URL!;

export const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production-must-be-32chars';

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

/** URL publique de l'application (préférer NEXT_PUBLIC_APP_URL) */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000';

export const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN!;

export const RESEND_API_KEY = process.env.RESEND_API_KEY!;
export const EMAIL_FROM = process.env.EMAIL_FROM!;

export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const SENTRY_DSN = process.env.SENTRY_DSN;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

export default env;
