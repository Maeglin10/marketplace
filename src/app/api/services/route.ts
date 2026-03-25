import { NextRequest } from 'next/server';
import { createServiceSchema } from '@/lib/validation';
import { serviceService } from '@/services/service.service';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
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
