"use client";

import { useEffect, useState, useRef, use } from "react";
import { auth, db } from "@/lib/firebase-admin";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/CustomModal";

export default function StudentTestPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [suspiciousCount, setSuspiciousCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [testStarted, setTestStarted] = useState(false);
    const [modalInfo, setModalInfo] = useState<{ type: "success" | "error", message: string, title?: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && testStarted) {
                setSuspiciousCount(c => c + 1);
                setModalInfo({
                    type: "error",
                    title: "Security Warning",
                    message: "WARNING: Leaving the test tab is prohibited. This incident has been recorded as suspicious activity."
                });
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [testStarted]);

    const startTest = async () => {
        if (containerRef.current) {
            try {
                await containerRef.current.requestFullscreen();
                setTestStarted(true);
            } catch (err) {
                setModalInfo({
                    type: "error",
                    title: "Fullscreen Required",
                    message: "Failed to enter fullscreen mode. Please ensure your browser allows fullscreen."
                });
            }
        }
    };

    const submitTest = async () => {
        setSubmitting(true);

        const user = auth.currentUser;
        if (user) {
            try {
                await addDoc(collection(db, "assignment_submissions"), {
                    assignment_id: id,
                    student_id: user.uid,
                    suspicious_flag: suspiciousCount > 0,
                    submitted_at: new Date().toISOString()
                });
            } catch (err) {
                console.error("Error submitting test", err);
            }
        } else {
            setModalInfo({
                type: "error",
                message: "Error: You are not logged in."
            });
            return;
        }

        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }

        setSubmitting(false);
        setModalInfo({
            type: "success",
            title: "Test Complete",
            message: "Test submitted successfully!"
        });
    };

    const handleModalClose = () => {
        if (modalInfo?.type === "success") {
            router.push("/student/assignments");
        }
        setModalInfo(null);
    };

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center" ref={containerRef}>
                {!testStarted ? (
                    <div>
                        <h1 className="text-3xl font-bold mb-4">Final Language Evaluation</h1>
                        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                            This test requires Full Screen mode. Changing tabs, closing the window, or exiting full screen will flag your test for suspicious activity.
                        </p>
                        <button
                            onClick={startTest}
                            className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                        >
                            Enter Fullscreen & Start Test
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full min-h-[80vh] bg-white flex flex-col pt-8">
                        <div className="flex justify-between items-center mb-8 px-8 border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold">Language Evaluation</h2>
                            <div className="flex items-center gap-4">
                                {suspiciousCount > 0 && (
                                    <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                        Flags: {suspiciousCount}
                                    </span>
                                )}
                                <div className="text-xl font-mono bg-gray-100 px-4 py-2 rounded-lg">45:00</div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 text-left space-y-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">1. Translate the following sentence: "The quick brown fox."</h3>
                                <textarea className="w-full border rounded-xl p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-primary/20" placeholder="Type your answer here..."></textarea>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">2. Write a short paragraph introducing yourself.</h3>
                                <textarea className="w-full border rounded-xl p-4 min-h-[150px] outline-none focus:ring-2 focus:ring-primary/20" placeholder="Type your answer here..."></textarea>
                            </div>

                            {!isFullscreen && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-bold text-center my-6">
                                    WARNING: You exited Full Screen mode! This is recorded as a violation.
                                    <button onClick={startTest} className="ml-4 underline">Return to Full Screen</button>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={submitTest}
                                disabled={submitting}
                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-70"
                            >
                                {submitting ? "Submitting..." : "Submit Final Answers"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {modalInfo && (
                <CustomModal
                    type={modalInfo.type}
                    title={modalInfo.title}
                    message={modalInfo.message}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}
