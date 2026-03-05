import { FieldValue, Timestamp } from "firebase/firestore";

export interface Teacher {
    uid: string;
    specialization: string;
    languages: string[];
    createdAt?: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}
