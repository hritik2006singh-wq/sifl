"use client";

import { useEffect, useState } from "react";

export default function ShareButton({ title }: { title: string }) {
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
            setCanShare(true);
        }
    }, []);

    const handleShare = async () => {
        if (canShare && navigator.share) {
            try {
                await navigator.share({
                    title,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy text", err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 md:bg-white md:border md:border-slate-200 hover:bg-slate-200 md:hover:bg-slate-50 text-slate-700 rounded-full text-sm font-bold transition-colors w-full md:w-auto mt-6 md:mt-0 active:scale-95"
            type="button"
        >
            <span className="material-symbols-outlined text-[18px]">share</span>
            {canShare ? "Share Article" : "Copy Link"}
        </button>
    );
}
