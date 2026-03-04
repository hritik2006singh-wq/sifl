"use client";

import { useTeacherGuard } from "@/hooks/useRoleGuard";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-admin";
import toast from "react-hot-toast";

type DayConfig = { enabled: boolean; start: string; end: string };
type WeeklyTemplate = { [day: string]: DayConfig };

export default function TeacherAvailabilityPage() {
    const { user, loading } = useTeacherGuard();
    const [template, setTemplate] = useState<WeeklyTemplate>({
        monday: { enabled: false, start: "09:00", end: "17:00" },
        tuesday: { enabled: false, start: "09:00", end: "17:00" },
        wednesday: { enabled: false, start: "09:00", end: "17:00" },
        thursday: { enabled: false, start: "09:00", end: "17:00" },
        friday: { enabled: false, start: "09:00", end: "17:00" },
        saturday: { enabled: false, start: "10:00", end: "14:00" },
        sunday: { enabled: false, start: "10:00", end: "14:00" },
    });

    // Convert object to flat array for rendering
    const daysArr = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    const [blockedDates, setBlockedDates] = useState<{ [date: string]: boolean }>({});
    const [newBlockedDate, setNewBlockedDate] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [outOfTown, setOutOfTown] = useState(false); // Quick toggle

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!user) return;
            try {
                const availRef = doc(db, "availability", user.uid);
                const availSnap = await getDoc(availRef);
                if (availSnap.exists()) {
                    const data = availSnap.data();
                    if (data.weeklyTemplate) setTemplate(data.weeklyTemplate);
                    if (data.blockedDates) setBlockedDates(data.blockedDates);
                    if (data.outOfTown !== undefined) setOutOfTown(data.outOfTown);
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
                toast.error("Failed to load availability.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchAvailability();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const availRef = doc(db, "availability", user.uid);
            await setDoc(availRef, {
                weeklyTemplate: template,
                blockedDates,
                outOfTown,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            toast.success("Schedule successfully saved!");
        } catch (error) {
            console.error("Failed to save schedule:", error);
            toast.error("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddBlockDate = () => {
        if (!newBlockedDate) return;
        setBlockedDates(prev => ({ ...prev, [newBlockedDate]: true }));
        setNewBlockedDate("");
    };

    const handleRemoveBlockDate = (date: string) => {
        const updated = { ...blockedDates };
        delete updated[date];
        setBlockedDates(updated);
    };

    if (loading || isFetching) return <div className="p-8">Loading availability...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 md:pb-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Availability</h1>
                    <p className="text-gray-500 mt-2">Manage your weekly working hours and blocked dates.</p>
                </div>
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-0 flex justify-end z-40 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
                    <button
                        disabled={isSaving}
                        onClick={handleSave}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 md:py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md active:scale-95 md:hover:bg-emerald-700 transition-all disabled:opacity-50 text-base md:text-sm"
                    >
                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">save</span>
                        {isSaving ? "Saving..." : "Save Schedule"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24 md:pb-0">
                {/* Weekly Template Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Weekly Template</h2>
                                <p className="text-sm text-gray-500 mt-1">Set your standard active hours for each day.</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 text-4xl">calendar_view_week</span>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {daysArr.map((day) => {
                                const dayConfig = template[day];
                                return (
                                    <div key={day} className="p-4 md:px-8 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4 min-w-[200px]">
                                            <label className="relative inline-flex items-center cursor-pointer p-3 -m-3">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={dayConfig.enabled}
                                                    onChange={e => setTemplate(prev => ({
                                                        ...prev,
                                                        [day]: { ...prev[day], enabled: e.target.checked }
                                                    }))}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[14px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                            <span className={`text-base font-bold capitalize ${dayConfig.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {day}
                                            </span>
                                        </div>

                                        {dayConfig.enabled ? (
                                            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0">
                                                <input
                                                    type="time"
                                                    value={dayConfig.start}
                                                    onChange={e => setTemplate(prev => ({
                                                        ...prev,
                                                        [day]: { ...prev[day], start: e.target.value }
                                                    }))}
                                                    className="px-3 h-12 md:h-auto md:py-2 border border-gray-200 rounded-xl md:rounded-lg text-base md:text-sm font-semibold text-gray-700 w-full md:w-32 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                                />
                                                <span className="text-gray-400 font-bold px-1 md:px-2">to</span>
                                                <input
                                                    type="time"
                                                    value={dayConfig.end}
                                                    onChange={e => setTemplate(prev => ({
                                                        ...prev,
                                                        [day]: { ...prev[day], end: e.target.value }
                                                    }))}
                                                    className="px-3 h-12 md:h-auto md:py-2 border border-gray-200 rounded-xl md:rounded-lg text-base md:text-sm font-semibold text-gray-700 w-full md:w-32 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-1 text-right text-sm font-bold text-gray-400 italic">
                                                Unavailable
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Out of town & Blocks */}
                <div className="space-y-6">
                    {/* Out of Town Quick Toggle */}
                    <div className={`p-6 md:p-8 rounded-3xl shadow-sm border transition-all ${outOfTown ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className={`text-xl font-bold ${outOfTown ? 'text-amber-900' : 'text-gray-900'}`}>Out of Town Mode</h2>
                                <p className={`text-sm mt-1 ${outOfTown ? 'text-amber-700/80' : 'text-gray-500'}`}>Temporarily suspends ALL new bookings without altering your template.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={outOfTown}
                                    onChange={(e) => setOutOfTown(e.target.checked)}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                            </label>
                        </div>
                    </div>

                    {/* Blocked Dates */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Blocked Dates</h2>
                            <span className="material-symbols-outlined text-red-400">event_busy</span>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={newBlockedDate}
                                onChange={e => setNewBlockedDate(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            />
                            <button
                                onClick={handleAddBlockDate}
                                disabled={!newBlockedDate}
                                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-800 transition-colors"
                            >
                                Block
                            </button>
                        </div>

                        {Object.keys(blockedDates).length > 0 ? (
                            <div className="space-y-2">
                                {Object.keys(blockedDates).sort().map(date => (
                                    <div key={date} className="flex items-center justify-between p-3 border border-red-100 bg-red-50 rounded-xl">
                                        <span className="text-sm font-bold text-red-900 tracking-wide">
                                            {new Date(date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveBlockDate(date)}
                                            className="size-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 border border-dashed border-gray-200 rounded-xl text-center">
                                <p className="text-sm text-gray-400 font-medium">No dates currently blocked.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
