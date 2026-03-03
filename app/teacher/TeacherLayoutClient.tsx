"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTeacherGuard } from "@/hooks/useRoleGuard";
import MobileBottomNav from "@/components/MobileBottomNav";
import { TEACHER_ROUTES } from "@/config/sidebarRoutes";

const mobileNavItems = [
    { label: "Overview", icon: "dashboard", path: "/teacher", exact: true },
    { label: "Students", icon: "group", path: "/teacher/students" },
    { label: "Schedule", icon: "event_available", path: "/teacher/availability" },
    { label: "Profile", icon: "person", path: "/teacher/profile" }
];

export default function TeacherLayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading } = useTeacherGuard();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (loading) return <div className="p-8">Loading...</div>;

    const isActive = (path: string) => {
        if (path === "/teacher" && pathname === "/teacher") return true;
        if (path !== "/teacher" && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="flex h-[100dvh] bg-gray-50 overflow-hidden font-sans">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-[80%] max-w-sm
                bg-white shadow-2xl z-50
                transform transition-transform duration-300 ease-out
                lg:hidden flex flex-col
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="p-6 flex justify-between items-center border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none">SIFL Portal</h1>
                            <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-semibold mt-1">Teacher</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {TEACHER_ROUTES.map(route => (
                        <Link key={route.path} onClick={() => setIsMobileMenuOpen(false)} href={route.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(route.path) ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50"}`}>
                            <span className={`material-symbols-outlined text-[22px] ${isActive(route.path) ? "text-emerald-600" : ""}`}>{route.icon}</span>
                            <span className="text-sm font-medium">{route.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>

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
                    {TEACHER_ROUTES.map(route => (
                        <Link key={route.path} href={route.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(route.path) ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-emerald-50"}`}>
                            <span className={`material-symbols-outlined text-[22px] ${isActive(route.path) ? "text-emerald-600" : ""}`}>{route.icon}</span>
                            <span className="text-sm font-medium">{route.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white/70 backdrop-blur-md sticky top-0 z-10 max-md:px-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 -ml-2"
                        >
                            <span className="material-symbols-outlined text-[24px]">menu</span>
                        </button>
                        <h2 className="text-lg font-bold">SIFL Portal</h2>
                    </div>
                    <Link href="/teacher/profile" className="size-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden border border-emerald-200 hover:scale-105 transition">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "T"
                        )}
                    </Link>
                </header>
                <div className="flex-1 overflow-y-auto p-4 max-md:pb-24 md:p-8">
                    {children}
                </div>
            </main>
            <MobileBottomNav items={mobileNavItems} />
        </div>
    );
}
