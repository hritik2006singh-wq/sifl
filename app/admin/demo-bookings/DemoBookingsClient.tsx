"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, doc, runTransaction, getDoc, where } from "firebase/firestore";
import { useAdminGuard } from "@/hooks/useRoleGuard";
import toast from "react-hot-toast";

type WeeklyTemplate = {
    [day: string]: { enabled: boolean; start: string; end: string };
};

export default function DemoBookingsClient() {
    const { user, loading: authLoading } = useAdminGuard();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Reschedule Modal States
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [newDate, setNewDate] = useState("");
    const [newTimeSlot, setNewTimeSlot] = useState("");
    const [availableSlots, setAvailableSlots] = useState<{ time: string; status: string }[]>([]);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [dateStatus, setDateStatus] = useState("");

    const fetchBookings = async () => {
        try {
            const bookingsRef = collection(db, "demoBookings");
            const q = query(bookingsRef, orderBy("createdAt", "desc"), limit(20));
            const snapshot = await getDocs(q);

            const data = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            setBookings(data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const handleReject = async (booking: any) => {
        try {
            await runTransaction(db, async (transaction) => {
                const bookingRef = doc(db, "demoBookings", booking.id);
                // The slotId format we created was: teacherId_date_timeSlot
                // Wait, what if old booking doesn't have teacherId? Fallback to admin_general.
                const tId = booking.teacherId || "admin_general";
                const slotId = `${tId}_${booking.date}_${booking.timeSlot}`;
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
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: "rejected" } : b));
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject booking.");
        }
    };

    // Open Modal
    const openRescheduleModal = (booking: any) => {
        setSelectedBooking(booking);
        setNewDate("");
        setNewTimeSlot("");
        setAvailableSlots([]);
        setDateStatus("");
        setShowRescheduleModal(true);
    };

    // Fetch slots when date changes
    useEffect(() => {
        const fetchSlots = async () => {
            if (!newDate || !selectedBooking) return;

            setDateStatus("Loading slots...");
            try {
                const tId = selectedBooking.teacherId || "admin_general";
                const availRef = doc(db, "availability", tId);
                const availSnap = await getDoc(availRef);

                if (!availSnap.exists()) {
                    setAvailableSlots([]);
                    setDateStatus("Schedule not configured.");
                    return;
                }

                const availData = availSnap.data();
                const blockedDates = availData.blockedDates || {};

                if (blockedDates[newDate]) {
                    setAvailableSlots([]);
                    setDateStatus("No sessions available on this date.");
                    return;
                }

                const weeklyTemplate: WeeklyTemplate = availData.weeklyTemplate || {};
                const checkDate = new Date(newDate);
                const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const dayName = days[checkDate.getDay()];

                const dayConfig = weeklyTemplate[dayName];
                if (!dayConfig || !dayConfig.enabled) {
                    setAvailableSlots([]);
                    setDateStatus("No sessions available on this date.");
                    return;
                }

                const generatedSlots: { time: string; status: string }[] = [];
                const parseTime = (timeStr: string) => {
                    const [h, m] = timeStr.split(":").map(Number);
                    return h * 60 + m;
                };

                const startMins = parseTime(dayConfig.start);
                const endMins = parseTime(dayConfig.end);

                for (let m = startMins; m < endMins; m += 30) {
                    const hh = Math.floor(m / 60).toString().padStart(2, '0');
                    const mm = (m % 60).toString().padStart(2, '0');
                    generatedSlots.push({ time: `${hh}:${mm}`, status: "available" });
                }

                // Actually fetch slots
                const slotsQuery = query(
                    collection(db, "slots"),
                    where("teacherId", "==", tId),
                    where("date", "==", newDate)
                );

                const slotsSnap = await getDocs(slotsQuery);
                const existingSlotsMap: { [time: string]: string } = {};
                slotsSnap.forEach(d => {
                    existingSlotsMap[d.data().time] = d.data().status;
                });

                const mergedSlots = generatedSlots.map(s => {
                    if (existingSlotsMap[s.time] && existingSlotsMap[s.time] !== "available") {
                        return { ...s, status: existingSlotsMap[s.time] };
                    }
                    return s;
                });

                setAvailableSlots(mergedSlots);
                setDateStatus(mergedSlots.length > 0 ? "" : "No slots remaining for this date.");
            } catch (err) {
                console.error(err);
                setDateStatus("Error fetching slots.");
            }
        };

        fetchSlots();
        setNewTimeSlot("");
    }, [newDate, selectedBooking]);

    const handleConfirmReschedule = async () => {
        if (!selectedBooking || !newDate || !newTimeSlot) {
            return toast.error("Please select a valid date and time slot.");
        }

        setRescheduleLoading(true);
        try {
            await runTransaction(db, async (transaction) => {
                const bookingRef = doc(db, "demoBookings", selectedBooking.id);
                const tId = selectedBooking.teacherId || "admin_general";

                const oldSlotId = `${tId}_${selectedBooking.date}_${selectedBooking.timeSlot}`;
                const newSlotId = `${tId}_${newDate}_${newTimeSlot}`;

                const oldSlotRef = doc(db, "slots", oldSlotId);
                const newSlotRef = doc(db, "slots", newSlotId);

                // Make sure new slot isn't taken and release old
                const newSlotDoc = await transaction.get(newSlotRef);
                const oldSlotDoc = await transaction.get(oldSlotRef);
                const bookingDoc = await transaction.get(bookingRef);

                if (!bookingDoc.exists()) throw new Error("Document missing");

                if (newSlotDoc.exists() && newSlotDoc.data().status !== "available") {
                    throw new Error("New slot is already taken.");
                }

                if (oldSlotDoc.exists()) {
                    transaction.update(oldSlotRef, { status: "available", bookingId: null });
                }

                // Claim new slot
                transaction.set(newSlotRef, {
                    date: newDate,
                    time: newTimeSlot,
                    teacherId: tId,
                    status: "pending", // Reset to pending essentially
                    bookingId: selectedBooking.id
                }, { merge: true });

                // Update booking
                transaction.update(bookingRef, {
                    date: newDate,
                    timeSlot: newTimeSlot,
                    status: "pending", // Rescheduling pushes it back to pending
                    updatedAt: new Date().toISOString()
                });
            });

            toast.success("Successfully rescheduled.");
            setShowRescheduleModal(false);
            fetchBookings(); // refresh
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to reschedule.");
        } finally {
            setRescheduleLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="p-6">Loading demo bookings...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Demo Bookings</h1>
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                            <th className="py-3 px-6 font-medium">Student Info</th>
                            <th className="py-3 px-6 font-medium">Language</th>
                            <th className="py-3 px-6 font-medium">Date & Time</th>
                            <th className="py-3 px-6 font-medium">Status</th>
                            <th className="py-3 px-6 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6">
                                    <p className="font-semibold text-gray-900">{booking.name}</p>
                                    <p className="text-sm text-gray-500">{booking.phone}</p>
                                </td>
                                <td className="py-4 px-6 text-sm font-medium">{booking.language}</td>
                                <td className="py-4 px-6">
                                    <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                                    <p className="text-xs text-gray-500">{booking.timeSlot}</p>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-bold capitalize border ${booking.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                            'bg-red-100 text-red-800 border-red-200'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right space-x-3">
                                    <button
                                        onClick={() => openRescheduleModal(booking)}
                                        className="text-blue-600 font-medium text-sm hover:underline"
                                    >
                                        Reschedule
                                    </button>
                                    {booking.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleReject(booking)}
                                            className="text-red-600 font-medium text-sm hover:underline"
                                        >
                                            Reject
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">No bookings available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col space-y-4 mt-4 mb-8">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">{booking.name}</h3>
                                <p className="text-sm text-gray-500">{booking.phone}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize border ${booking.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                    booking.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                        'bg-red-100 text-red-800 border-red-200'
                                }`}>
                                {booking.status}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date & Time</p>
                                <p className="text-sm font-bold text-gray-900">{booking.date} <span className="text-primary ml-1">{booking.timeSlot}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Language</p>
                                <p className="text-sm font-bold text-gray-900">{booking.language}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => openRescheduleModal(booking)}
                                className="flex-1 text-sm font-bold bg-blue-50 text-blue-700 py-2.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                Reschedule
                            </button>
                            {booking.status !== 'rejected' && (
                                <button
                                    onClick={() => handleReject(booking)}
                                    className="flex-1 text-sm font-bold bg-red-50 text-red-700 py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                                >
                                    Reject
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {bookings.length === 0 && (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        No bookings available.
                    </div>
                )}
            </div>

            {/* Reschedule Modal */}
            {showRescheduleModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
                        <h3 className="text-xl font-bold border-b pb-2">Reschedule Booking</h3>
                        <p className="text-sm text-gray-500">Rescheduling for: <span className="font-bold">{selectedBooking.name}</span></p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            {newDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select New Time Slot</label>
                                    {dateStatus ? (
                                        <div className="p-3 bg-gray-50 border border-dashed rounded-xl text-center text-sm font-medium text-gray-600">
                                            {dateStatus}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableSlots.map(slot => {
                                                const isBooked = slot.status !== "available";
                                                const isSelected = newTimeSlot === slot.time;
                                                return (
                                                    <button
                                                        key={slot.time}
                                                        disabled={isBooked}
                                                        onClick={() => setNewTimeSlot(slot.time)}
                                                        className={`py-2 text-xs font-bold rounded-lg border ${isBooked ? "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed" :
                                                            isSelected ? "bg-primary text-white border-primary" :
                                                                "bg-white text-gray-700 hover:border-primary/50"
                                                            }`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!newTimeSlot || rescheduleLoading}
                                onClick={handleConfirmReschedule}
                                className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                            >
                                {rescheduleLoading ? "Saving..." : "Confirm Reschedule"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
