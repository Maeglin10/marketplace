import { NextRequest } from 'next/server';
import { reviewService } from '@/services/review.service';
import { createReviewSchema } from '@/lib/validation';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as any
      );
    }

    const review = await reviewService.createReview(auth.id, validation.data);
    return successResponse(review, 'Review created', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create review', 400);
  }
}
