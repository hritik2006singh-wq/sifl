import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, role, name, phone, address, primaryLanguage, specializations } = body;

        // Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // Create Firestore document
        await adminDb.collection('users').doc(userRecord.uid).set({
            email,
            role,
            status: 'active',
            name,
            phone: phone || '',
            address: address || '',
            primaryLanguage: primaryLanguage || '',
            specializations: specializations || [],
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, uid: userRecord.uid });

    } catch (error: any) {
        console.error('Create staff error:', error);
        console.log('Firebase errorInfo:', JSON.stringify(error.errorInfo, null, 2));
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create staff member' },
            { status: 400 }
        );
    }
}