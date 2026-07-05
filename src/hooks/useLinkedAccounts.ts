// ============================================
// InfinityDrive — useLinkedAccounts Hook
// ============================================
// Fetches linked secondary accounts and provides linking/reverification.

'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import type { LinkedAccountInfo } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch accounts');
  return res.json();
};

export function useLinkedAccounts() {
  const { data, error, isLoading, mutate } = useSWR<{
    accounts: LinkedAccountInfo[];
  }>('/api/accounts', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  /**
   * Initiates the OAuth flow to link a new secondary account.
   * Opens a popup window for Google consent.
   */
  const linkNewAccount = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts/link');
      const { authUrl } = await res.json();

      if (!authUrl) {
        throw new Error('Failed to generate OAuth URL');
      }

      // Open OAuth in a popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        'link-account',
        `width=${width},height=${height},left=${left},top=${top},popup=yes`
      );

      // Poll for popup close (redirect back will close it)
      if (popup) {
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            // Refresh accounts list
            mutate();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to link account:', error);
    }
  }, [mutate]);

  /**
   * Re-verifies an expired secondary account by re-running OAuth.
   */
  const reverifyAccount = useCallback(async () => {
    await linkNewAccount(); // Same flow — consent screen re-issues tokens
  }, [linkNewAccount]);

  return {
    accounts: data?.accounts || [],
    isLoading,
    error,
    linkNewAccount,
    reverifyAccount,
    refresh: mutate,
  };
}
