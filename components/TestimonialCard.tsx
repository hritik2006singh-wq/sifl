import React from 'react';
import { Card } from './Card';
import Image from 'next/image';

interface TestimonialCardProps {
    name: string;
    program: string;
    quote: string;
    image: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, program, quote, image }) => {
    return (
        <Card className="p-8">
            <div className="flex items-center mb-6">
                <Image
                    src={image}
                    alt={name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover mr-4"
                />
                <div>
                    <h4 className="font-bold text-foreground">{name}</h4>
                    <p className="text-sm text-gray-500">{program}</p>
                </div>
            </div>
            <p className="text-gray-700 italic">"{quote}"</p>
        </Card>
    );
};
