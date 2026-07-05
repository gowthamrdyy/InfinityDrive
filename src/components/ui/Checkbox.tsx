// ============================================
// InfinityDrive — Checkbox Component
// ============================================
// Apple-style rounded checkbox with smooth animations.

'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, id, className = '' }: CheckboxProps) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`
        relative w-[18px] h-[18px] rounded-md
        border-2 transition-all duration-200 cursor-pointer
        flex items-center justify-center flex-shrink-0
        ${
          checked
            ? 'bg-accent border-accent'
            : 'bg-transparent border-white/20 hover:border-white/40'
        }
        ${className}
      `}
    >
      <motion.div
        initial={false}
        animate={{
          scale: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <Check size={12} strokeWidth={3} className="text-white" />
      </motion.div>
    </button>
  );
}
