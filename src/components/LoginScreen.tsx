// ============================================
// InfinityDrive — Login Screen
// ============================================
// Full-screen centered login with animated gradient background,
// glassmorphic card, and Google sign-in button.

'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { signIn } from 'next-auth/react';
import { Infinity as InfinityIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { ScrollTiltedGrid } from './ui/scroll-tilted-grid';

export function LoginScreen() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const primaryEmail = searchParams.get('primary');
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Scroll Tilted Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-surface-0/80 backdrop-blur-[2px] z-10" />
        <div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar">
          <ScrollTiltedGrid loop maxBlur={4} maxTilt={60} />
        </div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="glass-panel rounded-3xl p-8 text-center shadow-sm">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex justify-center"
          >
            <div className="w-20 h-20">
              <img src="/logo-3d.png" alt="InfinityDrive Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              InfinityDrive
            </h1>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Break free from storage limits.
              <br />
              Transfer files between Google accounts seamlessly.
            </p>
          </motion.div>

          {/* Divider */}
          <div className="my-6 border-t border-white/[0.06]" />

          {error === 'is_linked' && primaryEmail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-3"
            >
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-text-primary leading-snug">
                This account is linked as a secondary drive. Please sign in with your primary account: 
                <br />
                <span className="font-bold text-amber-500 mt-1 inline-block">{primaryEmail}</span>
              </p>
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="
              w-full h-12 rounded-2xl
              bg-white text-[#1f1f1f] font-medium text-[15px]
              flex items-center justify-center gap-3
              hover:bg-gray-100 transition-colors
              shadow-lg shadow-black/20
              cursor-pointer
            "
          >
            {/* Google Logo */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
            <ArrowRight size={16} className="opacity-40" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6 flex flex-col items-center gap-2"
          >
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              Sign in with your primary Google account.
              <br />
              You&apos;ll link secondary accounts next.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-text-tertiary/70 mt-2">
              <a href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</a>
              <span>&bull;</span>
              <a href="/terms" className="hover:text-accent transition-colors">Terms of Service</a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
