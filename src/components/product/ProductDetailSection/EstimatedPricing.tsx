type Props = { oldPrice?: number; price: number; shippingFee?: number };

export default function EstimatedPricing({ oldPrice, price, shippingFee = 0 }: Props) {
  const discount =
    oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div className="mt-6 rounded-2xl border p-4 bg-white">
      <h3 className="text-sm font-semibold">Estimated Pricing Information</h3>
      <div className="mt-2 text-sm space-y-1">
        {oldPrice ? (
          <div>
            Giá retail tham chiếu:{' '}
            <span className="line-through">
              {oldPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>
        ) : null}
        <div>
          Giá LOSIA: <strong>{price.toLocaleString('vi-VN')}₫</strong>
          {discount ? ` (−${discount}%)` : ''}
        </div>
        {shippingFee ? (
          <div>Phí vận chuyển ước tính: {shippingFee.toLocaleString('vi-VN')}₫</div>
        ) : null}
        <div className="text-xs text-gray-500">
          *Giá tham chiếu dựa trên dữ liệu thị trường & tình trạng sản phẩm.
        </div>
      </div>
    </div>
  );
}
