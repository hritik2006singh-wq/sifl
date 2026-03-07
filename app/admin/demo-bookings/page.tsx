"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-client";
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { BookingService } from "@/services/booking.service";
import toast from "react-hot-toast";

export default function DemoBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Outcome Modal
  const [outcomeModal, setOutcomeModal] = useState<{ show: boolean; booking: any } | null>(null);
  const [outcomePassword, setOutcomePassword] = useState("");
  const [outcomeSubmitting, setOutcomeSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await BookingService.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch demo bookings:", err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "accepted": case "approved": return "bg-green-50 text-green-700 border-green-200";
      case "rejected": return "bg-red-50 text-red-700 border-red-200";
      case "hit": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "failed": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await updateDoc(doc(db, "demo_bookings", bookingId), { status });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      toast.success(`Booking ${status}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking status.");
    }
  };

  const handleDeleteBooking = async (booking: any) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    setDeletingId(booking.id);
    try {
      // Release slot if applicable
      try {
        const slotsQ = query(collection(db, "slots"), where("bookingId", "==", booking.id));
        const slotsSnap = await getDocs(slotsQ);
        for (const slotDoc of slotsSnap.docs) {
          await updateDoc(doc(db, "slots", slotDoc.id), { status: "available", bookingId: null });
        }
      } catch (e) { console.warn("Slot cleanup skipped:", e); }

      await deleteDoc(doc(db, "demo_bookings", booking.id));
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      toast.success("Booking deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkOutcome = async (outcome: "hit" | "failed") => {
    if (!outcomeModal?.booking) return;
    const booking = outcomeModal.booking;

    if (outcome === "hit" && !outcomePassword.trim()) {
      toast.error("Please enter a temporary password for the student account.");
      return;
    }

    setOutcomeSubmitting(true);
    try {
      // If hit, try to create student account
      if (outcome === "hit") {
        try {
          const res = await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: booking.email,
              password: outcomePassword,
              name: booking.studentName || booking.name || "Student",
              languageTrack: booking.language || booking.requestedLanguage,
              level: "Beginner (A1)",
              isPaid: false,
              hasFullAccess: false,
            }),
          });
          if (res.ok) {
            toast.success("Student account created!");
          } else if (res.status === 409) {
            // Email already exists — that's OK, continue marking as hit
          } else {
            const data = await res.json().catch(() => ({}));
            console.warn("Student creation issue:", data.error);
          }
        } catch (e) {
          console.warn("Student creation failed:", e);
        }
      }

      // Mark booking status
      await updateDoc(doc(db, "demo_bookings", booking.id), { status: outcome });
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: outcome } : b));
      toast.success(`Booking marked as ${outcome}.`);
      setOutcomeModal(null);
      setOutcomePassword("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark outcome.");
    } finally {
      setOutcomeSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 mt-10">Loading demo bookings...</div>;
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center text-red-500 mt-10">
        <p className="font-semibold">Unable to load bookings.</p>
        <p className="text-sm text-gray-500 mt-1">Check your connection or Firestore permissions and refresh.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">event_available</span>
          Demo Bookings
        </h2>
      </div>

      {/* ── Desktop Accordion ── */}
      <div className="hidden md:flex flex-col gap-3">
        {bookings.map((booking) => {
          const isExpanded = expandedBookingId === booking.id;
          const dateDisplay = booking.date
            ? (() => {
              const [y, m, d] = String(booking.date).split("-").map(Number);
              return new Date(y, m - 1, d).toLocaleDateString();
            })()
            : "N/A";
          const timeDisplay = booking.timeSlot || booking.time || booking.preferredTime || "";

          return (
            <div key={booking.id} className={`bg-white rounded-xl shadow-sm border transition-all ${isExpanded ? 'border-primary/30 shadow-md ring-1 ring-primary/10' : 'border-gray-200 hover:border-gray-300'}`}>
              {/* Clickable Summary Row */}
              <div
                className="flex items-center gap-6 px-6 py-4 cursor-pointer select-none"
                onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{booking.studentName || booking.name || "N/A"}</p>
                  <p className="text-sm text-gray-500 truncate">{booking.email}</p>
                  {booking.phone && <p className="text-xs text-gray-400">{booking.phone}</p>}
                </div>
                <div className="text-sm font-semibold text-gray-800 shrink-0 w-24">{booking.language || booking.requestedLanguage || "N/A"}</div>
                <div className="shrink-0 w-36">
                  <p className="text-sm font-medium text-gray-900">{dateDisplay}</p>
                  <p className="text-xs text-gray-500">{timeDisplay}</p>
                </div>
                <div className="shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest capitalize border ${getStatusBadge(booking.status)}`}>
                    {(booking.status || "pending").toUpperCase()}
                  </span>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>

              {/* Expanded Action Panel */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-xl flex flex-wrap gap-3 items-center justify-end">
                  {booking.status === "pending" && (
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, "accepted"); }} className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                      Approve
                    </button>
                  )}
                  {booking.status !== "rejected" && booking.status !== "hit" && booking.status !== "failed" && (
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, "rejected"); }} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                      Reject
                    </button>
                  )}
                  {(booking.status === "pending" || booking.status === "accepted" || booking.status === "approved") && (
                    <button onClick={(e) => { e.stopPropagation(); setOutcomeModal({ show: true, booking }); setOutcomePassword(""); }} className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors">
                      Mark Outcome
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking); }} disabled={deletingId === booking.id} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors ml-auto disabled:opacity-40">
                    {deletingId === booking.id ? "Deleting..." : "Delete Booking"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {bookings.length === 0 && (
          <div className="py-16 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
            <p className="font-medium">No demo bookings found.</p>
          </div>
        )}
      </div>

      {/* ── Mobile Cards (Accordion) ── */}
      <div className="md:hidden flex flex-col space-y-4">
        {bookings.map((booking) => {
          const isExpanded = expandedBookingId === booking.id;
          const dateDisplay = booking.date
            ? (() => {
              const [y, m, d] = String(booking.date).split("-").map(Number);
              return new Date(y, m - 1, d).toLocaleDateString();
            })()
            : "N/A";
          const timeDisplay = booking.timeSlot || booking.time || booking.preferredTime || "";

          return (
            <div key={booking.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${isExpanded ? 'border-primary/30 shadow-md' : 'border-gray-100'}`}>
              <div
                className="p-4 cursor-pointer select-none"
                onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{booking.studentName || booking.name || "N/A"}</h3>
                    <p className="text-sm text-gray-500">{booking.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest capitalize border ${getStatusBadge(booking.status)}`}>
                      {(booking.status || "pending").toUpperCase()}
                    </span>
                    <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 text-lg ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center mt-3">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date & Time</p>
                    <p className="text-sm font-bold text-gray-900">{dateDisplay} <span className="text-primary ml-1">{timeDisplay}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Language</p>
                    <p className="text-sm font-bold text-gray-900">{booking.language || booking.requestedLanguage || "N/A"}</p>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 p-4 rounded-b-2xl flex flex-wrap gap-2 items-center justify-end">
                  {booking.status === "pending" && (
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, "accepted"); }} className="flex-1 text-xs font-bold bg-green-500 text-white py-2.5 rounded-xl hover:bg-green-600 transition-colors">
                      Approve
                    </button>
                  )}
                  {booking.status !== "rejected" && booking.status !== "hit" && booking.status !== "failed" && (
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, "rejected"); }} className="flex-1 text-xs font-bold bg-red-50 text-red-700 py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                      Reject
                    </button>
                  )}
                  {(booking.status === "pending" || booking.status === "accepted" || booking.status === "approved") && (
                    <button onClick={(e) => { e.stopPropagation(); setOutcomeModal({ show: true, booking }); setOutcomePassword(""); }} className="flex-1 text-xs font-bold bg-emerald-100 text-emerald-800 py-2.5 rounded-xl hover:bg-emerald-200 transition-colors">
                      Mark Outcome
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking); }} disabled={deletingId === booking.id} className="w-full text-xs font-bold bg-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-40 mt-1">
                    {deletingId === booking.id ? "Deleting..." : "Delete Booking"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {bookings.length === 0 && (
          <div className="py-16 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
            <p className="font-medium">No demo bookings found.</p>
          </div>
        )}
      </div>

      {/* ── Outcome Modal ── */}
      {outcomeModal?.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Mark Outcome</h3>
              <button onClick={() => setOutcomeModal(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-800">⚠️ Auto-Creation Warning</p>
                <p className="text-xs text-amber-700 mt-1">
                  Marking as <strong>"Hit"</strong> will automatically create a student account for <strong>{outcomeModal.booking?.email}</strong>.
                  If an account already exists, it will be skipped.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="text"
                  placeholder="e.g. Welcome@123"
                  value={outcomePassword}
                  onChange={(e) => setOutcomePassword(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-gray-400 mt-1">Required only for "Hit". Student will use this to log in.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleMarkOutcome("hit")}
                  disabled={outcomeSubmitting}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {outcomeSubmitting ? "Processing..." : "✓ Mark as Hit"}
                </button>
                <button
                  onClick={() => handleMarkOutcome("failed")}
                  disabled={outcomeSubmitting}
                  className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 disabled:opacity-50 transition-colors"
                >
                  {outcomeSubmitting ? "Processing..." : "✗ Mark as Failed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
