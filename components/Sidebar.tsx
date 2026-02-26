'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
    id: string;
    label: string;
    path: string;
}

interface SidebarProps {
    items: SidebarItem[];
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, className = '' }) => {
    const pathname = usePathname();

    return (
        <aside className={`bg-white border-r border-gray-100 flex flex-col h-full ${className}`}>
            <div className="p-6 border-b border-gray-100">
                <Link href="/" className="text-2xl font-bold text-primary tracking-tight">SIFL <span className="text-accent text-sm ml-1">Portal</span></Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-6 px-4">
                <ul className="space-y-2">
                    {items.map((item) => {
                        const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
                        return (
                            <li key={item.id}>
                                <Link
                                    href={item.path}
                                    className={`block px-4 py-3 rounded-btn text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-100">
                <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-btn transition-colors">
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
