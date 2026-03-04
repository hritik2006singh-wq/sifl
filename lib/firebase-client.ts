/**
 * Firebase CLIENT SDK
 * ✅ Safe to import in any "use client" file or browser context
 * ❌ Never import firebase-admin here
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// During build time on Vercel/Local, NEXT_PUBLIC_ vars might be missing.
// Firebase SDK throws if apiKey is missing or clearly invalid.
// We use a dummy key to prevent build-time crashes during static generation.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIza-BUILD-MOCK-KEY-ALLOW-BUILD",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Prevent duplicate initialization during hot reload
// If an app is already initialized, use it. Otherwise, init with config.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export { firebaseConfig };
export default app;
