"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStudentGuard } from "@/hooks/useRoleGuard";
import MobileBottomNav from "@/components/MobileBottomNav";
import { STUDENT_ROUTES } from "@/config/sidebarRoutes";
import { BRANDING } from "@/config/branding";

const mobileNavItems = [
    { label: "Overview", icon: "home", path: "/student", exact: true },
    { label: "Materials", icon: "video_library", path: "/student/materials" },
    { label: "Tasks", icon: "assignment", path: "/student/assignments" },
    { label: "Profile", icon: "person", path: "/student/profile" }
];

export default function StudentLayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading } = useStudentGuard();
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (loading) return <div className="p-8">Loading your profile...</div>;

    const isPaid = user?.is_paid;

    return (
        <div className="flex h-[100dvh] bg-slate-50 overflow-hidden font-sans">
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
                        <Image src={BRANDING.dashboardLogo} alt="Logo" width={40} height={40} className="rounded-md object-cover shadow-sm" />
                        <div>
                            <h1 className="text-lg font-bold leading-none">SIFL Student Portal</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-6 py-4">
                    {isPaid ? (
                        <div className="bg-primary text-white p-3 rounded-xl shadow-md">
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Status</p>
                            <p className="font-bold flex items-center gap-1.5 text-sm">
                                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                                Premium Member
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-100 text-gray-600 p-3 rounded-xl border border-gray-200">
                            <p className="text-xs font-bold uppercase tracking-wider mb-1">Status</p>
                            <p className="font-bold flex items-center gap-1.5 text-sm">
                                <span className="material-symbols-outlined text-[16px]">lock</span>
                                Free Account
                            </p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {STUDENT_ROUTES.map(route => {
                        const isExact = route.path === "/student";
                        const isActive = isExact ? pathname === route.path : pathname.startsWith(route.path);
                        return (
                            <Link key={route.path} onClick={() => setIsMobileMenuOpen(false)} href={route.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-primary/10"}`}>
                                <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`}>{route.icon}</span>
                                <span className="text-sm font-medium">{route.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                    <Image src={BRANDING.dashboardLogo} alt="Logo" width={40} height={40} className="rounded-md object-cover shadow-sm" />
                    <div>
                        <h1 className="text-lg font-bold leading-none">SIFL Student Portal</h1>
                    </div>
                </div>

                <div className="px-6 py-4">
                    {isPaid ? (
                        <div className="bg-primary text-white p-3 rounded-xl shadow-md">
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Status</p>
                            <p className="font-bold flex items-center gap-1.5 text-sm">
                                <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                                Premium Member
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-100 text-gray-600 p-3 rounded-xl border border-gray-200">
                            <p className="text-xs font-bold uppercase tracking-wider mb-1">Status</p>
                            <p className="font-bold flex items-center gap-1.5 text-sm">
                                <span className="material-symbols-outlined text-[16px]">lock</span>
                                Free Account
                            </p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {STUDENT_ROUTES.map(route => {
                        const isExact = route.path === "/student";
                        const isActive = isExact ? pathname === route.path : pathname.startsWith(route.path);
                        return (
                            <Link key={route.path} href={route.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-primary/10"}`}>
                                <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`}>{route.icon}</span>
                                <span className="text-sm font-medium">{route.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white/50 backdrop-blur-md sticky top-0 z-10 w-full max-md:px-4 max-md:bg-white/70 max-md:backdrop-blur-md">
                    <div className="flex items-center gap-3 font-bold text-gray-800">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 -ml-2"
                        >
                            <span className="material-symbols-outlined text-[24px]">menu</span>
                        </button>
                        <span className="truncate max-w-[150px] md:max-w-xs">{user?.language ? `${user?.language} Track` : "No Track Assigned"}</span>
                    </div>
                    <Link href="/student/profile" className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 cursor-pointer hover:scale-105 transition overflow-hidden">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "S"
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
