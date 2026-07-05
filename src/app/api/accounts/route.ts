// ============================================
// InfinityDrive — Linked Accounts API Route
// ============================================
// GET /api/accounts — List all linked secondary accounts
// Includes storage info and token validity status.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { decrypt } from '@/lib/encryption';
import { createDriveClientFromRefreshToken, getStorageQuota } from '@/lib/google-drive';
import type { LinkedAccountInfo } from '@/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const primaryEmail = session.user.email;
    const linkedAccountsRef = db.collection('users').doc(primaryEmail).collection('linkedAccounts');
    const snapshot = await linkedAccountsRef.get();

    if (snapshot.empty) {
      return NextResponse.json({ accounts: [] });
    }

    const accountsData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as any));

    // Map linked accounts and optionally refresh their storage info
    const accounts: LinkedAccountInfo[] = await Promise.all(
      accountsData.map(async (account: any) => {
        let storageUsed = account.storageUsed ? Number(account.storageUsed) : null;
        let storageLimit = account.storageLimit ? Number(account.storageLimit) : null;
        let status = account.status;

        // Try to fetch current storage info (and validate token)
        try {
          const refreshToken = decrypt(account.encryptedRefreshToken);
          const drive = createDriveClientFromRefreshToken(refreshToken);
          const { quota } = await getStorageQuota(drive);
          storageUsed = quota.usage;
          storageLimit = quota.limit;
          status = 'ACTIVE';

          // Update cached storage info in DB
          await linkedAccountsRef.doc(account.id).update({
            storageUsed: quota.usage,
            storageLimit: quota.limit,
            status: 'ACTIVE',
            updatedAt: new Date().toISOString(),
          });
        } catch {
          // Token is likely expired or revoked
          if (status === 'ACTIVE') {
            await linkedAccountsRef.doc(account.id).update({
              status: 'EXPIRED',
              updatedAt: new Date().toISOString(),
            });
            status = 'EXPIRED';
          }
        }

        return {
          id: account.id,
          email: account.email,
          status: status as 'ACTIVE' | 'EXPIRED',
          storageUsed,
          storageLimit,
          linkedAt: account.linkedAt || new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('[API] Failed to list accounts:', error);
    return NextResponse.json(
      { error: 'Failed to list linked accounts' },
      { status: 500 }
    );
  }
}
