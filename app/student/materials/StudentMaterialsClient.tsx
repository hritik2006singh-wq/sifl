"use client";

import { useStudentGuard } from "@/hooks/useRoleGuard";
import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import toast from "react-hot-toast";

export default function StudentMaterialsClient() {
    const { user, loading: authLoading } = useStudentGuard();
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            if (!user?.is_paid) {
                setLoading(false);
                return;
            }
            try {
                // Fetch study materials uploaded by the student
                const materialsQuery = query(collection(db, "studyMaterials"), where("uploadedBy", "==", user.uid));
                const materialsSnap = await getDocs(materialsQuery);
                const fetchedMaterials = materialsSnap.docs.map(m => ({ id: m.id, ...m.data() }));

                // Fetch admin-assigned materials too
                const accessQuery = query(collection(db, "student_material_access"), where("student_id", "==", user.uid));
                const accessSnap = await getDocs(accessQuery);
                const materialIds = accessSnap.docs.map(doc => doc.data().material_id);

                let assignedMaterials: any[] = [];
                if (materialIds.length > 0) {
                    const chunks = [];
                    for (let i = 0; i < materialIds.length; i += 10) {
                        chunks.push(materialIds.slice(i, i + 10));
                    }
                    for (const chunk of chunks) {
                        const mQuery = query(collection(db, "studyMaterials"), where("__name__", "in", chunk));
                        const mSnap = await getDocs(mQuery);
                        assignedMaterials = [...assignedMaterials, ...mSnap.docs.map(m => ({ id: m.id, ...m.data(), isAssigned: true }))];
                    }
                }

                setMaterials([...assignedMaterials, ...fetchedMaterials]);
            } catch (err) {
                console.error("Error fetching materials:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMaterials();
        }
    }, [user]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!user) return;
        setUploading(true);
        setProgress(0);

        try {
            const storageRef = ref(storage, `studyMaterials/${user.uid}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setProgress(prog);
                },
                (error) => {
                    console.error("Upload failed", error);
                    toast.error("Upload failed.");
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    const newMatData = {
                        title: file.name,
                        fileURL: downloadURL,
                        uploadedBy: user.uid,
                        createdAt: new Date().toISOString()
                    };

                    const docRef = await addDoc(collection(db, "studyMaterials"), newMatData);
                    setMaterials(prev => [...prev, { id: docRef.id, ...newMatData }]);
                    toast.success("File uploaded successfully.");
                    setUploading(false);
                }
            );
        } catch (err) {
            console.error(err);
            toast.error("Failed to start upload.");
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, isAssigned: boolean) => {
        if (isAssigned) {
            toast.error("Cannot delete an assigned material.");
            return;
        }

        try {
            await deleteDoc(doc(db, "studyMaterials", id));
            setMaterials(prev => prev.filter(m => m.id !== id));
            toast.success("File deleted successfully.");
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Failed to delete file.");
        }
    };

    if (authLoading || loading) {
        return <div className="p-8 text-gray-500">Loading materials...</div>;
    }

    if (!user?.is_paid) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-red-50 text-red-800 p-8 rounded-2xl border border-red-200 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">lock</span>
                    <h2 className="text-2xl font-bold mb-2">Premium Access Required</h2>
                    <p className="text-red-700 max-w-lg mx-auto">
                        Your account is currently unpaid. You must have an active premium membership to view and upload course materials. Please contact administration or complete your payment to unlock this section.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Study Materials</h1>
                <p className="text-gray-500 mt-1">Upload and manage all your course documents.</p>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all bg-white shadow-sm ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{ cursor: uploading ? "wait" : "pointer" }}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                />
                <div className="size-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                {uploading ? (
                    <div className="text-center w-full max-w-xs">
                        <p className="font-bold text-gray-800 mb-2">Uploading... {progress}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-lg font-bold text-gray-900">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-1">SVG, PNG, JPG, PDF or ZIP (max. 10MB)</p>
                    </>
                )}
            </div>

            {/* Grid Layout for Files */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <span className="material-symbols-outlined text-2xl">{m.isAssigned ? "library_books" : "description"}</span>
                            </div>
                            {!m.isAssigned && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(m.id, false); }}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete Material"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            )}
                        </div>
                        <h3 className="font-bold text-gray-900 truncate mb-1" title={m.title}>{m.title || "Untitled Document"}</h3>
                        <p className="text-xs text-gray-500 mb-4">{m.isAssigned ? "Assigned Material" : "Personal Upload"}</p>
                        <div className="mt-auto">
                            <a
                                href={m.fileURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all text-sm font-semibold"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Download
                            </a>
                        </div>
                    </div>
                ))}

                {materials.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 border border-dashed rounded-2xl bg-gray-50">
                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">folder_open</span>
                        <p>No study materials found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
