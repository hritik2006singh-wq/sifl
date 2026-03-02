import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Static Data Prototype
const courseData: Record<string, any> = {
    german: {
        name: "German",
        title: "Learn German Online | A1 to C2 Classes | SIFL",
        desc: "Master German online with certified trainers. Structured A1 to C2 Goethe-Zertifikat preparation for international students and professionals.",
        duration: "8-12 Weeks per Level",
        cert: "CEFR A1 to C2 / Goethe",
        target: "Global Professionals & Students",
        heroImg: "/images/programs/german.jpg",
    },
    english: {
        name: "Business English",
        title: "Business English Classes Online | Corporate Fluency | SIFL",
        desc: "Upgrade your global career with online Business English classes. Focus on presentations, cross-cultural communication, and leadership syntax.",
        duration: "10 Weeks",
        cert: "Corporate Proficiency",
        target: "Global Leaders & Managers",
        heroImg: "/images/programs/english.jpg",
    },
    ielts: {
        name: "IELTS",
        title: "Online IELTS Preparation | Band 7.5+ Target | SIFL",
        desc: "Intensive online IELTS preparation. Expert guidance on Writing, Speaking, Listening, and Reading. Join students securing Band 8.0+ globally.",
        duration: "6 Weeks Fast-Track",
        cert: "IELTS Academic/General",
        target: "University Applicants & PR seekers",
        heroImg: "/images/programs/english.jpg",
    },
    french: {
        name: "French",
        title: "Learn French Online | DELF Certification Preparation | SIFL",
        desc: "Structured online French classes focusing on DELF A1-B2 certification required for Canadian PR and Top European Universities.",
        duration: "8-12 Weeks per Level",
        cert: "CEFR A1 to B2 / DELF",
        target: "Immigration Candidates",
        heroImg: "/images/programs/french.jpg",
    }
};

type Props = {
    params: { language: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const safeLang = (params?.language || "").toLowerCase();
    const data = courseData[safeLang];
    if (!data) return { title: "Course Not Found" };

    return {
        title: data.title,
        description: data.desc,
        alternates: {
            canonical: `https://sifl.edu.in/online-courses/${params.language}`
        }
    };
}

export default function OnlineLanguagePage({ params }: Props) {
    if (!params?.language) { notFound(); }
    const safeLang = (params.language || "").toLowerCase();
    const data = courseData[safeLang];
    if (!data) return <div className="p-20 text-center text-3xl font-bold">Course Not Found</div>;

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="pt-32 pb-24 md:pt-40 md:pb-32 bg-slate-900 border-b border-slate-800 text-center px-6">
                <div className="max-w-4xl mx-auto relative z-10">
                    <Link href="/online-courses" className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm tracking-widest uppercase mb-6 hover:text-blue-300">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        All Online Courses
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
                        Online {data.name} Course
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        {data.desc}
                    </p>
                </div>
            </header>

            <section className="py-20 px-6 max-w-5xl mx-auto -mt-16 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
                    <div className="grid md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        <div className="text-center md:text-left pt-6 md:pt-0">
                            <span className="material-symbols-outlined text-3xl text-blue-600 mb-2">schedule</span>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Duration</h3>
                            <p className="text-xl font-black text-slate-900 mt-1">{data.duration}</p>
                        </div>
                        <div className="text-center md:pl-8 pt-6 md:pt-0">
                            <span className="material-symbols-outlined text-3xl text-blue-600 mb-2">workspace_premium</span>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Certification</h3>
                            <p className="text-xl font-black text-slate-900 mt-1">{data.cert}</p>
                        </div>
                        <div className="text-center md:pl-8 pt-6 md:pt-0">
                            <span className="material-symbols-outlined text-3xl text-blue-600 mb-2">public</span>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Target Audience</h3>
                            <p className="text-xl font-black text-slate-900 mt-1">{data.target}</p>
                        </div>
                    </div>
                </div>

                <div className="prose prose-lg prose-blue max-w-none mt-16">
                    <h2>Master {data.name} Online</h2>
                    <p>
                        Location should not limit your potential. SIFL brings its highly successful structured linguistic methodology
                        entirely online. Engage in intensive, live, interactive sessions modeled exactly after our physical classrooms.
                    </p>

                    <h3>Interactive Course Structure</h3>
                    <ul>
                        <li><strong>Live Audio-Visual Training:</strong> No pre-recorded monologues. 100% live faculty interaction.</li>
                        <li><strong>Digital Material Access:</strong> SIFL Student Dashboard provides 24/7 access to assignments and notes.</li>
                        <li><strong>Continuous Assessment:</strong> Regular spoken checks and mock exams tracking real-world readiness.</li>
                    </ul>

                    <div className="mt-12 bg-blue-50 rounded-3xl p-8 border border-blue-100 text-center md:text-left flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Start Learning {data.name} Today</h3>
                            <p className="text-slate-600">Join our next online induction batch and accelerate your global career from anywhere in the world.</p>
                        </div>
                        <Link href="/demo-booking" className="whitespace-nowrap px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:-translate-y-1 transition-all">
                            Book Free Demo
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
