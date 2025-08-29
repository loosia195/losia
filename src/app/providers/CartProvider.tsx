// src/app/providers/CartProvider.tsx
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

/** ---------- Types ---------- */
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
  /** Derivatives dùng cho UI */
  items: CartItem[];
  cartItems: CartItem[];                 // alias để code cũ dùng cartItems không lỗi
  subtotal: number;
  count: number;

  /** Trạng thái tiện ích cho UI */
  isRemoving: boolean;                   // đang xoá item (show spinner)
  isFirstPurchase: boolean;              // lần mua đầu (áp FIRST50)

  /** Raw cart nếu cần chi tiết */
  cart: CartState;

  /** Actions */
  refresh: () => Promise<void>;
  clearLocal: () => void;
  clearCart: () => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
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

  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  /** Heuristic “first purchase”: chưa từng mua → true.
   *  Anh có thể set 'losia:hasPurchased' = 'true' ở trang Thank You sau khi thanh toán thành công. */
  const [isFirstPurchase, setIsFirstPurchase] = useState<boolean>(true);
  useEffect(() => {
    try {
      const hasPurchased = localStorage.getItem("losia:hasPurchased");
      setIsFirstPurchase(hasPurchased !== "true");
    } catch {}
  }, []);

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

  /** Xoá toàn bộ cart (sau khi place order) */
  const clearCart = useCallback(async () => {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // ignore
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

  /** Xoá 1 item khỏi giỏ */
  const removeItem = useCallback(async (productId: string) => {
    setIsRemoving(true);
    try {
      await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // ignore
    } finally {
      setCart((prev) => {
        const detailed = prev.detailed.filter((it) => it.productId !== productId);
        const count = detailed.reduce((s, it) => s + (it.qty || 0), 0);
        const subtotal = detailed.reduce((sum, it) => {
          const price = typeof it.product?.price === "number" ? it.product.price : 0;
          return sum + price * (it.qty || 0);
        }, 0);
        return { ...prev, detailed, count, subtotal };
      });
      dispatchCartChanged();
      setIsRemoving(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Derivatives an toàn cho UI */
  const items = cart.detailed;

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
    cartItems: items, // alias
    subtotal: safeSubtotal,
    count:
      typeof cart.count === "number"
        ? cart.count
        : items.reduce((s, it) => s + (it.qty || 0), 0),

    isRemoving,
    isFirstPurchase,

    cart,
    refresh,
    clearLocal,
    clearCart,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** ---------- Hook ---------- */
export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartProvider;
