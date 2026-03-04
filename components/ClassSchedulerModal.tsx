"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-admin-admin";
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

interface ClassSchedulerModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefillStudentId?: string; // If opened from a student profile
    prefillTeacherId?: string; // If opened by a teacher or from a teacher profile
    onClassScheduled?: () => void;
}

export default function ClassSchedulerModal({ isOpen, onClose, prefillStudentId, prefillTeacherId, onClassScheduled }: ClassSchedulerModalProps) {
    const [loading, setLoading] = useState(false);

    // Options
    const [students, setStudents] = useState<{ id: string, name: string }[]>([]);
    const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);

    // Form
    const [studentId, setStudentId] = useState(prefillStudentId || "");
    const [teacherId, setTeacherId] = useState(prefillTeacherId || "");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState("60");
    const [mode, setMode] = useState("online");
    const [meetingLink, setMeetingLink] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                if (!prefillStudentId) {
                    const qStudents = query(collection(db, "users"), where("role", "==", "student"));
                    const snapStudents = await getDocs(qStudents);
                    setStudents(snapStudents.docs.map(st => ({ id: st.id, name: st.data().name || st.data().email })));
                }

                if (!prefillTeacherId) {
                    const qTeachers = query(collection(db, "users"), where("role", "==", "teacher"));
                    const snapTeachers = await getDocs(qTeachers);
                    setTeachers(snapTeachers.docs.map(t => ({ id: t.id, name: t.data().name || t.data().email })));
                }
            } catch (error) {
                console.error("Failed to load users", error);
                toast.error("Failed to load students/teachers");
            }
        };

        fetchData();
    }, [isOpen, prefillStudentId, prefillTeacherId]);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalStudentId = prefillStudentId || studentId;
        const finalTeacherId = prefillTeacherId || teacherId;

        if (!finalStudentId || !finalTeacherId || !date || !time) {
            toast.error("Please fill all required scheduling fields");
            return;
        }

        setLoading(true);

        try {
            // Get teacher name explicitly for easy UI rendering
            let teacherName = "SIFL Teacher";
            if (teachers.length > 0) {
                teacherName = teachers.find(t => t.id === finalTeacherId)?.name || teacherName;
            } else {
                const tDoc = await getDoc(doc(db, "users", finalTeacherId));
                if (tDoc.exists()) teacherName = tDoc.data().name || teacherName;
            }

            const classData = {
                studentId: finalStudentId,
                studentIds: [finalStudentId], // Keep backwards compatibility with existing UI maps
                teacherId: finalTeacherId,
                teacherName,
                date,
                time,
                duration: Number(duration),
                mode,
                meetingLink: mode === "online" ? meetingLink : "",
                status: "scheduled",
                notes,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, "classes"), classData);

            toast.success("Class Scheduled Successfully");
            if (onClassScheduled) onClassScheduled();
            resetAndClose();
        } catch (error: any) {
            console.error("Scheduling error", error);
            toast.error("Failed to schedule class: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStudentId(prefillStudentId || "");
        setTeacherId(prefillTeacherId || "");
        setDate("");
        setTime("");
        setDuration("60");
        setMode("online");
        setMeetingLink("");
        setNotes("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm overflow-hidden w-full">
            <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden rounded-t-[2rem] md:rounded-3xl mt-20 md:my-8 h-[calc(100vh-5rem)] md:h-auto flex flex-col animate-slide-up md:animate-none">
                <div className="px-6 py-5 md:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">Schedule Class</h3>
                    <button type="button" onClick={resetAndClose} className="text-gray-400 hover:text-gray-600 bg-white size-8 flex items-center justify-center rounded-full shadow-sm md:shadow-none md:bg-transparent md:size-auto">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSchedule} className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto pb-32 md:pb-8">
                    {/* Assignments */}
                    <div className="space-y-4">
                        {!prefillStudentId && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Select Student</label>
                                <select required value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="">-- Choose Student --</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
                                </select>
                            </div>
                        )}

                        {!prefillTeacherId && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Assign Teacher</label>
                                <select required value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="">-- Choose Teacher --</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name || t.id}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Date</label>
                            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Time</label>
                            <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                    </div>

                    {/* Duration & Mode */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Duration (mins)</label>
                            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                <option value="30">30 Minutes</option>
                                <option value="45">45 Minutes</option>
                                <option value="60">60 Minutes</option>
                                <option value="90">90 Minutes</option>
                                <option value="120">120 Minutes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Delivery Mode</label>
                            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                <option value="online">Online</option>
                                <option value="offline">In-Person</option>
                            </select>
                        </div>
                    </div>

                    {/* Linking & Notes */}
                    {mode === "online" && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Meeting Link</label>
                            <input type="url" placeholder="https://zoom.us/j/..." value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-sm font-bold text-blue-900 placeholder-blue-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Internal Notes (Optional)</label>
                        <textarea placeholder="Lesson focus, requirements, etc." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px] resize-none"></textarea>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-0 md:pt-6 flex justify-end gap-3 z-40 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
                        <button type="button" disabled={loading} onClick={resetAndClose} className="flex-1 md:flex-none px-6 py-3.5 md:py-3 text-base md:text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 active:scale-95 md:active:scale-100">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 md:flex-none px-6 py-3.5 md:py-3 text-base md:text-sm font-bold bg-gray-900 text-white rounded-xl shadow-md md:hover:bg-gray-800 md:hover:scale-105 transition-all disabled:opacity-50 active:scale-95 md:active:scale-100">
                            {loading ? "Scheduling..." : "Confirm Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
