// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { PRODUCT_CARD_SELECT, shapeCard } from '@/lib/api-shapes/product';
import type { $Enums } from '@prisma/client';
export const runtime = "nodejs";

type ProductConditionT = $Enums.ProductCondition;
type ProductStatusT = $Enums.ProductStatus;

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;

type Sort = 'newest' | 'price_asc' | 'price_desc' | 'popular';

// -------------------- helpers --------------------
function parseBool(v: string | null): boolean | undefined {
  if (v === null) return undefined;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}
function parseNum(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}
function toInt(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}
const ALLOWED_CONDITIONS: readonly ProductConditionT[] = [
  'NEW_WITH_TAGS', 'LIKE_NEW', 'GREAT', 'GOOD', 'FAIR',
] as const;
function toProductCondition(input: unknown): ProductConditionT | undefined {
  if (!input) return undefined;
  const key = String(input).trim().toUpperCase().replace(/[\s-]+/g, '_') as ProductConditionT;
  return (ALLOWED_CONDITIONS as readonly string[]).includes(key) ? (key as ProductConditionT) : undefined;
}

// -------------------- GET /api/products --------------------
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseNum(searchParams.get('limit')) ?? DEFAULT_LIMIT, MAX_LIMIT);
    const cursor = searchParams.get('cursor');

    const q = (searchParams.get('q') || '').trim();
    const brand = (searchParams.get('brand') || '').trim();
    const brandSlug = (searchParams.get('brandSlug') || '').trim();
    const category = (searchParams.get('category') || '').trim();
    const categorySlug = (searchParams.get('categorySlug') || '').trim();

    const minPrice = parseNum(searchParams.get('minPrice'));
    const maxPrice = parseNum(searchParams.get('maxPrice'));
    const inStock = parseBool(searchParams.get('inStock'));
    const cond = toProductCondition(searchParams.get('condition'));

    const sort = (searchParams.get('sort') as Sort) || 'newest';

    const where: any = { status: 'ACTIVE' as ProductStatusT };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (brand) where.brand = { is: { name: { equals: brand, mode: 'insensitive' } } };
    if (brandSlug) where.brand = { is: { slug: { equals: brandSlug, mode: 'insensitive' } } };

    if (category) where.category = { is: { name: { equals: category, mode: 'insensitive' } } };
    if (categorySlug) where.category = { is: { slug: { equals: categorySlug, mode: 'insensitive' } } };

    if (typeof minPrice === 'number') where.price = { ...(where.price || {}), gte: minPrice };
    if (typeof maxPrice === 'number') where.price = { ...(where.price || {}), lte: maxPrice };

    if (inStock === true) {
      where.inventory = { is: { quantity: { gt: 0 } } };
    } else if (inStock === false) {
      where.OR = [
        ...(where.OR ?? []),
        { inventory: { is: { quantity: { equals: 0 } } } },
        { inventory: { is: null } },
      ];
    }

    if (cond) where.condition = cond;

    let orderBy: any[] = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];
    if (sort === 'price_asc') orderBy = [{ price: 'asc' as const }, { id: 'desc' as const }];
    if (sort === 'price_desc') orderBy = [{ price: 'desc' as const }, { id: 'desc' as const }];

    const pageArgs: any = {
      take: limit + 1,
      where,
      orderBy,
      select: PRODUCT_CARD_SELECT,
    };
    if (cursor) {
      pageArgs.cursor = { id: cursor };
      pageArgs.skip = 1;
    }

    const rows = await prisma.product.findMany(pageArgs);

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const nextItem = rows.pop();
      nextCursor = nextItem!.id;
    }

    const items = rows.map(shapeCard);

    const res = NextResponse.json({ items, nextCursor, limit }, { status: 200 });
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300');
    return res;
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
};

// -------------------- POST /api/products --------------------
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    const sku: string | undefined = body.sku;
    const title: string | undefined = body.title;
    const oldPrice = toInt(body.oldPrice);
    const price = toInt(body.price);

    if (!sku || !title || oldPrice === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: sku, title, oldPrice, price' },
        { status: 400 }
      );
    }

    const description: string | undefined = body.description ?? undefined;
    const material: string | undefined = body.material ?? undefined;
    const color: string | undefined = body.color ?? undefined;
    const size: string | undefined = body.size ?? undefined;
    const weight = toInt(body.weight);
    const retailPrice = toInt(body.retailPrice);
    const discountPercent = toInt(body.discountPercent);
    const condition = toProductCondition(body.condition);

    const brandConnect = await (async () => {
      if (body.brandId) return { connect: { id: body.brandId } };
      if (body.brandSlug) {
        const found = await prisma.brand.findUnique({ where: { slug: body.brandSlug } });
        if (found) return { connect: { id: found.id } };
        return { connectOrCreate: { where: { slug: body.brandSlug }, create: { name: body.brandSlug, slug: body.brandSlug } } };
      }
      if (body.brand) {
        const slug = body.brand.toLowerCase().trim().replace(/\s+/g, '-');
        const found = await prisma.brand.findUnique({ where: { slug } });
        if (found) return { connect: { id: found.id } };
        return { connectOrCreate: { where: { slug }, create: { name: body.brand, slug } } };
      }
      return undefined;
    })();

    const categoryConnect = await (async () => {
      if (body.categoryId) return { connect: { id: body.categoryId } };
      if (body.categorySlug) {
        const found = await prisma.category.findUnique({ where: { slug: body.categorySlug } });
        if (found) return { connect: { id: found.id } };
        return { connectOrCreate: { where: { slug: body.categorySlug }, create: { name: body.categorySlug, slug: body.categorySlug } } };
      }
      if (body.category) {
        const slug = body.category.toLowerCase().trim().replace(/\s+/g, '-');
        const found = await prisma.category.findUnique({ where: { slug } });
        if (found) return { connect: { id: found.id } };
        return { connectOrCreate: { where: { slug }, create: { name: body.category, slug } } };
      }
      return undefined;
    })();

    const images: Array<{ url: string; order?: number; width?: number; height?: number }> =
      Array.isArray(body.images) ? body.images : [];

    const created = await prisma.product.create({
      data: {
        sku,
        title,
        description,
        material,
        color,
        size,
        weight: weight ?? undefined,

        retailPrice: retailPrice ?? undefined,
        oldPrice,
        price,
        discountPercent: discountPercent ?? undefined,

        condition: condition ?? undefined,
        status: 'ACTIVE' as ProductStatusT,

        ...(brandConnect ? { brand: brandConnect } : {}),
        ...(categoryConnect ? { category: categoryConnect } : {}),

        ...(images.length
          ? {
              images: {
                create: images.map((img, idx) => ({
                  url: img.url,
                  order: toInt(img.order) ?? idx,
                  width: toInt(img.width) ?? undefined,
                  height: toInt(img.height) ?? undefined,
                })),
              },
            }
          : {}),
      },
      include: { images: true, brand: true, category: true },
    });

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
    }
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
};
