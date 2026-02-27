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
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-btn';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
        secondary: 'bg-secondary text-foreground hover:bg-gray-200 focus:ring-gray-300',
        outline: 'border-2 border-primary text-primary hover:bg-gray-50 focus:ring-primary',
        ghost: 'bg-transparent text-foreground hover:bg-secondary focus:ring-gray-200'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'w-full md:w-auto px-6 py-3 text-base',
        lg: 'w-full md:w-auto px-8 py-4 text-lg'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};
