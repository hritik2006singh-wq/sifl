import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Ensure consistent env loading
        const endpoint = process.env.R2_ENDPOINT || "";
        const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
        const bucketName = process.env.R2_BUCKET_NAME || "";
        const publicUrl = process.env.R2_PUBLIC_URL || "";

        if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
            return NextResponse.json({ error: "R2 credentials missing" }, { status: 500 });
        }

        const S3 = new S3Client({
            region: "auto",
            endpoint,
            credentials: { accessKeyId, secretAccessKey },
        });

        const blogId = uuidv4();
        const extension = file.name.split(".").pop();
        const key = `blogs/${blogId}/cover-${Date.now()}.${extension}`;

        await S3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        const coverImageUrl = `${publicUrl}/${key}`;

        return NextResponse.json({
            success: true,
            blogId,
            coverImageUrl,
            coverImagePath: key
        });

    } catch (error: any) {
        console.error("R2 Upload Error:", error);
        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}
