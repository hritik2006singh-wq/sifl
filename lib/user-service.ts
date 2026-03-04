import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase-client";
import { User } from "firebase/auth";

export interface UserProfile {
    uid: string;
    email: string;
    role: "admin" | "teacher" | "student";
    status: "active" | "suspended" | "archived";
    createdAt: string;
    name?: string;
    [key: string]: any;
}

/**
 * Ensures a user profile exists in Firestore and returns the normalized profile.
 * If missing, it creates a default one with role "student".
 */
export async function ensureUserProfile(user: User, initialData?: Partial<UserProfile>): Promise<UserProfile> {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const currentData = userSnap.data() as any;

        // Normalize the structure: ensuring role, status/accountStatus, and createdAt are present
        const currentStatus = currentData.accountStatus || currentData.status || "active";

        const normalizedProfile: UserProfile = {
            uid: user.uid,
            email: currentData.email || user.email || "",
            role: currentData.role || "student",
            status: currentStatus,
            createdAt: currentData.createdAt || new Date().toISOString(),
            ...currentData
        };

        // If any critical field was missing (role or status), we update it in Firestore
        if (!currentData.role || (!currentData.status && !currentData.accountStatus)) {
            await setDoc(userDocRef, {
                role: normalizedProfile.role,
                status: normalizedProfile.status,
                accountStatus: normalizedProfile.status
            }, { merge: true });
        }

        return normalizedProfile;
    } else {
        // Create a new Firestore document if it does not exist
        const defaultStatus = initialData?.status || "active";
        const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || initialData?.email || "",
            role: initialData?.role || "student",
            status: defaultStatus,
            createdAt: initialData?.createdAt || new Date().toISOString(),
            ...initialData
        };

        // Write the document with both status and accountStatus for legacy compatibility
        await setDoc(userDocRef, {
            ...newProfile,
            accountStatus: defaultStatus
        });

        return newProfile;
    }
}
