import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

if (typeof window !== "undefined") {
    throw new Error("Server-only code executed on client");
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

export function getPostSlugs() {
    if (!fs.existsSync(postsDirectory)) return [];
    return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx') || file.endsWith('.md'));
}

export function getPostBySlug(slug: string, fields: string[] = []) {
    const rawSlug = slug ?? "";
    let stringSlug = rawSlug.toString().trim();
    if (!stringSlug) return null;

    if (stringSlug.endsWith('.mdx')) stringSlug = stringSlug.slice(0, -4);
    else if (stringSlug.endsWith('.md')) stringSlug = stringSlug.slice(0, -3);

    const normalizedSlug = stringSlug;
    if (!normalizedSlug) return null;

    const fullPath = path.join(postsDirectory, `${normalizedSlug}.mdx`);
    const mdPath = path.join(postsDirectory, `${normalizedSlug}.md`);

    let fileContents = '';
    if (fs.existsSync(fullPath)) {
        fileContents = fs.readFileSync(fullPath, 'utf8');
    } else if (fs.existsSync(mdPath)) {
        fileContents = fs.readFileSync(mdPath, 'utf8');
    } else {
        console.warn(`[Markdown] File missing for slug: ${normalizedSlug}`);
        return null; // Skip file if missing
    }

    try {
        const { data, content } = matter(fileContents);

        // Validate required fields (title, date, content)
        if (!data.title || !data.date || !content) {
            console.warn(`[Markdown] Missing required fields in: ${normalizedSlug}`);
            return null; // Skip if invalid
        }

        // Default fallbacks
        const safeData: Record<string, any> = {
            ...data,
            title: data.title ?? "",
            description: data.description ?? "",
            date: data.date ?? "",
            image: data.image ?? "",
            author: data.author ?? "SIFL"
        };

        type Items = {
            [key: string]: string | any;
        };

        const items: Items = {};

        fields.forEach((field) => {
            if (field === 'slug') {
                items[field] = normalizedSlug;
            } else if (field === 'content') {
                items[field] = content;
            } else if (typeof safeData[field] !== 'undefined') {
                items[field] = safeData[field];
            }
        });

        return items;
    } catch (err) {
        console.error(`[Markdown] Error parsing matter for slug: ${normalizedSlug}`, err);
        return null;
    }
}

export function getAllPosts(fields: string[] = []) {
    const slugs = getPostSlugs();
    const posts = slugs
        .filter(Boolean)
        .map((slug) => getPostBySlug(slug, fields))
        .filter((post): post is Exclude<typeof post, null> => post !== null && typeof post.slug !== "undefined")
        .sort((post1, post2) => ((post1?.date ?? '') > (post2?.date ?? '') ? -1 : 1));
    return posts ?? [];
}
