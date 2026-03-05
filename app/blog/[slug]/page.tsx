import { Metadata } from "next";
import { BlogService } from "@/lib/blogService";
import { notFound } from "next/navigation";
import Image from "next/image";

// ISR: Revalidate this page in the background every 1 hour
export const revalidate = 3600;

// Next.js 16 requires params to be a Promise
interface Props {
    params: Promise<{ slug: string }>;
}

// ── Generate Static Params at build time ──────────────────
export async function generateStaticParams() {
    const blogs = await BlogService.getPublishedBlogs();
    return blogs.map((blog) => ({
        slug: blog.slug,
    }));
}

// ── SEO Metadata ──────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const blog = await BlogService.getBlogBySlug(slug);

    if (!blog) {
        return {
            title: "Blog Not Found | SIFL",
            description: "The requested article could not be found.",
        };
    }

    return {
        title: `${blog.title} | SIFL`,
        description: blog.excerpt || `Read "${blog.title}" on the SIFL blog.`,
        openGraph: {
            title: blog.title,
            description: blog.excerpt || "",
            url: `https://sifl.edu.in/blog/${blog.slug}`,
            images: blog.coverImageUrl
                ? [{ url: blog.coverImageUrl, alt: blog.title }]
                : [],
            type: "article",
            // Safe: only call toDate() if the field is a real Timestamp
            publishedTime:
                blog.publishedAt && typeof blog.publishedAt.toDate === "function"
                    ? blog.publishedAt.toDate().toISOString()
                    : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: blog.title,
            description: blog.excerpt || "",
            images: blog.coverImageUrl ? [blog.coverImageUrl] : [],
        },
    };
}

// ── Page Component ────────────────────────────────────────
export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const blog = await BlogService.getBlogBySlug(slug);

    // TypeScript narrowing: after notFound() the function never returns,
    // but TS doesn't know that. We use a non-null type narrowing pattern below.
    if (!blog || blog.status !== "published") {
        notFound();
    }

    // After the notFound() guard, TS still sees blog as Blog | null.
    // The `!` assertion is safe here because notFound() throws (never returns).
    const safeBlog = blog!;

    // Safe date formatting — handles string, Timestamp, or undefined
    let publishedDate: string | null = null;
    if (safeBlog.publishedAt && typeof safeBlog.publishedAt.toDate === "function") {
        try {
            publishedDate = safeBlog.publishedAt.toDate().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            publishedDate = null;
        }
    }

    return (
        <article className="max-w-4xl mx-auto px-6 py-12">
            {/* Header */}
            <header className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                    {safeBlog.title}
                </h1>
                {publishedDate && (
                    <p className="text-gray-500 font-medium">
                        Published on {publishedDate}
                    </p>
                )}
            </header>

            {/* Hero Image */}
            {safeBlog.coverImageUrl && (
                <div className="relative w-full h-[400px] md:h-[500px] mb-12 rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                        src={safeBlog.coverImageUrl}
                        alt={safeBlog.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Blog Content — safe fallback if content is empty */}
            {safeBlog.content ? (
                <div
                    className="prose prose-lg md:prose-xl prose-emerald max-w-none prose-headings:font-bold prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: safeBlog.content }}
                />
            ) : (
                <p className="text-gray-400 text-center py-12">
                    This post has no content yet.
                </p>
            )}
        </article>
    );
}
