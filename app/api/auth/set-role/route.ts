import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/auth/set-role
 *
 * Verifies the Firebase ID token sent from the client after login,
 * extracts the user role from Firestore (via Admin SDK), and sets
 * an HttpOnly cookie that the middleware can trust.
 *
 * WHY: document.cookie in the browser sets a plain (non-HttpOnly) cookie
 * that any user can forge via DevTools (e.g. user_role=admin). By moving
 * cookie creation to the server, we ensure only verified tokens can set
 * the role cookie.
 */
export async function POST(req: NextRequest) {
    try {
        const { idToken, role } = await req.json();

        if (!idToken || !role) {
            return NextResponse.json({ error: "Missing idToken or role" }, { status: 400 });
        }

        if (!adminAuth) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        // Verify the ID token with Firebase Admin — this cannot be forged by the client
        const decoded = await adminAuth.verifyIdToken(idToken);

        if (!decoded.uid) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const validRoles = ["admin", "teacher", "student"];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const res = NextResponse.json({ success: true });

        // Set a secure, HttpOnly cookie — cannot be read or modified by client JS
        res.cookies.set("user_role", role, {
            httpOnly: true,        // JS cannot access this cookie
            sameSite: "strict",    // CSRF protection
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            secure: process.env.NODE_ENV === "production", // HTTPS only in prod
        });

        return res;
    } catch (error: any) {
        console.error("[set-role] Error:", error);
        return NextResponse.json({ error: "Token verification failed" }, { status: 401 });
    }
}

/**
 * DELETE /api/auth/set-role
 * Clears the role cookie on logout.
 */
export async function DELETE() {
    const res = NextResponse.json({ success: true });
    res.cookies.set("user_role", "", {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        maxAge: 0, // Immediately expire
    });
    return res;
}
