import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { bookingId, name, email, language, preferredTime } = body;

        if (!bookingId || !name || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await adminDb.collection('demoBookings').doc(bookingId).set({
            bookingId,
            name,
            email,
            language: language || '',
            preferredTime: preferredTime || '',
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, bookingId });
    } catch (error: any) {
        console.error('Create booking error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 });
    }
}
