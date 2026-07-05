// ============================================
// InfinityDrive — FileExplorer Component (Airbnb Redesign)
// ============================================
// File grid with sticky search pill, horizontal categories, and bottom nav.

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, FolderOpen, RefreshCw, ArrowLeft, 
  Search, SlidersHorizontal, Download, Share, Info, Trash2, File,
  LayoutGrid, List
} from 'lucide-react';
import { FileCard } from './FileCard';
import { FileListItem } from './FileListItem';
import { InteractiveFolderGallery } from './ui/interactive-folder-gallery';
import { BottomSheet } from './ui/BottomSheet';
import { BottomNav } from './BottomNav';
import type { DriveFile, BreadcrumbItem, LinkedAccountInfo } from '@/types';
import { isFolder, formatBytes } from '@/lib/utils';

interface FileExplorerProps {
  files: DriveFile[];
  isLoading: boolean;
  error?: Error | null;
  breadcrumbs: BreadcrumbItem[];
  selectedFiles: Set<string>;
  viewMode?: 'folders' | 'all' | 'shared' | 'profile' | 'linked';
  accounts?: LinkedAccountInfo[];
  linkedAccountId?: string;
  onToggleSelect: (fileId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onNavigateToFolder: (folderId: string, folderName: string) => void;
  onNavigateToBreadcrumb: (index: number) => void;
  onGoBack: () => void;
  onShowHome?: () => void;
  onShowAllFiles?: () => void;
  onViewLinkedAccount?: (email: string) => void;
  onRefresh: () => void;
}

export function FileExplorer({
  files,
  isLoading,
  error,
  breadcrumbs,
  selectedFiles,
  viewMode = 'folders',
  accounts = [],
  linkedAccountId,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onNavigateToFolder,
  onGoBack,
  onShowHome,
  onShowAllFiles,
  onViewLinkedAccount,
  onRefresh,
}: FileExplorerProps) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [activeFileSheet, setActiveFileSheet] = useState<DriveFile | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'folders' | 'images' | 'documents'>('all');
  
  // Default to list view for shared mode, otherwise grid
  const [isListView, setIsListView] = useState(viewMode === 'shared');
  
  // Update view mode toggle when viewMode changes
  useEffect(() => {
    if (viewMode === 'shared') setIsListView(true);
  }, [viewMode]);

