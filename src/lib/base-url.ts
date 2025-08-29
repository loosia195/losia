// Helper: trả về base URL phù hợp cho server components/route handlers
import { headers } from "next/headers";

export function getBaseUrl() {
  // Client side -> dùng relative path
  if (typeof window !== "undefined") return "";

  // Ưu tiên lấy từ request headers (đúng cho Preview/Prod)
  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") ?? "https";
    const host =
      h.get("x-forwarded-host") ??
      h.get("host") ??
      process.env.VERCEL_URL; // chỉ là hostname khi chạy ở Vercel
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() không khả dụng ở một số ngữ cảnh build
  }

  // Fallback theo ENV
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.SITE_URL) return process.env.SITE_URL; // đặt = https://losia.vn ở Production
  return "http://localhost:3000";
}
