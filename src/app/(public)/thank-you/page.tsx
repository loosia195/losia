"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/providers/CartProvider";
import type { CartItem } from "@/app/providers/CartProvider";

/** DTO khớp /api/orders/[id] */
type OrderDTO = {
  id: string;
  code: string; // orderCode
  items: Array<{
    id: string;
    quantity: number;
    price: number; // unitPrice đã chốt
    product: {
      title: string;
      brand?: string;
      category?: string;
      cover?: string | null; // URL ảnh đầu tiên (có thể null)
      oldPrice?: number | null;
      price?: number | null;
    };
  }>;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
};

export default function ThankYouPage() {
  const params = useSearchParams();
  const codeFromUrl = params.get("order") || ""; // mã đẹp để HIỂN THỊ
  const idForFetch = params.get("id") || "";     // id để FETCH chi tiết
  const method = (params.get("method") || "cod").toUpperCase();

  // 👇 lấy thêm clearLocal để xóa cart phía client sau khi đã fetch order xong
  const { items: cartItems, subtotal: cartSubtotal, clearLocal } = useCart();
  const [order, setOrder] = useState<OrderDTO | null>(null);

  useEffect(() => {
    if (!idForFetch) return;
    (async () => {
      const res = await fetch(`/api/orders/${idForFetch}`, { cache: "no-store" });
      if (res.ok) {
        const dto = await res.json();
        setOrder(dto);

        // ✅ Sau khi đã có dữ liệu đơn hàng → clear local cart + đồng bộ UI
        try {
          clearLocal(); // server đã clear trong transaction; đây chỉ là dọn local để badge/mini-cart khớp
          window.dispatchEvent(new CustomEvent("losia:cart-changed"));
          window.dispatchEvent(new Event("losia:minicart:close"));
        } catch {}
      }
    })();
  }, [idForFetch, clearLocal]);

  const displayCode = order?.code || codeFromUrl || "—";

  // Nguồn hiển thị sản phẩm: ƯU TIÊN order.items → fallback cartItems
  const lineItems = useMemo(() => {
    if (order?.items?.length) {
      return order.items.map((it) => ({
        key: `o-${it.id}`,
        title: it.product.title,
        brand: it.product.brand,
        category: it.product.category,
        cover: it.product.cover || "/assets/placeholder-3x4.png",
        qty: it.quantity,
        unit: it.price,
        old: it.product.oldPrice ?? undefined,
      }));
    }
    return cartItems.map((it: CartItem) => ({
      key: `c-${it.productId}`,
      title: it.product.title,
      brand: it.product.brand,
      category: it.product.category,
      cover: it.product.cover || "/assets/placeholder-3x4.png",
      qty: it.qty,
      unit: (it.product.price ?? it.product.oldPrice ?? 0),
      old: it.product.oldPrice ?? undefined,
    }));
  }, [order, cartItems]);

  // Tính tổng: ưu tiên số liệu từ order → fallback cart
  const computedSubtotal = useMemo<number>(() => {
    if (order) return order.subtotal;
    const fromCart =
      (typeof cartSubtotal === "number" ? cartSubtotal : 0) ||
      lineItems.reduce((s, it) => s + it.unit * it.qty, 0);
    return fromCart;
  }, [order, cartSubtotal, lineItems]);

  // Thuế 10% (fallback nếu order.tax = 0)
  const tax = useMemo(() => {
    if (order) {
      const fallback = Math.round(order.subtotal * 0.1);
      return typeof order.tax === "number" && order.tax > 0 ? order.tax : fallback;
    }
    return Math.round(computedSubtotal * 0.1);
  }, [order, computedSubtotal]);

  const shippingFee = order ? order.shippingFee : (method === "EXP" ? 45000 : 0);

  // Tổng thanh toán
  const total = useMemo(() => {
    const base = order ? order.subtotal : computedSubtotal;
    return base + tax + shippingFee;
  }, [order, computedSubtotal, tax, shippingFee, method]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* HERO */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </span>
          <div className="flex-1">
            <h1 className="text-xl font-semibold leading-tight">Cảm ơn bạn đã đặt hàng! 🎉</h1>
            <p className="mt-1 text-sm text-gray-600">
              Mã đơn hàng <span className="font-medium text-gray-900">#{displayCode}</span> — Phương thức thanh toán:{" "}
              <span className="uppercase">{method}</span>
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3 2 3-2 2 3 2 3-2 3 2 3-2 3-3-2-3 2-3-2-3 2-2-3 2-3-2-3 2-3 3 2 3-2z" fill="currentColor" />
              </svg>
              Safe & Secure Shopping Guarantee
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* LEFT: ITEMS */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-base font-semibold">Sản phẩm trong đơn</h2>
              <span className="text-sm text-gray-500">{lineItems.length} sản phẩm</span>
            </div>

            {lineItems.length ? (
              <ul className="divide-y">
                {lineItems.map((it) => (
                  <li key={it.key} className="flex items-center gap-4 px-5 py-4">
                    {/* Thumb */}
                    <div className="h-20 w-16 overflow-hidden rounded-xl bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.cover}
                        alt={it.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{it.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                        {it.brand && <span>Brand: {it.brand}</span>}
                        {it.category && <span>Danh mục: {it.category}</span>}
                        <span>Số lượng: {it.qty}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-medium">{formatVND(it.unit)}</div>
                      {typeof it.old === "number" && it.old > it.unit && (
                        <div className="text-xs text-gray-400 line-through">
                          {formatVND(it.old)}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                Giỏ hàng rỗng tại thời điểm xác nhận. (Đơn của anh vẫn đã được ghi nhận)
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-4 md:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Tiếp tục mua sắm
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Lịch sử mua hàng
                </Link>
                {/* Xem chi tiết theo ID để chắc chắn khớp API */}
                {idForFetch ? (
                  <Link
                    href={`/orders/${idForFetch}`}
                    className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Chi tiết đơn
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Service Highlights */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard title="Đổi ý trong 24h" desc="Hủy nhanh trong 24h khi chưa bàn giao vận chuyển." />
            <FeatureCard title="Miễn phí gói hàng" desc="Đóng gói thân thiện môi trường, không tính phí." />
            <FeatureCard title="Hỗ trợ 7 ngày/tuần" desc="Chat nhanh với CSKH nếu cần trợ giúp." />
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <aside className="md:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold">Tóm tắt đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <Row label="Tạm tính" value={formatVND(computedSubtotal)} />
              <Row label="Thuế (10%)" value={formatVND(tax)} />
              <Row
                label={`Vận chuyển${shippingFee === 0 ? " (Free Bundle)" : ""}`}
                value={formatVND(shippingFee)}
              />
              <div className="my-2 h-px bg-gray-100" />
              <Row label="Tổng thanh toán" value={formatVND(total)} bold />
            </div>

            {/* Payment status */}
            <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
              <div className="mb-1 font-medium text-gray-800">Trạng thái thanh toán</div>
              {method === "QR" ? (
                <p>Đơn đã được ghi nhận. Nếu bạn chưa quét mã, vui lòng hoàn tất thanh toán qua QR trong 15 phút.</p>
              ) : method === "EXP" ? (
                <p>Giao nhanh 2 ngày (Expedited). Vui lòng giữ điện thoại để tài xế liên hệ.</p>
              ) : (
                <p>Thanh toán khi nhận hàng (COD). Vui lòng giữ điện thoại để tài xế liên hệ.</p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

/* ---------- Small UI helpers ---------- */
function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-gray-600 ${bold ? "font-medium text-gray-900" : ""}`}>{label}</span>
      <span className={`${bold ? "font-semibold text-gray-900" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs text-gray-600">{desc}</p>
    </div>
  );
}

function formatVND(n: number) {
  return `${Number(n || 0).toLocaleString("vi-VN")}₫`;
}
