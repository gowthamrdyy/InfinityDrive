// ============================================
// InfinityDrive — useTransfer Hook
// ============================================
// Manages the transfer execution lifecycle and progress tracking.

'use client';

import { useState, useCallback } from 'react';
import type { TransferState, TransferResponse } from '@/types';

export function useTransfer() {
  const [state, setState] = useState<TransferState>('idle');
  const [results, setResults] = useState<TransferResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTransfer = useCallback(
    async (fileIds: string[], linkedAccountId: string) => {
      setState('transferring');
      setError(null);
      setResults(null);

      try {
        const response = await fetch('/api/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileIds, linkedAccountId }),
        });

        const data: TransferResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            (data as unknown as { error: string }).error || 'Transfer failed'
          );
        }

        setResults(data);
        setState(data.success ? 'success' : 'error');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transfer failed';
        setError(msg);
        setState('error');
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState('idle');
    setResults(null);
    setError(null);
  }, []);

  return {
    state,
    results,
    error,
    startTransfer,
    reset,
    isTransferring: state === 'transferring',
  };
}
