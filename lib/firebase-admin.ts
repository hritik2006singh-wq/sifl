import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        }
    } catch (error) {
        console.log('Firebase admin initialization error', error);
    }
}

// Fallback to avoid build crashing if env is missing during static phase
const app = admin.apps.length ? admin.app() : null;
const db = app ? admin.firestore() : null as unknown as admin.firestore.Firestore;
const auth = app ? admin.auth() : null as unknown as admin.auth.Auth;
const storage = app ? admin.storage() : null as unknown as admin.storage.Storage;

export { db, auth, storage, admin };
