"use client";
export default function Error({ error }: { error: Error }) {
  console.error("Route /product/[id] error:", error);
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Có lỗi khi tải sản phẩm.</h2>
      <p className="text-sm text-gray-600">Vui lòng thử lại sau hoặc quay về trang trước.</p>
    </div>
  );
}
