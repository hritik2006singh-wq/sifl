import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, name, specialization, languages } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        const uid = userRecord.uid;

        // 2. Create users collection doc
        await adminDb.collection('users').doc(uid).set({
            uid,
            email,
            name,
            role: 'teacher',
            status: 'active',
            createdAt: FieldValue.serverTimestamp(),
        });

        // 3. Create teachers collection doc
        await adminDb.collection('teachers').doc(uid).set({
            uid,
            specialization: specialization || '',
            languages: languages || [],
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, uid });
    } catch (error: any) {
        console.error('Create teacher error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create teacher' }, { status: 500 });
    }
}
