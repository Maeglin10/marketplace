import { NextRequest } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { userService } from '@/services/user.service';
import { createToken } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
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

    response.headers.set('Set-Cookie', `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`);

    return response;
  } catch (error: any) {
    return errorResponse(error.message || 'Login failed', 401);
  }
}
