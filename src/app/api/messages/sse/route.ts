import { NextRequest } from 'next/server';
import { verifyToken, requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { addSubscriber, removeSubscriber } from '@/lib/sse';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return new Response('Missing conversationId', { status: 400 });
  }

  const token = searchParams.get('token');
  const auth = token ? verifyToken(token) : requireAuth(request);
  if (!auth) return new Response('Unauthorized', { status: 401 });

  // Verify the user belongs to this conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ initiatorId: auth.id }, { targetId: auth.id }],
    },
  });
  if (!conversation) return new Response('Forbidden', { status: 403 });

  let ctrl: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(controller) {
      ctrl = controller;
      addSubscriber(conversationId, ctrl);
      // Initial heartbeat so browser knows connection is alive
      ctrl.enqueue(new TextEncoder().encode(': connected\n\n'));
    },
    cancel() {
      removeSubscriber(conversationId, ctrl);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
