// src/components/checkout/ReferralSelect.tsx
'use client';

import React from 'react';

export default function ReferralSelect() {
  return (
    <section className="md:u-mb-3x u-bg-white md:u-rounded-4 u-mb-2xs u-px-2x u-py-3xs md:u-px-4x md:u-py-4x">
      <label className="ui-visually-hidden" htmlFor="hdyhau">
        How did you hear about us?
      </label>
      <select
        id="hdyhau"
        name="hdyhau"
        className="ui-select u-mb-0"
        defaultValue=""
      >
        <option className="ui-option" value="" disabled>
          How did you hear about us? (Optional)
        </option>
        <option className="ui-option" value="tiktok">
          TikTok
        </option>
        <option className="ui-option" value="display">
          Banner ad
        </option>
        <option className="ui-option" value="google">
          Google
        </option>
        <option className="ui-option" value="influencer">
          Influencer
        </option>
        <option className="ui-option" value="tup-ambassador">
          #ThredUpambassador
        </option>
        <option className="ui-option" value="instagram">
          Instagram
        </option>
        <option className="ui-option" value="facebook">
          Facebook
        </option>
        <option className="ui-option" value="youtube">
          YouTube
        </option>
        <option className="ui-option" value="friends-family">
          Friends/Family
        </option>
        <option className="ui-option" value="pinterest">
          Pinterest
        </option>
        <option className="ui-option" value="other">
          Other
        </option>
      </select>
    </section>
);
}
