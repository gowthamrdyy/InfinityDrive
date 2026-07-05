// ============================================
// InfinityDrive — Drive Quota API Route
// ============================================
// GET /api/drive/quota
// Returns storage quota and user info from the primary account.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDriveClient, getStorageQuota } from '@/lib/google-drive';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = (session as unknown as Record<string, unknown>).accessToken as string;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token. Please re-authenticate.' },
        { status: 401 }
      );
    }

    let drive;
    const refreshToken = (session as unknown as Record<string, unknown>).refreshToken as string;
    if (refreshToken) {
      const { createDriveClientFromRefreshToken } = await import('@/lib/google-drive');
      drive = createDriveClientFromRefreshToken(refreshToken);
    } else {
      drive = createDriveClient(accessToken);
    }
    const { quota, user } = await getStorageQuota(drive);

    return NextResponse.json({ quota, user });
  } catch (error) {
    console.error('[API] Failed to get quota:', error);
    return NextResponse.json(
      { error: 'Failed to get storage quota' },
      { status: 500 }
    );
  }
}
