import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function slugify(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, name, languageTrack, level, dob, isPaid, hasFullAccess } = body;

        if (!adminAuth || !adminDb) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Firebase Auth user
        let userRecord;
        try {
            userRecord = await adminAuth.createUser({
                email,
                password,
                displayName: name,
            });
        } catch (authError: any) {
            if (authError.code === 'auth/email-already-exists') {
                return NextResponse.json({ error: 'A student with this email already exists.' }, { status: 409 });
            }
            throw authError;
        }

        const uid = userRecord.uid;
        const slug = `${slugify(name)}-${uid.slice(0, 4)}`;

        // 2. users/{uid} — identity + auth fields
        await adminDb.collection('users').doc(uid).set({
            uid,
            email,
            name,
            dob: dob || null,
            role: 'student',
            accountStatus: 'active',
            slug,
            createdAt: FieldValue.serverTimestamp(),
        });

        // 3. students/{uid} — LMS fields + denormalized identity fields
        //    Denormalizing name / email / dob here means the list page can read
        //    everything it needs from a SINGLE getDocs(students) query with no joins.
        await adminDb.collection('students').doc(uid).set({
            uid,
            // ── Denormalized identity (copied from users) ──────────────────────
            name,
            email,
            dob: dob || null,      // used to compute age on the frontend
            slug,
            // ── LMS-specific fields ────────────────────────────────────────────
            language: languageTrack || '',
            currentLevel: level || '',
            is_paid: isPaid ?? false,
            hasFullAccess: hasFullAccess ?? false,
            accountStatus: 'active',
            role: 'student',
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, uid });
    } catch (error: any) {
        console.error('Create student error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create student' }, { status: 500 });
    }
}
