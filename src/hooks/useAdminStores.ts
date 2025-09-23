'use client';

import useSWR from 'swr';
import { apiFetch } from '@/lib/api';

export function useAdminStores() {
  const { data, error, isLoading, mutate } = useSWR(
    '/admin/stores',
    (path) => apiFetch<{ stores: any[] }>(path)
  );

  return {
    stores: data?.stores ?? [],
    error,
    isLoading,
    reload: mutate,
  };
}