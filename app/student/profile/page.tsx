"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudentGuard } from "@/hooks/useRoleGuard";

export default function StudentProfileRedirect() {
    const { user, loading } = useStudentGuard();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push(`/student/${user.slug || user.uid}`);
        }
    }, [user, loading, router]);

    return <div className="p-8">Redirecting to your profile...</div>;
}
