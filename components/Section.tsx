import React, { ReactNode } from 'react';

interface SectionProps {
    children: ReactNode;
    className?: string;
    background?: 'white' | 'gray' | 'primary';
    spacing?: 'sm' | 'md' | 'lg' | 'none';
    id?: string;
}

export const Section: React.FC<SectionProps> = ({
    children,
    className = '',
    background = 'white',
    spacing = 'lg',
    id
}) => {
    const backgrounds = {
        white: 'bg-white',
        gray: 'bg-secondary',
        primary: 'bg-primary text-white'
    };

    const spacings = {
        none: '',
        sm: 'py-8 md:py-12',
        md: 'py-12 md:py-16',
        lg: 'py-16 md:py-24'
    };

    return (
        <section id={id} className={`${backgrounds[background]} ${spacings[spacing]} ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </section>
    );
};
