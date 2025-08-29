// src/components/product/ProductDetailSection/SizeFitSection.tsx
"use client";

import React, { useMemo } from "react";
import SizeGuide from "@/components/product/popups/SizeGuide";   // render inline, không còn Modal
import Details from "@/components/product/popups/Details";       // render inline, không còn Modal

type Props = {
  sizeDisplay?: string | null;     // ví dụ: "M", "EU 38", "24"
  measuredLength?: number | null;  // đơn vị inch (nếu có)
};

export default function SizeFitSection({ sizeDisplay, measuredLength }: Props) {
  // Tính cm (nếu có inch)
  const lengthText = useMemo(() => {
    if (typeof measuredLength !== "number" || Number.isNaN(measuredLength)) return "";
    const cm = measuredLength * 2.54;
    // Ví dụ: 25" (~63.5 cm)
    return `${stripTrailingZeros(measuredLength)}"`
      + ` (~${stripTrailingZeros(cm)} cm)`;
  }, [measuredLength]);

  const hasAny =
    (sizeDisplay && sizeDisplay.trim().length > 0) ||
    (typeof measuredLength === "number" && !Number.isNaN(measuredLength));

  if (!hasAny) return null;

  return (
    <section className="border-t border-gray-100 pt-4">
      <h2 className="text-lg font-medium mb-2">Kích cỡ &amp; phom dáng</h2>

      <ul className="flex flex-col space-y-1 text-sm text-gray-800">
        {sizeDisplay ? (
          <li>
            Size <span className="font-medium">{sizeDisplay}</span>{" "}
            {/* Toggle hướng dẫn size */}
            <details className="inline-block ml-1 align-middle">
              <summary className="list-none underline text-gray-700 hover:text-gray-900 cursor-pointer inline">
                Hướng dẫn chọn size
              </summary>
              <div className="mt-3 rounded-md border border-gray-100 p-3 bg-white">
                {/* onClose noop để tái dùng component hiện có */}
                <SizeGuide onClose={() => {}} />
              </div>
            </details>
          </li>
        ) : null}

        {typeof measuredLength === "number" && !Number.isNaN(measuredLength) ? (
          <li>
            Chiều dài đo được: <span className="font-medium">{lengthText}</span>{" "}
            {/* Toggle chi tiết đo */}
            <details className="inline-block ml-1 align-middle">
              <summary className="list-none underline text-gray-700 hover:text-gray-900 cursor-pointer inline">
                Chi tiết đo
              </summary>
              <div className="mt-3 rounded-md border border-gray-100 p-3 bg-white">
                <Details onClose={() => {}} />
              </div>
            </details>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

/* ---------------- Helpers ---------------- */

function stripTrailingZeros(n: number) {
  // Giữ 0 hoặc 1 chữ số thập phân tuỳ cần, bỏ số 0 thừa
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}
