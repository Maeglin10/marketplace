import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/', '/orders', '/messages', '/profile', '/favorites', '/disputes'],
      },
    ],
    sitemap: 'https://aevia-skymarket.vercel.app/sitemap.xml',
  };
}
