// src/lib/api-shapes/product.ts

// Small, predictable payloads for speed
export const PRODUCT_CARD_SELECT = {
  id: true,
  sku: true,
  title: true,
  description: true,
  price: true,
  oldPrice: true,
  condition: true,
  status: true,
  createdAt: true,
  brand: { select: { name: true } },
category: { select: { name: true } },
  productType: { select: { name: true } },   // ✅ nếu schema có productType

size: true,
  images: {
    select: {
      url: true,
      order: true,
      // Nếu schema Image của anh có các cột cũ (seed): bật 2 dòng dưới
      // main: true,
      // thumb: true,
      // alt: true, // tuỳ chọn
    },
  },
} as const;

export const PRODUCT_DETAIL_SELECT = {
  id: true,
  sku: true,
  title: true,
  description: true,
  price: true,
  oldPrice: true,
  retailPrice: true,
  condition: true,
  status: true,
  createdAt: true,
  images: {
    select: {
      url: true,
      order: true,
      // main: true,
      // thumb: true,
      // alt: true, // tuỳ chọn
    },
  },
  inventory: { select: { quantity: true } },
  brand: { select: { name: true } },
  category: { select: { name: true } },
  size: true,
  // Nếu có các cột này trong schema thì bật thêm:
  // conditionNotes: true,
  // ecoImpactGroup: true,
} as const;

/* ---------------------------
 * Helpers
 * --------------------------*/

