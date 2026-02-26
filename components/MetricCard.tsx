import React from 'react';
import { Card } from './Card';

interface MetricCardProps {
    value: string;
    label: string;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ value, label, className = '' }) => {
    return (
        <Card className={`p-8 text-center border border-gray-100 ${className}`} hoverable>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{value}</div>
            <div className="text-gray-600 font-medium">{label}</div>
        </Card>
    );
};
