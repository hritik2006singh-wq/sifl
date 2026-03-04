"use client";

import { useEffect, useState } from "react";
import { db, auth, firebaseConfig } from "@/lib/firebase-client";
import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    updateDoc,
    addDoc,
    writeBatch,
    serverTimestamp
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminGuard } from "@/hooks/useRoleGuard";
import toast from "react-hot-toast";

type AccountStatus = "active" | "suspended" | "archived";

const LANGUAGES = ["English", "German", "French", "Spanish", "Japanese", "Other"];
const SPECIALIZATION_OPTIONS = ["Grammar", "Spoken English", "IELTS", "TOEFL", "Business English", "Conversation", "Exam Preparation", "Academic Writing", "Custom"];

function StatusBadge({ status }: { status: AccountStatus }) {
    if (status === "suspended") {
        return (
            <span className="inline-flex items-center text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                SUSPENDED
            </span>
        );
    }
    if (status === "archived") {
        return (
            <span className="inline-flex items-center text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                ARCHIVED
            </span>
        );
    }
    return (
        <span className="inline-flex items-center text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            ACTIVE
        </span>
    );
}

type ConfirmModal = { isOpen: boolean; targetId: string; targetRole: string };
type ArchiveBlockModal = { isOpen: boolean; teacherId: string; studentCount: number };
type ReassignModal = { isOpen: boolean; teacherId: string };

