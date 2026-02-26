import React from 'react';
import { Card } from './Card';
import Image from 'next/image';

interface FacultyCardProps {
    name: string;
    role: string;
    image: string;
    credentials?: string;
}

export const FacultyCard: React.FC<FacultyCardProps> = ({ name, role, image, credentials }) => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-token overflow-hidden mb-6 rounded-card shadow-card relative">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover"
                />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
            <p className="text-primary font-medium mb-1">{role}</p>
            {credentials && <p className="text-gray-500 text-sm">{credentials}</p>}
        </div>
    );
};
