"use client";

import { useStudentGuard } from "@/hooks/useRoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-client";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StudentAssignmentsClient() {
    const { user, loading: authLoading } = useStudentGuard();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            // Only fetch if paid
            if (!user?.is_paid) {
                setLoading(false);
                return;
            }
            try {
                // Assuming assignments are assigned to the class or to the student directly.
                // For now, simulating an empty array if no specific collection logic is given
                // the objective says: "Block access to materials and assignments if the student is unpaid with a clean message"
                const assignmentsQuery = query(collection(db, "assignments"), where("studentIds", "array-contains", user.uid));
                const assignmentsSnap = await getDocs(assignmentsQuery);
                setAssignments(assignmentsSnap.docs.map(m => ({ id: m.id, ...m.data() })));
            } catch (err) {
                console.error("Error fetching student assignments:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAssignments();
        }
    }, [user]);

    if (authLoading || loading) {
        return <div className="p-8 text-gray-500">Loading assignments...</div>;
    }

    if (!user?.is_paid) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-red-50 text-red-800 p-8 rounded-2xl border border-red-200 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">lock</span>
                    <h2 className="text-2xl font-bold mb-2">Premium Access Required</h2>
                    <p className="text-red-700 max-w-lg mx-auto">
                        Your account is currently unpaid. You must have an active premium membership to view and submit course assignments and tests. Please contact administration or complete your payment to unlock this section.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Assignments & Tests</h1>
                <p className="text-gray-500 mt-1">Submit your coursework and view your grades here.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {assignments.length > 0 ? (
                    <div className="grid gap-4">
                        {assignments.map(a => (
                            <div key={a.id} className="p-4 border border-purple-100 bg-purple-50/50 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined">assignment</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-purple-900">{a.title || "Untitled Assignment"}</h3>
                                        <p className="text-sm text-purple-700/70">{a.dueDate ? `Due: ${new Date(a.dueDate).toLocaleDateString()}` : "No due date"}</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition">
                                    Start
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200 gap-2 flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300">task</span>
                        <p>No active assignments at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
