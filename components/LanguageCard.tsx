import React from 'react';
import { Card } from './Card';
import Image from 'next/image';

interface LanguageCardProps {
    title: string;
    level: string;
    description: string;
    image: string;
    duration?: string;
    features?: string[];
    className?: string;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
    title,
    level,
    description,
    image,
    duration,
    features,
    className = ''
}) => {
    return (
        <Card className={`flex flex-col h-full ${className}`} hoverable>
            <div className="relative h-48 w-full bg-gray-200">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary">
                    {level}
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                {duration && (
                    <p className="text-sm font-medium text-gray-500 mb-3">{duration}</p>
                )}
                <p className="text-gray-600 flex-grow mb-4">{description}</p>

                {features && features.length > 0 && (
                    <ul className="space-y-2 mb-6 border-t border-gray-100 pt-4">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-600">
                                <span className="text-accent mr-2 mt-0.5">•</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-auto">
                    <span className="text-primary font-medium hover:underline cursor-pointer">Learn more &rarr;</span>
                </div>
            </div>
        </Card>
    );
};
