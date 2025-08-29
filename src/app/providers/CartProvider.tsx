"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";

/** ---------- Types (export để tái dùng) ---------- */
export type CartItem = {
  productId: string;
  qty: number;
  product: {
    id: string;
    title: string;
    price: number;
    oldPrice: number | null;
    brand?: string;
    category?: string;
    cover: string | null;
    inStock: boolean;
  };
};

export type CartState = {
  id?: string | null;
  anonId?: string | null;
  detailed: CartItem[];
  subtotal: number;
  count: number;
};

export type CartContextType = {
  /** Derivatives đã chuẩn hóa — dùng cho UI */
  items: CartItem[];
  subtotal: number;
  count: number;

  /** Raw cart nếu cần chi tiết */
  cart: CartState;

  /** Actions */
  refresh: () => Promise<void>;
  clearLocal: () => void;      // chỉ clear trong memory để tránh flicker
  clearCart: () => Promise<void>; // gọi API xóa cart + cập nhật UI
};

/** ---------- Utils ---------- */
function dispatchCartChanged() {
  try {
    window.dispatchEvent(new CustomEvent("losia:cart-changed"));
  } catch {}
}

/** ---------- Context ---------- */
const CartContext = createContext<CartContextType | undefined>(undefined);

/** ---------- Provider ---------- */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    detailed: [],
    subtotal: 0,
    count: 0,
  });

  const refresh = useCallback(async () => {
    const res = await fetch("/api/cart", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();

    const detailed: CartItem[] = Array.isArray(data?.detailed) ? data.detailed : [];
    const count =
      typeof data?.count === "number"
        ? data.count
        : detailed.reduce((s: number, it: CartItem) => s + (it?.qty || 0), 0);

    setCart({
      id: data?.id ?? null,
      anonId: data?.anonId ?? null,
      detailed,
      subtotal: typeof data?.subtotal === "number" ? data.subtotal : 0,
      count,
    });
    dispatchCartChanged();
    // Lưu số lượng lần cuối để trang Thank You có thể “freeze” nếu muốn
    try {
      sessionStorage.setItem("losia:lastCartCount", String(count));
    } catch {}
  }, []);

  const clearLocal = useCallback(() => {
    setCart((prev) => ({
      id: prev.id,
      anonId: prev.anonId,
      detailed: [],
      subtotal: 0,
      count: 0,
    }));
    dispatchCartChanged();
    try {
      sessionStorage.setItem("losia:lastCartCount", "0");
    } catch {}
  }, []);

  /** ✅ Xóa cart cả server lẫn client, dùng khi place order xong */
  const clearCart = useCallback(async () => {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // dù API lỗi vẫn clear local để tránh cảm giác “kẹt”
    } finally {
      setCart((prev) => ({
        id: prev.id,
        anonId: prev.anonId,
        detailed: [],
        subtotal: 0,
        count: 0,
      }));
      dispatchCartChanged();
      try {
        sessionStorage.setItem("losia:lastCartCount", "0");
      } catch {}
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Derivatives an toàn cho UI */
  const items = cart.detailed;

  // Nếu API không trả subtotal chính xác, có thể tự tính lại ở đây:
  const safeSubtotal = useMemo<number>(() => {
    if (typeof cart.subtotal === "number" && cart.subtotal >= 0) return cart.subtotal;
    return items.reduce((sum: number, it: CartItem) => {
      const priceLike =
        (typeof it.product?.price === "number" ? it.product.price : undefined) ??
        (typeof it.product?.oldPrice === "number" ? it.product.oldPrice! : 0);
      return sum + (priceLike || 0) * (it.qty || 0);
    }, 0);
  }, [items, cart.subtotal]);

  const value: CartContextType = {
    items,
    subtotal: safeSubtotal,
    count:
      typeof cart.count === "number"
        ? cart.count
        : items.reduce((s, it) => s + (it.qty || 0), 0),

    cart,
    refresh,
    clearLocal,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** ---------- Hook ---------- */
export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** ---------- Default export cho import gọn ---------- */
export default CartProvider;
