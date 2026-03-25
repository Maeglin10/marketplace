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

    const query = request.nextUrl.searchParams;
    const page = parseInt(query.get('page') || '1', 10);
    const limit = parseInt(query.get('limit') || '10', 10);
    const type = query.get('type') as 'buyer' | 'seller' || 'buyer';

    if (type === 'seller') {
      const result = await orderService.getOrdersBySeller(auth.id, page, limit);
      return successResponse(result);
    } else {
      const result = await orderService.getOrdersByBuyer(auth.id, page, limit);
      return successResponse(result);
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch orders', 400);
  }
}
