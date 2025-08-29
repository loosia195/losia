// src/app/api/season-outfits/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProductStatus } from "@prisma/client"; // 👈 import enum

import { PRODUCT_CARD_SELECT, shapeCard } from "@/lib/api-shapes/product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 16), 48);

    // optional filter theo mùa (nếu anh có cột season/tag riêng thì thay where)
    const rows = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE, // 👈 dùng enum IN HOA
        // season: "summer-2025",
      },
      select: PRODUCT_CARD_SELECT as any,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const items = (rows || []).map((p) => shapeCard(p));
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("GET /api/season-outfits error:", err);
    return NextResponse.json({ items: [] }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
