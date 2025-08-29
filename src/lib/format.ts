export function formatVND(n: number) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${Number(n).toLocaleString('vi-VN')} ₫`;
  }
}

export function salePercent(oldPrice?: number | null, price?: number | null) {
  if (!oldPrice || !price || oldPrice <= 0 || price >= oldPrice) return 0;
  return Math.max(1, Math.round(((oldPrice - price) / oldPrice) * 100));
}
