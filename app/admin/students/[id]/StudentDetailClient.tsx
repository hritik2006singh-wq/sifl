"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase-client";
import { collection, getDocs, doc, getDoc, query, where, setDoc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAdminGuard } from "@/hooks/useRoleGuard";

const levelMap: Record<string, string[]> = {
    German: ["A1", "A2", "B1", "B2", "C1", "C2"],
    Japanese: ["N5", "N4", "N3", "N2", "N1"],
    English: ["Beginner", "Intermediate", "Advanced"],
    French: ["A1", "A2", "B1", "B2", "C1", "C2"],
    Spanish: ["A1", "A2", "B1", "B2", "C1", "C2"]
};

function slugify(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
}

export default function StudentDetailClient({ id }: { id: string }) {
    const { user, loading: authLoading } = useAdminGuard();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"edit" | "test" | null>(null);
    const [testTitle, setTestTitle] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");

    const [student, setStudent] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);

    // Feature Access
    const [allMaterials, setAllMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Attendance
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [attendanceDocs, setAttendanceDocs] = useState<any[]>([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Form Edits
    const [editForm, setEditForm] = useState<any>({
        isPaid: false,
        language: "",
        currentLevel: "",
        hasFullAccess: false,
        teacher_email: ""
    });

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                let studentDoc: any = await getDoc(doc(db, "users", id));
                if (!studentDoc.exists()) {
                    const q = query(
                        collection(db, "users"),
                        where("slug", "==", id),
                        where("role", "==", "student")
                    );
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        studentDoc = snap.docs[0];
                    } else {
                        toast.error("Student not found");
                        router.push("/admin/students");
                        return;
                    }
                }

                const studentData: any = { id: studentDoc.id, ...studentDoc.data() };

                if (studentData.assigned_teacher_id) {
                    const teacherDoc = await getDoc(doc(db, "users", studentData.assigned_teacher_id));
                    if (teacherDoc.exists()) {
                        studentData.teacher_email = teacherDoc.data().email;
                    }
                }

                setStudent(studentData);
                setEditForm({
                    isPaid: studentData.is_paid || false,
                    language: studentData.language || "",
                    currentLevel: studentData.currentLevel || "",
                    hasFullAccess: studentData.hasFullAccess || false,
                    teacher_email: studentData.teacher_email || ""
                });

                // Fetch Submissions
                const subsRef = collection(db, "assignment_submissions");
                const q = query(subsRef, where("student_id", "==", id));
                const snapshot = await getDocs(q);

                const subsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
                    const subInfo = docSnap.data();
                    let assignmentData: any = {};
                    if (subInfo.assignment_id) {
                        try {
                            const assignmentDoc = await getDoc(doc(db, "assignments", subInfo.assignment_id));
                            if (assignmentDoc.exists()) {
                                const assignment = assignmentDoc.data();
                                assignmentData = { id: assignmentDoc.id };

                                if (assignment.material_id) {
                                    const materialDoc = await getDoc(doc(db, "materials", assignment.material_id));
                                    if (materialDoc.exists()) {
                                        assignmentData.materials = materialDoc.data();
                                    }
                                }
                            }
                        } catch (e) {
                            console.error("Error fetching assignment for sub", e);
                        }
                    }

                    return {
                        id: docSnap.id,
                        ...subInfo,
                        assignments: assignmentData
                    };
                }));

                setSubmissions(subsData);

                // Fetch All Materials for Tests
                const materialsSnap = await getDocs(collection(db, "materials"));
                setAllMaterials(materialsSnap.docs.map(m => ({ id: m.id, ...m.data() })));

            } catch (err) {
                console.error("Error fetching student details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStudentData();
        }
    }, [id, user]);

    const handleUpdateProfile = async () => {
        try {
            // 1. Safe claim verification & logging
            const idTokenResult = await auth.currentUser?.getIdTokenResult();
            console.log("TOKEN CLAIMS:", idTokenResult?.claims);

            if (!idTokenResult?.claims.admin) {
                console.error("ADMIN CLAIM MISSING! Firestore writes will fail.");
                toast.error("Permission Denied: Missing Admin Claim");
                return;
            }

            // 2. Correct document path: students/{studentId}
            const actualId = student?.id || id;
            const docRef = doc(db, "students", actualId);

            // Only update updatedAt if currentLevel changed
            const isLevelBumped = editForm.currentLevel !== student?.currentLevel;

            const payload: any = {
                is_paid: editForm.isPaid,
                status: editForm.isPaid ? "PAID" : "UNPAID",
                language: editForm.language,
                currentLevel: editForm.currentLevel,
                hasFullAccess: editForm.hasFullAccess,
                teacher_email: editForm.teacher_email,
            };

            if (isLevelBumped) {
                payload.updatedAt = serverTimestamp();
            }

            if (!student?.slug && student?.name) {
                payload.slug = `${slugify(student.name)}-${actualId.slice(0, 4)}`;
            }

            // 3. Use updateDoc (or setDoc with merge if doc might not exist yet)
            // As per architecture, student details belong in the 'students' collection
            await setDoc(docRef, payload, { merge: true });

            if (editForm.teacher_email) {
                const q = query(collection(db, "users"), where("email", "==", editForm.teacher_email), where("role", "==", "teacher"));
                const qSnap = await getDocs(q);
                if (!qSnap.empty) {
                    await updateDoc(docRef, { assignedTeacherId: qSnap.docs[0].id });
                }
            }

            // Locally update to show changes immediately without refresh
            setStudent({ ...student, ...payload });

            setModalOpen(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile: Insufficient Permissions");
        }
    };

    // Attendance Logic
    useEffect(() => {
        if (!id) return;
        const fetchAttendance = async () => {
            setAttendanceLoading(true);
            const start = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
            const end = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0);

            const startStr = start.toLocaleDateString('en-CA'); // YYYY-MM-DD local
            const endStr = end.toLocaleDateString('en-CA');

            try {
                const attRef = collection(db, "attendance");
                const q = query(
                    attRef,
                    where("studentId", "==", id),
                    where("date", ">=", startStr),
                    where("date", "<=", endStr)
                );
                const snap = await getDocs(q);
                setAttendanceDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) {
                console.error("Error fetching attendance", e);
            } finally {
                setAttendanceLoading(false);
            }
        };
        fetchAttendance();
    }, [id, currentMonthDate]);

    const handlePrevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));

    const toggleAttendance = async (dateStr: string) => {
        const existing = attendanceDocs.find(d => d.date === dateStr);
        const actualId = student?.id || id;
        const docId = `${actualId}_${dateStr}`;
        const docRef = doc(db, "attendance", docId);

        try {
            if (!existing) {
                // No Class -> Present
                const newData = {
                    studentId: actualId,
                    teacherId: student?.assignedTeacherId || "unassigned",
                    date: dateStr,
                    status: "present",
                    markedBy: auth.currentUser?.uid,
                    markedAt: serverTimestamp()
                };
                await setDoc(docRef, newData);
                setAttendanceDocs([...attendanceDocs, { id: docId, ...newData }]);
            } else if (existing.status === "present") {
                // Present -> Absent
                await setDoc(docRef, { status: "absent", markedBy: auth.currentUser?.uid, markedAt: serverTimestamp() }, { merge: true });
                setAttendanceDocs(attendanceDocs.map(d => d.id === docId ? { ...d, status: "absent" } : d));
            } else {
                // Absent -> No Class
                await deleteDoc(docRef);
                setAttendanceDocs(attendanceDocs.filter(d => d.id !== docId));
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to update attendance");
        }
    };

    const renderCalendar = () => {
        const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay();
        const days = [];

        const monthPrefix = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}`;

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`pad-${i}`} className="aspect-square"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
            const record = attendanceDocs.find(d => d.date === dateStr);

            let bgClass = "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-transparent";
            if (record?.status === "present") bgClass = "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 shadow-sm";
            if (record?.status === "absent") bgClass = "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 shadow-sm";

            days.push(
                <button
                    key={day}
                    onClick={() => toggleAttendance(dateStr)}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all active:scale-95 ${bgClass}`}
                    title={record ? `Click to change status (Currently: ${record.status})` : "Click to mark present"}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const presentCount = attendanceDocs.filter(d => d.status === "present").length;
    const absentCount = attendanceDocs.filter(d => d.status === "absent").length;
    const daysInCurrentMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
    const noClassCount = daysInCurrentMonth - presentCount - absentCount;

    const handleSendPasswordReset = async () => {
        if (!student?.email) return toast.error("No student email found");
        try {
            await sendPasswordResetEmail(auth, student.email);
            toast.success("Password reset email sent to " + student.email);
        } catch (error: any) {
            console.error("Error sending reset email:", error);
            toast.error(error.message || "Failed to send reset email");
        }
    };

    const handleCreateTest = async () => {
        try {
            if (!testTitle || !selectedMaterial) return toast.error("Please fill all fields");

            await setDoc(doc(collection(db, "tests")), {
                title: testTitle,
                materialId: selectedMaterial,
                studentId: student?.id || id,
                teacherId: student?.assignedTeacherId || "",
                createdAt: new Date().toISOString(),
            });
            setModalOpen(false);
            toast.success("Test created successfully!");
        } catch (error) {
            console.error("Error creating test:", error);
            toast.error("Failed to create test");
        }
    };

    const handleLifecycleAction = async (newStatus: "active" | "suspended" | "archived") => {
        try {
            const actualId = student?.id || id;
            await setDoc(doc(db, "users", actualId), {
                accountStatus: newStatus,
                accountStatusUpdatedAt: serverTimestamp(),
                accountStatusUpdatedBy: auth.currentUser?.uid ?? null
            }, { merge: true });

            setStudent({ ...student, accountStatus: newStatus });
            toast.success(`Student status updated to ${newStatus}`);
        } catch (error) {
            console.error("Lifecycle error:", error);
            toast.error("Failed to update account status");
        }
    };

    if (authLoading || loading) {
        return <div className="p-6">Loading student data...</div>;
    }

    if (!student) {
        return null;
    }

    const availableLevels = editForm.language ? levelMap[editForm.language] || [] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/students" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Student Overview</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${student.is_paid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {student?.is_paid ? "PAID ACCOUNT" : "UNPAID ACCOUNT"}
                    </div>
                    {student.accountStatus === "suspended" && (
                        <div className="px-4 py-1.5 rounded-full text-sm font-bold border bg-yellow-50 text-yellow-700 border-yellow-200 uppercase tracking-wider">
                            SUSPENDED
                        </div>
                    )}
                    {student.accountStatus === "archived" && (
                        <div className="px-4 py-1.5 rounded-full text-sm font-bold border bg-gray-100 text-gray-500 border-gray-200 uppercase tracking-wider">
                            ARCHIVED
                        </div>
                    )}
                    {(!student.accountStatus || student.accountStatus === "active") && (
                        <div className="px-4 py-1.5 rounded-full text-sm font-bold border bg-green-50 text-green-700 border-green-200 uppercase tracking-wider">
                            ACTIVE
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1">
                    <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mb-4">
                        {student.email?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{student.email}</h2>
                    <p className="text-gray-500 text-sm mb-6">Joined {student.created_at ? new Date(student.created_at).toLocaleDateString() : "-"}</p>

                    <div className="space-y-4 mb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Language Track</p>
                            <p className="font-medium">{student.language || "Not assigned"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Level</p>
                            <p className="font-medium text-primary bg-primary/10 w-max px-2 py-0.5 rounded-md">{student.currentLevel || "Not evaluated"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Access Scope</p>
                            <p className="font-medium">{student.hasFullAccess ? "⭐ Full Language Access" : "Strict Level Access"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Teacher</p>
                            <p className="font-medium">{student.teacher_email || "None"}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                setModalType("edit");
                                setModalOpen(true);
                            }}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile & Access
                        </button>

                        <button
                            onClick={() => {
                                setModalType("test");
                                setModalOpen(true);
                            }}
                            className="w-full py-2 border border-purple-200 text-purple-600 hover:bg-purple-50 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">quiz</span> Create Test
                        </button>
                    </div>
                </div>

                {/* Right Column: Activity & Marks */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">school</span>
                            Academic Performance (Marks & Tests)
                        </h3>

                        {submissions.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-sm text-gray-500">
                                        <th className="py-2 px-2">Test Entry</th>
                                        <th className="py-2 px-2">Submitted</th>
                                        <th className="py-2 px-2 text-center">Integrity</th>
                                        <th className="py-2 px-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((sub, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0">
                                            <td className="py-3 px-2 font-medium">
                                                {sub.assignments?.materials?.title || "Unknown Test"}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-500">
                                                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {sub.suspicious_flag ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                                        Flagged
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                        Clean
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button className="text-primary hover:underline text-sm font-medium">View Marks</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-8 text-center text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No tests taken yet.
                            </div>
                        )}
                    </div>

                    {/* Attendance Calendar Module */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">calendar_month</span>
                                Attendance Tracker
                            </h3>
                            <div className="flex items-center gap-3">
                                <button onClick={handlePrevMonth} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                <span className="text-sm font-bold w-24 text-center">
                                    {currentMonthDate.toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                                </span>
                                <button onClick={handleNextMonth} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors">
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        {/* Aggregation Summary */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                                <div className="text-2xl font-black text-green-700">{presentCount}</div>
                                <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Present</div>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                                <div className="text-2xl font-black text-red-700">{absentCount}</div>
                                <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">Absent</div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                <div className="text-2xl font-black text-gray-600">{noClassCount}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">No Class</div>
                            </div>
                        </div>

                        {attendanceLoading ? (
                            <div className="py-12 text-center text-sm font-medium text-gray-500">Loading calendar...</div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {renderCalendar()}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-center gap-6 border-t border-gray-100 pt-5">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-green-500"></div>
                                <span className="text-xs font-semibold text-gray-600">Present</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-red-500"></div>
                                <span className="text-xs font-semibold text-gray-600">Absent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-gray-200"></div>
                                <span className="text-xs font-semibold text-gray-600">No Class</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Control Lifecycle Panel */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-700">admin_panel_settings</span>
                            Account Control
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Manage this student's platform access lifecycle.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {(!student.accountStatus || student.accountStatus === "active") && (
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
                            {student.accountStatus === "suspended" && (
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
                            {student.accountStatus === "archived" && (
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
                        <h2 className="text-xl font-bold mb-6">
                            {modalType === "edit" && "Edit Student & Access"}
                            {modalType === "test" && "Create Test"}
                        </h2>

                        {/* EDIT PROFILE FORM */}
                        {modalType === "edit" && (
                            <div className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Account Status</label>
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg border">
                                        <input
                                            type="checkbox"
                                            checked={editForm.isPaid}
                                            onChange={(e) => setEditForm({ ...editForm, isPaid: e.target.checked })}
                                            className="size-4"
                                        />
                                        <span className={`font-semibold ${editForm.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                                            {editForm.isPaid ? "Paid Student" : "Unpaid / Locked"}
                                        </span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Language</label>
                                        <select
                                            className="border p-2.5 rounded-lg w-full bg-white"
                                            value={editForm.language}
                                            onChange={(e) => {
                                                const newLang = e.target.value;
                                                setEditForm({ ...editForm, language: newLang, currentLevel: "" }); // Reset level on lang change
                                            }}
                                        >
                                            <option value="">- Select Language -</option>
                                            {Object.keys(levelMap).map(lang => (
                                                <option key={lang} value={lang}>{lang}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Current Level</label>
                                        <select
                                            className="border p-2.5 rounded-lg w-full bg-white disabled:opacity-50"
                                            value={editForm.currentLevel}
                                            disabled={!editForm.language}
                                            onChange={(e) => setEditForm({ ...editForm, currentLevel: e.target.value })}
                                        >
                                            <option value="">- Select Level -</option>
                                            {availableLevels.map((lvl: string) => (
                                                <option key={lvl} value={lvl}>{lvl}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Access Override</label>
                                    <label className="flex items-center gap-3 cursor-pointer bg-purple-50 p-3 rounded-lg border border-purple-100">
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox" value="" className="sr-only peer"
                                                checked={editForm.hasFullAccess}
                                                onChange={(e) => setEditForm({ ...editForm, hasFullAccess: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-purple-900 text-sm">Grant Full Access</span>
                                            <span className="text-xs text-purple-700">Student can see ALL levels for {editForm.language || "their language"}</span>
                                        </div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Assigned Teacher Email (Optional)</label>
                                    <input
                                        type="email"
                                        placeholder="teacher@example.com"
                                        className="border p-2.5 rounded-lg w-full"
                                        value={editForm.teacher_email}
                                        onChange={(e) => setEditForm({ ...editForm, teacher_email: e.target.value })}
                                    />
                                </div>

                                <div className="border-t pt-4 flex gap-3 mt-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold flex-1"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl border border-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <button
                                    onClick={handleSendPasswordReset}
                                    className="text-primary text-sm font-bold hover:underline py-2"
                                >
                                    Send Password Reset Email
                                </button>
                            </div>
                        )}

                        {/* CREATE TEST FORM */}
                        {modalType === "test" && (
                            <div className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Test Title"
                                    className="border p-2.5 rounded-lg w-full"
                                    onChange={(e) => setTestTitle(e.target.value)}
                                    value={testTitle}
                                />
                                <select
                                    className="border p-2.5 rounded-lg w-full"
                                    onChange={(e) => setSelectedMaterial(e.target.value)}
                                    value={selectedMaterial}
                                >
                                    <option value="">Select Material Reference</option>
                                    {allMaterials.map((material: any) => (
                                        <option key={material.id} value={material.id}>
                                            {material.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleCreateTest}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex-1 font-bold"
                                    >
                                        Create Test
                                    </button>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="bg-gray-200 px-4 py-2 rounded-lg flex-1 font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
