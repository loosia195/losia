// src/lib/orderCode.ts
import { ulid } from "ulid";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // bỏ O/0, I/1, L
function toFriendly(base: string) {
  // rút gọn ULID (26 ký tự) → 8–10 ký tự, map sang alphabet tránh ký tự dễ nhầm
  // đơn giản: lấy 10 ký tự đầu & upper-case
  return base.slice(0, 10).toUpperCase()
    .replace(/[0O]/g, "Q").replace(/[I1]/g, "X").replace(/L/g, "Y");
}

export function createOrderCode(prefix = "LOSIA") {
  const d = new Date();
  const ymd = d.toISOString().slice(0,10).replace(/-/g,""); // YYYYMMDD
  const raw = ulid(); // 26 chars
  const short = toFriendly(raw);
  return `${prefix}-${ymd}-${short}`;
}
