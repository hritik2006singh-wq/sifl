import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Study Abroad Destinations | SIFL',
    description: 'Prepare for your global future. Explore study abroad destinations, visa requirements, and language prerequisites for Indian students.',
    alternates: {
        canonical: 'https://sifl.edu.in/study-abroad'
    }
};

export const revalidate = 3600;

export default function StudyAbroadIndex() {
    const destinations = [
        { name: "Germany", slug: "germany", subtitle: "Engineering & Innovation Hub", img: "/images/programs/german.jpg", language: "German A1-C1" },
        { name: "France", slug: "france", subtitle: "Business & Arts Excellence", img: "/images/programs/french.jpg", language: "French DELF" },
        { name: "Singapore", slug: "singapore", subtitle: "Asian Financial Center", img: "/images/programs/english.jpg", language: "IELTS 6.5+" },
        { name: "Malaysia", slug: "malaysia", subtitle: "Emerging Tech Hub", img: "/images/programs/japanese.jpg", language: "IELTS 6.0+" },
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="pt-32 pb-20 bg-slate-900 border-b border-slate-800 text-center px-6">
                <div className="max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm tracking-widest uppercase mb-4">
                        For Indian Students
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Study Abroad Programs</h1>
                    <p className="text-lg text-slate-400">
                        Launch your international career. Master the language requirements, understand the visa process, and join 100+ SIFL alumni successfully placed abroad.
                    </p>
                </div>
            </header>

            {/* Grid */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {destinations.map((dest) => (
                        <Link href={`/study-abroad/${dest.slug}`} key={dest.slug} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="aspect-[4/3] bg-slate-200" style={{ backgroundImage: `url(${dest.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <div className="p-6">
                                <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">Study in {dest.name}</h3>
                                <p className="text-sm font-bold text-slate-500 mb-4">{dest.subtitle}</p>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-emerald-600 text-sm">checklist</span>
                                    <span className="text-sm font-semibold text-slate-700">Req: {dest.language}</span>
                                </div>
                                <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                                    View Requirements <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
