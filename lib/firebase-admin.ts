/**
 * Firebase ADMIN SDK (Server Only)
 * ✅ Used ONLY in: app/api/*, server actions, server components
 * ❌ NEVER import in "use client" files
 */

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

export const adminDb = app ? admin.firestore() : null;
export const adminAuth = app ? admin.auth() : null;
export const adminStorage = app ? admin.storage() : null;

// Legacy aliases for backward compat with API routes
export const db = adminDb;
export const auth = adminAuth;
export const storage = adminStorage;

export default admin;