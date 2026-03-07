"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-client";
import { doc, runTransaction, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { BookingService } from "@/services/booking.service";
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

    // Outcome & Delete State
    const [outcomeModal, setOutcomeModal] = useState<{ show: boolean; booking: any } | null>(null);
    const [outcomePassword, setOutcomePassword] = useState("");
    const [outcomeSubmitting, setOutcomeSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            const data = await BookingService.getAllBookings();
            // map bookingId to id for UI compatibility
            setBookings(data.map(b => ({ ...b, id: b.bookingId })));
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
            await BookingService.updateBookingStatus(booking.id, "rejected");
            // also free the slot if it exists
            try {
                const tId = booking.teacherId || "admin_general";
                const slotId = `${tId}_${booking.date}_${booking.timeSlot}`;
                const slotRef = doc(db, "slots", slotId);
                const slotDoc = await getDoc(slotRef);
                if (slotDoc.exists()) {
                    const { updateDoc } = await import("firebase/firestore");
                    await updateDoc(slotRef, { status: "available", bookingId: null });
                }
            } catch {
                // slot cleanup is best-effort
            }
            toast.success("Booking rejected.");
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: "rejected" } : b));
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject booking.");
        }
    };

    const handleApprove = async (booking: any) => {
        try {
            await BookingService.updateBookingStatus(booking.id, "approved");
            // Lock the slot as confirmed
            try {
                const tId = booking.teacherId || "admin_general";
                const slotId = `${tId}_${booking.date}_${booking.timeSlot}`;
                const slotRef = doc(db, "slots", slotId);
                const slotDoc = await getDoc(slotRef);
                if (slotDoc.exists()) {
                    const { updateDoc } = await import("firebase/firestore");
                    await updateDoc(slotRef, { status: "confirmed", confirmedAt: new Date().toISOString() });
                }
            } catch { /* slot update is best-effort */ }
            toast.success("Booking approved!");
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: "approved" } : b));
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve booking.");
        }
    };

    const handleMarkOutcome = async (outcome: "hit" | "failed") => {
        if (!outcomeModal) return;
        const booking = outcomeModal.booking;

        if (outcome === "hit" && !outcomePassword) {
            toast.error("Please enter a temporary password to create the student account.");
            return;
        }

        setOutcomeSubmitting(true);
        try {
            await BookingService.updateBookingStatus(booking.id, outcome);

            if (outcome === "hit") {
                const res = await fetch("/api/students", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: booking.email,
                        name: booking.name,
                        password: outcomePassword,
                        languageTrack: booking.language || "",
                        level: "",
                        isPaid: false,
                        hasFullAccess: false,
                    }),
                });
                const data = await res.json();
                if (!res.ok && data.error !== "A student with this email already exists.") {
                    throw new Error(data.error || "Failed to create student account");
                }
                toast.success("Demo marked as HIT — student account created!");
            } else {
                toast.success("Demo marked as Failed.");
            }

            setBookings(prev =>
                prev.map(b => b.id === booking.id ? { ...b, status: outcome } : b)
            );
            setOutcomeModal(null);
            setOutcomePassword("");
        } catch (err: any) {
            toast.error(err.message || "Operation failed.");
        } finally {
            setOutcomeSubmitting(false);
        }
    };

    const handleDeleteBooking = async (booking: any) => {
        if (!confirm(`Delete booking for ${booking.name}? This will also free the time slot.`)) return;
        setDeletingId(booking.id);
        try {
            try {
                const tId = booking.teacherId || "admin_general";
                const slotId = `${tId}_${booking.date}_${booking.timeSlot}`;
                const slotRef = doc(db, "slots", slotId);
                const slotDoc = await getDoc(slotRef);
                if (slotDoc.exists()) {
                    const { updateDoc } = await import("firebase/firestore");
                    await updateDoc(slotRef, { status: "available", bookingId: null });
                }
            } catch { /* best-effort slot cleanup */ }

            await BookingService.deleteBooking(booking.id);
            setBookings(prev => prev.filter(b => b.id !== booking.id));
            toast.success("Booking deleted and slot freed.");
        } catch (err: any) {
            toast.error("Failed to delete booking.");
        } finally {
            setDeletingId(null);
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
                    setDateStatus("No slots available for this date.");
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

                // RISK-4: Parse YYYY-MM-DD manually to local midnight
                const [year, month, day] = newDate.split('-').map(Number);
                const checkDate = new Date(year, month - 1, day);

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
                                            booking.status === 'hit' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                booking.status === 'failed' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                                    'bg-red-100 text-red-800 border-red-200'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-3 flex-wrap">
                                        {booking.status === "pending" && (
                                            <button
                                                onClick={() => handleApprove(booking)}
                                                className="text-green-600 font-medium text-sm hover:underline"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {booking.status !== "rejected" && booking.status !== "hit" && booking.status !== "failed" && (
                                            <button
                                                onClick={() => handleReject(booking)}
                                                className="text-red-600 font-medium text-sm hover:underline"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        {(booking.status === "pending" || booking.status === "approved") && (
                                            <button
                                                onClick={() => { setOutcomeModal({ show: true, booking }); setOutcomePassword(""); }}
                                                className="text-purple-600 font-medium text-sm hover:underline"
                                            >
                                                Mark Outcome
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openRescheduleModal(booking)}
                                            className="text-blue-600 font-medium text-sm hover:underline"
                                        >
                                            Reschedule
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBooking(booking)}
                                            disabled={deletingId === booking.id}
                                            className="text-gray-400 font-medium text-sm hover:text-red-500 hover:underline disabled:opacity-50"
                                        >
                                            {deletingId === booking.id ? "..." : "Delete"}
                                        </button>
                                    </div>
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
                                    booking.status === 'hit' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                        booking.status === 'failed' ? 'bg-slate-100 text-slate-700 border-slate-200' :
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

                        <div className="flex gap-2 pt-1 flex-wrap">
                            {booking.status === "pending" && (
                                <button
                                    onClick={() => handleApprove(booking)}
                                    className="flex-1 text-sm font-bold bg-green-50 text-green-700 py-2.5 rounded-xl border border-green-100 hover:bg-green-100 transition-colors"
                                >
                                    Approve
                                </button>
                            )}
                            {booking.status !== "rejected" && booking.status !== "hit" && booking.status !== "failed" && (
                                <button
                                    onClick={() => handleReject(booking)}
                                    className="flex-1 text-sm font-bold bg-red-50 text-red-700 py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                                >
                                    Reject
                                </button>
                            )}
                            {(booking.status === "pending" || booking.status === "approved") && (
                                <button
                                    onClick={() => { setOutcomeModal({ show: true, booking }); setOutcomePassword(""); }}
                                    className="flex-1 text-sm font-bold bg-purple-50 text-purple-700 py-2.5 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors"
                                >
                                    Outcome
                                </button>
                            )}
                            <button
                                onClick={() => openRescheduleModal(booking)}
                                className="flex-1 text-sm font-bold bg-blue-50 text-blue-700 py-2.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                Reschedule
                            </button>
                            <button
                                onClick={() => handleDeleteBooking(booking)}
                                disabled={deletingId === booking.id}
                                className="flex-1 text-sm font-bold bg-gray-50 text-gray-500 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                                {deletingId === booking.id ? "..." : "Delete"}
                            </button>
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
                                                const isAvailable = slot.status === "available";
                                                const isPending = slot.status === "pending";
                                                return (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        disabled={!isAvailable || rescheduleLoading}
                                                        onClick={() => isAvailable && setNewTimeSlot(slot.time)}
                                                        className={`py-2 rounded-xl text-sm font-semibold transition-all border flex flex-col items-center justify-center gap-0.5
                                                          ${isAvailable && newTimeSlot !== slot.time
                                                                ? "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                                                                : isAvailable && newTimeSlot === slot.time
                                                                    ? "bg-primary text-white border-primary shadow-md scale-105 cursor-pointer"
                                                                    : isPending
                                                                        ? "bg-amber-50 text-amber-600 border-amber-200 cursor-not-allowed opacity-75"
                                                                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-40"
                                                            }`}
                                                    >
                                                        <span>{slot.time}</span>
                                                        {isPending && (
                                                            <span className="text-[9px] font-black tracking-wide text-amber-400 leading-none">
                                                                PENDING
                                                            </span>
                                                        )}
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

            {outcomeModal?.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
                        <h3 className="text-xl font-bold border-b pb-2">Mark Demo Outcome</h3>
                        <p className="text-sm text-gray-500">
                            Student: <span className="font-bold text-gray-900">{outcomeModal.booking.name}</span>
                        </p>

                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm text-amber-800 font-medium">
                            If marked as <strong>HIT</strong>, a new student account will be created automatically
                            using the demo email. Set a temporary password below.
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Temporary Password (required for HIT)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Welcome123"
                                value={outcomePassword}
                                onChange={e => setOutcomePassword(e.target.value)}
                                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setOutcomeModal(null)}
                                className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50"
                                disabled={outcomeSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleMarkOutcome("failed")}
                                className="flex-1 py-3 rounded-xl font-bold bg-slate-500 text-white hover:bg-slate-600"
                                disabled={outcomeSubmitting}
                            >
                                {outcomeSubmitting ? "..." : "Failed"}
                            </button>
                            <button
                                onClick={() => handleMarkOutcome("hit")}
                                className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                                disabled={outcomeSubmitting}
                            >
                                {outcomeSubmitting ? "..." : "🎯 Hit!"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
