"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, PackageCheck, Truck, ShieldCheck, QrCode, WalletMinimal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/providers/CartProvider"; // optional
import Image from "next/image";
/**
 * LOSIA — Checkout (QR & COD)
 * - Miễn phí ship 30.000₫ khi đạt 500.000₫
 * - Expedited cố định 45.000₫
 */

// -----------------------------
// Types
// -----------------------------

type ProductLite = {
  id: string;
  title: string;
  price: number;
  oldPrice: number | null;
  brand?: string;
  category?: string;
  cover: string | null;
  inStock: boolean;
};

type DetailedItem = {
  productId: string;
  qty: number; // secondhand thường = 1
  product: ProductLite;
};

type CartResponse = {
  id?: string | null;
  anonId?: string | null;
  email?: string | null;
  detailed?: DetailedItem[];
  subtotal?: number;
  count?: number;
};

type Address = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  phone: string;
  email: string;
};

// NOTE: label giữ nguyên UX, giá sẽ tính động theo subtotal
const SHIPPING_OPTIONS = [
  { id: "standard", label: "Free Standard", eta: "3–5 ngày" },
  { id: "bundle", label: "Free Bundle (khuyến nghị)", eta: "2 món giao cùng" },
  { id: "expedited", label: "Expedited 2-Day", eta: "2 ngày" },
] as const;

type ShippingId = typeof SHIPPING_OPTIONS[number]["id"];
type PaymentMethod = "qr" | "cod";

// -----------------------------
// Constants (free ship logic)
// -----------------------------

const FREE_SHIP_THRESHOLD = 500_000;  // ✅ đạt ngưỡng này → miễn 30k
const BASE_SHIPPING_FEE = 30_000;     // ✅ phí chuẩn cho standard/bundle nếu CHƯA đủ ngưỡng
const EXPEDITED_FEE = 45_000;         // cố định

// -----------------------------
// Helpers
// -----------------------------

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function formatVND(n: number) {
  try { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n); }
  catch { return `${n}₫`; }
}

// -----------------------------
// Page (Client)
// -----------------------------

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load cart");
        const data: CartResponse = await res.json();
        if (mounted) setCart(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không tải được giỏ hàng");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-40 bg-neutral-100 rounded-2xl" />
            <div className="h-40 bg-neutral-100 rounded-2xl" />
            <div className="h-40 bg-neutral-100 rounded-2xl" />
          </div>
          <div className="lg:col-span-2 h-72 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-2xl border p-6 bg-white">
          <p className="text-red-600 font-medium">Lỗi: {error}</p>
          <div className="mt-3 text-sm">
            <Link href="/cart" className="underline">Quay lại giỏ hàng</Link>
          </div>
        </div>
      </main>
    );
  }

  return <CheckoutClient cart={cart || { detailed: [], subtotal: 0, count: 0 }} />;
}

// -----------------------------
// Checkout Client Component
// -----------------------------

