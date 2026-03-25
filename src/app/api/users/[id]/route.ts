import { NextRequest } from 'next/server';
import { userService } from '@/services/user.service';
import { updateProfileSchema } from '@/lib/validation';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await userService.getUserById(id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Don't expose password
    const { password, ...userWithoutPassword } = user;
    return successResponse(userWithoutPassword);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch user', 400);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    const { id } = await params;
    if (!auth || auth.id !== id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as any
      );
    }

    const user = await userService.updateProfile(auth.id, validation.data);
    const { password, ...userWithoutPassword } = user;
    return successResponse(userWithoutPassword);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update profile', 400);
  }
}
