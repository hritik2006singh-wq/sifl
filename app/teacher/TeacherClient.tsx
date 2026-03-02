"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useTeacherGuard } from "@/hooks/useRoleGuard";
import Link from "next/link";
import ClassSchedulerModal from "@/components/ClassSchedulerModal";

export default function TeacherClient() {
    const { user, loading: authLoading } = useTeacherGuard();
    const [classes, setClasses] = useState<any[]>([]);
    const [todayClasses, setTodayClasses] = useState<any[]>([]);
    const [pastClassesCount, setPastClassesCount] = useState(0);
    const [totalStudents, setTotalStudents] = useState<number>(0);
    const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
    const [students, setStudents] = useState<any[]>([]);
    const [availabilityActive, setAvailabilityActive] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [showScheduler, setShowScheduler] = useState(false);

    useEffect(() => {
        const fetchTeacherData = async () => {
            if (!user) return;
            try {
                // Fetch classes where teacherId == currentUser.uid
                const classesQuery = query(collection(db, "classes"), where("teacherId", "==", user.uid));
                const classesSnap = await getDocs(classesQuery);
                const fetchedClasses = classesSnap.docs.map(cDoc => ({ id: cDoc.id, ...cDoc.data() })) as any[];

                // Class sorting
                const todayStr = new Date().toISOString().split('T')[0];
                let upcoming = 0;
                let past = 0;
                let todaySchedule: any[] = [];
                const studentSet = new Set<string>();
                const studentIdsArray: string[] = [];

                fetchedClasses.forEach(c => {
                    if (c.studentIds && Array.isArray(c.studentIds)) {
                        c.studentIds.forEach((sid: string) => {
                            studentSet.add(sid);
                            studentIdsArray.push(sid); // to fetch details later
                        });
                    }
                    if (c.date < todayStr || c.status === "completed") {
                        past++;
                    } else {
                        upcoming++;
                        if (c.date === todayStr) {
                            todaySchedule.push(c);
                        }
                    }
                });

                todaySchedule.sort((a, b) => a.time?.localeCompare(b.time || ""));
                setTodayClasses(todaySchedule);
                setClasses(fetchedClasses.filter(c => c.date >= todayStr && c.date !== todayStr));
                setPastClassesCount(past);
                setTotalStudents(studentSet.size);

                // Fetch Student Data Details briefly
                const uniqueIds = Array.from(studentSet).slice(0, 5); // limit preview
                const fetchedStudents = [];
                for (const sid of uniqueIds) {
                    const sDoc = await getDoc(doc(db, "users", sid));
                    if (sDoc.exists()) {
                        fetchedStudents.push({ id: sDoc.id, ...sDoc.data() });
                    }
                }
                setStudents(fetchedStudents);

                // Fetch demo bookings pending
                const bookingsQuery = query(collection(db, "demoBookings"), where("teacherId", "==", user.uid), where("status", "==", "pending"));
                const bookingsSnap = await getDocs(bookingsQuery);
                setPendingBookingsCount(bookingsSnap.size);

                // Fetch availability config
                const availDoc = await getDoc(doc(db, "availability", user.uid));
                if (availDoc.exists()) {
                    setAvailabilityActive(!availDoc.data().outOfTown);
                } else {
                    setAvailabilityActive(false);
                }

            } catch (err) {
                console.error("Error fetching teacher dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTeacherData();
        }
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-gradient-to-br from-emerald-800 to-gray-900 rounded-3xl p-6 md:p-10 shadow-2xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10">
                    <span className="material-symbols-outlined text-[100px] md:text-[150px] rotate-12">school</span>
                </div>

                <div className="z-10 flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 w-full">
                    <div className="relative group size-20 md:size-28 rounded-full border-[3px] md:border-4 border-white/20 shadow-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl md:text-4xl font-bold">{user?.name?.charAt(0) || "T"}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2 truncate">Welcome, {user?.name || "Teacher"}!</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs md:text-sm font-semibold flex items-center gap-1.5 max-w-full">
                                <span className="material-symbols-outlined text-[14px] md:text-[16px] shrink-0">mail</span>
                                <span className="truncate">{user?.email}</span>
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-sm shrink-0">
                                <span className="material-symbols-outlined text-[14px] md:text-[16px]">category</span>
                                <span className="truncate">{user?.specialization || "Instructor"}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowScheduler(true)}
                    className="w-full md:w-auto mt-2 md:mt-0 md:absolute md:bottom-8 md:right-8 bg-white text-emerald-900 px-6 py-3.5 md:py-3 rounded-2xl text-base md:text-sm font-black shadow-lg active:scale-95 md:hover:scale-105 transition-transform flex items-center justify-center gap-2 z-20"
                >
                    <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                    Schedule Class
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all">
                    <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-2xl w-max">
                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">group</span>
                    </div>
                    <div>
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest line-clamp-1">Students</p>
                        <p className="text-2xl md:text-3xl font-black text-gray-900 mt-0.5 md:mt-1">{totalStudents}</p>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all">
                    <div className="p-2.5 md:p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-max">
                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">event_upcoming</span>
                    </div>
                    <div>
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest line-clamp-1">Upcoming</p>
                        <p className="text-2xl md:text-3xl font-black text-gray-900 mt-0.5 md:mt-1">{classes.length + todayClasses.length}</p>
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
                <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md active:scale-[0.98] transition-all relative overflow-hidden">
                    <div className="p-2.5 md:p-3 bg-amber-50 text-amber-600 rounded-2xl w-max z-10">
                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">pending_actions</span>
                    </div>
                    <div className="z-10">
                        <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest line-clamp-1">Pending</p>
                        <p className="text-2xl md:text-3xl font-black text-amber-600 mt-0.5 md:mt-1">{pendingBookingsCount}</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10">
                        <span className="material-symbols-outlined text-[80px] md:text-[100px] translate-y-6 md:translate-y-6 translate-x-4">schedule</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Schedule */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 overflow-hidden">
                        {todayClasses.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {todayClasses.map((c, idx) => (
                                    <div key={idx} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:bg-gray-50 transition-colors rounded-2xl">
                                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[90px]">
                                            <span className="text-xs font-bold uppercase">Time</span>
                                            <span className="text-xl font-black">{c.time}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                                    Live Session
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg">{c.title || "Language Class"}</h3>
                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">group</span> {c.studentIds?.length || 1} Students</span>
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">videocam</span> Online</span>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                            <button className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                                                Start Class
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400">
                                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">free_cancellation</span>
                                <p className="font-medium">No schedule for today. Rest well!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Availability Overview */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">System Status</h2>
                            <Link href="/teacher/availability" className="text-sm font-bold text-emerald-600 hover:underline">Manage</Link>
                        </div>
                        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${availabilityActive ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                            <div className={`p-3 rounded-xl ${availabilityActive ? 'bg-white text-emerald-600 shadow-sm' : 'bg-white text-amber-600 shadow-sm'}`}>
                                <span className="material-symbols-outlined">{availabilityActive ? 'event_available' : 'event_busy'}</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{availabilityActive ? "Accepting Bookings" : "Out of Town"}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{availabilityActive ? "Your schedule is currently active." : "Scheduling is suspended."}</p>
                            </div>
                        </div>
                    </div>

                    {/* My Students Preview */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">My Students</h2>
                            <Link href="/teacher/students" className="text-sm font-bold text-emerald-600 hover:underline">View All</Link>
                        </div>
                        {students.length > 0 ? (
                            <div className="space-y-4">
                                {students.map((s, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden text-sm">
                                            {s.profileImage ? <img src={s.profileImage} className="w-full h-full object-cover" /> : s.name?.charAt(0) || "S"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{s.name || "Student"}</p>
                                            <p className="text-xs text-gray-500">{s.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No assigned students yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <ClassSchedulerModal
                isOpen={showScheduler}
                onClose={() => setShowScheduler(false)}
                prefillTeacherId={user?.uid}
                onClassScheduled={() => window.location.reload()}
            />
        </div>
    );
}
