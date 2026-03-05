import {
    collection,
    doc,
    getDocs,
    query,
    orderBy,
    where,
    serverTimestamp,
    deleteDoc,
    updateDoc,
    limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Blog } from "@/types/blog";
import { slugify } from "@/utils/slugify";

export const BlogService = {

    // ─────────────────────────────────────────────
    // READ: All Blogs (for Admin table)
    // ─────────────────────────────────────────────
    async getAllBlogs(): Promise<Blog[]> {
        try {
            console.log("[BlogService] getAllBlogs — start");
            const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const blogs = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data(),
            } as Blog));
            console.log(`[BlogService] getAllBlogs — returned ${blogs.length} blogs`);
            return blogs;
        } catch (error: any) {
            console.error("[BlogService] getAllBlogs FAILED:", error?.message ?? error);
            return []; // Never crash the admin dashboard
        }
    },

    // ─────────────────────────────────────────────
    // READ: Published Blogs only (for public site)
    // NOTE: Sorting done in JS to avoid composite-index requirement
    // ─────────────────────────────────────────────
    async getPublishedBlogs(): Promise<Blog[]> {
        try {
            console.log("[BlogService] getPublishedBlogs — start");
            const q = query(
                collection(db, "blogs"),
                where("status", "==", "published")
            );
            const snapshot = await getDocs(q);
            const blogs = snapshot.docs
                .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Blog))
                .sort((a, b) => {
                    // Sort descending by publishedAt
                    const aTime = a.publishedAt?.toDate().getTime() ?? 0;
                    const bTime = b.publishedAt?.toDate().getTime() ?? 0;
                    return bTime - aTime;
                });
            console.log(`[BlogService] getPublishedBlogs — returned ${blogs.length} published blogs`);
            return blogs;
        } catch (error: any) {
            console.error("[BlogService] getPublishedBlogs FAILED:", error?.message ?? error);
            return [];
        }
    },

    // ─────────────────────────────────────────────
    // READ: Single Blog by Slug
    // ─────────────────────────────────────────────
    async getBlogBySlug(slug: string): Promise<Blog | null> {
        if (!slug || typeof slug !== "string" || slug.trim() === "") {
            console.warn("[BlogService] getBlogBySlug — invalid slug provided:", slug);
            return null;
        }
        try {
            console.log("[BlogService] getBlogBySlug —", slug);
            const q = query(collection(db, "blogs"), where("slug", "==", slug.trim()), limit(1));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                console.log("[BlogService] getBlogBySlug — not found:", slug);
                return null;
            }
            const docSnap = snapshot.docs[0];
            return { id: docSnap.id, ...docSnap.data() } as Blog;
        } catch (error: any) {
            console.error("[BlogService] getBlogBySlug FAILED:", error?.message ?? error);
            return null;
        }
    },

    // ─────────────────────────────────────────────
    // UTILITY: Generate a unique slug from a title
    // ─────────────────────────────────────────────
    async generateUniqueSlug(title: string, currentBlogId?: string): Promise<string> {
        if (!title) throw new Error("[BlogService] generateUniqueSlug — title is required");
        const baseSlug = slugify(title);
        let slug = baseSlug;
        let counter = 1;

        // Safety cap: never loop more than 20 times
        while (counter <= 20) {
            const existing = await this.getBlogBySlug(slug);
            if (!existing || existing.id === currentBlogId) {
                return slug;
            }
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        // Fallback: append timestamp for guaranteed uniqueness
        return `${baseSlug}-${Date.now()}`;
    },

    // ─────────────────────────────────────────────
    // WRITE: Toggle published/draft status
    // ─────────────────────────────────────────────
    async toggleStatus(blogId: string, currentStatus: string): Promise<"draft" | "published"> {
        if (!blogId) throw new Error("[BlogService] toggleStatus — blogId is required");

        const newStatus: "draft" | "published" = currentStatus === "published" ? "draft" : "published";
        console.log(`[BlogService] toggleStatus — ${blogId}: ${currentStatus} → ${newStatus}`);

        const blogRef = doc(db, "blogs", blogId);
        await updateDoc(blogRef, {
            status: newStatus,
            publishedAt: newStatus === "published" ? serverTimestamp() : null,
        });

        return newStatus;
    },

    // ─────────────────────────────────────────────
    // DELETE: Remove a blog document
    // ─────────────────────────────────────────────
    async deleteBlog(blogId: string): Promise<void> {
        if (!blogId) throw new Error("[BlogService] deleteBlog — blogId is required");

        console.log("[BlogService] deleteBlog —", blogId);
        try {
            await deleteDoc(doc(db, "blogs", blogId));
            console.log("[BlogService] deleteBlog — success:", blogId);
        } catch (error: any) {
            console.error("[BlogService] deleteBlog FAILED:", error?.message ?? error);
            throw new Error("Failed to delete blog: " + (error?.message ?? "unknown error"));
        }
    },
};
