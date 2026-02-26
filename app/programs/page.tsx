import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { LanguageCard } from '@/components/LanguageCard';
import { programsContent } from '@/content/programs';

export default function ProgramsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-grow">
                {/* HERO */}
                <Section background="gray" className="text-center pt-24 pb-20 border-b border-gray-100">
                    <h1 className="text-5xl font-extrabold text-foreground tracking-tight mb-6">
                        {programsContent.hero.title}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        {programsContent.hero.subtitle}
                    </p>
                </Section>

                {/* HIGHLIGHTED PROGRAMS */}
                <Section spacing="lg">
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold border-l-4 border-primary pl-4 mb-8">Flagship Programs</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {programsContent.highlighted.map((program) => (
                                <LanguageCard
                                    key={program.id}
                                    title={program.title}
                                    level={program.level}
                                    duration={program.duration}
                                    description={program.description}
                                    image={program.image}
                                    features={program.features}
                                    className="shadow-md hover:shadow-xl transition-shadow"
                                />
                            ))}
                        </div>
                    </div>
                </Section>

                {/* OTHER PROGRAMS GRID */}
                <Section background="gray">
                    <h2 className="text-3xl font-bold border-l-4 border-primary pl-4 mb-8">Additional Languages</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {programsContent.otherPrograms.map((program) => (
                            <LanguageCard
                                key={program.id}
                                title={program.title}
                                level={program.level}
                                description={program.description}
                                image={program.image}
                            />
                        ))}
                    </div>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
