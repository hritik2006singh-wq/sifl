"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";

export default function BlogsClient() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "blogs"),
                orderBy("createdAt", "desc"),
                limit(10)
            );
            const snap = await getDocs(q);
            setBlogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to load blogs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleDelete = async (blogId: string, coverImagePath?: string) => {
        if (!window.confirm("Are you sure you want to delete this blog post?")) return;

        try {
            // Delete R2 Image if exists
            if (coverImagePath) {
                await fetch("/api/r2/delete-blog-image", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ coverImagePath })
                });
            }

            // Delete Firestore Document
            await deleteDoc(doc(db, "blogs", blogId));

            setBlogs(blogs.filter(b => b.id !== blogId));
            toast.success("Blog deleted successfully");
        } catch (error) {
            console.error("Deletion Error:", error);
            toast.error("Failed to delete blog.");
        }
    };

    const toggleStatus = async (blogId: string, currentStatus: string) => {
        const newStatus = currentStatus === "published" ? "draft" : "published";
        const updateData: any = { status: newStatus };
        if (newStatus === "published") {
            updateData.publishedAt = new Date().toISOString();
        }

        try {
            await updateDoc(doc(db, "blogs", blogId), updateData);
            setBlogs(blogs.map(b => b.id === blogId ? { ...b, ...updateData } : b));
            toast.success(`Blog moved to ${newStatus}`);
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Blog Manager</h1>
                    <p className="text-gray-500">Manage knowledge base articles and updates.</p>
                </div>
                <Link
                    href="/admin/blogs/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition shadow-xl shadow-emerald-600/20"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Create New Post
                </Link>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading blogs...</div>
                ) : blogs.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="size-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">article</span>
                        </div>
                        <h3 className="font-bold text-lg">No Blogs Yet</h3>
                        <p className="text-gray-500 mb-6">Start writing to engage your audience.</p>
                        <Link
                            href="/admin/blogs/create"
                            className="bg-emerald-100/50 hover:bg-emerald-100 text-emerald-700 px-5 py-2 rounded-lg font-medium transition"
                        >
                            Create First Post
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Published</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {blogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {blog.coverImageUrl ? (
                                                    <img src={blog.coverImageUrl} className="size-12 rounded-lg object-cover shadow-sm bg-gray-100" alt="Cover" />
                                                ) : (
                                                    <div className="size-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                                        <span className="material-symbols-outlined">image</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-900 line-clamp-1">{blog.title}</div>
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">/{blog.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(blog.id, blog.status)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase transition ${blog.status === "published"
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                    }`}
                                            >
                                                {blog.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                            {blog.status === "published" && blog.publishedAt
                                                ? new Date(blog.publishedAt).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/blogs/${blog.id}`}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                    title="Edit Post"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog.id, blog.coverImagePath)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Post"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