function CheckoutClient({ cart }: { cart: CartResponse }) {
  const items = (cart.detailed || []) as DetailedItem[];
  const subtotal = Number(cart.subtotal || 0);

  const [address, setAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    email: cart.email || "",
  });
  const [shipping, setShipping] = useState<ShippingId>("bundle");
  const [payment, setPayment] = useState<PaymentMethod>("qr");
  const [promo, setPromo] = useState("");
  const [placing, setPlacing] = useState(false);

  const qualifiesFreeShip = subtotal >= FREE_SHIP_THRESHOLD;

  // ✅ TÍNH PHÍ SHIP THEO NGƯỠNG
  const shippingCost = useMemo(() => {
    if (items.length === 0) return 0;
    if (shipping === "expedited") return EXPEDITED_FEE;
    // standard / bundle
    return qualifiesFreeShip ? 0 : BASE_SHIPPING_FEE;
  }, [shipping, qualifiesFreeShip, items.length]);

  const tax = useMemo(() => Math.round(subtotal * 0.1), [subtotal]);
  const total = subtotal + tax + shippingCost;

  const addressValid = Boolean(address.firstName && address.lastName && address.address1 && address.city && address.phone && address.email);

  const router = useRouter();

  async function placeOrder() {
    if (!addressValid) { alert("Vui lòng điền đủ thông tin giao hàng."); return; }
    if (items.length === 0) { alert("Giỏ hàng trống."); return; }

    setPlacing(true);
    try {
      const form = new FormData();
      form.set("cartId", cart.id ?? "");
      form.set("anonId", cart.anonId ?? (document.cookie.match(/(?:^|; )anonId=([^;]+)/)?.[1] || ""));
      form.set("email", cart.email ?? address.email);
      form.set("fullName", `${address.firstName} ${address.lastName}`);
      form.set("phone", address.phone);
      form.set("address", `${address.address1} ${address.address2 || ""}, ${address.city}, ${address.state || ""}, ${address.postalCode || ""}`);
      form.set("shipping", shipping);  // "standard" | "bundle" | "expedited"
      form.set("payment", payment);    // "cod" | "qr"

      const res = await fetch("/api/orders", { method: "POST", body: form });

      if (res.redirected && res.url.includes("/thank-you")) {
        try { (useCart as any)?.()?.clearLocal?.(); } catch {}
        router.replace(res.url);
        return;
      }

      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        const url = `/thank-you?method=${payment}&order=${encodeURIComponent(data?.orderId || "")}`;
        try { (useCart as any)?.()?.clearLocal?.(); } catch {}
        router.replace(url);
        return;
      }

      alert("Có lỗi khi đặt hàng. Vui lòng thử lại.");
    } catch (e) {
      console.error("Checkout error", e);
      alert("Có lỗi khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Progress bar */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-neutral-600">
          <span className="font-medium">Cart</span>
          <span>→</span>
          <span className="font-medium">Shipping</span>
          <span>→</span>
          <span className="font-semibold text-neutral-900">Payment</span>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Free shipping banner nhỏ */}
          <FreeShipMiniBanner subtotal={subtotal} />

          <Section title="Địa chỉ giao hàng" icon={<Truck className="w-4 h-4" />}>
            <AddressForm value={address} onChange={setAddress} />
          </Section>

          <Section title="Phương thức vận chuyển" icon={<PackageCheck className="w-4 h-4" />}>
            <ShippingOptions
              subtotal={subtotal}
              value={shipping}
              onChange={setShipping}
            />
          </Section>

          <Section title="Phương thức thanh toán" icon={<CreditCard className="w-4 h-4" />}>
            <PaymentMethods value={payment} onChange={setPayment} />
            <PaymentDetails payment={payment} total={total} />
          </Section>

          <TrustBlocks />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            tax={tax}
            shipping={shippingCost}
            total={total}
            promo={promo}
            onChangePromo={setPromo}
            onPlaceOrder={placeOrder}
            placing={placing}
          />
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// UI Blocks
// -----------------------------

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl shadow-sm border p-4 lg:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-base lg:text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function FreeShipMiniBanner({ subtotal }: { subtotal: number }) {
  const progress = Math.min(subtotal / FREE_SHIP_THRESHOLD, 1);
  const remain = Math.max(FREE_SHIP_THRESHOLD - subtotal, 0);
  return (
    <div className="rounded-2xl border bg-white p-4">
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
        <div className="text-sm font-medium text-emerald-700">
          Tuyệt! Đơn hàng đủ điều kiện miễn phí vận chuyển 🎉
        </div>
      )}
    </div>
  );
}

function AddressForm({ value, onChange }: { value: Address; onChange: (a: Address) => void }) {
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Input label="First name" value={value.firstName} onChange={set("firstName")} required />
      <Input label="Last name" value={value.lastName} onChange={set("lastName")} required />
      <Input className="md:col-span-2" label="Address line 1" value={value.address1} onChange={set("address1")} required />
      <Input className="md:col-span-2" label="Address line 2 (optional)" value={value.address2 || ""} onChange={set("address2")} />
      <Input label="City" value={value.city} onChange={set("city")} required />
      <Input label="State/Province" value={value.state || ""} onChange={set("state")} />
      <Input label="Postal code" value={value.postalCode || ""} onChange={set("postalCode")} />
      <Input label="Phone" value={value.phone} onChange={set("phone")} required />
      <Input label="Email" value={value.email} onChange={set("email")} type="email" required />
    </div>
  );
}

