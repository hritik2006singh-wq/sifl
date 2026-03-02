"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    updateDoc
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminGuard } from "@/hooks/useRoleGuard";
import toast from "react-hot-toast";

const LANGUAGES = ["English", "German", "French", "Spanish", "Japanese", "Other"];
const SPECIALIZATION_OPTIONS = ["Grammar", "Spoken English", "IELTS", "TOEFL", "Business English", "Conversation", "Exam Preparation", "Academic Writing", "Custom"];

export default function TeachersClient() {
    const { user, loading: authLoading } = useAdminGuard();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newAddress, setNewAddress] = useState({ street: "", city: "", state: "", country: "" });
    const [newRole, setNewRole] = useState("teacher");
    const [newLanguage, setNewLanguage] = useState("English");
    const [newSpecializations, setNewSpecializations] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                // Fetch both teachers and admins for multi-admin management
                const q = query(
                    collection(db, "users"),
                    where("role", "in", ["teacher", "admin"])
                );

                const snapshot = await getDocs(q);

                const data = await Promise.all(snapshot.docs.map(async (teacherDoc) => {
                    const tId = teacherDoc.id;
                    const tData = teacherDoc.data();

                    const classesQuery = query(collection(db, "classes"), where("teacherId", "==", tId));
                    const classesSnap = await getDocs(classesQuery);
                    const classesData = classesSnap.docs.map(c => c.data());

                    const studentSet = new Set();
                    classesData.forEach(c => {
                        if (c.studentIds && Array.isArray(c.studentIds)) {
                            c.studentIds.forEach((sid: string) => studentSet.add(sid));
                        }
                    });

                    return {
                        id: tId,
                        ...tData,
                        studentCount: studentSet.size,
                        classesCount: classesData.length
                    };
                }));

                setTeachers(data);
            } catch (err) {
                console.error("Error fetching teachers", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTeachers();
        }
    }, [user, router]);

    const handleRoleChange = async (userId: string, targetRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${targetRole}?`)) return;
        try {
            await updateDoc(doc(db, "users", userId), { role: targetRole });
            setTeachers(prev => prev.map(t => t.id === userId ? { ...t, role: targetRole } : t));
            toast.success("Role updated successfully");
        } catch (e: any) {
            console.error("Failed to update role", e);
            toast.error("Failed to update role");
        }
    };

    const toggleSpecialization = (spec: string) => {
        setNewSpecializations(prev =>
            prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
        );
    };

    // 🔥 Create New User Account without dropping admin session
    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { initializeApp, getApps } = await import("firebase/app");
            const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth");
            const { firebaseConfig } = await import("@/lib/firebase");

            const secondaryApp = getApps().find(app => app.name === "Secondary") || initializeApp(firebaseConfig, "Secondary");
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                newEmail,
                newPassword
            );

            // Log out right away from secondary so no conflicts happen
            await secondaryAuth.signOut();

            const newUser = userCredential.user;

            const userData = {
                email: newEmail,
                name: newName,
                phone: newPhone,
                address: newAddress,
                role: newRole,
                languagesTaught: newLanguage,
                specializations: newSpecializations,
                status: "active",
                createdAt: new Date().toISOString(),
                profileImage: ""
            };

            await setDoc(doc(db, "users", newUser.uid), userData);

            setTeachers((prev) => [
                ...prev,
                {
                    id: newUser.uid,
                    ...userData,
                    studentCount: 0,
                    classesCount: 0
                },
            ]);

            setShowAddModal(false);
            setNewEmail("");
            setNewPassword("");
            setNewName("");
            setNewPhone("");
            setNewAddress({ street: "", city: "", state: "", country: "" });
            setNewRole("teacher");
            setNewLanguage("English");
            setNewSpecializations([]);
            toast.success(`${newRole === 'admin' ? 'Admin' : 'Teacher'} created successfully`);
        } catch (err: any) {
            toast.error("Error creating user: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Loading staff data...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage Teachers and Administrators</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Add Staff Member
                </button>
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                            <th className="py-4 px-4 font-bold">Staff Member</th>
                            <th className="py-4 px-4 font-bold">Role</th>
                            <th className="py-4 px-4 font-bold">Students</th>
                            <th className="py-4 px-4 font-bold">Upcoming</th>
                            <th className="py-4 px-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {teachers.map((t) => (
                            <tr
                                key={t.id}
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center overflow-hidden">
                                            {t.profileImage ? <img src={t.profileImage} className="w-full h-full object-cover" /> : t.name?.charAt(0) || "-"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{t.name || "N/A"}</p>
                                            <p className="text-xs text-gray-500">{t.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <select
                                        value={t.role}
                                        onChange={(e) => handleRoleChange(t.id, e.target.value)}
                                        disabled={t.id === user?.uid} // Don't let user demote themselves easily here to avoid instant lockout mistakes
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer ${t.role === 'admin'
                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}
                                    >
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="py-4 px-4 text-sm font-semibold text-gray-700">{t.studentCount}</td>
                                <td className="py-4 px-4 text-sm text-gray-700">{t.classesCount}</td>
                                <td className="py-4 px-4 text-right">
                                    <Link
                                        href={`/admin/teachers/${t.id}`}
                                        className="text-sm text-primary font-bold hover:underline"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500">No staff members found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col space-y-4 mt-4 mb-8">
                {teachers.map((t) => (
                    <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center overflow-hidden shrink-0">
                                {t.profileImage ? <img src={t.profileImage} className="w-full h-full object-cover" /> : t.name?.charAt(0) || "-"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-base truncate">{t.name || "N/A"}</h3>
                                <p className="text-sm text-gray-500 truncate">{t.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Role</p>
                                <select
                                    value={t.role}
                                    onChange={(e) => handleRoleChange(t.id, e.target.value)}
                                    disabled={t.id === user?.uid}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-full border outline-none cursor-pointer ${t.role === 'admin'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}
                                >
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Students</p>
                                    <p className="text-sm font-semibold text-gray-900">{t.studentCount}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Classes</p>
                                    <p className="text-sm font-semibold text-gray-900">{t.classesCount}</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/admin/teachers/${t.id}`}
                            className="w-full text-center text-sm font-bold bg-primary/10 text-primary py-2.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                            View Details
                        </Link>
                    </div>
                ))}
                {teachers.length === 0 && (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        No staff members found.
                    </div>
                )}
            </div>

            {/* Creation Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm overflow-hidden w-full">
                    <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden rounded-t-[2rem] md:rounded-3xl mt-20 md:my-8 h-[calc(100vh-5rem)] md:h-auto flex flex-col animate-slide-up md:animate-none">
                        <div className="px-6 py-5 md:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">Create Staff Member</h3>
                            <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 bg-white size-8 flex items-center justify-center rounded-full shadow-sm md:shadow-none md:bg-transparent md:size-auto">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddTeacher} className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto pb-32 md:pb-8">

                            {/* Role Selection */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-blue-900">Account Role</p>
                                    <p className="text-xs text-blue-700/80">Admins have full access. Teachers only see assigned students.</p>
                                </div>
                                <select
                                    className="px-4 py-2 rounded-lg border-blue-200 text-sm font-bold text-blue-900 border outline-none cursor-pointer"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                >
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Core Details */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Core Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" required placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    <input type="email" required placeholder="Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    <input type="text" required placeholder="Temporary Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    <input type="tel" placeholder="Phone Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                            </div>

                            {/* Address Structure */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Address</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Street Address" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="col-span-1 md:col-span-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="State/Prov" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                        <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                </div>
                            </div>

                            {/* Teaching Profile */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Teaching Profile</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Primary Language</label>
                                        <select value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Specializations</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIALIZATION_OPTIONS.map(spec => (
                                                <button
                                                    key={spec}
                                                    type="button"
                                                    onClick={() => toggleSpecialization(spec)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${newSpecializations.includes(spec) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {spec}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-0 md:pt-6 flex justify-end gap-3 z-40 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 md:flex-none px-6 py-3.5 md:py-3 text-base md:text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 active:scale-95 md:active:scale-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 md:flex-none px-6 py-3.5 md:py-3 text-base md:text-sm font-bold bg-gray-900 text-white rounded-xl shadow-md md:hover:bg-gray-800 md:hover:scale-105 transition-all disabled:opacity-50 active:scale-95 md:active:scale-100"
                                >
                                    {isSubmitting ? "Processing..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}