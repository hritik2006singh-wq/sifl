"use client";

import { useTeacherGuard } from "@/hooks/useRoleGuard";
import { useState, useRef, useEffect } from "react";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import toast from "react-hot-toast";

export default function TeacherProfilePage() {
    const { user, loading, refreshUser } = useTeacherGuard();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [profileImage, setProfileImage] = useState("");

    // Stats for profile view
    const [assignedStudentsCount, setAssignedStudentsCount] = useState(0);
    const [upcomingClassesCount, setUpcomingClassesCount] = useState(0);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setSpecialization(user.specialization || "");
            setProfileImage(user.profileImage || "");

            // Fetch basic stats for UI display
            const fetchStats = async () => {
                try {
                    const classesQuery = query(collection(db, "classes"), where("teacherId", "==", user.uid));
                    const classesSnap = await getDocs(classesQuery);

                    let students = new Set();
                    let upcoming = 0;
                    const todayStr = new Date().toISOString().split('T')[0];

                    classesSnap.forEach(cDoc => {
                        const c = cDoc.data();
                        if (c.studentIds && Array.isArray(c.studentIds)) {
                            c.studentIds.forEach((sid: string) => students.add(sid));
                        }
                        if (c.date >= todayStr) {
                            upcoming++;
                        }
                    });

                    setAssignedStudentsCount(students.size);
                    setUpcomingClassesCount(upcoming);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchStats();
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
                specialization,
                profileImage
            });
            await refreshUser();
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
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Teacher Profile</h1>
                <p className="text-gray-500 mt-2">Manage your teaching portfolio and public visibility.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left col - Photo and basic public stats */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-500 to-emerald-700"></div>
                        <div className="relative group mt-6 mb-4">
                            <div className="size-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center relative z-10">
                                {isUploading ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                ) : profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-300">{user?.name?.charAt(0) || "T"}</span>
                                )}
                            </div>
                            <label className="absolute bottom-1 right-1 z-20 bg-white size-10 rounded-full border border-gray-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
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
                        <h2 className="text-xl font-bold text-gray-900">{name || "Unnamed Teacher"}</h2>
                        <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mt-1">{specialization || "Instructor"}</p>

                        <div className="w-full grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                            <div>
                                <p className="text-2xl font-black text-gray-900">{assignedStudentsCount}</p>
                                <p className="text-xs text-gray-500 font-bold uppercase">Students</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{upcomingClassesCount}</p>
                                <p className="text-xs text-gray-500 font-bold uppercase">Classes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right col - Editable Form */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
                        <form onSubmit={handleSaveProfile} className="space-y-6 pb-28 md:pb-0">

                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Personal Details</h3>

                            <div className="space-y-1.5 md:space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 h-12 md:h-auto md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-base md:text-sm"
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
                                <p className="text-xs text-gray-400 mt-1">Contact your administrator to change your associated email.</p>
                            </div>

                            <div className="space-y-1.5 md:space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Specialization</label>
                                <input
                                    type="text"
                                    value={specialization}
                                    placeholder="e.g. English Grammar & Essay Writing"
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    className="w-full px-4 h-12 md:h-auto md:py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-base md:text-sm"
                                />
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-0 md:pt-8 flex justify-end z-40 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full md:w-auto px-8 py-3.5 md:py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md active:scale-95 md:hover:bg-gray-800 transition-all disabled:opacity-50 text-base md:text-sm"
                                >
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
