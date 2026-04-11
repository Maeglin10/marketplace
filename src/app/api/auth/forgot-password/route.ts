import { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/response';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await rateLimit(`auth:forgot:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse('Too many requests, please try again later', 429);
  }

  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({ message: 'If that email exists, we sent a reset link.' });
    }

    // Invalidate existing tokens
    await prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Generate secure token
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token: tokenHash, expiresAt },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_URL || process.env.FRONTEND_URL_PROD || 'http://localhost:3000'}/auth/reset-password/${rawToken}`;

    // Send email if Resend is configured, else log for dev
    const resendKey = process.env.RESEND_API_KEY;
    const isRealKey = resendKey && !resendKey.includes('REPLACE') && resendKey.length > 10;

    if (isRealKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Marketplace <noreply@marketplace.com>',
          to: email,
          subject: 'Reset your password',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
              <h2>Reset your password</h2>
              <p>Click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
              <p style="margin-top:24px;color:#888;font-size:12px;">If you didn't request this, ignore this email. Your password won't change.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
      }
    } else {
      // Dev mode — log to console
      console.log(`[DEV] Password reset link for ${email}:`, resetUrl);
    }

    return successResponse({ message: 'If that email exists, we sent a reset link.' });
  } catch (error: any) {
    return errorResponse(error.message || 'Request failed', 400);
  }
}
