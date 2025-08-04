import { useState, useCallback } from 'react';
import { ApiResponse } from '../types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      console.log('useApi execute called');
      setState({ data: null, loading: true, error: null });
      try {
        const response = await apiFunction(...args);
        console.log('useApi response:', response);
        setState({ data: response.data, loading: false, error: null });
      } catch (error: any) {
        console.error('useApi error:', error);
        setState({
          data: null,
          loading: false,
          error: error.response?.data?.message || error.message || 'An error occurred',
        });
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
} 