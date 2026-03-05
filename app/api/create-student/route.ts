import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { CreateStudentRequest } from "@/types/student";

export async function POST(req: NextRequest) {
    try {
        // 1. Validate body
        const body = (await req.json()) as Partial<CreateStudentRequest>;

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

        // Default object structures
        const address = body.address ?? { street: "", city: "", state: "", country: "" };
        const emergencyContact = body.emergencyContact ?? { name: "", relation: "", phone: "" };
        const teacherId = body.teacherId ?? "";
        const phone = body.phone ?? "";

        // 2. Generate UUID
        const id = crypto.randomUUID();

        // 3. Prepare data mappings
        const userData = {
            name: body.name,
            email: body.email,
            dob: body.dob,
            gender: body.gender,
            phone: phone,
            address,
            emergencyContact,
        };

        const studentData = {
            studentId: body.studentId, // Custom ID field requested
            language: body.language,
            level: body.level,
            teacherId,
            status: body.status,
            createdAt: new Date().toISOString(),
        };

        // 4. Firestore Write Logic (Wrap in try/catch)
        // adminDb from Firebase Admin is the robust way to handle backend writes freely
        if (!adminDb) {
            throw new Error("Firestore Admin SDK not initialized");
        }

        await adminDb.collection("users").doc(id).set(userData);
        await adminDb.collection("students").doc(id).set(studentData);

        // 5. Response Handling
        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error("Failed to execute create-student pipeline:", error);
        return NextResponse.json({ error: error.message || "Invalid data" }, { status: 400 });
    }
}
