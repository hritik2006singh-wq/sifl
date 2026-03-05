import { collection, doc, getDoc, getDocs, setDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Teacher } from "@/models/teacher.model";

export const TeacherService = {
    async getTeacherProfile(uid: string): Promise<Teacher | null> {
        try {
            const teacherRef = doc(db, "teachers", uid);
            const teacherSnap = await getDoc(teacherRef);
            if (teacherSnap.exists()) {
                return teacherSnap.data() as Teacher;
            }
            return null;
        } catch (error: any) {
            console.error("Error fetching teacher profile:", error);
            throw new Error("Failed to fetch teacher profile");
        }
    },

    async getAllTeachers(): Promise<Teacher[]> {
        try {
            const teachersRef = collection(db, "teachers");
            const q = query(teachersRef, orderBy("createdAt", "desc"));
            const docRefs = await getDocs(q);
            return docRefs.docs.map(doc => doc.data() as Teacher);
        } catch (error: any) {
            console.error("Error fetching all teachers:", error);
            throw new Error("Failed to fetch teachers");
        }
    },

    async createTeacherProfile(uid: string, data: Omit<Teacher, "uid">): Promise<void> {
        try {
            const teacherRef = doc(db, "teachers", uid);
            await setDoc(teacherRef, {
                uid,
                ...data,
            });
        } catch (error: any) {
            console.error("Error creating teacher profile:", error);
            throw new Error("Failed to create teacher profile");
        }
    }
};
