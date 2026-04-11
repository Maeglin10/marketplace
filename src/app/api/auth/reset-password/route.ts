import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(64).max(64),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = schema.parse(body);

    const tokenHash = createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });

    if (!resetToken) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    if (resetToken.used) {
      return errorResponse('This reset link has already been used', 400);
    }

    if (new Date() > resetToken.expiresAt) {
      return errorResponse('This reset link has expired. Please request a new one.', 400);
    }

    const hashedPassword = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { token: tokenHash },
        data: { used: true },
      }),
    ]);

    return successResponse({ message: 'Password updated successfully. You can now log in.' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Invalid request', 400);
    }
    return errorResponse('Failed to reset password', 500);
  }
}
