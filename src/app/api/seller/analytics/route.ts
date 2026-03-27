import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const sellerId = auth.id;

    // Orders grouped by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { sellerId },
      _count: { id: true },
    });

    // Services count active vs inactive
    const [activeServices, inactiveServices] = await Promise.all([
      prisma.service.count({ where: { userId: sellerId, isActive: true } }),
      prisma.service.count({ where: { userId: sellerId, isActive: false } }),
    ]);

    // Average rating and review count
    const reviewStats = await prisma.review.aggregate({
      where: { revieweeId: sellerId },
      _avg: { rating: true },
      _count: { id: true },
    });

    // Top 3 services by order count
    const topServicesRaw = await prisma.orderItem.groupBy({
      by: ['serviceId'],
      where: {
        order: { sellerId },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 3,
    });

    const topServiceIds = topServicesRaw.map((s) => s.serviceId);
    const topServicesDetails = await prisma.service.findMany({
      where: { id: { in: topServiceIds } },
      select: { id: true, title: true, price: true, images: true },
    });

    const topServices = topServicesRaw.map((item) => ({
      service: topServicesDetails.find((s) => s.id === item.serviceId),
      orderCount: item._count.id,
    }));

    // Completion rate (COMPLETED / total excluding CANCELLED)
    const totalNonCancelled = ordersByStatus
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o._count.id, 0);
    const completedCount =
      ordersByStatus.find((o) => o.status === 'COMPLETED')?._count.id ?? 0;
    const completionRate =
      totalNonCancelled > 0
        ? Math.round((completedCount / totalNonCancelled) * 100)
        : 0;

    // Revenue per month over last 6 months using raw query
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueByMonthRaw = await prisma.$queryRaw<
      { month: string; revenue: number }[]
    >`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') AS month,
        SUM("sellerAmount") AS revenue
      FROM "Order"
      WHERE "sellerId" = ${sellerId}
        AND "status" = 'COMPLETED'
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Fill missing months with 0
    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const found = revenueByMonthRaw.find((r) => r.month === key);
      revenueByMonth.push({
        month: key,
        revenue: found ? Number(found.revenue) : 0,
      });
    }

    // Total revenue
    const totalRevenue = revenueByMonth.reduce((sum, m) => sum + m.revenue, 0);

    return successResponse({
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count.id,
      })),
      revenueByMonth,
      totalRevenue,
      services: {
        active: activeServices,
        inactive: inactiveServices,
      },
      reviews: {
        averageRating: reviewStats._avg.rating
          ? Math.round(reviewStats._avg.rating * 10) / 10
          : 0,
        count: reviewStats._count.id,
      },
      topServices,
      completionRate,
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch analytics', 500);
  }
}
