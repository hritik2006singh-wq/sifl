import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

function slugify(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email,
            password,
            name,
            phone,
            address,
            role,
            primaryLanguage,
            specializations
        } = body;

        if (!email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!adminAuth || !adminDb) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        // 1. Create Auth User
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // 2. Create Firestore Profile
        const userData = {
            email,
            role,
            status: "active",            // Requested
            accountStatus: "active",     // Compatibility
            name: name || "",
            phone: phone || "",
            address: address || "",
            primaryLanguage: primaryLanguage || "", // Requested
            languagesTaught: primaryLanguage || "", // Compatibility
            specializations: specializations || [],
            slug: `${slugify(name || "user")}-${userRecord.uid.slice(0, 4)}`,
            createdAt: new Date().toISOString(),
        };

        if (role === "admin") {
            await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
        }

        await adminDb.collection("users").doc(userRecord.uid).set(userData);

        return NextResponse.json({
            success: true,
            uid: userRecord.uid,
            userData
        });

    } catch (error: any) {
        console.error("Error creating staff:", error);
        return NextResponse.json({
            error: error.message || "Failed to create staff member"
        }, { status: 500 });
    }
}
