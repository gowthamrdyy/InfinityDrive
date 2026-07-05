// ============================================
// InfinityDrive — Storage Indicator Component
// ============================================
// Animated storage bar showing used/total with color transitions.

'use client';

import { formatBytes } from '@/lib/utils';
import { ProgressBar } from './ui/ProgressBar';
import { HardDrive } from 'lucide-react';

interface StorageIndicatorProps {
  usage: number;
  limit: number;
  percentage: number;
  isWarning: boolean;
  isCritical: boolean;
}

export function StorageIndicator({
  usage,
  limit,
  percentage,
  isWarning,
  isCritical,
}: StorageIndicatorProps) {
  return (
    <div className="flex items-center gap-3 min-w-[220px]">
      <HardDrive
        size={16}
        className={`flex-shrink-0 ${
          isCritical
            ? 'text-red-400'
            : isWarning
            ? 'text-amber-400'
            : 'text-text-tertiary'
        }`}
      />
      <div className="flex-1 min-w-0">
        <ProgressBar
          percentage={percentage}
          isWarning={isWarning}
          isCritical={isCritical}
          size="sm"
        />
        <p className="text-[11px] text-text-tertiary mt-1">
          <span
            className={`font-medium ${
              isCritical
                ? 'text-red-400'
                : isWarning
                ? 'text-amber-400'
                : 'text-text-secondary'
            }`}
          >
            {formatBytes(usage)}
          </span>
          {' / '}
          {formatBytes(limit)} used
        </p>
      </div>
    </div>
  );
}
