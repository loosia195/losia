// prisma/seed.products.dress.ts
import { PrismaClient, ProductCondition } from "@prisma/client";
import { dressProducts } from "./seeds/products.dress";
import { ecoImpactData } from "./seeds/EcoImpact";

const prisma = new PrismaClient();

const conditionMap = {
  excellent: {
    label: "Xuất sắc",
    value: "excellent",
    description: "Gần như mới: hầu như không có dấu hiệu đã mặc hoặc giặt.",
  },
  "very good": {
    label: "Rất tốt",
    value: "very good",
    description: "Không có lỗi lớn. Có dấu hiệu sử dụng nhẹ.",
  },
  good: {
    label: "Tốt",
    value: "good",
    description: "Đã qua sử dụng nhưng còn tốt. Có vết bẩn/nhăn nhỏ.",
  },
  "flawed gem": {
    label: "Đặc biệt (có lỗi)",
    value: "flawed gem",
    description: "Có khuyết điểm rõ ràng; vẫn còn giá trị sử dụng.",
  },
} as const;

// (Tuỳ chọn) map text → enum để filter bằng enum ProductCondition
function mapToEnum(value: keyof typeof conditionMap): ProductCondition | undefined {
  switch (value) {
    case "excellent":
      return ProductCondition.LIKE_NEW; // hoặc NEW_WITH_TAGS nếu anh muốn
    case "very good":
      return ProductCondition.GREAT;
    case "good":
      return ProductCondition.GOOD;
    case "flawed gem":
      return ProductCondition.FAIR;
    default:
      return undefined;
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  const ecoDress = ecoImpactData.find((e) =>
    e.productGroup.toLowerCase().includes("dress")
  );

  let upserted = 0;

  for (const p of dressProducts) {
    await prisma.$transaction(async (tx) => {
      // 1) ProductType
      const productType =
        (await tx.productType.findFirst({ where: { name: p.productTypeName } })) ||
        (await tx.productType.findFirst({ where: { name: "Dress" } }));

      if (!productType) {
        console.warn(
          `⚠️  Bỏ qua "${p.title}" vì thiếu productType "${p.productTypeName}" hoặc "Dress".`
        );
        return;
      }

      // 2) SizeOption (optional)
      const sizeOption = await tx.sizeOption.findFirst({
        where: { sizeLabel: p.sizeLabel },
      });

      // 3) Brand (relation) – nếu có
      const brandConnect =
        p.brand && p.brand.trim().length
          ? {
              brand: {
                connectOrCreate: {
                  where: { slug: slugify(p.brand) },
                  create: { name: p.brand, slug: slugify(p.brand) },
                },
              },
            }
          : {};

      // 4) Common data (không set field "style" vì schema không có)
      const dataCommon = {
        title: p.title,

        // Condition: text + (tuỳ chọn) enum
        conditionLabel: conditionMap[p.conditionValue].label,
        conditionValue: conditionMap[p.conditionValue].value,
        conditionDescription: conditionMap[p.conditionValue].description,
        condition: mapToEnum(p.conditionValue as keyof typeof conditionMap),

        // Size: set string hiển thị + relation
        size: p.sizeLabel,

        // Detail
        color: p.color ?? null,
        material: p.material ?? null,

        // Eco impact cache theo product
        ecoImpactGroup: p.ecoImpactGroup || "Dress",
        ecoGlassesOfWater: ecoDress?.glassesOfWater ?? null,
        ecoHoursOfLighting: ecoDress?.hoursOfLighting ?? null,
        ecoKmsOfDriving: ecoDress?.kmsOfDriving ?? null,

        // Pricing
        retailPrice: p.estimatedRetailInfo?.estimatedOriginalPrice ?? null,
        estimatedPriceSource: p.estimatedRetailInfo?.source ?? null,
        oldPrice: p.oldPrice,
        price: p.newPrice,

        // Meta
        description: p.description ?? null,
      };

      const result = await tx.product.upsert({
        where: { sku: p.sku },
        update: {
          ...dataCommon,

          // Quan hệ
          productType: { connect: { id: productType.id } },
          ...(brandConnect as any),
          ...(sizeOption?.id
            ? { sizeOption: { connect: { id: sizeOption.id } } }
            : { sizeOption: { disconnect: true } }),

          // Inventory
          inventory: {
            upsert: {
              create: { quantity: p.inventory, location: "default" },
              update: { quantity: p.inventory },
            },
          },

          // Images: xoá & tạo lại
          images: {
            deleteMany: {},
            create: p.images.map((img: any, idx: number) => ({
              alt: img.alt,
              url: img.main,
              thumb: img.thumb,
              features: img.features ?? [],
              order: typeof img.order === "number" ? img.order : idx, // schema dùng 'order'
            })),
          },
        },
        create: {
          sku: p.sku,
          ...dataCommon,

          // Quan hệ
          productType: { connect: { id: productType.id } },
          ...(brandConnect as any),
          ...(sizeOption?.id ? { sizeOption: { connect: { id: sizeOption.id } } } : {}),

          favoritesCount: 0,

          // Inventory
          inventory: { create: { quantity: p.inventory, location: "default" } },

          // Images
          images: {
            create: p.images.map((img: any, idx: number) => ({
              alt: img.alt,
              url: img.main,
              thumb: img.thumb,
              features: img.features ?? [],
              order: typeof img.order === "number" ? img.order : idx,
            })),
          },
        },
        include: { productType: true },
      });

      upserted += 1;
      console.log(
        `✅ ${result.sku} • ${result.title} → ${result.productType?.name ?? "N/A"}`
      );
    });
  }

  console.log(`\n🎉 Done. Upserted ${upserted}/${dressProducts.length} Dress products.\n`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
