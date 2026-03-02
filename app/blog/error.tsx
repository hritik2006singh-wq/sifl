"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BlogError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Blog Error Caught:", error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] w-full flex-col items-center justify-center bg-slate-50 text-center px-4 py-20">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Something went wrong with this post</h2>
            <p className="text-slate-500 mb-8 max-w-md">We encountered an issue while loading this content. Our team has been notified.</p>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-500 transition-colors"
                >
                    Try again
                </button>
                <Link href="/blog" className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                    Return to Blog Hub
                </Link>
            </div>
        </div>
    );
}
