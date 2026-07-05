// ============================================
// InfinityDrive — Modal Component
// ============================================
// Glassmorphic modal with animated backdrop and entrance.

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`
              relative ${maxWidth} w-full
              bg-surface-1 rounded-3xl
              border border-white/[0.08]
              shadow-2xl shadow-black/50
              overflow-hidden
            `}
          >
            {/* Header */}
            {(title || subtitle) && (
              <div className="px-6 pt-6 pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    {title && (
                      <h2 className="text-xl font-semibold text-text-primary">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-text-secondary mt-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="
                      p-1.5 rounded-full
                      text-text-tertiary hover:text-text-primary
                      hover:bg-white/5 transition-colors cursor-pointer
                    "
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
