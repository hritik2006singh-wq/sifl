"use client";

import { useState, useEffect } from "react";
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
    onOpenMenu: () => void;
}

export default function MobileBottomNav({ items, onOpenMenu }: MobileBottomNavProps) {
    const pathname = usePathname();
    const [isCompact, setIsCompact] = useState(false);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsCompact(currentScrollY > 50 && currentScrollY > lastScrollY);
            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`md:hidden fixed bottom-0 inset-x-0 bg-white/85 backdrop-blur-lg border-t border-gray-200 z-50 flex items-center justify-around pb-[env(safe-area-inset-bottom)] px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 ${
                isCompact ? "h-12" : "h-16"
            }`}
        >
            {items.slice(0, 3).map((item) => {
                const isActive = item.exact
                    ? pathname === item.path
                    : pathname.startsWith(item.path);

                return (
                    <Link
                        key={item.label}
                        href={item.path}
                        className={`group flex flex-col items-center justify-center w-full h-full active:scale-95 transition-all duration-300 ease-out select-none ${
                            isActive ? "text-primary" : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        <div
                            className={`flex flex-col items-center justify-center relative rounded-2xl transition-all duration-300 ${
                                isCompact ? "px-3 py-0.5" : "px-4 py-1"
                            } ${
                                isActive
                                    ? "bg-primary/10"
                                    : "bg-transparent group-hover:bg-gray-100/50"
                            }`}
                        >
                            <span
                                className={`material-symbols-outlined transition-all duration-300 ${
                                    isCompact ? "text-[18px]" : "text-[22px] mb-0.5"
                                }`}
                                style={{
                                    fontVariationSettings: isActive
                                        ? "'FILL' 1"
                                        : "'FILL' 0",
                                }}
                            >
                                {item.icon}
                            </span>
                            <span
                                className={`tracking-wide transition-all duration-300 ${
                                    isCompact ? "text-[8px]" : "text-[10px]"
                                } ${isActive ? "font-bold" : "font-medium"}`}
                            >
                                {item.label}
                            </span>
                        </div>
                    </Link>
                );
            })}

            {/* More button — opens the side drawer */}
            <button
                onClick={onOpenMenu}
                className="group flex flex-col items-center justify-center w-full h-full active:scale-95 transition-all duration-300 ease-out select-none text-gray-500 hover:text-gray-800"
            >
                <div
                    className={`flex flex-col items-center justify-center relative rounded-2xl transition-all duration-300 ${
                        isCompact ? "px-3 py-0.5" : "px-4 py-1"
                    } bg-transparent group-hover:bg-gray-100/50`}
                >
                    <span
                        className={`material-symbols-outlined transition-all duration-300 ${
                            isCompact ? "text-[18px]" : "text-[22px] mb-0.5"
                        }`}
                    >
                        menu
                    </span>
                    <span
                        className={`tracking-wide transition-all duration-300 ${
                            isCompact ? "text-[8px]" : "text-[10px]"
                        } font-medium`}
                    >
                        More
                    </span>
                </div>
            </button>
        </nav>
    );
}
