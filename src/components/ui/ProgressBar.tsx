// ============================================
// InfinityDrive — ProgressBar Component
// ============================================
// Animated progress bar with color transitions based on fill level.

'use client';

import { motion } from 'motion/react';

interface ProgressBarProps {
  percentage: number;
  isWarning?: boolean;
  isCritical?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  percentage,
  isWarning = false,
  isCritical = false,
  size = 'md',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const heights: Record<string, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Dynamic gradient based on fill level
  const getGradient = () => {
    if (isCritical) {
      return 'from-red-500 to-red-400';
    }
    if (isWarning) {
      return 'from-amber-500 to-orange-400';
    }
    return 'from-accent to-blue-400';
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-secondary">{label}</span>
          <span
            className={`text-xs font-medium ${
              isCritical
                ? 'text-red-400'
                : isWarning
                ? 'text-amber-400'
                : 'text-text-secondary'
            }`}
          >
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div
        className={`
          w-full ${heights[size]} rounded-full
          bg-surface-3 overflow-hidden
        `}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2,
          }}
          className={`
            h-full rounded-full
            bg-gradient-to-r ${getGradient()}
            ${isCritical ? 'shadow-[0_0_12px_rgba(255,69,58,0.4)]' : ''}
          `}
        />
      </div>
    </div>
  );
}
