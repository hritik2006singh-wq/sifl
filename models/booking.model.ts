import { FieldValue, Timestamp } from "firebase/firestore";

export type BookingStatus = "pending" | "accepted" | "approved" | "rejected" | "hit" | "failed";

export interface DemoBooking {
    bookingId: string;
    name: string;
    email: string;
    language: string;
    preferredTime: string;
    status: BookingStatus;
    createdAt?: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}
