// app/api/search/route.ts

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function pickStr(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && v.trim() ? v.trim() : undefined;
}
function digits(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && /^\d+$/.test(v) ? v : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const q = (pickStr(sp, "q") || "").slice(0, 120);
    const page = Number(digits(sp, "page") || "1");
    const pageSize = 24;
    const sort = pickStr(sp, "sort") as
      | "relevance"
      | "newest"
      | "price_asc"
      | "price_desc"
      | undefined;

    const where: any = { status: "ACTIVE" };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        // Nếu schema của anh dùng relation:
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    // "relevance": nếu chưa có rank thì để mặc định createdAt desc

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (Math.max(page, 1) - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          price: true,
          oldPrice: true,
          size: true,
          condition: true,
          createdAt: true,
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          images: {
            select: { url: true },
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      }),
    ]);

    const mapped = items.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      oldPrice: p.oldPrice,
      brand: p.brand?.name || undefined,
      brandSlug: p.brand?.slug || undefined,
      category: p.category?.slug || undefined,
      categoryName: p.category?.name || undefined,
      cover: p.images?.[0]?.url || null,
      size: p.size,
      condition: p.condition,
    }));

    return NextResponse.json({ items: mapped, total, page, pageSize }, { status: 200 });
  } catch (e) {
    console.error("search API error:", e);
    return NextResponse.json(
      { error: "Failed to load search results" },
      { status: 500 }
    );
  }
}
