// ==============================
// FILE: app/api/orders/route.ts
// ==============================
import { NextResponse } from "next/server";

// Tạm thời lưu đơn vào bộ nhớ (test)
let ORDERS: any[] = [];

/**
 * POST /api/orders
 * Body: { cartId, anonId, email, address, shipping, payment, promo }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Fake generate orderId
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Tạo order object (tạm lưu trong bộ nhớ)
    const order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      ...body,
      status: body.payment === "cod" ? "pending_cod" : "pending_qr",
    };
    ORDERS.push(order);

    // ✅ Trả về JSON có orderId
    return NextResponse.json({ orderId });
  } catch (e: any) {
    console.error("Order error:", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

/**
 * GET /api/orders?orderId=...
 * → Xem thông tin đơn hàng (test)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }
  const order = ORDERS.find((o) => o.id === orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
