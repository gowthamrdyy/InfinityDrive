'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, FileText, Image, Video, Music,
  Sheet, Presentation, Archive, FileCode, File, Check
} from 'lucide-react';
import { formatBytes, formatDate, getFileIconName, isFolder } from '@/lib/utils';
import type { DriveFile } from '@/types';

interface FileListItemProps {
  file: DriveFile;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onNavigate?: () => void;
  onClick: () => void;
  isSelectMode: boolean;
  index: number;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Folder, FileText, Image, Video, Music,
  Sheet, Presentation, Archive, FileCode, File,
};

export function FileListItem({ 
  file, 
  selected, 
  onSelect, 
  onNavigate, 
  onClick,
  isSelectMode, 
  index 
}: FileListItemProps) {
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
      onClick={handleClick}
      className={`
        flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 group
        ${selected && isSelectMode ? 'bg-accent/10 border-accent/20' : 'hover:bg-surface-2 border-transparent'}
        border
      `}
    >
      {/* Selection Checkbox */}
      <AnimatePresence>
        {isSelectMode && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 24, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 flex items-center justify-center mr-1"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(!selected);
            }}
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center border transition-colors
              ${selected 
                ? 'bg-accent border-accent text-white' 
                : 'bg-white border-black/20 text-transparent hover:bg-surface-2'}
            `}>
              <Check size={14} strokeWidth={3} className={selected ? 'opacity-100' : 'opacity-0'} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon / Thumbnail */}
      <div className={`
        relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center
        ${folder ? 'bg-surface-2' : 'bg-surface-2'}
      `}>
        {file.thumbnailLink ? (
          <img 
            src={file.thumbnailLink} 
            alt={file.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <IconComponent 
            size={24} 
            strokeWidth={folder ? 1.5 : 1}
            className={folder ? 'text-accent' : 'text-text-secondary'}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold text-text-primary leading-tight truncate">
          {file.name}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          {file.ownerEmail && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent truncate max-w-[120px]">
              {file.ownerEmail}
            </span>
          )}
          <p className="text-[13px] text-text-secondary truncate">
            {folder ? 'Folder' : formatBytes(file.size)}
          </p>
          {!folder && file.mimeType && (
            <>
              <span className="text-[10px] text-text-secondary/50">•</span>
              <p className="text-[13px] text-text-secondary truncate">
                {formatDate(file.modifiedTime)}
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
