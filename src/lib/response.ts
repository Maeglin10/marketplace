import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export const successResponse = <T>(data: T, message = 'Success', status = 200): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    { success: true, data, message },
    { status }
  );
};

export const errorResponse = (error: string, status = 400): NextResponse<ApiResponse<null>> => {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
};

export const validationErrorResponse = (errors: Record<string, string>): NextResponse<ApiResponse<Record<string, string>>> => {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      data: errors,
    },
    { status: 400 }
  );
};

export const unauthorizedResponse = (): NextResponse<ApiResponse<null>> => {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
};

export const forbiddenResponse = (): NextResponse<ApiResponse<null>> => {
  return NextResponse.json(
    { success: false, error: 'Forbidden' },
    { status: 403 }
  );
};

export const notFoundResponse = (): NextResponse<ApiResponse<null>> => {
  return NextResponse.json(
    { success: false, error: 'Not found' },
    { status: 404 }
  );
};
