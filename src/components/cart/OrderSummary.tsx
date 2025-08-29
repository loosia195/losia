// src/components/cart/OrderSummary.tsx
type Props = {
  count: number;
  subtotal: number;
  totalSavings?: number;
  shippingText?: string; // mặc định: 'Tính ở bước sau'
  taxText?: string;      // mặc định: 'Tính ở bước sau'
};

export default function OrderSummary({
  count,
  subtotal,
  totalSavings = 0,
  shippingText = 'Tính ở bước sau',
  taxText = 'Tính ở bước sau',
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="font-semibold text-lg">Tóm tắt đơn hàng</h2>

      <div className="mt-3 space-y-1 text-sm">
        <Line label="Số lượng" value={String(count)} />
        <Line label="Tạm tính" value={formatVND(subtotal)} />
        {totalSavings > 0 && (
          <Line
            label={
              <span className="text-emerald-700">
                Tiết kiệm{' '}
                <span className="ml-1 text-[11px] rounded bg-emerald-50 px-2 py-0.5">
                  Wear What Matters
                </span>
              </span>
            }
            value={`− ${formatVND(totalSavings)}`}
          />
        )}
        <Line label="Phí vận chuyển" value={subtotal === 0 ? '0₫' : shippingText} />
        <Line label="Thuế" value={taxText} />
      </div>

      <div className="mt-3 border-t pt-3 flex items-center justify-between text-base font-semibold">
        <span>Tổng cộng</span>
        <span className="tabular-nums">{formatVND(subtotal)}</span>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="tabular-nums">{value}</span>
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
