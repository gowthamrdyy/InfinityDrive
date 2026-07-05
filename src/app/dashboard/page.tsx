// ============================================
// InfinityDrive — Dashboard Page (Server Component)
// ============================================
// Checks authentication then renders the client-side dashboard.

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  return <DashboardClient />;
}
