import React, { ReactNode } from 'react';
import { Card } from './Card';

interface DashboardCardProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '' }) => {
    return (
        <Card className={`p-6 ${className}`}>
            <h3 className="text-lg font-bold text-foreground mb-4 pb-4 border-b border-gray-100">{title}</h3>
            <div>{children}</div>
        </Card>
    );
};
