import React from 'react';

interface AchievementCardProps {
    year: string;
    text: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ year, text }) => {
    return (
        <div className="flex flex-col border-l-4 border-primary pl-6 py-2">
            <span className="text-3xl font-bold text-primary mb-2">{year}</span>
            <p className="text-gray-700 text-lg">{text}</p>
        </div>
    );
};
