"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      {/* giữ đúng container giống header để dóng lề */}
      <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-8">
        {/* 3 khối: Trái (Logo) - Giữa (4 cột) - Phải (Kết nối) */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          {/* LEFT — Logo ngang hàng với các heading; slogan tách phía dưới */}


          {/* CENTER — 4 cột giữa, nằm chính giữa 2 biên */}
          <div className="flex-1 flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
              {/* Cột 1: CÔNG TY (vô hiệu hóa link) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 leading-none">CÔNG TY</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Về Losia</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Bán cùng Losia</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Hỗ trợ</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Chính sách bảo mật</span></li>
                </ul>
              </div>

              {/* Cột 2: TÌM KIẾM (vô hiệu hóa link) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 leading-none">TÌM KIẾM</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Phụ nữ</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Trẻ em</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Túi xách</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Phụ kiện</span></li>
                </ul>
              </div>

              {/* Cột 3: NHÃN HÀNG NỔI TIẾNG (vô hiệu hóa link) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 leading-none">NHÃN HÀNG NỔI TIẾNG</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Uniqlo</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Zara</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">HM</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Tất cả nhãn hàng</span></li>
                </ul>
              </div>

              {/* Cột 4: KHÁM PHÁ (vô hiệu hóa link) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 leading-none">KHÁM PHÁ</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Hướng dẫn size</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Tiêu chuẩn</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Thẻ quà tặng</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Mã giảm giá</span></li>
                  <li><span role="link" aria-disabled="true" title="Sắp ra mắt" className="text-gray-400 cursor-not-allowed select-none">Sơ đồ trang</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT — Kết nối bám biên phải (vẫn click được) */}
          <div className="flex flex-col items-start lg:self-start">
            <h3 className="text-sm font-semibold text-gray-900 leading-none">KẾT NỐI</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://www.facebook.com/losia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/losia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-8 border-t pt-6 text-xs text-gray-600">
          © {new Date().getFullYear()} LOSIA — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
