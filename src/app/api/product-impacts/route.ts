import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // Lấy toàn bộ bảng EcoImpact (hoặc filter theo nhu cầu)
  const ecoImpacts = await prisma.ecoImpact.findMany({
    select: {
      id: true,
      productGroup: true,         // ví dụ: "Dress", "Top", ...
      glassesOfWater: true,
      hoursOfLighting: true,
      kmsOfDriving: true,
    },
    orderBy: { productGroup: "asc" },
  });

  return NextResponse.json({ ecoImpacts });
}
