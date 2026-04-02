import { NextRequest } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { userService } from '@/services/user.service';
import { createToken } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit: max 10 requests per minute per IP
  const ip = getClientIp(request);
  const rl = await rateLimit(`auth:login:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorResponse('Too many requests, please try again later', 429);
  }

  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as any
      );
    }

    const user = await userService.login(validation.data);
    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = successResponse({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });

    const isProd = process.env.NODE_ENV === 'production';
    response.headers.set(
      'Set-Cookie',
      `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`
    );

    return response;
  } catch (error: any) {
    return errorResponse(error.message || 'Login failed', 401);
  }
}
