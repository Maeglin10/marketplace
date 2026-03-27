import { NextRequest } from 'next/server';
import { messagingService } from '@/services/messaging.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';
import { broadcastMessage } from '@/lib/sse';
import { sendEmail } from '@/lib/email';
import { NewMessageEmail } from '@/emails/new-message';
import prisma from '@/lib/db';

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

    // Envoyer email de notification au destinataire
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          initiator: { select: { id: true, name: true, email: true } },
          target: { select: { id: true, name: true, email: true } },
        },
      });

      if (conversation) {
        // Le destinataire est l'autre participant de la conversation
        const recipient =
          conversation.initiatorId === auth.id
            ? conversation.target
            : conversation.initiator;

        const sender = message.fromUser;

        if (recipient?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const preview =
            body.content.length > 120
              ? body.content.slice(0, 120) + '...'
              : body.content;

          await sendEmail({
            to: recipient.email,
            subject: `Nouveau message de ${sender.name}`,
            template: NewMessageEmail,
            props: {
              recipientName: recipient.name || 'Utilisateur',
              senderName: sender.name || 'Quelqu\'un',
              messagePreview: preview,
              conversationUrl: `${appUrl}/conversations/${id}`,
            },
          });
        }
      }
    } catch (emailError) {
      console.error('[email] Échec envoi notification nouveau message:', emailError);
    }

    return successResponse(message, 'Message sent', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to send message', 400);
  }
}
