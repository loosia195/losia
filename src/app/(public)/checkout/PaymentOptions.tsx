// src/app/(public)/checkout/PaymentOptions.tsx
'use client';

import React, { useState } from 'react';

export enum Method {
  Card = 'card',
  Atm = 'atm',
  Qr = 'qr',
}

export interface PaymentOptionsProps {
  enabled?: boolean;                 // ✅ thêm prop này
  amount?: number;                   // ✅ để optional cho khớp page.tsx
  currency?: 'VND' | 'USD';
  onSelect?: (method: Method) => void;
}

function formatAmount(n: number, c: 'VND' | 'USD') {
  return new Intl.NumberFormat(c === 'USD' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: c,
  }).format(n);
}

const RadioMarker = ({ selected }: { selected: boolean }) => (
  <span
    className={[
      'mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full border',
      selected ? 'border-black' : 'border-gray-300',
    ].join(' ')}
  >
    {selected && <span className="h-5 w-5 rounded-full bg-black" />}
  </span>
);

const btnBase =
  'w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50';

export default function PaymentOptions({
  enabled = false,                 // ✅ mặc định false
  amount = 0,                      // ✅ mặc định 0
  currency = 'VND',
  onSelect,
}: PaymentOptionsProps) {
  const [method, setMethod] = useState<Method>(Method.Card);

  const handleChange = (m: Method) => {
    setMethod(m);
    onSelect?.(m);
  };

  const handlePay = (type: Method) => {
    if (!enabled) return;
    window.location.href = `/api/vnpay/create_payment?amount=${amount}&type=${type}`;
  };

  const Option = ({
    id,
    value,
    selected,
    children,
  }: {
    id: string;
    value: Method;
    selected: boolean;
    children: React.ReactNode;
  }) => (
    <label
      htmlFor={id}
      className={[
        'flex cursor-pointer items-start gap-2 rounded-xl border p-4 transition',
        selected ? 'border-black ring-2 ring-black' : 'border-gray-200 hover:border-gray-300',
        !enabled && 'cursor-not-allowed opacity-60',
      ].join(' ')}
    >
      <input
        id={id}
        type="radio"
        name="payment"
        value={value}
        checked={selected}
        onChange={() => handleChange(value)}
        className="sr-only"
        disabled={!enabled}
      />
      <RadioMarker selected={selected} />
      <div className="flex-1">{children}</div>
    </label>
  );

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold md:text-xl">Payment</h2>
        <span className="text-sm text-gray-600">
          Total: {formatAmount(amount, currency)}
        </span>
      </div>

      {!enabled && (
        <p className="mb-3 text-sm text-gray-600">
          Vui lòng nhập địa chỉ & chọn phương thức vận chuyển trước.
        </p>
      )}

      <ul className="space-y-3">
        {/* Visa */}
        <li>
          <Option id="payment-card" value={Method.Card} selected={method === Method.Card}>
            <div className="flex items-center gap-2">
              <img src="/assets/icons/visa.svg" alt="Visa" className="h-4 w-auto" />
              <span className="text-sm font-medium">Visa / International Card</span>
            </div>
            {method === Method.Card && (
              <>
                <p className="mt-3 text-sm text-gray-600">
                  Sau khi nhấn <strong>“Proceed with Visa Card”</strong>, bạn sẽ được chuyển đến cổng thanh toán.
                </p>
                <button
                  type="button"
                  className={`${btnBase} mt-3`}
                  onClick={() => handlePay(Method.Card)}
                  disabled={!enabled}
                >
                  Proceed with
                  <img src="/assets/icons/visa.svg" alt="Visa" className="ml-2 inline-block h-4 w-auto" />
                </button>
              </>
            )}
          </Option>
        </li>

        {/* ATM */}
        <li>
          <Option id="payment-atm" value={Method.Atm} selected={method === Method.Atm}>
            <div className="flex items-center gap-2">
              <img src="/assets/icons/vnpay.svg" alt="VNPay ATM" className="h-4 w-auto" />
              <span className="text-sm font-medium">VNPay — ATM nội địa</span>
            </div>
            {method === Method.Atm && (
              <>
                <p className="mt-3 text-sm text-gray-600">
                  Sau khi nhấn <strong>“Proceed with VNPay”</strong>, bạn sẽ được chuyển đến VNPay để hoàn tất.
                </p>
                <button
                  type="button"
                  className={`${btnBase} mt-3`}
                  onClick={() => handlePay(Method.Atm)}
                  disabled={!enabled}
                >
                  Proceed with
                  <img src="/assets/icons/vnpay.svg" alt="VNPay" className="ml-2 inline-block h-4 w-auto" />
                </button>
              </>
            )}
          </Option>
        </li>

        {/* QR */}
        <li>
          <Option id="payment-qr" value={Method.Qr} selected={method === Method.Qr}>
            <div className="flex items-center gap-2">
              <img src="/assets/icons/vnpayqr.svg" alt="VNPay QR" className="h-4 w-auto" />
              <span className="text-sm font-medium">VNPay — QR Code</span>
            </div>
            {method === Method.Qr && (
              <>
                <p className="mt-3 text-sm text-gray-600">
                  Sau khi nhấn <strong>“Proceed with VNPay‑QR”</strong>, bạn sẽ được chuyển đến VNPay để quét mã.
                </p>
                <button
                  type="button"
                  className={`${btnBase} mt-3`}
                  onClick={() => handlePay(Method.Qr)}
                  disabled={!enabled}
                >
                  Proceed with
                  <img src="/assets/icons/vnpayqr.svg" alt="VNPay QR" className="ml-2 inline-block h-4 w-auto" />
                </button>
              </>
            )}
          </Option>
        </li>
      </ul>
    </section>
  );
}
