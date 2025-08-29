// src/components/home/DiscoverSection.tsx
"use client";
import React, { useState } from "react";
import clsx from "clsx";

export default function DiscoverSection() {
  const [expanded, setExpanded] = useState(false);

  const body = `Là một trong những nền tảng ký gửi và thời trang secondhand trực tuyến lớn nhất Việt Nam dành cho phụ nữ và trẻ em, sứ mệnh của chúng tôi là truyền cảm hứng để thế hệ mua sắm mới nghĩ đến quần áo đã qua sử dụng trước tiên. Bạn có thể mua quần áo nữ và trẻ em như mới với mức giá giảm tới 90% so với bán lẻ ước tính tại cửa hàng ký gửi và secondhand trực tuyến của chúng tôi. Từ các sản phẩm cao cấp, chúng tôi có tất cả thương hiệu bạn yêu thích với giá tốt hơn. Hơn thế nữa, mỗi ngày đều có hàng chục sản phẩm mới được cập nhật. Chúc bạn tìm được món đồ secondhand yêu thích!`;

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
          <div className="px-6 py-8 md:px-12 md:py-10 text-gray-800">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-center">
              Khám phá cửa hàng ký gửi & thời trang secondhand trực tuyến Việt Nam
            </h2>

            {/* Nội dung */}
            <p
              className={clsx(
                "mt-4 text-sm md:text-base leading-relaxed text-gray-700 text-justify transition-all",
                !expanded && "line-clamp-4 md:line-clamp-5"
              )}
            >
              {body}
            </p>

            {/* Nút xem thêm / thu gọn */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 focus:outline-none"
              >
                {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
