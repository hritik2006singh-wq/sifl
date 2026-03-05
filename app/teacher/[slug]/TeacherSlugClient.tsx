"use client";

import { useTeacherGuard } from "@/hooks/useRoleGuard";
import { useState, useRef, useEffect } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "@/lib/firebase-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

function slugify(name: string) {
    return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export default function TeacherSlugClient({ slug }: { slug: string }) {
    const { user: authUser, loading: authLoading } = useTeacherGuard();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [name, setName] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!slug) return;
            try {
                let docRef = doc(db, "users", slug);
                let docSnap = await getDoc(docRef);
                let loadedUser: any = null;

                if (docSnap.exists() && docSnap.data().role === "teacher") {
                    loadedUser = { id: docSnap.id, ...docSnap.data() };
                } else {
                    const q = query(collection(db, "users"), where("slug", "==", slug), where("role", "==", "teacher"));
                    const querySnap = await getDocs(q);
                    if (!querySnap.empty) {
                        loadedUser = { id: querySnap.docs[0].id, ...querySnap.docs[0].data() };
                        docRef = querySnap.docs[0].ref;
                    }
                }

                if (loadedUser) {
                    if (!loadedUser.slug && loadedUser.name) {
                        const newSlug = `${slugify(loadedUser.name)}-${loadedUser.id.slice(0, 4)}`;
                        await updateDoc(docRef, { slug: newSlug });
                        loadedUser.slug = newSlug;
                    }
                    setProfileUser(loadedUser);
                    setName(loadedUser.name || "");
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

        if (!authLoading) fetchUserData();
    }, [slug, authLoading]);

    const isOwner = authUser && profileUser && authUser.uid === profileUser.id;

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOwner) return toast.error("Unauthorized");

        setIsSaving(true);
        try {
            await updateDoc(doc(db, "users", profileUser.id), { name, profileImage });
            toast.success("Profile saved!");
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
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (authLoading || loadingData) return <div className="p-8">Loading profile...</div>;
    if (!profileUser) return <div className="p-8 text-red-500">Teacher not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            <h1 className="text-3xl font-extrabold text-gray-900">{isOwner ? "My Profile" : `${profileUser.name}'s Profile`}</h1>
            <div className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="flex items-center gap-6 border-b pb-6">
                        <div className="relative group">
                            <div className="size-28 rounded-full overflow-hidden border-4 border-gray-50 flex items-center justify-center bg-gray-100">
                                {isUploading ? <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div> : profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-4xl text-gray-400">person</span>}
                            </div>
                            {isOwner && (
                                <label className="absolute bottom-0 right-0 bg-white size-10 rounded-full border shadow-md flex items-center justify-center cursor-pointer">
                                    <span className="material-symbols-outlined text-gray-600">photo_camera</span>
                                    <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold">Full Name</label>
                        <input type="text" disabled={!isOwner} required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-gray-50 disabled:bg-gray-100" />
                    </div>
                    {isOwner && (
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl">
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
