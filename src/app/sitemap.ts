import { MetadataRoute } from 'next';
// We would usually fetch dynamic data here, but for now we'll start with static pages
// import { getCategories } from '@/lib/categories';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.dolpagu.com';

  // Core static routes
  const routes = ['', '/login', '/signup', '/services', '/request', '/cs'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Note: Add dynamic routes for Categories and Services here once API is ready
  // const categories = ...

  return [...routes];
}
