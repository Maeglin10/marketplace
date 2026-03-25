import { NextRequest } from 'next/server';
import { successResponse, unauthorizedResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';
import { userService } from '@/services/user.service';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const user = await userService.getUserById(auth.id);
    if (!user) {
      return unauthorizedResponse();
    }

    // Don't expose password
    const { password, ...userWithoutPassword } = user;
    return successResponse(userWithoutPassword);
  } catch (error: any) {
    return unauthorizedResponse();
  }
}
