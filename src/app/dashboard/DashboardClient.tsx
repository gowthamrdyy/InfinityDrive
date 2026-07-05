// ============================================
// InfinityDrive — Dashboard Client Component
// ============================================
// Main dashboard view assembling Header, FileExplorer,
// FloatingActionBar, and TransferModal.

'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { FileExplorer } from '@/components/FileExplorer';
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { TransferModal } from '@/components/TransferModal';
import { ProfileView } from '@/components/ProfileView';
import { BottomNav } from '@/components/BottomNav';
import { useFiles } from '@/hooks/useFiles';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { useTransfer } from '@/hooks/useTransfer';
import { isFolder } from '@/lib/utils';

export function DashboardClient() {
  // File management
  const {
    files,
    isLoading: filesLoading,
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
    error,
    refresh: refreshFiles,
  } = useFiles();

  // Selection state
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Transfer modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Linked accounts
  const {
    accounts,
    isLoading: accountsLoading,
    linkNewAccount,
    reverifyAccount,
  } = useLinkedAccounts();

  // Transfer execution
  const {
    state: transferState,
    results: transferResults,
    error: transferError,
    startTransfer,
    reset: resetTransfer,
  } = useTransfer();

  // ---- Selection Handlers ----
  const handleToggleSelect = useCallback((fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    // Select only non-folder files
    const fileIds = files
      .filter((f) => !isFolder(f.mimeType))
      .map((f) => f.id);
    setSelectedFiles(new Set(fileIds));
  }, [files]);

  const handleDeselectAll = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  // Clear selection when navigating folders
  const handleNavigateToFolder = useCallback(
    (folderId: string, folderName: string) => {
      setSelectedFiles(new Set());
      navigateToFolder(folderId, folderName);
    },
    [navigateToFolder]
  );

  const handleNavigateToBreadcrumb = useCallback(
    (index: number) => {
      setSelectedFiles(new Set());
      navigateToBreadcrumb(index);
    },
    [navigateToBreadcrumb]
  );

  const handleGoBack = useCallback(() => {
    setSelectedFiles(new Set());
    goBack();
  }, [goBack]);

  // ---- Transfer Handlers ----
  const handleOpenTransfer = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleTransfer = useCallback(
    async (linkedAccountId: string) => {
      const fileIds = Array.from(selectedFiles);
      await startTransfer(fileIds, linkedAccountId);
      // Refresh file list after transfer
      refreshFiles();
      setSelectedFiles(new Set());
    },
    [selectedFiles, startTransfer, refreshFiles]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    resetTransfer();
  }, [resetTransfer]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative z-0">
        {viewMode === 'profile' ? (
          <ProfileView onViewFiles={viewLinkedAccount} />
        ) : (
          <FileExplorer
            files={files}
            isLoading={filesLoading}
            error={error}
            breadcrumbs={breadcrumbs}
            selectedFiles={selectedFiles}
            viewMode={viewMode}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onNavigateToFolder={handleNavigateToFolder}
            onNavigateToBreadcrumb={handleNavigateToBreadcrumb}
            onGoBack={handleGoBack}
            onShowHome={showHome}
            onShowAllFiles={showAllFiles}
            onRefresh={() => refreshFiles()}
            accounts={accounts}
            linkedAccountId={linkedAccountId}
            onViewLinkedAccount={viewLinkedAccount}
          />
        )}
      </main>

      {/* Floating Action Bar (when files selected) */}
      <FloatingActionBar
        selectedCount={selectedFiles.size}
        onTransfer={handleOpenTransfer}
        onDeselectAll={handleDeselectAll}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={viewMode as any}
        onTabChange={(tab) => {
          if (tab === 'folders') showHome();
          if (tab === 'all') showAllFiles();
          if (tab === 'shared') showSharedFiles();
          if (tab === 'profile') showProfile();
        }}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedFileCount={selectedFiles.size}
        accounts={accounts}
        accountsLoading={accountsLoading}
        transferState={transferState}
        transferResults={transferResults}
        transferError={transferError}
        onTransfer={handleTransfer}
        onLinkNew={linkNewAccount}
        onReverify={reverifyAccount}
        onReset={resetTransfer}
      />
    </div>
  );
}
