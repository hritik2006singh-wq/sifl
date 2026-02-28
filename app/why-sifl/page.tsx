import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Why SIFL | The Structured Advantage",
    description: "Discover the structured teaching philosophy, measurable outcomes, and certified trainers at SIFL.",
};

export default function WhySIFLPage() {
    return (
        <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
            <div className="mx-auto max-w-4xl px-6">

                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
                        Why Students Choose <span className="text-primary">SIFL</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        We operate on a single philosophy: Language learning should not be random. It must be systematically structured to ensure you achieve your career or academic goals abroad.
                    </p>
                </div>

                {/* Structured Blocks */}
                <div className="space-y-8">

                    {/* Block 1: Teaching Methodology */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-3xl">architecture</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4">Engineered Teaching Methodology</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Our curriculum isn't just a collection of vocabulary words. We use an engineered, CEFR-aligned immersion approach that builds syntax and instinct simultaneously.
                            </p>
                            <ul className="space-y-2 mt-4">
                                <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Active Recall Integration
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Scenario-Based Immersion
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Block 2: Measurable Outcomes */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-3xl">trending_up</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4">Measurable Outcomes</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Every minute spent in our classrooms maps to a quantifiable outcome. We prepare you strictly for official certifications like IELTS, Goethe, DELF, and JLPT.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-3xl font-black text-primary mb-1">98%</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">First-Attempt Pass Rate</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-3xl font-black text-primary mb-1">100+</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Students Abroad</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block 3: Trainer Authority */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4">Trainer Authority</h2>
                            <p className="text-slate-600 leading-relaxed">
                                You are taught exclusively by certified linguistic professionals with years of pedagogical experience. Our faculty undergoes rigorous continuous assessment to ensure cutting-edge instructional delivery.
                            </p>
                        </div>
                    </div>

                    {/* Block 4: Long-Term Career Alignment */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4">Long-Term Career Alignment</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                SIFL is an educational launchpad. We align your linguistic training strictly with the requirements of top global employers and premier universities in Germany, Singapore, and Malaysia.
                            </p>
                            <Link
                                href="/consultation"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-primary-hover transition-all active:scale-95"
                            >
                                👉 Book Free Demo
                            </Link>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
