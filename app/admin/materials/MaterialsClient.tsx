"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase-client";
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
import { useAdminGuard } from "@/hooks/useRoleGuard";
import CustomModal from "@/components/CustomModal";

const levelMap: Record<string, string[]> = {
  German: ["A1", "A2", "B1", "B2", "C1", "C2"],
  Japanese: ["N5", "N4", "N3", "N2", "N1"],
  English: ["Beginner", "Intermediate", "Advanced"],
  French: ["A1", "A2", "B1", "B2", "C1", "C2"],
  Spanish: ["A1", "A2", "B1", "B2", "C1", "C2"]
};

export default function MaterialsClient() {
  const { user, loading: authLoading } = useAdminGuard();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalState, setModalState] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
    title?: string;
  }>({ show: false, type: "success", message: "" });

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload Progress State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("0 MB/s");
  const [uploadEta, setUploadEta] = useState("Calculating...");
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // Preview Modal
  const [previewMaterial, setPreviewMaterial] = useState<any>(null);

  // Selected State
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [title, setTitle] = useState("");

  const [fileHandle, setFileHandle] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const closeModal = () => setModalState({ ...modalState, show: false });

  // 🔹 Fetch Global Materials
  useEffect(() => {
    fetchMaterials();
  }, [selectedLanguage, selectedLevel]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      // Perform client-side filtering since firestore requires complex composite indexing for multiple wheres + orderby
      let filtered = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      if (selectedLanguage) {
        filtered = filtered.filter((m: any) => m.language === selectedLanguage);
      }
      if (selectedLevel) {
        filtered = filtered.filter((m: any) => m.level === selectedLevel);
      }

      setMaterials(filtered);
    } catch (err) {
      console.error(err);
      setModalState({ show: true, type: "error", message: "Failed to load materials.", title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  // Hierarchy Handlers
  const handleLangChange = (lang: string) => {
    setSelectedLanguage(lang);
    setSelectedLevel(""); // Reset level on language change
  };

  // File Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileHandle(e.dataTransfer.files[0]);
    }
  };

  // 🔹 Upload Handler via XHR & Presigned URL
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileHandle || !title || !selectedLanguage || !selectedLevel) {
      return setModalState({ show: true, type: "error", message: "Please complete all required fields.", title: "Missing Fields" });
    }

    const MAX_MB = 1500; // Increased abstractly since direct upload scales higher
    if (fileHandle.size > MAX_MB * 1024 * 1024) {
      return setModalState({ show: true, type: "error", message: `File exceeds ${MAX_MB}MB limit.`, title: "File Too Large" });
    }

    const validMime = ["video/mp4", "application/pdf"];
    if (!validMime.includes(fileHandle.type)) {
      return setModalState({ show: true, type: "error", message: "Only MP4 videos and PDF documents are allowed.", title: "Invalid File" });
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadSpeed("0 MB/s");
      setUploadEta("Calculating...");

      // 1. Get Signed URL
      const presignRes = await fetch("/api/generate-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: fileHandle.name,
          contentType: fileHandle.type,
          language: selectedLanguage,
          level: selectedLevel
        })
      });
      const presignData = await presignRes.json();

      if (!presignRes.ok || !presignData.success) {
        throw new Error(presignData.error || "Failed to generate security upload URL");
      }

      // 2. Direct XMLHttpRequest Upload
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        const startTime = Date.now();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);

            const timeElapsed = (Date.now() - startTime) / 1000;
            if (timeElapsed > 0) {
              const speedBps = event.loaded / timeElapsed;
              const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);
              setUploadSpeed(`${speedMbps} MB/s`);

              const remainingBytes = event.total - event.loaded;
              const etaSeconds = remainingBytes / speedBps;

              if (etaSeconds > 60) {
                setUploadEta(`${Math.ceil(etaSeconds / 60)} mins left`);
              } else {
                setUploadEta(`${Math.ceil(etaSeconds)} secs left`);
              }
            }
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // 3. Save directly to Firestore after confirming upload
              const fileType = fileHandle.type.includes("video") ? "video" : "pdf";
              await addDoc(collection(db, "materials"), {
                title,
                language: selectedLanguage,
                level: selectedLevel,
                fileUrl: presignData.publicUrl,
                objectKey: presignData.key,
                fileType,
                fileSize: fileHandle.size,
                createdAt: serverTimestamp(),
              });

              setModalState({ show: true, type: "success", message: "Material uploaded securely.", title: "Success" });
              setShowUploadModal(false);
              setTitle("");
              setFileHandle(null);
              fetchMaterials();
              resolve();
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error("Failed to upload file to storage bucket."));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during direct upload."));
        xhr.onabort = () => reject(new Error("Upload cancelled."));

        xhr.open("PUT", presignData.uploadUrl, true);
        xhr.setRequestHeader("Content-Type", fileHandle.type);
        xhr.send(fileHandle);
      });

    } catch (err: any) {
      if (err.message !== "Upload cancelled.") {
        console.error(err);
        setModalState({ show: true, type: "error", message: err.message || "An unexpected error occurred during upload.", title: "Upload Failed" });
      } else {
        setModalState({ show: true, type: "error", message: "Upload was manually cancelled.", title: "Upload Paused" });
      }
    } finally {
      setUploading(false);
      xhrRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  };

  // 🔹 Delete
  const handleDelete = async (material: any) => {
    try {
      setDeletingId(material.id);

      // 1. Delete R2 File
      if (material.objectKey) {
        const response = await fetch("/api/delete-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objectKey: material.objectKey, key: material.objectKey })
        });
        const resData = await response.json();

        if (!response.ok || !resData.success) {
          throw new Error(resData.error || "Failed to delete storage file.");
        }
      }

      // 2. Delete Firestore Document natively
      await deleteDoc(doc(db, "materials", material.id));
      setMaterials((prev) => prev.filter((m) => m.id !== material.id));

    } catch (err: any) {
      console.error(err);
      setModalState({ show: true, type: "error", message: err.message || "Failed to properly clean up the file.", title: "Delete Error" });
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) return <div className="p-6 text-center text-gray-500 mt-12">Loading Admin Interface...</div>;

  const availableLevelsForFilter = selectedLanguage ? levelMap[selectedLanguage] || [] : [];
  const availableLevelsForUpload = selectedLanguage ? levelMap[selectedLanguage] || [] : [];

  return (
    <div className="space-y-6">
      {modalState.show && (
        <CustomModal
          type={modalState.type}
          message={modalState.message}
          title={modalState.title}
          onClose={closeModal}
          autoCloseMs={modalState.type === "success" ? 3000 : 0}
        />
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
          <div className="absolute top-4 right-6 flex gap-4">
            <button
              onClick={() => setPreviewMaterial(null)}
              className="bg-white/10 hover:bg-white/30 text-white rounded-full size-12 flex items-center justify-center transition-all backdrop-blur-md border border-white/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="w-full max-w-6xl h-[90vh] flex flex-col mt-12 p-4">
            <div className="text-white mb-4">
              <h3 className="text-2xl font-bold">{previewMaterial.title}</h3>
              <p className="text-white/60 text-sm font-semibold tracking-wider uppercase">{previewMaterial.fileType} • {(previewMaterial.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <div className="flex-1 bg-black/50 rounded-2xl overflow-hidden shadow-2xl border border-white/10 min-h-[300px] md:min-h-[500px]">
              {previewMaterial.fileType === "video" ? (
                <video controls controlsList="nodownload" className="w-full h-full min-h-[300px] object-contain">
                  <source src={previewMaterial.fileUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe src={`${previewMaterial.fileUrl}#toolbar=0`} className="w-full h-full border-none bg-white object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Study Materials</h1>
          <p className="text-gray-500 font-medium">Upload via direct XHR to unified flat storage architecture.</p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 flex items-center justify-center gap-2 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">cloud_upload</span> Upload File
        </button>
      </div>

      {/* Structure Selectors / Filter */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">Filter Language</label>
          <select className="w-full border p-3 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" value={selectedLanguage} onChange={e => handleLangChange(e.target.value)}>
            <option value="">All Languages</option>
            {Object.keys(levelMap).map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">Filter Level</label>
          <select className="w-full border p-3 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-50" value={selectedLevel} disabled={!selectedLanguage} onChange={e => setSelectedLevel(e.target.value)}>
            <option value="">All Levels</option>
            {availableLevelsForFilter.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setSelectedLanguage(""); setSelectedLevel(""); }}
          className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors w-full md:w-auto"
        >
          Reset
        </button>
      </div>

      {/* Materials Area */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black tracking-tight">Library Documents</h2>
        </div>

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-primary">
            <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="font-bold">Syncing Database...</p>
          </div>
        )}

        {!loading && materials.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">folder_open</span>
            <p className="font-bold text-gray-900">No Content Found</p>
            <p className="text-sm">Change filters or upload new material.</p>
          </div>
        ) : !loading && (
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {materials.map(m => (
              <li key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-primary/20 hover:shadow-md transition-all group bg-white cursor-pointer" onClick={() => setPreviewMaterial(m)}>
                <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                  {m.fileType === "video" ? (
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">play_circle</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate mb-1 pr-4 group-hover:text-primary transition-colors">{m.title}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">{m.language || "Unknown"}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-md">{m.level || "Unknown"}</span>
                      <span className="text-gray-400 shrink-0">• {(m.fileSize / (1024 * 1024)).toFixed(1)}MB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={deletingId === m.id}
                    onClick={(e) => { e.stopPropagation(); handleDelete(m); }}
                    className="h-10 px-4 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {deletingId === m.id ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden rounded-3xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold text-gray-800 m-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                Upload Material
              </h2>
              <button
                type="button"
                onClick={() => { if (!uploading) setShowUploadModal(false) }}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 size-8 flex items-center justify-center rounded-full disabled:opacity-20 border bg-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Content Title</label>
                  <input
                    type="text" required placeholder="Naming your file clearly..."
                    value={title} onChange={(e) => setTitle(e.target.value)} disabled={uploading}
                    className="w-full border rounded-xl px-4 py-3 border-gray-300 focus:ring-2 focus:ring-primary/20 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Language</label>
                    <select
                      required className="w-full border rounded-xl px-4 py-3 border-gray-300 focus:ring-2 focus:ring-primary/20 outline-none transition bg-white"
                      value={selectedLanguage} onChange={(e) => { setSelectedLanguage(e.target.value); setSelectedLevel(""); }} disabled={uploading}
                    >
                      <option value="">Choose Map</option>
                      {Object.keys(levelMap).map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Target Level</label>
                    <select
                      required className="w-full border rounded-xl px-4 py-3 border-gray-300 focus:ring-2 focus:ring-primary/20 outline-none transition bg-white disabled:bg-gray-50"
                      value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} disabled={uploading || !selectedLanguage}
                    >
                      <option value="">Target Floor</option>
                      {availableLevelsForUpload.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Attached Source Document</label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-gray-50/50 cursor-pointer ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40'} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" required={!fileHandle} className="hidden" ref={fileInputRef} accept="application/pdf,video/mp4" onChange={(e) => setFileHandle(e.target.files ? e.target.files[0] : null)} disabled={uploading} />

                  {fileHandle ? (
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex items-center gap-4 w-full justify-center">
                        <div className={`p-4 rounded-xl ${fileHandle.type.includes('video') ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                          <span className="material-symbols-outlined text-3xl">{fileHandle.type.includes('video') ? 'videocam' : 'picture_as_pdf'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{fileHandle.name}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{(fileHandle.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFileHandle(null) }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="size-14 rounded-full bg-white border shadow-sm text-gray-400 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-2xl">attach_file</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Click or drag Drop PDF/MP4 here</p>
                      <p className="text-xs font-medium text-gray-500">Unlimited size directly bound to Cloudflare R2.</p>
                    </>
                  )}
                </div>
              </div>

              {/* PROGRESS OVERLAY WHEN UPLOADING */}
              {uploading && (
                <div className="bg-gray-50 p-4 border rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-black text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] animate-bounce">sync_alt</span>
                      Uploading directly to Storage...
                    </span>
                    <span className="text-xl font-black text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner mb-3">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out flex items-center justify-end pr-2 relative overflow-hidden"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-[progress_1s_linear_infinite]" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span><span className="material-symbols-outlined text-[12px] inline-block align-middle mr-1">speed</span>{uploadSpeed}</span>
                    <span><span className="material-symbols-outlined text-[12px] inline-block align-middle mr-1">timer</span>{uploadEta}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                {uploading ? (
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="px-6 py-3 text-sm text-red-600 font-bold bg-red-50 rounded-xl hover:bg-red-100 flex-1 transition-colors flex justify-center items-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Cancel Upload
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => setShowUploadModal(false)}
                      className="px-6 py-3 text-sm text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 flex-1 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-sm font-bold flex-1 transition-all flex justify-center items-center gap-2 active:scale-95"
                    >
                      Publish Now
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}