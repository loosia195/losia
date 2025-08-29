// app/api/payment/qr/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * Trả về { qrImageUrl, expireAt }
 * - vietqr: tạo link QR chuyển khoản ngân hàng (ít phụ thuộc, chạy ngay)
 * - vnpay:  skeleton ký tham số → URL thanh toán → (tuỳ cổng trả QR hay không)
 * - momo:   skeleton tạo link thanh toán → QR
 *
 * Dùng: /api/payment/qr?orderId=xxx&amount=123000&provider=vietqr
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amount = Number(searchParams.get("amount") || 0);
  const orderId = (searchParams.get("orderId") || "unknown").toString();
  const provider = (searchParams.get("provider") || "vietqr").toLowerCase();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    if (provider === "vietqr") {
      // ======== VIETQR (BANK TRANSFER QR) – chạy ngay =========
      // Điền thông tin tài khoản nhận:
      const BANK_BIN = process.env.VIETQR_BANK_BIN || "970415"; // ví dụ: Vietcombank 970436, Techcombank 970407...
      const ACCOUNT_NO = process.env.VIETQR_ACCOUNT_NO || "123456789";
      const ACCOUNT_NAME = process.env.VIETQR_ACCOUNT_NAME || "LOSIA";
      // Ghi chú chuyển khoản (nên có mã đơn và SDT)
      const description = `LOSIA ${orderId}`;

      // Nhiều app ngân hàng hiểu chuẩn VietQR từ URN này (tuỳ bank):
      // Mẫu open-source phổ biến: https://img.vietqr.io/image/<bank_bin>-<account_no>-qr_only.png?amount=...&addInfo=...
      // (ảnh PNG trực tiếp, dễ nhúng, không cần API key – phù hợp MVP)
      const params = new URLSearchParams({
        amount: String(amount),
        addInfo: description,
        accountName: ACCOUNT_NAME,
      });
      const qrPng = `https://img.vietqr.io/image/${BANK_BIN}-${ACCOUNT_NO}-qr_only.png?${params.toString()}`;

      // Hết hạn sau 10 phút (tuỳ ý)
      const expire = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      return NextResponse.json({ qrImageUrl: qrPng, expireAt: expire });
    }

    if (provider === "vnpay") {
      // ======== VNPAY – skeleton ký HMAC =========
      // Điền env theo tài liệu VNPay
      const vnp_TmnCode = process.env.VNP_TMNCODE || "";
      const vnp_HashSecret = process.env.VNP_HASHSECRET || "";
      const vnp_Url = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
      const vnp_ReturnUrl = process.env.VNP_RETURNURL || "https://your-domain.com/payment/vnpay-return";

      // Tham số tối thiểu (tuỳ cấu hình gateway)
      const vnp_TxnRef = orderId; // mã đơn
      const vnp_OrderInfo = `Thanh toan don ${orderId}`;
      const vnp_OrderType = "other";
      const vnp_Amount = amount * 100; // VNPay dùng đơn vị *100
      const vnp_Locale = "vn";
      const vnp_IpAddr = "0.0.0.0";
      const vnp_CreateDate = formatDate(new Date());

      const vnpParams: Record<string, string> = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode,
        vnp_Amount: String(vnp_Amount),
        vnp_CurrCode: "VND",
        vnp_TxnRef,
        vnp_OrderInfo,
        vnp_OrderType,
        vnp_ReturnUrl,
        vnp_IpAddr,
        vnp_Locale,
        vnp_CreateDate,
      };

      // Sắp xếp & ký HMAC SHA512
      const sorted = sortObject(vnpParams);
      const signData = new URLSearchParams(sorted).toString();
      const secureHash = crypto.createHmac("sha512", vnp_HashSecret).update(signData).digest("hex");
      const payUrl = `${vnp_Url}?${signData}&vnp_SecureHash=${secureHash}`;

      // Tuỳ tích hợp: VNPay có thể cung cấp QR trực tiếp hoặc anh render QR từ payUrl
      // Ở đây trả về payUrl để FE vẽ QR (img src) qua dịch vụ tạo QR (VD quickchart.io) hoặc component QR client-side
      const qrApi = `https://quickchart.io/qr?text=${encodeURIComponent(payUrl)}&size=512`;
      const expire = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      return NextResponse.json({ qrImageUrl: qrApi, expireAt: expire, payUrl });
    }

    if (provider === "momo") {
      // ======== MOMO – skeleton tạo link thanh toán =========
      // Điền env theo tài liệu MoMo
      const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || "";
      const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || "";
      const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || "";
      const redirectUrl = process.env.MOMO_REDIRECT_URL || "https://your-domain.com/payment/momo-return";
      const ipnUrl = process.env.MOMO_IPN_URL || "https://your-domain.com/payment/momo-ipn";

      // Tuỳ phiên bản API MoMo (createPayment / createOrder), phần ký khác nhau.
      // Dưới đây chỉ là ví dụ tối giản tạo "deeplink/shortLink" rồi anh vẽ QR từ link đó:
      // (đặt TODO vì endpoint thật và chuỗi ký phụ thuộc gói MoMo của anh)
      const link = await fakeCreateMomoLink({
        partnerCode: MOMO_PARTNER_CODE,
        accessKey: MOMO_ACCESS_KEY,
        secretKey: MOMO_SECRET_KEY,
        amount,
        orderId,
        redirectUrl,
        ipnUrl,
      });

      // Vẽ QR từ shortLink/deeplink
      const qrApi = `https://quickchart.io/qr?text=${encodeURIComponent(link)}&size=512`;
      const expire = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      return NextResponse.json({ qrImageUrl: qrApi, expireAt: expire, payUrl: link });
    }

    // Fallback demo SVG (như trước)
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <rect x='32' y='32' width='448' height='448' fill='white' stroke='#111827' stroke-width='8' rx='16'/>
      <text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='20' fill='#111827'>LOSIA QR</text>
      <text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' fill='#111827'>${orderId}</text>
      <text x='50%' y='68%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' fill='#111827'>${amount.toLocaleString('vi-VN')}₫</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    const expire = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    return NextResponse.json({ qrImageUrl: dataUrl, expireAt: expire });

  } catch (err: any) {
    console.error("[qr] error:", err);
    return NextResponse.json({ error: "QR generation failed" }, { status: 500 });
  }
}

/** Utils */
function sortObject(obj: Record<string, string>) {
  const sorted: Record<string, string> = {};
  Object.keys(obj)
    .sort()
    .forEach((k) => (sorted[k] = obj[k]));
  return sorted;
}
function formatDate(d: Date) {
  // VNPay vnp_CreateDate: yyyyMMddHHmmss
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

// Demo MoMo link creator (TODO: thay bằng gọi API MoMo thật)
async function fakeCreateMomoLink(_: {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  amount: number;
  orderId: string;
  redirectUrl: string;
  ipnUrl: string;
}) {
  // Ở môi trường thật: ký HMAC theo spec MoMo, gọi endpoint của MoMo → nhận về payUrl/deeplink.
  // Tạm thời trả link giả cho demo:
  return `https://momo.vn/checkout?orderId=${encodeURIComponent(_.orderId)}&amount=${_.amount}`;
}
