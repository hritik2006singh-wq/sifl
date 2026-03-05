"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase-client";
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function BlogEditorClient() {
    const router = useRouter();
    const params = useParams();
    const isEditing = params?.id !== "create";
    const blogId = isEditing ? (params?.id as string) : "";

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    // File tracking
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    // Form Data
    const [form, setForm] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        status: "draft",
        coverImageUrl: "",
        coverImagePath: ""
    });

    useEffect(() => {
        if (!isEditing) return;
        const fetchBlog = async () => {
            try {
                const snap = await getDoc(doc(db, "blogs", blogId));
                if (snap.exists()) {
                    const data = snap.data();
                    setForm({
                        title: data.title || "",
                        slug: data.slug || "",
                        excerpt: data.excerpt || "",
                        content: data.content || "",
                        metaTitle: data.metaTitle || "",
                        metaDescription: data.metaDescription || "",
                        keywords: data.keywords?.join(", ") || "",
                        status: data.status || "draft",
                        coverImageUrl: data.coverImageUrl || "",
                        coverImagePath: data.coverImagePath || ""
                    });
                    setPreviewUrl(data.coverImageUrl || "");
                } else {
                    toast.error("Blog not found!");
                    router.push("/admin/blogs");
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to fetch blog.");
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [isEditing, blogId, router]);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        if (!isEditing && !form.slug) {
            setForm({ ...form, title, slug: generateSlug(title) });
        } else {
            setForm({ ...form, title });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.slug || !form.content) {
            return toast.error("Title, Slug, and Content are required.");
        }

        setSaving(true);
        let currentImageUrl = form.coverImageUrl;
        let currentImagePath = form.coverImagePath;

        try {
            // Upload Image to R2 if changed
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);

                // Optional: pass coverImagePath to potentially delete old image
                // if we were strictly garbage collecting right now.

                const res = await fetch("/api/r2/upload-blog-image", {
                    method: "POST",
                    body: formData
                });
                const r2Data = await res.json();

                if (!res.ok) throw new Error(r2Data.error || "Image upload failed");
                currentImageUrl = r2Data.coverImageUrl;
                currentImagePath = r2Data.coverImagePath;
            }

            const payload: any = {
                title: form.title,
                slug: form.slug.toLowerCase(),
                excerpt: form.excerpt,
                content: form.content,
                metaTitle: form.metaTitle,
                metaDescription: form.metaDescription,
                keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean),
                status: form.status,
                coverImageUrl: currentImageUrl,
                coverImagePath: currentImagePath,
                authorId: auth.currentUser?.uid || "admin",
                updatedAt: serverTimestamp()
            };

            if (!isEditing) {
                payload.createdAt = serverTimestamp();
            }

            if (form.status === "published" && !isEditing) {
                payload.publishedAt = serverTimestamp();
            }

            if (isEditing) {
                await setDoc(doc(db, "blogs", blogId), payload, { merge: true });
                toast.success("Blog updated successfully.");
                router.push("/admin/blogs");
            } else {
                await addDoc(collection(db, "blogs"), payload);
                toast.success("Blog created successfully!");
                setForm({
                    title: "",
                    slug: "",
                    excerpt: "",
                    content: "",
                    metaTitle: "",
                    metaDescription: "",
                    keywords: "",
                    status: "draft",
                    coverImageUrl: "",
                    coverImagePath: ""
                });
                setImageFile(null);
                setPreviewUrl("");
            }

        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(error.message || "Failed to save blog.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading editor...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/blogs" className="p-2 border bg-white rounded-lg hover:bg-gray-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold">{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Core Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
                        <h2 className="text-lg font-bold border-b pb-2 mb-4">Content</h2>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="E.g. How to Speak French"
                                value={form.title}
                                onChange={handleTitleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">URL Slug</label>
                            <input
                                type="text"
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                                placeholder="how-to-speak-french"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Excerpt (Short Summary)</label>
                            <textarea
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                                placeholder="Briefly describe the article..."
                                value={form.excerpt}
                                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Content (Markdown / HTML)</label>
                            <textarea
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-[400px] font-mono text-sm leading-relaxed"
                                placeholder="# Heading 1&#10;Write your content here..."
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Meta & Media */}
                <div className="space-y-6">

                    {/* Publishing Panel */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                        <h2 className="text-lg font-bold border-b pb-2">Publishing</h2>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full border p-3 rounded-lg bg-gray-50 font-medium"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                <option value="draft">Draft (Hidden)</option>
                                <option value="published">Published (Live)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Blog"}
                        </button>
                    </div>

                    {/* SEO Meta */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                        <h2 className="text-lg font-bold border-b pb-2 flex items-center justify-between">
                            SEO Metadata
                            <span className="material-symbols-outlined text-sm text-gray-400">search</span>
                        </h2>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Meta Title</label>
                            <input
                                type="text"
                                className="w-full border p-2 text-sm rounded-md outline-none"
                                value={form.metaTitle}
                                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Meta Description</label>
                            <textarea
                                className="w-full border p-2 text-sm rounded-md outline-none h-20 resize-none"
                                value={form.metaDescription}
                                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Keywords (Comma separated)</label>
                            <input
                                type="text"
                                className="w-full border p-2 text-sm rounded-md outline-none font-mono"
                                placeholder="french, language, learning"
                                value={form.keywords}
                                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                        <h2 className="text-lg font-bold border-b pb-2 flex items-center justify-between">
                            Cover Image
                            <span className="material-symbols-outlined text-sm text-gray-400">image</span>
                        </h2>

                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-2 relative text-center group bg-gray-50 overflow-hidden">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined text-3xl mb-2">add_photo_alternate</span>
                                    <span className="text-sm font-medium">Click to upload cover</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        {form.coverImageUrl && !imageFile && (
                            <p className="text-xs text-gray-400 text-center break-all font-mono">
                                Currently stored in R2
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
