'use client';

import Link from 'next/link';
import { Check, Package, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderSuccessContent() {
    const searchParams = useSearchParams();

    const orderId = searchParams.get('orderId');

    return (
        <main className="min-h-screen bg-[#FAF8F5] px-6 py-20">

            <div className="mx-auto max-w-2xl">

                {/* Success Card */}

                <div className="rounded-[36px] border border-stone-200/70 bg-white px-8 py-14 text-center shadow-sm md:px-14">

                    {/* Check */}

                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-900 text-white">

                        <Check size={38} strokeWidth={1.7} />

                    </div>

                    {/* Heading */}

                    <p className="mt-10 text-xs uppercase tracking-[0.35em] text-stone-400">
                        Pearlvera
                    </p>

                    <h1
                        className="mt-4 text-5xl text-stone-900 md:text-6xl"
                        style={{
                            fontFamily: 'var(--font-playfair)',
                        }}
                    >
                        Order Confirmed
                    </h1>

                    <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-stone-500">
                        Thank you for choosing Pearlvera.
                        Your handcrafted piece has been
                        carefully added to our order queue.
                    </p>

                    {/* Order Number */}

                    {orderId && (
                        <div className="mx-auto mt-10 max-w-md rounded-2xl bg-[#F7F3EE] px-6 py-5">

                            <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                Order Number
                            </p>

                            <p className="mt-2 break-all font-mono text-sm font-medium text-stone-900">
                                #{orderId}
                            </p>

                        </div>
                    )}

                    {/* Information */}

                    <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">

                        <div className="rounded-2xl border border-stone-200 p-5">

                            <Package
                                size={22}
                                className="text-stone-700"
                            />

                            <h3 className="mt-4 font-semibold text-stone-900">
                                Order Processing
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-stone-500">
                                We're preparing your order with care.
                            </p>

                        </div>

                        <div className="rounded-2xl border border-stone-200 p-5">

                            <ShoppingBag
                                size={22}
                                className="text-stone-700"
                            />

                            <h3 className="mt-4 font-semibold text-stone-900">
                                Free Shipping
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-stone-500">
                                Your order will be shipped across India.
                            </p>

                        </div>

                    </div>

                    {/* Actions */}

                    <div className="mt-10 space-y-3">

                        <Link
                            href="/orders"
                            className="flex w-full items-center justify-center rounded-full bg-stone-900 py-4 font-medium text-white transition hover:bg-black"
                        >
                            View My Orders
                        </Link>

                        <Link
                            href="/shop"
                            className="flex w-full items-center justify-center rounded-full border border-stone-900 bg-white py-4 font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white"
                        >
                            Continue Shopping
                        </Link>

                    </div>

                    <p className="mt-8 text-xs text-stone-400">
                        Thank you for supporting handcrafted artistry.
                    </p>

                </div>

            </div>

        </main>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">
                    <div className="text-sm text-stone-500">
                        Loading...
                    </div>
                </main>
            }
        >
            <OrderSuccessContent />
        </Suspense>
    );
}