"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import MobileBottomNav from "@/components/MobileBottomNav";

const mobileNavItems = [
    { label: "Home", path: "/", icon: "home", exact: true },
    { label: "Programs", path: "/programs", icon: "menu_book" },
    { label: "Book Demo", path: "/demo-booking", icon: "calendar_month" },
    { label: "About", path: "/ysifl", icon: "info" },
];

export default function GlobalLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
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
            <Navbar />
            {/* mobile-bottom-safe adds padding so content clears the fixed bottom nav */}
            <main className="mobile-bottom-safe">{children}</main>
            <Footer />
            <LeadCapture />
            {/* MobileBottomNav is self-contained: fixed bottom-0, md:hidden */}
            <MobileBottomNav items={mobileNavItems} />
        </>
    );
}
