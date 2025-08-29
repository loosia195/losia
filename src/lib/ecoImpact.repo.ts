import prisma from "@/lib/prisma";

/** Lấy EcoImpact cho 1 product:
 *  - Ưu tiên map theo productType.parent.name (Dress, Top, ...)
 *  - Fallback: dùng product.ecoImpactGroup (string) nếu có
 */
export async function getEcoImpactForProduct(productId: string) {
  const p = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      productType: { select: { parent: { select: { name: true } } } },
      ecoImpactGroup: true,
    },
  });
  if (!p) return null;

  const groupKey = p.productType?.parent?.name || p.ecoImpactGroup || null;
  if (!groupKey) return null;

  return prisma.ecoImpact.findFirst({
    where: { OR: [{ productGroup: groupKey }, { productType: { name: groupKey } }] },
    select: {
      productGroup: true,
      glassesOfWater: true,
      hoursOfLighting: true,
      kmsOfDriving: true,
    },
  });
}
