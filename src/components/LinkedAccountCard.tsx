// ============================================
// InfinityDrive — Linked Account Card
// ============================================
// Shows a secondary account with storage info and status.

'use client';

import { motion } from 'motion/react';
import { Check, AlertTriangle, HardDrive } from 'lucide-react';
import { ProgressBar } from './ui/ProgressBar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { formatBytes, getStorageStatus, emailToColor } from '@/lib/utils';
import type { LinkedAccountInfo } from '@/types';

interface LinkedAccountCardProps {
  account: LinkedAccountInfo;
  selected: boolean;
  onSelect: () => void;
  onReverify: () => void;
}

export function LinkedAccountCard({
  account,
  selected,
  onSelect,
  onReverify,
}: LinkedAccountCardProps) {
  const isExpired = account.status === 'EXPIRED';
  const storage =
    account.storageUsed !== null && account.storageLimit !== null
      ? getStorageStatus(account.storageUsed, account.storageLimit)
      : null;

  const avatarColor = emailToColor(account.email);
  const initial = account.email.charAt(0).toUpperCase();

  return (
    <motion.button
      whileHover={isExpired ? undefined : { scale: 1.01 }}
      whileTap={isExpired ? undefined : { scale: 0.99 }}
      onClick={isExpired ? undefined : onSelect}
      disabled={isExpired}
      className={`
        w-full p-4 rounded-2xl text-left
        transition-all duration-200 cursor-pointer
        border
        ${
          selected
            ? 'bg-accent/[0.08] border-accent/30 shadow-lg shadow-accent/5'
            : isExpired
            ? 'bg-surface-2/50 border-white/[0.04] opacity-70 cursor-not-allowed'
            : 'bg-surface-2 border-white/[0.06] hover:border-white/[0.12]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${avatarColor}20`, color: avatarColor }}
        >
          <span className="text-sm font-semibold">{initial}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-medium text-text-primary truncate">
              {account.email}
            </p>
            {isExpired && (
              <Badge variant="warning">
                <AlertTriangle size={10} />
                Expired
              </Badge>
            )}
            {selected && (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Storage Bar */}
          {storage && account.storageUsed !== null && account.storageLimit !== null ? (
            <div className="mt-2">
              <ProgressBar
                percentage={storage.percentage}
                isWarning={storage.isWarning}
                isCritical={storage.isCritical}
                size="sm"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                  <HardDrive size={10} />
                  {formatBytes(account.storageUsed)} / {formatBytes(account.storageLimit)}
                </span>
                <span className="text-[11px] text-text-secondary font-medium">
                  {formatBytes(account.storageLimit - account.storageUsed)} free
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-tertiary mt-1">
              Storage info unavailable
            </p>
          )}
        </div>
      </div>

      {/* Re-verify button for expired accounts */}
      {isExpired && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <Button
            variant="outline"
            size="sm"
            icon={<AlertTriangle size={12} />}
            onClick={(e) => {
              e.stopPropagation();
              onReverify();
            }}
            className="w-full"
          >
            Re-verify Account
          </Button>
        </div>
      )}
    </motion.button>
  );
}
