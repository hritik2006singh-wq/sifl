"use client";

import { useState, useEffect } from "react";
import { db, firebaseConfig } from "@/lib/firebase-client";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    setDoc,
    query,
    where
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminGuard } from "@/hooks/useRoleGuard";
import toast from "react-hot-toast";
import ClassSchedulerModal from "@/components/ClassSchedulerModal";

const LEVELS = ["Beginner (A1)", "Elementary (A2)", "Intermediate (B1)", "Upper Intermediate (B2)", "Advanced (C1)", "Mastery (C2)"];
const LANGUAGE_TRACKS = ["English", "German", "French", "Spanish", "Japanese", "Other"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function StudentsClient() {
    const { user, loading: authLoading } = useAdminGuard();
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [selectedStudentForSchedule, setSelectedStudentForSchedule] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newName, setNewName] = useState("");
    const [newDob, setNewDob] = useState("");
    const [newGender, setNewGender] = useState(GENDERS[0]);
    const [newPhone, setNewPhone] = useState("");
    const [newAddress, setNewAddress] = useState({ street: "", city: "", state: "", country: "" });
    const [newEmergencyContact, setNewEmergencyContact] = useState({ name: "", phone: "", relation: "" });
    const [newLanguageTrack, setNewLanguageTrack] = useState(LANGUAGE_TRACKS[0]);
    const [newLevel, setNewLevel] = useState(LEVELS[0]);
    const [newTeacherId, setNewTeacherId] = useState("");
    const [newStatus, setNewStatus] = useState<"paid" | "unpaid">("unpaid");

    const [loading, setLoading] = useState(true);

    const calculateAge = (dobString: string) => {
        if (!dobString) return 0;
        const today = new Date();
        const birthDate = new Date(dobString);
        let ageNum = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            ageNum--;
        }
        return ageNum;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Students
                const qStudents = query(collection(db, "users"), where("role", "==", "student"));
                const snapStudents = await getDocs(qStudents);
                const studentData = snapStudents.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                }));
                setStudents(studentData);

                // Fetch Teachers for assignment dropdown
                const qTeachers = query(collection(db, "users"), where("role", "==", "teacher"));
                const snapTeachers = await getDocs(qTeachers);
                const teacherData = snapTeachers.docs.map(t => ({ id: t.id, name: t.data().name }));
                setTeachers(teacherData);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const togglePaid = async (studentId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "users", studentId), {
                is_paid: !currentStatus,
            });

            setStudents((prev) =>
                prev.map((student) =>
                    student.id === studentId
                        ? { ...student, is_paid: !currentStatus }
                        : student
                )
            );
            toast.success("Payment status updated");
        } catch (err) {
            console.error("Error updating payment status:", err);
            toast.error("Failed to update status");
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newEmail || !newDob) return toast.error("Please fill all required core fields");

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
            const ageCalculated = calculateAge(newDob);

            const userData = {
                name: newName,
                email: newEmail,
                dob: newDob,
                age: ageCalculated,
                gender: newGender,
                phone: newPhone,
                address: newAddress,
                emergencyContact: newEmergencyContact,
                languageTrack: newLanguageTrack,
                level: newLevel,
                assignedTeacherId: newTeacherId || null,
                role: "student",
                is_paid: newStatus === "paid",
                status: "active",
                profileImage: "",
                createdAt: new Date().toISOString()
            };

            const { ensureUserProfile } = await import("@/lib/user-service");
            await ensureUserProfile(newUser, userData as any);

            setStudents((prev) => [
                { id: newUser.uid, ...userData },
                ...prev,
            ]);

            setShowAddModal(false);
            resetForm();
            toast.success("Student CRM profile created successfully");
        } catch (err: any) {
            toast.error("Error creating student: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewEmail("");
        setNewPassword("");
        setNewName("");
        setNewDob("");
        setNewGender(GENDERS[0]);
        setNewPhone("");
        setNewAddress({ street: "", city: "", state: "", country: "" });
        setNewEmergencyContact({ name: "", phone: "", relation: "" });
        setNewLanguageTrack(LANGUAGE_TRACKS[0]);
        setNewLevel(LEVELS[0]);
        setNewTeacherId("");
        setNewStatus("unpaid");
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading student CRM data...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Student CRM</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage enrollments, levels, and CRM profiles</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Register Student
                </button>
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                            <th className="py-4 px-4 font-bold">Student Identity</th>
                            <th className="py-4 px-4 font-bold">Track & Level</th>
                            <th className="py-4 px-4 font-bold">Age</th>
                            <th className="py-4 px-4 font-bold">Billing</th>
                            <th className="py-4 px-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map((student) => (
                            <tr
                                key={student.id}
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center overflow-hidden">
                                            {student.profileImage ? <img src={student.profileImage} className="w-full h-full object-cover" /> : student.name?.charAt(0) || "-"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{student.name || "N/A"}</p>
                                            <p className="text-xs text-gray-500">
                                                <Link
                                                    href={`/admin/students/${student.id}`}
                                                    className="hover:text-primary hover:underline"
                                                >
                                                    {student.email}
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-4 px-4">
                                    <p className="text-sm font-bold text-gray-900">{student.languageTrack || "N/A"}</p>
                                    <p className="text-xs text-gray-500">{student.level || "N/A"}</p>
                                </td>

                                <td className="py-4 px-4 text-sm font-bold text-gray-700">{student.age || "-"}</td>

                                <td className="py-4 px-4">
                                    <button
                                        onClick={() => togglePaid(student.id, student.is_paid)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${student.is_paid
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                            }`}
                                    >
                                        {student.is_paid ? "PAID" : "UNPAID"}
                                    </button>
                                </td>

                                <td className="py-4 px-4 text-right space-x-3">
                                    <button
                                        onClick={() => {
                                            setSelectedStudentForSchedule(student.id);
                                            setShowScheduler(true);
                                        }}
                                        className="text-sm text-emerald-600 font-bold hover:underline"
                                    >
                                        Schedule Class
                                    </button>
                                    <Link
                                        href={`/admin/students/${student.id}`}
                                        className="text-sm text-primary font-bold hover:underline"
                                    >
                                        Manage CRM
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {students.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500">
                                    No students found in the CRM.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col space-y-4 mt-4 mb-8">
                {students.map((student) => (
                    <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center overflow-hidden shrink-0">
                                {student.profileImage ? <img src={student.profileImage} className="w-full h-full object-cover" /> : student.name?.charAt(0) || "-"}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-base">{student.name || "N/A"}</h3>
                                <p className="text-sm text-gray-500 truncate">{student.email}</p>
                            </div>
                            <button
                                onClick={() => togglePaid(student.id, student.is_paid)}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${student.is_paid
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                    }`}
                            >
                                {student.is_paid ? "PAID" : "UNPAID"}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Track</p>
                                <p className="text-sm font-semibold text-gray-900">{student.languageTrack || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Level</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{student.level || "N/A"}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => {
                                    setSelectedStudentForSchedule(student.id);
                                    setShowScheduler(true);
                                }}
                                className="flex-1 text-sm font-bold bg-emerald-50 text-emerald-700 py-2.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            >
                                Schedule
                            </button>
                            <Link
                                href={`/admin/students/${student.id}`}
                                className="flex-1 text-center text-sm font-bold bg-primary/10 text-primary py-2.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
                            >
                                Manage
                            </Link>
                        </div>
                    </div>
                ))}
                {students.length === 0 && (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        No students found.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm overflow-hidden w-full">
                    <div className="bg-white w-full max-w-3xl shadow-2xl overflow-hidden rounded-t-[2rem] md:rounded-3xl mt-20 md:my-8 h-[calc(100vh-5rem)] md:h-auto flex flex-col animate-slide-up md:animate-none">
                        <div className="px-6 py-5 md:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">Register New Student</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 bg-white size-8 flex items-center justify-center rounded-full shadow-sm md:shadow-none md:bg-transparent md:size-auto">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddStudent} className="p-6 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto pb-32 md:pb-8">

                            {/* Academic Alignment */}
                            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Language Track</label>
                                    <select value={newLanguageTrack} onChange={(e) => setNewLanguageTrack(e.target.value)} className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-900 outline-none">
                                        {LANGUAGE_TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Proficiency Level</label>
                                    <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-900 outline-none">
                                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Assigned Teacher</label>
                                    <select value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)} className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-900 outline-none">
                                        <option value="">-- Unassigned --</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Core Details */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2">Core Identity</h4>
                                    <input type="text" required placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    <input type="email" required placeholder="Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    <input type="text" required placeholder="Temporary Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 font-bold ml-1 mb-1 block">Date of Birth</label>
                                            <input type="date" required value={newDob} onChange={(e) => setNewDob(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-bold ml-1 mb-1 block">Gender</label>
                                            <select value={newGender} onChange={(e) => setNewGender(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-sm font-bold text-gray-600">Calculated Age:</span>
                                        <span className="text-lg font-black text-gray-900">{calculateAge(newDob) || "-"} years</span>
                                    </div>
                                </div>

                                {/* Contact & CRM Details */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2">Contact & CRM</h4>
                                    <input type="tel" placeholder="Phone Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />

                                    <div className="space-y-2">
                                        <input type="text" placeholder="Street Address" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                        <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="State/Prov" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                            <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest block mb-2">Emergency Contact</label>
                                        <div className="space-y-2 p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                                            <input type="text" placeholder="Contact Name" value={newEmergencyContact.name} onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, name: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="Relation" value={newEmergencyContact.relation} onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, relation: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                                                <input type="tel" placeholder="Phone" value={newEmergencyContact.phone} onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, phone: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest block mb-2">Billing Initial Status</label>
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value as any)}
                                            className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none ${newStatus === 'paid' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'}`}
                                        >
                                            <option value="unpaid">Unpaid (Pending Action)</option>
                                            <option value="paid">Paid (Active Member)</option>
                                        </select>
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
                                    className="flex-1 md:flex-none px-8 py-3.5 md:py-3 text-base md:text-sm font-bold bg-gray-900 text-white rounded-xl shadow-md md:hover:bg-gray-800 md:hover:scale-105 transition-all disabled:opacity-50 active:scale-95 md:active:scale-100"
                                >
                                    {isSubmitting ? "Processing..." : "Register Student"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ClassSchedulerModal
                isOpen={showScheduler}
                onClose={() => setShowScheduler(false)}
                prefillStudentId={selectedStudentForSchedule}
            />
        </div>
    );
}