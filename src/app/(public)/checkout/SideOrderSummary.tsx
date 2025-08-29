// src/app/(public)/cart/SideOrderSummary.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/providers/CartProvider';

export interface SideOrderSummaryProps {
  onPlaceOrder?: () => void | Promise<void>; // ✅ cho phép trang gọi callback
}

// format tiền sang VND
function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function SideOrderSummary({ onPlaceOrder }: SideOrderSummaryProps) {
  const router = useRouter();
  const { cartItems, isFirstPurchase, isRemoving } = useCart();

  // Promo code
  const initialCode = isFirstPurchase ? 'FIRST50' : '';
  const [appliedCode, setAppliedCode] = useState<string>(initialCode);
  const [inputValue, setInputValue] = useState<string>(initialCode);
  const [isEditing, setIsEditing] = useState<boolean>(!initialCode);

  // Gift card toggle
  const [showGiftCard, setShowGiftCard] = useState<boolean>(false);

  // Subtotal = sum((oldPrice ?? newPrice ?? retailPrice) × quantity)
const subtotal = useMemo(() => {
  return cartItems.reduce((sum, item) => {
    const unitPrice =
      (item.product.oldPrice ?? undefined) ??
      item.product.newPrice ??
      item.product.retailPrice ??
      0;
    const qty = item.quantity > 0 ? item.quantity : 1;
    return sum + unitPrice * qty;
  }, 0);
}, [cartItems]);

  // Discount & totals
  const discountAmount =
    appliedCode.trim().toUpperCase() === 'FIRST50' ? subtotal * 0.5 : 0;

  const shippingCost = 20000;       // ví dụ 20.000₫
  const isFreeShipping = true;      // bind theo lựa chọn shipping nếu có

  const discountedSubtotal = subtotal - discountAmount;
  const _totalWithShipping =
    discountedSubtotal + (isFreeShipping ? 0 : shippingCost);

  // Free shipping progress (để sẵn nếu cần dùng)
  const freeShippingThreshold = 200000; // 200.000₫
  const currentAmount = discountedSubtotal;
  const remainingAmount = Math.max(0, freeShippingThreshold - currentAmount);
  const progressPercent = Math.min(100, (currentAmount / freeShippingThreshold) * 100);

  // Thuế = (discounted subtotal + shipping) × 10%
  const taxRate = 0.1;
  const taxableBase =
    discountedSubtotal + (isFreeShipping ? 0 : shippingCost);
  const taxValue = taxableBase * taxRate;

  // Tổng
  const total = discountedSubtotal + (isFreeShipping ? 0 : shippingCost) + taxValue;

  // Handlers
  const handleRemove = () => {
    setAppliedCode('');
    setInputValue('');
    setIsEditing(true);
  };

  const handleApply = () => {
    if (inputValue.trim()) {
      setAppliedCode(inputValue.trim());
      setIsEditing(false);
    }
  };

  const handlePlaceOrderClick = () => {
    if (onPlaceOrder) return onPlaceOrder();
    router.push('/checkout');
  };

  return (
    <div className="sticky top-2 rounded-xl bg-white">
      <section className="relative rounded-xl border border-gray-200 bg-white p-4 md:p-6">
        {/* Spinner overlay khi đang xóa */}
        {isRemoving && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80">
            <img
              src="/assets/icons/loading_spinner.svg"
              alt="Loading"
              className="h-12 w-12"
            />
          </div>
        )}

        <h2 className="mb-4 border-b border-gray-200 pb-3 text-lg font-semibold">
          Order summary
        </h2>

        {/* Promo code form */}
        <form
          className="mb-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleApply();
          }}
        >
          <div className="flex gap-3">
            <div className="w-full">
              <label
                htmlFor="promo"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Promo Code
              </label>
              <input
                id="promo"
                name="promo"
                type="text"
                placeholder="Enter code"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-black"
                value={isEditing ? inputValue : appliedCode}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {appliedCode ? (
              <button
                type="button"
                onClick={handleRemove}
                className="self-end rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
              >
                Remove
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="self-end rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            One code per order. Applies to eligible items.
          </p>
        </form>

        {/* Gift cards toggle */}
        <div className="mb-2 flex items-center justify-between text-sm">
          <div className="font-semibold">Gift cards</div>
          <button
            type="button"
            className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-black"
            onClick={() => setShowGiftCard((prev) => !prev)}
          >
            {showGiftCard ? 'Cancel' : 'Add'}
          </button>
        </div>

        {showGiftCard && (
          <div className="mb-6">
            <form className="mt-3 flex flex-wrap items-end gap-3">
              <div className="min-w-[180px] flex-1">
                <label
                  htmlFor="gift-card-number"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Card Number
                </label>
                <input
                  id="gift-card-number"
                  inputMode="numeric"
                  placeholder="Gift card number"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>
              <div className="min-w-[120px]">
                <label
                  htmlFor="gift-card-pin"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Pin
                </label>
                <input
                  id="gift-card-pin"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Pin"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>
              <button
                type="submit"
                disabled
                className="h-[42px] min-w-[110px] rounded-lg bg-gray-900 px-4 text-sm font-medium text-white opacity-50"
                title="Coming soon"
              >
                Apply
              </button>
            </form>
          </div>
        )}

        <hr className="my-4" />

        {/* Summary details */}
        <div className="isolate relative rounded-xl bg-white">
          <div className="my-2 flex justify-between text-sm">
            <div>Subtotal</div>
            <div>{formatVND(subtotal)}</div>
          </div>

          {discountAmount > 0 && (
            <div className="my-2 flex justify-between text-sm text-rose-600">
              <div>Discount</div>
              <div>-{formatVND(discountAmount)}</div>
            </div>
          )}

          <div className="my-2 flex justify-between text-sm">
            <div>Shipping &amp; Handling</div>
            <div>
              {isFreeShipping ? (
                <span className="font-medium text-emerald-600">FREE</span>
              ) : (
                <>
                  <span className="mr-1 line-through opacity-60">
                    {formatVND(shippingCost)}
                  </span>
                  <span className="font-semibold text-rose-600">
                    {formatVND(shippingCost)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="my-2 flex justify-between text-sm">
            <div>Estimated Tax</div>
            <div>{formatVND(taxValue)}</div>
          </div>

          <hr className="my-3" />

          {/* Total */}
          <div className="my-2 flex items-center justify-between">
            <div className="text-base font-medium">Total</div>
            <div className="text-right text-base font-semibold">
              {formatVND(total)}
            </div>
          </div>
        </div>

        {/* (Optional) Free shipping progress hint */}
        {/*
        <div className="mt-3 text-xs text-gray-600">
          {remainingAmount > 0
            ? `Mua thêm ${formatVND(remainingAmount)} để được miễn phí vận chuyển.`
            : 'Bạn đã được miễn phí vận chuyển!'}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-2 bg-black" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        */}

        {/* Spacer */}
        <div className="h-5" />

        {/* Checkout button & terms */}
        <div className="md:mt-4">
          <button
            type="button"
            onClick={handlePlaceOrderClick}
            className="mb-3 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!!isRemoving}
          >
            Place Order
          </button>

          <p className="mt-1 text-center text-[12px] text-gray-600">
            By placing my order, I agree to the{' '}
            <a
              href="/legal/tou"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              terms
            </a>{' '}
            and{' '}
            <a
              href="/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              privacy policy
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
