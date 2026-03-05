"use client";

import { useStudentGuard } from "@/hooks/useRoleGuard";
import { useState, useRef, useEffect } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "@/lib/firebase-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

function slugify(name: string) {
    return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export default function StudentSlugClient({ slug }: { slug: string }) {
    const { user: authUser, loading: authLoading, refreshUser } = useStudentGuard();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [name, setName] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [profileImage, setProfileImage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!slug) return;
            try {
                // Dual Routing: 1. Try UID
                let docRef = doc(db, "users", slug);
                let docSnap = await getDoc(docRef);
                let loadedUser: any = null;

                if (docSnap.exists() && docSnap.data().role === "student") {
                    loadedUser = { id: docSnap.id, ...docSnap.data() };
                } else {
                    // 2. Try Slug
                    const q = query(collection(db, "users"), where("slug", "==", slug), where("role", "==", "student"));
                    const querySnap = await getDocs(q);
                    if (!querySnap.empty) {
                        loadedUser = { id: querySnap.docs[0].id, ...querySnap.docs[0].data() };
                        docRef = querySnap.docs[0].ref;
                    }
                }

                if (loadedUser) {
                    // Backward Compatibility: Auto Generate Slug if Missing
                    if (!loadedUser.slug && loadedUser.name) {
                        const newSlug = `${slugify(loadedUser.name)}-${loadedUser.id.slice(0, 4)}`;
                        await updateDoc(docRef, { slug: newSlug });
                        loadedUser.slug = newSlug;
                    }

                    setProfileUser(loadedUser);
                    setName(loadedUser.name || "");
                    setAge(loadedUser.age || "");
                    setProfileImage(loadedUser.profilePhotoUrl || loadedUser.profileImage || "");
                } else {
                    toast.error("Profile not found.");
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoadingData(false);
            }
        };

        if (!authLoading) {
            fetchUserData();
        }
    }, [slug, authLoading]);

    const isOwner = authUser && profileUser && authUser.uid === profileUser.id;

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOwner) return toast.error("Unauthorized");

        setIsSaving(true);
        try {
            const userRef = doc(db, "users", profileUser.id);
            await updateDoc(userRef, { name, age: Number(age), profileImage });
            toast.success("Profile saved successfully!");
            if (refreshUser) await refreshUser();
        } catch (error) {
            console.error("Error saving profile", error);
            toast.error("Failed to save profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isOwner) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `profilePictures/${profileUser.id}/avatar.jpg`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            setProfileImage(downloadUrl);
            await updateDoc(doc(db, "users", profileUser.id), { profilePhotoUrl: downloadUrl, profileImage: downloadUrl });
            toast.success("Profile picture updated!");
            if (refreshUser) await refreshUser();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to upload image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (authLoading || loadingData) return <div className="p-8">Loading profile...</div>;
    if (!profileUser) return <div className="p-8 text-red-500">Student not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{isOwner ? "My Profile" : `${profileUser.name}'s Profile`}</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-12">
                    <form onSubmit={handleSaveProfile} className="space-y-6 md:space-y-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 pb-6 border-b border-gray-100">
                            <div className="relative group">
                                <div className="size-28 md:size-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center">
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    ) : profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                                    )}
                                </div>
                                {isOwner && (
                                    <label className="absolute bottom-0 right-0 bg-white size-10 rounded-full border border-gray-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                        <span className="material-symbols-outlined text-[20px] text-gray-600">photo_camera</span>
                                        <input
                                            type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} disabled={isUploading}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <input type="text" disabled={!isOwner} required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 disabled:bg-gray-100 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Age</label>
                                <input type="number" disabled={!isOwner} required value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 disabled:bg-gray-100 outline-none" />
                            </div>
                        </div>

                        {isOwner && (
                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 text-sm">
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
