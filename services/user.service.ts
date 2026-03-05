import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { User, UserRole, UserStatus } from "@/models/user.model";

export const UserService = {
    async getUserProfile(uid: string): Promise<User | null> {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data() as User;
            }
            return null;
        } catch (error: any) {
            console.error("Error fetching user profile:", error);
            throw new Error(error.message || "Failed to fetch user profile");
        }
    },

    async createUserProfile(uid: string, data: Partial<User>): Promise<void> {
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, {
                uid,
                ...data,
            });
        } catch (error: any) {
            console.error("Error creating user profile:", error);
            throw new Error("Failed to create user profile");
        }
    },

    async updateUserStatus(uid: string, status: UserStatus): Promise<void> {
        try {
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, {
                status,
                updatedAt: new Date()
            });
        } catch (error: any) {
            console.error("Error updating user status:", error);
            throw new Error("Failed to update user status");
        }
    }
};
