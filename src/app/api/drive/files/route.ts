// ============================================
// InfinityDrive — Drive Files API Route
// ============================================
// GET /api/drive/files?folderId=xxx
// Lists files from the primary account's Google Drive.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDriveClient, listFiles } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || undefined;
    const linkedAccountId = searchParams.get('linkedAccountId') || undefined;
    const combine = searchParams.get('combine') === 'true';

    let files: any[] = [];
    const { db } = await import('@/lib/firebase');
    const { decrypt } = await import('@/lib/encryption');
    const { createDriveClientFromRefreshToken } = await import('@/lib/google-drive');
    const { google } = await import('googleapis');

    if (combine) {
      // Fetch from PRIMARY account
      const primaryRefreshToken = (session as unknown as Record<string, unknown>).refreshToken as string;
      const primaryDrive = primaryRefreshToken 
        ? createDriveClientFromRefreshToken(primaryRefreshToken)
        : createDriveClient(accessToken);
      
      const fetchPromises: Promise<any[]>[] = [];
      
      // Add primary fetch promise
      fetchPromises.push(
        listFiles(primaryDrive, folderId).then(res => 
          res.map(f => ({ ...f, ownerEmail: session.user?.email }))
        ).catch(e => {
          console.error('[API] Failed to fetch primary files for combine:', e);
          return [];
        })
      );

      // Fetch all linked accounts
      const linkedSnap = await db.collection('users').doc(session.user?.email as string).collection('linkedAccounts').get();
      
      linkedSnap.forEach((doc) => {
        const linkedData = doc.data();
        if (linkedData.encryptedRefreshToken) {
          try {
            const refreshToken = decrypt(linkedData.encryptedRefreshToken);
            // We need a fresh auth client or just use our helper
            const drive = createDriveClientFromRefreshToken(refreshToken);
            
            fetchPromises.push(
              listFiles(drive, folderId).then(res => 
                res.map(f => ({ ...f, ownerEmail: linkedData.email }))
              ).catch(e => {
                console.error(`[API] Failed to fetch linked files for ${linkedData.email}:`, e);
                return [];
              })
            );
          } catch (err) {
            console.error(`[API] Error setting up client for ${linkedData.email}:`, err);
          }
        }
      });

      const results = await Promise.all(fetchPromises);
      const allFiles = results.flat();
      
      // Deduplicate files by id (since shared files might appear in multiple accounts)
      const uniqueFilesMap = new Map();
      allFiles.forEach(f => {
        if (!uniqueFilesMap.has(f.id)) {
          uniqueFilesMap.set(f.id, f);
        }
      });
      files = Array.from(uniqueFilesMap.values());
      
      // Sort combined files by modifiedTime descending
      files.sort((a, b) => {
        if (!a.modifiedTime) return 1;
        if (!b.modifiedTime) return -1;
        return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
      });

    } else if (linkedAccountId) {
      // Fetch files from ONE linked account
      const linkedRef = db.collection('users').doc(session.user?.email as string).collection('linkedAccounts').doc(linkedAccountId);
      const linkedSnap = await linkedRef.get();
      
      if (!linkedSnap.exists) {
        return NextResponse.json({ error: 'Linked account not found' }, { status: 404 });
      }

      const linkedData = linkedSnap.data()!;
      if (!linkedData.encryptedRefreshToken) {
        return NextResponse.json({ error: 'Linked account has no refresh token' }, { status: 400 });
      }

      const refreshToken = decrypt(linkedData.encryptedRefreshToken);
      const drive = createDriveClientFromRefreshToken(refreshToken);
      files = await listFiles(drive, folderId);
      files = files.map(f => ({ ...f, ownerEmail: linkedData.email }));

    } else {
      // Fetch from PRIMARY account only
      let drive;
      const refreshToken = (session as unknown as Record<string, unknown>).refreshToken as string;
      if (refreshToken) {
        drive = createDriveClientFromRefreshToken(refreshToken);
      } else {
        drive = createDriveClient(accessToken);
      }
      files = await listFiles(drive, folderId);
      files = files.map(f => ({ ...f, ownerEmail: session.user?.email as string }));
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error('[API] Failed to list files:', error);
    return NextResponse.json(
      { error: 'Failed to list files from Google Drive' },
      { status: 500 }
    );
  }
}
