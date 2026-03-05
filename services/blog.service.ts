import { collection, doc, getDocs, setDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Blog } from "@/models/blog.model";

export const BlogService = {
    async getAllBlogs(): Promise<Blog[]> {
        try {
            const blogsRef = collection(db, "blogs");
            const q = query(blogsRef, orderBy("createdAt", "desc"));
            const docRefs = await getDocs(q);
            return docRefs.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Blog));
        } catch (error: any) {
            console.error("[BlogService] Failed to fetch blogs:", error);
            // Return empty array instead of throwing — prevents UI crash on permission errors
            return [];
        }
    },

    async createBlog(blogId: string, data: Omit<Blog, "blogId" | "createdAt" | "updatedAt">): Promise<void> {
        try {
            const blogRef = doc(db, "blogs", blogId);
            await setDoc(blogRef, {
                blogId,
                createdAt: serverTimestamp(),
                ...data
            });
        } catch (error: any) {
            console.error("Error creating blog:", error);
            throw new Error("Failed to create blog");
        }
    }
};
