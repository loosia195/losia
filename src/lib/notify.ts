// src/lib/notify.ts
export async function sendOrderEmail({
  to,
  orderCode,
  total,
  method,
  customer,
  address,
}: {
  to: string | string[];
  orderCode: string;
  total: number;
  method: 'COD' | 'QR';
  customer: { name: string; phone: string; email?: string | null };
  address: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || 'LOSIA <onboarding@resend.dev>';
  if (!apiKey) {
    console.error('[notify] Missing RESEND_API_KEY');
    return;
  }

  const subject = `[LOSIA] Đơn mới ${orderCode} – ${method} – ${total.toLocaleString('vi-VN')}₫`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;max-width:600px;margin:0 auto;">
      <h2>Đơn hàng mới: ${orderCode}</h2>
      <p><b>Phương thức:</b> ${method}</p>
      <p><b>Tổng tiền:</b> ${total.toLocaleString('vi-VN')}₫</p>
      <p><b>Khách:</b> ${customer.name} – ${customer.phone}${customer.email ? ` – ${customer.email}` : ''}</p>
      <p><b>Địa chỉ:</b> ${address}</p>
      <p style="margin-top:16px;">
        <a href="${process.env.SITE_URL || ''}/admin/orders?code=${encodeURIComponent(orderCode)}"
           style="display:inline-block;padding:10px 14px;background:#111;color:#fff;border-radius:10px;text-decoration:none">
          Mở trong Admin
        </a>
      </p>
      <p style="color:#666;font-size:12px;margin-top:24px;">Email tự động từ hệ thống LOSIA.</p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    console.error('[notify] sendOrderEmail failed', res.status, await res.text());
  }
}
