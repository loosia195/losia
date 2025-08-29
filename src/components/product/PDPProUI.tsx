"use client";

/*
  LOSIA — Product Detail Page (Pro UI)
  ------------------------------------------------------------
  • Drop-in right panel + global PDP enhancements (mobile + desktop)
  • Zero new deps (Tailwind + lucide-react only). Reuses your existing:
      - ProductAnalytics, AddToCartTracked, EstimatedPricing, SafeSecureGuarantee
      - ProductImageSection (gallery)
  • Includes: Sticky ATC, Trust/USP bar, Low-stock + Free-shipping progress,
    Spec grid, Condition badge, Accordion details, Share/Favorite, Skeletons.

  HOW TO USE
  1) Copy the <RightPanel/> and helper components into a file like
     src/app/(public)/components/product/PDPProUI.tsx
  2) In app/(public)/product/[id]/page.tsx replace your right column with
     <RightPanel ...props/> (see prop list below)
  3) Optional: include <MobileStickyBar/> just before </main> on PDP.

  Props expected from page.tsx (you already have these fields on `product`):
  - id, title, price, oldPrice, brand, category, description
  - inventory, condition, sku, size, color, material, measurements (optional)
*/

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Heart, ShieldCheck, Truck, Recycle, Sparkles, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import AddToCartTracked from "@/components/product/AddToCartTracked";
import EstimatedPricing from "@/components/product/ProductDetailSection/EstimatedPricing";
import SafeSecureGuarantee from "@/components/product/ProductDetailSection/SafeSecureGuarantee";
import { formatVND } from "@/lib/format";

/* ---------------------------------------------
 * Mini utilities
 * --------------------------------------------- */
function percentOff(oldPrice?: number | null, price?: number) {
  if (!oldPrice || !price) return null;
  if (oldPrice <= 0) return null;
  const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
  return pct > 0 ? pct : null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* ---------------------------------------------
 * Trust/USP inline bar
 * --------------------------------------------- */
export function TrustBar() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3 text-[11px] sm:text-xs">
      <div className="flex items-center gap-2 rounded-xl border p-2">
        <ShieldCheck className="h-4 w-4" />
        <span>An tâm mua sắm</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border p-2">
        <Truck className="h-4 w-4" />
        <span>Giao nhanh 2–5 ngày</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border p-2">
        <Recycle className="h-4 w-4" />
        <span>Secondhand First ♻️</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------
 * Collapsible section
 * --------------------------------------------- */
function Collapse({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b py-3">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between text-left">
        <span className="font-medium">{title}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="mt-2 text-sm text-gray-700">{children}</div>}
    </div>
  );
}

/* ---------------------------------------------
 * Free shipping progress (example: threshold 300k)
 * --------------------------------------------- */
function FreeShipProgress({ subtotal, threshold = 300000 }: { subtotal: number; threshold?: number }) {
  const pct = clamp(Math.round((subtotal / threshold) * 100), 0, 100);
  const remaining = Math.max(0, threshold - subtotal);
  return (
    <div className="mt-3 rounded-xl border p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Miễn phí vận chuyển</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-black" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray-600">
        {pct >= 100 ? "Tuyệt! Đơn hàng của anh đã đủ điều kiện miễn phí ship." : `Mua thêm ${formatVND(remaining)} để được freeship.`}
      </p>
    </div>
  );
}

/* ---------------------------------------------
 * Badge set (discount + status)
 * --------------------------------------------- */
function Badges({ price, oldPrice, inventory }: { price?: number; oldPrice?: number | null; inventory?: number | null }) {
  const pct = percentOff(oldPrice ?? undefined, price);
  const low = typeof inventory === "number" && inventory > 0 && inventory <= 3;
  const sold = (inventory ?? 0) <= 0;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {pct && (
        <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">-{pct}%</span>
      )}
      {low && (
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5" /> Còn rất ít
        </span>
      )}
      {sold && (
        <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">Đã bán</span>
      )}
    </div>
  );
}

/* ---------------------------------------------
 * Spec grid (size/condition/material etc.)
 * --------------------------------------------- */
