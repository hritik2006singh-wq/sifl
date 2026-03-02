"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";

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
            <main>{children}</main>
            <Footer />
            <LeadCapture />
        </>
    );
}
