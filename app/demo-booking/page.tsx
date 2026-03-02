"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, runTransaction, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

type WeeklyTemplate = {
    [day: string]: { enabled: boolean; start: string; end: string };
};

export default function SchedulePage() {
    const [formData, setFormData] = useState({
        student_name: "",
        email: "",
        phone_number: "",
        language: "English",
        date: "",
        time_slot: "",
    });

    const [loading, setLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<{ time: string; status: string }[]>([]);
    const [dateStatus, setDateStatus] = useState<string>("");

    // Fixed teacherId for this form, acting as the generic demo handler
    const TEACHER_ID = "admin_general";

    const validatePhone = (phone: string) => {
        return /^[0-9]{10}$/.test(phone);
    };

    const validateEmail = (email: string) => {
        return email.includes("@") && email.includes(".");
    };

    useEffect(() => {
        const fetchSlots = async () => {
            if (!formData.date) return;

            setDateStatus("Loading slots...");
            try {
                // 1. Fetch Availability Document
                const availRef = doc(db, "availability", TEACHER_ID);
                const availSnap = await getDoc(availRef);

                if (!availSnap.exists()) {
                    setAvailableSlots([]);
                    setDateStatus("Schedule not configured.");
                    return;
                }

                const availData = availSnap.data();
                const blockedDates = availData.blockedDates || {};

                if (blockedDates[formData.date]) {
                    setAvailableSlots([]);
                    setDateStatus("No sessions available on this date.");
                    return;
                }

                const weeklyTemplate: WeeklyTemplate = availData.weeklyTemplate || {};
                const checkDate = new Date(formData.date);
                const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const dayName = days[checkDate.getDay()];

                const dayConfig = weeklyTemplate[dayName];
                if (!dayConfig || !dayConfig.enabled) {
                    setAvailableSlots([]);
                    setDateStatus("No sessions available on this date.");
                    return;
                }

                // 2. Generate 30-min intervals between start and end
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

                // 3. Fetch Existing Slots to see what's booked/pending
                const slotsQuery = query(
                    collection(db, "slots"),
                    where("teacherId", "==", TEACHER_ID),
                    where("date", "==", formData.date)
                );

                const slotsSnap = await getDocs(slotsQuery);
                const existingSlotsMap: { [time: string]: string } = {};
                slotsSnap.forEach(doc => {
                    existingSlotsMap[doc.data().time] = doc.data().status;
                });

                // Merge exactly
                const mergedSlots = generatedSlots.map(s => {
                    if (existingSlotsMap[s.time] && existingSlotsMap[s.time] !== "available") {
                        return { ...s, status: existingSlotsMap[s.time] };
                    }
                    return s;
                });

                setAvailableSlots(mergedSlots);
                setDateStatus(mergedSlots.length > 0 ? "" : "No slots remaining for this date.");

            } catch (error) {
                console.error("Error fetching slots:", error);
                setAvailableSlots([]);
                setDateStatus("Error fetching slots.");
            }
        };

        fetchSlots();
        setFormData(prev => ({ ...prev, time_slot: "" })); // Reset time slot on date change
    }, [formData.date]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.student_name || !formData.email || !formData.phone_number || !formData.date || !formData.time_slot) {
            return toast.error("Please fill all required fields.");
        }

        if (!validatePhone(formData.phone_number)) {
            return toast.error("Phone number must be exactly 10 digits.");
        }

        if (!validateEmail(formData.email)) {
            return toast.error("Please enter a valid email address.");
        }

        setLoading(true);
        try {
            // Transactional booking
            await runTransaction(db, async (transaction) => {
                // Ensure atomic operation
                const slotId = `${TEACHER_ID}_${formData.date}_${formData.time_slot}`;
                const slotRef = doc(db, "slots", slotId);
                const slotDoc = await transaction.get(slotRef);

                if (slotDoc.exists() && slotDoc.data().status !== "available") {
                    throw new Error("Slot is no longer available.");
                }

                // Create the booking entry
                const newBookingRef = doc(collection(db, "demoBookings"));
                transaction.set(newBookingRef, {
                    name: formData.student_name,
                    email: formData.email,
                    phone: formData.phone_number,
                    language: formData.language,
                    date: formData.date,
                    timeSlot: formData.time_slot,
                    teacherId: TEACHER_ID, // Link directly
                    status: "pending",
                    createdAt: new Date().toISOString()
                });

                // Set/Update the slot explicitly locking it 
                transaction.set(slotRef, {
                    date: formData.date,
                    time: formData.time_slot,
                    teacherId: TEACHER_ID,
                    status: "pending", // Reserves the slot immediately
                    bookingId: newBookingRef.id
                }, { merge: true });
            });

            toast.success("Success! Your demo booking is confirmed.");
            setFormData({ student_name: "", email: "", phone_number: "", language: "English", date: "", time_slot: "" });

            // Re-mount / trigger update hack visually by resetting available state for the chosen date
            setAvailableSlots(prev => prev.map(s => s.time === formData.time_slot ? { ...s, status: "pending" } : s));

        } catch (error: any) {
            console.error("Booking submission error:", error);
            if (error.message.includes("Slot is no longer available")) {
                toast.error("Sorry, that slot was just booked by someone else.");
            } else {
                toast.error("An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-32 flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-2">
                    Book a Free Demo
                </h2>
                <p className="text-center text-gray-500 mb-8">Schedule a 1-on-1 language assessment.</p>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input required type="text" value={formData.student_name} onChange={e => setFormData({ ...formData, student_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (10 digits)</label>
                            <input
                                required
                                type="text"
                                minLength={10}
                                maxLength={10}
                                value={formData.phone_number}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({ ...formData, phone_number: val });
                                }}
                                placeholder="e.g. 9876543210"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                            <select required value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                                <option>English</option>
                                <option>German</option>
                                <option>Korean</option>
                                <option>Spanish</option>
                                <option>Japanese</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                            <input required type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                        </div>
                    </div>

                    {formData.date && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>

                            {dateStatus ? (
                                <div className="p-4 bg-gray-50 border border-dashed rounded-xl text-center text-sm font-medium text-gray-600">
                                    {dateStatus}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {availableSlots.map((slot) => {
                                        const isBooked = slot.status !== "available";
                                        const isSelected = formData.time_slot === slot.time;

                                        return (
                                            <button
                                                key={slot.time}
                                                type="button"
                                                disabled={isBooked}
                                                onClick={() => setFormData({ ...formData, time_slot: slot.time })}
                                                className={`py-2 rounded-xl text-sm font-semibold transition-all border ${isBooked
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                                        : isSelected
                                                            ? "bg-primary text-white border-primary shadow-md transform scale-105"
                                                            : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                                                    }`}
                                            >
                                                {slot.time}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full py-4 mt-8 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? "Confirming Booking..." : "Confirm Booking"}
                    </button>
                </form>
            </div>
        </div>
    );
}
