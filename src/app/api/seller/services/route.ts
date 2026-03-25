import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { serviceService } from '@/services/service.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await serviceService.getServicesByUserId(auth.id, page, limit);
    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch services', 400);
  }
}
