import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
    try {
        const { filename, contentType } = await req.json();

        if (!filename || !contentType) {
            return NextResponse.json(
                { success: false, error: "Missing filename or contentType" },
                { status: 400 }
            );
        }

        // Validate image type
        if (!contentType.startsWith("image/")) {
            return NextResponse.json(
                { success: false, error: "Only image files are allowed" },
                { status: 400 }
            );
        }

        const R2_ENDPOINT = process.env.R2_ENDPOINT;
        const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
        const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
        const R2_BUCKET = process.env.R2_BUCKET_NAME;
        const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_URL;

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

        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
        const objectKey = `profile-pictures/${Date.now()}-${sanitizedFilename}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: objectKey,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
        const finalPublicUrl = `${R2_PUBLIC_URL}/${objectKey}`;

        return NextResponse.json({
            success: true,
            uploadUrl,
            key: objectKey,
            publicUrl: finalPublicUrl,
        });
    } catch (err: any) {
        console.error("Profile picture presign error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to generate signed URL" },
            { status: 500 }
        );
    }
}