  // Filter files based on active category
  const filteredFiles = files.filter(file => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'folders') return isFolder(file.mimeType);
    if (activeCategory === 'images') return !isFolder(file.mimeType) && file.mimeType.startsWith('image/');
    if (activeCategory === 'documents') return !isFolder(file.mimeType) && !file.mimeType.startsWith('image/');
    return true;
  });

  const hasSelection = selectedFiles.size > 0;
  const allSelected = filteredFiles.length > 0 && selectedFiles.size === filteredFiles.filter(f => !isFolder(f.mimeType)).length;

  const toggleSelectMode = () => {
    if (isSelectMode) {
      onDeselectAll();
    }
    setIsSelectMode(!isSelectMode);
  };

  const handleFileClick = (file: DriveFile) => {
    if (!isFolder(file.mimeType)) {
      setActiveFileSheet(file);
    }
  };

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'folders', label: 'Folders' },
    { id: 'images', label: 'Images' },
    { id: 'documents', label: 'Documents' },
  ] as const;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent relative z-10 pb-20">
      
      {/* Top Section: Navigation */}
      <div className="sticky top-0 z-30 bg-background/50 backdrop-blur-3xl pt-4 pb-2 px-6 border-b border-border-glass">
        
        {/* Navigation Bar */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex-1 min-w-0 flex items-center">
            {breadcrumbs.length > 1 ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onGoBack}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center -ml-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={20} strokeWidth={2.5} className="text-accent" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-text-primary truncate leading-tight drop-shadow-md">
                    {breadcrumbs[breadcrumbs.length - 1].name}
                  </span>
                  <span className="text-[12px] text-text-secondary truncate leading-tight font-medium">
                    {files.length} items
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full max-w-[240px]">
                {viewMode === 'folders' || viewMode === 'linked' ? (
                  <div className="relative flex items-center">
                    <select
                      value={linkedAccountId || 'primary'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'primary' && onShowHome) {
                          onShowHome();
                        } else if (onViewLinkedAccount) {
                          onViewLinkedAccount(val);
                        }
                      }}
                      className="appearance-none bg-transparent text-[24px] font-bold text-text-primary tracking-tight leading-tight w-full cursor-pointer pr-8 outline-none truncate"
                    >
                      <option value="primary" className="bg-background text-text-primary">My Primary Drive</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.email} className="bg-background text-text-primary">
                          {acc.email}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-tight">
                    {viewMode === 'all' ? 'All Files' : viewMode === 'shared' ? 'Shared with me' : 'My Drive'}
                  </h1>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={onRefresh}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
          >
            <RefreshCw size={20} strokeWidth={2.5} className={`text-accent ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-4">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {/* View Toggle */}
            <button
              onClick={() => setIsListView(!isListView)}
              className="p-1.5 rounded-full hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title={isListView ? "Switch to Grid View" : "Switch to List View"}
            >
              {isListView ? <LayoutGrid size={20} /> : <List size={20} />}
            </button>

            {/* Select Mode Toggle */}
            {files.length > 0 && (
              <button
                onClick={toggleSelectMode}
                className={`text-[14px] font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer px-4 py-1.5 rounded-full ${
                  isSelectMode ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-text-primary'
                }`}
              >
                {isSelectMode ? 'Done' : 'Select'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Select Mode Toolbar */}
      <AnimatePresence>
        {isSelectMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden glass-panel border-x-0 border-t-0"
          >
            <div className="px-6 py-3 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-text-primary">{selectedFiles.size} selected</span>
              <button
                onClick={hasSelection && allSelected ? onDeselectAll : onSelectAll}
                className="text-[15px] font-bold text-accent hover:text-accent-hover transition-colors"
              >
                {hasSelection && allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-12">
        {isLoading ? (
          <div className={isListView ? "flex flex-col gap-3" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8"}>
            {Array.from({ length: 12 }).map((_, i) => (
              isListView ? (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-surface-2/30">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="skeleton h-[16px] w-[60%] rounded" />
                    <div className="skeleton h-[14px] w-[40%] rounded" />
                  </div>
                </div>
              ) : (
                <div key={i} className="flex flex-col gap-3">
                  <div className="skeleton w-full aspect-square rounded-2xl" />
                  <div className="flex flex-col gap-1 px-1">
                    <div className="skeleton h-[16px] w-[80%] rounded" />
                    <div className="skeleton h-[14px] w-[50%] rounded" />
                  </div>
                </div>
              )
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-[88px] h-[88px] rounded-full glass-panel flex items-center justify-center mb-6 border-danger/30">
              <span className="text-danger font-bold text-2xl">!</span>
            </div>
            <p className="text-[24px] font-bold text-danger tracking-tight drop-shadow-md">Failed to Load Files</p>
            <p className="text-[16px] text-text-secondary mt-2 font-medium max-w-md">
              {error?.message || 'An error occurred while fetching your files. Please try refreshing.'}
            </p>
          </motion.div>
        ) : files.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-[88px] h-[88px] rounded-full glass-panel flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <FolderOpen size={40} className="text-accent drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]" />
            </div>
            <p className="text-[24px] font-bold text-text-primary tracking-tight drop-shadow-md">No items found</p>
            <p className="text-[16px] text-text-secondary mt-2 font-medium">
              {viewMode === 'all' ? 'Your drive is completely empty.' : 'This folder is empty.'}
            </p>
          </motion.div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[20px] font-bold text-text-primary tracking-tight">No {activeCategory} found</p>
            <p className="text-[14px] text-text-secondary mt-1">
              There are no {activeCategory} in this view.
            </p>
          </div>
        ) : (
          <>
            {activeCategory === 'images' && (
              <div className="w-full flex justify-center mb-8">
                <InteractiveFolderGallery 
                  folderName="My Photos"
                  photos={filteredFiles.map((f, i) => ({
                    id: f.id,
                    image: f.thumbnailLink || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
                  })).slice(0, 5)}
                />
              </div>
            )}
            <div className={isListView ? "flex flex-col gap-2" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8"}>

            {filteredFiles.map((file, index) => (
              isListView ? (
                <FileListItem
                  key={file.id}
                  file={file}
                  selected={selectedFiles.has(file.id)}
                  onSelect={() => onToggleSelect(file.id)}
                  onNavigate={
                    isFolder(file.mimeType)
                      ? () => onNavigateToFolder(file.id, file.name)
                      : undefined
                  }
                  onClick={() => handleFileClick(file)}
                  isSelectMode={isSelectMode}
                  index={index}
                />
              ) : (
                <FileCard
                  key={file.id}
                  file={file}
                  selected={selectedFiles.has(file.id)}
                  onSelect={() => onToggleSelect(file.id)}
                  onNavigate={
                    isFolder(file.mimeType)
                      ? () => onNavigateToFolder(file.id, file.name)
                      : undefined
                  }
                  onClick={() => handleFileClick(file)}
                  isSelectMode={isSelectMode}
                  index={index}
                />
              )
            ))}
          </div>
          </>
        )}
      </div>

      {/* Bottom Sheet for File Options */}
      <BottomSheet 
        isOpen={!!activeFileSheet} 
        onClose={() => setActiveFileSheet(null)}
      >
        {activeFileSheet && (
          <div className="space-y-6">
            <div className="px-5 pt-6 pb-4 flex gap-4 border-b border-surface-3 relative">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-blue-600 rounded-[16px] shadow-lg shadow-accent/20 flex items-center justify-center text-white">
                <File size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center pr-8">
                <h3 className="text-[20px] font-bold text-text-primary truncate drop-shadow-sm">
                  {activeFileSheet.name}
                </h3>
                <p className="text-[14px] text-text-secondary font-medium mt-1">
                  Document • {formatBytes(activeFileSheet.size || 0)}
                </p>
              </div>
              <button 
                onClick={() => setActiveFileSheet(null)}
                className="absolute top-6 right-5 w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors cursor-pointer"
              >
                <span className="text-text-secondary font-bold text-xl leading-none">×</span>
              </button>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <button 
                onClick={() => {
                  onToggleSelect(activeFileSheet.id);
                  setActiveFileSheet(null);
                  setIsSelectMode(true);
                }}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-2 active:bg-surface-3 transition-all border-b border-surface-3"
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center"><Download size={18} className="text-accent" /></div>
                <span className="text-[17px] font-semibold text-text-primary">Select for Transfer</span>
              </button>
              
              <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-2 active:bg-surface-3 transition-all border-b border-surface-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center"><Share size={18} className="text-accent" /></div>
                <span className="text-[17px] font-semibold text-text-primary">Share Link</span>
              </button>

              <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-2 active:bg-surface-3 transition-all border-b border-surface-3">
                <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center"><Info size={18} className="text-text-primary" /></div>
                <span className="text-[17px] font-semibold text-text-primary">Get Info</span>
              </button>

              <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-2 active:bg-error/20 transition-all">
                <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center"><Trash2 size={18} className="text-error" /></div>
                <span className="text-[17px] font-semibold text-error">Delete</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