// Chuẩn hoá đường dẫn ảnh: đổi "\" -> "/", thêm "/" đầu nếu thiếu; http(s) giữ nguyên
function normalizePath(input?: string | null): string | undefined {
  if (!input) return undefined;
  const s = String(input).replace(/\\/g, "/").trim();
  if (/^https?:\/\//i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
}

// Lấy src từ record ảnh (ưu tiên url → main → thumb)
function pickImageSrc(img: any): string | null {
  return (
    normalizePath(img?.url) ||
    normalizePath(img?.main) ||
    normalizePath(img?.thumb) ||
    null
  );
}

/* ---------------------------
 * Condition helpers
 * --------------------------*/

type Level = "excellent" | "very-good" | "good" | "rare-gem" | "new-with-tags";

/** Map mọi biến thể condition -> 5 mức mới (không còn FAIR) */
function mapConditionToLevel(raw?: string | null): Level | null {
  if (!raw) return null;
  const s = String(raw).trim().replace(/[_-]/g, " ").toLowerCase();

  // Ưu tiên nhận diện rõ ràng
  if (["new with tags", "nwt", "brand new with tags", "bnwt"].includes(s)) {
    return "new-with-tags";
  }
  if (["like new", "excellent", "mint", "new"].includes(s)) {
    return "excellent";
  }
  if (["great", "very good", "vg"].includes(s)) {
    return "very-good";
  }
  if (["good", "g"].includes(s)) {
    return "good";
  }
  // Rare / hot / bestseller
  if (
    s.includes("rare") ||
    s.includes("gem") ||
    s.includes("hot") ||
    s.includes("best seller") ||
    s.includes("bán chạy") ||
    s.includes("hiếm")
  ) {
    return "rare-gem";
  }
  // Từ schema cũ: FAIR -> gom về 'good' (vì không còn mức fair)
  if (["fair", "acceptable", "flawed gem", "fair/good"].includes(s)) {
    return "good";
  }
  // Nếu API đã chuẩn hoá sẵn
  if (
    ["excellent", "very-good", "good", "rare-gem", "new-with-tags"].includes(s)
  ) {
    return s as Level;
  }
  // Fallback an toàn
  return "very-good";
}

/** Mô tả mặc định tiếng Việt cho 5 mức */
function defaultConditionText(level: Level | null) {
  if (!level) return null;
  const texts: Record<Level, string> = {
    excellent: "Gần như mới! Không có dấu hiệu đã mặc hay đã giặt.",
    "very-good":
      "Không có lỗi lớn. Có thể có mòn/nhão nhẹ tại các vùng như gấu, đường may, viền; kim loại có xước nhẹ.",
    good:
      "Đã qua sử dụng nhưng còn tốt. Có thể xuất hiện dấu hiệu nhỏ như 1–2 lỗ kim, xù lông nhẹ, phai màu hoặc vết bẩn nhỏ.",
    "rare-gem": "Sản phẩm hiếm, hot/bán chạy, chất lượng rất tốt.",
    "new-with-tags": "Sản phẩm mới nguyên tag.",
  };
  return texts[level];
}

/* ---------------------------
 * Shapers
 * --------------------------*/

export function shapeCard(p: any) {
  const urls: string[] = Array.isArray(p.images)
    ? p.images
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
        .map((i: any) => pickImageSrc(i))
        .filter(Boolean) as string[]
    : [];

  return {
    id: p.id,
    sku: p.sku,
    title: p.title,
    description: p.description,
    price: p.price,
    oldPrice: p.oldPrice,
    condition: p.condition, // card giữ nguyên raw/enum
    cover: urls[0] || "/assets/images/main/product1.jpg",
    images: urls,
    createdAt: p.createdAt,
    brandName: p.brand?.name ?? null,
    productTypeName: p.productType?.name ?? p.category?.name ?? null,
sizeLabel: p.size ?? null,

  };
}

export function shapeDetail(
  p: any,
  computed?: {
    newPrice?: number;
    discountPercentage?: number;
    effectiveDiscountCode?: string;
  }
) {
  const urls: string[] = Array.isArray(p.images)
    ? p.images
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
        .map((i: any) => pickImageSrc(i))
        .filter(Boolean) as string[]
    : [];

  // ✅ Chuẩn hoá cho ConditionSection
  const conditionLevel = mapConditionToLevel(p?.condition ?? null);
  const conditionDescription =
    p?.conditionNotes ?? defaultConditionText(conditionLevel);

  // ✅ Nhóm EcoImpact: có cột ecoImpactGroup thì dùng, không thì fallback category
  const ecoImpactGroup =
    (p as any)?.ecoImpactGroup ?? p?.category?.name ?? null;

  // ★ NEW: Hợp nhất size -> sizeLabel (ưu tiên cột `size`)
  const rawSizeLabel =
    p?.size != null && String(p.size).trim()
      ? String(p.size).trim()
      : p?.sizeLabel != null && String(p.sizeLabel).trim()
      ? String(p.sizeLabel).trim()
      : p?.sizeOption?.sizeLabel != null &&
        String(p.sizeOption.sizeLabel).trim()
      ? String(p.sizeOption.sizeLabel).trim()
      : null;

  const sizeDisplay = p?.sizeDisplay ?? rawSizeLabel ?? null; // nếu sau này có p.sizeDisplay thì giữ, không thì dùng rawSizeLabel

  return {
    id: p.id,
    sku: p.sku,
    title: p.title,
    description: p.description,

    // ---- Pricing
    price: p.price, // current
    oldPrice: p.oldPrice, // anchor để tính %
    retailPrice: p.retailPrice ?? null,

    // ---- Inventory & taxonomy
    inventory: p.inventory?.quantity ?? 0,
    brand: p.brand?.name ?? null,
    category: p.category?.name ?? null,

    // ---- Images
    images: urls,

    // ---- Condition (phục vụ ConditionSection)
    condition: conditionLevel, // 'excellent' | 'very-good' | 'good' | 'rare-gem' | 'new-with-tags' | null
    conditionDescription, // string | null

    // ---- EcoImpact (để route tra bảng EcoImpact)
    ecoImpactGroup, // string | null

    // ★ NEW: Size (phục vụ QuickInfo/ItemDetails/SizeFit)
    size: p.size ?? null,
    sizeLabel: rawSizeLabel, // chuẩn hoá về 1 tên duy nhất cho FE
    sizeDisplay, // ưu tiên p.sizeDisplay, nếu không dùng sizeLabel

    // ---- Computed (nếu có)
    computed: computed || null,
  };
}
