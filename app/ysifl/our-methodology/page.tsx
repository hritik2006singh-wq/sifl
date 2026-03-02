import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Our Methodology | SIFL',
    description: 'Explore our structured curriculum framework, CEFR progression model, and career roadmap planning.',
};

export default function MethodologyPage() {
    return (
        <main className="min-h-screen bg-slate-50 overflow-hidden">
            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-slate-900">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
                    <Link href="/ysifl" className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-widest uppercase mb-6 hover:text-emerald-300 transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Why SIFL
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Methodology</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-300 font-medium">
                        A rigorous, scientifically-designed pedagogical framework that transforms absolute beginners into confident, certified bilingual professionals.
                    </p>
                </div>
            </section>

            <section className="py-24 px-6">
                <div className="mx-auto max-w-4xl space-y-16">

                    {/* 1. Structured Curriculum Framework */}
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl">account_tree</span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Structured Curriculum Framework</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Our curriculum is modular and deeply integrated. We don't teach isolated vocabulary. We teach contextual application. Every unit is mapped to real-world scenarios—from navigating an airport to defending a thesis or leading a corporate boardroom meeting. The framework continuously cycles through Spoken, Written, Auditory, and Reading proficiencies to ensure holistic linguistic development.
                            </p>
                        </div>
                    </div>

                    {/* 2. Level Progression Model */}
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl">trending_up</span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">CEFR Level Progression (A1 → C2)</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                We rigorously align with the Common European Framework of Reference for Languages (CEFR).
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="font-black text-emerald-600 w-12 text-center">A1/A2</span>
                                    <span className="text-slate-700 font-medium">Basic User: Foundation, everyday expressions, and survival syntax.</span>
                                </li>
                                <li className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="font-black text-emerald-600 w-12 text-center">B1/B2</span>
                                    <span className="text-slate-700 font-medium">Independent User: Conversational fluency, professional environments, and technical discussions.</span>
                                </li>
                                <li className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="font-black text-emerald-600 w-12 text-center">C1/C2</span>
                                    <span className="text-slate-700 font-medium">Proficient User: Near-native complexities, academic writing, and leadership communication.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 3. Assessment Model */}
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl">fact_check</span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Dynamic Assessment Model</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We evaluate students continually, not just at the end of a module. Our assessment model includes bi-weekly verbal checkpoints, spontaneous conversational evaluations, and rigorous written milestones. Before you sit for an international exam like IELTS, Goethe-Zertifikat, or JLPT, you will have successfully cleared our internal mock simulations that are graded 15% stricter than the real boards.
                            </p>
                        </div>
                    </div>

                    {/* 4. Teaching Pedagogy */}
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl">psychology</span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Active Teaching Pedagogy</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Our trainers are facilitators of immersion. We apply the 80/20 rule: Students speak 80% of the time, trainers guide for 20%.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Classrooms are highly interactive, utilizing shadowing techniques to perfect accents, role-play scenarios to build fast reflex responses, and immediate error correction without breaking conversational flow to sustain confidence.
                            </p>
                        </div>
                    </div>

                    {/* 5. Classroom Tech Integration */}
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl">devices</span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Classroom Tech Integration</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We utilize a premium Learning Management System seamlessly integrated into our Student Dashboard. From interactive Drag-and-Drop material assignments to live Google Meet integrations, digital whiteboards, and real-time attendance tracking, the technology operates invisibly to remove friction from your learning experience. Students can access premium resources, track past live sessions, and view upcoming milestones 24/7.
                            </p>
                        </div>
                    </div>

                    {/* 6. Career Roadmap Planning */}
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl">explore</span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">Career Roadmap Planning</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Fluent language is just the tool; the career is the goal. For every student targeting B2 or higher, our mentors sit down and build a bespoke multi-year career roadmap. We help profile matching for foreign universities, assist with motivational letter generation, verify documentation requirements, and prepare you for embassy visa interviews in the native language.
                            </p>
                        </div>
                    </div>

                </div>

                <div className="mx-auto max-w-4xl mt-16 text-center">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">Ready to experience this methodology firsthand?</h3>
                    <Link href="/demo-booking" className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 text-lg">
                        Book a Free Trial Session
                    </Link>
                </div>
            </section>
        </main>
    );
}
