'use client';

import Image from 'next/image';
import { useCart } from '@/hooks/useCart';

type Props = {
    onPlaceOrder: () => void;
    loading: boolean;
};

export default function OrderSummary({
    onPlaceOrder,
    loading,
}: Props) {

    const { cart } = useCart();

    const subtotal = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    const shipping = 0;
    const total = subtotal + shipping;

    return (
        <div className="sticky top-28 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                    Your Selection
                </p>

                <h2
                    className="mt-2 text-3xl text-stone-900"
                    style={{
                        fontFamily: 'var(--font-playfair)',
                    }}
                >
                    Order Summary
                </h2>
            </div>

            {cart.length === 0 ? (

                <div className="rounded-2xl bg-stone-50 p-8 text-center">

                    <p className="font-medium text-stone-700">
                        Your cart is empty
                    </p>

                </div>

            ) : (

                <div>

                    <div className="space-y-5">

                        {cart.map((item) => (

                            <div
                                key={item.id}
                                className="flex gap-4 border-b border-stone-100 pb-5"
                            >

                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-stone-100">

                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />

                                </div>

                                <div className="min-w-0 flex-1">

                                    <h3 className="font-medium text-stone-900">
                                        {item.name}
                                    </h3>

                                    <p className="mt-1 text-sm text-stone-500">
                                        Qty {item.quantity}
                                    </p>

                                </div>

                                <p className="font-medium text-stone-900">
                                    ₹ {(item.price * item.quantity).toLocaleString()}
                                </p>

                            </div>

                        ))}

                    </div>

                    <div className="mt-8 space-y-4">

                        <div className="flex justify-between text-sm text-stone-600">
                            <span>Subtotal</span>
                            <span>
                                ₹ {subtotal.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm text-stone-600">
                            <span>Shipping</span>
                            <span className="text-green-700">
                                Free
                            </span>
                        </div>

                        <div className="border-t border-stone-200 pt-5">

                            <div className="flex justify-between text-xl font-semibold text-stone-900">

                                <span>Total</span>

                                <span>
                                    ₹ {total.toLocaleString()}
                                </span>

                            </div>

                        </div>

                    </div>

                    <button
                        onClick={onPlaceOrder}
                        disabled={loading || cart.length === 0}
                        className="mt-8 flex w-full items-center justify-center rounded-full bg-stone-900 py-4 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? 'Creating Order...'
                            : 'Place Order'}
                    </button>

                    <p className="mt-4 text-center text-xs text-stone-400">
                        Your order information is securely processed.
                    </p>

                </div>
            )}

        </div>
    );
}