"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import MobileBottomNav from "@/components/MobileBottomNav";

const mobileNavItems = [
    { label: "Home", path: "/", icon: "home", exact: true },
    { label: "Programs", path: "/programs", icon: "menu_book" },
    { label: "Book Demo", path: "/demo-booking", icon: "calendar_month" },
];

export default function GlobalLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isDashboard =
        pathname?.startsWith("/admin") ||
        pathname?.startsWith("/teacher") ||
        pathname?.startsWith("/student") ||
        pathname === "/login" ||
        pathname === "/register";

    if (isDashboard) {
        return <main>{children}</main>;
    }

    return (
        <>
            <Navbar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <main className="mobile-bottom-safe">{children}</main>
            <Footer />
            <LeadCapture />
            <MobileBottomNav
                items={mobileNavItems}
                onOpenMenu={() => setIsMobileMenuOpen(true)}
            />
        </>
    );
}
