"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LeadCapture() {
    const [showExitModal, setShowExitModal] = useState(false);
    const [hasTriggeredExit, setHasTriggeredExit] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if device is mobile
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        // Desktop Exit Intent
        const handleMouseLeave = (e: MouseEvent) => {
            // If mouse leaves top edge, not triggered before, and on desktop
            if (e.clientY <= 0 && !hasTriggeredExit && window.innerWidth >= 768) {
                setShowExitModal(true);
                setHasTriggeredExit(true);
            }
        };

        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("resize", checkMobile);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [hasTriggeredExit]);

    return (
        <>
            {/* Mobile Sticky CTA */}
            {isMobile && (
                <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden animate-fade-in-up">
                    <Link href="/consultation" className="block w-full">
                        <button className="w-full bg-primary text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_10px_25px_rgba(0,77,51,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-transform border border-white/20">
                            <span className="text-lg">👉</span> Book Free Demo
                        </button>
                    </Link>
                </div>
            )}

            {/* Desktop Exit Intent Modal */}
            {showExitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center hidden md:flex">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowExitModal(false)}
                    />
                    <div className="relative bg-white rounded-3xl p-10 max-w-lg w-full mx-4 shadow-2xl animate-slide-in">
                        <button
                            onClick={() => setShowExitModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4">Wait! Before You Go...</h3>
                            <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                                Take the first step towards your global career. Schedule a 15-minute language roadmap session with our experts.
                            </p>

                            <Link href="/consultation" onClick={() => setShowExitModal(false)}>
                                <button className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-primary-hover transition-colors shadow-lg active:scale-95 text-lg">
                                    👉 Book Free Demo
                                </button>
                            </Link>

                            <button
                                onClick={() => setShowExitModal(false)}
                                className="mt-4 text-sm font-semibold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
