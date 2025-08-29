import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("seller") || undefined; // tương lai dùng
    const exclude = searchParams.get("exclude") || undefined;
    const limitRaw = Number(searchParams.get("limit") || 8);
    const limit = Math.min(Math.max(limitRaw, 1), 12);

    const whereBase: any = { status: "ACTIVE" as const };
    if (exclude) whereBase.id = { not: exclude };
    // Sau này có sellerId:
    // if (sellerId) whereBase.sellerId = sellerId;

    const products = await prisma.product.findMany({
      where: whereBase,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        oldPrice: true,
        retailPrice: true,             // ✅ nếu có cột retailPrice
        // ❌ KHÔNG chọn sizeLabel trực tiếp vì không tồn tại trong Product
        size: true,                     // ✅ nếu Product có cột size (string)
        sizeOption: {                   // ✅ nếu có relation sizeOption
          select: { sizeLabel: true },
        },
        brand: {                        // ✅ nếu Product có relation brand → Brand { name }
          select: { name: true },
        },
        images: {
          select: { url: true },
          take: 1,                      // lấy ảnh cover
        },
        // Nếu anh có favorites:
        // _count: { select: { favorites: true } },
        // hoặc favoritesCount: true,
      },
    });

    const items = products.map((p) => {
      // Brand: ưu tiên relation Brand.name
      const brandName = p.brand?.name ?? null;

      // Size: ưu tiên sizeOption.sizeLabel, fallback sang size (string)
      const sizeLabel =
        (p.sizeOption?.sizeLabel && String(p.sizeOption.sizeLabel).trim()) ||
        (typeof p.size === "string" && p.size.trim()) ||
        null;

      // Retail: ưu tiên retailPrice, fallback oldPrice
      const retail =
        (typeof p.retailPrice === "number" ? p.retailPrice : null) ??
        (typeof p.oldPrice === "number" ? p.oldPrice : null) ??
        null;

      return {
        id: p.id,
        title: p.title,
        price: p.price ?? null,
        oldPrice: p.oldPrice ?? null,
        retailPrice: retail,                 // ✅ gửi retail riêng
        brandName,                           // ✅ gửi brandName
        sizeLabel,                           // ✅ gửi sizeLabel đã hợp nhất
        images: (p.images || []).map((img) => ({ url: img.url })),
        // favoriteCount: p._count?.favorites ?? null,
      };
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("by-seller API error:", e);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
