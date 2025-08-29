// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.NODE_ENV === 'production'; // ✅ đáng tin hơn
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  if (!isProd) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      host: base,
      // dev có thể không cần sitemap
      // sitemap: `${base}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/login',
          '/account',
          '/checkout',
          '/cart',
          '/_next',              // ✅ thêm
          // chặn query param gây trùng lặp (robots hỗ trợ * và $)
          '/*?*page=*',
          '/*?*sort=*',
          '/*?*filter=*',
          '/*?*utm_*',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
