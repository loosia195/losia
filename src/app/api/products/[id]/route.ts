//src\app\api\products\[id]\route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PRODUCT_DETAIL_SELECT, shapeDetail } from '@/lib/api-shapes/product';
export const runtime = "nodejs";

export const dynamic = 'force-dynamic';

function weakETag(payload: unknown) {
  const s = JSON.stringify(payload);
  return `W/"${s.length.toString(16)}"`;
}

function adaptEcoImpact(row: any) {
  if (!row) return null;
  return {
    group: row.group ?? row.category ?? null,
    summary: row.summary ?? row.description ?? null,
    metrics: {
      co2SavedKg: Number(row.co2SavedKg ?? row.co2_kg ?? 0),
      waterSavedL: Number(row.waterSavedL ?? row.water_l ?? 0),
      energySavedKwh: Number(row.energySavedKwh ?? row.energy_kwh ?? 0),
      landfillDivertedKg: Number(row.landfillDivertedKg ?? row.landfill_kg ?? 0),
    },
  };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: PRODUCT_DETAIL_SELECT,
    });

    if (!product || product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const shaped = shapeDetail(product);

    // Tra EcoImpact (optional)
    let ecoImpact = null as any;
    const group = (shaped as any).ecoImpactGroup ?? null;
    if (group) {
      const row = await prisma.ecoImpact.findFirst({
        where: { group: { equals: String(group), mode: 'insensitive' } },
      } as any);
      ecoImpact = adaptEcoImpact(row);
    }

    // Giữ null thay vì ép '' để UI nhận biết đúng có/không
    const data = { ...shaped, description: product.description ?? null, ecoImpact };

    // Debug tạm thời (xem trong server log):
    console.log('[PDP] description:', data.description);

    const res = NextResponse.json(data, { status: 200 });
    res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
    res.headers.set('ETag', weakETag(data));
    return res;
  } catch (err) {
    console.error('[GET /api/products/[id]]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
