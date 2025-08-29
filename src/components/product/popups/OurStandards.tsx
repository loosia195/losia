"use client";

import React from "react";

interface OurStandardsProps {
  onClose: () => void;
  /** Tuỳ chọn: gắn với id tiêu đề để Modal set aria-labelledby */
  titleId?: string;
}

export default function OurStandards({ onClose, titleId }: OurStandardsProps) {
  return (
    // Khung ngoài mô phỏng ThredUp
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titleId ? undefined : "Tiêu chuẩn chất lượng sản phẩm"}
      aria-labelledby={titleId}
      className="
        flex flex-col relative z-[2]
        bg-white rounded-md overflow-auto
        m-auto p-6 sm:p-10
        shadow-lg
      "
      style={{
        maxHeight: "80vh",
        maxWidth: "760px",
        minWidth: "288px",
        border: "1px solid #fff",
      }}
    >
      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-black/20 rounded"
        type="button"
        aria-label="Đóng"
      >
        <img
          alt="Đóng"
          src="/assets/icons/cross-black.svg"
          width={18}
          height={18}
        />
      </button>

      {/* Nội dung chính */}
      <div className="relative bg-white rounded-md w-full py-2 px-8">
        <h2 id={titleId} className="text-xl font-bold mb-4">
          Tiêu chuẩn chất lượng của LOSIA
        </h2>
        <p className="mb-4 text-sm sm:text-base text-gray-700">
          Mỗi sản phẩm trước khi lên kệ đều được đội ngũ kiểm định kỹ lưỡng.
          Ngoài các bước kiểm tra thông thường, một số sản phẩm thiết kế/đắt giá
          còn được nhân sự chuyên trách soi lỗi và dấu hiệu giả mạo. Sau đó,
          chúng tôi xếp hạng theo các mức điều kiện sau:
        </p>

        {/* excellent */}
        <div className="mb-4">
          <span className="inline-block mb-2 rounded-md py-1 px-2 text-[11px] font-bold uppercase bg-green-700 text-white">
            Excellent
          </span>
          <p className="text-sm sm:text-base mb-0 text-gray-800">
            Gần như mới! Không có dấu hiệu đã mặc hay đã giặt.
          </p>
        </div>

        {/* very good */}
        <div className="mb-4">
          <span className="inline-block mb-2 rounded-md py-1 px-2 text-[11px] font-bold uppercase bg-green-300 text-green-900">
            Very good
          </span>
          <p className="text-sm sm:text-base mb-0 text-gray-800">
            Không có lỗi lớn. Có thể có mòn/nhão nhẹ tại các vùng như gấu,
            đường may, viền; kim loại có xước nhẹ.
          </p>
        </div>

        {/* good */}
        <div className="mb-4">
          <span className="inline-block mb-2 rounded-md py-1 px-2 text-[11px] font-bold uppercase bg-green-200 text-green-800">
            Good
          </span>
          <p className="text-sm sm:text-base mb-0 text-gray-800">
            Đã qua sử dụng nhưng còn tốt. Có thể xuất hiện dấu hiệu nhỏ như 1–2
            lỗ kim, xù lông nhẹ, phai màu hoặc vết bẩn nhỏ.
          </p>
        </div>

        {/* flawed gem */}
        <div className="pb-4">
          <span className="inline-block mb-2 rounded-md py-1 px-2 text-[11px] font-bold uppercase bg-pink-300 text-pink-900">
            Rare gem
          </span>
          <p className="text-sm sm:text-base text-gray-800">
            Hàng hiếm, ít bị lỗi. Thường là sản phẩm hot/bán chạy nên vẫn đáng mua để tái
            sử dụng.
          </p>
        </div>

        <hr className="my-5 border-gray-200" />

        <h3 className="text-sm sm:text-base font-semibold mb-3">
          Điều kiện bổ sung
        </h3>
        <div className="flex items-center">
          <img
            alt="New with tags"
            className="mr-2"
            height={50}
            src="/assets/icons/badge-new-with-tags.svg"
            width={42}
          />
          <p className="text-sm sm:text-base text-gray-800">
            Huy hiệu này cho biết sản phẩm mới còn tag/hãng gốc đính kèm.
          </p>
        </div>
      </div>
    </div>
  );
}
