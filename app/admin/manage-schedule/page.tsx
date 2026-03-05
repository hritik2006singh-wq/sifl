"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-client";
import { doc, getDoc, setDoc, where } from "firebase/firestore";
import { useAdminGuard } from "@/hooks/useRoleGuard";
import { safeCollectionFetch } from "@/lib/firestore-safe";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────────────

type DayKey =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

interface DaySchedule {
    enabled: boolean;
    start: string;
    end: string;
}

type WeekSchedule = Record<DayKey, DaySchedule>;

interface InstructorOption {
    id: string;
    name: string;
    email: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const DAYS: { key: DayKey; label: string }[] = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
];

const DEFAULT_SCHEDULE: WeekSchedule = {
    monday: { enabled: true, start: "10:00", end: "16:00" },
    tuesday: { enabled: true, start: "10:00", end: "16:00" },
    wednesday: { enabled: true, start: "10:00", end: "16:00" },
    thursday: { enabled: true, start: "10:00", end: "16:00" },
    friday: { enabled: true, start: "10:00", end: "16:00" },
    saturday: { enabled: false, start: "10:00", end: "14:00" },
    sunday: { enabled: false, start: "10:00", end: "14:00" },
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function ManageSchedulePage() {
    const { user, loading: authLoading } = useAdminGuard();

    const [instructors, setInstructors] = useState<InstructorOption[]>([]);
    const [selectedId, setSelectedId] = useState<string>("global");

    const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [saving, setSaving] = useState(false);

    // ── Load instructor list once auth resolves ──────────────────────────
    useEffect(() => {
        if (!user) return;

        const loadInstructors = async () => {
            const staff = await safeCollectionFetch(
                "users",
                where("role", "in", ["teacher", "admin"])
            );
            const list: InstructorOption[] = staff.map((s: any) => ({
                id: s.id,
                name: s.name || s.email || s.id,
                email: s.email || "",
            }));
            setInstructors(list);
        };

        loadInstructors();
    }, [user]);

    // ── Load schedule whenever selection changes ──────────────────────────
    useEffect(() => {
        if (!user) return;

        const loadSchedule = async () => {
            setLoadingSchedule(true);
            try {
                const docId = selectedId === "global" ? "global" : selectedId;
                const ref = doc(db, "availability", docId);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    // Merge fetched weeklyTemplate over defaults so missing days keep defaults
                    const stored = (snap.data()?.weeklyTemplate ?? snap.data()) as WeekSchedule;
                    setSchedule({ ...DEFAULT_SCHEDULE, ...stored });
                } else {
                    setSchedule(DEFAULT_SCHEDULE);
                }
            } catch (err) {
                console.error("[ManageSchedule] Failed to load schedule:", err);
                setSchedule(DEFAULT_SCHEDULE);
            } finally {
                setLoadingSchedule(false);
            }
        };

        loadSchedule();
    }, [user, selectedId]);

    // ── Day field helpers ─────────────────────────────────────────────────
    const setDayField = (
        day: DayKey,
        field: keyof DaySchedule,
        value: string | boolean
    ) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    };

    // ── Save ─────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!user) return toast.error("Not authenticated");
        setSaving(true);
        try {
            const docId = selectedId === "global" ? "global" : selectedId;
            const ref = doc(db, "availability", docId);
            await setDoc(ref, { weeklyTemplate: schedule }, { merge: true });
            toast.success("Schedule saved successfully!");
        } catch (err: any) {
            console.error("[ManageSchedule] Save failed:", err);
            toast.error("Failed to save: " + (err.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    // ── Guard loading states ──────────────────────────────────────────────
    if (authLoading) {
        return (
            <div className="p-8 text-center text-gray-500 mt-10">
                Verifying access...
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-700 text-[24px]">
                        calendar_month
                    </span>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Weekly Schedule Template</h1>
                    <p className="text-sm text-gray-500">
                        Set recurring availability for each day of the week.
                    </p>
                </div>
            </div>

            {/* ── Card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* ── Instructor Selector ── */}
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/60">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Schedule For
                    </label>
                    <select
                        id="instructor-select"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full md:w-80 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition cursor-pointer"
                    >
                        <option value="global">🌐 Global Admin Schedule</option>
                        {instructors.map((inst) => (
                            <option key={inst.id} value={inst.id}>
                                {inst.name} — {inst.email}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                        "Global Admin Schedule" applies to all unassigned slots by default.
                    </p>
                </div>

                {/* ── Days Grid ── */}
                <div className="px-6 py-5 space-y-3">

                    {/* Header row */}
                    <div className="hidden md:grid grid-cols-[140px_auto_1fr_auto_1fr] gap-4 pb-2 border-b border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Day</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Start</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">to</span>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">End</span>
                    </div>

                    {loadingSchedule ? (
                        <div className="py-10 text-center text-gray-400 text-sm">
                            Loading schedule...
                        </div>
                    ) : (
                        DAYS.map(({ key, label }) => {
                            const day = schedule[key];
                            const isWeekend = key === "saturday" || key === "sunday";

                            return (
                                <div
                                    key={key}
                                    className={`
                                        flex flex-col md:grid md:grid-cols-[140px_auto_1fr_auto_1fr]
                                        gap-3 md:gap-4 items-start md:items-center
                                        p-4 rounded-xl border transition-colors
                                        ${day.enabled
                                            ? "bg-emerald-50/40 border-emerald-100"
                                            : "bg-gray-50/60 border-gray-100 opacity-60"
                                        }
                                    `}
                                >
                                    {/* Day label */}
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${day.enabled ? "text-gray-900" : "text-gray-400"}`}>
                                            {label}
                                        </span>
                                        {isWeekend && (
                                            <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                Weekend
                                            </span>
                                        )}
                                    </div>

                                    {/* Toggle */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            id={`toggle-${key}`}
                                            type="button"
                                            role="switch"
                                            aria-checked={day.enabled}
                                            onClick={() => setDayField(key, "enabled", !day.enabled)}
                                            className={`
                                                relative inline-flex w-10 h-5 rounded-full transition-colors
                                                focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                                                ${day.enabled ? "bg-emerald-500" : "bg-gray-300"}
                                            `}
                                        >
                                            <span
                                                className={`
                                                    absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                                                    transition-transform duration-200
                                                    ${day.enabled ? "translate-x-5" : "translate-x-0"}
                                                `}
                                            />
                                        </button>
                                        <span className={`text-xs font-bold md:hidden ${day.enabled ? "text-emerald-700" : "text-gray-400"}`}>
                                            {day.enabled ? "Active" : "Off"}
                                        </span>
                                    </div>

                                    {/* Start time */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 md:hidden">
                                            Start
                                        </label>
                                        <input
                                            id={`start-${key}`}
                                            type="time"
                                            value={day.start}
                                            disabled={!day.enabled}
                                            onChange={(e) => setDayField(key, "start", e.target.value)}
                                            className={`
                                                w-full px-3 py-2 rounded-lg border text-sm font-semibold outline-none transition
                                                focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                                                ${day.enabled
                                                    ? "bg-white border-gray-200 text-gray-900 cursor-pointer"
                                                    : "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed"
                                                }
                                            `}
                                        />
                                    </div>

                                    {/* Arrow */}
                                    <span className="text-gray-400 font-bold hidden md:block">→</span>

                                    {/* End time */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 md:hidden">
                                            End
                                        </label>
                                        <input
                                            id={`end-${key}`}
                                            type="time"
                                            value={day.end}
                                            disabled={!day.enabled}
                                            onChange={(e) => setDayField(key, "end", e.target.value)}
                                            className={`
                                                w-full px-3 py-2 rounded-lg border text-sm font-semibold outline-none transition
                                                focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                                                ${day.enabled
                                                    ? "bg-white border-gray-200 text-gray-900 cursor-pointer"
                                                    : "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed"
                                                }
                                            `}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── Footer / Save ── */}
                <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                        Saved to{" "}
                        <span className="font-mono font-bold text-gray-600">
                            availability/{selectedId === "global" ? "global" : selectedId}
                        </span>
                    </p>
                    <button
                        id="save-schedule-btn"
                        onClick={handleSave}
                        disabled={saving || loadingSchedule}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {saving ? "hourglass_empty" : "save"}
                        </span>
                        {saving ? "Saving…" : "Save Schedule"}
                    </button>
                </div>
            </div>

            {/* ── Live Preview ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Schedule Preview
                </p>
                <div className="flex flex-wrap gap-2">
                    {DAYS.map(({ key, label }) => {
                        const day = schedule[key];
                        return (
                            <div
                                key={key}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                    ${day.enabled
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-gray-50 text-gray-400 border-gray-200"
                                    }
                                `}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${day.enabled ? "bg-emerald-500" : "bg-gray-300"}`} />
                                <span>{label.slice(0, 3)}</span>
                                {day.enabled && (
                                    <span className="font-normal opacity-75">
                                        {day.start}–{day.end}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
