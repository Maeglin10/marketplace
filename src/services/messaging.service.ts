import prisma from '@/lib/db';

export const messagingService = {
  async getOrCreateConversation(initiatorId: string, targetId: string, orderId?: string) {
    // Find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            initiatorId,
            targetId,
            orderId: orderId || null,
          },
          {
            initiatorId: targetId,
            targetId: initiatorId,
            orderId: orderId || null,
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          initiatorId,
          targetId,
          orderId,
        },
      });
    }

    return conversation;
  },

  async sendMessage(conversationId: string, fromUserId: string, content: string, orderId?: string) {
    const message = await prisma.message.create({
      data: {
        conversationId,
        fromUserId,
        content,
        orderId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return message;
  },

  async getConversationMessages(conversationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getUserConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { targetId: userId },
        ],
      },
      skip,
      take: limit,
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const total = await prisma.conversation.count({
      where: {
        OR: [
          { initiatorId: userId },
          { targetId: userId },
        ],
      },
    });

    return {
      conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async markAsRead(messageId: string) {
    return prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });
  },

  async getUnreadCount(userId: string) {
    return prisma.message.count({
      where: {
        conversation: {
          OR: [
            { targetId: userId },
            { initiatorId: userId },
          ],
        },
        readAt: null,
        NOT: {
          fromUserId: userId,
        },
      },
    });
  },
};
