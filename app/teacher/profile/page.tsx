"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTeacherGuard } from "@/hooks/useRoleGuard";

export default function TeacherProfileRedirect() {
    const { user, loading } = useTeacherGuard();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push(`/teacher/${user.slug || user.uid}`);
        }
    }, [user, loading, router]);

    return <div className="p-8">Redirecting to your profile...</div>;
}
