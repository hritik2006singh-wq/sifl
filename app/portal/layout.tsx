import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { dashboardContent } from '@/content/dashboard';

export default function PortalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex h-screen overflow-hidden">
            {/* SIDEBAR NAVIGATION */}
            <div className="hidden md:flex w-64 flex-shrink-0">
                <Sidebar items={dashboardContent.sidebar.items} className="w-full" />
            </div>

            {/* MOBILE HEADER (Optional fallback) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
                <span className="text-xl font-bold text-primary">SIFL Portal</span>
                <button className="text-gray-500">☰</button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-auto bg-gray-50 mt-16 md:mt-0 p-4 md:p-8 lg:p-10">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
