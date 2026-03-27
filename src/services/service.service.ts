import prisma from '@/lib/db';
import { CreateServiceInput, UpdateServiceInput } from '@/lib/validation';
import { SearchParams } from '@/types';

export const serviceService = {
  async createService(userId: string, input: CreateServiceInput) {
    const service = await prisma.service.create({
      data: {
        ...input,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
    });

    return service;
  },

  async updateService(serviceId: string, userId: string, input: UpdateServiceInput) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    if (service.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: input,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
    });

    return updated;
  },

  async deleteService(serviceId: string, userId: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    if (service.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });
  },

  async getServiceById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            sellerProfile: true,
          },
        },
        category: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          take: 5,
        },
      },
    });
  },

  async searchServices(params: SearchParams) {
    const { search, category, priceRange, sortBy, pagination } = params;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (priceRange) {
      where.price = {
        gte: priceRange[0],
        lte: priceRange[1],
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    if (sortBy === 'rating') orderBy = { reviews: { _count: 'desc' } };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          category: true,
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getServicesByUserId(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          category: true,
        },
      }),
      prisma.service.count({ where: { userId } }),
    ]);

    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async createCategory(name: string, description?: string) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    return prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
    });
  },
};
