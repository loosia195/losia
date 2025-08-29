"use client";

import React from "react";

export default function ShippingReturnsSection() {
  return (
    <section className="border-t border-gray-100 pt-4" id="shipping_and_returns_section">
      <h2 className="text-lg font-medium mb-2">Vận chuyển & đổi trả</h2>
      <p className="text-sm text-gray-700">
        Miễn phí vận chuyển cho đơn từ <strong>500.000₫</strong>. Đổi/hoàn trong
        vòng <strong>14 ngày</strong> để nhận tiền hoàn hoặc quà tặng của cửa hàng (có thể áp dụng một số khoản phí).{" "}
        <a href="/about/shipping-returns" className="font-semibold text-black underline underline-offset-2 hover:opacity-80">
          Xem chi tiết
        </a>
        .
      </p>
    </section>
  );
}
