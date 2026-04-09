#!/bin/sh
set -e

echo "[start] Running Prisma migrations..."
npx prisma migrate deploy

echo "[start] Starting Next.js server..."
exec npm start
