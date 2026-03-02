import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Online Language Courses | A1 to C2 | SIFL',
    description: 'Learn German, French, or English online from anywhere. Intensive online language courses designed for global professionals.',
    alternates: {
        canonical: 'https://sifl.edu.in/online-courses'
    }
};

export const revalidate = 3600;

export default function OnlineCoursesIndex() {
    const courses = [
        { name: "German", slug: "german", subtitle: "A1 to C2 Online Mastery", img: "/images/programs/german.jpg", focus: "Global Professionals" },
        { name: "IELTS", slug: "ielts", subtitle: "Intensive Band 8+ Training", img: "/images/programs/english.jpg", focus: "International Students" },
        { name: "English", slug: "english", subtitle: "Business Communication", img: "/images/programs/english.jpg", focus: "Corporate Leaders" },
        { name: "French", slug: "french", subtitle: "DELF Online Certification", img: "/images/programs/french.jpg", focus: "Immigration Candidates" },
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="pt-32 pb-20 bg-slate-900 border-b border-slate-800 text-center px-6">
                <div className="max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm tracking-widest uppercase mb-4">
                        Global Online Training
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Online Language Courses</h1>
                    <p className="text-lg text-slate-400">
                        High-impact live sessions, interactive learning portals, and native-level certified trainers—accessible globally from your home.
                    </p>
                </div>
            </header>

            {/* Grid */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {courses.map((course) => (
                        <Link href={`/online-courses/${course.slug}`} key={course.slug} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="aspect-[4/3] bg-slate-200 relative" style={{ backgroundImage: `url(${course.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/10">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Now
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{course.name} Course</h3>
                                <p className="text-sm font-bold text-slate-500 mb-4">{course.subtitle}</p>
                                <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <span className="material-symbols-outlined text-[16px]">groups</span> Ideal for: {course.focus}
                                </div>
                                <span className="inline-flex items-center w-full justify-between gap-2 text-sm font-bold text-blue-600 group-hover:px-2 transition-all">
                                    View Syllabus <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
