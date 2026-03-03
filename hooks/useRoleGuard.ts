"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

/**
 * A centralized hook to guard routes based on user roles and prevent permission loops.
 * It waits for auth resolution, fetches the user doc exactly once, and checks the role.
 */
export function useRoleGuard(requiredRole: "admin" | "teacher" | "student") {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                // Not authenticated, send to login
                router.push("/login");
                return;
            }

            try {
                // Fetch user document
                const userDocRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userDocRef);

                if (!userSnap.exists()) {
                    // User doc doesn't exist? Eject.
                    await auth.signOut();
                    router.push("/login");
                    return;
                }

                const userData = userSnap.data();

                // Global Account Status Guard
                const accountStatus = userData.accountStatus ?? "active";
                if (accountStatus !== "active") {
                    await auth.signOut();
                    if (accountStatus === "suspended") {
                        router.push("/login?error=" + encodeURIComponent("Your account has been suspended. Contact administration."));
                    } else {
                        router.push("/login?error=" + encodeURIComponent("Your account has been archived. Contact administration."));
                    }
                    return;
                }

                if (userData.role !== requiredRole) {
                    // Role mismatch, boot to root or appropriate dashboard
                    if (userData.role === "admin") router.push("/admin");
                    else if (userData.role === "teacher") router.push("/teacher");
                    else if (userData.role === "student") router.push("/student");
                    else router.push("/");
                    return;
                }

                // Authorized!
                setUser({ uid: currentUser.uid, ...userData });
            } catch (error) {
                console.error("Error in role guard:", error);
                router.push("/");
            } finally {
                setLoading(false);
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [router, requiredRole]);

    const refreshUser = async () => {
        if (!user || !user.uid) return;
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                setUser({ uid: user.uid, ...userSnap.data() });
            }
        } catch (e) {
            console.error("Failed to refresh user", e);
        }
    };

    return { user, loading, refreshUser };
}
export function useAdminGuard() {
    return useRoleGuard("admin");
}

export function useTeacherGuard() {
    return useRoleGuard("teacher");
}

export function useStudentGuard() {
    return useRoleGuard("student");
}
