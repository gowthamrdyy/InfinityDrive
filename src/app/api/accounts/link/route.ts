// ============================================
// InfinityDrive — Link Secondary Account API
// ============================================
// GET /api/accounts/link — Returns OAuth URL for linking a new secondary account
// GET /api/accounts/link?code=xxx — Callback: exchanges code for tokens, stores encrypted

import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { encrypt } from '@/lib/encryption';
import { google } from 'googleapis';

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive',
];

function getOAuth2Client(redirectUri: string): OAuth2Client {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const redirectUri = `${request.nextUrl.origin}/api/accounts/link`;

    if (!code) {
      // Step 1: Generate OAuth URL for linking
      const oauth2Client = getOAuth2Client(redirectUri);
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent', // Force consent to guarantee refresh_token
        state: session.user.email, // Pass primary email for callback context
      });

      return NextResponse.json({ authUrl });
    }

    // Step 2: Handle the OAuth callback — exchange code for tokens
    const state = searchParams.get('state'); // primary email
    const oauth2Client = getOAuth2Client(redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_refresh_token', request.url)
      );
    }

    // Get the secondary account's email
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const secondaryEmail = userInfo.data.email!;

    // Find the primary user (in Firestore, the document ID is the email)
    const primaryEmail = state || session.user.email;
    const userRef = db.collection('users').doc(primaryEmail);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      // Auto-create the primary user document if it's missing (can happen if DB was created after login)
      await userRef.set({
        primaryEmail,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    // Prevent linking the same account as primary
    if (secondaryEmail === primaryEmail) {
      return NextResponse.redirect(
        new URL('/dashboard?error=same_account', request.url)
      );
    }

    // Encrypt the refresh token before storage
    const encryptedToken = encrypt(tokens.refresh_token);

    // Upsert the linked account in Firestore subcollection
    const linkedAccountRef = userRef.collection('linkedAccounts').doc(secondaryEmail);
    await linkedAccountRef.set({
      id: secondaryEmail, // using email as ID
      email: secondaryEmail,
      encryptedRefreshToken: encryptedToken,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Redirect back to dashboard
    return NextResponse.redirect(
      new URL('/dashboard?linked=true', request.url)
    );
  } catch (error) {
    console.error('[API] Account linking failed:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=link_failed', request.url)
    );
  }
}
