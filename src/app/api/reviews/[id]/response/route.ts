import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: reviewId } = params;
    const body = await request.json();
    const { response } = body;

    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      return errorResponse('Response text is required', 400);
    }

    // Fetch review with service to verify seller ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        service: {
          select: { userId: true },
        },
      },
    });

    if (!review) {
      return notFoundResponse();
    }

    // Verify the authenticated user is the seller of the service
    if (review.service.userId !== auth.id) {
      return forbiddenResponse();
    }

    // Update the review with the seller response
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        sellerResponse: response.trim(),
        sellerResponseAt: new Date(),
      },
    });

    return successResponse(updatedReview, 'Response saved');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to save response', 500);
  }
}
