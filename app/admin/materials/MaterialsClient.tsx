"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import toast from "react-hot-toast";
import { useAdminGuard } from "@/hooks/useRoleGuard";

export default function MaterialsClient() {
  const { user, loading: authLoading } = useAdminGuard();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [fileHandle, setFileHandle] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileHandle(e.dataTransfer.files[0]);
    }
  };

  // 🔹 Fetch Materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const q = query(collection(db, "studyMaterials"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setMaterials(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch materials");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMaterials();
  }, [user]);

  // 🔹 Upload Handler (R2)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileHandle || !title || !language || !level) {
      return toast.error("Please fill all fields");
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", fileHandle);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const fileURL = data.url;

      const isVideo =
        fileHandle.type.includes("video") ||
        fileHandle.name.toLowerCase().endsWith(".mp4");

      const materialType = isVideo ? "video" : "pdf";

      const docRef = await addDoc(collection(db, "studyMaterials"), {
        title,
        language,
        level,
        type: materialType,
        fileURL,
        uploadedBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });

      setMaterials((prev) => [
        {
          id: docRef.id,
          title,
          language,
          level,
          type: materialType,
          fileURL,
        },
        ...prev,
      ]);

      toast.success("Material uploaded successfully");

      setUploading(false);
      setShowModal(false);

      setTitle("");
      setLanguage("");
      setLevel("");
      setFileHandle(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  // 🔹 Delete (Firestore only for now)
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;

    try {
      await deleteDoc(doc(db, "studyMaterials", id));
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success("Deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  if (authLoading || loading) {
    return <div className="p-6">Loading materials...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition shadow-sm"
        >
          Upload Material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Title</th>
              <th className="p-4 font-semibold text-gray-700">Language</th>
              <th className="p-4 font-semibold text-gray-700">Level</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-t hover:bg-gray-50 hover:scale-[1.01] transition duration-200">
                <td className="p-4">{m.title}</td>
                <td className="p-4">{m.language}</td>
                <td className="p-4">{m.level}</td>
                <td className="p-4 text-right space-x-4">
                  {m.fileURL && (
                    <a
                      href={m.fileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      View
                    </a>
                  )}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-500 hover:text-red-700 font-medium transition"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Upload Material</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-primary focus:border-primary transition"
              />

              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setLevel("");
                }}
                className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-primary focus:border-primary transition"
              >
                <option value="" disabled>Select Language</option>
                <option value="German">German</option>
                <option value="English">English</option>
                <option value="Japanese">Japanese</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 border-gray-300 focus:ring-primary focus:border-primary transition"
                disabled={!language}
              >
                <option value="" disabled>Select Level</option>
                {language === "Japanese" ? (
                  <>
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </>
                ) : (
                  <>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </>
                )}
              </select>

              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all bg-gray-50/50 cursor-pointer ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,video/mp4,video/*"
                  onChange={(e) =>
                    setFileHandle(e.target.files ? e.target.files[0] : null)
                  }
                />
                <div className="size-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                </div>
                {fileHandle ? (
                  <p className="font-bold text-gray-900 text-sm text-center break-all">{fileHandle.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-900">Drag & Drop your file here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}