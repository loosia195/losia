// src/app/(public)/components/cart/PromoCodeForm.tsx
'use client';

export default function PromoCodeForm() {
  return (
    <form
      className="mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const code = String(data.get('promo') || '').trim();
        if (code) {
          console.log('Apply promo (stub):', code);
          // TODO: dispatch vào CartProvider/OrderSummary hoặc gọi /api/promo
          alert(`Đã nhận mã: ${code} (demo)`);
        }
      }}
    >
      <label htmlFor="promo" className="text-sm font-medium">
        Mã khuyến mãi
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id="promo"
          name="promo"
          placeholder="Hiện chưa áp dụng"
          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
        />
<button
  type="submit"
  disabled
  className="rounded-lg border px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
>
  Áp dụng
</button>
      </div>
      <p className="mt-1 text-xs text-gray-500">* Giảm giá sẽ hiển thị khi mã hợp lệ.</p>
    </form>
  );
}
