import { collection, doc, getDoc, getDocs, setDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Student } from "@/models/student.model";

export const StudentService = {
    async getStudentProfile(uid: string): Promise<Student | null> {
        try {
            const studentRef = doc(db, "students", uid);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
                return studentSnap.data() as Student;
            }
            return null;
        } catch (error: any) {
            console.error("Error fetching student profile:", error);
            throw new Error("Failed to fetch student profile");
        }
    },

    async getAllStudents(): Promise<Student[]> {
        try {
            const studentsRef = collection(db, "students");
            const q = query(studentsRef, orderBy("createdAt", "desc"));
            const docRefs = await getDocs(q);
            return docRefs.docs.map(doc => doc.data() as Student);
        } catch (error: any) {
            console.error("Error fetching all students:", error);
            throw new Error("Failed to fetch students");
        }
    },

    async createStudentProfile(uid: string, data: Omit<Student, "uid">): Promise<void> {
        try {
            const studentRef = doc(db, "students", uid);
            await setDoc(studentRef, {
                uid,
                ...data,
            });
        } catch (error: any) {
            console.error("Error creating student profile:", error);
            throw new Error("Failed to create student profile");
        }
    }
};
