"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-client";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";
import { CreateStudentRequest } from "@/types/student";


const LEVELS = ["Beginner (A1)", "Elementary (A2)", "Intermediate (B1)", "Upper Intermediate (B2)", "Advanced (C1)", "Mastery (C2)"];
const LANGUAGE_TRACKS = ["English", "German", "French", "Spanish", "Japanese", "Other"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [language, setLanguage] = useState(LANGUAGE_TRACKS[0]);
    const [level, setLevel] = useState(LEVELS[0]);
    const [teacherId, setTeacherId] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [studentId, setStudentId] = useState("");

    const [dob, setDob] = useState("");
    const [gender, setGender] = useState(GENDERS[0]);

    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState({ street: "", city: "", state: "", country: "" });
    const [emergencyContact, setEmergencyContact] = useState({ name: "", relation: "", phone: "" });

    const [status, setStatus] = useState<"paid" | "unpaid">("unpaid");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch teachers for the dropdown
            const tSnap = await getDocs(query(collection(db, "users")));
            const tData = tSnap.docs
                .map(d => ({ id: d.id, ...d.data() } as any))
                .filter(u => u.role === "teacher" || u.role === "staff");
            setTeachers(tData);

            // Fetch students list
            const sSnap = await getDocs(query(collection(db, "students"), orderBy("createdAt", "desc")));

            const sData = await Promise.all(sSnap.docs.map(async (docSnap) => {
                const data = docSnap.data();
                // Basic object to display in table
                return {
                    id: docSnap.id,
                    studentId: data.studentId || "N/A",
                    language: data.language,
                    level: data.level,
                    status: data.status,
                };
            }));

            // We need names/emails for the list. Let's fetch the users docs as well
            const uSnap = await getDocs(collection(db, "users"));
            const userMaps = new Map();
            uSnap.forEach(d => userMaps.set(d.id, d.data()));

            const enrichedStudents = sData.map((s: any) => {
                const u = userMaps.get(s.id);
                return {
                    ...s,
                    name: u?.name || "",
                    email: u?.email || "",
                }
            });

            setStudents(enrichedStudents);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setLanguage(LANGUAGE_TRACKS[0]);
        setLevel(LEVELS[0]);
        setTeacherId("");
        setName("");
        setEmail("");
        setPassword("");
        setStudentId("");
        setDob("");
        setGender(GENDERS[0]);
        setPhone("");
        setAddress({ street: "", city: "", state: "", country: "" });
        setEmergencyContact({ name: "", relation: "", phone: "" });
        setStatus("unpaid");
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = {
                language,
                level,
                teacherId,
                name,
                email,
                password,
                studentId,
                dob,
                gender,
                phone,
                address,
                emergencyContact,
                status,
            };

            const res = await fetch("/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to create student");
            }

            toast.success("Student created successfully!");
            setShowAddModal(false);
            resetForm();
            fetchData(); // Refresh table
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Student CRM</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage enrollments and registration</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Register Student
                </button>
            </div>

            {loading ? (
                <div className="py-10 text-center text-gray-400 font-medium">Loading data...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                                <th className="py-4 px-4 font-bold">Student Identity</th>
                                <th className="py-4 px-4 font-bold">Student ID</th>
                                <th className="py-4 px-4 font-bold">Track & Level</th>
                                <th className="py-4 px-4 font-bold">Billing</th>
                                <th className="py-4 px-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-4 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0 text-sm">
                                            {student.name?.charAt(0)?.toUpperCase() ?? "S"}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-gray-900">
                                                {student.name || "Student"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {student.email || "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm font-medium text-gray-700">{student.studentId}</td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm font-bold text-gray-900">{student.language}</p>
                                        <p className="text-xs text-gray-500">{student.level}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${student.status === "paid"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-red-50 text-red-700 border-red-200"
                                            }`}>
                                            {(student.status || "unpaid").toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/students/${student.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary font-bold text-xs rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">manage_accounts</span>
                                                Manage CRM
                                            </Link>
                                            <Link
                                                href={`/admin/schedule?student=${student.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 text-primary bg-primary/5 font-bold text-xs rounded-lg border border-primary/10 hover:bg-primary/15 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                                Schedule a Class
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        No students found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* REGISTRATION MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-900">Register New Student</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="create-student-form" onSubmit={handleCreateStudent} className="space-y-8">

                                {/* 1. Academic Tracking */}
                                <div>
                                    <h4 className="text-sm font-bold text-primary border-b border-gray-100 pb-2 mb-4 uppercase tracking-wider">Academic Tracking</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Language Track</label>
                                            <select required value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                                                {LANGUAGE_TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Proficiency Level</label>
                                            <select required value={level} onChange={e => setLevel(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                                                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Teacher</label>
                                            <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                                                <option value="">-- Unassigned --</option>
                                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Core Identity */}
                                <div>
                                    <h4 className="text-sm font-bold text-primary border-b border-gray-100 pb-2 mb-4 uppercase tracking-wider">Core Identity</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Student ID Tag</label>
                                            <input type="text" required placeholder="e.g. STU-2026" value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                                            <input type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                                            <input type="email" required placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Account Password <span className="text-red-500">*</span></label>
                                            <input type="text" required placeholder="e.g. Welcome@123" minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                            <p className="text-xs text-gray-400 mt-1">Student uses this to log in for the first time.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
                                            <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                                            <select required value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20">
                                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Contact & CRM */}
                                <div>
                                    <h4 className="text-sm font-bold text-primary border-b border-gray-100 pb-2 mb-4 uppercase tracking-wider">Location & Contact</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                                            <input type="tel" required placeholder="+1 234 567 8900" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
                                            <input type="text" required placeholder="123 Main St" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                                            <input type="text" required placeholder="New York" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">State / Region</label>
                                            <input type="text" required placeholder="NY" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
                                            <input type="text" required placeholder="USA" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Emergency Contact & Billing */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                        <h4 className="text-sm font-bold text-orange-800 mb-3 uppercase tracking-wider">Emergency Contact</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-orange-900 mb-1">Full Name</label>
                                                <input type="text" required placeholder="Jane Doe" value={emergencyContact.name} onChange={e => setEmergencyContact({ ...emergencyContact, name: e.target.value })} className="w-full px-4 py-2 border border-orange-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400/20" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-orange-900 mb-1">Relation</label>
                                                    <input type="text" required placeholder="Mother" value={emergencyContact.relation} onChange={e => setEmergencyContact({ ...emergencyContact, relation: e.target.value })} className="w-full px-4 py-2 border border-orange-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400/20" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-orange-900 mb-1">Phone</label>
                                                    <input type="tel" required placeholder="+1 234 567 8900" value={emergencyContact.phone} onChange={e => setEmergencyContact({ ...emergencyContact, phone: e.target.value })} className="w-full px-4 py-2 border border-orange-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400/20" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                        <h4 className="text-sm font-bold text-emerald-800 mb-3 uppercase tracking-wider">Billing Status</h4>
                                        <label className="block text-xs font-bold text-emerald-900 mb-1">Initial Invoice Status</label>
                                        <select required value={status} onChange={e => setStatus(e.target.value as any)} className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-400/20 bg-white">
                                            <option value="unpaid">Unpaid — Pending Invoice</option>
                                            <option value="paid">Paid — Active Student</option>
                                        </select>
                                        <p className="text-xs text-emerald-700 mt-2">Setting status to Paid grants immediate access to the LMS platform.</p>
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-600 border bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-student-form"
                                disabled={isSubmitting}
                                className="px-8 py-2.5 text-sm font-bold bg-gray-900 text-white rounded-xl shadow-md hover:bg-gray-800 disabled:opacity-50"
                            >
                                {isSubmitting ? "Processing..." : "Register Student"}
                            </button>
                        </div>
                    </div>
                </div >
            )
            }

        </div >
    );
}