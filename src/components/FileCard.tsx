'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, FileText, Image, Video, Music,
  Sheet, Presentation, Archive, FileCode, File, Check
} from 'lucide-react';
import { formatBytes, formatDate, getFileIconName, isFolder } from '@/lib/utils';
import type { DriveFile } from '@/types';

interface FileCardProps {
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

export function FileCard({ 
  file, 
  selected, 
  onSelect, 
  onNavigate, 
  onClick,
  isSelectMode, 
  index 
}: FileCardProps) {
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3 group relative cursor-pointer"
      onClick={handleClick}
    >
      {/* Top Media Area (The "Property Image") */}
      <div className={`
        relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center
        transition-all duration-300
        ${folder ? 'bg-surface-1' : 'bg-surface-2'}
        ${selected && isSelectMode ? 'ring-2 ring-accent ring-offset-2' : ''}
      `}>
        {/* Heart / Checkbox Action Button (Top Right) */}
        <AnimatePresence>
          {isSelectMode && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 right-3 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(!selected);
              }}
            >
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center border transition-colors
                ${selected 
                  ? 'bg-accent border-accent text-white' 
                  : 'bg-white/80 backdrop-blur-md border-black/10 text-transparent hover:bg-white'}
              `}>
                <Check size={16} strokeWidth={3} className={selected ? 'opacity-100' : 'opacity-0'} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Large Centered Icon or Thumbnail */}
        {file.thumbnailLink ? (
          <img 
            src={file.thumbnailLink} 
            alt={file.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <IconComponent 
            size={48} 
            strokeWidth={folder ? 1.5 : 1}
            className={`
              transition-transform duration-300 group-hover:scale-110
              ${folder ? 'text-accent' : 'text-text-secondary'}
            `} 
          />
        )}
      </div>

      {/* Info Area */}
      <div className="flex flex-col px-1">
        {file.ownerEmail && (
          <div className="mb-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent truncate max-w-full">
              {file.ownerEmail}
            </span>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-text-primary leading-tight truncate">
            {file.name}
          </h3>
        </div>
        
        <p className="text-[15px] text-text-secondary truncate mt-0.5">
          {folder ? 'Folder' : `${formatBytes(file.size)}`}
        </p>
        
        {!folder && file.mimeType && (
          <p className="text-[15px] text-text-secondary truncate">
            {formatDate(file.modifiedTime)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
