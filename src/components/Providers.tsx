// ============================================
// InfinityDrive — Session Provider Wrapper
// ============================================
// Client-side wrapper to provide NextAuth session context.

'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
