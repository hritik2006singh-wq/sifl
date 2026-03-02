"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface BottomNavItem {
    label: string;
    path: string;
    icon: string;
    exact?: boolean;
}

interface MobileBottomNavProps {
    items: BottomNavItem[];
}

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white/85 backdrop-blur-lg border-t border-gray-200 z-50 flex items-center justify-around pb-[env(safe-area-inset-bottom)] px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
            {items.slice(0, 4).map((item) => {
                const isActive = item.exact
                    ? pathname === item.path
                    : pathname.startsWith(item.path);

                return (
                    <Link
                        key={item.label}
                        href={item.path}
                        className={`group flex flex-col items-center justify-center w-full h-full active:scale-95 transition-all duration-300 ease-out select-none ${isActive ? "text-primary" : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        <div
                            className={`flex flex-col items-center justify-center relative px-4 py-1 rounded-2xl transition-all duration-300 ${isActive ? "bg-primary/10 scale-105" : "bg-transparent group-hover:bg-gray-100/50"
                                }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[24px] mb-0.5 transition-all duration-300 ${isActive ? "fill-current scale-110" : "scale-100"
                                    }`}
                                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                            <span
                                className={`text-[10px] tracking-wide transition-all duration-300 ${isActive ? "font-bold" : "font-medium"
                                    }`}
                            >
                                {item.label}
                            </span>

                            {isActive && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                            )}
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
