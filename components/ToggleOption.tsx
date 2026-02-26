import React from 'react';

export interface ToggleOptionItem {
    id: string;
    label: string;
}

interface ToggleOptionProps {
    options: ToggleOptionItem[];
    selectedId: string;
    onChange: (id: string) => void;
    className?: string;
}

export const ToggleOption: React.FC<ToggleOptionProps> = ({ options, selectedId, onChange, className = '' }) => {
    return (
        <div className={`flex p-1 bg-gray-100 rounded-btn ${className}`}>
            {options.map((option) => {
                const isSelected = selectedId === option.id;
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange(option.id)}
                        className={`flex-1 py-2 text-sm font-medium rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${isSelected
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};
