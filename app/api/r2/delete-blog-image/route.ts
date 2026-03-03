import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function DELETE(req: NextRequest) {
    try {
        const { coverImagePath } = await req.json();

        if (!coverImagePath) {
            return NextResponse.json({ error: "Missing coverImagePath" }, { status: 400 });
        }

        const endpoint = process.env.R2_ENDPOINT || "";
        const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
        const bucketName = process.env.R2_BUCKET_NAME || "";

        if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
            return NextResponse.json({ error: "R2 credentials missing" }, { status: 500 });
        }

        const S3 = new S3Client({
            region: "auto",
            endpoint,
            credentials: { accessKeyId, secretAccessKey },
        });

        await S3.send(new DeleteObjectCommand({
            Bucket: bucketName,
            Key: coverImagePath
        }));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("R2 Delete Error:", error);
        return NextResponse.json({ error: "Delete failed: " + error.message }, { status: 500 });
    }
}
