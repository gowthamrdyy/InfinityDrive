// ============================================
// InfinityDrive — Remove Secondary Account API
// ============================================
// DELETE /api/accounts/remove?email=xxx
// Removes a linked secondary account from the user's profile.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase';

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const emailToRemove = searchParams.get('email');

    if (!emailToRemove) {
      return NextResponse.json({ error: 'Email to remove is required' }, { status: 400 });
    }

    const primaryEmail = session.user.email;
    const linkedAccountRef = db
      .collection('users')
      .doc(primaryEmail)
      .collection('linkedAccounts')
      .doc(emailToRemove);

    await linkedAccountRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Failed to remove account:', error);
    return NextResponse.json(
      { error: 'Failed to remove linked account' },
      { status: 500 }
    );
  }
}
