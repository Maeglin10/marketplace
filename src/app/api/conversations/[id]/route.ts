import { NextRequest } from 'next/server';
import { messagingService } from '@/services/messaging.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';
import { broadcastMessage } from '@/lib/sse';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const query = request.nextUrl.searchParams;
    const page = parseInt(query.get('page') || '1', 10);
    const limit = parseInt(query.get('limit') || '50', 10);

    const result = await messagingService.getConversationMessages(id, page, limit);
    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch messages', 400);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const message = await messagingService.sendMessage(
      id,
      auth.id,
      body.content,
      body.orderId
    );

    // Broadcast to SSE subscribers in real-time
    broadcastMessage(id, message);

    return successResponse(message, 'Message sent', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to send message', 400);
  }
}
