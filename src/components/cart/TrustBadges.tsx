// src/app/(public)/components/cart/TrustBadges.tsx
export default function TrustBadges() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        Safe & Secure Shopping Guarantee
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        Kiểm định chất lượng & hoàn tiền nếu sai mô tả
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        Đóng gói thân thiện môi trường ♻️
      </div>
    </div>
  );
}
