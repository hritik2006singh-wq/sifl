"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase-admin";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  startAt,
  serverTimestamp
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import toast from "react-hot-toast";

type AccountStatus = "active" | "suspended" | "archived";

const levelMap: Record<string, string[]> = {
  German: ["A1", "A2", "B1", "B2", "C1", "C2"],
  Japanese: ["N5", "N4", "N3", "N2", "N1"],
  English: ["Beginner", "Intermediate", "Advanced"],
  French: ["A1", "A2", "B1", "B2", "C1", "C2"],
  Spanish: ["A1", "A2", "B1", "B2", "C1", "C2"]
};

// Status badge component
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

export default function StudentsClient() {
  const [students, setStudents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModal | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);

  // New Student Form
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  const [loading, setLoading] = useState(true);

  const [lastDoc, setLastDoc] = useState<any>(null);
  const [firstDocs, setFirstDocs] = useState<any[]>([]); // Track start of each page for "Previous"
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch Students From Firestore — Paginated
  const fetchStudents = async (direction: "next" | "prev" | "initial" = "initial") => {
    try {
      setLoading(true);

      const statusFilter: AccountStatus[] = ["active"];
      if (showSuspended) statusFilter.push("suspended");
      if (showArchived) statusFilter.push("archived");

      let q = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("accountStatus", "in", statusFilter),
        orderBy("created_at", "desc"),
        limit(20)
      );

      if (direction === "next" && lastDoc) {
        q = query(q, startAfter(lastDoc));
      } else if (direction === "prev" && pageIndex > 0) {
        // Go back to the cached firstDoc of the previous page
        const targetPageStart = firstDocs[pageIndex - 1];
        if (targetPageStart) {
          q = query(q, startAt(targetPageStart));
        }
      }

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

      setStudents(data);

      if (snapshot.docs.length > 0) {
        setHasMore(snapshot.docs.length === 20);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

        if (direction === "initial") {
          setFirstDocs([snapshot.docs[0]]);
          setPageIndex(0);
        } else if (direction === "next") {
          setFirstDocs(prev => [...prev, snapshot.docs[0]]);
          setPageIndex(p => p + 1);
        } else if (direction === "prev") {
          setFirstDocs(prev => prev.slice(0, -1)); // Remove the pop we just backed out of
          setPageIndex(p => p - 1);
        }
      } else {
        if (direction === "initial") setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Query Error: Index might be building.");
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
      await updateDoc(doc(db, "users", studentId), {
        is_paid: !currentStatus,
        status: !currentStatus ? "PAID" : "UNPAID"
      });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, is_paid: !currentStatus, status: !currentStatus ? "PAID" : "UNPAID" }
            : student
        )
      );
      toast.success("Payment status updated");
    } catch (err) {
      console.error("Error updating payment status:", err);
      toast.error("Error updating status");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail,
        newPassword
      );

      const user = userCredential.user;

      const newUserDoc = {
        email: newEmail,
        role: "student",
        is_paid: isPaid,
        status: isPaid ? "PAID" : "UNPAID",
        accountStatus: "active" as AccountStatus,
        accountStatusReason: null,
        accountStatusUpdatedAt: serverTimestamp(),
        accountStatusUpdatedBy: auth.currentUser?.uid ?? null,
        language: newLanguage,
        currentLevel: newLevel,
        hasFullAccess,
        updatedAt: serverTimestamp(),
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), newUserDoc);

      setStudents((prev) => [{ id: user.uid, ...newUserDoc }, ...prev]);

      setShowAddModal(false);
      setNewEmail("");
      setNewPassword("");
      setNewLanguage("");
      setNewLevel("");
      setIsPaid(false);
      setHasFullAccess(false);
      toast.success("Student created successfully!");

    } catch (err: any) {
      toast.error("Error creating student: " + err.message);
    }
  };

  // Write audit log
  const writeAuditLog = async (
    userId: string,
    previousStatus: AccountStatus,
    newStatus: AccountStatus,
    reason: string
  ) => {
    try {
      await addDoc(collection(db, "user_status_logs"), {
        userId,
        previousStatus,
        newStatus,
        reason,
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
    const previousStatus: AccountStatus = student?.accountStatus ?? "active";

    const newStatus: AccountStatus =
      action === "suspend" ? "suspended" :
        action === "archive" ? "archived" : "active";

    const reason =
      action === "suspend" ? "Suspended by admin" :
        action === "archive" ? "Archived by admin" : "Restored by admin";

    try {
      await updateDoc(doc(db, "users", targetId), {
        accountStatus: newStatus,
        accountStatusReason: reason,
        accountStatusUpdatedAt: serverTimestamp(),
        accountStatusUpdatedBy: auth.currentUser?.uid ?? null,
      });

      await writeAuditLog(targetId, previousStatus, newStatus, reason);

      // Remove from list if filter doesn't include new status
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

      const labels = { suspend: "suspended", archive: "archived", restore: "restored" };
      toast.success(`Student ${labels[action]} successfully`);
    } catch (e: any) {
      console.error("Error updating student status:", e);
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
    ? "bg-green-600 hover:bg-green-700 shadow-green-500/30"
    : "bg-red-600 hover:bg-red-700 shadow-red-500/30";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">groups</span>
          All Students
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span> Add Student
        </button>
      </div>

      {/* Filter Toggles */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Show:</span>
        <button
          onClick={() => setShowSuspended((v) => !v)}
          className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border transition-colors ${showSuspended
            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
        >
          SUSPENDED
        </button>
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border transition-colors ${showArchived
            ? "bg-gray-200 text-gray-700 border-gray-400"
            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
        >
          ARCHIVED
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Language / Level</th>
              <th className="py-4 px-4 text-center">Payment Status</th>
              <th className="py-4 px-4">Account Status</th>
              <th className="py-4 px-4">Access Rules</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const accountStatus: AccountStatus = student.accountStatus ?? "active";
              return (
                <tr
                  key={student.id}
                  className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
                >
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">
                    <Link href={`/admin/students/${student.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                      <div className="size-8 bg-purple-50 text-primary rounded-full flex items-center justify-center shrink-0">
                        {student.email.charAt(0).toUpperCase()}
                      </div>
                      {student.email}
                    </Link>
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
                      className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-transform active:scale-95 ${student.is_paid
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                    >
                      {student.is_paid ? "PAID" : "UNPAID"}
                    </button>
                  </td>

                  <td className="py-4 px-4">
                    <StatusBadge status={accountStatus} />
                  </td>

                  <td className="py-4 px-4">
                    {student.hasFullAccess ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                        <span className="material-symbols-outlined text-[14px]">stars</span> Full Access
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                        <span className="material-symbols-outlined text-[14px]">lock</span> Level Restricted
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-sm text-primary font-bold hover:underline"
                      >
                        Manage
                      </Link>

                      {/* Action dropdown */}
                      <div className="relative group">
                        <button className="text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-1">
                          Actions <span className="material-symbols-outlined text-[12px]">expand_more</span>
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[130px] overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                          {accountStatus !== "suspended" && (
                            <button
                              onClick={() => triggerAction(student.id, "suspend")}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-yellow-700 hover:bg-yellow-50 transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          {accountStatus !== "archived" && (
                            <button
                              onClick={() => triggerAction(student.id, "archive")}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              Archive
                            </button>
                          )}
                          {accountStatus !== "active" && (
                            <button
                              onClick={() => triggerAction(student.id, "restore")}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-green-700 hover:bg-green-50 transition-colors"
                            >
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50/30">
        <span className="text-xs font-semibold text-gray-500">
          Page {pageIndex + 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => fetchStudents("prev")}
            disabled={pageIndex === 0 || loading}
            className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">chevron_left</span> Previous
          </button>
          <button
            onClick={() => fetchStudents("next")}
            disabled={!hasMore || loading}
            className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center gap-1 shadow-sm"
          >
            Next <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* CREATE STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-gray-900 m-0 text-center flex-1">
                Onboard New Student
              </h3>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email" required placeholder="student@example.com"
                    value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Temporary Password</label>
                  <input
                    type="text" required placeholder="Password123" minLength={6}
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Track Language</label>
                  <select required className="w-full px-4 py-2.5 border rounded-xl outline-none bg-white" value={newLanguage} onChange={(e) => { setNewLanguage(e.target.value); setNewLevel(""); }}>
                    <option value="">Select Language</option>
                    {Object.keys(levelMap).map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Entry Level</label>
                  <select required className="w-full px-4 py-2.5 border rounded-xl outline-none bg-white disabled:opacity-50" value={newLevel} disabled={!newLanguage} onChange={(e) => setNewLevel(e.target.value)}>
                    <option value="">Select Level</option>
                    {availableLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <label className="flex items-center gap-3 cursor-pointer bg-green-50/50 p-3 rounded-xl border border-green-100 hover:bg-green-50 transition-colors">
                  <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="size-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <div className="flex flex-col">
                    <span className="font-bold text-green-800 text-sm">Account Paid</span>
                    <span className="text-xs text-green-600">Grants immediate login access</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer bg-purple-50/50 p-3 rounded-xl border border-purple-100 hover:bg-purple-50 transition-colors">
                  <input type="checkbox" checked={hasFullAccess} onChange={(e) => setHasFullAccess(e.target.checked)} className="size-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <div className="flex flex-col">
                    <span className="font-bold text-purple-800 text-sm">Grant Full Access</span>
                    <span className="text-xs text-purple-600">Student can bypass level-locks and see all language materials</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl flex-1 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-3 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md flex-1 transition-all active:scale-95"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Confirm Modal */}
      {actionModal && actionModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 pt-8 pb-6 text-center border-2 border-gray-100">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${actionModal.action === "restore" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
              }`}>
              <span className="material-symbols-outlined text-4xl">
                {actionModal.action === "restore" ? "restore" : "warning"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{actionLabel} Student?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {actionModal.action === "suspend" && "This student will be prevented from logging in until restored."}
              {actionModal.action === "archive" && "This student will be hidden from the default list and cannot log in. No data will be deleted."}
              {actionModal.action === "restore" && "This will restore full login access for this student."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-sm transition-all ${actionColor}`}
              >
                {actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}