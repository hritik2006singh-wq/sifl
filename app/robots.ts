import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/student/',
                '/teacher/',
                '/api/'
            ],
        },
        sitemap: 'https://sifl.edu.in/sitemap.xml',
    };
}
