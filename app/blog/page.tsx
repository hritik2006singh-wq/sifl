import Link from "next/link";
import { Metadata } from "next";
import { adminDb } from "@/lib/firebaseAdmin";
import Image from "next/image";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Language Learning & Study Abroad Insights | SIFL Blog",
    description:
        "Expert insights on studying abroad, mastering German and English, IELTS bands, and navigating international careers.",
    alternates: {
        canonical: "https://sifl.edu.in/blog",
    },
};

export default async function BlogIndexPage() {
    let blogs: any[] = [];

    try {
        const snapshot = await adminDb
            .collection("blogs")
            .where("status", "==", "published")
            .orderBy("publishedAt", "desc")
            .limit(10)
            .get();

        blogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Blog fetch error:", error);
    }

    return (
        <>
            {/* your existing UI rendering logic */}
        </>
    );
}