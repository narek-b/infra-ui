import { useState, useEffect, useCallback } from 'react';
import { VmListResponse, VmResponse } from '../types/api';
import { apiService } from '../services/api';

interface UseVmsOptions {
  namespace: string;
  pageSize?: number;
}

interface UseVmsReturn {
  vms: VmResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  stats: {
    runningCount: number;
    stoppedCount: number;
    errorCount: number;
    pendingCount: number;
  };
  fetchVms: (page?: number) => Promise<void>;
  refreshVms: () => Promise<void>;
}

export function useVms({ namespace, pageSize = 20 }: UseVmsOptions): UseVmsReturn {
  const [vms, setVms] = useState<VmResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [stats, setStats] = useState({
    runningCount: 0,
    stoppedCount: 0,
    errorCount: 0,
    pendingCount: 0,
  });

  const fetchVms = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: VmListResponse = await apiService.listVms(namespace, page, pageSize);
      
      setVms(response.vms);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        hasNext: response.hasNext,
        hasPrevious: response.hasPrevious,
      });
      setStats({
        runningCount: response.runningCount,
        stoppedCount: response.stoppedCount,
        errorCount: response.errorCount,
        pendingCount: response.pendingCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch VMs');
      console.error('Error fetching VMs:', err);
    } finally {
      setLoading(false);
    }
  }, [namespace, pageSize]);

  const refreshVms = useCallback(async () => {
    return fetchVms(pagination.page);
  }, [fetchVms, pagination.page]);

  useEffect(() => {
    fetchVms(1);
  }, [fetchVms]);

  return {
    vms,
    loading,
    error,
    pagination,
    stats,
    fetchVms,
    refreshVms,
  };
}
