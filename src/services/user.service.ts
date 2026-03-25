import prisma from '@/lib/db';
import { hashPassword, comparePasswords } from '@/lib/auth';
import { RegisterInput, LoginInput, UpdateProfileInput } from '@/lib/validation';

export const userService = {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

    return user;
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const passwordMatch = await comparePasswords(input.password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    return user;
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        sellerProfile: true,
      },
    });
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        sellerProfile: true,
      },
    });
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        bio: input.bio,
        avatar: input.avatar,
        profile: input.phone || input.address ? {
          update: {
            phone: input.phone,
            address: input.address,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
          },
        } : undefined,
      },
      include: {
        profile: true,
      },
    });

    return user;
  },

  async becomeSeller(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'SELLER',
        sellerProfile: {
          create: {},
        },
      },
      include: {
        sellerProfile: true,
      },
    });

    return user;
  },

  async updateStripeAccountId(userId: string, stripeAccountId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId },
    });
  },
};
