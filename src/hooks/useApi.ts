'use client';

import { useCallback } from 'react';
import { ApiResponse } from '@/types';

export function useApi() {
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  };

  const request = useCallback(
    async <T,>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> => {
      const token = getToken();

      try {
        const response = await fetch(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            // Handle unauthorized
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-token');
              window.location.href = '/auth/login';
            }
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

  return { request, getToken };
}
