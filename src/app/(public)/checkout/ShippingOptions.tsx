// src/app/(public)/checkout/ShippingOptions.tsx
'use client';

import React, { useMemo, useState } from 'react';

/** Chuẩn hoá kiểu phương thức giao hàng (nếu anh dùng callback chi tiết) */
export type ShippingMethod = {
  code: string;         // 'bundle' | 'standard' | 'expedited'
  label: string;        // Nhãn hiển thị
  fee: number;          // Phí (đ)
  eta: string;          // Thời gian dự kiến
  value: string;        // Giá trị radio: '14' | '4' | '29'
};

/** Props hỗ trợ cả 2 callback:
 *  - onSelect: bắn lên value (chuỗi)
 *  - onContinue: bắn lên object ShippingMethod (chi tiết)
 */
export interface ShippingOptionsProps {
  available?: boolean;
  onSelect?: (value: string) => void;
  onContinue?: (method: ShippingMethod) => void;
}

export default function ShippingOptions({
  available = false,
  onSelect,
  onContinue,
}: ShippingOptionsProps) {
  // Mặc định chọn Free Bundle
  const [selected, setSelected] = useState<string>('14');

  const options = useMemo<ShippingMethod[]>(
    () => [
      {
        code: 'bundle',
        label: 'Free Bundle',
        fee: 0,
        eta: '2 items arrive Fri 05/30 – Tue 06/03',
        value: '14',
      },
      {
        code: 'standard',
        label: 'Free Standard',
        fee: 0,
        eta: '1 item arrives Fri 05/23 – Tue 05/27',
        value: '4',
      },
      {
        code: 'expedited',
        label: 'Expedited 2‑Day',
        fee: 2599000, // 25.99 * 100000 (đ) → tuỳ anh điều chỉnh
        eta: '1 item arrives Wed 05/21 – Thu 05/22',
        value: '29',
      },
    ],
    [],
  );

  const handleChange = (value: string) => {
    setSelected(value);
    onSelect?.(value);
    const picked = options.find((o) => o.value === value);
    if (picked) onContinue?.(picked);
  };

  if (!available) {
    return (
      <section className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Enter your shipping address to view available shipping options.
      </section>
    );
    }

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold md:text-xl">Shipping options</h2>
      </div>

      <fieldset className="space-y-4">
        {/* Free Bundle (Recommended) */}
        <label
          htmlFor="shipping-bundle"
          className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 transition
            ${selected === '14' ? 'border-black ring-2 ring-black' : 'border-gray-200 hover:border-gray-300'}
          `}
        >
          <input
            id="shipping-bundle"
            name="shipping-option"
            type="radio"
            className="mt-1 h-4 w-4 cursor-pointer accent-black"
            value="14"
            checked={selected === '14'}
            onChange={() => handleChange('14')}
          />
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-medium">Free</span>
              <span>Bundle</span>
              <span className="inline-block rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                Recommended
              </span>
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-800">
              <li>2 items arrive Fri 05/30 - Tue 06/03</li>
            </ul>
            <p className="mt-1 text-sm text-gray-500">
              Shop all week with free shipping! Any orders made will be bundled &amp; shipped together on 05/23.
            </p>
          </div>
        </label>

        {/* Free Standard */}
        <label
          htmlFor="shipping-standard"
          className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 transition
            ${selected === '4' ? 'border-black ring-2 ring-black' : 'border-gray-200 hover:border-gray-300'}
          `}
        >
          <input
            id="shipping-standard"
            name="shipping-option"
            type="radio"
            className="mt-1 h-4 w-4 cursor-pointer accent-black"
            value="4"
            checked={selected === '4'}
            onChange={() => handleChange('4')}
          />
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-medium">Free</span>
              <span>Standard</span>
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-800">
              <li>1 item arrives Fri 05/23 - Tue 05/27</li>
            </ul>
          </div>
        </label>

        {/* Expedited 2-Day */}
        <label
          htmlFor="shipping-expedited"
          className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 transition
            ${selected === '29' ? 'border-black ring-2 ring-black' : 'border-gray-200 hover:border-gray-300'}
          `}
        >
          <input
            id="shipping-expedited"
            name="shipping-option"
            type="radio"
            className="mt-1 h-4 w-4 cursor-pointer accent-black"
            value="29"
            checked={selected === '29'}
            onChange={() => handleChange('29')}
          />
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-bold">
                {(2599000).toLocaleString('vi-VN')}₫
              </span>
              <span>Expedited</span>
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-800">
              <li>1 item arrives Wed 05/21 - Thu 05/22</li>
            </ul>
          </div>
        </label>
      </fieldset>
    </section>
  );
}
