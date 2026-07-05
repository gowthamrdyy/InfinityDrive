// ============================================
// InfinityDrive — Floating Action Bar
// ============================================
// Appears at bottom when files are selected. Shows count + Transfer button.

'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Download } from 'lucide-react';

interface FloatingActionBarProps {
  selectedCount: number;
  onTransfer: () => void;
  onDeselectAll: () => void;
}

export function FloatingActionBar({
  selectedCount,
  onTransfer,
  onDeselectAll,
}: FloatingActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
          }}
          className="
            fixed bottom-8 left-1/2 -translate-x-1/2 z-40
            bg-[#2C2C2E]/90 backdrop-blur-2xl rounded-full
            pl-5 pr-2 py-2
            flex items-center gap-4
            shadow-2xl shadow-black/50 border border-white/[0.05]
          "
        >
          {/* Count */}
          <span className="text-[15px] font-medium text-white whitespace-nowrap tracking-tight">
            {selectedCount} Selected
          </span>

          {/* Transfer Button */}
          <button
            onClick={onTransfer}
            className="
              bg-accent hover:bg-accent-hover active:opacity-80
              text-white text-[15px] font-semibold
              rounded-full px-5 py-2.5
              flex items-center gap-2
              transition-all duration-200 cursor-pointer
            "
          >
            Transfer
            <Download size={16} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
