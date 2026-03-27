import { NextRequest } from 'next/server';
import { reviewService } from '@/services/review.service';
import { createReviewSchema } from '@/lib/validation';
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

/** Supprime les balises HTML et normalise les espaces blancs */
function sanitizeText(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.replace(/[<>]/g, '').trim();
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const raw = await request.json();
    // Sanitiser le champ texte libre avant validation
    const body = {
      ...raw,
      comment: sanitizeText(raw.comment),
    };
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
