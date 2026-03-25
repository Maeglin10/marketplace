import prisma from '@/lib/db';
import { CreateReviewInput } from '@/lib/validation';

export const reviewService = {
  async createReview(userId: string, input: CreateReviewInput) {
    // Check if order exists and is completed
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'COMPLETED') {
      throw new Error('Can only review completed orders');
    }

    if (order.buyerId !== userId) {
      throw new Error('Unauthorized');
    }

    if (order.items.length === 0) {
      throw new Error('Order has no items');
    }

    // Get the service ID from order items (using first item)
    const serviceId = order.items[0].serviceId;

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        orderId_reviewerId: {
          orderId: input.orderId,
          reviewerId: userId,
        },
      },
    });

    if (existingReview) {
      throw new Error('Review already exists for this order');
    }

    const review = await prisma.review.create({
      data: {
        orderId: input.orderId,
        serviceId: serviceId,
        reviewerId: userId,
        revieweeId: order.sellerId,
        rating: input.rating,
        comment: input.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update seller average rating
    await this.updateSellerRating(order.sellerId);

    return review;
  },

  async getServiceReviews(serviceId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { serviceId },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { serviceId } }),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getSellerReviews(sellerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { revieweeId: sellerId },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { revieweeId: sellerId } }),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getSellerRating(sellerId: string) {
    const result = await prisma.review.aggregate({
      where: { revieweeId: sellerId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count,
    };
  },

  async updateSellerRating(sellerId: string) {
    const { averageRating } = await this.getSellerRating(sellerId);

    await prisma.sellerProfile.update({
      where: { userId: sellerId },
      data: { averageRating },
    });
  },

  async canReview(userId: string, orderId: string): Promise<boolean> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return false;
    if (order.buyerId !== userId) return false;
    if (order.status !== 'COMPLETED') return false;

    const existingReview = await prisma.review.findUnique({
      where: {
        orderId_reviewerId: {
          orderId,
          reviewerId: userId,
        },
      },
    });

    return !existingReview;
  },
};
