'use client';

import { useSession, signOut } from 'next-auth/react';
import { useQuota } from '@/hooks/useQuota';
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts';
import { StorageIndicator } from './StorageIndicator';
import { LogOut, User, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { formatBytes } from '@/lib/utils';

interface ProfileViewProps {
  onViewFiles?: (email: string) => void;
}

export function ProfileView({ onViewFiles }: ProfileViewProps = {}) {
  const { data: session } = useSession();
  const { quota, percentage, isWarning, isCritical, isLoading: quotaLoading } = useQuota();
  const { accounts, isLoading: accountsLoading, linkNewAccount, refreshAccounts } = useLinkedAccounts();

  const handleRemove = async (email: string) => {
    if (!confirm('Are you sure you want to remove this linked account?')) return;
    try {
      await fetch(`/api/accounts/remove?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
      refreshAccounts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Your Profile</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your storage and linked accounts.</p>
        </div>

        {/* Primary Account Card */}
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-16 h-16 rounded-full shadow-md object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <User size={32} />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-text-primary">{session?.user?.name || 'User'}</h2>
              <p className="text-sm text-text-secondary">{session?.user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider">
                Primary Account
              </span>
            </div>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-danger bg-danger/10 hover:bg-danger/20 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Storage Quota */}
        <div className="glass-panel p-6 rounded-3xl shadow-sm">
          <h3 className="text-md font-bold text-text-primary mb-4">Total Storage Usage</h3>
          
          {!quotaLoading && quota ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-text-primary">{formatBytes(quota.usage)} used</span>
                <span className="text-text-secondary">{formatBytes(quota.limit)} total</span>
              </div>
              
              <div className="h-3 w-full bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isCritical ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-accent'
                  }`}
                />
              </div>
              
              <p className="text-xs text-text-tertiary">
                This includes files across Google Drive, Gmail, and Google Photos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-3 w-full rounded-full" />
            </div>
          )}
        </div>

        {/* Linked Accounts */}
        <div className="glass-panel p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-text-primary">Linked Accounts</h3>
            <button
              onClick={linkNewAccount}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors text-sm font-medium shadow-sm shadow-accent/20"
            >
              <LinkIcon size={16} />
              Link New
            </button>
          </div>

          {!accountsLoading ? (
            accounts.length > 0 ? (
              <div className="space-y-3">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-0 border border-surface-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-text-primary">{acc.email}</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {acc.status === 'ACTIVE' 
                              ? `${formatBytes(acc.storageUsed)} used`
                              : 'Connection expired'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {acc.status === 'EXPIRED' && (
                          <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-lg">
                            <AlertCircle size={12} />
                            Needs Reconnect
                          </span>
                        )}
                        {acc.status === 'ACTIVE' && onViewFiles && (
                          <button
                            onClick={() => onViewFiles(acc.email)}
                            className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-primary text-xs font-medium transition-colors"
                          >
                            View Files
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(acc.email)}
                          className="px-3 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger text-xs font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LinkIcon size={24} className="text-text-tertiary" />
                </div>
                <p className="text-text-primary font-medium">No secondary accounts</p>
                <p className="text-sm text-text-secondary mt-1">Link an account to transfer files directly between drives.</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
