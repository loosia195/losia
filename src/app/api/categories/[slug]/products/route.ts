import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

function pickStr(u: URL, key: string) {
  const v = u.searchParams.get(key);
  return v && v.trim() ? v.trim() : undefined;
}
function digits(u: URL, key: string) {
  const v = u.searchParams.get(key);
  return v && /^\d+$/.test(v) ? v : undefined;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const url = new URL(req.url);

    const page = Number(digits(url, "page") || "1");
    const pageSize = 24;

    const sort = pickStr(url, "sort") as
      | "newest"
      | "price_asc"
      | "price_desc"
      | undefined;

    const brand = pickStr(url, "brand");          // brand slug or name tuỳ anh dùng
    const size = pickStr(url, "size");
    const condition = pickStr(url, "condition") as
      | "new"
      | "like_new"
      | "good"
      | "fair"
      | undefined;
    const price_min = digits(url, "price_min");
    const price_max = digits(url, "price_max");

    // where clause theo QUAN HỆ Category.slug
    const where: any = {
      category: { slug: params.slug },
      status: "ACTIVE",
    };
    if (brand) {
      // nếu anh muốn filter theo brand slug:
      where.brand = { slug: brand };
      // nếu theo brand name: where.brand = { name: brand };
    }
    if (size) where.size = size;
    if (condition) where.condition = condition;
    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price.gte = Number(price_min);
      if (price_max) where.price.lte = Number(price_max);
    }

    // order
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

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
          // lấy brand & category qua quan hệ
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          // lấy 1 ảnh đầu tiên làm cover
          images: {
            select: { url: true },
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      }),
    ]);

    // map ra shape đơn giản cho FE hiện tại
    const mapped = items.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      oldPrice: p.oldPrice,
      brand: p.brand?.name || undefined,          // FE đang cần string
      brandSlug: p.brand?.slug || undefined,
      category: p.category?.slug || undefined,    // FE có thể dùng slug (hoặc name nếu muốn)
      categoryName: p.category?.name || undefined,
      cover: p.images?.[0]?.url || null,
      size: p.size,
      condition: p.condition,
    }));

    return NextResponse.json({ items: mapped, total });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load category products" },
      { status: 500 }
    );
  }
}
