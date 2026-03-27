import { NextRequest } from 'next/server';
import { serviceService } from '@/services/service.service';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams;
    
    const search = query.get('search') || undefined;
    const category = query.get('category') || undefined;
    // Accept both `sort` (new) and `sortBy` (legacy) query params
    const sortBy = (query.get('sort') || query.get('sortBy') || 'newest') as string;
    const page = parseInt(query.get('page') || '1', 10);
    const limit = parseInt(query.get('limit') || '10', 10);
    
    const priceMin = query.get('priceMin');
    const priceMax = query.get('priceMax');
    const priceRange = priceMin && priceMax 
      ? [parseFloat(priceMin), parseFloat(priceMax)] 
      : undefined;

    const result = await serviceService.searchServices({
      search,
      category,
      priceRange: priceRange as any,
      sortBy,
      pagination: { page, limit },
    });

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch services', 400);
  }
}
