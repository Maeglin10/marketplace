import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = Date.now();
  const version = process.env.npm_package_version ?? 'unknown';

  // Check database connectivity
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    // DB unreachable — return degraded status
  }

  if (!dbOk) {
    return NextResponse.json(
      { status: 'degraded', db: false, timestamp, version },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { status: 'ok', db: true, timestamp, version },
    { status: 200 }
  );
}