function ShippingOptions({
  subtotal,
  value,
  onChange,
}: {
  subtotal: number;
  value: ShippingId;
  onChange: (v: ShippingId) => void;
}) {
  const qualifies = subtotal >= FREE_SHIP_THRESHOLD;

  const priceOf = (id: ShippingId) => {
    if (id === "expedited") return EXPEDITED_FEE;
    return qualifies ? 0 : BASE_SHIPPING_FEE;
  };

  return (
    <div className="grid gap-3">
      {SHIPPING_OPTIONS.map((opt) => {
        const price = priceOf(opt.id as ShippingId);
        const priceText =
          opt.id === "expedited"
            ? formatVND(price)
            : qualifies
              ? "Miễn phí (đạt 500.000₫)"
              : formatVND(price);

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id as ShippingId)}
            className={classNames(
              "text-left rounded-xl border p-4 hover:bg-neutral-50 transition",
              value === opt.id ? "border-neutral-800 ring-2 ring-neutral-800/10" : "border-neutral-200"
            )}
            aria-pressed={value === opt.id}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{opt.label}</div>
                <div className="text-sm text-neutral-600">Dự kiến: {opt.eta}</div>
              </div>
              <div className="text-sm font-semibold">{priceText}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PaymentMethods({ value, onChange }: { value: PaymentMethod; onChange: (v: PaymentMethod) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("qr")}
        className={classNames(
          "rounded-xl border p-4 flex items-center justify-center gap-2 hover:bg-neutral-50",
          value === "qr" ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-200"
        )}
        aria-pressed={value === "qr"}
      >
        <QrCode className="w-5 h-5" />
        <span className="font-medium">QR Code</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("cod")}
        className={classNames(
          "rounded-xl border p-4 flex items-center justify-center gap-2 hover:bg-neutral-50",
          value === "cod" ? "border-neutral-900 ring-2 ring-neutral-900/10" : "border-neutral-200"
        )}
        aria-pressed={value === "cod"}
      >
        <WalletMinimal className="w-5 h-5" />
        <span className="font-medium">COD</span>
      </button>
    </div>
  );
}

function PaymentDetails({ payment, total }: { payment: PaymentMethod; total: number }) {
  if (payment === "qr") {
    return (
      <div className="mt-4 grid gap-3">
        <div className="text-sm text-neutral-700">
          Quét mã bằng ứng dụng ngân hàng/VNPay để thanh toán tổng số tiền {formatVND(total)}.
        </div>
        {/* QR thật từ public/assets/images/payment/QR Payment.jpg */}
        <div className="rounded-xl border bg-white p-4 flex items-center justify-center">
          <Image
            src="/assets/images/payment/QR Payment.jpg"
            alt="Mã QR thanh toán LOSIA"
            width={320}
            height={320}
            className="rounded-lg w-56 md:w-72 h-auto object-contain"
           priority
          />
        </div>
        <ul className="text-xs text-neutral-500 list-disc pl-5">
          <li>Nội dung chuyển khoản: LOSIA + số điện thoại.</li>
          <li>Đơn hàng sẽ tự động xác nhận sau khi nhận thanh toán.</li>
        </ul>
      </div>
    );
  }
  return (
    <div className="mt-4 text-sm text-neutral-700">
      Thanh toán khi nhận hàng (COD). Vui lòng chuẩn bị đúng số tiền khi giao.
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  tax,
  shipping,
  total,
  promo,
  onChangePromo,
  onPlaceOrder,
  placing,
}: {
  items: DetailedItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  promo: string;
  onChangePromo: (v: string) => void;
  onPlaceOrder: () => void;
  placing: boolean;
}) {
  return (
    <aside className="lg:sticky lg:top-20">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border p-4 lg:p-6">
        <h3 className="text-lg font-semibold mb-4">Đơn hàng</h3>

        {/* Items */}
        <div className="space-y-3 mb-4 max-h-64 overflow-auto pr-1">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center gap-3">
              <img
                src={product.cover || "/assets/images/main/product1.jpg"}
                alt={product.title}
                className="h-20 w-16 rounded-md object-cover bg-gray-100 border"
              />
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium line-clamp-1">{product.title}</div>
                <div className="text-xs text-neutral-600">Qty: {qty}</div>
              </div>
              <div className="text-sm font-semibold">{formatVND(product.price * qty)}</div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-neutral-500">Giỏ hàng trống</div>}
        </div>

        {/* Promo */}
        <div className="mb-4 flex gap-2">
          <input
            value={promo}
            onChange={(e) => onChangePromo(e.target.value)}
            placeholder="Mã khuyến mãi"
            className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
          <button
  type="submit"
  disabled
  className="rounded-lg border px-3 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
>
  Áp dụng
</button>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <Row label="Tạm tính" value={formatVND(subtotal)} />
          <Row label="Vận chuyển" value={shipping === 0 ? "Miễn phí" : formatVND(shipping)} />
          <Row label="Thuế (ước tính)" value={formatVND(tax)} />
          <div className="h-px bg-neutral-200 my-2" />
          <Row label={<span className="font-semibold text-base">Tổng cộng</span>} value={<span className="font-bold text-base">{formatVND(total)}</span>} />
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={placing}
          className="w-full mt-5 inline-flex items-center justify-center rounded-2xl px-4 py-3 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {placing ? "Đang xử lý…" : "Đặt hàng"}
        </button>

        <p className="mt-3 text-[12px] text-neutral-500 text-center">
          Bằng việc đặt hàng, bạn đồng ý với <a className="underline" href="#">Điều khoản</a> và <a className="underline" href="#">Chính sách bảo mật</a>.
        </p>
      </motion.div>
    </aside>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-neutral-600">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function Input({ label, className, required, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={classNames("grid gap-1 text-sm", className)}>
      <span className="text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        {...rest}
        className="rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
      />
    </label>
  );
}

function TrustBlocks() {
  const items = [
    { icon: <ShieldCheck className="w-4 h-4" />, title: "Thanh toán an toàn", desc: "Mã hoá SSL • Bảo vệ dữ liệu" },
    { icon: <Truck className="w-4 h-4" />, title: "Giao nhanh, dễ đổi trả", desc: "Đổi trả trong 14 ngày" },
    { icon: <PackageCheck className="w-4 h-4" />, title: "Hàng chuẩn 100%", desc: "Kiểm định & mô tả đúng tình trạng" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl border bg-white p-4 flex items-start gap-3">
          <div className="rounded-xl bg-neutral-100 p-2">{it.icon}</div>
          <div>
            <div className="text-sm font-semibold">{it.title}</div>
            <div className="text-xs text-neutral-600">{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
