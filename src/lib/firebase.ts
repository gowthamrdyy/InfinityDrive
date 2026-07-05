// ============================================
// InfinityDrive — Firebase Admin SDK Initialization
// ============================================

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';


if (!getApps().length) {
  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newline characters and potential double quotes from Vercel env vars
          privateKey: process.env.FIREBASE_PRIVATE_KEY
            ?.replace(/\\n/g, '\n')
            ?.replace(/^"|"$/g, '')
            ?.replace(/^'|'$/g, ''),
        }),
      });
      console.log('[Firebase] Admin SDK initialized successfully.');
    } catch (error) {
      console.error('[Firebase] Failed to initialize Admin SDK:', error);
    }
  } else {
    console.warn('[Firebase] Missing FIREBASE_PROJECT_ID, skipping initialization (expected during build).');
  }
}

// Export safe instances that won't crash at build time
// Pass the named database 'infinitydrive' since the (default) database was not created
export const db = getApps().length ? getFirestore(getApps()[0], 'infinitydrive') : ({} as FirebaseFirestore.Firestore);


