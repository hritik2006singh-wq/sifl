"use client";

import { useState, Suspense } from "react";
import { auth } from "@/lib/firebase-client";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { UserService } from "@/services/user.service";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let user;

        // 1️⃣ STEP: Firebase Authentication
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            user = userCredential.user;
        } catch (authError: any) {
            console.error("Authentication failed:", authError);

            if (authError.code === "auth/user-not-found") {
                setError("User does not exist.");
            } else if (authError.code === "auth/wrong-password") {
                setError("Incorrect password.");
            } else if (authError.code === "auth/invalid-credential") {
                setError("Invalid email or password.");
            } else if (authError.code === "auth/invalid-email") {
                setError("Invalid email format.");
            } else if (authError.code === "auth/too-many-requests") {
                setError("Too many attempts. Try again later.");
            } else {
                setError("Authentication failed. Please try again.");
            }

            setLoading(false);
            return;
        }

        // 2️⃣ STEP: Fetch profile from users/{uid}
        let profile;
        try {
            profile = await UserService.getUserProfile(user.uid);

            if (!profile) {
                // User exists in Auth but has no Firestore profile
                await signOut(auth);
                setError("Account profile not found. Contact administration.");
                setLoading(false);
                return;
            }

            // Status Guard: Block suspended accounts
            const status = profile.status ?? "active";
            if (status !== "active") {
                await signOut(auth);
                if (status === "suspended") {
                    setError("Your account has been temporarily suspended.");
                } else {
                    setError(`Account status: ${status}. Access denied.`);
                }
                setLoading(false);
                return;
            }
        } catch (profileError: any) {
            console.error("Profile fetch failed:", profileError);
            setError("Failed to load account profile. Please try again.");
            await signOut(auth);
            setLoading(false);
            return;
        }

        // 3️⃣ STEP: Role-Based Routing
        const role = profile.role ?? "student";
        document.cookie = `user_role=${role}; path=/; max-age=2592000; SameSite=Strict`;

        if (role === "admin") {
            router.push("/admin");
        } else if (role === "teacher") {
            router.push("/teacher");
        } else {
            router.push("/student");
        }
    };

    return (
        <>
            <div className="text-center mb-8">
                <Link
                    href="/"
                    className="inline-block text-2xl font-bold text-primary mb-2 tracking-tight"
                >
                    SIFL
                </Link>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Sign in to access your dashboard
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl text-sm text-center">
                        {message}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 flex justify-center items-center rounded-xl bg-primary text-white text-sm font-semibold shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                    &larr; Back to Home
                </Link>
            </div>
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen py-24 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                    <LoginContent />
                </Suspense>
            </div>
        </div>
    );
}