export default function TeachersClient() {
    const { user, loading: authLoading } = useAdminGuard();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [activeTeachers, setActiveTeachers] = useState<any[]>([]); // for reassignment dropdown
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);
    const [archiveBlockModal, setArchiveBlockModal] = useState<ArchiveBlockModal | null>(null);
    const [reassignModal, setReassignModal] = useState<ReassignModal | null>(null);
    const [reassignTargetTeacherId, setReassignTargetTeacherId] = useState("");

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

    const fetchTeachers = async () => {
        try {
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
            setActiveTeachers(data.filter((t: any) => (t.accountStatus ?? "active") === "active" && t.role === "teacher"));
        } catch (err) {
            console.error("Error fetching teachers", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTeachers();
        }
    }, [user, router]);

    const triggerRoleChange = (userId: string, targetRole: string) => {
        setConfirmModal({ isOpen: true, targetId: userId, targetRole });
    };

    const confirmRoleChange = async () => {
        if (!confirmModal) return;
        const { targetId, targetRole } = confirmModal;
        setConfirmModal(null);
        try {
            await updateDoc(doc(db, "users", targetId), { role: targetRole });
            setTeachers(prev => prev.map(t => t.id === targetId ? { ...t, role: targetRole } : t));
            toast.success("Role updated successfully");
        } catch (e: any) {
            console.error("Failed to update role", e);
            toast.error("Failed to update role");
        }
    };

    const writeAuditLog = async (
        userId: string,
        previousStatus: AccountStatus,
        newStatus: AccountStatus,
        reason: string
    ) => {
        try {
            await addDoc(collection(db, "user_status_logs"), {
                userId,
                previousStatus,
                newStatus,
                reason,
                updatedBy: auth.currentUser?.uid ?? "unknown",
                timestamp: serverTimestamp(),
            });
        } catch (err) {
            console.error("Audit log failed:", err);
        }
    };

    // Archive teacher — check for active students first
    const handleArchiveTeacher = async (teacherId: string) => {
        try {
            const q = query(
                collection(db, "users"),
                where("assignedTeacherId", "==", teacherId),
                where("accountStatus", "==", "active"),
                where("role", "==", "student")
            );
            const snap = await getDocs(q);

            if (!snap.empty) {
                setArchiveBlockModal({ isOpen: true, teacherId, studentCount: snap.size });
                return;
            }

            // Safe to archive
            const teacher = teachers.find(t => t.id === teacherId);
            const prev: AccountStatus = teacher?.accountStatus ?? "active";
            await updateDoc(doc(db, "users", teacherId), {
                accountStatus: "archived",
                accountStatusReason: "Archived by admin",
                accountStatusUpdatedAt: serverTimestamp(),
                accountStatusUpdatedBy: auth.currentUser?.uid ?? null,
            });
            await writeAuditLog(teacherId, prev, "archived", "Archived by admin");
            setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, accountStatus: "archived" } : t));
            toast.success("Teacher archived successfully");
        } catch (e: any) {
            console.error("Archive failed:", e);
            toast.error("Failed to archive teacher");
        }
    };

    const handleRestoreTeacher = async (teacherId: string) => {
        try {
            const teacher = teachers.find(t => t.id === teacherId);
            const prev: AccountStatus = teacher?.accountStatus ?? "archived";
            await updateDoc(doc(db, "users", teacherId), {
                accountStatus: "active",
                accountStatusReason: "Restored by admin",
                accountStatusUpdatedAt: serverTimestamp(),
                accountStatusUpdatedBy: auth.currentUser?.uid ?? null,
            });
            await writeAuditLog(teacherId, prev, "active", "Restored by admin");
            setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, accountStatus: "active" } : t));
            toast.success("Teacher restored successfully");
        } catch (e: any) {
            console.error("Restore failed:", e);
            toast.error("Failed to restore teacher");
        }
    };

    // Reassign all active students from blocked teacher to new teacher
    const handleReassign = async () => {
        if (!reassignModal || !reassignTargetTeacherId) return;
        const { teacherId } = reassignModal;
        setReassignModal(null);

        try {
            const q = query(
                collection(db, "users"),
                where("assignedTeacherId", "==", teacherId),
                where("accountStatus", "==", "active"),
                where("role", "==", "student")
            );
            const snap = await getDocs(q);

            // Chunk batches into 500
            const CHUNK_SIZE = 500;
            const docs = snap.docs;

            for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
                const chunk = docs.slice(i, i + CHUNK_SIZE);
                const batch = writeBatch(db);
                chunk.forEach(d => {
                    batch.update(d.ref, { assignedTeacherId: reassignTargetTeacherId });
                });
                await batch.commit();
            }

            toast.success(`${snap.size} student(s) reassigned`);
            // Now allow archive
            await handleArchiveTeacher(teacherId);
        } catch (e: any) {
            console.error("Reassign failed:", e);
            toast.error("Failed to reassign students");
        } finally {
            setReassignTargetTeacherId("");
        }
    };

    const toggleSpecialization = (spec: string) => {
        setNewSpecializations(prev =>
            prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
        );
    };

    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { initializeApp, getApps } = await import("firebase/app");
            const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth");

            const secondaryApp = getApps().find(app => app.name === "Secondary") || initializeApp(firebaseConfig, "Secondary");
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                newEmail,
                newPassword
            );

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
                accountStatus: "active" as AccountStatus,
                accountStatusReason: null,
                accountStatusUpdatedAt: serverTimestamp(),
                accountStatusUpdatedBy: auth.currentUser?.uid ?? null,
                createdAt: new Date().toISOString(),
                profileImage: ""
            };

            const { ensureUserProfile } = await import("@/lib/user-service");
            await ensureUserProfile(newUser, userData as any);

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
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 hover:scale-105 transition-all flex justify-between items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span>Add Staff Member</span>
                </button>
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                            <th className="py-4 px-4 font-bold">Staff Member</th>
                            <th className="py-4 px-4 font-bold">Role</th>
                            <th className="py-4 px-4 font-bold">Status</th>
                            <th className="py-4 px-4 font-bold">Students</th>
                            <th className="py-4 px-4 font-bold">Upcoming</th>
                            <th className="py-4 px-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {teachers.map((t) => {
                            const accountStatus: AccountStatus = t.accountStatus ?? "active";
                            return (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
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
                                            onChange={(e) => triggerRoleChange(t.id, e.target.value)}
                                            disabled={t.id === user?.uid}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer ${t.role === 'admin'
                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}
                                        >
                                            <option value="teacher">Teacher</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="py-4 px-4">
                                        <StatusBadge status={accountStatus} />
                                    </td>
                                    <td className="py-4 px-4 text-sm font-semibold text-gray-700">{t.studentCount}</td>
                                    <td className="py-4 px-4 text-sm text-gray-700">{t.classesCount}</td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/teachers/${t.id}`}
                                                className="text-sm text-primary font-bold hover:underline"
                                            >
                                                View Details
                                            </Link>
                                            {accountStatus !== "archived" && t.id !== user?.uid && (
                                                <button
                                                    onClick={() => handleArchiveTeacher(t.id)}
                                                    className="text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                >
                                                    Archive
                                                </button>
                                            )}
                                            {accountStatus === "archived" && (
                                                <button
                                                    onClick={() => handleRestoreTeacher(t.id)}
                                                    className="text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                                                >
                                                    Restore
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {teachers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-500">No staff members found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col space-y-4 mt-4 mb-8">
                {teachers.map((t) => {
                    const accountStatus: AccountStatus = t.accountStatus ?? "active";
                    return (
                        <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center overflow-hidden shrink-0">
                                    {t.profileImage ? <img src={t.profileImage} className="w-full h-full object-cover" /> : t.name?.charAt(0) || "-"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-base truncate">{t.name || "N/A"}</h3>
                                    <p className="text-sm text-gray-500 truncate">{t.email}</p>
                                </div>
                                <StatusBadge status={accountStatus} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Role</p>
                                    <select
                                        value={t.role}
                                        onChange={(e) => triggerRoleChange(t.id, e.target.value)}
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

                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/teachers/${t.id}`}
                                    className="flex-1 text-center text-sm font-bold bg-primary/10 text-primary py-2.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                    View Details
                                </Link>
                                {accountStatus !== "archived" && t.id !== user?.uid && (
                                    <button
                                        onClick={() => handleArchiveTeacher(t.id)}
                                        className="px-4 text-sm font-bold text-gray-600 bg-gray-100 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors"
                                    >
                                        Archive
                                    </button>
                                )}
                                {accountStatus === "archived" && (
                                    <button
                                        onClick={() => handleRestoreTeacher(t.id)}
                                        className="px-4 text-sm font-bold text-green-700 bg-green-50 py-2.5 rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
                                    >
                                        Restore
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {teachers.length === 0 && (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        No staff members found.
                    </div>
                )}
            </div>

            {/* Creation Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm overflow-hidden w-full">
                    <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden rounded-t-[2rem] md:rounded-3xl mt-20 md:my-8 h-[calc(100vh-5rem)] md:max-h-[90vh] flex flex-col animate-slide-up md:animate-none">
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

            {/* Role Confirm Modal */}
            {confirmModal && confirmModal.isOpen && (
                <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 pt-8 pb-6 text-center border-2 border-red-100">
                        <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl">warning</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Change Role?</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Are you sure you want to change this user's role to '{confirmModal.targetRole}'? This changes their system-wide permissions immediately.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all shadow-red-500/30"
                            >
                                Yes, Change
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Archive Block Modal — teacher has active students */}
            {archiveBlockModal && archiveBlockModal.isOpen && (
                <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 pt-8 pb-6 text-center border-2 border-yellow-100">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl">group</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cannot Archive</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            This teacher has <strong>{archiveBlockModal.studentCount}</strong> active assigned student(s). Reassign them before archiving.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setArchiveBlockModal(null)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setArchiveBlockModal(null);
                                    setReassignModal({ isOpen: true, teacherId: archiveBlockModal.teacherId });
                                }}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all"
                            >
                                Reassign Students
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Modal */}
            {reassignModal && reassignModal.isOpen && (
                <div className="fixed inset-0 bg-gray-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 pt-8 pb-6 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Reassign Students</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-5 text-center">
                            Select an active teacher to reassign all students to.
                        </p>
                        <select
                            value={reassignTargetTeacherId}
                            onChange={(e) => setReassignTargetTeacherId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none mb-5 bg-white"
                        >
                            <option value="">Select teacher...</option>
                            {activeTeachers
                                .filter((t) => t.id !== reassignModal.teacherId)
                                .map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name || t.email}
                                    </option>
                                ))}
                        </select>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setReassignModal(null); setReassignTargetTeacherId(""); }}
                                className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReassign}
                                disabled={!reassignTargetTeacherId}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
                            >
                                Confirm & Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}