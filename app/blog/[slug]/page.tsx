import Link from "next/link";
import { Metadata } from "next";
import { getPostBySlug, getAllPosts } from "@/lib/markdown";
import { marked } from "marked";
import BlogCTABlock from "@/components/BlogCTABlock";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Props = {
    params: { slug: string }
};

export async function generateStaticParams() {
    const posts = getAllPosts(['slug']);
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (!params?.slug) return {};
    const post = getPostBySlug(params.slug, ['title', 'description', 'date', 'image']);
    if (!post || !post.title) return {};

    return {
        title: `${post.title} | SIFL Blog`,
        description: post.description,
        alternates: {
            canonical: `https://sifl.edu.in/blog/${params.slug}`
        },
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: new Date(post.date).toISOString(),
            images: [post.image],
        }
    };
}

export default async function BlogPost({ params }: Props) {
    if (!params?.slug) notFound();
    const post = getPostBySlug(params.slug, ['title', 'description', 'date', 'image', 'author', 'content']);
    if (!post || !post.title) notFound();

    const contentHtml = await marked.parse(post.content);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        image: `https://sifl.edu.in${post.image}`,
        datePublished: new Date(post.date).toISOString(),
        author: {
            '@type': 'Organization',
            name: post.author || 'SIFL'
        },
        publisher: {
            '@type': 'Organization',
            name: 'SIFL - Language Institute'
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-20">
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
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 border-b border-slate-200 pb-8">
                        <div className="size-12 rounded-full overflow-hidden relative">
                            <Image src="/images/hero/logo.jpg" alt="SIFL" fill className="object-cover" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{post.author}</p>
                            <p className="text-sm font-medium text-slate-500">{post.date}</p>
                        </div>
                    </div>
                </header>

                {post.image && (
                    <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-md">
                        <Image src={post.image} alt={post.title} fill className="object-cover" priority />
                    </div>
                )}

                <div
                    className="prose prose-lg prose-emerald max-w-none mb-16"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                />

                <BlogCTABlock />
            </article>
        </main>
    );
}
