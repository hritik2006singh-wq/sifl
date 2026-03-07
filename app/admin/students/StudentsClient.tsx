"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase-client";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  query,
  orderBy,
  limit,
  startAfter,
  startAt,
  serverTimestamp,
  where
} from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";

type AccountStatus = "active" | "suspended" | "archived";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

function computeAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasBirthdayPassed) age--;
  return age;
}

const levelMap: Record<string, string[]> = {
  German: ["A1", "A2", "B1", "B2", "C1", "C2"],
  Japanese: ["N5", "N4", "N3", "N2", "N1"],
  English: ["Beginner", "Intermediate", "Advanced"],
  French: ["A1", "A2", "B1", "B2", "C1", "C2"],
  Spanish: ["A1", "A2", "B1", "B2", "C1", "C2"],
};

type WeeklyTemplate = {
  [day: string]: { enabled: boolean; start: string; end: string };
};

function StatusBadge({ status }: { status: AccountStatus }) {
  if (status === "suspended") {
    return (
      <span className="inline-flex items-center text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
        SUSPENDED
      </span>
    );
  }
  if (status === "archived") {
    return (
      <span className="inline-flex items-center text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
        ARCHIVED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
      ACTIVE
    </span>
  );
}

type ActionModal = {
  isOpen: boolean;
  targetId: string;
  action: "suspend" | "archive" | "restore";
};

// ══════════════════════════════════════════════════════════════
// Schedule a Class — Inline Modal Component
// ══════════════════════════════════════════════════════════════
function ScheduleClassModal({
  student,
  schedDate,
  setSchedDate,
  schedTimeSlot,
  setSchedTimeSlot,
  schedSlots,
  setSchedSlots,
  schedDateStatus,
  setSchedDateStatus,
  schedSubmitting,
  setSchedSubmitting,
  onClose,
}: {
  student: any;
  schedDate: string;
  setSchedDate: (v: string) => void;
  schedTimeSlot: string;
  setSchedTimeSlot: (v: string) => void;
  schedSlots: { time: string; status: string }[];
  setSchedSlots: (v: { time: string; status: string }[]) => void;
  schedDateStatus: string;
  setSchedDateStatus: (v: string) => void;
  schedSubmitting: boolean;
  setSchedSubmitting: (v: boolean) => void;
  onClose: () => void;
}) {
  // Fetch slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!schedDate) return;
      setSchedDateStatus("Loading slots...");
      setSchedTimeSlot("");
      try {
        const tId = student.teacherId || "global";
        const availRef = doc(db, "availability", tId);
        const availSnap = await getDoc(availRef);

        if (!availSnap.exists()) {
          setSchedSlots([]);
          setSchedDateStatus("No availability found for the assigned teacher.");
          return;
        }

        const availData = availSnap.data();
        const blockedDates = availData.blockedDates || {};
        if (blockedDates[schedDate]) {
          setSchedSlots([]);
          setSchedDateStatus("No sessions available on this date.");
          return;
        }

        const weeklyTemplate: WeeklyTemplate = availData.weeklyTemplate || {};
        const [year, month, day] = schedDate.split("-").map(Number);
        const checkDate = new Date(year, month - 1, day);
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = days[checkDate.getDay()];
        const dayConfig = weeklyTemplate[dayName];

        if (!dayConfig || !dayConfig.enabled) {
          setSchedSlots([]);
          setSchedDateStatus("No sessions available on this day.");
          return;
        }

        const generatedSlots: { time: string; status: string }[] = [];
        const parseTime = (t: string) => {
          const [h, m] = t.split(":").map(Number);
          return h * 60 + m;
        };
        const startMins = parseTime(dayConfig.start);
        const endMins = parseTime(dayConfig.end);

        for (let m = startMins; m < endMins; m += 30) {
          const hh = Math.floor(m / 60).toString().padStart(2, "0");
          const mm = (m % 60).toString().padStart(2, "0");
          generatedSlots.push({ time: `${hh}:${mm}`, status: "available" });
        }

        // Check existing bookings for these slots
        const slotsQuery = query(
          collection(db, "slots"),
          where("teacherId", "==", tId),
          where("date", "==", schedDate)
        );
        const slotsSnap = await getDocs(slotsQuery);
        const existingSlotsMap: { [time: string]: string } = {};
        slotsSnap.forEach((d) => {
          existingSlotsMap[d.data().time] = d.data().status;
        });

        const mergedSlots = generatedSlots.map((s) => {
          if (existingSlotsMap[s.time] && existingSlotsMap[s.time] !== "available") {
            return { ...s, status: existingSlotsMap[s.time] };
          }
          return s;
        });

        setSchedSlots(mergedSlots);
        setSchedDateStatus(mergedSlots.length > 0 ? "" : "No slots remaining for this date.");
      } catch (err) {
        console.error("Error fetching slots:", err);
        setSchedDateStatus("Error fetching time slots.");
      }
    };

    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedDate]);

  const handleConfirmSchedule = async () => {
    if (!schedDate || !schedTimeSlot) {
      toast.error("Please select a date and time slot.");
      return;
    }
    setSchedSubmitting(true);
    try {
      const tId = student.teacherId || "global";
      const slotId = `${tId}_${schedDate}_${schedTimeSlot}`;
      const slotRef = doc(db, "slots", slotId);

      // Mark the slot as booked
      await setDoc(slotRef, {
        date: schedDate,
        time: schedTimeSlot,
        teacherId: tId,
        status: "confirmed",
        studentId: student.id,
        confirmedAt: new Date().toISOString(),
      }, { merge: true });

      // Create a class booking doc
      await addDoc(collection(db, "classBookings"), {
        studentId: student.id,
        studentName: student.name || "",
        studentEmail: student.email || "",
        teacherId: tId,
        date: schedDate,
        timeSlot: schedTimeSlot,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });

      toast.success(`Class scheduled for ${student.name} on ${schedDate} at ${schedTimeSlot}`);
      onClose();
    } catch (err: any) {
      console.error("Schedule error:", err);
      toast.error(err.message || "Failed to schedule class.");
    } finally {
      setSchedSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
        <h3 className="text-xl font-bold border-b pb-2">Schedule a Class</h3>
        <p className="text-sm text-gray-500">
          Scheduling for: <span className="font-bold text-gray-900">{student.name || "Student"}</span>
          <br />
          <span className="text-xs text-gray-400">{student.email || ""}</span>
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={schedDate}
            onChange={(e) => setSchedDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        {schedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
            {schedDateStatus ? (
              <div className="p-3 bg-gray-50 border border-dashed rounded-xl text-center text-sm font-medium text-gray-600">
                {schedDateStatus}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {schedSlots.map((slot) => {
                  const isAvailable = slot.status === "available";
                  const isPending = slot.status === "pending";
                  const isSelected = schedTimeSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setSchedTimeSlot(slot.time)}
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
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200"
          >
            Cancel
          </button>
          <button
            disabled={!schedTimeSlot || schedSubmitting}
            onClick={handleConfirmSchedule}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {schedSubmitting ? "Scheduling..." : "Confirm Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentsClient() {
  const [students, setStudents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModal | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);

  // ── Full Register Form State ─────────────────────────────────────────────
  // Academic
  const [newLanguage, setNewLanguage] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [newTeacherId, setNewTeacherId] = useState("");
  // Core Identity
  const [newStudentId, setNewStudentId] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newGender, setNewGender] = useState("Male");
  // Location
  const [newPhone, setNewPhone] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newCountry, setNewCountry] = useState("");
  // Emergency Contact
  const [newEcName, setNewEcName] = useState("");
  const [newEcRelation, setNewEcRelation] = useState("");
  const [newEcPhone, setNewEcPhone] = useState("");
  // Billing
  const [isPaid, setIsPaid] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  // Teachers list for dropdown
  const [teachers, setTeachers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [firstDocs, setFirstDocs] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ── Schedule Modal State ──────────────────────────────────────────────────
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; student: any | null }>({
    open: false,
    student: null,
  });
  const [schedDate, setSchedDate] = useState("");
  const [schedTimeSlot, setSchedTimeSlot] = useState("");
  const [schedSlots, setSchedSlots] = useState<{ time: string; status: string }[]>([]);
  const [schedDateStatus, setSchedDateStatus] = useState("");
  const [schedSubmitting, setSchedSubmitting] = useState(false);

  // Fetch teachers + admins for dropdown (T5: include admins as they can teach)
  useEffect(() => {
    const fetchTeachersAndAdmins = async () => {
      try {
        const [teacherSnap, adminSnap] = await Promise.all([
          getDocs(query(collection(db, "teachers"), orderBy("createdAt", "desc"))).catch(() => null),
          getDocs(collection(db, "admins")).catch(() => null),
        ]);
        const teacherList = teacherSnap
          ? teacherSnap.docs.map((d) => ({ id: d.id, ...d.data(), _source: "teacher" }))
          : [];
        const adminList = adminSnap
          ? adminSnap.docs.map((d) => ({ id: d.id, ...d.data(), _source: "admin" }))
          : [];
        // Merge and deduplicate by ID
        const seenIds = new Set<string>();
        const combined: any[] = [];
        for (const t of teacherList) {
          if (!seenIds.has(t.id)) { seenIds.add(t.id); combined.push(t); }
        }
        for (const a of adminList) {
          if (!seenIds.has(a.id)) { seenIds.add(a.id); combined.push(a); }
        }
        setTeachers(combined);
      } catch {
        // non-critical
      }
    };
    fetchTeachersAndAdmins();
  }, []);

  // ── Fetch Students ───────────────────────────────────────────────────────
  const fetchStudents = async (direction: "next" | "prev" | "initial" = "initial") => {
    try {
      setLoading(true);
      let q = query(
        collection(db, "students"),
        orderBy("createdAt", "desc"),
        limit(80)
      );

      if (direction === "next" && lastDoc) {
        q = query(q, startAfter(lastDoc));
      } else if (direction === "prev" && pageIndex > 0) {
        const start = firstDocs[pageIndex - 1];
        if (start) q = query(q, startAt(start));
      }

      const snapshot = await getDocs(q);

      if (snapshot.docs.length === 0) {
        setStudents([]);
        if (direction === "initial") setHasMore(false);
        return;
      }

      const allDocs = await Promise.all(
        snapshot.docs.map(async (snap) => {
          const d = snap.data() as Record<string, any>;
          const uid = snap.id;

          let name = d.name || d.username || d.displayName || "";
          let email = d.email || "";

          if (!name || !email) {
            try {
              const userSnap = await getDoc(doc(db, "users", uid));
              if (userSnap.exists()) {
                const u = userSnap.data() as Record<string, any>;
                name = name || u.name || u.username || u.displayName || "";
                email = email || u.email || "";
              }
            } catch {
              /* non-critical */
            }
          }

          return {
            id: uid,
            name,
            email,
            studentId: d.studentId || "",
            dob: d.dob || null,
            slug: d.slug || "",
            age: d.age != null ? Number(d.age) : computeAge(d.dob),
            language: d.language || d.languageTrack || "",
            currentLevel: d.currentLevel ?? d.level ?? "",
            is_paid: d.is_paid ?? false,
            hasFullAccess: d.hasFullAccess ?? false,
            accountStatus: (d.accountStatus ?? d.status ?? "active") as AccountStatus,
            profileImage: d.profileImage || "",
            teacherId: d.assignedTeacherId || d.assigned_teacher_id || "",
          };
        })
      );

      const statusFilter: AccountStatus[] = ["active"];
      if (showSuspended) statusFilter.push("suspended");
      if (showArchived) statusFilter.push("archived");

      const filtered = allDocs.filter((s) => statusFilter.includes(s.accountStatus));
      const page = filtered.slice(0, 20);

      setStudents(page);
      setHasMore(filtered.length > 20);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (direction === "initial") {
        setFirstDocs([snapshot.docs[0]]);
        setPageIndex(0);
      } else if (direction === "next") {
        setFirstDocs((prev) => [...prev, snapshot.docs[0]]);
        setPageIndex((p) => p + 1);
      } else if (direction === "prev") {
        setFirstDocs((prev) => prev.slice(0, -1));
        setPageIndex((p) => p - 1);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to load students. Check Firestore rules or indexes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived, showSuspended]);

  const togglePaid = async (studentId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "students", studentId), { is_paid: !currentStatus });
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, is_paid: !currentStatus } : s))
      );
      toast.success("Payment status updated");
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const resetForm = () => {
    setNewLanguage(""); setNewLevel(""); setNewTeacherId("");
    setNewStudentId(""); setNewUsername(""); setNewEmail(""); setNewPassword("");
    setNewDob(""); setNewGender("Male");
    setNewPhone(""); setNewStreet(""); setNewCity(""); setNewState(""); setNewCountry("");
    setNewEcName(""); setNewEcRelation(""); setNewEcPhone("");
    setIsPaid(false); setHasFullAccess(false);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newUsername,
          studentId: newStudentId,
          languageTrack: newLanguage,
          level: newLevel,
          teacherId: newTeacherId || "",
          dob: newDob || null,
          gender: newGender,
          phone: newPhone,
          address: {
            street: newStreet,
            city: newCity,
            state: newState,
            country: newCountry,
          },
          emergencyContact: {
            name: newEcName,
            relation: newEcRelation,
            phone: newEcPhone,
          },
          isPaid,
          hasFullAccess,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create student");

      setShowAddModal(false);
      resetForm();
      toast.success("Student registered successfully!");
      fetchStudents("initial");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const writeAuditLog = async (
    userId: string,
    previousStatus: AccountStatus,
    newStatus: AccountStatus,
    reason: string
  ) => {
    try {
      await addDoc(collection(db, "user_status_logs"), {
        userId, previousStatus, newStatus, reason,
        updatedBy: auth.currentUser?.uid ?? "unknown",
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Audit log failed:", err);
    }
  };

  const triggerAction = (studentId: string, action: ActionModal["action"]) => {
    setActionModal({ isOpen: true, targetId: studentId, action });
  };

  const confirmAction = async () => {
    if (!actionModal) return;
    const { targetId, action } = actionModal;
    setActionModal(null);

    const student = students.find((s) => s.id === targetId);
    const previousStatus = (student?.accountStatus ?? "active") as AccountStatus;
    const newStatus: AccountStatus =
      action === "suspend" ? "suspended" : action === "archive" ? "archived" : "active";
    const reason =
      action === "suspend" ? "Suspended by admin" :
        action === "archive" ? "Archived by admin" : "Restored by admin";

    try {
      await updateDoc(doc(db, "students", targetId), {
        accountStatus: newStatus,
        accountStatusReason: reason,
        accountStatusUpdatedAt: serverTimestamp(),
        accountStatusUpdatedBy: auth.currentUser?.uid ?? null,
      });
      await writeAuditLog(targetId, previousStatus, newStatus, reason);

      const shouldShow =
        newStatus === "active" ||
        (newStatus === "suspended" && showSuspended) ||
        (newStatus === "archived" && showArchived);

      if (shouldShow) {
        setStudents((prev) =>
          prev.map((s) => s.id === targetId ? { ...s, accountStatus: newStatus } : s)
        );
      } else {
        setStudents((prev) => prev.filter((s) => s.id !== targetId));
      }

      const labels: Record<string, string> = { suspend: "suspended", archive: "archived", restore: "restored" };
      toast.success(`Student ${labels[action]} successfully`);
    } catch (e: any) {
      toast.error("Failed to update student status");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 mt-10">Loading students...</div>;
  }

  const availableLevels = newLanguage ? levelMap[newLanguage] || [] : [];
  const actionLabel = actionModal?.action === "suspend" ? "Suspend" :
    actionModal?.action === "archive" ? "Archive" : "Restore";
  const actionColor = actionModal?.action === "restore"
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-600 hover:bg-red-700";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Student CRM</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage enrollments and registration</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span> Register Student
        </button>
      </div>

      {/* Filter Toggles */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Show:</span>
        <button
          onClick={() => setShowSuspended((v) => !v)}
          className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border transition-colors ${showSuspended ? "bg-yellow-100 text-yellow-700 border-yellow-300" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
        >
          SUSPENDED
        </button>
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border transition-colors ${showArchived ? "bg-gray-200 text-gray-700 border-gray-400" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
        >
          ARCHIVED
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
              <th className="py-4 px-4">Student Identity</th>
              <th className="py-4 px-4">Student ID</th>
              <th className="py-4 px-4">Track &amp; Level</th>
              <th className="py-4 px-4 text-center">Billing</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const accountStatus: AccountStatus = student.accountStatus ?? "active";
              return (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={student.name || "Student"}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0 text-sm">
                          {student.name?.charAt(0)?.toUpperCase() ?? "S"}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-gray-900">{student.name ?? "Student"}</span>
                        <span className="text-xs text-gray-500">{student.email ?? "-"}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="text-sm font-mono text-gray-600">{student.studentId || "—"}</span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-gray-700">{student.language || "Unassigned"}</span>
                      <span className="text-xs text-gray-500 font-semibold">{student.currentLevel || "No Level"}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => togglePaid(student.id, student.is_paid)}
                      className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-transform active:scale-95 ${student.is_paid ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"}`}
                    >
                      {student.is_paid ? "PAID" : "UNPAID"}
                    </button>
                  </td>

                  <td className="py-4 px-4">
                    <StatusBadge status={accountStatus} />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* ── MANAGE CRM BUTTON ── */}
                      <Link
                        href={`/admin/students/${student.slug || student.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary font-bold text-xs rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">manage_accounts</span>
                        Manage CRM
                      </Link>
                      {/* ── SCHEDULE A CLASS BUTTON ── */}
                      <button
                        onClick={() => {
                          setScheduleModal({ open: true, student });
                          setSchedDate("");
                          setSchedTimeSlot("");
                          setSchedSlots([]);
                          setSchedDateStatus("");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-primary bg-primary/5 font-bold text-xs rounded-lg border border-primary/10 hover:bg-primary/15 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        Schedule a Class
                      </button>

                      {/* ── ACTIONS DROPDOWN ── */}
                      <div className="relative group">
                        <button className="text-[10px] font-bold tracking-widest px-3 py-2 rounded-lg border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">more_vert</span>
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[130px] overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                          {accountStatus !== "suspended" && (
                            <button onClick={() => triggerAction(student.id, "suspend")} className="w-full text-left px-4 py-2.5 text-xs font-bold text-yellow-700 hover:bg-yellow-50 transition-colors">
                              Suspend
                            </button>
                          )}
                          {accountStatus !== "archived" && (
                            <button onClick={() => triggerAction(student.id, "archive")} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                              Archive
                            </button>
                          )}
                          {accountStatus !== "active" && (
                            <button onClick={() => triggerAction(student.id, "restore")} className="w-full text-left px-4 py-2.5 text-xs font-bold text-green-700 hover:bg-green-50 transition-colors">
                              Restore
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}

            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400 border-2 border-dashed rounded-xl m-4 bg-gray-50">
                  <span className="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
                  <p className="font-medium">No students found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50/30">
        <span className="text-xs font-semibold text-gray-500">Page {pageIndex + 1}</span>
        <div className="flex gap-2">
          <button onClick={() => fetchStudents("prev")} disabled={pageIndex === 0 || loading} className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">chevron_left</span> Previous
          </button>
          <button onClick={() => fetchStudents("next")} disabled={!hasMore || loading} className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm">
            Next <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          REGISTER NEW STUDENT MODAL — Full form with ALL fields
      ══════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-gray-900">Register New Student</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 size-8 flex items-center justify-center rounded-full border bg-white">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto px-6 py-6">
              <form onSubmit={handleAddStudent} className="space-y-6">

                {/* ── ACADEMIC TRACKING ── */}
                <div>
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 border-b pb-2">Academic Tracking</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Language Track</label>
                      <select required className="w-full px-3 py-2.5 border rounded-xl outline-none bg-white focus:ring-2 focus:ring-primary/20 text-sm" value={newLanguage} onChange={(e) => { setNewLanguage(e.target.value); setNewLevel(""); }}>
                        <option value="">Select Language</option>
                        {Object.keys(levelMap).map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Proficiency Level</label>
                      <select required className="w-full px-3 py-2.5 border rounded-xl outline-none bg-white focus:ring-2 focus:ring-primary/20 text-sm disabled:opacity-50" value={newLevel} disabled={!newLanguage} onChange={(e) => setNewLevel(e.target.value)}>
                        <option value="">Select Level</option>
                        {availableLevels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Assigned Teacher</label>
                      <select className="w-full px-3 py-2.5 border rounded-xl outline-none bg-white focus:ring-2 focus:ring-primary/20 text-sm" value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)}>
                        <option value="">-- Unassigned --</option>
                        {teachers.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name || t.email || t.id}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── CORE IDENTITY ── */}
                <div>
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 border-b pb-2">Core Identity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Student ID Tag</label>
                      <input type="text" required placeholder="e.g. STU-2026" value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                      <input type="text" required placeholder="John Doe" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                      <input type="email" required placeholder="john@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    {/* ── PASSWORD FIELD ── */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Temporary Password <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required placeholder="e.g. Welcome@123" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                      <p className="text-xs text-gray-400 mt-1">Student uses this to log in for the first time.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                      <select className="w-full px-3 py-2.5 border rounded-xl outline-none bg-white focus:ring-2 focus:ring-primary/20 text-sm" value={newGender} onChange={(e) => setNewGender(e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── LOCATION & CONTACT ── */}
                <div>
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 border-b pb-2">Location &amp; Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" placeholder="+1 234 567 8900" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
                      <input type="text" placeholder="123 Main St" value={newStreet} onChange={(e) => setNewStreet(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                      <input type="text" placeholder="New York" value={newCity} onChange={(e) => setNewCity(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">State / Region</label>
                      <input type="text" placeholder="NY" value={newState} onChange={(e) => setNewState(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Country</label>
                      <input type="text" placeholder="USA" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    </div>
                  </div>
                </div>

                {/* ── EMERGENCY CONTACT + BILLING ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
                    <h4 className="text-xs font-black text-orange-700 uppercase tracking-widest mb-3">Emergency Contact</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-orange-800">Full Name</label>
                        <input type="text" placeholder="Parent / Guardian" value={newEcName} onChange={(e) => setNewEcName(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-orange-800 mb-1">Relation</label>
                          <input type="text" placeholder="Parent" value={newEcRelation} onChange={(e) => setNewEcRelation(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-orange-800 mb-1">Phone</label>
                          <input type="tel" placeholder="9876543210" value={newEcPhone} onChange={(e) => setNewEcPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4">
                    <h4 className="text-xs font-black text-green-700 uppercase tracking-widest mb-3">Billing Status</h4>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-green-200 bg-white hover:bg-green-50 transition-colors">
                        <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="size-4 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <div>
                          <span className="font-bold text-green-800 text-sm block">
                            {isPaid ? "Paid — Active Student" : "Unpaid — Restricted Access"}
                          </span>
                          <span className="text-xs text-green-600">Setting status to Paid grants immediate access to the LMS platform.</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 transition-colors">
                        <input type="checkbox" checked={hasFullAccess} onChange={(e) => setHasFullAccess(e.target.checked)} className="size-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <div>
                          <span className="font-bold text-purple-800 text-sm block">Grant Full Access</span>
                          <span className="text-xs text-purple-600">Student can bypass level-locks and see all language materials.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ── SUBMIT BUTTONS ── */}
                <div className="flex gap-3 pt-2 border-t">
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl flex-1 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-5 py-3 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md flex-1 transition-all active:scale-95 disabled:opacity-60">
                    {submitting ? "Registering..." : "Register Student"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Confirm Modal ── */}
      {actionModal && actionModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 pt-8 pb-6 text-center border-2 border-gray-100">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${actionModal.action === "restore" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
              <span className="material-symbols-outlined text-4xl">
                {actionModal.action === "restore" ? "restore" : "warning"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{actionLabel} Student?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {actionModal.action === "suspend" && "This student will be prevented from logging in until restored."}
              {actionModal.action === "archive" && "This student will be hidden from the default list. No data will be deleted."}
              {actionModal.action === "restore" && "This will restore full login access for this student."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={confirmAction} className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-sm transition-all ${actionColor}`}>
                {actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SCHEDULE A CLASS MODAL
      ══════════════════════════════════════════════════════════════ */}
      {scheduleModal.open && scheduleModal.student && (
        <ScheduleClassModal
          student={scheduleModal.student}
          schedDate={schedDate}
          setSchedDate={setSchedDate}
          schedTimeSlot={schedTimeSlot}
          setSchedTimeSlot={setSchedTimeSlot}
          schedSlots={schedSlots}
          setSchedSlots={setSchedSlots}
          schedDateStatus={schedDateStatus}
          setSchedDateStatus={setSchedDateStatus}
          schedSubmitting={schedSubmitting}
          setSchedSubmitting={setSchedSubmitting}
          onClose={() => setScheduleModal({ open: false, student: null })}
        />
      )}
    </div>
  );
}
