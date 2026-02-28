import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-btn tracking-wide';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-sm hover:shadow',
        secondary: 'bg-secondary text-foreground hover:bg-gray-200 focus:ring-gray-300',
        outline: 'border border-primary text-primary hover:bg-gray-50 focus:ring-primary',
        ghost: 'bg-transparent text-foreground hover:bg-secondary focus:ring-gray-200'
    };

    // Compact, premium sizes
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'w-full md:w-auto px-5 py-2 text-sm',
        lg: 'w-full md:w-auto px-7 py-2.5 text-base'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};
