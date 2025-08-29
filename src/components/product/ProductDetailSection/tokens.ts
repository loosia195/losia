// src/components/product/ProductDetailSection/tokens.ts

/** Level tình trạng (gom synonym về 4 mức) */
export const CONDITION_LEVELS = {
  EXCELLENT: "excellent",
  VERY_GOOD: "very-good",
  GOOD: "good",
  FAIR: "fair",
} as const;
export type ConditionLevel = typeof CONDITION_LEVELS[keyof typeof CONDITION_LEVELS];

/** Chuẩn hoá label tình trạng từ raw -> 4 mức cố định */
export function normalizeCondition(raw?: string | null): ConditionLevel {
  const s = (raw || "").trim().toLowerCase();
  if (["new", "like new", "excellent", "mint"].includes(s)) return CONDITION_LEVELS.EXCELLENT;
  if (["very good", "vg"].includes(s)) return CONDITION_LEVELS.VERY_GOOD;
  if (["good", "g"].includes(s)) return CONDITION_LEVELS.GOOD;
  if (["fair", "acceptable", "flawed gem", "fair/good"].includes(s)) return CONDITION_LEVELS.FAIR;
  // mặc định hiển thị "very-good" để thân thiện
  return CONDITION_LEVELS.VERY_GOOD;
}

/** Style badge theo level (Tailwind) */
export const BADGE_STYLES: Record<ConditionLevel, { bg: string; text: string }> = {
  [CONDITION_LEVELS.EXCELLENT]: { bg: "bg-emerald-600", text: "text-white" },
  [CONDITION_LEVELS.VERY_GOOD]: { bg: "bg-emerald-100", text: "text-emerald-800" },
  [CONDITION_LEVELS.GOOD]: { bg: "bg-green-50", text: "text-green-700" },
  [CONDITION_LEVELS.FAIR]: { bg: "bg-rose-50", text: "text-rose-700" },
};

/** Văn bản/nhãn dùng chung (VN) */
export const COPY = {
  CONDITION_TITLE: "Tình trạng",
  SIZE_FIT_TITLE: "Kích cỡ & phom dáng",
  SHIPPING_RETURNS_TITLE: "Vận chuyển & đổi trả",
  ECO_IMPACT_TITLE: "Tác động môi trường",
  SAFE_GUARANTEE_TITLE: "Cam kết mua sắm an toàn",
  ONLY_ONE_LEFT: "Chỉ còn 1 sản phẩm",
  POPULAR_ITEM: "Sản phẩm đang được quan tâm! Khả năng sẽ bán nhanh.",
  SIZE_GUIDE: "Hướng dẫn chọn size",
  MEASURE_DETAILS: "Chi tiết đo",
  SEE_DETAILS: "Xem chi tiết",
} as const;

/** Icon paths (public/assets/icons) để dùng thống nhất */
export const ICONS = {
  DROPLET: "/assets/icons/droplet.svg",
  LIGHTBULB: "/assets/icons/lightbulb.svg",
  CLOUD: "/assets/icons/cloud.svg",
  HANGER: "/assets/icons/hanger-black.svg",
  CLOSE: "/assets/icons/cross-black.svg",
} as const;

/** Định dạng label đẹp (capitalize từng chữ) */
export function prettifyLabel(s: string) {
  return s
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Đổi inch -> chuỗi hiển thị inch + cm, bỏ số 0 thừa (ví dụ 25" (~63.5 cm)) */
export function formatInchCm(inch?: number | null): string {
  if (typeof inch !== "number" || Number.isNaN(inch)) return "";
  const cm = inch * 2.54;
  const inchStr = trim0(inch);
  const cmStr = trim0(cm);
  return `${inchStr}" (~${cmStr} cm)`;
}

/** -------- Helpers -------- */
function trim0(n: number) {
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}
