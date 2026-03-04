import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            email,
            password,
            name,
            phone,
            dateOfBirth,
            gender,
            address,
            emergencyContact,
            language,
            level,
            assignedTeacher,
            billingStatus
        } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields (email, password, name)' },
                { status: 400 }
            );
        }

        // 1. Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // 2. Prepare user document data
        const userData = {
            email,
            name,
            phone: phone || '',
            dob: dateOfBirth || '',
            gender: gender || 'Other',
            address: address || { street: "", city: "", state: "", country: "" },
            emergencyContact: emergencyContact || { name: "", phone: "", relation: "" },
            languageTrack: language || 'English',
            level: level || 'Beginner (A1)',
            assignedTeacherId: assignedTeacher || null,
            is_paid: billingStatus === 'paid',
            role: 'student',
            status: 'active',
            accountStatus: 'active', // For consistency with other parts of the app
            profileImage: '',
            createdAt: FieldValue.serverTimestamp(),
        };

        // 3. Create document in Firestore
        if (adminDb) {
            await adminDb.collection('users').doc(userRecord.uid).set(userData);
        } else {
            throw new Error('Firestore Admin not initialized');
        }

        return NextResponse.json({ success: true, uid: userRecord.uid });

    } catch (error: any) {
        console.error('Create student error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create student' },
            { status: 400 }
        );
    }
}
