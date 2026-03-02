import Link from "next/link";
import { Metadata } from "next";
import { getAllPosts } from "@/lib/markdown";
import Image from "next/image";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata: Metadata = {
    title: 'Language Learning & Study Abroad Insights | SIFL Blog',
    description: 'Expert insights on studying abroad, mastering German and English, IELTS bands, and navigating international careers.',
    alternates: {
        canonical: 'https://sifl.edu.in/blog'
    }
};

export default function BlogIndexPage() {
    const articles = getAllPosts(['slug', 'title', 'description', 'date', 'image', 'author']);

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="pt-28 pb-16 md:pt-32 md:pb-20 bg-slate-900 border-b border-slate-800 text-center px-6">
                <div className="max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm tracking-widest uppercase mb-4">
                        Insights Hub
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Language & Global Career Insights</h1>
                    <p className="text-lg text-slate-400">
                        Everything you need to know about international certification, visa linguistic requirements, and mastering global languages.
                    </p>
                </div>
            </header>

            <section className="py-16 md:py-20 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <Link href={`/blog/${article.slug}`} key={article.slug} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="relative aspect-[16/9] w-full bg-slate-100">
                                {article.image && (
                                    <Image
                                        src={article.image}
                                        alt={article.title || "Blog article"}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                )}
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <span className="text-xs font-bold text-slate-400 mb-3">{article.date || ""} • {article.author || "SIFL"}</span>
                                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-3">{article.title || "Untitled Insight"}</h3>
                                <p className="text-sm font-medium text-slate-600 mb-6 flex-1 line-clamp-3">{article.description || ""}</p>
                                <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:px-2 transition-all">
                                    Read Full Insight <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                    {articles.length === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20">
                            <p className="text-slate-500">More insights coming soon.</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
