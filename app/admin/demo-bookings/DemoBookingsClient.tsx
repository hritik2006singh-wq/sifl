"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-client";
import { doc, runTransaction, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  // Reschedule Modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ time: string; status: string }[]>([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [dateStatus, setDateStatus] = useState("");

  // Outcome Modal (Hit / Failed)
  const [outcomeModal, setOutcomeModal] = useState<{ show: boolean; booking: any } | null>(null);
  const [outcomePassword, setOutcomePassword] = useState("");
  const [outcomeSubmitting, setOutcomeSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = BookingService.subscribeToBookings((data) => {
      setBookings(data.map((b: any) => ({ ...b, id: b.bookingId || b.id })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // ── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = async (booking: any) => {
    try {
      await BookingService.updateBookingStatus(booking.id, "approved");
      try {
        const tId = booking.teacherId || "global";
        const slotId = `${tId}_${booking.date}_${booking.timeSlot}`;
        const slotRef = doc(db, "slots", slotId);
        const slotDoc = await getDoc(slotRef);
        if (slotDoc.exists()) {
          await updateDoc(slotRef, { status: "confirmed", confirmedAt: new Date().toISOString() });
        }
      } catch { /* best-effort */ }
      toast.success("Booking approved!");
    } catch (error) {
      toast.error("Failed to approve booking.");
    }
  };

  // ── Reject ───────────────────────────────────────────────────────────────
  const handleReject = async (booking: any) => {
    try {
      await BookingService.updateBookingStatus(booking.id, "rejected");
      try {
        const tId = booking.teacherId || "global";
        const slotId = `${tId}_${booking.date}_${booking.timeSlot}`;
        const slotRef = doc(db, "slots", slotId);
        const slotDoc = await getDoc(slotRef);
        if (slotDoc.exists()) {
          await updateDoc(slotRef, { status: "available", bookingId: null });
        }
      } catch { /* best-effort */ }
      toast.success("Booking rejected.");
    } catch (error) {
      toast.error("Failed to reject booking.");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteBooking = async (booking: any) => {
    if (!confirm(`Delete booking for ${booking.name}? This will free the time slot.`)) return;
    setDeletingId(booking.id);
    try {
      // Free slot first
      try {
        const tId = booking.teacherId || "global";
        const slotId = `${tId}_${booking.date}_${booking.timeSlot}`;
        const slotRef = doc(db, "slots", slotId);
        const slotDoc = await getDoc(slotRef);
        if (slotDoc.exists()) {
          await updateDoc(slotRef, { status: "available", bookingId: null });
        }
      } catch { /* best-effort */ }

      await deleteDoc(doc(db, "demoBookings", booking.id));
      toast.success("Booking deleted and slot freed.");
    } catch {
      toast.error("Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Mark Outcome (Hit / Failed) ──────────────────────────────────────────
  const handleMarkOutcome = async (outcome: "hit" | "failed") => {
    if (!outcomeModal) return;
    const booking = outcomeModal.booking;

    if (outcome === "hit" && !outcomePassword) {
      toast.error("Please enter a temporary password to create the student account.");
      return;
    }

    setOutcomeSubmitting(true);
    try {
      await BookingService.updateBookingStatus(booking.id, outcome as any);

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

      setOutcomeModal(null);
      setOutcomePassword("");
    } catch (err: any) {
      toast.error(err.message || "Operation failed.");
    } finally {
      setOutcomeSubmitting(false);
    }
  };

  // ── Reschedule ───────────────────────────────────────────────────────────
  const openRescheduleModal = (booking: any) => {
    setSelectedBooking(booking);
    setNewDate("");
    setNewTimeSlot("");
    setAvailableSlots([]);
    setDateStatus("");
    setShowRescheduleModal(true);
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!newDate || !selectedBooking) return;
      setDateStatus("Loading slots...");
      try {
        const tId = selectedBooking.teacherId || "global";
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
        const [year, month, day] = newDate.split("-").map(Number);
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
        const parseTime = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
        const startMins = parseTime(dayConfig.start);
        const endMins = parseTime(dayConfig.end);

        for (let m = startMins; m < endMins; m += 30) {
          const hh = Math.floor(m / 60).toString().padStart(2, "0");
          const mm = (m % 60).toString().padStart(2, "0");
          generatedSlots.push({ time: `${hh}:${mm}`, status: "available" });
        }

        const slotsQuery = query(collection(db, "slots"), where("teacherId", "==", tId), where("date", "==", newDate));
        const slotsSnap = await getDocs(slotsQuery);
        const existingSlotsMap: { [time: string]: string } = {};
        slotsSnap.forEach((d) => { existingSlotsMap[d.data().time] = d.data().status; });

        const mergedSlots = generatedSlots.map((s) => {
          if (existingSlotsMap[s.time] && existingSlotsMap[s.time] !== "available") {
            return { ...s, status: existingSlotsMap[s.time] };
          }
          return s;
        });

        setAvailableSlots(mergedSlots);
        setDateStatus(mergedSlots.length > 0 ? "" : "No slots remaining for this date.");
      } catch (err) {
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
        const tId = selectedBooking.teacherId || "global";
        const oldSlotId = `${tId}_${selectedBooking.date}_${selectedBooking.timeSlot}`;
        const newSlotId = `${tId}_${newDate}_${newTimeSlot}`;
        const oldSlotRef = doc(db, "slots", oldSlotId);
        const newSlotRef = doc(db, "slots", newSlotId);

        const newSlotDoc = await transaction.get(newSlotRef);
        const oldSlotDoc = await transaction.get(oldSlotRef);
        const bookingDoc = await transaction.get(bookingRef);

        if (!bookingDoc.exists()) throw new Error("Booking document missing");
        if (newSlotDoc.exists() && newSlotDoc.data().status !== "available") {
          throw new Error("New slot is already taken.");
        }
        if (oldSlotDoc.exists()) {
          transaction.update(oldSlotRef, { status: "available", bookingId: null });
        }
        transaction.set(newSlotRef, { date: newDate, time: newTimeSlot, teacherId: tId, status: "pending", bookingId: selectedBooking.id }, { merge: true });
        transaction.update(bookingRef, { date: newDate, timeSlot: newTimeSlot, status: "pending", updatedAt: new Date().toISOString() });
      });

      toast.success("Successfully rescheduled.");
      setShowRescheduleModal(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to reschedule.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  // ── Status Badge Helper ──────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      hit: "bg-emerald-100 text-emerald-800 border-emerald-200",
      failed: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return map[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  if (authLoading || loading) {
    return <div className="p-6 text-gray-500">Loading demo bookings...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Demo Bookings</h1>

      {/* ── Desktop List (Accordion) ── */}
      <div className="hidden md:flex flex-col gap-3">
        {bookings.map((booking) => {
          const isExpanded = expandedBookingId === booking.id;
          return (
            <div key={booking.id} className={`bg-white rounded-xl shadow-sm border transition-all ${isExpanded ? 'border-primary/30 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
              {/* Clickable Summary Row */}
              <div
                className="flex items-center gap-6 px-6 py-4 cursor-pointer select-none"
                onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{booking.name}</p>
                  <p className="text-sm text-gray-500 truncate">{booking.email}</p>
                  <p className="text-xs text-gray-400">{booking.phone}</p>
                </div>
                <div className="text-sm font-medium text-gray-700 shrink-0 w-24">{booking.language}</div>
                <div className="shrink-0 w-32">
                  <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                  <p className="text-xs text-gray-500">{booking.timeSlot}</p>
                </div>
                <div className="shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>

              {/* Expanded Action Panel */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-xl flex flex-wrap gap-3 items-center justify-end animate-in slide-in-from-top-2">
                  {booking.status === "pending" && (
                    <button onClick={(e) => { e.stopPropagation(); handleApprove(booking); }} className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                      Approve
                    </button>
                  )}
                  {booking.status !== "rejected" && booking.status !== "approved" && booking.status !== "accepted" && booking.status !== "hit" && booking.status !== "failed" && (
                    <button onClick={(e) => { e.stopPropagation(); handleReject(booking); }} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                      Reject
                    </button>
                  )}
                  {(booking.status === "pending" || booking.status === "approved") && (
                    <button onClick={(e) => { e.stopPropagation(); setOutcomeModal({ show: true, booking }); setOutcomePassword(""); }} className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors">
                      Mark Outcome
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); openRescheduleModal(booking); }} className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                    Reschedule
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking); }} disabled={deletingId === booking.id} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors ml-auto disabled:opacity-40">
                    {deletingId === booking.id ? "Deleting..." : "Delete Booking"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {bookings.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            No bookings available.
          </div>
        )}
      </div>

      {/* ── Mobile Cards (Accordion) ── */}
      <div className="md:hidden flex flex-col space-y-4 mt-4 mb-8">
        {bookings.map((booking) => {
          const isExpanded = expandedBookingId === booking.id;
          return (
            <div key={booking.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${isExpanded ? 'border-primary/30 shadow-md' : 'border-gray-100'}`}>
              {/* Clickable Card Header */}
              <div
                className="p-4 cursor-pointer select-none"
                onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{booking.name}</h3>
                    <p className="text-sm text-gray-500">{booking.email}</p>
                    <p className="text-xs text-gray-400">{booking.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize border ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 text-lg ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center mt-3">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date &amp; Time</p>
                    <p className="text-sm font-bold text-gray-900">{booking.date} <span className="text-primary ml-1">{booking.timeSlot}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Language</p>
                    <p className="text-sm font-bold text-gray-900">{booking.language}</p>
                  </div>
                </div>
              </div>

              {/* Expanded Action Panel */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 p-4 rounded-b-2xl flex flex-wrap gap-2 items-center justify-end animate-in slide-in-from-top-2">
                  {booking.status === "pending" && (
                    <button onClick={(e) => { e.stopPropagation(); handleApprove(booking); }} className="flex-1 text-xs font-bold bg-green-500 text-white py-2.5 rounded-xl hover:bg-green-600 transition-colors">
                      Approve
                    </button>
                  )}
                  {booking.status !== "rejected" && booking.status !== "approved" && booking.status !== "accepted" && booking.status !== "hit" && booking.status !== "failed" && (
                    <button onClick={(e) => { e.stopPropagation(); handleReject(booking); }} className="flex-1 text-xs font-bold bg-red-50 text-red-700 py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                      Reject
                    </button>
                  )}
                  {(booking.status === "pending" || booking.status === "approved") && (
                    <button onClick={(e) => { e.stopPropagation(); setOutcomeModal({ show: true, booking }); setOutcomePassword(""); }} className="flex-1 text-xs font-bold bg-emerald-100 text-emerald-800 py-2.5 rounded-xl hover:bg-emerald-200 transition-colors">
                      Mark Outcome
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); openRescheduleModal(booking); }} className="flex-1 text-xs font-bold bg-blue-50 text-blue-700 py-2.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                    Reschedule
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking); }} disabled={deletingId === booking.id} className="w-full text-xs font-bold bg-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-40 mt-1">
                    {deletingId === booking.id ? "Deleting..." : "Delete Booking"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {bookings.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
            No bookings available.
          </div>
        )}
      </div>

      {/* ── Reschedule Modal ── */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <h3 className="text-xl font-bold border-b pb-2">Reschedule Booking</h3>
            <p className="text-sm text-gray-500">Rescheduling for: <span className="font-bold">{selectedBooking.name}</span></p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
              <input type="date" min={new Date().toISOString().split("T")[0]} value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            {newDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select New Time Slot</label>
                {dateStatus ? (
                  <div className="p-3 bg-gray-50 border border-dashed rounded-xl text-center text-sm font-medium text-gray-600">{dateStatus}</div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => {
                      const isAvailable = slot.status === "available";
                      const isPending = slot.status === "pending";
                      const isSelected = newTimeSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          disabled={!isAvailable}
                          onClick={() => isAvailable && setNewTimeSlot(slot.time)}
                          className={`py-2 text-xs font-bold rounded-lg border flex flex-col items-center gap-0.5
                            ${isSelected ? "bg-primary text-white border-primary" :
                              isAvailable ? "bg-white text-gray-700 hover:border-primary/50" :
                                isPending ? "bg-amber-50 text-amber-500 border-amber-200 opacity-70 cursor-not-allowed" :
                                  "bg-gray-100 text-gray-400 opacity-40 cursor-not-allowed"}`}
                        >
                          <span>{slot.time}</span>
                          {isPending && <span className="text-[8px] font-black text-amber-400">PENDING</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowRescheduleModal(false)} className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">
                Cancel
              </button>
              <button disabled={!newTimeSlot || rescheduleLoading} onClick={handleConfirmReschedule} className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
                {rescheduleLoading ? "Saving..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Outcome Modal (Hit / Failed) ── */}
      {outcomeModal?.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <h3 className="text-xl font-bold border-b pb-2">Mark Demo Outcome</h3>
            <p className="text-sm text-gray-500">
              Student: <span className="font-bold text-gray-900">{outcomeModal.booking.name}</span>
              <br />
              <span className="text-xs text-gray-400">{outcomeModal.booking.email}</span>
            </p>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm text-amber-800 font-medium">
              If marked as <strong>HIT 🎯</strong>, a student account is automatically created using the demo email.
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Temporary Password <span className="text-red-400 text-xs">(required for HIT)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Welcome@123"
                value={outcomePassword}
                onChange={(e) => setOutcomePassword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setOutcomeModal(null)} className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50" disabled={outcomeSubmitting}>
                Cancel
              </button>
              <button onClick={() => handleMarkOutcome("failed")} className="flex-1 py-3 rounded-xl font-bold bg-slate-500 text-white hover:bg-slate-600 disabled:opacity-50" disabled={outcomeSubmitting}>
                {outcomeSubmitting ? "..." : "Failed"}
              </button>
              <button onClick={() => handleMarkOutcome("hit")} className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50" disabled={outcomeSubmitting}>
                {outcomeSubmitting ? "..." : "🎯 Hit!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
