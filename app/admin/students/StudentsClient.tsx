"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword
} from "firebase/auth";
import Link from "next/link";

export default function StudentsClient() {
  const [students, setStudents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch Students From Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));

        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // 🔥 Toggle Payment Status
  const togglePaid = async (studentId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", studentId), {
        is_paid: !currentStatus,
      });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, is_paid: !currentStatus }
            : student
        )
      );
    } catch (err) {
      console.error("Error updating payment status:", err);
    }
  };

  // 🔥 Create New Student Account
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail,
        newPassword
      );

      const user = userCredential.user;

      // Create Firestore user document
      await setDoc(doc(db, "users", user.uid), {
        email: newEmail,
        role: "student",
        is_paid: false,
        created_at: new Date().toISOString(),
      });

      // Add to local state
      setStudents((prev) => [
        ...prev,
        {
          id: user.uid,
          email: newEmail,
          role: "student",
          is_paid: false,
          created_at: new Date().toISOString(),
        },
      ]);

      setShowAddModal(false);
      setNewEmail("");
      setNewPassword("");
    } catch (err: any) {
      alert("Error creating student: " + err.message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading students...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">All Students</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Student
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-sm text-gray-500">
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Joined</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {student.email}
                  </Link>
                </td>

                <td className="py-3 px-4">
                  <button
                    onClick={() =>
                      togglePaid(student.id, student.is_paid)
                    }
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      student.is_paid
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {student.is_paid ? "PAID" : "UNPAID"}
                  </button>
                </td>

                <td className="py-3 px-4 text-sm text-gray-500">
                  {student.created_at
                    ? new Date(student.created_at).toLocaleDateString()
                    : "-"}
                </td>

                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}

            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">
              Create New Student
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                required
                placeholder="Temporary Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}