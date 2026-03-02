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

      <div className="hidden md:block bg-white rounded-xl shadow-md border overflow-hidden">
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

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col space-y-4 mb-8">
        {materials.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base leading-tight break-words">{m.title}</h3>
              </div>
              {m.type === "video" ? (
                <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-xl shrink-0">video_file</span>
              ) : (
                <span className="material-symbols-outlined text-red-500 bg-red-50 p-2 rounded-xl shrink-0">picture_as_pdf</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Language</p>
                <p className="text-sm font-semibold text-gray-900">{m.language}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Level</p>
                <p className="text-sm font-semibold text-gray-900">{m.level}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {m.fileURL && (
                <a
                  href={m.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm font-bold bg-primary/10 text-primary py-2.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  View
                </a>
              )}
              {user?.role === "admin" && (
                <button
                  onClick={() => handleDelete(m.id)}
                  className="flex-[0.5] text-center px-2 text-sm font-bold bg-red-50 text-red-700 py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {materials.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
            No materials found.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm overflow-hidden w-full">
          <div className="bg-white w-full max-w-md shadow-2xl overflow-hidden rounded-t-[2rem] md:rounded-3xl mt-20 md:my-8 h-[calc(100vh-5rem)] md:h-auto flex flex-col animate-slide-up md:animate-none">
            <div className="px-6 py-5 md:py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 md:bg-white shrink-0">
              <h2 className="text-xl font-bold text-gray-800 m-0">Upload Material</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 bg-white size-8 flex items-center justify-center rounded-full shadow-sm md:shadow-none md:bg-transparent md:size-auto">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 flex-1 overflow-y-auto space-y-4 pb-32 md:pb-6">
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

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-0 md:pt-4 flex justify-end gap-3 z-40 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 md:flex-none px-6 py-3.5 md:py-2 text-base md:text-sm text-gray-600 hover:text-gray-900 font-bold md:font-medium transition border border-gray-200 md:border-transparent rounded-xl md:rounded-lg active:scale-95 md:active:scale-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white px-8 py-3.5 md:py-2 rounded-xl md:rounded-lg text-base md:text-sm font-bold md:font-medium transition shadow-sm active:scale-95 md:active:scale-100"
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