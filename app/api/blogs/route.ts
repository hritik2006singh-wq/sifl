import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { blogId, title, slug, excerpt, content, author } = body;

        if (!blogId || !title || !slug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await adminDb.collection('blogs').doc(blogId).set({
            blogId,
            title,
            slug,
            excerpt: excerpt || '',
            content: content || '',
            author: author || '',
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, blogId });
    } catch (error: any) {
        console.error('Create blog error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 500 });
    }
}
