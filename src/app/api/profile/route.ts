import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) return unauthorizedResponse();

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        stripeAccountId: true,
        profile: true,
        sellerProfile: true,
      },
    });

    if (!user) return errorResponse('User not found', 404);
    return successResponse(user);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch profile', 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Invalid data', 400);
    }

    const { name, bio, avatar, phone, address, city, state, postalCode, country } =
      validation.data;

    await prisma.user.update({
      where: { id: auth.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar: avatar || null }),
      },
    });

    if (phone !== undefined || address !== undefined || city !== undefined) {
      await prisma.profile.upsert({
        where: { userId: auth.id },
        create: {
          userId: auth.id,
          phone,
          address,
          city,
          state,
          postalCode,
          country,
        },
        update: {
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(postalCode !== undefined && { postalCode }),
          ...(country !== undefined && { country }),
        },
      });
    }

    return successResponse({ updated: true });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update profile', 400);
  }
}
