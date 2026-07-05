// ============================================
// InfinityDrive — Transfer Modal
// ============================================
// Modal for selecting destination account and confirming transfer.
// Shows linked accounts, add-new button, and confirmation state.

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Info, CheckCircle, XCircle,
  ArrowRightLeft, Loader2, Zap,
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { LinkedAccountCard } from './LinkedAccountCard';
import type { LinkedAccountInfo, TransferState, TransferResponse } from '@/types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFileCount: number;
  accounts: LinkedAccountInfo[];
  accountsLoading: boolean;
  transferState: TransferState;
  transferResults: TransferResponse | null;
  transferError: string | null;
  onTransfer: (linkedAccountId: string) => void;
  onLinkNew: () => void;
  onReverify: () => void;
  onReset: () => void;
}

export function TransferModal({
  isOpen,
  onClose,
  selectedFileCount,
  accounts,
  accountsLoading,
  transferState,
  transferResults,
  transferError,
  onTransfer,
  onLinkNew,
  onReverify,
  onReset,
}: TransferModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleClose = () => {
    setSelectedAccountId(null);
    setConfirming(false);
    onReset();
    onClose();
  };

  const handleConfirm = () => {
    if (selectedAccountId) {
      onTransfer(selectedAccountId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        transferState === 'success'
          ? 'Transfer Complete'
          : transferState === 'error'
          ? 'Transfer Failed'
          : transferState === 'transferring'
          ? 'Transferring...'
          : 'Transfer Files'
      }
      subtitle={
        transferState === 'idle' || transferState === 'confirming'
          ? `${selectedFileCount} file${selectedFileCount !== 1 ? 's' : ''} selected — choose a destination`
          : undefined
      }
      maxWidth="max-w-md"
    >
      <AnimatePresence mode="wait">
        {/* ---- IDLE / CONFIRMING: Account Selection ---- */}
        {(transferState === 'idle' || transferState === 'confirming') && !confirming && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Account List */}
            <div className="space-y-2 mt-4 max-h-[280px] overflow-y-auto">
              {accountsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="skeleton h-24 rounded-2xl" />
                  ))}
                </div>
              ) : accounts.length > 0 ? (
                accounts.map((account) => (
                  <LinkedAccountCard
                    key={account.id}
                    account={account}
                    selected={selectedAccountId === account.id}
                    onSelect={() => setSelectedAccountId(account.id)}
                    onReverify={onReverify}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-text-secondary">
                    No secondary accounts linked yet
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Add a Google account to transfer files to
                  </p>
                </div>
              )}
            </div>

            {/* Add New Account Button */}
            <button
              onClick={onLinkNew}
              className="
                w-full mt-3 p-3 rounded-2xl
                border-2 border-dashed border-white/[0.08]
                hover:border-accent/30 hover:bg-accent/[0.03]
                transition-all duration-200 cursor-pointer
                flex items-center justify-center gap-2
                text-[13px] text-text-secondary hover:text-accent
              "
            >
              <Plus size={16} />
              Add New Destination Account
            </button>

            {/* Server-to-server Info Banner */}
            <div className="flex items-start gap-2.5 mt-4 p-3 rounded-xl bg-accent/[0.05] border border-accent/10">
              <Zap size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Transferring <span className="text-text-primary font-medium">server-to-server</span>.
                No local data or internet bandwidth will be used.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-5">
              <Button
                variant="ghost"
                size="md"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!selectedAccountId}
                onClick={() => setConfirming(true)}
                icon={<ArrowRightLeft size={16} />}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* ---- CONFIRMATION STEP ---- */}
        {confirming && transferState !== 'transferring' && transferState !== 'success' && transferState !== 'error' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-4"
          >
            <div className="p-4 rounded-2xl bg-surface-2 border border-white/[0.06]">
              <p className="text-[14px] text-text-primary font-medium mb-2">
                Confirm Transfer
              </p>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {selectedFileCount} file{selectedFileCount !== 1 ? 's' : ''} will be
                transferred to{' '}
                <span className="text-text-primary font-medium">
                  {accounts.find((a) => a.id === selectedAccountId)?.email}
                </span>
                .
              </p>
              <p className="text-[12px] text-text-tertiary mt-2">
                • Files will be copied to the destination account
                <br />
                • Originals will be deleted from your primary Drive
                <br />
                • This action cannot be undone
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setConfirming(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirm}
                icon={<ArrowRightLeft size={16} />}
                className="flex-1"
              >
                Confirm Transfer
              </Button>
            </div>
          </motion.div>
        )}

        {/* ---- TRANSFERRING ---- */}
        {transferState === 'transferring' && (
          <motion.div
            key="transferring"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={40} className="text-accent" />
            </motion.div>
            <p className="text-[15px] text-text-primary font-medium mt-4">
              Transferring files...
            </p>
            <p className="text-[13px] text-text-secondary mt-1">
              Server-to-server transfer in progress
            </p>
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-accent/[0.06]">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] text-accent">
                Processing {selectedFileCount} file{selectedFileCount !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}

        {/* ---- SUCCESS ---- */}
        {transferState === 'success' && transferResults && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={48} className="text-green-400" />
            </motion.div>
            <p className="text-[16px] text-text-primary font-semibold mt-4">
              Transfer Complete!
            </p>
            <p className="text-[13px] text-text-secondary mt-1">
              {transferResults.totalTransferred} file{transferResults.totalTransferred !== 1 ? 's' : ''} transferred successfully
              {transferResults.totalFailed > 0 && (
                <span className="text-amber-400">
                  , {transferResults.totalFailed} failed
                </span>
              )}
            </p>

            <Button
              variant="secondary"
              size="md"
              onClick={handleClose}
              className="mt-6"
            >
              Done
            </Button>
          </motion.div>
        )}

        {/* ---- ERROR ---- */}
        {transferState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6"
          >
            <XCircle size={48} className="text-red-400" />
            <p className="text-[16px] text-text-primary font-semibold mt-4">
              Transfer Failed
            </p>
            <p className="text-[13px] text-text-secondary mt-1 text-center max-w-[280px]">
              {transferError || 'An unexpected error occurred. Please try again.'}
            </p>

            {transferResults && transferResults.totalTransferred > 0 && (
              <p className="text-[12px] text-amber-400 mt-2">
                {transferResults.totalTransferred} file{transferResults.totalTransferred !== 1 ? 's' : ''} were
                transferred before the error.
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" size="md" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onReset();
                  setConfirming(false);
                }}
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
