import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
    try {
        const { objectKey, key } = await req.json();

        const deletionKey = objectKey || key;
        if (!deletionKey) {
            return NextResponse.json({ success: false, error: 'Object key missing' }, { status: 400 });
        }

        const R2_ENDPOINT = process.env.R2_ENDPOINT;
        const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
        const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
        const R2_BUCKET = process.env.R2_BUCKET_NAME;

        if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
            return NextResponse.json(
                { success: false, error: "Storage configuration missing" },
                { status: 500 }
            );
        }

        const S3 = new S3Client({
            region: "auto",
            endpoint: R2_ENDPOINT,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY,
            },
        });

        await S3.send(
            new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: deletionKey,
            })
        );

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Delete Error:", err);
        return NextResponse.json(
            { success: false, error: err.message || 'Failed to delete file from storage' },
            { status: 500 }
        );
    }
}
