import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { messagingService } from '@/services/messaging.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { z } from 'zod';

const schema = z.object({
  targetUserId: z.string(),
  orderId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) return errorResponse('Invalid data', 400);

    if (auth.id === validation.data.targetUserId) {
      return errorResponse('Cannot start conversation with yourself', 400);
    }

    const conversation = await messagingService.getOrCreateConversation(
      auth.id,
      validation.data.targetUserId,
      validation.data.orderId
    );

    return successResponse(conversation);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to start conversation', 400);
  }
}
