import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { FacultyCard } from '@/components/FacultyCard';
import { AchievementCard } from '@/components/AchievementCard';
import { aboutContent } from '@/content/about';

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-grow">
                {/* HERO */}
                <Section background="gray" className="text-center pt-24 pb-20">
                    <h1 className="text-5xl font-extrabold text-foreground tracking-tight mb-6">
                        {aboutContent.hero.title}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        {aboutContent.hero.subtitle}
                    </p>
                </Section>

                {/* MISSION & VISION */}
                <Section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        <div className="bg-primary/5 p-10 rounded-card border border-primary/10">
                            <h2 className="text-3xl font-bold text-primary mb-4">{aboutContent.missionVision.mission.title}</h2>
                            <p className="text-gray-700 text-lg leading-relaxed">{aboutContent.missionVision.mission.description}</p>
                        </div>
                        <div className="bg-gray-50 p-10 rounded-card border border-gray-100">
                            <h2 className="text-3xl font-bold text-foreground mb-4">{aboutContent.missionVision.vision.title}</h2>
                            <p className="text-gray-700 text-lg leading-relaxed">{aboutContent.missionVision.vision.description}</p>
                        </div>
                    </div>
                </Section>

                {/* FACULTY GRID */}
                <Section background="gray">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold mb-4">{aboutContent.faculty.title}</h2>
                        <p className="text-lg text-gray-600">{aboutContent.faculty.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {aboutContent.faculty.members.map((member, idx) => (
                            <FacultyCard key={idx} {...member} />
                        ))}
                    </div>
                </Section>

                {/* ACHIEVEMENTS GRID */}
                <Section>
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">{aboutContent.achievements.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                            {aboutContent.achievements.items.map((item, idx) => (
                                <AchievementCard key={idx} year={item.year} text={item.text} />
                            ))}
                        </div>
                    </div>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
