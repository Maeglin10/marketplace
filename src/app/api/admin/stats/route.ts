import { NextRequest } from 'next/server';
import { orderService } from '@/services/order.service';
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/response';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (!auth) {
      return forbiddenResponse();
    }

    const stats = await orderService.getPlatformStats();
    return successResponse(stats);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch stats', 400);
  }
}
