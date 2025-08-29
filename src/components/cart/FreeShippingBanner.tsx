// src/components/cart/FreeShippingBanner.tsx
type Props = {
  subtotal: number;
  threshold: number; // VD: 500_000
};

export default function FreeShippingBanner({ subtotal, threshold }: Props) {
  const progress = Math.min(subtotal / threshold, 1);
  const remain = Math.max(threshold - subtotal, 0);

  return (
    <div className="mb-5 rounded-xl border bg-white p-4">
      {progress < 1 ? (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Miễn phí vận chuyển</span>
            <span className="tabular-nums">{formatVND(remain)} nữa là được</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-black transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-emerald-700">
            Tuyệt! Đơn hàng đủ điều kiện miễn phí vận chuyển 🎉
          </span>
          <span className="tabular-nums">Ngưỡng: {formatVND(threshold)}</span>
        </div>
      )}
    </div>
  );
}

/* local util để độc lập với page */
function formatVND(n: number) {
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n}₫`;
  }
}
