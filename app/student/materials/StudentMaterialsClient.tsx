"use client";

import { useStudentGuard } from "@/hooks/useRoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-admin";
import { collection, query, getDocs, orderBy, doc, getDoc, where } from "firebase/firestore";
import Link from "next/link";

export default function StudentMaterialsClient() {
    const { user, loading: authLoading } = useStudentGuard();
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessError, setAccessError] = useState("");

    // Preview File Modal
    const [previewMaterial, setPreviewMaterial] = useState<any>(null);

    useEffect(() => {
        const fetchContent = async () => {
            if (!user) return;

            try {
                // 1. Fetch live student document
                const studentDoc = await getDoc(doc(db, "users", user.uid));
                if (!studentDoc.exists()) {
                    setAccessError("Student record not found.");
                    setLoading(false);
                    return;
                }

                const studentData = studentDoc.data();

                // 2. Check Paid Status
                if (!studentData.is_paid) {
                    setAccessError("You need to complete payment to access materials.");
                    setLoading(false);
                    return;
                }

                // 3. Check access logic
                const materialsRef = collection(db, "materials");
                let mQuery;

                if (studentData.hasFullAccess) {
                    // Full Access: Only lock by Language
                    if (!studentData.language) {
                        setAccessError("No language track assigned to your profile.");
                        setLoading(false);
                        return;
                    }
                    mQuery = query(
                        materialsRef,
                        where("language", "==", studentData.language),
                        orderBy("createdAt", "desc")
                    );
                } else {
                    // Strict Access: Lock by Language AND Level
                    if (!studentData.language || !studentData.currentLevel) {
                        setAccessError("Incomplete language/level assignment on your profile.");
                        setLoading(false);
                        return;
                    }
                    mQuery = query(
                        materialsRef,
                        where("language", "==", studentData.language),
                        where("level", "==", studentData.currentLevel),
                        orderBy("createdAt", "desc")
                    );
                }

                const mSnap = await getDocs(mQuery);

                // Firestore composite index might be required for where+where+orderBy. 
                // Using client-side sort as fallback.
                const fetchedMaterials = mSnap.docs.map(m => ({ id: m.id, ...m.data() }));

                // If the error "The query requires an index" occurs, it will throw. Let's do client side sorting to be extremely safe against build/runtime crashes without predefined indexes.

                setMaterials(fetchedMaterials.sort((a: any, b: any) => {
                    const tA = a.createdAt?.toMillis() || 0;
                    const tB = b.createdAt?.toMillis() || 0;
                    return tB - tA; // Descending
                }));

            } catch (err: any) {
                console.error("Error fetching materials:", err);

                // Fallback client side sorting if index failed
                if (err.message?.includes("index")) {
                    try {
                        const studentData = (await getDoc(doc(db, "users", user.uid))).data()!;
                        const mSnap = await getDocs(collection(db, "materials"));
                        let flat = mSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                        if (!studentData.hasFullAccess) {
                            flat = flat.filter((m: any) => m.language === studentData.language && m.level === studentData.currentLevel);
                        } else {
                            flat = flat.filter((m: any) => m.language === studentData.language);
                        }

                        setMaterials(flat.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
                    } catch (e) {
                        setAccessError("A database connection error occurred.");
                    }
                } else {
                    setAccessError("Failed to verify access permissions.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchContent();
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return <div className="p-8 text-center text-gray-500 mt-20">Authenticating access...</div>;
    }

    if (accessError) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 mt-12">
                <div className="bg-red-50 text-red-800 p-8 rounded-3xl border border-red-200 text-center shadow-sm">
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4 block">
                        {accessError.includes("payment") ? "lock" : "gpp_maybe"}
                    </span>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">Access Restricted</h2>
                    <p className="text-red-700 max-w-lg mx-auto font-medium">
                        {accessError}
                    </p>
                    <Link href="/student" className="mt-8 inline-block px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 mt-4 relative">

            {/* FULLSCREEN PREVIEW MODAL */}
            {previewMaterial && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
                    <div className="absolute top-4 right-6 flex gap-4">
                        <button
                            onClick={() => setPreviewMaterial(null)}
                            className="bg-white/10 hover:bg-white/30 text-white rounded-full size-12 flex items-center justify-center transition-all backdrop-blur-md border border-white/20 active:scale-95"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>

                    <div className="w-full h-full max-w-6xl max-h-[90vh] flex flex-col mt-12 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-white mb-4">
                            <h3 className="text-2xl font-bold">{previewMaterial.title}</h3>
                            <p className="text-white/60 text-sm font-semibold tracking-wider uppercase">{previewMaterial.fileType} • {(previewMaterial.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <div className="flex-1 bg-black/50 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            {previewMaterial.fileType === "video" ? (
                                <video controls controlsList="nodownload" className="w-full h-full object-contain">
                                    <source src={previewMaterial.fileUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <iframe src={`${previewMaterial.fileUrl}#toolbar=0`} className="w-full h-full border-none bg-white object-contain" />
                            )}
                        </div>
                    </div>
                </div>
            )}


            <div className="flex items-center gap-4">
                <Link href="/student" className="size-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 shadow-sm transition active:scale-95 shrink-0">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Study Materials</h1>
                    <p className="text-gray-500 mt-1 font-medium">Content unlocked for your assigned language curriculum.</p>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {materials.map((m, index) => (
                    <div
                        key={m.id}
                        onClick={() => setPreviewMaterial(m)}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow hover:border-primary/20 transition-all p-6 flex flex-col md:flex-row items-center gap-6 group cursor-pointer"
                    >

                        <div className="flex-shrink-0 flex items-center gap-4 w-full md:w-auto">
                            {m.fileType === "video" ? (
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                    <span className="material-symbols-outlined text-[32px]">play_circle</span>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all shrink-0">
                                    <span className="material-symbols-outlined text-[32px]">picture_as_pdf</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full min-w-0">
                            <h3 className="font-bold text-gray-900 text-xl truncate mb-1 group-hover:text-primary transition-colors" title={m.title}>{m.title || "Untitled Lesson"}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                <span className="text-primary bg-primary/10 px-2.5 py-1 rounded-md">{m.language || "Lang"}</span>
                                <span className="text-purple-600 bg-purple-100 px-2.5 py-1 rounded-md">{m.level || "Lvl"}</span>
                                <span>•</span>
                                <span>{m.fileType === "video" ? "Video Lesson" : "Document"}</span>
                                <span>•</span>
                                <span>{(m.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                            </div>
                        </div>

                        <div className="w-full md:w-auto shrink-0 flex gap-3">
                            {m.fileType === "video" ? (
                                <button
                                    className="w-full md:w-auto px-8 py-3.5 bg-gray-900 text-white hover:bg-black rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 pointer-events-none"
                                >
                                    <span className="material-symbols-outlined text-[20px]">play_arrow</span> Watch
                                </button>
                            ) : (
                                <button
                                    className="w-full md:w-auto px-8 py-3.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 pointer-events-none"
                                >
                                    <span className="material-symbols-outlined text-[18px]">visibility</span> View Document
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {materials.length === 0 && (
                    <div className="py-24 text-center text-gray-400 border-2 border-dashed rounded-3xl bg-white shadow-sm mx-auto w-full max-w-2xl">
                        <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">folder_open</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">No Materials Available</h3>
                        <p className="font-medium text-gray-500">There is currently no content mapped to your level.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
