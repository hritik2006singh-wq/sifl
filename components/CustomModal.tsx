import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface CustomModalProps {
    type: "success" | "error";
    message: string;
    onClose: () => void;
    title?: string;
    autoCloseMs?: number;
}

export default function CustomModal({
    type,
    message,
    onClose,
    title,
    autoCloseMs = 0,
}: CustomModalProps) {
    useEffect(() => {
        if (autoCloseMs > 0 && type === "success") {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseMs);
            return () => clearTimeout(timer);
        }
    }, [autoCloseMs, onClose, type]);

    const isSuccess = type === "success";

    return (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className={`bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border-2 ${isSuccess ? "border-emerald-100" : "border-red-100"
                    }`}
            >
                <div className="relative p-6 pt-8 pb-6 flex flex-col items-center text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div
                        className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isSuccess ? "bg-emerald-100 text-emerald-500" : "bg-red-100 text-red-500"
                            }`}
                    >
                        {isSuccess ? <CheckCircle size={32} /> : <XCircle size={32} />}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title || (isSuccess ? "Success!" : "Action Failed")}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-base shadow-sm hover:shadow-md transition-all active:scale-95 ${isSuccess
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        {isSuccess ? "Awesome" : "Try Again"}
                    </button>
                </div>
            </div>
        </div>
    );
}
