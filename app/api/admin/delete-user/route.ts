import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error("Firebase admin initialization error", error);
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const callerUid = decodedToken.uid;

        const db = admin.firestore();
        const callerDoc = await db.collection("users").doc(callerUid).get();

        if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden - Requires admin role" }, { status: 403 });
        }

        const { uid } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: "Missing uid" }, { status: 400 });
        }

        // Attempt to delete user from Firebase Auth
        await admin.auth().deleteUser(uid);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
