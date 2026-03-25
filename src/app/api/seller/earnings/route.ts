import { NextRequest } from 'next/server';
import { orderService } from '@/services/order.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const earnings = await orderService.getSellerEarnings(auth.id);
    return successResponse(earnings);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch earnings', 400);
  }
}
