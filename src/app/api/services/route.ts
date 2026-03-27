import { NextRequest } from 'next/server';
import { createServiceSchema } from '@/lib/validation';
import { serviceService } from '@/services/service.service';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/response';
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
    // Sanitiser les champs texte libres avant validation
    const body = {
      ...raw,
      title: sanitizeText(raw.title),
      description: sanitizeText(raw.description),
    };
    const validation = createServiceSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as any
      );
    }

    const service = await serviceService.createService(auth.id, validation.data);
    return successResponse(service, 'Service created', 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create service', 400);
  }
}
