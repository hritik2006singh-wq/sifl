import Link from "next/link";
import React from "react";

interface ProgramViewProps {
    language: string;
    duration: string;
    levelBreakdown: string[];
    curriculumOverview: string;
    teachingMethod: string;
    timeline: { step: string; desc: string }[];
}

export default function ProgramView({
    language,
    duration,
    levelBreakdown,
    curriculumOverview,
    teachingMethod,
    timeline,
}: ProgramViewProps) {
    return (
        <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/programs" className="text-primary hover:underline mb-8 inline-block font-semibold">
                    &larr; Back to Programs
                </Link>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{language} Program</h1>
                    <p className="text-lg text-slate-600 mb-8">{curriculumOverview}</p>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                Duration
                            </h3>
                            <p className="text-slate-700">{duration}</p>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">school</span>
                                Teaching Method
                            </h3>
                            <p className="text-slate-700">{teachingMethod}</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">Level Breakdown</h2>
                    <div className="flex flex-wrap gap-3 mb-12">
                        {levelBreakdown.map((level, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full font-bold text-sm">
                                {level}
                            </span>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold mb-6">Learning Timeline</h2>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {timeline.map((item, idx) => (
                            <div key={idx} className="relative flex flex-col md:flex-row items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-300 group-hover:bg-primary group-hover:scale-110 transition-all text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                    {idx + 1}
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm md:group-odd:text-right group-hover:border-primary/30 transition-colors">
                                    <h4 className="font-bold text-lg text-slate-900">{item.step}</h4>
                                    <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link href="/consultation" className="inline-block w-full md:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                            Enroll Now
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
