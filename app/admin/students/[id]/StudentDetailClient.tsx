"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, where, setDoc, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAdminGuard } from "@/hooks/useRoleGuard";

export default function StudentDetailClient({ id }: { id: string }) {
    const { user, loading: authLoading } = useAdminGuard();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"edit" | "assign" | "test" | null>(null);
    const [testTitle, setTestTitle] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedMaterialsToAssign, setSelectedMaterialsToAssign] = useState<Set<string>>(new Set());

    const [student, setStudent] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);

    // Feature Access
    const [allMaterials, setAllMaterials] = useState<any[]>([]);
    const [accessibleMaterialIds, setAccessibleMaterialIds] = useState<Set<string>>(new Set());
    const [togglingMaterial, setTogglingMaterial] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // Fetch student from flattened users collection
                const studentDoc = await getDoc(doc(db, "users", id));
                if (!studentDoc.exists()) {
                    setStudent(null);
                    setLoading(false);
                    return;
                }

                const studentData: any = { id: studentDoc.id, ...studentDoc.data() };

                // If there's assigned_teacher_id in studentData, we can fetch teacher email
                if (studentData.assigned_teacher_id) {
                    const teacherDoc = await getDoc(doc(db, "users", studentData.assigned_teacher_id));
                    if (teacherDoc.exists()) {
                        studentData.teacher_email = teacherDoc.data().email;
                    }
                }

                setStudent(studentData);

                // Fetch Submissions
                const subsRef = collection(db, "assignment_submissions");
                const q = query(subsRef, where("student_id", "==", id));
                const snapshot = await getDocs(q);

                const subsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
                    const subInfo = docSnap.data();

                    // Previously fetched assignments/materials. We fetch manually if assignment_id exists.
                    let assignmentData: any = {};
                    if (subInfo.assignment_id) {
                        try {
                            const assignmentDoc = await getDoc(doc(db, "assignments", subInfo.assignment_id));
                            if (assignmentDoc.exists()) {
                                const assignment = assignmentDoc.data();
                                assignmentData = { id: assignmentDoc.id };

                                if (assignment.material_id) {
                                    const materialDoc = await getDoc(doc(db, "materials", assignment.material_id));
                                    if (materialDoc.exists()) {
                                        assignmentData.materials = materialDoc.data();
                                    }
                                }
                            }
                        } catch (e) {
                            console.error("Error fetching assignment for sub", e);
                        }
                    }

                    return {
                        id: docSnap.id,
                        ...subInfo,
                        assignments: assignmentData
                    };
                }));

                setSubmissions(subsData);

                // Fetch All Materials
                const materialsSnap = await getDocs(collection(db, "materials"));
                setAllMaterials(materialsSnap.docs.map(m => ({ id: m.id, ...m.data() })));

                // Fetch student's custom material access
                const accessQuery = query(collection(db, "student_material_access"), where("student_id", "==", id));
                const accessSnap = await getDocs(accessQuery);
                const accessIds = new Set(accessSnap.docs.map(doc => doc.data().material_id));
                setAccessibleMaterialIds(accessIds as Set<string>);

            } catch (err) {
                console.error("Error fetching student details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStudentData();
        }
    }, [id, user]);

    const toggleMaterialAccess = async (materialId: string) => {
        setTogglingMaterial(materialId);
        try {
            const accessId = `${id}_${materialId}`;
            const docRef = doc(db, "student_material_access", accessId);

            if (accessibleMaterialIds.has(materialId)) {
                // Remove access
                await deleteDoc(docRef);
                const newSet = new Set(accessibleMaterialIds);
                newSet.delete(materialId);
                setAccessibleMaterialIds(newSet);
            } else {
                // Grant access
                await setDoc(docRef, {
                    student_id: id,
                    material_id: materialId,
                    granted_at: new Date().toISOString()
                });
                const newSet = new Set(accessibleMaterialIds);
                newSet.add(materialId);
                setAccessibleMaterialIds(newSet);
            }
        } catch (err) {
            console.error("Error toggling material access:", err);
            toast.error("Failed to toggle access.");
        } finally {
            setTogglingMaterial(null);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const docRef = doc(db, "users", id);
            await setDoc(docRef, {
                status: student.status || "UNPAID",
                is_paid: student.status === "PAID",
                level: student.level || "",
                teacher_email: student.teacher_email || ""
            }, { merge: true });

            // If they provided a teacher_email, optionally look up the teacher's ID
            if (student.teacher_email) {
                const q = query(collection(db, "users"), where("email", "==", student.teacher_email), where("role", "==", "teacher"));
                const qSnap = await getDocs(q);
                if (!qSnap.empty) {
                    await setDoc(docRef, { assignedTeacherId: qSnap.docs[0].id }, { merge: true });
                }
            }

            setModalOpen(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        }
    };

    const handleSendPasswordReset = async () => {
        if (!student?.email) return toast.error("No student email found");
        try {
            await sendPasswordResetEmail(auth, student.email);
            toast.success("Password reset email sent to " + student.email);
        } catch (error: any) {
            console.error("Error sending reset email:", error);
            toast.error(error.message || "Failed to send reset email");
        }
    };

    const toggleMaterial = (materialId: string) => {
        const newSet = new Set(selectedMaterialsToAssign);
        if (newSet.has(materialId)) {
            newSet.delete(materialId);
        } else {
            newSet.add(materialId);
        }
        setSelectedMaterialsToAssign(newSet);
    };

    const handleAssignMaterials = async () => {
        try {
            for (const materialId of selectedMaterialsToAssign) {
                if (!accessibleMaterialIds.has(materialId)) {
                    const accessId = `${id}_${materialId}`;
                    await setDoc(doc(db, "student_material_access", accessId), {
                        student_id: id,
                        material_id: materialId,
                        granted_at: new Date().toISOString()
                    });
                    setAccessibleMaterialIds(prev => new Set(prev).add(materialId));
                }
            }
            setModalOpen(false);
            toast.success("Materials assigned successfully!");
        } catch (error) {
            console.error("Error assigning materials:", error);
            toast.error("Failed to assign materials");
        }
    };

    const handleCreateTest = async () => {
        try {
            if (!testTitle || !selectedMaterial) return toast.error("Please fill all fields");

            await setDoc(doc(collection(db, "tests")), {
                title: testTitle,
                materialId: selectedMaterial,
                studentId: id,
                teacherId: student?.assignedTeacherId || "",
                createdAt: new Date().toISOString(),
            });
            setModalOpen(false);
            toast.success("Test created successfully!");
        } catch (error) {
            console.error("Error creating test:", error);
            toast.error("Failed to create test");
        }
    };

    if (authLoading || loading) {
        return <div className="p-6">Loading student data...</div>;
    }

    if (!student) {
        return <div className="p-6">Student not found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/students" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Student Overview</h1>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${student.is_paid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {student?.status === "PAID" ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            PAID ACCOUNT
                        </span>
                    ) : (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                            UNPAID ACCOUNT
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1">
                    <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold mb-4">
                        {student.email?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{student.email}</h2>
                    <p className="text-gray-500 text-sm mb-6">Joined {student.created_at ? new Date(student.created_at).toLocaleDateString() : "-"}</p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Language Track</p>
                            <p className="font-medium">{student.language || "Not assigned"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Level</p>
                            <p className="font-medium">{student.level || "Not evaluated"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Teacher</p>
                            <p className="font-medium">{student.teacher_email || "None"}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setModalType("edit");
                            setModalOpen(true);
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-sm font-medium rounded-lg transition-colors"
                    >
                        Edit Profile
                    </button>

                    <button
                        onClick={() => {
                            setModalType("assign");
                            setModalOpen(true);
                        }}
                        className="w-full py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors"
                    >
                        Assign Material
                    </button>

                    <button
                        onClick={() => {
                            setModalType("test");
                            setModalOpen(true);
                        }}
                        className="w-full py-2 border border-purple-200 text-purple-600 hover:bg-purple-50 text-sm font-medium rounded-lg transition-colors"
                    >
                        Create Test
                    </button>
                </div>

                {/* Right Column: Activity & Marks */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">school</span>
                            Academic Performance (Marks & Tests)
                        </h3>

                        {submissions.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-sm text-gray-500">
                                        <th className="py-2 px-2">Test Entry</th>
                                        <th className="py-2 px-2">Submitted</th>
                                        <th className="py-2 px-2 text-center">Integrity</th>
                                        <th className="py-2 px-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((sub, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0">
                                            <td className="py-3 px-2 font-medium">
                                                {sub.assignments?.materials?.title || "Unknown Test"}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-500">
                                                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {sub.suspicious_flag ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                                        Flagged
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                        Clean
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button className="text-primary hover:underline text-sm font-medium">View Marks</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-8 text-center text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No tests taken yet.
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">folder_open</span>
                            Assigned Materials
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {allMaterials.length > 0 ? allMaterials.map(material => {
                                const isAccessible = accessibleMaterialIds.has(material.id);
                                const isToggling = togglingMaterial === material.id;
                                return (
                                    <div key={material.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{material.title || "Untitled"}</p>
                                            <p className="text-xs text-gray-500">{material.description || "Study Document"}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleMaterialAccess(material.id)}
                                            disabled={isToggling}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAccessible ? "bg-green-500" : "bg-gray-300"
                                                } ${isToggling ? "opacity-50 cursor-wait" : ""}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAccessible ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                );
                            }) : (
                                <div className="py-8 text-center text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    No materials exist.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-6">
                            {modalType === "edit" && "Edit Student Profile"}
                            {modalType === "assign" && "Assign Materials"}
                            {modalType === "test" && "Create Test"}
                        </h2>

                        {/* EDIT PROFILE FORM */}
                        {modalType === "edit" && (
                            <div className="flex flex-col gap-4">
                                <select
                                    className="border p-2 rounded-lg"
                                    onChange={(e) =>
                                        setStudent((prev: any) => ({
                                            ...prev,
                                            status: e.target.value
                                        }))
                                    }
                                    defaultValue={student?.status || "UNPAID"}
                                >
                                    <option value="PAID">Paid</option>
                                    <option value="UNPAID">Unpaid</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="Level"
                                    className="border p-2 rounded-lg"
                                    defaultValue={student?.level}
                                    onChange={(e) =>
                                        setStudent((prev: any) => ({
                                            ...prev,
                                            level: e.target.value
                                        }))
                                    }
                                />

                                <input
                                    type="text"
                                    placeholder="Assigned Teacher Email"
                                    className="border p-2 rounded-lg"
                                    defaultValue={student?.teacher_email}
                                    onChange={(e) =>
                                        setStudent((prev: any) => ({
                                            ...prev,
                                            teacher_email: e.target.value
                                        }))
                                    }
                                />

                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex-1"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleSendPasswordReset}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex-1 whitespace-nowrap"
                                    >
                                        Send Reset Email
                                    </button>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="bg-gray-300 px-4 py-2 rounded-lg flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ASSIGN MATERIAL FORM */}
                        {modalType === "assign" && (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto border p-2 rounded-lg">
                                    {allMaterials.map((material: any) => (
                                        <label key={material.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                value={material.id}
                                                checked={selectedMaterialsToAssign.has(material.id)}
                                                onChange={() => toggleMaterial(material.id)}
                                            />
                                            {material.title}
                                        </label>
                                    ))}
                                    {allMaterials.length === 0 && <span className="text-gray-500">No materials available.</span>}
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleAssignMaterials}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex-1"
                                    >
                                        Assign Selected
                                    </button>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="bg-gray-300 px-4 py-2 rounded-lg flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CREATE TEST FORM */}
                        {modalType === "test" && (
                            <div className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Test Title"
                                    className="border p-2 rounded-lg"
                                    onChange={(e) => setTestTitle(e.target.value)}
                                    value={testTitle}
                                />

                                <select
                                    className="border p-2 rounded-lg"
                                    onChange={(e) => setSelectedMaterial(e.target.value)}
                                    value={selectedMaterial}
                                >
                                    <option value="">Select Material</option>
                                    {allMaterials.map((material: any) => (
                                        <option key={material.id} value={material.id}>
                                            {material.title}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleCreateTest}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg flex-1"
                                    >
                                        Create Test
                                    </button>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="bg-gray-300 px-4 py-2 rounded-lg flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