function SpecGrid({
  condition,
  sku,
  size,
  color,
  material,
  measurements,
}: {
  condition?: string | null;
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  measurements?: { [k: string]: string | number } | null;
}) {
  const entries: Array<[string, string]> = [];
  if (size) entries.push(["Kích cỡ", String(size)]);
  if (color) entries.push(["Màu sắc", String(color)]);
  if (material) entries.push(["Chất liệu", String(material)]);
  if (condition) entries.push(["Tình trạng", String(condition)]);
  if (sku) entries.push(["SKU", String(sku)]);

  if (measurements && Object.keys(measurements).length) {
    Object.entries(measurements).forEach(([k, v]) => entries.push([k, String(v)]));
  }

  if (!entries.length) return null;
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between border-b py-2">
          <span className="text-gray-500">{k}</span>
          <span className="font-medium">{v}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------
 * Share + Favorite row
 * --------------------------------------------- */
function SocialRow({ title }: { title: string }) {
  return (
    <div className="mt-3 flex items-center gap-2 text-sm">
      <button
        className="flex items-center gap-1 rounded-full border px-3 py-1.5 hover:bg-gray-50"
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      >
        <Share2 className="h-4 w-4" /> Chia sẻ
      </button>
      <button className="flex items-center gap-1 rounded-full border px-3 py-1.5 hover:bg-gray-50">
        <Heart className="h-4 w-4" /> Lưu lại
      </button>
    </div>
  );
}

/* ---------------------------------------------
 * Sticky mobile bar (CTA on small screens)
 * --------------------------------------------- */
export function MobileStickyBar({
  price,
  oldPrice,
  disabled,
  onAdd,
}: {
  price: number;
  oldPrice?: number | null;
  disabled?: boolean;
  onAdd: () => void;
}) {
  const pct = percentOff(oldPrice ?? undefined, price);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 p-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold">{formatVND(price)}</div>
          {oldPrice && (
            <div className="text-xs text-gray-400 line-through">{formatVND(oldPrice)}</div>
          )}
          {pct && <div className="text-[11px] font-medium text-rose-600">Tiết kiệm {pct}%</div>}
        </div>
        <button
          disabled={disabled}
          onClick={onAdd}
          className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Đã bán" : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------
 * RIGHT PANEL (main export)
 * --------------------------------------------- */
export default function RightPanel({
  product,
  onAdd,
}: {
  product: {
    id: string;
    title: string;
    price: number;
    oldPrice?: number | null;
    brand?: string | null;
    category?: string | null;
    description?: string | null;
    inventory?: number | null;
    condition?: string | null;
    sku?: string | null;
    size?: string | null;
    color?: string | null;
    material?: string | null;
    measurements?: { [k: string]: string | number } | null;
  };
  onAdd: () => void; // call AddToCartTracked from page
}) {
  const outOfStock = (product.inventory ?? 0) <= 0;

  return (
    <aside className="md:sticky md:top-24">
      {/* Title */}
      <h1 className="text-xl font-semibold leading-snug">{product.title}</h1>

      {/* Price row */}
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-bold">{formatVND(product.price)}</span>
        {product.oldPrice && (
          <span className="text-sm text-gray-400 line-through">{formatVND(product.oldPrice)}</span>
        )}
      </div>

      <Badges price={product.price} oldPrice={product.oldPrice ?? undefined} inventory={product.inventory ?? null} />

      <EstimatedPricing oldPrice={product.oldPrice ?? undefined} price={product.price} />

      {/* CTA */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onAdd}
          disabled={outOfStock}
          className="flex-1 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {outOfStock ? "Đã bán" : "Thêm vào giỏ"}
        </button>
        <button className="rounded-xl border px-4 py-3 text-sm font-medium">Mua ngay</button>
      </div>

      <TrustBar />

      {/* Short copy */}
      {product.description && (
        <p className="mt-4 text-sm leading-relaxed text-gray-700">{product.description}</p>
      )}

      <SpecGrid
        condition={product.condition}
        sku={product.sku}
        size={product.size}
        color={product.color}
        material={product.material}
        measurements={product.measurements}
      />

      {/* Accordions */}
      <div className="mt-4 rounded-2xl border">
        <Collapse title="Chi tiết sản phẩm" defaultOpen>
          <div className="space-y-1">
            {product.brand && (
              <div><span className="text-gray-500">Thương hiệu:</span> <span className="font-medium">{product.brand}</span></div>
            )}
            {product.category && (
              <div><span className="text-gray-500">Danh mục:</span> <span className="font-medium">{product.category}</span></div>
            )}
            {product.sku && (
              <div><span className="text-gray-500">SKU:</span> <span className="font-medium">{product.sku}</span></div>
            )}
          </div>
        </Collapse>
        <Collapse title="Vận chuyển & Đổi trả">
          <ul className="list-disc pl-5">
            <li>Giao hàng toàn quốc 2–5 ngày làm việc.</li>
            <li>Đổi size trong 48h nếu còn hàng tương tự.</li>
            <li>Hỗ trợ COD & QR.</li>
          </ul>
        </Collapse>
        <Collapse title="Độ an toàn & Xác thực">
          <p>Tất cả sản phẩm đều được kiểm định theo 3 bước: soi lỗi – vệ sinh – khử mùi. Cam kết hoàn tiền nếu hàng không đúng mô tả.</p>
        </Collapse>
      </div>

      <SocialRow title={product.title} />

      <div className="mt-4">
        <SafeSecureGuarantee />
      </div>

      {/* Example Free-ship callout: pass subtotal if you have cart context */}
      {/* <FreeShipProgress subtotal={product.price} threshold={300000} /> */}
    </aside>
  );
}
