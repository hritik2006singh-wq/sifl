import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Why SIFL? | Professional Language Institute',
    description: 'Discover the SIFL Advantage: Structured methodologies, certified trainers, and global career pathways.',
};

export default function YSIFLPage() {
    return (
        <main className="min-h-screen bg-slate-50 overflow-hidden">
            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-slate-900 border-b border-slate-800">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent blur-3xl mix-blend-screen" />
                <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm tracking-widest uppercase mb-6 border border-emerald-500/30">
                        The SIFL Difference
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                        Engineering Fluency for <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                            Global Careers
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-300 font-medium mb-10">
                        SIFL isn't just a language institute; it's a launchpad for your international journey. With certified trainers and career-focused curriculum, we ensure your success abroad.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/demo-booking" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95">
                            Book a Free Demo
                        </Link>
                        <Link href="/programs" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-xl transition-all active:scale-95">
                            Explore Programs
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- Global Success Section (Phase 6) --- */}
            <section className="py-16 bg-white relative -mt-10 mx-6 md:mx-auto max-w-5xl rounded-3xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[300px] -translate-y-20 translate-x-20">public</span>
                </div>
                <div className="px-8 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100 relative z-10">
                    <div className="text-center md:text-left pt-6 md:pt-0">
                        <p className="text-4xl font-black text-emerald-600 mb-1">100+</p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Students Abroad</p>
                    </div>
                    <div className="text-center md:pl-8 pt-6 md:pt-0">
                        <p className="text-4xl font-black text-slate-900 mb-1">95%</p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Visa Success Rate</p>
                    </div>
                    <div className="text-center md:pl-8 pt-6 md:pt-0">
                        <p className="text-4xl font-black text-slate-900 mb-1">1-on-1</p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Career Mentorship</p>
                    </div>
                    <div className="text-center md:pl-8 pt-6 md:pt-0">
                        <p className="text-lg font-black text-slate-900 leading-tight mb-2">Germany, Singapore,<br />Malaysia, France</p>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center justify-center md:justify-start gap-1">
                            <span className="material-symbols-outlined text-[14px]">flight_takeoff</span>
                            Destinations
                        </p>
                    </div>
                </div>
            </section>

            {/* --- Methodology & Philosophy --- */}
            <section className="py-24 px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
                                <img src="/brand/faculty/member-1.jpg" alt="Teaching Philosophy" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <h3 className="text-2xl font-black text-white mb-2">Our Vision</h3>
                                    <p className="text-slate-200 text-sm font-medium">To dissolve language barriers entirely, enabling brilliant minds to thrive in any global market without linguistic limits.</p>
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-emerald-100 rounded-full blur-3xl -z-10" />
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Teaching Philosophy & Pedagogy</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                We reject rote memorization. Our philosophy is rooted in active immersion, cognitive mapping, and immediate practical application. Every lesson is designed to mirror real-world professional environments.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: 'Interactive Immersion', desc: 'Classrooms function exclusively in the target language to accelerate cognitive adaptation.' },
                                    { title: 'Trainer Qualification Standards', desc: 'All faculty hold internationally recognized certifications (C1/C2) and undergo rigorous pedagogical training.' },
                                    { title: 'Career-Aligned Syntax', desc: 'Vocabulary and grammatical structures are mapped directly to your professional domain.' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <span className="flex size-8 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center shadow-sm border border-emerald-100">
                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-slate-600 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <Link href="/ysifl/our-methodology" className="inline-flex items-center gap-2 font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all">
                                    Read Depth Methodology
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Student Journey Timeline --- */}
            <section className="py-24 bg-slate-900 px-6 text-white">
                <div className="mx-auto max-w-4xl text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4">Student Journey Timeline</h2>
                    <p className="text-slate-400 text-lg">A predictable, structured pathway from absolute beginner to globally placed professional.</p>
                </div>

                <div className="mx-auto max-w-5xl relative">
                    <div className="absolute left-1/2 -ml-px w-0.5 h-full bg-slate-800 hidden md:block" />
                    <div className="space-y-12 relative z-10">
                        {[
                            { step: '01', title: 'Aptitude & Goal Mapping', desc: 'We assess your current level and identify the exact linguistic requirements for your target university or employer.' },
                            { step: '02', title: 'Foundation Building (A1-A2)', desc: 'Mastering the core mechanics of the language. Building structural confidence in reading, writing, and speaking.' },
                            { step: '03', title: 'Professional Fluency (B1-B2)', desc: 'Transitioning to complex sentence structures, industry-specific vocabulary, and spontaneous conversational fluency.' },
                            { step: '04', title: 'International Exam Prep', desc: 'Rigorous simulation of global standardized tests (IELTS, Goethe, JLPT, DELF) to ensure first-attempt clearance.' },
                            { step: '05', title: 'Global Placement Assistance', desc: '1-on-1 interview prep, resume localization, and direct assistance with university/visa applications.' },
                        ].map((item, idx) => (
                            <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="flex-1 text-center md:text-left" style={{ textAlign: idx % 2 === 0 ? 'left' : 'right' }}>
                                    <h4 className="text-2xl font-bold mb-2">{item.title}</h4>
                                    <p className="text-slate-400">{item.desc}</p>
                                </div>
                                <div className="size-16 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    <span className="text-xl font-black text-emerald-400">{item.step}</span>
                                </div>
                                <div className="flex-1 hidden md:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Bottom CTA --- */}
            <section className="py-24 px-6 bg-emerald-50 text-center">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Experience the SIFL Advantage</h2>
                    <p className="text-lg text-slate-600 mb-10">Stop delaying your global dreams. Join 100+ professionals who have successfully migrated through our programs.</p>
                    <Link href="/demo-booking" className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xl hover:shadow-emerald-600/30 transition-all active:scale-95 text-lg">
                        Schedule Your Free Demo
                    </Link>
                </div>
            </section>
        </main>
    );
}
