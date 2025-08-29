"use client";

import React from "react";

interface SourcesProps {
  onClose: () => void;
}

export default function Sources({ onClose }: SourcesProps) {
  return (
    <div
      aria-label="Eco Impact Sources"
      aria-modal="true"
      role="dialog"
      className="
        flex
        flex-col
        relative
        z-[2]
        bg-white
        rounded
        overflow-auto
        m-auto
        p-6
        max-w-[700px]
        sm:p-10
      "
      style={{
        maxHeight: "80vh",
        minWidth: "288px",
      }}
    >
      {/* Nút đóng popup */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 hover:opacity-80"
      >
        <img
          alt="Close"
          src="/assets/icons/cross-black.svg"
          width={18}
          height={18}
        />
      </button>

      {/* Nội dung liệt kê source */}
      <div className="text-sm leading-relaxed">
        <p className="mb-4">
        These calculations are based on life cycle assessment data from multiple sources, 
        primarily anchored by the "Measuring Fashion" study by Quantis (2018). 
        Our approach estimates the environmental impact of garments in three key areas:
        </p>
        <ul className="list-disc ml-5 mb-4">
          <li>
            <strong>Water usage:</strong> 
            &nbsp;Sourced from global average data on textile production ...
          </li>
          <li>
            <strong>Energy usage:</strong> 
            &nbsp;Estimates from LED lightbulb power consumption ...
          </li>
          <li>
            <strong>CO<sub>2</sub> emissions:</strong>
            &nbsp;Miles of driving calculations from EPA guidelines ...
          </li>
        </ul>
        <p>
          <em>
            Please note that the figures represent average impacts based on typical fabric compositions and item weights within each category. Actual impact may vary depending on material, region, and usage.
          </em>
        </p>
      </div>
    </div>
  );
}
