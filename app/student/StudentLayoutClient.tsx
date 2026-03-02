"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useStudentGuard } from "@/hooks/useRoleGuard";

export default function StudentLayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading } = useStudentGuard();
    const pathname = usePathname();

    if (loading) return <div className="p-8">Loading your profile...</div>;

    const isPaid = user?.is_paid;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                    <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined">menu_book</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">My Learning</h1>
                        <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mt-1">Student Portal</p>
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
                    <Link href="/student" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${pathname === "/student" ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-primary/10"}`}>
                        <span className={`material-symbols-outlined text-[20px] ${pathname === "/student" ? "text-white" : "text-gray-400 group-hover:text-primary"}`}>home</span>
                        <span className="text-sm font-medium">Overview</span>
                    </Link>
                    <Link href="/student/materials" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${pathname.startsWith("/student/materials") ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-primary/10"}`}>
                        <span className={`material-symbols-outlined text-[20px] ${pathname.startsWith("/student/materials") ? "text-white" : "text-gray-400 group-hover:text-primary"}`}>video_library</span>
                        <span className="text-sm font-medium">My Materials</span>
                    </Link>
                    <Link href="/student/assignments" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${pathname.startsWith("/student/assignments") ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-primary/10"}`}>
                        <span className={`material-symbols-outlined text-[20px] ${pathname.startsWith("/student/assignments") ? "text-white" : "text-gray-400 group-hover:text-primary"}`}>assignment</span>
                        <span className="text-sm font-medium">Assignments & Tests</span>
                    </Link>
                    <Link href="/student/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${pathname === "/student/profile" ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-primary/10"}`}>
                        <span className={`material-symbols-outlined text-[20px] ${pathname === "/student/profile" ? "text-white" : "text-gray-400 group-hover:text-primary"}`}>person</span>
                        <span className="text-sm font-medium">My Profile</span>
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white/50 backdrop-blur-md sticky top-0 z-10 w-full">
                    <div className="font-bold text-gray-800">
                        {user?.language ? `${user?.language} Track` : "No Track Assigned"}
                    </div>
                    <Link href="/student/profile" className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 cursor-pointer hover:scale-105 transition overflow-hidden">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "S"
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
