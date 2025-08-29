"use client";

import React from "react";

interface SizeGuideProps {
  onClose: () => void;
}

export default function SizeGuide({ onClose }: SizeGuideProps) {
  return (
    <div
      aria-label="Size Guide"
      aria-modal="true"
      role="dialog"
      className="
        flex
        flex-col
        relative
        z-[2]
        bg-white
        rounded-[4px]
        overflow-auto
        m-auto
        p-6
        sm:p-10
        /* Mô phỏng ThredUp style, border, v.v. */
      "
      style={{
        maxHeight: "80vh",
        maxWidth: "760px",
        minHeight: "0px",
        minWidth: "288px",
        border: "1px solid #fff",
      }}
    >
      {/* Nút đóng pop-up */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 hover:u-opacity-50"
      >
        <img
          alt="Close"
          src="/assets/icons/cross-black.svg"
          width={18}
          height={18}
        />
      </button>

      {/* Nội dung chính */}
      <div className="relative w-full bg-white rounded-md overflow-auto py-2 px-8">
        <h2 className="text-xl font-bold mb-4">Size Guide</h2>
        <p className="mb-4 text-sm">
          Not sure about your size? Here's how to measure...
        </p>

        {/* Ví dụ bảng size */}
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 px-2 text-left font-semibold">Size</th>
              <th className="py-2 px-2 text-left font-semibold">Bust (in)</th>
              <th className="py-2 px-2 text-left font-semibold">Waist (in)</th>
              <th className="py-2 px-2 text-left font-semibold">Hips (in)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-2">XS (0-2)</td>
              <td className="py-2 px-2">31-33</td>
              <td className="py-2 px-2">24-26</td>
              <td className="py-2 px-2">34-36</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-2">S (4-6)</td>
              <td className="py-2 px-2">33-35</td>
              <td className="py-2 px-2">26-28</td>
              <td className="py-2 px-2">36-38</td>
            </tr>
            {/* ... Thêm các size khác */}
          </tbody>
        </table>

        <p className="text-sm">
          To get the most accurate measurement, measure your bust at the fullest
          part, your waist at the smallest part, and your hips at the fullest
          part.
        </p>
      </div>
    </div>
  );
}
