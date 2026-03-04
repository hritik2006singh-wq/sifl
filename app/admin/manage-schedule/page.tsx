"use client";

import { useAdminGuard } from "@/hooks/useRoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-client";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";

type WeeklyTemplate = {
    [day: string]: { enabled: boolean; start: string; end: string };
};

export default function ManageSchedulePage() {
    const { user, loading: authLoading } = useAdminGuard();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

    // Default Template
    const defaultTemplate: WeeklyTemplate = {
        monday: { enabled: true, start: "10:00", end: "16:00" },
        tuesday: { enabled: true, start: "10:00", end: "16:00" },
        wednesday: { enabled: true, start: "10:00", end: "16:00" },
        thursday: { enabled: true, start: "10:00", end: "16:00" },
        friday: { enabled: true, start: "10:00", end: "16:00" },
        saturday: { enabled: false, start: "10:00", end: "16:00" },
        sunday: { enabled: false, start: "10:00", end: "16:00" }
    };

    const [weeklyTemplate, setWeeklyTemplate] = useState<WeeklyTemplate>(defaultTemplate);
    const [blockedDates, setBlockedDates] = useState<{ [date: string]: boolean }>({});
    const [newBlockedDate, setNewBlockedDate] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const q = query(collection(db, "users"), where("role", "==", "teacher"));
                const snap = await getDocs(q);
                const teacherList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Add an "Admin" or default general slot target
                setTeachers([{ id: "admin_general", name: "Global Admin Schedule" }, ...teacherList]);
                setSelectedTeacherId("admin_general");
            } catch (err) {
                console.error(err);
            }
        };

        if (user) {
            fetchTeachers();
        }
    }, [user]);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!selectedTeacherId) return;
            try {
                const docRef = doc(db, "availability", selectedTeacherId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setWeeklyTemplate(data.weeklyTemplate || defaultTemplate);
                    setBlockedDates(data.blockedDates || {});
                } else {
                    setWeeklyTemplate(defaultTemplate);
                    setBlockedDates({});
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchAvailability();
    }, [selectedTeacherId]);

    const handleSave = async () => {
        if (!selectedTeacherId) return;
        setSaving(true);
        try {
            const payload = {
                weeklyTemplate,
                blockedDates,
                updatedAt: new Date().toISOString()
            };
            await setDoc(doc(db, "availability", selectedTeacherId), payload, { merge: true });
            toast.success("Availability updated successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update availability");
        } finally {
            setSaving(false);
        }
    };

    const handleAddBlockedDate = () => {
        if (!newBlockedDate) return;
        setBlockedDates(prev => ({ ...prev, [newBlockedDate]: true }));
        setNewBlockedDate("");
    };

    const handleRemoveBlockedDate = (date: string) => {
        setBlockedDates(prev => {
            const copy = { ...prev };
            delete copy[date];
            return copy;
        });
    };

    if (authLoading) return <div className="p-8">Loading...</div>;

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Manage Schedule</h1>
                <p className="text-gray-500 mt-1">Configure weekly templates and block vacation dates.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Instructor Profile</label>
                <select
                    value={selectedTeacherId}
                    onChange={e => setSelectedTeacherId(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50 font-medium"
                >
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name || t.email}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">calendar_view_week</span>
                        Weekly Template
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    {days.map(day => (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="w-32 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={weeklyTemplate[day]?.enabled || false}
                                    onChange={(e) => setWeeklyTemplate(prev => ({
                                        ...prev,
                                        [day]: { ...prev[day], enabled: e.target.checked }
                                    }))}
                                    className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
                                />
                                <span className="font-semibold text-gray-700 capitalize">{day}</span>
                            </div>

                            {weeklyTemplate[day]?.enabled ? (
                                <div className="flex items-center gap-3 flex-1">
                                    <input
                                        type="time"
                                        value={weeklyTemplate[day].start}
                                        onChange={(e) => setWeeklyTemplate(prev => ({
                                            ...prev, [day]: { ...prev[day], start: e.target.value }
                                        }))}
                                        className="px-3 py-1.5 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <span className="text-gray-400 font-medium">to</span>
                                    <input
                                        type="time"
                                        value={weeklyTemplate[day].end}
                                        onChange={(e) => setWeeklyTemplate(prev => ({
                                            ...prev, [day]: { ...prev[day], end: e.target.value }
                                        }))}
                                        className="px-3 py-1.5 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 text-gray-400 text-sm italic py-1.5">Unavailable</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500">event_busy</span>
                        Blocked Dates
                    </h2>
                </div>
                <div className="p-6">
                    <div className="flex gap-3 mb-6">
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={newBlockedDate}
                            onChange={e => setNewBlockedDate(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <button
                            onClick={handleAddBlockedDate}
                            disabled={!newBlockedDate}
                            className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-gray-800 transition"
                        >
                            Block Date
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {Object.keys(blockedDates).length > 0 ? Object.keys(blockedDates).map(date => (
                            <div key={date} className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 text-sm font-bold">
                                {date}
                                <button onClick={() => handleRemoveBlockedDate(date)} className="text-red-400 hover:text-red-700 flex items-center p-0.5 rounded-md hover:bg-red-100 transition">
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>
                        )) : (
                            <div className="w-full py-4 text-center text-gray-400 italic">No dates currently blocked.</div>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition disabled:opacity-70 text-lg flex items-center justify-center gap-2"
            >
                {saving ? "Saving Configuration..." : (
                    <><span className="material-symbols-outlined">save</span> Save Availability Settings</>
                )}
            </button>
        </div>
    );
}
