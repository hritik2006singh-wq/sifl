"use client";

import { useAdminGuard } from "@/hooks/useRoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-client";
import { collection, query, orderBy, getDocs, doc, runTransaction, onSnapshot, where } from "firebase/firestore";
import toast from "react-hot-toast";

export default function AdminSchedulePage() {
    const { user, loading: authLoading } = useAdminGuard();
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [pastBookings, setPastBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Query pending
        const qPending = query(
            collection(db, "demoBookings"),
            where("status", "==", "pending")
        );

        // Query reviewed
        const qReviewed = query(
            collection(db, "demoBookings"),
            where("status", "in", ["approved", "rejected"])
        );

        const unsubPending = onSnapshot(qPending, (snapshot) => {
            const fetched: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client side sort since we can't easily compound index status + createdAt without creating it first
            fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPendingBookings(fetched);
            setLoading(false);
        });

        const unsubReviewed = onSnapshot(qReviewed, (snapshot) => {
            const fetched: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPastBookings(fetched);
        });

        return () => {
            unsubPending();
            unsubReviewed();
        };
    }, [user]);

    const handleApprove = async (booking: any) => {
        try {
            await runTransaction(db, async (transaction) => {
                const bookingRef = doc(db, "demoBookings", booking.id);
                // Ensure atomic operation
                const slotId = `${booking.teacherId}_${booking.date}_${booking.timeSlot}`;
                const slotRef = doc(db, "slots", slotId);

                const bookingDoc = await transaction.get(bookingRef);
                const slotDoc = await transaction.get(slotRef);

                if (!bookingDoc.exists()) throw new Error("Document missing");

                transaction.update(bookingRef, { status: "approved" });
                if (slotDoc.exists()) {
                    transaction.update(slotRef, { status: "booked" });
                }
            });

            toast.success(`Booking for ${booking.name} approved.`);
        } catch (error) {
            console.error("Error approving booking:", error);
            toast.error("Failed to approve booking.");
        }
    };

    const handleReject = async (booking: any) => {
        try {
            await runTransaction(db, async (transaction) => {
                const bookingRef = doc(db, "demoBookings", booking.id);
                const slotId = `${booking.teacherId}_${booking.date}_${booking.timeSlot}`;
                const slotRef = doc(db, "slots", slotId);

                const bookingDoc = await transaction.get(bookingRef);
                const slotDoc = await transaction.get(slotRef);

                if (!bookingDoc.exists()) throw new Error("Document missing");

                transaction.update(bookingRef, { status: "rejected" });
                if (slotDoc.exists()) {
                    transaction.update(slotRef, { status: "available", bookingId: null });
                }
            });
            toast.success("Booking rejected.");
        } catch (error) {
            console.error("Error rejecting booking:", error);
            toast.error("Failed to reject booking.");
        }
    };

    if (authLoading || loading) return <div className="p-8">Loading schedule...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Demo Schedule Control</h1>
                    <p className="text-gray-500 mt-1">Approve or reject incoming 1-on-1 language assessments.</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-gray-900 border-b pb-2">Pending Requests ({pendingBookings.length})</h2>
                {pendingBookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingBookings.map(b => (
                            <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 flex flex-col transition-all hover:shadow-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <span className="material-symbols-outlined text-6xl text-amber-500">pending_actions</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 truncate pr-8">{b.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> {b.phone}</p>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">mail</span> {b.email}</p>

                                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase font-bold text-amber-600 tracking-wider">Date & Time</p>
                                        <p className="font-bold text-gray-900">{b.date} at {b.timeSlot}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase font-bold text-amber-600 tracking-wider">Language</p>
                                        <p className="font-bold text-gray-900">{b.language}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t flex gap-3 z-10">
                                    <button
                                        onClick={() => handleReject(b)}
                                        className="flex-1 py-2 rounded-xl text-red-600 font-bold bg-red-50 hover:bg-red-100 transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(b)}
                                        className="flex-1 py-2 rounded-xl text-white font-bold bg-green-500 hover:bg-green-600 transition-colors shadow-sm"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                        <p>No pending bookings. You're all caught up!</p>
                    </div>
                )}
            </div>

            <div className="space-y-6 pt-8">
                <h2 className="text-xl font-extrabold text-gray-900 border-b pb-2">Reviewed Requests</h2>
                {pastBookings.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 font-semibold text-sm text-gray-600">Student Name</th>
                                    <th className="p-4 font-semibold text-sm text-gray-600">Contact</th>
                                    <th className="p-4 font-semibold text-sm text-gray-600">Date & Time</th>
                                    <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastBookings.map(b => (
                                    <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900">{b.name}</p>
                                            <p className="text-xs text-gray-500">{b.language}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium">{b.phone}</p>
                                            <p className="text-xs text-gray-500">{b.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium text-gray-900">{b.date}</p>
                                            <p className="text-xs text-gray-500">{b.timeSlot}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${b.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-center py-4 text-sm">No reviewed requests yet.</p>
                )}
            </div>
        </div>
    );
}
