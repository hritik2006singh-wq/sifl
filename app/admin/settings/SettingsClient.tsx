"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/lib/firebase-client";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAdminGuard } from "@/hooks/useRoleGuard";
import { updatePassword } from "firebase/auth";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
    return centerCrop(
        makeAspectCrop({ unit: "%", width: 50 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

async function getCroppedBlob(
    image: HTMLImageElement,
    crop: Crop
): Promise<Blob | null> {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCropX = (crop.unit === "%" ? (crop.x / 100) * image.width : crop.x) * scaleX;
    const pixelCropY = (crop.unit === "%" ? (crop.y / 100) * image.height : crop.y) * scaleY;
    const pixelCropW = (crop.unit === "%" ? (crop.width / 100) * image.width : crop.width) * scaleX;
    const pixelCropH = (crop.unit === "%" ? (crop.height / 100) * image.height : crop.height) * scaleY;

    canvas.width = pixelCropW;
    canvas.height = pixelCropH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(image, pixelCropX, pixelCropY, pixelCropW, pixelCropH, 0, 0, pixelCropW, pixelCropH);
    return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92)
    );
}

export default function SettingsClient() {
    const { user, loading: authLoading } = useAdminGuard();

    // Form States
    const [adminName, setAdminName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Global Settings
    const [allowRegistration, setAllowRegistration] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");

    // Profile Picture State
    const [profileImage, setProfileImage] = useState("");
    const [showCropModal, setShowCropModal] = useState(false);
    const [imgSrc, setImgSrc] = useState("");
    const [crop, setCrop] = useState<Crop>();
    const imgRef = useRef<HTMLImageElement>(null);
    const [uploadingPfp, setUploadingPfp] = useState(false);

    // Logo upload
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // UI states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const fetchSettings = async () => {
            if (user) {
                setAdminName(user.name || "");
                setEmail(user.email || "");
            }

            // Fetch profile image
            if (user?.uid) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setProfileImage(userDoc.data()?.profileImage || "");
                    }
                } catch { /* ignore */ }
            }

            try {
                const settingsDoc = await getDoc(doc(db, "institute_settings", "global"));
                if (settingsDoc.exists()) {
                    const data = settingsDoc.data();
                    setAllowRegistration(data.allow_registration ?? true);
                    setMaintenanceMode(data.maintenance_mode ?? false);
                    setLogoUrl(data.logo_url || "");
                }
            } catch (err) {
                console.error("Error fetching global settings:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSettings();
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage({ text: "", type: "" });
        try {
            await updateDoc(doc(db, "users", user.uid), {
                name: adminName,
            });

            if (newPassword.trim() && user.auth) {
                await updatePassword(user.auth, newPassword);
                setNewPassword("");
            }

            setMessage({ text: "Profile updated successfully.", type: "success" });
        } catch (err: any) {
            console.error(err);
            setMessage({ text: err.message || "Failed to update profile.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setMessage({ text: "", type: "" });
        try {
            await updateDoc(doc(db, "institute_settings", "global"), {
                allow_registration: allowRegistration,
                maintenance_mode: maintenanceMode
            });
            setMessage({ text: "Platform settings updated.", type: "success" });
        } catch (err: any) {
            console.error(err);
            setMessage({ text: err.message || "Failed to update settings.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    // ── Profile Picture Upload ─────────────────────────────────────────────
    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage({ text: "Please select an image file.", type: "error" });
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setMessage({ text: "Image must be less than 50 MB.", type: "error" });
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setImgSrc(reader.result?.toString() || "");
            setShowCropModal(true);
        });
        reader.readAsDataURL(file);
        e.target.value = ""; // reset so same file can be re-selected
    };

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
        imgRef.current = e.currentTarget;
    }, []);

    const handleCropUpload = async () => {
        if (!imgRef.current || !crop) return;
        setUploadingPfp(true);
        setMessage({ text: "", type: "" });

        try {
            const croppedBlob = await getCroppedBlob(imgRef.current, crop);
            if (!croppedBlob) throw new Error("Failed to crop image");

            // Get presigned URL from our API
            const presignRes = await fetch("/api/upload-profile-picture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: `admin-${user.uid}.jpg`,
                    contentType: "image/jpeg",
                }),
            });
            const presignData = await presignRes.json();
            if (!presignRes.ok || !presignData.success) {
                throw new Error(presignData.error || "Failed to get upload URL");
            }

            // Upload to R2
            await fetch(presignData.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": "image/jpeg" },
                body: croppedBlob,
            });

            // Save URL to Firestore
            const publicUrl = presignData.publicUrl;
            await updateDoc(doc(db, "users", user.uid), { profileImage: publicUrl });

            // Also try to update admins collection if it exists
            try {
                await updateDoc(doc(db, "admins", user.uid), { profileImage: publicUrl });
            } catch { /* admins doc may not exist */ }

            setProfileImage(publicUrl);
            setShowCropModal(false);
            setImgSrc("");
            setMessage({ text: "Profile picture updated!", type: "success" });
        } catch (err: any) {
            console.error("Profile picture upload error:", err);
            setMessage({ text: err.message || "Failed to upload profile picture.", type: "error" });
        } finally {
            setUploadingPfp(false);
        }
    };

    // ── Logo Upload ────────────────────────────────────────────────────────
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        setMessage({ text: "", type: "" });
        try {
            // Use presigned URL via the general upload-profile-picture route (or generate-upload-url)
            const presignRes = await fetch("/api/generate-upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: `logo_${Date.now()}_${file.name}`,
                    contentType: file.type,
                }),
            });
            const presignData = await presignRes.json();
            if (!presignRes.ok || !presignData.success) {
                throw new Error(presignData.error || "Failed to get upload URL");
            }

            await fetch(presignData.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            await updateDoc(doc(db, "institute_settings", "global"), {
                logo_url: presignData.publicUrl,
            });

            setLogoUrl(presignData.publicUrl);
            setMessage({ text: "Logo uploaded and saved successfully.", type: "success" });
        } catch (err: any) {
            console.error("Error uploading logo:", err);
            setMessage({ text: "Failed to upload logo.", type: "error" });
        } finally {
            setUploadingLogo(false);
        }
    };

    if (authLoading || loading) {
        return <div className="p-8">Loading settings...</div>;
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Institute Settings</h1>
                <p className="text-gray-500 mt-1">Manage your admin profile and global platform preferences.</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Admin Profile
                    </h2>

                    {/* Profile Picture Section */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-2 border-gray-200">
                                    <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="pfp-input"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary font-bold text-xs rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                                Change Profile Picture
                            </label>
                            <input
                                id="pfp-input"
                                type="file"
                                accept="image/*"
                                onChange={onSelectFile}
                                className="hidden"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Max 50MB, image files only</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={adminName}
                                onChange={e => setAdminName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Read-only)</label>
                            <input
                                type="email"
                                disabled
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                value={email}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Leave blank to keep current"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>

                {/* Platform Settings */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">toggle_on</span>
                            Platform Preferences
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Allow Public Registration</p>
                                    <p className="text-xs text-gray-500">Enable or disable new student signups</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={allowRegistration} onChange={e => setAllowRegistration(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Maintenance Mode</p>
                                    <p className="text-xs text-gray-500">Block student/teacher access temporarily</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={e => setMaintenanceMode(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                </label>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Preferences"}
                            </button>
                        </div>
                    </div>

                    {/* Logo Branding */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">imagesmode</span>
                            Branding Rules
                        </h2>

                        <div className="space-y-4">
                            {logoUrl && (
                                <div className="mb-4">
                                    <p className="text-sm font-bold text-gray-700 mb-2">Current Logo</p>
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-w-[200px]">
                                        <img src={logoUrl} alt="Institute Logo" className="w-full h-auto" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    disabled={uploadingLogo}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                                />
                                {uploadingLogo && <p className="text-sm text-blue-600 mt-2 font-medium">Uploading...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                IMAGE CROP MODAL
            ══════════════════════════════════════════════════════════════ */}
            {showCropModal && imgSrc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold border-b pb-2">Crop Profile Picture</h3>
                        <p className="text-sm text-gray-500">Drag to select the area you want as your profile picture.</p>

                        <div className="flex items-center justify-center bg-gray-50 rounded-xl border p-2">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    alt="Preview"
                                    style={{ maxHeight: "400px", maxWidth: "100%" }}
                                />
                            </ReactCrop>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { setShowCropModal(false); setImgSrc(""); }}
                                className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50"
                                disabled={uploadingPfp}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCropUpload}
                                disabled={uploadingPfp}
                                className="flex-1 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                            >
                                {uploadingPfp ? "Uploading..." : "Save Profile Picture"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
