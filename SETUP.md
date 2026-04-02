# Environment Setup Guide

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Docker & Docker Compose (optional)

### Quick Start with Docker

1. Start database:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Push schema to database:
```bash
npm run db:push
```

5. Seed initial data:
```bash
npm run db:seed
```

6. Create `.env.local`:
```bash
DATABASE_URL="postgresql://marketplace:dev-password@localhost:5432/marketplace"
NEXTAUTH_URL="http://localhost:3000"

STRIPE_SECRET_KEY="sk_test_your_test_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_test_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_test_key"

JWT_SECRET="dev-jwt-secret-key-change-in-production"
```

7. Start development server:
```bash
npm run dev
```

8. Open http://localhost:3000

---

## Without Docker

1. Set up PostgreSQL:
```bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb marketplace
createuser -P marketplace
psql marketplace -c "GRANT ALL PRIVILEGES ON DATABASE marketplace TO marketplace;"
```

2. Update `.env.local` DATABASE_URL

3. Follow steps 2-8 from Docker guide above

---

## Environment Variables

### Core
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev)

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret API key (get from stripe.com)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (from Stripe dashboard)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Same as STRIPE_PUBLISHABLE_KEY

---

## Database Setup

### Initialize Database
```bash
npm run db:push
npm run db:seed
```

### View Database
```bash
npm run db:studio
```

### Reset Database (⚠️ Destructive)
```bash
npm run db:push -- --force-reset
npm run db:seed
```

---

## Stripe Setup

1. Create Stripe account at https://stripe.com

2. Go to Developers → API Keys

3. Copy Secret Key and Publishable Key

4. Create a webhook endpoint:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `charge.refunded`, `account.updated`
   - Copy Signing Secret

5. Add keys to `.env.local`

---

## Production Deployment

### Environment Variables
Use the same `.env.local` structure but with production values:

```bash
# Use strong random strings
JWT_SECRET=$(openssl rand -base64 32)

# Production URLs
NEXTAUTH_URL=https://yourdomain.com

# Stripe production keys (replace test keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production database
DATABASE_URL=postgresql://user:password@prod-db-host:5432/marketplace
```

### Vercel Deployment

1. Push code to GitHub

2. Create project on Vercel

3. Set environment variables in Vercel dashboard

4. Deploy:
```bash
vercel deploy --prod
```

### Docker Deployment

1. Build image:
```bash
docker build -t marketplace:latest .
```

2. Run container:
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e STRIPE_SECRET_KEY="sk_live_..." \
  --name marketplace \
  marketplace:latest
```

### Manual Server Deployment

1. SSH into server

2. Clone repository:
```bash
git clone <repo-url>
cd marketplace
```

3. Install Node and dependencies:
```bash
npm install
npm run build
```

4. Set up environment variables:
```bash
sudo nano /etc/marketplace/.env.production
```

5. Set up systemd service:
```bash
sudo nano /etc/systemd/system/marketplace.service
```

Add:
```
[Unit]
Description=Service Marketplace
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/app/marketplace
ExecStart=npm start
Restart=on-failure
Environment="NODE_ENV=production"
EnvironmentFile=/etc/marketplace/.env.production

[Install]
WantedBy=multi-user.target
```

6. Start service:
```bash
sudo systemctl enable marketplace
sudo systemctl start marketplace
```

### Nginx Configuration

```nginx
upstream marketplace {
  server localhost:3000;
}

server {
  listen 80;
  server_name yourdomain.com;
  
  # Redirect to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;
  
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
  
  location / {
    proxy_pass http://marketplace;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## Database Backups

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/marketplace"
DB_NAME="marketplace"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump $DB_NAME | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh
```

---

## Monitoring

### Logs
```bash
# View application logs
pm2 logs marketplace

# Or with systemd
journalctl -u marketplace -f
```

### Health Checks
```bash
# Simple health endpoint
curl http://localhost:3000/api/health

# Database connection
npm run db:studio
```

### Performance
- Use New Relic or Datadog for monitoring
- Set up error tracking with Sentry
- Monitor database with pgAdmin or similar

---

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure credentials are correct
- Check network/firewall rules

### Stripe Webhook Issues
- Verify webhook URL is accessible
- Check signing secret is correct
- Review webhook logs in Stripe dashboard
- Test webhook with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

### Build Failures
- Clear .next directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Reset Prisma: `npm run db:generate`

### Memory Issues
- Increase Node heap: `NODE_OPTIONS=--max-old-space-size=2048 npm start`
- Use PM2 for process management
- Monitor with `ps aux` or `top`
