import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function clampInt(input: string | null, def: number, min: number, max: number) {
  const n = Number(input ?? def);
  if (Number.isNaN(n)) return def;
  return Math.min(Math.max(Math.floor(n), min), max);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentBrand = searchParams.get("currentBrand") || undefined;
    const limitBrands = clampInt(searchParams.get("limitBrands"), 3, 1, 8);
    const limitPerBrand = clampInt(searchParams.get("limitPerBrand"), 3, 1, 6);

    // 1) Lấy danh sách brand từ các sản phẩm ACTIVE mới nhất
    const latest = await prisma.product.findMany({
      where: { status: "ACTIVE" as const },
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        // brand có thể là string (column) hoặc relation { name }
        // dùng any để tương thích cả 2 schema mà không cần TS directive
        brand: true as any,
      },
    });

    // 2) Chuẩn hoá tên brand và loại bỏ currentBrand
    const names: string[] = [];
    for (const row of latest as any[]) {
      const name = typeof row.brand === "string" ? row.brand : row.brand?.name ?? null;
      if (name && (!currentBrand || name !== currentBrand)) names.push(String(name));
    }
    const uniqueBrands = Array.from(new Set(names)).slice(0, limitBrands);
    if (uniqueBrands.length === 0) return NextResponse.json([]);

    // 3) Với mỗi brand, lấy top sản phẩm (lọc theo brand ở tầng JS để tránh phụ thuộc schema)
    const result: Array<{ brand: string; products: any[] }> = [];

    for (const b of uniqueBrands) {
      const candidates = await prisma.product.findMany({
        where: { status: "ACTIVE" as const },
        orderBy: { createdAt: "desc" },
        take: Math.max(limitPerBrand * 3, 12), // lấy dư để lọc client
        select: {
          id: true,
          title: true,
          price: true,
          oldPrice: true,
          retailPrice: true,
          size: true,
          sizeOption: { select: { sizeLabel: true } },
          brand: true as any, // tương thích string hoặc relation
          images: { select: { url: true }, take: 1 },
        },
      });

      const filtered = (candidates as any[]).filter((p) => {
        const name = typeof p.brand === "string" ? p.brand : p.brand?.name ?? null;
        return name === b;
      }).slice(0, limitPerBrand);

      if (filtered.length === 0) continue;

      const mapped = filtered.map((p) => ({
        id: p.id,
        title: p.title,
        image: p.images?.[0]?.url || "",
        size: p.sizeOption?.sizeLabel ?? (typeof p.size === "string" ? p.size : null) ?? null,
        price: p.price ?? null,
        retailPrice:
          (typeof p.retailPrice === "number" ? p.retailPrice : null) ??
          (typeof p.oldPrice === "number" ? p.oldPrice : null) ??
          null,
      }));

      result.push({ brand: b, products: mapped });
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("also-shop API error:", e);
    return NextResponse.json([]);
  }
}
