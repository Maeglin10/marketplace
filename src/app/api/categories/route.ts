import { serviceService } from '@/services/service.service';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET() {
  try {
    const categories = await serviceService.getCategories();
    return successResponse(categories);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch categories', 400);
  }
}
