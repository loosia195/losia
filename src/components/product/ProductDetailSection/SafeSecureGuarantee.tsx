// src/components/product/ProductDetailSection/SafeSecureGuarantee.tsx
"use client";

import React, { useId } from "react";

export default function SafeSecureGuarantee({ compact = false }: { compact?: boolean }) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={[
        "mt-6 rounded-2xl border bg-white",
        compact ? "p-3" : "p-4",
      ].join(" ")}
    >
      <h3 id={titleId} className="text-s font-semibold">
        Cam kết mua sắm an toàn
      </h3>

      <ul className="mt-2 list-disc pl-5 text-sm space-y-1 text-gray-800">
        <li>Kiểm định tình trạng 2 bước trước khi giao</li>
        <li>Đổi/hoàn trong 48 giờ nếu sai mô tả</li>
        <li>Thanh toán an toàn: VNPAY, COD</li>
        <li>Bảo vệ thông tin người mua &amp; người bán</li>
      </ul>

      {/* Link chi tiết (tùy chọn) */}
      <div className="mt-2">
        <a
          href="/about/guarantee"
          className="text-xs underline text-gray-700 hover:text-gray-900"
        >
          Xem chi tiết cam kết
        </a>
      </div>
    </section>
  );
}
