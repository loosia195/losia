'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormValues = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
};

export default function ShippingAddressForm({ onSubmit }: { onSubmit: (data: FormValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

    // 1. Tạo state lưu lại dữ liệu khi đã Save
  const [savedData, setSavedData] = useState<FormValues | null>(null);

  // 2. Thay handleSubmit(onSubmit) thành handleSave để set state rồi mới gọi onSubmit
  const handleSave = (data: FormValues) => {
    setSavedData(data);
    onSubmit(data);
  };

  // 3. Nếu đã có savedData thì chuyển qua render summary view
  if (savedData) {
   return (
      <section className="u-text-14 md:u-mb-3x u-bg-white md:u-rounded-4 u-mb-2xs u-px-2x u-py-3xs md:u-px-4x md:u-py-4x">
        <div className="u-flex u-justify-between u-items-center u-mb-3xs md:u-mb-3x">
          <h2 className="tup-ui-heading-sm u-font-medium u-text-16 md:u-text-20">Shipping address</h2>
          {/* 4. Nút Edit để quay lại form */}
          <button className="ui-link" type="button" onClick={() => setSavedData(null)}>
            Edit
          </button>
        </div>
        <div>
          <span className="u-capitalize">
            {savedData.firstName} {savedData.lastName}
          </span>
          <br />
          {savedData.address1.toUpperCase()}
          <br />
          {savedData.address2 && (
            <>
              {savedData.address2.toUpperCase()}
              <br />
            </>
          )}
          {savedData.city.toUpperCase()}, {savedData.state?.toUpperCase()} {savedData.postalCode}
        </div>
      </section>
    );
  }


  return (
    <section className="u-text-14 md:u-mb-3x u-bg-white md:u-rounded-4 u-mb-2xs u-px-2x u-py-3xs md:u-px-4x md:u-py-4x">
      <div className="u-flex u-justify-between u-items-center u-mb-3xs md:u-mb-3x">
      <h2 className="tup-ui-heading-sm u-font-medium u-text-16 md:u-text-20">
        Shipping address
      </h2>
      </div>
      {/* 5. Gọi handleSave thay vì onSubmit trực tiếp */}
      <form onSubmit={handleSubmit(handleSave)} className="u-flex u-flex-wrap u-gap-2x">        
        <p className="ui-visually-hidden">* indicates a required field</p>
        <div className="ui-floating u-flex-1">
          <input
            {...register('firstName', { required: true })}
            id="firstname"
            placeholder="First Name"
            className="ui-input u-mb-0"
          />
          <label htmlFor="firstname">First Name*{errors.firstName && '*'}</label>
        </div>
        <div className="ui-floating u-flex-1">
          <input
            {...register('lastName', { required: true })}
            id="lastname"
            placeholder="Last Name"
            className="ui-input u-mb-0"
          />
          <label htmlFor="lastname">Last Name*{errors.lastName && '*'}</label>
        </div>
        <div className="ui-floating u-w-full">
          <input
            {...register('address1', { required: true })}
            id="line1"
            placeholder="Address Line 1"
            className="ui-input u-mb-0"
          />
          <label htmlFor="line1">Address Line 1*</label>
        </div>
        <div className="ui-floating u-w-full">
          <input
            {...register('address2')}
            id="line2"
            placeholder="Address Line 2 (Optional)"
            className="ui-input u-mb-0"
          />
          <label htmlFor="line2">Address Line 2 (Optional)</label>
        </div>
        <div className="ui-floating u-flex-40">
          <input
            {...register('city', { required: true })}
            id="city"
            placeholder="City"
            className="ui-input u-mb-0"
          />
          <label htmlFor="city">City*</label>
        </div>
        <div className="ui-floating u-flex-30">
          <input
            {...register('state')}
            id="state"
            placeholder="State"
            className="ui-input u-mb-0"
          />
          <label htmlFor="state">State*</label>
        </div>
        <div className="ui-floating u-flex-20">
          <input
            {...register('postalCode', { required: true })}
            id="zip"
            inputMode="numeric"
            maxLength={10}
            placeholder="Postal Code"
            className="ui-input u-mb-0"
          />
          <label htmlFor="zip">Postal Code*</label>
        </div>
        <button className="ui-button tup-ui-btn-block u-mt-1xs md:u-mt-2x" type="submit">
          Save
        </button>
      </form>
      
    </section>
  );
}