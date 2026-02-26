import React from 'react';

interface CalendarSelectorProps {
    selectedDate: string;
    onSelect: (date: string) => void;
    className?: string;
}

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({ selectedDate, onSelect, className = '' }) => {
    // Simple implementation for UI reference
    return (
        <div className={`w-full ${className}`}>
            <label className="block mb-2 text-sm font-medium text-gray-700">Select Date</label>
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-btn text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
        </div>
    );
};
