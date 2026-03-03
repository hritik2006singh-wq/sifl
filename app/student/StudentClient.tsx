"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useStudentGuard } from "@/hooks/useRoleGuard";
import Link from "next/link";
import CustomModal from "@/components/CustomModal";

export default function StudentClient() {
    const { user, loading: authLoading } = useStudentGuard();

    const [classes, setClasses] = useState<any[]>([]);
    const [pastClassesCount, setPastClassesCount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<{ show: boolean; type: "error" | "success"; message: string }>({ show: false, type: "error", message: "" });

    const fetchDashboardData = async () => {
        try {
            // Fetch Classes for this student
            const classesQuery = query(
                collection(db, "classes"),
                where("studentIds", "array-contains", user.uid)
            );
            const classesSnap = await getDocs(classesQuery);
            const allAssignedClasses = classesSnap.docs.map(c => ({ id: c.id, ...c.data() })) as any[];

            const todayStr = new Date().toISOString().split('T')[0];
            const upcoming = allAssignedClasses
                .filter(c => c.date >= todayStr)
                .sort((a, b) => a.date.localeCompare(b.date));
            const completed = allAssignedClasses.filter(c => c.date < todayStr || c.status === "completed");

            setClasses(upcoming);
            setPastClassesCount(completed.length);
        } catch (err) {
            console.error("Error fetching student dashboard data:", err);
            setModalState({ show: true, type: "error", message: "Failed to load dashboard data." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const attendancePercent = pastClassesCount + classes.length === 0
        ? 100
        : Math.round((pastClassesCount / (pastClassesCount + classes.length)) * 100);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {modalState.show && <CustomModal type={modalState.type} message={modalState.message} onClose={() => setModalState({ ...modalState, show: false })} />}

            {/* Section A: Header Card */}
            <div className="bg-gradient-to-br from-primary to-emerald-700 rounded-3xl p-6 md:p-10 shadow-2xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10">
                    <span className="material-symbols-outlined text-[100px] md:text-[150px] rotate-[-15deg]">school</span>
                </div>
                <div className="z-10 flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 w-full">
                    <div className="relative group size-20 md:size-28 rounded-full border-[3px] md:border-4 border-white/20 shadow-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl md:text-4xl font-bold">{user?.name?.charAt(0) || user?.email?.charAt(0) || "S"}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2 truncate">Welcome back, {user?.name || "Student"}!</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs md:text-sm font-semibold flex items-center gap-1.5 max-w-full">
                                <span className="material-symbols-outlined text-[14px] md:text-[16px] shrink-0">mail</span>
                                <span className="truncate">{user?.email}</span>
                            </span>
                            {user?.is_paid && (
                                <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-sm shrink-0">
                                    <span className="material-symbols-outlined text-[14px] md:text-[16px]">workspace_premium</span>
                                    Premium
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section B: Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl w-max z-10">
                        <span className="material-symbols-outlined">event_upcoming</span>
                    </div>
                    <div className="z-10">
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest">Upcoming Classes</p>
                        <p className="text-2xl md:text-3xl font-black">{classes.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl w-max z-10">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div className="z-10">
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest">Completed</p>
                        <p className="text-2xl md:text-3xl font-black">{pastClassesCount}</p>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl w-max z-10">
                        <span className="material-symbols-outlined">trending_up</span>
                    </div>
                    <div className="z-10">
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest">Attendance</p>
                        <p className="text-2xl md:text-3xl font-black text-emerald-600">{attendancePercent}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section C: Upcoming Classes */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
                    <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl shadow-sm overflow-hidden p-2">
                        {classes.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {classes.map((c, idx) => (
                                    <div key={idx} className="p-4 flex flex-col items-start gap-4 hover:bg-gray-50 transition-colors rounded-2xl">
                                        <div className="flex w-full items-center gap-4">
                                            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[70px]">
                                                <span className="text-[10px] font-bold uppercase">{new Date(c.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-xl font-black">{new Date(c.date).getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-md">{c.title || "Class Session"}</h3>
                                                <div className="text-sm text-gray-500 font-medium">
                                                    {c.time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">event_busy</span>
                                <h3 className="font-bold text-gray-900">No Classes</h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section D: Direct Study Materials Access */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">auto_awesome_mosaic</span>
                            Direct Access
                        </h2>
                    </div>

                    <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                        <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                            <span className="material-symbols-outlined text-[200px]">collections_bookmark</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Study Materials</h3>
                            <p className="text-gray-500 font-medium mb-8 max-w-sm">Access the library of PDFs and video lessons unlocked for your specific language track and level.</p>

                            <Link
                                href="/student/materials"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white hover:bg-black rounded-xl font-bold transition-all active:scale-95 shadow-md group"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">menu_book</span>
                                Browse Library
                                <span className="material-symbols-outlined text-sm ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
