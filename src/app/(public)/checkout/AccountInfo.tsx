'use client';
import { useSession } from 'next-auth/react';

export default function AccountInfo() {
  const { data: session } = useSession();
  return (
    <section className="md:u-mb-3x u-bg-white md:u-rounded-4 u-mb-2xs u-px-2x u-py-3xs md:u-px-4x md:u-py-4x">
      <div className="u-flex u-justify-between u-items-center u-mb-3xs md:u-mb-3x">

      <h2 className="tup-ui-heading-sm u-font-medium u-text-16 md:u-text-20">
        Account
      </h2>
      </div>

      <div>{session?.user?.email || 'Please log in'}</div>
    </section>
  );
}
