import { FieldValue, Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "teacher" | "student";
export type UserStatus = "active" | "suspended" | "archived";

export interface User {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    createdAt?: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}
