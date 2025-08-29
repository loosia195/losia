'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutHeader() {
  return (
    <section
      className="
        u-mb-2xs u-flex u-items-center u-justify-center
        u-bg-white u-p-2xs
        md:u-justify-between md:u-bg-transparent md:u-mb-3x md:u-p-0
      "
      data-ctx="checkout-header"
    >
      <Link href="/">
        <Image src="/assets/icons/logo.svg" alt="Losia" width={105} height={24} />
      </Link>
      <Link href="/cart" aria-label="Cart">
        <Image
          src="/assets/icons/cart.svg"
          alt="Cart"
          width={24}
          height={24}
        />
      </Link>
    </section>
  );
}
