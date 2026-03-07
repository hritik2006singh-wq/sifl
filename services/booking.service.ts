import { collection, doc, getDocs, updateDoc, setDoc, deleteDoc, query, orderBy, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { DemoBooking, BookingStatus } from "@/models/booking.model";

export const BookingService = {
    async getAllBookings(): Promise<DemoBooking[]> {
        try {
            const bookingsRef = collection(db, "demoBookings");
            const q = query(bookingsRef, orderBy("createdAt", "desc"));
            const docRefs = await getDocs(q);
            return docRefs.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as DemoBooking));
        } catch (error: any) {
            console.error("[BookingService] Failed to fetch bookings:", error);
            // Return empty array instead of throwing — prevents UI crash on permission errors
            return [];
        }
    },

    async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
        try {
            const bookingRef = doc(db, "demoBookings", bookingId);
            await updateDoc(bookingRef, {
                status,
                updatedAt: serverTimestamp()
            });
        } catch (error: any) {
            console.error("Error updating booking status:", error);
            throw new Error("Failed to update booking status");
        }
    },

    async createBooking(bookingId: string, data: Omit<DemoBooking, "bookingId" | "status" | "createdAt" | "updatedAt">): Promise<void> {
        try {
            const bookingRef = doc(db, "demoBookings", bookingId);
            await setDoc(bookingRef, {
                bookingId,
                status: "pending",
                createdAt: serverTimestamp(),
                ...data
            });
        } catch (error: any) {
            console.error("Error creating booking:", error);
            throw new Error("Failed to create booking");
        }
    },

    async deleteBooking(bookingId: string): Promise<void> {
        await deleteDoc(doc(db, "demoBookings", bookingId));
    },

    /**
     * Subscribe to real-time booking updates via onSnapshot.
     * Returns an unsubscribe function.
     */
    subscribeToBookings(callback: (bookings: DemoBooking[]) => void): () => void {
        const bookingsRef = collection(db, "demoBookings");
        const q = query(bookingsRef, orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const bookings = snapshot.docs.map(
                    (d) => ({ id: d.id, ...d.data() } as unknown as DemoBooking)
                );
                callback(bookings);
            },
            (error) => {
                console.error("[BookingService] Real-time listener error:", error);
            }
        );
        return unsubscribe;
    }
};
