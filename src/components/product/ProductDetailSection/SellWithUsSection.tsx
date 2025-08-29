"use client";

import React from "react";
import Image from "next/image";

interface SellWithUsSectionProps {
  brandName?: string | null;
}

export default function SellWithUsSection({ brandName }: SellWithUsSectionProps) {
  const brand = (brandName || "").trim();
  const title =
    brand.length > 0
      ? `Bạn có món đồ ${brand} muốn bán?`
      : "Hãy thử cách dễ nhất để tối đa hóa thu nhập của bạn?";

  return (
    <section
      className="
        mt-6 flex items-center gap-4
        rounded-md border border-gray-100 bg-gray-50
        p-5
      "
    >
      {/* Icon móc treo */}
      <Image
        alt="Biểu tượng móc treo"
        src="/assets/icons/hanger-black.svg"
        width={58}
        height={49}
        className="shrink-0"
      />

      {/* Nội dung */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-sm text-gray-700">
          Mỗi sản phẩm trên LOSIA đều đến từ một tủ đồ như của bạn.{" "}
          <a
            href="/cleanout"
            className="font-semibold text-black underline underline-offset-2 hover:opacity-80"
          >
            Sell with us
          </a>
        </p>
      </div>
    </section>
  );
}
