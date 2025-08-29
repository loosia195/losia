// src/app/api/_lib/cartMerge.ts
import { cookies } from "next/headers";
import type { CartIdentity } from "./cartIdentity";
// ✅ Nếu anh có singleton: import prisma from "@/lib/prisma"
//    Còn không, dùng PrismaClient trực tiếp như dưới:
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Gộp guest cart (theo cookie anonId) vào user cart ngay khi user đã đăng nhập.
 * Trả về true nếu có gộp, false nếu không có gì để gộp.
 */
export async function mergeGuestCartIfAny(identity: CartIdentity): Promise<boolean> {
  if (!identity.userId) return false;

  const store = cookies();
  const anonId = store.get("anonId")?.value;
  if (!anonId) return false;

  // Lấy guest cart + items
  const guestCart = await prisma.cart.findFirst({
    where: { anonId },
    include: { items: true },
  });
  if (!guestCart || guestCart.items.length === 0) return false;

  // Lấy (hoặc tạo) user cart
  const userCart = await prisma.cart.upsert({
    where: { userId: identity.userId },
    update: {},
    create: { userId: identity.userId },
    include: { items: true },
  });

  // Merge trong 1 transaction để an toàn
  await prisma.$transaction(async (tx) => {
    for (const it of guestCart.items) {
      // upsert dựa trên @@unique([cartId, productId])
      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: userCart.id, productId: it.productId } },
        update: {
          quantity: { increment: it.quantity },
          // Chính sách giá khi trùng: giữ nguyên unitPrice cũ của userCart
          // (nếu muốn cập nhật theo giá cao hơn/thấp hơn, thay bằng: unitPrice: Math.max(...))
        },
        create: {
          cartId: userCart.id,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        },
      });
    }

    // Xoá guest cart sau khi gộp
    await tx.cart.delete({ where: { id: guestCart.id } });
  });

  // Xoá cookie anonId để tránh gộp lại lần nữa
  store.set("anonId", "", { path: "/", maxAge: 0 });

  return true;
}
