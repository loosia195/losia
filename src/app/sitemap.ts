// app/sitemap.ts
export const runtime = 'nodejs'; // ✅ cần để dùng Prisma/Node APIs nếu fallback DB

import type { MetadataRoute } from 'next';

const LIMIT = 5000;

/* ---------- Helpers: normalize ---------- */
type ProductSlim = { idOrSlug: string; updatedAt?: string };
type TaxonSlim = { slug: string; updatedAt?: string };

function normalizeProducts(input: any): ProductSlim[] {
  const arr = Array.isArray(input)
    ? input
    : Array.isArray(input?.items)
      ? input.items
      : Array.isArray(input?.data)
        ? input.data
        : [];

  return arr
    .map((p: any) => {
      const idOrSlug = p?.slug ?? p?.id ?? p?._id ?? p?.uuid;
      const updatedAt = p?.updatedAt ?? p?.updated_at ?? p?.modifiedAt ?? p?.modified_at;
      return typeof idOrSlug === 'string' && idOrSlug.length > 0 ? { idOrSlug, updatedAt } : null;
    })
    .filter(Boolean) as ProductSlim[];
}

function normalizeTaxons(input: any): TaxonSlim[] {
  const arr = Array.isArray(input?.items) ? input.items : Array.isArray(input) ? input : [];
  return arr
    .map((c: any) => {
      const slug = c?.slug ?? c?.id ?? c?._id ?? c?.uuid;
      const updatedAt = c?.updatedAt ?? c?.updated_at ?? c?.modifiedAt ?? c?.modified_at;
      return typeof slug === 'string' && slug.length > 0 ? { slug, updatedAt } : null;
    })
    .filter(Boolean) as TaxonSlim[];
}

/* ---------- Fetch: Products ---------- */
async function fetchAllProductsFromAPI(): Promise<ProductSlim[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/products?limit=${LIMIT}`, {
      next: { revalidate: process.env.NODE_ENV === 'production' ? 300 : 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return normalizeProducts(data);
  } catch {
    return [];
  }
}

async function fetchAllProductsFromDB(): Promise<ProductSlim[]> {
  // Fallback nếu API rỗng → query trực tiếp DB (nếu có Prisma)
  try {
    const prismaModule = await import('@/lib/prisma'); // kỳ vọng default export là prisma instance
    const prisma: any = (prismaModule as any).default ?? (prismaModule as any).prisma ?? prismaModule;

    const rows = await prisma.product.findMany({
      select: { id: true, slug: true, updatedAt: true },
      take: LIMIT,
      orderBy: { updatedAt: 'desc' },
    });

    return rows.map((r: any) => ({
      idOrSlug: r.slug ?? r.id,
      updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

/* ---------- Fetch: Categories ---------- */
async function fetchAllCategoriesFromAPI(): Promise<TaxonSlim[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/categories?limit=${LIMIT}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return normalizeTaxons(data);
  } catch {
    return [];
  }
}

async function fetchAllCategoriesFromDB(): Promise<TaxonSlim[]> {
  try {
    const prismaModule = await import('@/lib/prisma');
    const prisma: any = (prismaModule as any).default ?? (prismaModule as any).prisma ?? prismaModule;

    const rows = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      take: LIMIT,
      orderBy: { updatedAt: 'desc' },
    });

    return rows
      .map((r: any) => ({
        slug: r.slug,
        updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
      }))
      .filter((x: any) => x.slug);
  } catch {
    return [];
  }
}

/* ---------- Fetch: Collections ---------- */
async function fetchAllCollectionsFromAPI(): Promise<TaxonSlim[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/collections?limit=${LIMIT}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return normalizeTaxons(data);
  } catch {
    return [];
  }
}

async function fetchAllCollectionsFromDB(): Promise<TaxonSlim[]> {
  try {
    const prismaModule = await import('@/lib/prisma');
    const prisma: any = (prismaModule as any).default ?? (prismaModule as any).prisma ?? prismaModule;

    const rows = await prisma.collection.findMany({
      select: { slug: true, updatedAt: true },
      take: LIMIT,
      orderBy: { updatedAt: 'desc' },
    });

    return rows
      .map((r: any) => ({
        slug: r.slug,
        updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
      }))
      .filter((x: any) => x.slug);
  } catch {
    return [];
  }
}

/* ---------- Sitemap ---------- */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();

  // 1) Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // 2) Products (API → DB)
  let products = await fetchAllProductsFromAPI();
  if (products.length === 0) products = await fetchAllProductsFromDB();

  const seen = new Set<string>();
  const productRoutes: MetadataRoute.Sitemap = products
    .map((p) => {
      const url = `${base}/product/${encodeURIComponent(p.idOrSlug)}`;
      if (seen.has(url)) return null;
      seen.add(url);
      return {
        url,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  // 3) Categories (API → DB)
  let cats = await fetchAllCategoriesFromAPI();
  if (cats.length === 0) cats = await fetchAllCategoriesFromDB();

  const categoryRoutes: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${base}/c/${encodeURIComponent(c.slug)}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // 4) Collections (API → DB)
  let cols = await fetchAllCollectionsFromAPI();
  if (cols.length === 0) cols = await fetchAllCollectionsFromDB();

  const collectionRoutes: MetadataRoute.Sitemap = cols.map((c) => ({
    url: `${base}/collection/${encodeURIComponent(c.slug)}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...productRoutes];
}
