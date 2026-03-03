import * as admin from "firebase-admin";

// Singleton: prevent re-initialization on hot reload
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } else {
        console.warn(
            "[firebaseAdmin] Missing env vars: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY"
        );
    }
}

const adminDb = admin.apps.length
    ? admin.firestore()
    : (null as unknown as admin.firestore.Firestore);

export { adminDb };
