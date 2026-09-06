'use client';

import {
    CreditCard,
    Smartphone,
    Truck,
} from 'lucide-react';

type Props = {
    payment: string;
    onChange: (payment: string) => void;
};

export default function PaymentMethods({
    payment,
    onChange,
}: Props) {

    const methods = [
        {
            id: 'cod',
            title: 'Cash on Delivery',
            description: 'Pay when your order arrives.',
            icon: <Truck size={22} />,
        },
        {
            id: 'upi',
            title: 'UPI Payment',
            description: 'Pay securely using any UPI app.',
            icon: <Smartphone size={22} />,
        },
        {
            id: 'card',
            title: 'Credit / Debit Card',
            description: 'Visa, Mastercard & RuPay accepted.',
            icon: <CreditCard size={22} />,
        },
    ];

    return (
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm md:p-10">

            <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                    Payment
                </p>

                <h2
                    className="mt-2 text-3xl text-stone-900"
                    style={{
                        fontFamily: 'var(--font-playfair)',
                    }}
                >
                    Payment Method
                </h2>
            </div>

            <div className="space-y-4">

                {methods.map((method) => {

                    const selected = payment === method.id;

                    return (
                        <label
                            key={method.id}
                            className={`flex cursor-pointer items-center gap-5 rounded-2xl border p-5 transition ${selected
                                    ? 'border-stone-900 bg-stone-50'
                                    : 'border-stone-200 hover:border-stone-400'
                                }`}
                        >

                            <input
                                type="radio"
                                name="payment"
                                value={method.id}
                                checked={selected}
                                onChange={() =>
                                    onChange(method.id)
                                }
                                className="h-5 w-5 accent-stone-900"
                            />

                            <div className="text-stone-900">
                                {method.icon}
                            </div>

                            <div>
                                <h3 className="font-semibold text-stone-900">
                                    {method.title}
                                </h3>

                                <p className="mt-1 text-sm text-stone-500">
                                    {method.description}
                                </p>
                            </div>

                        </label>
                    );
                })}

            </div>
        </div>
    );
}