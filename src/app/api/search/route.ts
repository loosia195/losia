import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function pickStr(u: URL, key: string) {
  const v = u.searchParams.get(key);
  return v && v.trim() ? v.trim() : undefined;
}
function digits(u: URL, key: string) {
  const v = u.searchParams.get(key);
  return v && /^\d+$/.test(v) ? v : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (pickStr(url, "q") || "").slice(0, 120);
    const page = Number(digits(url, "page") || "1");
    const pageSize = 24;
    const sort = pickStr(url, "sort") as
      | "relevance"
      | "newest"
      | "price_asc"
      | "price_desc"
      | undefined;

    const where: any = { status: "ACTIVE" };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },     // search theo Brand.name
        { category: { name: { contains: q, mode: "insensitive" } } },  // search theo Category.name
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    // "relevance": nếu chưa có rank/tsvector, cứ để mặc định createdAt desc

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
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

    return NextResponse.json({ items: mapped, total });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load search results" },
      { status: 500 }
    );
  }
}
