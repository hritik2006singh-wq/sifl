"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase-client";
import { collection, getDocs, doc, getDoc, query, where, setDoc, updateDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAdminGuard } from "@/hooks/useRoleGuard";

export default function TeacherDetailClient({ id }: { id: string }) {
    const { user, loading: authLoading } = useAdminGuard();
    const [teacher, setTeacher] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"assign" | null>(null);
    const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<Set<string>>(new Set());

    // Lifecycle Modals
    const [archiveBlockModal, setArchiveBlockModal] = useState(false);
    const [reassignModalOpen, setReassignModalOpen] = useState(false);
    const [activeTeachers, setActiveTeachers] = useState<any[]>([]);
    const [selectedReassignTeacher, setSelectedReassignTeacher] = useState("");

    useEffect(() => {
        const fetchTeacherData = async () => {
            if (!id) return;

            try {
                const teacherDoc = await getDoc(doc(db, "users", id));

                if (!teacherDoc.exists()) {
                    setTeacher(null);
                    return;
                }

                setTeacher({ id: teacherDoc.id, ...teacherDoc.data() });

                // Fetch classes assigned to teacher
                const classesQuery = query(collection(db, "classes"), where("teacherId", "==", id));
                const classesSnap = await getDocs(classesQuery);
                const fetchedClasses = classesSnap.docs.map(c => ({ id: c.id, ...c.data() }));
                setClasses(fetchedClasses);

                // Fetch students directly assigned to teacher via new schema
                const studentsQuery = query(collection(db, "users"), where("role", "==", "student"), where("assignedTeacherId", "==", id));
                const studentsSnap = await getDocs(studentsQuery);
                const fetchedStudents = studentsSnap.docs.map(s => ({ id: s.id, ...s.data() }));
                setStudents(fetchedStudents);

                // Initialize assigned set
                setSelectedStudentsToAssign(new Set(fetchedStudents.map(s => s.id)));

                // Fetch all students to populate modal
                const allStudentsQuery = query(collection(db, "users"), where("role", "==", "student"));
                const allStudentsSnap = await getDocs(allStudentsQuery);
                setAllStudents(allStudentsSnap.docs.map(s => ({ id: s.id, ...s.data() })));

            } catch (err) {
                console.error("Error fetching teacher details:", err);
                toast.error("Failed to fetch teacher details");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTeacherData();
        }
    }, [id, user]);

    const handleSendPasswordReset = async () => {
        if (!teacher?.email) return toast.error("No teacher email found");
        try {
            await sendPasswordResetEmail(auth, teacher.email);
            toast.success("Password reset email sent to " + teacher.email);
        } catch (error: any) {
            console.error("Error sending reset email:", error);
            toast.error(error.message || "Failed to send reset email");
        }
    };

    const toggleStudent = (studentId: string) => {
        const newSet = new Set(selectedStudentsToAssign);
        if (newSet.has(studentId)) {
            newSet.delete(studentId);
        } else {
            newSet.add(studentId);
        }
        setSelectedStudentsToAssign(newSet);
    };

    const handleAssignStudents = async () => {
        try {
            const batchPromises = Array.from(selectedStudentsToAssign).map(studentId =>
                setDoc(doc(db, "users", studentId), { assignedTeacherId: id }, { merge: true })
            );
            await Promise.all(batchPromises);

            // Re-sync local state
            const updatedAssignedStudents = allStudents.filter(s => selectedStudentsToAssign.has(s.id));
            setStudents(updatedAssignedStudents);

            setModalOpen(false);
            toast.success("Students assigned successfully!");
        } catch (error) {
            console.error("Error assigning students:", error);
            toast.error("Failed to assign students");
        }
    };

    const handleLifecycleAction = async (newStatus: "active" | "suspended" | "archived") => {
        if (newStatus === "archived") {
            const q = query(collection(db, "users"), where("assignedTeacherId", "==", id), where("role", "==", "student"), where("accountStatus", "==", "active"));
            const snap = await getDocs(q);
            if (!snap.empty) {
                setArchiveBlockModal(true);
                return;
            }
        }

        try {
            await setDoc(doc(db, "users", id), {
                accountStatus: newStatus,
                accountStatusUpdatedAt: serverTimestamp(),
                accountStatusUpdatedBy: auth.currentUser?.uid ?? null
            }, { merge: true });

            setTeacher({ ...teacher, accountStatus: newStatus });
            toast.success(`Teacher status updated to ${newStatus}`);
        } catch (error) {
            console.error("Lifecycle error:", error);
            toast.error("Failed to update account status");
        }
    };

    const openReassignModal = async () => {
        setArchiveBlockModal(false);
        setReassignModalOpen(true);
        try {
            const q = query(collection(db, "users"), where("role", "==", "teacher"), where("accountStatus", "==", "active"));
            const snap = await getDocs(q);
            const teachersData = snap.docs.map(t => ({ id: t.id, ...t.data() })).filter(t => t.id !== id);
            setActiveTeachers(teachersData);
        } catch (e) {
            console.error("Failed fetching active teachers", e);
        }
    };

    const handleReassignAndArchive = async () => {
        if (!selectedReassignTeacher) return toast.error("Select a teacher");
        try {
            const q = query(collection(db, "users"), where("assignedTeacherId", "==", id), where("role", "==", "student"), where("accountStatus", "==", "active"));
            const snap = await getDocs(q);

            const CHUNK_SIZE = 500;
            const docs = snap.docs;

            for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
                const chunk = docs.slice(i, i + CHUNK_SIZE);
                const batch = writeBatch(db);
                chunk.forEach(d => {
                    batch.update(d.ref, { assignedTeacherId: selectedReassignTeacher });
                });
                await batch.commit();
            }

            toast.success(`${snap.size} students reassigned`);
            setReassignModalOpen(false);

            // Proceed to archive teacher
            await setDoc(doc(db, "users", id), {
                accountStatus: "archived",
                accountStatusUpdatedAt: serverTimestamp(),
                accountStatusUpdatedBy: auth.currentUser?.uid ?? null
            }, { merge: true });

            setTeacher({ ...teacher, accountStatus: "archived" });
            toast.success(`Teacher archived`);

        } catch (e) {
            console.error("Reassign failed", e);
            toast.error("Reassignment failed");
        }
    };

    if (authLoading || loading) {
        return <div className="p-6">Loading teacher data...</div>;
    }

    if (!teacher) {
        return <div className="p-6">Teacher not found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/teachers" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Teacher Overview</h1>
                </div>
                <div className="flex items-center gap-2">
                    {teacher.accountStatus === "suspended" && (
                        <div className="px-4 py-1.5 rounded-full text-sm font-bold border bg-yellow-50 text-yellow-700 border-yellow-200 uppercase tracking-wider">
                            SUSPENDED
                        </div>
                    )}
                    {teacher.accountStatus === "archived" && (
                        <div className="px-4 py-1.5 rounded-full text-sm font-bold border bg-gray-100 text-gray-500 border-gray-200 uppercase tracking-wider">
                            ARCHIVED
                        </div>
                    )}
                    {(!teacher.accountStatus || teacher.accountStatus === "active") && (
                        <div className="px-4 py-1.5 rounded-full text-sm font-bold border bg-green-50 text-green-700 border-green-200 uppercase tracking-wider">
                            ACTIVE INSTRUCTOR
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1">
                    <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mb-4">
                        {teacher.name?.charAt(0).toUpperCase() || teacher.email?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{teacher.name || "Unnamed Teacher"}</h2>
                    <p className="text-gray-500 text-sm mb-6">{teacher.email}</p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Classes</p>
                            <p className="font-medium text-lg">{classes.length}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
                            <p className="font-medium text-lg">{students.length}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                        <button
                            onClick={handleSendPasswordReset}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-lg transition-colors">
                            Send Reset Email
                        </button>
                        <button
                            onClick={() => {
                                setModalType("assign");
                                setModalOpen(true);
                            }}
                            className="w-full py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors">
                            Assign Students
                        </button>
                    </div>
                </div>

                {/* Right Column: Activity */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    {/* Classes */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">event</span>
                            Upcoming Classes
                        </h3>

                        {classes.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-sm text-gray-500">
                                        <th className="py-2 px-2">Title</th>
                                        <th className="py-2 px-2">Date & Time</th>
                                        <th className="py-2 px-2 text-center">Status</th>
                                        <th className="py-2 px-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((c, i) => (
                                        <tr key={c.id} className="border-b border-gray-50 last:border-0">
                                            <td className="py-3 px-2 font-medium">
                                                {c.title || "Untitled Class"}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-500">
                                                {c.dateTime ? new Date(c.dateTime).toLocaleString() : "-"}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${c.status === 'scheduled' ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                                                    {c.status || "Planned"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button className="text-primary hover:underline text-sm font-medium">Manage</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-8 text-center text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No classes assigned yet.
                            </div>
                        )}
                    </div>

                    {/* Students */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">group</span>
                            Assigned Students
                        </h3>
                        {students.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {students.map((s, i) => (
                                    <Link href={`/admin/students/${s.id}`} key={s.id} className="p-4 border border-gray-100 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                        <div className="size-10 bg-blue-50 text-blue-600 font-bold flex items-center justify-center rounded-lg">
                                            {s.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{s.email}</p>
                                            <p className="text-xs text-gray-500">{s.is_paid ? "Premium Student" : "Free Tier"}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No students tracked.
                            </div>
                        )}
                    </div>

                    {/* Account Control Lifecycle Panel */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-700">admin_panel_settings</span>
                            Account Control
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Manage this teacher's platform access lifecycle.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {(!teacher.accountStatus || teacher.accountStatus === "active") && (
                                <>
                                    <button
                                        onClick={() => handleLifecycleAction("suspended")}
                                        className="px-5 py-2.5 bg-yellow-50 text-yellow-700 font-bold text-sm rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
                                    >
                                        Suspend
                                    </button>
                                    <button
                                        onClick={() => handleLifecycleAction("archived")}
                                        className="px-5 py-2.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
                                    >
                                        Archive
                                    </button>
                                </>
                            )}
                            {teacher.accountStatus === "suspended" && (
                                <>
                                    <button
                                        onClick={() => handleLifecycleAction("active")}
                                        className="px-5 py-2.5 bg-green-50 text-green-700 font-bold text-sm rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                                    >
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => handleLifecycleAction("archived")}
                                        className="px-5 py-2.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
                                    >
                                        Archive
                                    </button>
                                </>
                            )}
                            {teacher.accountStatus === "archived" && (
                                <button
                                    onClick={() => handleLifecycleAction("active")}
                                    className="px-5 py-2.5 bg-green-50 text-green-700 font-bold text-sm rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                                >
                                    Restore
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-6">
                            {modalType === "assign" && "Assign Students"}
                        </h2>

                        {modalType === "assign" && (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto border p-2 rounded-lg">
                                    {allStudents.map((student: any) => (
                                        <label key={student.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                value={student.id}
                                                checked={selectedStudentsToAssign.has(student.id)}
                                                onChange={() => toggleStudent(student.id)}
                                            />
                                            {student.email || student.name || "Unknown Student"}
                                        </label>
                                    ))}
                                    {allStudents.length === 0 && <span className="text-gray-500">No students available.</span>}
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleAssignStudents}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex-1"
                                    >
                                        Assign Selected
                                    </button>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="bg-gray-300 px-4 py-2 rounded-lg flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Archive Block Modal */}
            {archiveBlockModal && (
                <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 pt-8 pb-6 text-center border-2 border-yellow-100">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl">group</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cannot Archive</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            This teacher has active assigned students. Reassign them before archiving.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setArchiveBlockModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={openReassignModal}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all"
                            >
                                Reassign Students
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Modal */}
            {reassignModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 pt-8 pb-6 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Reassign Students</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-5 text-center">
                            Select an active teacher to reassign all students to.
                        </p>
                        <select
                            value={selectedReassignTeacher}
                            onChange={(e) => setSelectedReassignTeacher(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none mb-5 bg-white"
                        >
                            <option value="">Select teacher...</option>
                            {activeTeachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name || t.email}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setReassignModalOpen(false); setSelectedReassignTeacher(""); }}
                                className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReassignAndArchive}
                                disabled={!selectedReassignTeacher}
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