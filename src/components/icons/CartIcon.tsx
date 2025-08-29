type Props = {
  className?: string;
  /** Đổi sang phiên bản fill đặc khi giỏ có hàng */
  filled?: boolean;
  /** Độ dày nét cho bản outline */
  strokeWidth?: number;
  /** A11y title (nếu cần đọc bởi screen reader) */
  title?: string;
};

export default function CartIcon({
  className = "h-5 w-5",
  filled = false,
  strokeWidth = 1.8,
  title,
}: Props) {
  if (filled) {
    // 🔸 Bản filled (ăn màu theo currentColor)
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
        aria-hidden={title ? undefined : true}
        role={title ? "img" : "presentation"}
      >
        {title ? <title>{title}</title> : null}
        {/* Giỏ hàng filled đơn giản */}
        <path d="M7.4 4.5a1 1 0 0 1 .94-.67h6.32a1 1 0 0 1 .94.67l1.1 3.05H20a1 1 0 1 1 0 2h-.93l-1.14 6.46a2.5 2.5 0 0 1-2.46 2.04H8.53a2.5 2.5 0 0 1-2.46-2.04L4.93 9.55H4a1 1 0 1 1 0-2h3.4l.01-.03L7.4 4.5Z"/>
        <circle cx="9.25" cy="19.25" r="1.75"/>
        <circle cx="16.25" cy="19.25" r="1.75"/>
      </svg>
    );
  }

  // 🔹 Bản outline (stroke theo currentColor)
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
    >
      {title ? <title>{title}</title> : null}
      <path d="M4 6h2.5l1.6 8.4a2 2 0 0 0 2 1.6h6.4a2 2 0 0 0 2-1.6L20 8H7.2"/>
      <path d="M8 6l1.2-3h5.6L16 6"/>
      <circle cx="9.5" cy="19.5" r="1.5"/>
      <circle cx="16.5" cy="19.5" r="1.5"/>
    </svg>
  );
}
