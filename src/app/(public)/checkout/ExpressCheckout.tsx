// src/components/checkout/ExpressCheckout.tsx
'use client';

import React from 'react';

export default function ExpressCheckout() {
  const btnClass = 'Vc341GHsNVusfww1tXso u-flex u-justify-center u-items-center u-w-full u-p-2xs u-font-semibold u-tracking-wide u-uppercase u-rounded-4 u-text-black ui-button hover:u-text-black yuDaAzUaolR6npLqTr6R';
  const handlePay = () => {
    // Implement VNPay QR payment flow here
    console.log('Proceeding with QR-code VNPay-QR');
  };

  return (
    <section className="md:u-mb-3x u-bg-white md:u-rounded-4 u-mb-2xs u-px-2x u-py-3xs md:u-px-4x md:u-py-4x">
      <h2 className="tup-ui-heading-sm u-font-medium u-text-16 md:u-text-20 u-mb-3xs md:u-mb-3x">
        Express checkout
      </h2>
      <div className="u-flex u-gap-1x u-flex-col md:u-flex-row">
        {/* QR-code VNPay-QR */}
          <button
            type="button"
            className={btnClass}
            onClick={handlePay}
          >

            <img
              alt="VNPay QR"
              className="u-ml-1xs"
              height={16}
              width={80}
              loading="lazy"
              src="/assets/icons/vnpayqr.svg"
              style={{ marginTop: '2px' }}
            />
          </button>
      </div>
    </section>
  );
}