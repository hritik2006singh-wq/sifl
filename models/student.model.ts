import { FieldValue, Timestamp } from "firebase/firestore";

export interface Student {
    uid: string;
    languageTrack: string;
    level: string;
    age: number;
    createdAt?: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}
