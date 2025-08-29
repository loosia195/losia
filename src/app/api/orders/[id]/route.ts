import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          product: {
            select: {
              title: true,
              // brand/category: lấy name để hiển thị
              brand: { select: { name: true } },
              category: { select: { name: true } },
              oldPrice: true,
              price: true,
              // ảnh “cover”: lấy ảnh đầu tiên theo `order` (nếu có), không đưa `cover` vào ProductSelect
              images: {
                select: { url: true, order: true },
                orderBy: { order: "asc" },
                take: 1,
              },
            },
          },
        },
      },
      payments: {
        select: { provider: true, amount: true, status: true, txnId: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!order) {
    return new Response(JSON.stringify({ error: "NOT_FOUND" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  // Chuẩn hóa DTO cho Thank You
  const dto = {
    id: order.id,
    code: order.orderCode ?? order.id, // hiển thị mã đẹp; fallback id nếu cần
    items: order.items.map((it) => {
      const p = it.product;
      const cover =
        (p?.images?.[0]?.url as string | undefined) ?? null; // cover từ ảnh đầu tiên
      return {
        id: it.id,
        quantity: it.quantity,
        price: it.unitPrice, // đơn giá đã chốt tại thời điểm đặt
        product: {
          title: p?.title ?? "",
          brand: p?.brand?.name ?? undefined,
          category: p?.category?.name ?? undefined,
          cover,
          oldPrice: p?.oldPrice ?? null,
          price: p?.price ?? null,
        },
      };
    }),
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    tax: order.tax,
    total: order.total,
    payment: order.payments[0] ?? null,
  };

  return new Response(JSON.stringify(dto), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
