import { NextRequest } from 'next/server';
import { messagingService } from '@/services/messaging.service';
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
    const limit = parseInt(query.get('limit') || '20', 10);

    const result = await messagingService.getUserConversations(auth.id, page, limit);
    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch conversations', 400);
  }
}
