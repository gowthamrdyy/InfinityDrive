// ============================================
// InfinityDrive — Transfer API Route
// ============================================
// POST /api/transfer
// Executes the Share→Copy→Delete pipeline for selected files.
// Accepts { fileIds: string[], linkedAccountId: string }

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { decrypt } from '@/lib/encryption';
import { createDriveClient, createDriveClientFromRefreshToken } from '@/lib/google-drive';
import { executeTransfer } from '@/lib/transfer-engine';
import type { TransferRequest, TransferResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: TransferRequest = await request.json();
    const { fileIds, linkedAccountId } = body;

    if (!fileIds?.length || !linkedAccountId) {
      return NextResponse.json(
        { error: 'fileIds (array) and linkedAccountId are required' },
        { status: 400 }
      );
    }

    // Get primary user and access token
    const accessToken = (session as unknown as Record<string, unknown>).accessToken as string;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Primary account access token missing. Re-authenticate.' },
        { status: 401 }
      );
    }

    const primaryEmail = session.user.email;
    const userRef = db.collection('users').doc(primaryEmail);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const linkedAccountRef = userRef.collection('linkedAccounts').doc(linkedAccountId);
    const linkedAccountSnap = await linkedAccountRef.get();

    if (!linkedAccountSnap.exists) {
      return NextResponse.json(
        { error: 'Linked account not found' },
        { status: 404 }
      );
    }

    const linkedAccount = linkedAccountSnap.data()!;

    if (linkedAccount.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Secondary account token expired. Please re-verify.' },
        { status: 401 }
      );
    }

    // Decrypt the secondary account's refresh token
    let secondaryRefreshToken: string;
    try {
      secondaryRefreshToken = decrypt(linkedAccount.encryptedRefreshToken);
    } catch {
      return NextResponse.json(
        { error: 'Failed to decrypt secondary account token' },
        { status: 500 }
      );
    }

    // Initialize both Drive clients
    let primaryDrive;
    const refreshToken = (session as unknown as Record<string, unknown>).refreshToken as string;
    if (refreshToken) {
      primaryDrive = createDriveClientFromRefreshToken(refreshToken);
    } else {
      primaryDrive = createDriveClient(accessToken);
    }
    const secondaryDrive = createDriveClientFromRefreshToken(secondaryRefreshToken);

    const transferLogsRef = userRef.collection('transferLogs');

    // Create transfer log entries
    for (const fileId of fileIds) {
      // Use linkedAccountId and fileId to create a predictable document ID
      const docId = `${linkedAccountId}_${fileId}`;
      await transferLogsRef.doc(docId).set({
        linkedAccountId,
        fileName: fileId, // Will be updated with actual names during transfer
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });
    }

    // Execute the transfer pipeline
    console.log(
      `[Transfer] Starting transfer of ${fileIds.length} file(s) to ${linkedAccount.email}`
    );

    const results = await executeTransfer({
      primaryDrive,
      secondaryDrive,
      secondaryEmail: linkedAccount.email,
      fileIds,
    });

    // Update transfer logs with results
    for (const result of results) {
      const docId = `${linkedAccountId}_${result.fileId}`;
      await transferLogsRef.doc(docId).update({
        fileName: result.fileName,
        status: result.status,
        error: result.error || null,
        completedAt: new Date().toISOString(),
      });
    }

    const response: TransferResponse = {
      success: results.every((r) => r.status === 'SUCCESS'),
      results,
      totalTransferred: results.filter((r) => r.status === 'SUCCESS').length,
      totalFailed: results.filter((r) => r.status === 'FAILED').length,
    };

    console.log(
      `[Transfer] Complete: ${response.totalTransferred} succeeded, ${response.totalFailed} failed`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Transfer failed:', error);

    // Check for auth errors specifically
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('invalid_grant') || errorMsg.includes('Token has been expired')) {
      return NextResponse.json(
        { error: 'Authentication expired. Please re-verify the secondary account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Transfer failed: ' + errorMsg },
      { status: 500 }
    );
  }
}
