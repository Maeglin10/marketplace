import { NextRequest } from 'next/server';
import { serviceService } from '@/services/service.service';
import { updateServiceSchema } from '@/lib/validation';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await serviceService.getServiceById(id);
    if (!service) {
      return notFoundResponse();
    }
    return successResponse(service);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch service', 400);
  }
}

export async function PUT(
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
    const validation = updateServiceSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        validation.error.flatten().fieldErrors as any
      );
    }

    const service = await serviceService.updateService(id, auth.id, validation.data);
    return successResponse(service);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update service', 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    await serviceService.deleteService(id, auth.id);
    return successResponse(null, 'Service deleted');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to delete service', 400);
  }
}
