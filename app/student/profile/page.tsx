"use client";

import { useStudentGuard } from "@/hooks/useRoleGuard";
import { useState, useRef, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import toast from "react-hot-toast";

export default function StudentProfilePage() {
    const { user, loading, refreshUser } = useStudentGuard();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [profileImage, setProfileImage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setAge(user.age || "");
            setProfileImage(user.profileImage || "");
        }
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                name,
                age: Number(age),
                profileImage
            });
            await refreshUser(); // If you have it, else wait for state catch up
            toast.success("Profile saved successfully!");
        } catch (error) {
            console.error("Error saving profile", error);
            toast.error("Failed to save profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const presignRes = await fetch("/api/generate-upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            });

            if (!presignRes.ok) throw new Error("Failed to initialize upload");

            const presignData = await presignRes.json();
            if (!presignData.success) throw new Error(presignData.error || "Failed to generate upload URL");

            const uploadRes = await fetch(presignData.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file
            });

            if (!uploadRes.ok) throw new Error("Failed to upload image securely");

            if (presignData.publicUrl) {
                setProfileImage(presignData.publicUrl);
                toast.success("Image uploaded!");
                // Auto-save the image to firestore specifically
                if (user) {
                    await updateDoc(doc(db, "users", user.uid), { profileImage: presignData.publicUrl });
                    await refreshUser();
                }
            } else {
                throw new Error("Upload mapping failed");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to upload image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
                <p className="text-gray-500 mt-2">Manage your student account details and photo.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-12">
                    <form onSubmit={handleSaveProfile} className="space-y-6 md:space-y-8 pb-28 md:pb-0">
                        {/* Profile Image Section */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 pb-6 md:pb-8 border-b border-gray-100 text-center md:text-left">
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
                                <label className="absolute bottom-0 right-0 bg-white size-10 rounded-full border border-gray-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-gray-600">photo_camera</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Profile Photo</h3>
                                <p className="text-sm text-gray-500 mt-1">Upload a clear square image format. High resolution recommended.</p>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                            <div className="space-y-1.5 md:space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 h-12 md:h-auto md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-base md:text-sm"
                                />
                            </div>

                            <div className="space-y-1.5 md:space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    disabled
                                    value={email}
                                    className="w-full px-4 h-12 md:h-auto md:py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none text-base md:text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>
                            </div>

                            <div className="space-y-1.5 md:space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Age</label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    value={age}
                                    onChange={(e) => setAge(Number(e.target.value))}
                                    className="w-full px-4 h-12 md:h-auto md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-base md:text-sm"
                                />
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-0 md:pt-6 flex justify-end z-40 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full md:w-auto px-8 py-3.5 md:py-3 bg-primary text-white font-bold rounded-xl shadow-md active:scale-95 md:hover:bg-primary/90 transition-all disabled:opacity-50 text-base md:text-sm"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
