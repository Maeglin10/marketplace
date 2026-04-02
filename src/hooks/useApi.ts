'use client';

import { useCallback } from 'react';
import { ApiResponse } from '@/types';

export function useApi() {
  const request = useCallback(
    async <T,>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
      try {
        const response = await fetch(endpoint, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return {
            success: false,
            error: data.error || 'An error occurred',
          };
        }

        return data;
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Network error',
        };
      }
    },
    []
  );

  return { request };
}
