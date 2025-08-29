// src/components/product/ProductDetailSection/types.ts

export interface ProductType {
  name: string;
  parent?: { name: string } | null;
}

export interface ProductDetail {
  id: string;
  title: string;

  // brand từ API có thể null → để optional|null cho an toàn
  brand?: string | null;

  // Giữ productType theo cấu trúc hiện có
  productType?: ProductType | null;

  // (Thêm) category & ecoImpactGroup để khớp API/SEO/analytics hiện dùng
  category?: string | null;
  ecoImpactGroup?: string | null;

  // Giá & khuyến mại
  retailPrice?: number | null;     // "estimated retail"
  oldPrice?: number | null;        // giá gốc hiển thị gạch
  price: number;                   // giá bán hiện tại
  discountPercent?: number | null; // % giảm (nếu có)
  discountCode?: string | null;    // ví dụ: 'FIRST50'

  // Trạng thái & tồn kho
  isOnlyOneAvailable?: boolean;
  isPopular?: boolean;
  condition?: string | null;
  conditionDescription?: string | null;
  inventory?: number | null;

  // Mô tả & mã hàng
  description?: string | null;     // ✅ dùng ở ItemDetailsSection
  details?: string[] | null;       // các bullet tùy chọn
  sku?: string | null;             // mã hàng ưu tiên
  itemNumber?: string | null;      // alias
  code?: string | null;            // alias

  // Thuộc tính sản phẩm (chuẩn + alias + dạng mảng để normalize)
  material?: string | null;
  color?: string | null;
  style?: string | null;

  materialDetail?: string | null;  // alias
  colorDetail?: string | null;     // alias
  styleDetail?: string | null;     // alias

  materials?: string[] | null;     // dạng mảng (nếu API trả về)
  colors?: string[] | null;
  styles?: string[] | null;

  // Size & fit (tuỳ chọn)
  size?: string;
  sizeLabel?: string | null;
  sizeDisplay?: string | null;
  measuredLength?: number | null;  // hoặc string|number nếu cần

  // Eco impact (optional)
  productKindForEco?: string;      // 'dress' | 'top' | ...
  glassesOfWater?: number | null;
  hoursOfLighting?: number | null;
  kmsOfDriving?: number | null;
}

// Auth-related
export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: "user" | "admin";
};

export type TokenPayload = {
  sub: string;       // userId
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  role?: "user" | "admin";
};
