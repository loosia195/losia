// src/lib/images.ts

/** Chuẩn hoá chuỗi input thành URL hợp lệ cho Next/Image (không dính CDN) */
export function normalizeImageUrl(input?: string | null): string | undefined {
  if (!input) return undefined;

  // 1) http(s) -> giữ nguyên
  if (/^https?:\/\//i.test(input)) return input;

  // 2) Chuyển backslash Windows -> slash
  const s = String(input).replace(/\\/g, "/").trim();

  // 3) Nếu đã bắt đầu bằng "/" -> giữ nguyên (đi từ /public)
  if (s.startsWith("/")) return s;

  // 4) Nếu chứa "assets/images/..." ở giữa chuỗi -> ép về URL tuyệt đối từ /public
  const idx = s.indexOf("assets/images/");
  if (idx >= 0) {
    const tail = s.slice(idx); // "assets/images/main/..."
    return tail.startsWith("/") ? tail : `/${tail}`;
  }

  // 5) Nếu chỉ là filename (jpg/png/webp/avif) -> trỏ mặc định vào /assets/images/main/
  if (/^[\w\-\.]+\.(jpe?g|png|webp|avif)$/i.test(s)) {
    return `/assets/images/main/${s}`;
  }

  // 6) Nếu là path tương đối khác -> thêm "/" để trở thành đường dẫn từ /public
  return `/${s}`;
}

/** Danh sách ảnh demo cố định: 07 → 20 */
const DEMO_FILES = Array.from({ length: 14 }, (_, i) => {
  const num = 7 + i; // 07..20
  return `/assets/images/main/dress-${String(num).padStart(2, "0")}-front.jpg`;
});

function hashStr(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
  return Math.abs(h);
}

/**
 * Chọn ảnh demo ổn định theo id/sku + index để giảm trùng:
 * - Ổn định theo sản phẩm (hash id/sku)
 * - Phân tán trong cùng trang (cộng thêm index)
 */
export function pickDemoImageUrl(opts: { id?: string; sku?: string; index?: number }): string {
  const n = DEMO_FILES.length;
  const key = (opts.id || opts.sku || "").trim();
  const base = key ? hashStr(key) : 0;
  const idx = ((base + (opts.index ?? 0)) % n + n) % n; // 0..n-1
  return DEMO_FILES[idx];
}
