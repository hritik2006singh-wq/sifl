import React from 'react';

interface ProgressBarProps {
    progress: number;
    label?: string;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, className = '' }) => {
    const safeProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-xs font-bold text-primary">{safeProgress}%</span>
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${safeProgress}%` }}
                ></div>
            </div>
        </div>
    );
};
