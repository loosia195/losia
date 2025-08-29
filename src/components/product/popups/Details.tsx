"use client";

import React, { useState } from "react";

interface DetailsProps {
  onClose: () => void;
}

export default function Details({ onClose }: DetailsProps) {
  // Quản lý tab: "measurements" | "howTo"
  const [activeTab, setActiveTab] = useState<"measurements" | "howTo">("measurements");

  return (
    <div
      aria-label="Info Measurements"
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
        sm:p-10
      "
      style={{
        maxHeight: "85vh",
        maxWidth: "890px",
        minHeight: "0px",
        minWidth: "288px",
        padding: 0,        // ThredUp override (có thể bỏ)
        height: "700px",   // Cố định 700px
        width: "850px",    // Cố định 850px
      }}
    >
      {/* Nút đóng pop-up */}
      <button
        type="button"
        onClick={onClose}
        className="
          absolute
          top-2
          right-2
          md:top-4
          md:right-4
        "
      >
        <img
          alt="Close"
          className="block"
          width={18}
          height={18}
          src="/assets/icons/cross-black.svg"
        />
      </button>

      {/* Nội dung popup (trong ThredUp thường bọc thêm .md:mx-10) */}
      <div className="md:mx-10">
        {/* Tiêu đề */}
        <h2 className="text-xl font-bold mt-10 mb-4">
          Measurement details
        </h2>

        {/* Thanh tab sticky */}
        <div
          className="
            flex
            justify-start
            mb-8
            gap-4
            border-b
            border-gray-200
            sticky
            top-0
            z-10
            bg-white
            pt-2
            relative
          "
        >
          {/* Tab 1: Measurements */}
          <button
            type="button"
            className={`
              text-base
              py-2
              ml-8 md:ml-0
              border-0
              border-b-2
              border-solid
              font-semibold
              ${
                activeTab === "measurements"
                  ? "border-black"
                  : "border-transparent text-gray-500"
              }
            `}
            onClick={() => setActiveTab("measurements")}
          >
            Measurements
          </button>

          {/* Tab 2: How to measure */}
          <button
            type="button"
            className={`
              text-base
              py-2
              ml-8 md:ml-0
              border-0
              border-b-2
              border-solid
              font-semibold
              ${
                activeTab === "howTo"
                  ? "border-black"
                  : "border-transparent text-gray-500"
              }
            `}
            onClick={() => setActiveTab("howTo")}
          >
            How to measure
          </button>
        </div>

        {/* Nội dung tab */}
        {activeTab === "measurements" ? (
          <MeasurementsTab />
        ) : (
          <HowToMeasureTab />
        )}
      </div>
    </div>
  );
}

/** Tab "Measurements": 2 cột - dress & mannequin */
function MeasurementsTab() {
  return (
    <div className="mx-4 md:mx-0 my-4 md:my-6 overflow-auto">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Cột trái */}
        <div className="flex flex-col justify-between w-full">
          <p className="text-sm mb-2">
          This cocktail dress was measured using computer vision. 
          This matches or surpasses hand-measuring accuracy.
          </p>
          <div
            className="relative mx-auto"
            style={{ maxWidth: "300px" }}
          >
            <img
              alt=""
              height={821}
              width={612}
              src="/assets/images/length-measure.jpg"
              className="block w-full h-auto"
            />
          </div>
        </div>

        {/* Cột phải */}
        <div className="flex flex-col justify-between w-full">
          <p className="text-sm mb-2">
            It was photographed on a size M mannequin with these measurements.
          </p>
          <div
            className="relative mx-auto"
            style={{ maxWidth: "300px" }}
          >
            <img
              alt=""
              height={821}
              width={612}
              src="/assets/images/body-measure.jpg"
              className="block w-full h-auto"
            />
            {/* Overlay text */}
            <div
              className="
                absolute
                bottom-0
                left-1/2
                py-1
                px-2
                text-sm
                whitespace-nowrap
              "
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                transform: "translate(-50%, -50%)",
              }}
            >
              Mannequin measurements
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tab "How to measure": hiển thị 1 cột, 1 ảnh (hoặc tuỳ chỉnh) */
function HowToMeasureTab() {
  return (
    <div className="mx-4 md:mx-0 my-4 md:my-6 overflow-auto">
      <div className="w-full">
        <img
          alt=""
          className="block my-6 w-full h-auto"
          loading="lazy"
          src="/assets/icons/howtomeasure.svg"
          height={393}
          width={390}
        />
      </div>
    </div>
  );
}
