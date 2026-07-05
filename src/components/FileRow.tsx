// ============================================
// InfinityDrive — FileRow Component
// ============================================
// Individual file/folder row for iOS grouped lists.

'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, FileText, Image, Video, Music,
  Sheet, Presentation, Archive, FileCode, File, ChevronRight
} from 'lucide-react';
import { Checkbox } from './ui/Checkbox';
import { formatBytes, formatDate, getFileIconName, isFolder } from '@/lib/utils';
import type { DriveFile } from '@/types';

interface FileRowProps {
  file: DriveFile;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onNavigate?: () => void;
  onClick: () => void;
  isSelectMode: boolean;
  isLast: boolean;
  index: number;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Folder, FileText, Image, Video, Music,
  Sheet, Presentation, Archive, FileCode, File,
};

export function FileRow({ 
  file, 
  selected, 
  onSelect, 
  onNavigate, 
  onClick,
  isSelectMode, 
  isLast,
  index 
}: FileRowProps) {
  const iconName = getFileIconName(file.mimeType);
  const IconComponent = iconMap[iconName] || File;
  const folder = isFolder(file.mimeType);

  const handleClick = () => {
    if (isSelectMode) {
      onSelect(!selected);
    } else {
      if (folder && onNavigate) {
        onNavigate();
      } else {
        onClick();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
      onClick={handleClick}
      className={`
        relative flex items-center min-h-[64px]
        cursor-pointer transition-all duration-300
        active:scale-[0.98]
        ${selected && isSelectMode ? 'bg-accent/10 shadow-[inset_4px_0_0_var(--color-accent)]' : 'hover:bg-surface-2'}
      `}
    >
      {/* Animated Checkbox Container */}
      <AnimatePresence initial={false}>
        {isSelectMode && (
          <motion.div
            initial={{ width: 0, opacity: 0, paddingLeft: 0 }}
            animate={{ width: 52, opacity: 1, paddingLeft: 20 }}
            exit={{ width: 0, opacity: 0, paddingLeft: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex-shrink-0 flex items-center overflow-hidden"
          >
            <Checkbox
              checked={selected}
              onChange={onSelect}
              id={`file-${file.id}`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`
        flex items-center gap-4 py-3 flex-1 pr-5
        ${!isSelectMode ? 'pl-5' : 'pl-2'}
      `}>
        {/* Vibrant Icon */}
        <div
          className={`
            flex items-center justify-center w-[42px] h-[42px] rounded-[14px] flex-shrink-0 shadow-lg overflow-hidden
            ${folder 
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white drop-shadow-[0_4px_10px_rgba(245,158,11,0.4)]' 
              : 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white drop-shadow-[0_4px_10px_rgba(59,130,246,0.4)]'}
          `}
        >
          {file.thumbnailLink ? (
            <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <IconComponent size={22} strokeWidth={2.5} />
          )}
        </div>

        {/* Name & Type */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <p className="text-[17px] font-semibold text-text-primary truncate drop-shadow-md">
            {file.name}
          </p>
          {!folder && file.mimeType && (
            <p className="text-[14px] text-text-secondary truncate font-medium">
              {formatDate(file.modifiedTime)} <span className="mx-1">•</span> {formatBytes(file.size)}
            </p>
          )}
          {folder && (
            <p className="text-[14px] text-text-secondary truncate font-medium">
              Folder
            </p>
          )}
        </div>

        {/* Right side indicator */}
        <div className="flex-shrink-0 flex items-center">
          {!isSelectMode && folder && (
            <ChevronRight size={20} className="text-text-tertiary" />
          )}
          {!isSelectMode && !folder && (
            <div className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center transition-colors">
              <div className="flex gap-[3px]">
                <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary" />
                <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary" />
                <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern thin separator */}
      {!isLast && (
        <div 
          className="absolute bottom-0 h-[1px] bg-surface-3 transition-all"
          style={{ 
            left: isSelectMode ? '70px' : '78px',
            right: 0 
          }} 
        />
      )}
    </motion.div>
  );
}
