"use client";


import { useRouter } from "next/navigation";
import { useCart } from "@/app/providers/CartProvider";


const fmtVND = (n?: number) => typeof n === "number" ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : undefined;


export default function PriceBox({ retailPrice, oldPrice, newPrice, discountPercent, discountCode, onAdd, inCart, }: { retailPrice?: number; oldPrice?: number; newPrice?: number; discountPercent?: number; discountCode?: string; onAdd: () => void; inCart: boolean; }) {
const router = useRouter();
const { isFirstPurchase, appliedDiscount } = useCart();


const code = (appliedDiscount?.code || discountCode || (isFirstPurchase ? "FIRST50" : "")).toUpperCase();
const pct = appliedDiscount?.discountPercent ?? (typeof discountPercent === "number" ? discountPercent : code === "FIRST50" ? 50 : 0);


const main = typeof newPrice === "number" ? newPrice : typeof oldPrice === "number" ? Math.round(oldPrice * 0.5) : retailPrice || 0;


const offVsRetail = retailPrice ? Math.max(0, Math.min(99, Math.round((1 - main / retailPrice) * 100))) : undefined;


return (
<div className="u-border u-border-gray-2 u-rounded-8 u-p-2x">
<div className="u-flex u-items-end u-gap-1x">
{typeof oldPrice === "number" && (
<span className="u-line-through u-text-gray-6 heading-sm-bold">{fmtVND(oldPrice)}</span>
)}
<span className="heading-lg-bold u-text-alert">{fmtVND(main)}</span>
</div>


<div className="u-flex u-items-center u-gap-1xs u-mt-1x">
{code && <span className="u-overline u-bg-alert-light u-text-alert u-rounded-4 u-px-1x u-py-1xs">{code}</span>}
{typeof pct === "number" && pct > 0 && <span className="u-text-alert">{pct}% off</span>}
{typeof retailPrice === "number" && (
<span className="u-text-gray-6">• retail {fmtVND(retailPrice)} {offVsRetail !== undefined ? `(${offVsRetail}% off)` : ""}</span>
)}
</div>


<div className="u-flex u-gap-1x u-mt-2x">
{!inCart ? (
<button className="tup-ui-btn u-flex-1" onClick={onAdd}>Add to bag</button>
) : (
<>
<button className="tup-ui-btn u-flex-1" onClick={() => router.push("/cart")}>View Bag</button>
<button className="tup-ui-btn u-flex-1" onClick={() => router.push("/checkout")}>Checkout</button>
</>
)}
</div>
</div>
);
}