"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Next.js requires direct access to process.env.NEXT_PUBLIC_* for static replacement during build.
// Dynamic indexing like process.env[name] evaluates to undefined on the client.
function requireEnv(name: string, value: string | undefined) {
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

console.log("Firebase key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API key missing. Check .env.local");
}

// Ensure Firebase is only initialized once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export { firebaseConfig };
export default app;
