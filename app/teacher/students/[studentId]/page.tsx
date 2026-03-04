"use client";

import { useTeacherGuard } from "@/hooks/useRoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-admin";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TeacherStudentDetailPage({ params }: { params: { studentId: string } }) {
    const { user, loading: authLoading } = useTeacherGuard();
    const [student, setStudent] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);

    // Attendance
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [attendanceDocs, setAttendanceDocs] = useState<any[]>([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                // Fetch student
                const studentDoc = await getDoc(doc(db, "users", params.studentId));
                if (studentDoc.exists()) {
                    const data = studentDoc.data();
                    // Ensure the student is actually assigned to this teacher
                    if (data.assignedTeacherId === user?.uid) {
                        setStudent({ id: studentDoc.id, ...data });
                        setNotes(data.teacherNotes || "");
                    }
                }

                // Fetch study materials
                const matsQuery = query(collection(db, "studyMaterials"), where("uploadedBy", "==", params.studentId));
                const matsSnap = await getDocs(matsQuery);
                setMaterials(matsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            } catch (err) {
                console.error("Error fetching student details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStudentDetails();
        }
    }, [user, params.studentId]);

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await updateDoc(doc(db, "users", params.studentId), {
                teacherNotes: notes
            });
            toast.success("Notes saved successfully.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save notes.");
        } finally {
            setSavingNotes(false);
        }
    };

    // Attendance Logic
    useEffect(() => {
        if (!params.studentId) return;
        const fetchAttendance = async () => {
            setAttendanceLoading(true);
            const start = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
            const end = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0);

            const startStr = start.toLocaleDateString('en-CA');
            const endStr = end.toLocaleDateString('en-CA');

            try {
                const attRef = collection(db, "attendance");
                const q = query(
                    attRef,
                    where("studentId", "==", params.studentId),
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
    }, [params.studentId, currentMonthDate]);

    const handlePrevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));

    const toggleAttendance = async (dateStr: string) => {
        if (student?.accountStatus && student.accountStatus !== "active") {
            return toast.error("Cannot mark attendance for inactive student.");
        }

        const existing = attendanceDocs.find(d => d.date === dateStr);
        const docId = `${params.studentId}_${dateStr}`;
        const docRef = doc(db, "attendance", docId);

        try {
            if (!existing) {
                const newData = {
                    studentId: params.studentId,
                    teacherId: user?.uid,
                    date: dateStr,
                    status: "present",
                    markedBy: user?.uid,
                    markedAt: serverTimestamp()
                };
                await setDoc(docRef, newData);
                setAttendanceDocs([...attendanceDocs, { id: docId, ...newData }]);
            } else if (existing.status === "present") {
                await setDoc(docRef, { status: "absent", markedBy: user?.uid, markedAt: serverTimestamp() }, { merge: true });
                setAttendanceDocs(attendanceDocs.map(d => d.id === docId ? { ...d, status: "absent" } : d));
            } else {
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

    if (authLoading || loading) return <div className="p-8">Loading student details...</div>;

    if (!student) {
        return (
            <div className="p-8 text-center text-gray-500">
                <span className="material-symbols-outlined text-5xl mb-3 text-red-300">error</span>
                <p className="text-xl font-bold text-gray-900">Student not found</p>
                <p>The student doesn't exist or is not assigned to you.</p>
                <Link href="/teacher/students" className="mt-4 inline-block text-primary hover:underline">Return to Students List</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-8">
            <div className="flex items-center gap-4">
                <Link href="/teacher/students" className="p-2 bg-white rounded-full border shadow-sm hover:bg-gray-50 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
                    <p className="text-gray-500 mt-1">Detailed overview of {student.name || student.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col */}
                <div className="space-y-8 col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                        <div className="size-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-extrabold mb-4">
                            {student.name?.charAt(0).toUpperCase() || student.email?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{student.name || "Unnamed"}</h2>
                        <p className="text-gray-500 mb-4">{student.email}</p>

                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${student.is_paid ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                            {student.is_paid ? "Premium Access" : "Free Tier"}
                        </div>

                        <div className="w-full mt-6 pt-6 border-t">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500 font-medium">Tracking</span>
                                <span className="font-bold">Active</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Joined Date</span>
                                <span className="font-bold">{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Notes section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">edit_note</span>
                            Teacher Notes
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add your private notes about this student's progress here..."
                            className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
                        ></textarea>
                        <button
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            className="w-full mt-3 bg-primary text-white font-semibold py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {savingNotes ? "Saving..." : "Save Notes"}
                        </button>
                    </div>
                </div>

                {/* Right Col */}
                <div className="md:col-span-2 space-y-8">
                    {/* Progress Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">trending_up</span>
                            Course Progress
                        </h3>

                        {/* Placeholder generic progress for now */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-gray-700">Completion</span>
                                <span className="font-bold text-primary">60%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full w-[60%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Calendar Module */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8">
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

                    {/* Study Materials */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">folder_open</span>
                            Student Uploads
                        </h3>
                        <div className="space-y-3">
                            {materials.length > 0 ? materials.map((m) => (
                                <div key={m.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <span className="material-symbols-outlined font-bold text-lg">description</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{m.title}</p>
                                            <p className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={m.fileURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:bg-primary/10 p-2 rounded-lg font-bold text-sm transition"
                                    >
                                        Download
                                    </a>
                                </div>
                            )) : (
                                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                                    <span className="material-symbols-outlined text-3xl mb-2">cloud_off</span>
                                    <p>No materials uploaded by student.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
