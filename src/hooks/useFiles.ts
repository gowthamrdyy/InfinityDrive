// ============================================
// InfinityDrive — useFiles Hook
// ============================================
// SWR-powered hook for fetching files from the primary Drive.
// Supports folder navigation with breadcrumb tracking.

'use client';

import useSWR from 'swr';
import { useState, useCallback } from 'react';
import type { DriveFile, BreadcrumbItem } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
};

export function useFiles() {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'folders' | 'all' | 'shared' | 'profile' | 'linked'>('folders');
  const [linkedAccountId, setLinkedAccountId] = useState<string | undefined>();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive' },
  ]);

  let fetchUrl = '/api/drive/files';
  if (viewMode === 'profile') {
    fetchUrl = '';
  } else if (viewMode === 'shared') {
    fetchUrl = '/api/drive/files?folderId=shared&combine=true';
  } else if (viewMode === 'all') {
    fetchUrl = '/api/drive/files?folderId=all&combine=true';
  } else if (currentFolderId) {
    fetchUrl = `/api/drive/files?folderId=${currentFolderId}`;
  }

  // Append linkedAccountId if viewing a linked account
  if (fetchUrl && linkedAccountId) {
    fetchUrl += fetchUrl.includes('?') ? `&linkedAccountId=${encodeURIComponent(linkedAccountId)}` : `?linkedAccountId=${encodeURIComponent(linkedAccountId)}`;
  }

  const url = fetchUrl || null;

  const { data, error, isLoading, mutate } = useSWR<{ files: DriveFile[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const navigateToFolder = useCallback(
    (folderId: string, folderName: string) => {
      setViewMode('folders');
      setCurrentFolderId(folderId);
      setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }]);
    },
    []
  );

  const navigateToBreadcrumb = useCallback(
    (index: number) => {
      setViewMode('folders');
      const target = breadcrumbs[index];
      if (index === 0) {
        // Go to root
        setCurrentFolderId(undefined);
        setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
      } else {
        setCurrentFolderId(target.id);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      }
    },
    [breadcrumbs]
  );

  const goBack = useCallback(() => {
    if (viewMode === 'profile') {
      setViewMode('folders');
      return;
    }
    setViewMode('folders');
    if (breadcrumbs.length <= 1) return;
    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    const parent = newBreadcrumbs[newBreadcrumbs.length - 1];
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(parent.id === 'root' ? undefined : parent.id);
  }, [breadcrumbs, viewMode]);

  const showAllFiles = useCallback(() => {
    setViewMode('all');
    setCurrentFolderId(undefined);
    setLinkedAccountId(undefined);
    setBreadcrumbs([{ id: 'all', name: 'All Files' }]);
  }, []);

  const showHome = useCallback(() => {
    setViewMode('folders');
    setCurrentFolderId(undefined);
    setLinkedAccountId(undefined);
    setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
  }, []);

  const showSharedFiles = useCallback(() => {
    setViewMode('shared');
    setCurrentFolderId(undefined);
    setLinkedAccountId(undefined);
    setBreadcrumbs([{ id: 'shared', name: 'Shared with me' }]);
  }, []);

  const showProfile = useCallback(() => {
    setViewMode('profile');
    setCurrentFolderId(undefined);
    setLinkedAccountId(undefined);
    setBreadcrumbs([{ id: 'profile', name: 'Profile' }]);
  }, []);

  const viewLinkedAccount = useCallback((email: string) => {
    setViewMode('linked');
    setCurrentFolderId(undefined);
    setLinkedAccountId(email);
    setBreadcrumbs([{ id: 'linked_root', name: `${email}` }]);
  }, []);

  return {
    files: data?.files || [],
    isLoading,
    error,
    currentFolderId,
    breadcrumbs,
    viewMode,
    navigateToFolder,
    navigateToBreadcrumb,
    goBack,
    showAllFiles,
    showHome,
    showSharedFiles,
    showProfile,
    viewLinkedAccount,
    linkedAccountId,
    refresh: mutate,
  };
}
