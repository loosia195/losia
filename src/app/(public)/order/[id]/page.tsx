// app/(public)/order/[id]/page.tsx
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type OrderItemDTO = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; title: string; sku: string };
};

type OrderDTO = {
  id: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: string;
  user?: { id: string; name?: string | null; email: string; phone?: string | null };
  items: OrderItemDTO[];
  payments: { provider: string; status: string; amount: number; createdAt: string }[];
};

async function fetchOrder(id: string): Promise<{ order: OrderDTO; shipping: any } | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/orders/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

function formatVND(v: number) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${v.toLocaleString('vi-VN')} ₫`;
  }
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const data = await fetchOrder(params.id);
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-xl font-semibold">Đơn hàng không tồn tại</h1>
        <p className="mt-2 text-gray-600">Vui lòng kiểm tra lại mã đơn hoặc liên hệ hỗ trợ.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg border px-4 py-2 hover:bg-gray-50">Về Trang chủ</Link>
      </div>
    );
  }

  const { order, shipping } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Chi tiết đơn hàng</h1>
        <span className="text-sm rounded-full bg-gray-100 px-3 py-1">{order.status}</span>
      </div>
      <p className="mt-1 text-gray-600">
        Mã đơn: <span className="font-mono">{order.id}</span> · Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
      </p>

      {/* Shipping block */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Thông tin giao hàng</h2>
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <div><span className="text-gray-500">Người nhận:</span> {shipping?.fullName ?? order.user?.name ?? '—'}</div>
            <div><span className="text-gray-500">SĐT:</span> {shipping?.phone ?? order.user?.phone ?? '—'}</div>
            <div className="break-words"><span className="text-gray-500">Email:</span> {shipping?.email ?? order.user?.email ?? '—'}</div>
            <div className="whitespace-pre-line break-words"><span className="text-gray-500">Địa chỉ:</span> {shipping?.address ?? '—'}</div>
            <div><span className="text-gray-500">Hình thức:</span> {shipping?.method ?? 'COD'}</div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-medium">Thanh toán</h2>
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <div><span className="text-gray-500">Phương thức:</span> {order.payments?.[0]?.provider ?? 'COD'}</div>
            <div><span className="text-gray-500">Trạng thái:</span> {order.payments?.[0]?.status ?? 'PENDING'}</div>
            <div><span className="text-gray-500">Tổng thanh toán:</span> {formatVND(order.total)}</div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-lg border">
        <div className="border-b p-4 font-medium">Sản phẩm</div>
        <ul className="divide-y">
          {order.items.map((it) => (
            <li key={it.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{it.product.title}</div>
                <div className="text-xs text-gray-500">SKU: {it.product.sku}</div>
              </div>
              <div className="text-right text-sm">
                <div>Số lượng: {it.quantity}</div>
                <div className="text-gray-600">Đơn giá: {formatVND(it.unitPrice)}</div>
                <div className="font-medium">Tạm tính: {formatVND(it.unitPrice * it.quantity)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <div className="mt-6 ml-auto w-full sm:max-w-sm rounded-lg border p-4 space-y-2">
        <div className="flex justify-between text-sm"><span>Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Giảm giá</span><span>-{formatVND(order.discount)}</span></div>
        <div className="flex justify-between text-sm"><span>Phí vận chuyển</span><span>{formatVND(order.shippingFee)}</span></div>
        <div className="flex justify-between text-sm"><span>Thuế</span><span>{formatVND(order.tax)}</span></div>
        <div className="border-t pt-2 flex justify-between font-semibold"><span>Tổng cộng</span><span>{formatVND(order.total)}</span></div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-lg border px-4 py-2 hover:bg-gray-50">Tiếp tục mua sắm</Link>
        <Link href="/about" className="rounded-lg border px-4 py-2 hover:bg-gray-50">Cần hỗ trợ?</Link>
      </div>
    </div>
  );
}
