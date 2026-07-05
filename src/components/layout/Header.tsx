// ============================================
// InfinityDrive — Header Component
// ============================================
// Glassmorphic top bar with branding, storage indicator, and user profile.

'use client';

import { motion } from 'motion/react';
import { signOut, useSession } from 'next-auth/react';
import { Infinity as InfinityIcon, LogOut } from 'lucide-react';
import { StorageIndicator } from '../StorageIndicator';
import { useQuota } from '@/hooks/useQuota';

export function Header() {
  const { data: session } = useSession();
  const { quota, percentage, isWarning, isCritical, isLoading } = useQuota();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="
        sticky top-0 z-40
        glass rounded-none
        border-t-0 border-x-0 border-b border-white/[0.06]
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center justify-center w-12 h-12 cursor-pointer drop-shadow-sm mix-blend-multiply"
          >
            <img src="/logo-3d.png" alt="InfinityDrive Logo" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-600 tracking-tight hidden sm:block">
            InfinityDrive
          </h1>
        </div>

        {/* Center: Storage Indicator */}
        <div className="flex-1 flex justify-center px-4">
          {!isLoading && quota ? (
            <StorageIndicator
              usage={quota.usage}
              limit={quota.limit}
              percentage={percentage}
              isWarning={isWarning}
              isCritical={isCritical}
            />
          ) : (
            <div className="skeleton h-6 w-52 rounded-lg" />
          )}
        </div>

        {/* Right: User Profile */}
        <div className="flex items-center gap-3">
          {session?.user && (
            <>
              {/* User Info */}
              <div className="hidden sm:block text-right mr-2">
                <p className="text-[13px] font-medium text-text-primary leading-tight">
                  {session.user.name}
                </p>
                <p className="text-[11px] text-text-tertiary leading-tight">
                  {session.user.email}
                </p>
              </div>

              {/* Avatar */}
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-white/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-accent">
                    {session.user.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}

              {/* Sign Out */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="
                  p-2 rounded-xl text-text-tertiary
                  hover:text-text-primary hover:bg-white/5
                  transition-colors cursor-pointer
                "
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
