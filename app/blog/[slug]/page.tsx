import { adminDb } from "@/lib/firebaseAdmin";
import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCTABlock from "@/components/BlogCTABlock";
import ShareButton from "@/components/ShareButton";

export const revalidate = 60; // Refresh cache every minute
export const dynamic = "force-dynamic";

type Props = {
    params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = params;

    try {
        if (!adminDb) return { title: 'SIFL Blog' };

        const snapshot = await adminDb
            .collection("blogs")
            .where("slug", "==", slug)
            .where("status", "==", "published")
            .limit(1)
            .get();

        if (snapshot.empty) {
            return { title: 'Not Found | SIFL Blog' };
        }

        const blog = snapshot.docs[0].data();

        return {
            title: `${blog.metaTitle || blog.title} | SIFL Insights`,
            description: blog.metaDescription || blog.excerpt || "Language learning insights from SIFL.",
            keywords: blog.keywords || ["language learning", "study abroad", "SIFL"],
            openGraph: {
                title: blog.metaTitle || blog.title,
                description: blog.metaDescription || blog.excerpt,
                images: blog.coverImageUrl ? [blog.coverImageUrl] : ["/images/hero/logo.jpg"],
                type: 'article',
                publishedTime: blog.publishedAt ? new Date(blog.publishedAt.toDate()).toISOString() : undefined,
            },
            alternates: {
                canonical: `https://sifl.edu.in/blog/${slug}`
            }
        };
    } catch (e) {
        return { title: 'SIFL Blog' };
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = params;

    let blogData: any = null;

    try {
        if (!adminDb) { notFound(); return; }

        const snapshot = await adminDb
            .collection("blogs")
            .where("slug", "==", slug)
            .where("status", "==", "published")
            .limit(1)
            .get();

        if (snapshot.empty) {
            notFound();
        }

        blogData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    } catch (error) {
        console.error("Error loading blog details:", error);
        notFound();
    }

    if (!blogData) notFound();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blogData.title ?? "",
        description: blogData.metaDescription || blogData.excerpt || "",
        image: blogData.coverImageUrl || "",
        datePublished: blogData.publishedAt ? new Date(blogData.publishedAt.toDate()).toISOString() : "",
        author: {
            '@type': 'Organization',
            name: 'SIFL'
        },
        publisher: {
            '@type': 'Organization',
            name: 'SIFL - Language Institute'
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-20 md:pt-24 pb-16 md:pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="max-w-4xl mx-auto px-6">
                <Link href="/blog" className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm tracking-widest uppercase mb-8 hover:text-emerald-500 transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to Blog Hub
                </Link>

                <header className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                        {blogData.title}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full overflow-hidden relative border border-slate-200">
                                <Image src="/images/hero/logo.jpg" alt="SIFL" fill className="object-cover" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">SIFL Team</p>
                                <p className="text-sm font-medium text-slate-500">
                                    {blogData.publishedAt ? new Date(blogData.publishedAt.toDate()).toLocaleDateString() : "Just Now"}
                                </p>
                            </div>
                        </div>
                        <ShareButton title={blogData.title} />
                    </div>
                </header>

                {blogData.coverImageUrl && (
                    <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-md bg-slate-200">
                        <Image src={blogData.coverImageUrl} alt={blogData.title} fill className="object-cover" priority />
                    </div>
                )}

                {blogData.excerpt && (
                    <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium mb-12 italic border-l-4 border-emerald-500 pl-6">
                        {blogData.excerpt}
                    </p>
                )}

                <div
                    className="prose prose-sm md:prose-lg leading-loose md:leading-relaxed prose-emerald max-w-none mb-16 md:mb-20
                               prose-headings:font-black prose-headings:tracking-tight 
                               prose-p:text-slate-700
                               prose-a:text-emerald-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:text-emerald-700 hover:prose-a:underline
                               prose-img:rounded-2xl prose-img:shadow-lg
                               prose-strong:text-slate-900"
                    dangerouslySetInnerHTML={{ __html: blogData.content }}
                />

                <BlogCTABlock />
            </article>
        </main>
    );
}
