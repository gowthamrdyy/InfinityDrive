// ============================================
// InfinityDrive — useQuota Hook
// ============================================
// Fetches storage quota info from the primary Drive account.

'use client';

import useSWR from 'swr';
import type { StorageQuota, DriveUser } from '@/types';
import { getStorageStatus } from '@/lib/utils';
import { useLinkedAccounts } from './useLinkedAccounts';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch quota');
  return res.json();
};

export function useQuota() {
  const { data, error, isLoading } = useSWR<{
    quota: StorageQuota;
    user: DriveUser;
  }>('/api/drive/quota', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const { accounts, isLoading: accountsLoading } = useLinkedAccounts();

  let totalUsage = data?.quota?.usage || 0;
  let totalLimit = data?.quota?.limit || 0;

  if (accounts) {
    for (const acc of accounts) {
      if (acc.status === 'ACTIVE') {
        totalUsage += acc.storageUsed || 0;
        totalLimit += acc.storageLimit || 0;
      }
    }
  }

  const status = totalLimit > 0
    ? getStorageStatus(totalUsage, totalLimit)
    : { percentage: 0, isWarning: false, isCritical: false, isFull: false };

  return {
    quota: data?.quota ? { usage: totalUsage, limit: totalLimit } : null,
    primaryQuota: data?.quota || null,
    user: data?.user || null,
    ...status,
    isLoading: isLoading || accountsLoading,
    error,
  };
}
