// ============================================
// InfinityDrive — NextAuth Configuration
// ============================================
// Handles primary account login via Google OAuth.
// Persists access + refresh tokens in JWT for Drive API access.
// Creates/updates User record in Firestore on sign-in.

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from './firebase';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request offline access to get refresh_token
          access_type: 'offline',
          // Always show account chooser and force consent to get refresh_token
          prompt: 'consent select_account',
          // Required scopes for Drive file management
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/drive',
          ].join(' '),
        },
      },
    }),
  ],

  // Use JWT strategy (no database session — we manage our own User table)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    /**
     * SignIn callback: Prevent linked accounts from logging in as primary
     */
    async signIn({ user, account, profile }) {
      if (profile?.email) {
        try {
          // Query across all users to see if this email is registered as a linked account
          const linkedQuery = await db.collectionGroup('linkedAccounts').where('email', '==', profile.email).get();
          if (!linkedQuery.empty) {
            // This is a linked account! Find the primary account.
            const primaryEmail = linkedQuery.docs[0].ref.parent.parent?.id;
            if (primaryEmail) {
              // Reject sign-in and redirect to home with error
              return `/?error=is_linked&primary=${encodeURIComponent(primaryEmail)}`;
            }
          }
        } catch (error) {
          console.error('[Auth] Failed to query linked accounts during sign in:', error);
          // If the query fails (e.g. missing collection group index), just allow sign in
          return true;
        }
      }
      return true;
    },

    /**
     * JWT callback: Persist OAuth tokens in the JWT.
     * Called on sign-in and on every session check.
     */
    async jwt({ token, account, profile }) {
      // On initial sign-in, capture the OAuth tokens
      if (account && profile && profile.email) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture as string | undefined;

        // Upsert user in Firestore
        try {
          const userRef = db.collection('users').doc(profile.email);
          const updateData: Record<string, any> = {
            primaryEmail: profile.email,
            name: profile.name || null,
            image: (profile.picture as string) || null,
            accessToken: account.access_token || null,
            updatedAt: new Date().toISOString(),
          };
          
          if (account.refresh_token) {
            updateData.refreshToken = account.refresh_token;
          }

          // Use set with merge: true for upsert behavior
          await userRef.set(updateData, { merge: true });
        } catch (error) {
          console.error('[Auth] Failed to upsert user in Firestore:', error);
        }
      }

      return token;
    },

    /**
     * Session callback: Expose necessary info to the client.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      // Attach tokens to session (server-side only, won't be sent to client)
      (session as unknown as Record<string, unknown>).accessToken = token.accessToken;
      (session as unknown as Record<string, unknown>).refreshToken = token.refreshToken;
      return session;
    },
  },

  pages: {
    signIn: '/',
  },
});
