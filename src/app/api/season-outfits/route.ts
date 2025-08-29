// src/app/api/season-outfits/route.ts

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";

import { PRODUCT_CARD_SELECT, shapeCard } from "@/lib/api-shapes/product";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const limit = Math.min(Number(sp.get("limit") || 16), 48);

    // optional filter theo mùa: thêm điều kiện vào where nếu có cột season/tag
    const rows = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        // season: "summer-2025",
      },
      select: PRODUCT_CARD_SELECT as any,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const items = (rows ?? []).map((p: any) => shapeCard(p));
    return NextResponse.json(
      { items },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("GET /api/season-outfits error:", err);
    return NextResponse.json(
      { items: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
