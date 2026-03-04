import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        if (!adminAuth || !adminDb) {
            return NextResponse.json({ error: "Server not configured" }, { status: 503 });
        }

        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const callerUid = decodedToken.uid;

        const callerDoc = await adminDb.collection("users").doc(callerUid).get();

        if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden - Requires admin role" }, { status: 403 });
        }

        const { uid } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: "Missing uid" }, { status: 400 });
        }

        // Delete user from Firebase Auth
        await adminAuth.deleteUser(uid);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
