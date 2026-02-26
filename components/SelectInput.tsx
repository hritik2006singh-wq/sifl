import React, { SelectHTMLAttributes } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: SelectOption[];
    error?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
    label,
    options,
    error,
    id,
    className = '',
    ...props
}) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            <label htmlFor={selectId} className="mb-2 text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="relative">
                <select
                    id={selectId}
                    className={`appearance-none w-full px-4 py-3 bg-white border rounded-btn text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all pr-10 whitespace-normal leading-normal ${error ? 'border-red-500' : 'border-gray-300'
                        }`}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-gray-900 py-2">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};
