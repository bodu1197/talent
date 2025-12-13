import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.dolpagu.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/mypage/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
