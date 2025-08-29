import React from 'react';
import Image from 'next/image';

const guarantees = [
  {
    icon: '/assets/icons/thumbs-up.svg',
    title: 'Your credit card is safe with us',
    desc: 'Shopping on Losia is safe and secure. We use a best-in-class third party payment system to process and store your payment methods.',
  },
  {
    icon: '/assets/icons/lock-outline.svg',
    title: 'We take your privacy seriously',
    desc: 'All information is encrypted and transmitted without risk using a Secure Sockets Layer (SSL) protocol.',
    badges: [
      { src: '/assets/icons/ssl-secure.svg', alt: 'SSL Secure' },
      { src: '/assets/icons/bbb-badge.svg', alt: 'BBB Accredited' },
    ],
  },
  {
    icon: '/assets/icons/arrow-return.svg',
    title: 'Thrift with confidence',
    desc: 'Items that arrive damaged, defective, or not as described are always free to return. Otherwise, a $3.99 fee (per item) will be deducted from your refund. Items must be in their original condition and returned within 14 days.',
  },
];

export default function TrustGuaranteeSection() {
  return (
    <section className="u-flex u-justify-between u-flex-col lg:u-space-y-0 lg:u-space-x-5xs lg:u-flex-row u-space-y-2xs u-px-2x u-pt-3xs md:u-pt-0 md:u-px-0 u-mt-3x">
      {guarantees.map((g, i) => (
        <div
          key={i}
          className="u-flex-1 u-rounded-4 u-flex u-px-2x u-py-3xs md:u-px-3xs u-bg-gray-1 u-text-12 md:u-text-14"
        >
          <div className="u-flex-shrink-0 u-mr-2xs">
            <Image src={g.icon} alt="" width={24} height={24} />
          </div>
          <div>
            <h4 className="u-font-medium u-mb-1">{g.title}</h4>
            <p className="u-mb-0">{g.desc}</p>
            {g.badges && (
              <div className="u-flex u-items-center u-flex-wrap u-mt-2x u-space-x-3xs">
                {g.badges.map((b, idx) => (
                  <div key={idx} className="u-flex-shrink-0" style={{ width: '50px' }}>
                    <Image src={b.src} alt={b.alt} width={71} height={34} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
