"use client";

import { useTeacherGuard } from "@/hooks/useRoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-admin";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function TeacherStudentsPage() {
    const { user, loading: authLoading } = useTeacherGuard();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "student"),
                    where("assignedTeacherId", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching students:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStudents();
        }
    }, [user]);

    if (authLoading || loading) return <div className="p-8">Loading students...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
                    <p className="text-gray-500 mt-1">Manage and track progress for your assigned students.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {students.length > 0 ? (
                    <>
                        {/* Desktop Table */}
                        <table className="w-full text-left hidden md:table">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-700">Student Name</th>
                                    <th className="p-4 font-semibold text-gray-700">Email</th>
                                    <th className="p-4 font-semibold text-gray-700">Status</th>
                                    <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                                                    {student.name?.charAt(0).toUpperCase() || student.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-900">{student.name || "Unnamed"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{student.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${student.is_paid ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                                                {student.is_paid ? "Premium" : "Free"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/teacher/students/${student.id}`} className="text-primary hover:underline font-semibold flex items-center justify-end gap-1">
                                                View Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {students.map((student) => (
                                <div key={student.id} className="p-4 space-y-4 bg-white hover:bg-gray-50 transition active:scale-[0.99]">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold shrink-0">
                                                {student.name?.charAt(0).toUpperCase() || student.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 line-clamp-1">{student.name || "Unnamed"}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{student.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 ${student.is_paid ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                                            {student.is_paid ? "Premium" : "Free"}
                                        </span>
                                    </div>
                                    <Link href={`/teacher/students/${student.id}`} className="w-full py-2.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 active:bg-gray-200 text-primary rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition">
                                        View Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-16 text-center text-gray-500">
                        <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">group_off</span>
                        <p className="text-lg font-medium">No students assigned</p>
                        <p className="text-sm">You do not have any students assigned to you yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
