import prisma from '@/lib/db';
import { COMMISSION_PERCENTAGE } from '@/config/constants';
import { OrderStatus } from '@prisma/client';

export const orderService = {
  async createOrder(buyerId: string, sellerId: string, items: any[]) {
    // Fetch services to calculate total
    const serviceIds = items.map((item) => item.serviceId);
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    const serviceMap = new Map(services.map((s) => [s.id, s]));

    let totalAmount = 0;
    for (const item of items) {
      const service = serviceMap.get(item.serviceId);
      if (!service) {
        throw new Error(`Service ${item.serviceId} not found`);
      }
      totalAmount += service.price * item.quantity;
    }

    const commissionAmount = totalAmount * COMMISSION_PERCENTAGE;
    const sellerAmount = totalAmount - commissionAmount;

    const order = await prisma.order.create({
      data: {
        buyerId,
        sellerId,
        totalAmount,
        commissionAmount,
        sellerAmount,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            price: serviceMap.get(item.serviceId)!.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    return order;
  },

  async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: { id: true, name: true, email: true },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            service: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });
  },

  async getOrdersByBuyer(buyerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { buyerId },
        skip,
        take: limit,
        include: {
          seller: { select: { id: true, name: true } },
          items: { include: { service: { select: { title: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { buyerId } }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getOrdersBySeller(sellerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { sellerId },
        skip,
        take: limit,
        include: {
          buyer: { select: { id: true, name: true } },
          items: { include: { service: { select: { title: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { sellerId } }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
      },
    });

    return order;
  },

  async markOrderAsPaid(orderId: string, paymentIntentId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentIntentId,
      },
    });
  },

  async markOrderWithIntent(orderId: string, paymentIntentId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId },
    });
  },

  async getSellerEarnings(sellerId: string) {
    const orders = await prisma.order.findMany({
      where: {
        sellerId,
        status: { in: ['PAID', 'IN_PROGRESS', 'COMPLETED'] },
      },
    });

    const totalEarnings = orders.reduce((sum, order) => sum + order.sellerAmount, 0);

    return {
      totalEarnings,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'IN_PROGRESS').length,
      completedOrders: orders.filter((o) => o.status === 'COMPLETED').length,
    };
  },

  async getPlatformStats() {
    const [totalOrders, totalRevenue, users] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { commissionAmount: true },
      }),
      prisma.user.count(),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.commissionAmount || 0,
      totalUsers: users,
    };
  },
};
