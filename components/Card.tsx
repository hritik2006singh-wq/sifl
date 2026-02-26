import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    onClick,
    hoverable = false
}) => {
    const baseStyles = 'bg-white rounded-card shadow-card overflow-hidden';
    const hoverStyles = hoverable ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-hover cursor-pointer' : '';

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
