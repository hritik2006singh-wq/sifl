import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/markdown';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://sifl.edu.in';

    // Base Routes
    const staticRoutes = [
        '',
        '/study-abroad',
        '/online-courses',
        '/blog',
        '/ysifl',
        '/demo-booking',
        '/login'
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as any,
        priority: route === '' ? 1 : 0.9,
    }));

    // Dynamic Destinations
    const studyAbroadRoutes = ['germany', 'singapore', 'france', 'malaysia'].map((slug) => ({
        url: `${baseUrl}/study-abroad/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as any,
        priority: 0.8,
    }));

    // Dynamic Online Courses
    const onlineCourseRoutes = ['german', 'english', 'ielts', 'french'].map((slug) => ({
        url: `${baseUrl}/online-courses/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as any,
        priority: 0.8,
    }));

    // Dynamic Blogs mapping actual .mdx file nodes
    const blogPosts = getAllPosts(['slug', 'date']);
    const blogRoutes = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'yearly' as any,
        priority: 0.7,
    }));

    return [
        ...staticRoutes,
        ...studyAbroadRoutes,
        ...onlineCourseRoutes,
        ...blogRoutes,
    ];
}
