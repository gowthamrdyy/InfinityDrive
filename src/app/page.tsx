// ============================================
// InfinityDrive — Login Page
// ============================================
// Landing page that shows LoginScreen or redirects to dashboard.

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginScreen } from '@/components/LoginScreen';

export default async function HomePage() {
  const session = await auth();

  // If already authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
