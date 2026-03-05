import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { CreateStudentRequest } from "@/types/student";

export async function POST(req: NextRequest) {
    try {
        // 1. Validate body
        const body = (await req.json()) as Partial<CreateStudentRequest> & { password?: string };

        // Strict validation
        if (
            !body.name ||
            !body.email ||
            !body.studentId ||
            !body.dob ||
            !body.gender ||
            !body.language ||
            !body.level ||
            !body.status
        ) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!adminAuth || !adminDb) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        // Default object structures
        const address = body.address ?? { street: "", city: "", state: "", country: "" };
        const emergencyContact = body.emergencyContact ?? { name: "", relation: "", phone: "" };
        const teacherId = body.teacherId ?? "";
        const phone = body.phone ?? "";

        // 2. Create Firebase Auth user so the student can log in
        // Use provided password or fall back to a temporary one (admin should reset it)
        const tempPassword = body.password || `SIFL${body.studentId}!`;

        let userRecord;
        try {
            userRecord = await adminAuth.createUser({
                email: body.email,
                password: tempPassword,
                displayName: body.name,
            });
        } catch (authError: any) {
            // Handle duplicate email gracefully
            if (authError.code === "auth/email-already-exists") {
                return NextResponse.json({ error: "A student with this email already exists." }, { status: 409 });
            }
            throw authError;
        }

        const id = userRecord.uid; // Use Auth UID as document ID for consistency

        // 3. Prepare data mappings
        const userData = {
            name: body.name,
            email: body.email,
            role: "student",
            status: "active",
            dob: body.dob,
            gender: body.gender,
            phone: phone,
            address,
            emergencyContact,
            createdAt: new Date().toISOString(),
        };

        const studentData = {
            studentId: body.studentId,
            language: body.language,
            level: body.level,
            teacherId,
            status: body.status,
            createdAt: new Date().toISOString(),
        };

        // 4. Write both Firestore documents
        await adminDb.collection("users").doc(id).set(userData);
        await adminDb.collection("students").doc(id).set(studentData);

        // 5. Response
        return NextResponse.json({ success: true, id, tempPassword });
    } catch (error: any) {
        console.error("Failed to execute create-student pipeline:", error);
        return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
    }
}
