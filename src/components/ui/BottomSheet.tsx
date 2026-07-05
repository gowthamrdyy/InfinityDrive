// ============================================
// InfinityDrive — BottomSheet Component
// ============================================
// A sleek iOS-style animated bottom sheet for mobile interactions.

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 pb-safe pointer-events-none flex flex-col px-2 sm:px-4"
            style={{ maxHeight: 'calc(100svh - 40px)' }}
          >
            <div className="glass-panel mb-2 sm:mb-4 border border-surface-3 rounded-3xl shadow-2xl pointer-events-auto flex-1 flex flex-col min-h-0 overflow-hidden relative">
              
              {/* Inner ambient glow for the sheet */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-accent-glow rounded-full blur-[80px] pointer-events-none" />

              {/* Drag Handle & Header */}
              <div className="flex-shrink-0 pt-3 pb-2 px-4 flex flex-col items-center sticky top-0 bg-transparent z-10 border-b border-surface-3">
                <div className="w-12 h-1.5 bg-surface-3 rounded-full mb-3" />
                
                <div className="w-full flex items-center justify-between">
                  <div className="w-8" /> {/* Spacer for centering */}
                  <h3 className="text-[18px] font-bold text-text-primary">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-2 hover:bg-surface-3 transition-colors backdrop-blur-md"
                  >
                    <X size={18} className="text-text-primary" />
                  </button>
                </div>
              </div>

              {/* Content area - scrollable */}
              <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 relative z-10">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
