import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/app/'],
      },
    ],
    sitemap: 'https://notes2cards.study/sitemap.xml',
    host: 'https://notes2cards.study',
  };
}
