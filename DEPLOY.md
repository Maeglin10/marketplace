# Guide de déploiement Railway

État au 2026-04-09 — ce qu'il reste à faire avant d'être en ligne.

---

## 🔴 Obligatoire avant `railway up`

### 1. Variables d'environnement à renseigner dans Railway Dashboard

> Railway > Project > Variables

| Variable | Valeur / Comment trouver |
|---|---|
| `DATABASE_URL` | Auto-injecté par le plugin Postgres Railway |
| `JWT_SECRET` | Générer : `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com/apikeys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | dashboard.stripe.com/apikeys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Voir étape 2 ci-dessous |
| `NEXT_PUBLIC_APP_URL` | L'URL Railway assignée, ex. `https://xxx.railway.app` |
| `UPLOADTHING_TOKEN` | uploadthing.com → Create App → API Keys |
| `RESEND_API_KEY` | resend.com → API Keys |
| `EMAIL_FROM` | `Marketplace <noreply@ton-domaine.com>` (domaine vérifié dans Resend) |

### 2. Configurer le webhook Stripe

1. Déployer une première fois (`railway up`)
2. Dans Stripe Dashboard → Developers → Webhooks → Add endpoint
3. URL : `https://ton-app.railway.app/api/webhooks/stripe`
4. Événements à cocher : `payment_intent.succeeded`, `charge.refunded`
5. Copier le `whsec_...` dans `STRIPE_WEBHOOK_SECRET` sur Railway
6. Redéployer

### 3. Seeder les catégories en prod

Après le premier déploiement, les catégories de services seront vides.
Se connecter à la DB Railway et lancer :

```bash
railway run npx prisma db seed
```

---

## 🟡 Important (post-lancement)

### Tests à faire manuellement avant d'annoncer le site

- [ ] Inscription → connexion → déconnexion
- [ ] Créer un service (en tant que SELLER)
- [ ] Passer une commande + paiement Stripe (cartes test : `4242 4242 4242 4242`)
- [ ] Vérifier que le webhook reçoit `payment_intent.succeeded` et passe la commande en `PAID`
- [ ] Laisser une review sur la commande complétée
- [ ] Tester le chat vendeur/acheteur

### Upstash Redis (recommandé pour le rate limiting distribué)

Sans Upstash, le rate limiter bascule sur un fallback in-memory (non partagé entre instances).
Suffit pour une démo, mais à configurer si trafic réel.
- console.upstash.com → Redis → Create Database
- Ajouter `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`

---

## 🟢 Améliorations prévues (pas bloquant)

- [ ] **Upload images services** — UploadThing est intégré (`UPLOADTHING_TOKEN` requis), mais
      l'UI de création de service utilise des URLs texte. Câbler le composant d'upload.
- [ ] **Pagination** — `/api/services/search` et `/admin/stats` renvoient tout sans limite.
      Ajouter `?page=&limit=` côté API + UI.
- [ ] **Notifications temps réel** — SSE déjà en place dans l'API messages.
      Brancher les notifications (`/api/notifications/sse`) sur les nouvelles commandes.
- [ ] **Email transactionnel** — Resend est intégré mais aucun email n'est envoyé.
      Ajouter envoi sur : nouvelle commande, paiement reçu, nouveau message.

---

## Commandes de déploiement

```bash
# Premier déploiement
railway login
railway up

# Déploiements suivants (sur push git)
# Railway peut être configuré pour déployer automatiquement depuis main

# Logs en temps réel
railway logs

# Accès DB
railway connect postgres

# Lancer un script en prod
railway run npx prisma db seed
```

---

## Architecture déployée

```
Railway
├── web (Next.js 14 — Dockerfile)
│   ├── start.sh : prisma migrate deploy → npm start
│   └── Healthcheck : GET / toutes les 30s
└── postgres (PostgreSQL 15)
    └── Volume persistant db_data
```

Les migrations Prisma sont appliquées **automatiquement au démarrage** via `start.sh`.
Ne pas utiliser `db:push` en production (détruit les données).
