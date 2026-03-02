"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTeacherGuard } from "@/hooks/useRoleGuard";

export default function TeacherLayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading } = useTeacherGuard();
    const pathname = usePathname();

    if (loading) return <div className="p-8">Loading...</div>;

    const isActive = (path: string) => {
        if (path === "/teacher" && pathname === "/teacher") return true;
        if (path !== "/teacher" && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <aside className="w-64 border-r border-gray-200 bg-white hidden lg:flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">SIFL Portal</h1>
                        <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-semibold mt-1">Teacher</p>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    <Link href="/teacher" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive("/teacher") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50"}`}>
                        <span className={`material-symbols-outlined text-[22px] ${isActive("/teacher") ? "text-emerald-600" : ""}`}>dashboard</span>
                        <span className="text-sm font-medium">Overview</span>
                    </Link>
                    <Link href="/teacher/students" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive("/teacher/students") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50"}`}>
                        <span className={`material-symbols-outlined text-[22px] ${isActive("/teacher/students") ? "text-emerald-600" : ""}`}>group</span>
                        <span className="text-sm font-medium">My Students</span>
                    </Link>
                    <Link href="/teacher/availability" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive("/teacher/availability") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50"}`}>
                        <span className={`material-symbols-outlined text-[22px] ${isActive("/teacher/availability") ? "text-emerald-600" : ""}`}>event_available</span>
                        <span className="text-sm font-medium">Availability</span>
                    </Link>
                    <Link href="/teacher/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive("/teacher/profile") ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50"}`}>
                        <span className={`material-symbols-outlined text-[22px] ${isActive("/teacher/profile") ? "text-emerald-600" : ""}`}>person</span>
                        <span className="text-sm font-medium">My Profile</span>
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white/70 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-lg font-bold">Instructor Portal</h2>
                    <Link href="/teacher/profile" className="size-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden border border-emerald-200 hover:scale-105 transition">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "T"
                        )}
                    </Link>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
