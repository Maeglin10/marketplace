#!/bin/bash

# Service Marketplace - Quick Start Script
# This script sets up and runs the development environment

set -e

echo "🚀 Service Marketplace - Quick Start"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}Step 1/6: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  npm install
  echo -e "${GREEN}✓ Dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Step 2: Setup environment
echo -e "${BLUE}Step 2/6: Setting up environment...${NC}"
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo -e "${YELLOW}⚠ .env.local created. Please update with your values:${NC}"
  echo "  - DATABASE_URL (PostgreSQL connection string)"
  echo "  - JWT_SECRET (any random string)"
  echo "  - Stripe keys (from stripe.com)"
  echo ""
  read -p "Press enter after configuring .env.local..."
else
  echo -e "${GREEN}✓ .env.local exists${NC}"
fi
echo ""

# Step 3: Generate Prisma client
echo -e "${BLUE}Step 3/6: Generating Prisma client...${NC}"
npm run db:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

# Step 4: Apply database schema
echo -e "${BLUE}Step 4/6: Applying database schema...${NC}"
npm run db:push
echo -e "${GREEN}✓ Database schema applied${NC}"
echo ""

# Step 5: Seed database
echo -e "${BLUE}Step 5/6: Seeding database with categories...${NC}"
npm run db:seed
echo -e "${GREEN}✓ Database seeded${NC}"
echo ""

# Step 6: Start development server
echo -e "${BLUE}Step 6/6: Starting development server...${NC}"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🌐 Service Marketplace is starting at http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "  - README.md         - Project overview"
echo "  - API.md            - API endpoints"
echo "  - SETUP.md          - Detailed setup guide"
echo "  - VERIFICATION_CHECKLIST.md - Pre-launch checklist"
echo ""

npm run dev
