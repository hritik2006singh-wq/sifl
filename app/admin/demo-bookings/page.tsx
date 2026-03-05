"use client";

import { useState, useEffect } from "react";
import { BookingService } from "@/services/booking.service";
import Link from "next/link";

export default function DemoBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
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
    fetchBookings();
  }, []);

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

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
              <th className="py-4 px-4">Student Name</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Requested Language</th>
              <th className="py-4 px-4">Preferred Time</th>
              <th className="py-4 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                <td className="py-4 px-4 font-bold text-gray-900">{booking.studentName || booking.name || "N/A"}</td>
                <td className="py-4 px-4 text-gray-600">{booking.email}</td>
                <td className="py-4 px-4 font-semibold text-gray-800">{booking.language || booking.requestedLanguage || "N/A"}</td>
                  <td className="py-4 px-4 text-sm">
                    {booking.date
                      ? (() => {
                          // Parse YYYY-MM-DD as local date to avoid UTC day shift
                          const [y, m, d] = String(booking.date).split("-").map(Number);
                          return new Date(y, m - 1, d).toLocaleDateString();
                        })()
                      : "N/A"}{" "}
                    {booking.timeSlot || booking.time || booking.preferredTime || ""}
                  </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full border ${booking.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                    booking.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                    {(booking.status || "pending").toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400 border-2 border-dashed rounded-xl m-4 bg-gray-50">
                  <p className="font-medium">No demo bookings found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
