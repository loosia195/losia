// src/components/product/ProductDetailSection/adapters.ts
import type { ProductDetail } from "./types";

/** Nếu có type ApiProduct riêng của anh, import thay "any" */
export type ApiProduct = any;

/** Chuẩn hoá mảng ảnh hỗn hợp (string | {url|main|src}) -> string[] */
export function adaptImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((i: any) => {
      if (typeof i === "string") return i;
      return i?.url ?? i?.main ?? i?.src ?? i?.imageUrl ?? undefined;
    })
    .filter(Boolean);
}

/** Lấy tên nhóm sản phẩm cho eco-impact */
export function pickEcoProductGroup(api: ApiProduct): string {
  return (
    api?.ecoImpactGroup || // nếu API đã trả sẵn
    api?.productType?.parent?.name ||
    api?.productType?.name ||
    api?.productKindForEco ||
    "dress"
  );
}

/** Map dữ liệu từ API → ProductDetail (trả undefined thay vì null) */
export function adaptProductDetail(api: ApiProduct): ProductDetail {
  const brand = toStrOrUndef(api?.brand) ?? "LOSIA";

  // ---- Size fallbacks (ưu tiên theo thứ tự) ----
const rawSizeLabel =
  toStrOrUndef(api?.size) ??              // ⚡️ ưu tiên cột size
  toStrOrUndef(api?.sizeLabel) ??
  toStrOrUndef(api?.sizeOption?.sizeLabel);

  const sizeLabel = rawSizeLabel ?? undefined;
  const sizeDisplay = toStrOrUndef(api?.sizeDisplay) ?? sizeLabel;

  // ---- Condition fallbacks ----
  const condition =
    toStrOrUndef(api?.condition) ??
    toStrOrUndef(api?.conditionValue) ??
    toStrOrUndef(api?.condition_label);

  const conditionDescription =
    toStrOrUndef(api?.conditionDescription) ??
    toStrOrUndef(api?.condition_desc);

  // ---- Item number / SKU fallbacks ----
  const itemNumber =
    toStrOrUndef(api?.itemNumber) ??
    toStrOrUndef(api?.sku) ??
    toStrOrUndef(api?.code) ??
    toStrOrUndef(api?.productCode);

  // ---- Details: chấp nhận array hoặc string (tách dòng) ----
  const details =
    Array.isArray(api?.details)
      ? api.details.filter((d: any) => typeof d === "string" && d.trim()).map((d: string) => d.trim())
      : (typeof api?.details === "string"
          ? api.details
              .split(/\r?\n|•/g)
              .map((s: string) => s.trim())
              .filter(Boolean)
          : undefined);

  // ---- Inventory / Only-one ----
  const inventoryNum = toNumOrUndef(api?.inventory);
  const isOnlyOneAvailable =
    typeof api?.isOnlyOneAvailable === "boolean"
      ? api.isOnlyOneAvailable
      : (typeof inventoryNum === "number" ? inventoryNum === 1 : false);

  return {
    // Bắt buộc
    id: String(api?.id ?? ""),
    title: String(api?.title ?? ""),
    brand,
    price: Number(api?.price ?? 0),

    // Giá & khuyến mãi
    retailPrice: toNumOrUndef(api?.retailPrice),
    oldPrice: toNumOrUndef(api?.oldPrice),
    discountPercent: toNumOrUndef(api?.discountPercent),
    discountCode: toStrOrUndef(api?.discountCode),

    // Size
    size: toStrOrUndef(api?.size), // giữ nguyên gốc nếu UI có dùng
    sizeLabel,                     // ⚡️ đã có fallback
    sizeDisplay,                   // ⚡️ tự suy nếu thiếu

    // Cờ & tồn kho
    isOnlyOneAvailable,
    isPopular: Boolean(api?.isPopular),
    inventory: inventoryNum,

    // Tình trạng
    condition,
    conditionDescription,

    // Chi tiết
    details,
    itemNumber,
    materialDetail: toStrOrUndef(api?.materialDetail) ?? toStrOrUndef(api?.material),
    styleDetail: toStrOrUndef(api?.styleDetail) ?? toStrOrUndef(api?.style),
    measuredLength: toNumOrUndef(api?.measuredLength),

    // Phân loại/Eco impact
    productType: api?.productType ?? undefined, // nếu type cho phép undefined
    productKindForEco: pickEcoProductGroup(api),
    glassesOfWater: toNumOrUndef(api?.glassesOfWater),
    hoursOfLighting: toNumOrUndef(api?.hoursOfLighting),
    kmsOfDriving: toNumOrUndef(api?.kmsOfDriving),
  };
}

/* ---------------- Helpers: trả undefined thay vì null ---------------- */
function toStrOrUndef(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}
function toNumOrUndef(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "string" ? Number(v) : (v as number);
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}
