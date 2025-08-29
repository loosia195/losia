// app/(public)/order/thank-you/page.tsx
type Props = { searchParams: { orderId?: string } };

export default function ThankYouPage({ searchParams }: Props) {
  const orderId = searchParams.orderId ?? '';

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">Cảm ơn anh/chị!</h1>
      <p className="mt-2 text-gray-600">
        Đơn hàng của anh/chị đã được tạo thành công. Mã đơn: <span className="font-mono">{orderId}</span>
      </p>

      {/* GA4 purchase stub */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'purchase', order_id: '${orderId}' });
          `,
        }}
      />
      <a href="/" className="mt-6 inline-block rounded-lg border px-4 py-2 hover:bg-gray-50">
        Tiếp tục mua sắm
      </a>
    </div>
  );
}
