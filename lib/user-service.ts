import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase-client";
import { User } from "firebase/auth";

export interface UserProfile {
    uid: string;
    email: string;
    role: "admin" | "teacher" | "student";
    status: "active" | "suspended" | "archived";
    accountStatus: "active" | "suspended" | "archived";
    createdAt: any;
    name?: string;
    [key: string]: any;
}

/**
 * Ensures a user profile exists in Firestore.
 * If missing, it creates one with default values using Auth data.
 * If it already exists, it checks if critical fields are present.
 */
export async function ensureUserProfile(user: User, initialData?: Partial<UserProfile>): Promise<UserProfile> {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const currentData = userSnap.data() as any;

        // Requirement: If a profile already exists, do not overwrite it unless fields are missing.
        const missingFields: any = {};
        if (!currentData.email && user.email) missingFields.email = user.email;
        if (!currentData.role) missingFields.role = initialData?.role || "student";

        // Map both status and accountStatus to be safe and consistent with project patterns
        const currentStatus = currentData.accountStatus || currentData.status || "active";
        if (!currentData.status) missingFields.status = currentStatus;
        if (!currentData.accountStatus) missingFields.accountStatus = currentStatus;

        if (!currentData.createdAt) missingFields.createdAt = initialData?.createdAt || new Date().toISOString();

        if (Object.keys(missingFields).length > 0) {
            await setDoc(userDocRef, missingFields, { merge: true });
            return { ...currentData, ...missingFields, uid: user.uid };
        }

        return { ...currentData, uid: user.uid, status: currentStatus, accountStatus: currentStatus };
    } else {
        const defaultStatus = initialData?.accountStatus || initialData?.status || "active";
        const newProfile: any = {
            uid: user.uid,
            email: user.email || initialData?.email || "",
            role: initialData?.role || "student",
            status: defaultStatus,
            accountStatus: defaultStatus,
            createdAt: initialData?.createdAt || new Date().toISOString(),
            ...initialData
        };

        await setDoc(userDocRef, newProfile);
        return newProfile;
    }
}
