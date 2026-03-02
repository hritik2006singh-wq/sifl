import React, { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    error?: string;
    multiline?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    error,
    multiline = false,
    id,
    className = '',
    ...props
}) => {
    const inputId = id || (label || "").toLowerCase().replace(/\s+/g, '-');

    const baseClasses = `w-full px-4 py-3 rounded-btn border bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground ${error ? 'border-red-500' : 'border-gray-300'
        }`;

    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            <label htmlFor={inputId} className="mb-2 text-sm font-medium text-gray-700">
                {label}
            </label>
            {multiline ? (
                <textarea
                    id={inputId}
                    className={`${baseClasses} min-h-[120px] resize-y`}
                    {...(props as any)}
                />
            ) : (
                <input
                    id={inputId}
                    className={baseClasses}
                    {...(props as any)}
                />
            )}
            {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
        </div>
    );
};
