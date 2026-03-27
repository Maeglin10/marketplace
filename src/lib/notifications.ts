import prisma from '@/lib/db';
import { NotificationType } from '@prisma/client';

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  } catch (error) {
    // Ne pas faire planter l'action principale si la notification echoue
    console.error('Failed to create notification:', error);
    return null;
  }
}
