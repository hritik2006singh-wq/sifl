"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
            <p className="text-gray-500 mb-8 max-w-md">Our engineering team has been notified. We apologize for the inconvenience.</p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-500 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
