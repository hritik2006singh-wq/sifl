"use client";

import { useState, useEffect, useCallback } from "react";
import { BlogService } from "@/lib/blogService";
import { Blog } from "@/types/blog";
import Link from "next/link";
import toast from "react-hot-toast";
import { Timestamp } from "firebase/firestore";

export default function BlogsClient() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await BlogService.getAllBlogs();
            setBlogs(data);
        } catch (error) {
            console.error("[BlogsClient] Error fetching blogs:", error);
            toast.error("Failed to load blogs.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    // ─── Delete Handler ───────────────────────────────────
    const handleDelete = async (blogId: string, coverImagePath?: string) => {
        // Guard: must have a valid ID
        if (!blogId) {
            toast.error("Invalid blog — cannot delete.");
            return;
        }

        // Confirmation dialog — required for destructive actions
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this post? This cannot be undone."
        );
        if (!confirmed) return;

        setDeletingId(blogId);
        try {
            // Step 1: Try to delete the cover image first (non-fatal if it fails)
            if (coverImagePath) {
                try {
                    const imgRes = await fetch("/api/r2/delete-blog-image", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ coverImagePath }),
                    });
                    if (!imgRes.ok) {
                        console.warn("[BlogsClient] Cover image deletion returned non-OK, continuing with Firestore delete.");
                    }
                } catch (imgErr) {
                    console.warn("[BlogsClient] Cover image API call failed (continuing):", imgErr);
                }
            }

            // Step 2: Delete the Firestore document
            await BlogService.deleteBlog(blogId);

            // Step 3: Remove from local state
            setBlogs(prev => prev.filter(b => b.id !== blogId));
            toast.success("Blog deleted successfully.");
        } catch (error: any) {
            console.error("[BlogsClient] Delete failed:", error);
            toast.error(error?.message ?? "Failed to delete blog.");
        } finally {
            setDeletingId(null);
        }
    };

    // ─── Toggle Status Handler ────────────────────────────
    const toggleStatus = async (blogId: string, currentStatus: string) => {
        if (!blogId) {
            toast.error("Invalid blog — cannot update status.");
            return;
        }
        if (togglingId === blogId) return; // Prevent double-click

        setTogglingId(blogId);
        try {
            const newStatus = await BlogService.toggleStatus(blogId, currentStatus);
            // Optimistic local update — replace publishedAt with a client-side Timestamp
            // (server Timestamp will be correct on next fetch)
            setBlogs(prev =>
                prev.map(b =>
                    b.id === blogId
                        ? {
                            ...b,
                            status: newStatus,
                            publishedAt:
                                newStatus === "published"
                                    ? Timestamp.fromDate(new Date())
                                    : undefined,
                        }
                        : b
                )
            );
            toast.success(`Blog moved to ${newStatus}.`);
        } catch (error: any) {
            console.error("[BlogsClient] toggleStatus failed:", error);
            toast.error(error?.message ?? "Status update failed.");
        } finally {
            setTogglingId(null);
        }
    };

    // ─── Helpers ─────────────────────────────────────────
    const formatDate = (ts: Timestamp | undefined): string => {
        if (!ts || typeof ts.toDate !== "function") return "—";
        try {
            return ts.toDate().toLocaleDateString();
        } catch {
            return "—";
        }
    };

    // ─── Render ───────────────────────────────────────────
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
                                {blogs.map((blog) => {
                                    const isDeleting = deletingId === blog.id;
                                    const isToggling = togglingId === blog.id;
                                    return (
                                        // Stable key from Firestore doc.id — never an array index
                                        <tr
                                            key={blog.id}
                                            className={`hover:bg-gray-50/50 transition-colors ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {blog.coverImageUrl ? (
                                                        <img
                                                            src={blog.coverImageUrl}
                                                            className="size-12 rounded-lg object-cover shadow-sm bg-gray-100"
                                                            alt="Cover"
                                                            onError={(e) => {
                                                                // Gracefully handle broken image URLs
                                                                (e.target as HTMLImageElement).style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="size-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                                            <span className="material-symbols-outlined">image</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900 line-clamp-1">
                                                            {blog.title || "Untitled"}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                            /{blog.slug || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(blog.id, blog.status)}
                                                    disabled={isToggling}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase transition disabled:opacity-60 ${blog.status === "published"
                                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                        }`}
                                                >
                                                    {isToggling ? "..." : blog.status}
                                                </button>
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                                {/* Safe Timestamp formatting — never "Invalid Date" */}
                                                {blog.status === "published"
                                                    ? formatDate(blog.publishedAt)
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
                                                        disabled={isDeleting}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                                                        title="Delete Post"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {isDeleting ? "hourglass_empty" : "delete"}
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
