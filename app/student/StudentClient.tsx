"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { useStudentGuard } from "@/hooks/useRoleGuard";
import Link from "next/link";

export default function StudentClient() {
    const { user, loading: authLoading } = useStudentGuard();
    const [classes, setClasses] = useState<any[]>([]);
    const [pastClassesCount, setPastClassesCount] = useState(0);
    const [materialsCount, setMaterialsCount] = useState(0);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Classes for this student
            const classesQuery = query(
                collection(db, "classes"),
                where("studentIds", "array-contains", user.uid)
            );
            const classesSnap = await getDocs(classesQuery);
            const allAssignedClasses = classesSnap.docs.map(c => ({ id: c.id, ...c.data() })) as any[];

            // Separate into upcoming and past
            const todayStr = new Date().toISOString().split('T')[0];

            const upcoming = allAssignedClasses
                .filter(c => c.date >= todayStr)
                .sort((a, b) => a.date.localeCompare(b.date));

            const completed = allAssignedClasses.filter(c => c.date < todayStr || c.status === "completed");

            setClasses(upcoming);
            setPastClassesCount(completed.length);

            // 2. Fetch assigned materials
            // In case of a system where materials are globally readable but we want assignment logic, 
            // or we just fetch everything in 'studyMaterials' if that is the structure used.
            // Let's assume generic studyMaterials fetching or specific assignment if defined
            const materialsRef = collection(db, "studyMaterials");
            const materialsSnap = await getDocs(materialsRef);
            // Example filter: if material specifically uses assignedTo array, we would filter it
            setMaterialsCount(materialsSnap.size);
            setMaterials(materialsSnap.docs.map(m => ({ id: m.id, ...m.data() })).slice(0, 3)); // preview top 3

        } catch (err) {
            console.error("Error fetching student dashboard data:", err);
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

                <div className="z-10 md:ml-auto w-full md:w-auto mt-2 md:mt-0">
                    <Link href="/student/profile" className="block w-full text-center px-6 py-3.5 md:py-3 bg-white text-primary rounded-xl font-bold shadow-lg active:scale-95 md:hover:scale-105 transition-all">
                        Edit Profile
                    </Link>
                </div>
            </div>

            {/* Section B: Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all">
                    <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-2xl w-max">
                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">event_upcoming</span>
                    </div>
                    <div>
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest line-clamp-1">Upcoming Classes</p>
                        <p className="text-2xl md:text-3xl font-black text-gray-900 mt-0.5 md:mt-1">{classes.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all">
                    <div className="p-2.5 md:p-3 bg-purple-50 text-purple-600 rounded-2xl w-max">
                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">check_circle</span>
                    </div>
                    <div>
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest line-clamp-1">Completed</p>
                        <p className="text-2xl md:text-3xl font-black text-gray-900 mt-0.5 md:mt-1">{pastClassesCount}</p>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all">
                    <div className="p-2.5 md:p-3 bg-amber-50 text-amber-600 rounded-2xl w-max">
                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">menu_book</span>
                    </div>
                    <div>
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest line-clamp-1">Materials</p>
                        <p className="text-2xl md:text-3xl font-black text-gray-900 mt-0.5 md:mt-1">{materialsCount}</p>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all relative overflow-hidden">
                    <div className="p-2.5 md:p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-max z-10">
                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">trending_up</span>
                    </div>
                    <div className="z-10">
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest line-clamp-1">Attendance</p>
                        <p className="text-2xl md:text-3xl font-black text-emerald-600 mt-0.5 md:mt-1">{attendancePercent}%</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10">
                        <span className="material-symbols-outlined text-[80px] md:text-[120px] translate-y-6 md:translate-y-8 translate-x-4">analytics</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section C: Upcoming Classes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Schedule</h2>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                            Next {classes.length} Sessions
                        </span>
                    </div>

                    <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl shadow-sm overflow-hidden p-2">
                        {classes.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {classes.map((c, idx) => (
                                    <div key={idx} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:bg-gray-50 transition-colors rounded-2xl">
                                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[90px]">
                                            <span className="text-xs font-bold uppercase">{new Date(c.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-2xl font-black">{new Date(c.date).getDate()}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                                    Live Session
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg">{c.title || "Language Class Segment"}</h3>
                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {c.time}</span>
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">videocam</span> Google Meet</span>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                            <button className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                                                Join Room
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl text-gray-400">event_busy</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No Upcoming Classes</h3>
                                <p className="text-gray-500 mt-1 max-w-sm">You don't have any live sessions scheduled right now. Check with your teacher.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section D: Continue Learning */}
                {materials.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-600">auto_awesome</span>
                                Quick Study
                            </h2>
                            <Link href="/student/materials" className="text-sm font-bold text-primary hover:underline">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {materials.map(m => (
                                <Link href="/student/materials" key={m.id} className="block bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined">library_books</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 line-clamp-1">{m.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.description || "Review this study material before your next class."}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
