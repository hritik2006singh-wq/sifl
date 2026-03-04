import "server-only";

import * as admin from "firebase-admin";

/**
 * Prevent Firebase Admin from initializing multiple times
 * during hot reload or serverless function reuse.
 */
function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin env variables missing.");
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const app = initFirebaseAdmin();

export const db = app ? admin.firestore() : null;
export const auth = app ? admin.auth() : null;
export const storage = app ? admin.storage() : null;

export default admin;