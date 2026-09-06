'use client';

import Image from 'next/image';
import Link from 'next/link';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { useCart } from '@/hooks/useCart';

export default function CartPage() {
    const {
        cart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
    } = useCart();

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#FAF8F5]">

                <div className="mx-auto max-w-7xl px-6 py-16">

                    {/* Header */}

                    <div className="mb-12">

                        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                            Your Selection
                        </p>

                        <h1
                            className="mt-3 text-5xl text-stone-900"
                            style={{
                                fontFamily: 'var(--font-playfair)',
                            }}
                        >
                            Shopping Cart
                        </h1>

                    </div>

                    {/* Empty Cart */}

                    {cart.length === 0 ? (

                        <div className="rounded-[32px] bg-white p-16 text-center shadow-sm">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
                                <span className="text-3xl text-stone-400">
                                    ♡
                                </span>
                            </div>

                            <h2
                                className="mt-7 text-3xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Your cart is empty
                            </h2>

                            <p className="mx-auto mt-4 max-w-md text-stone-500">
                                Discover our handcrafted luxury
                                collection and find something made
                                especially for you.
                            </p>

                            <Link
                                href="/shop"
                                className="mt-8 inline-flex rounded-full bg-stone-900 px-8 py-4 font-medium text-white transition hover:bg-black"
                            >
                                Continue Shopping
                            </Link>

                        </div>

                    ) : (

                        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

                            {/* PRODUCTS */}

                            <div className="space-y-5">

                                {cart.map((item) => (

                                    <div
                                        key={item.id}
                                        className="flex gap-5 rounded-[28px] border border-stone-200/70 bg-white p-5 shadow-sm transition hover:shadow-md md:p-6"
                                    >

                                        {/* Product Image */}

                                        <Link
                                            href={`/products/${item.slug}`}
                                            className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#F7F3EE] md:h-40 md:w-40"
                                        >

                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="160px"
                                                className="object-cover transition duration-500 hover:scale-105"
                                            />

                                        </Link>

                                        {/* Product Details */}

                                        <div className="flex min-w-0 flex-1 flex-col">

                                            <div className="flex items-start justify-between gap-4">

                                                <div>

                                                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                                        {item.category}
                                                    </p>

                                                    <Link
                                                        href={`/products/${item.slug}`}
                                                    >
                                                        <h3
                                                            className="mt-2 text-2xl text-stone-900"
                                                            style={{
                                                                fontFamily:
                                                                    'var(--font-playfair)',
                                                            }}
                                                        >
                                                            {item.name}
                                                        </h3>
                                                    </Link>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.id
                                                        )
                                                    }
                                                    className="rounded-full px-3 py-2 text-sm text-stone-500 transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                            <p className="mt-3 text-lg font-semibold text-stone-900">
                                                ₹ {item.price.toLocaleString()}
                                            </p>

                                            {/* Quantity */}

                                            <div className="mt-auto pt-5">

                                                <div className="inline-flex items-center rounded-full border border-stone-300 bg-white">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            decreaseQuantity(
                                                                item.id
                                                            )
                                                        }
                                                        className="flex h-10 w-10 items-center justify-center text-lg text-stone-600 transition hover:text-black"
                                                    >
                                                        −
                                                    </button>

                                                    <span className="w-10 text-center text-sm font-medium text-stone-900">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            increaseQuantity(
                                                                item.id
                                                            )
                                                        }
                                                        className="flex h-10 w-10 items-center justify-center text-lg text-stone-600 transition hover:text-black"
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                            {/* ORDER SUMMARY */}

                            <aside className="h-fit rounded-[28px] border border-stone-200/70 bg-white p-8 shadow-sm lg:sticky lg:top-28">

                                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                                    Summary
                                </p>

                                <h2
                                    className="mt-2 text-3xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    Order Summary
                                </h2>

                                <div className="mt-8 space-y-4">

                                    <div className="flex justify-between text-stone-600">

                                        <span>
                                            Subtotal
                                        </span>

                                        <span>
                                            ₹ {subtotal.toLocaleString()}
                                        </span>

                                    </div>

                                    <div className="flex justify-between text-stone-600">

                                        <span>
                                            Shipping
                                        </span>

                                        <span className="text-green-700">
                                            Free
                                        </span>

                                    </div>

                                </div>

                                <div className="my-7 border-t border-stone-200" />

                                <div className="flex items-center justify-between">

                                    <span className="text-lg font-medium text-stone-700">
                                        Total
                                    </span>

                                    <span className="text-2xl font-semibold text-stone-900">
                                        ₹ {subtotal.toLocaleString()}
                                    </span>

                                </div>

                                {/* REAL CHECKOUT LINK */}

                                <Link
                                    href="/checkout"
                                    className="mt-8 flex w-full items-center justify-center rounded-full bg-stone-900 py-4 text-base font-medium text-white transition duration-300 hover:bg-black hover:shadow-lg"
                                >
                                    Proceed to Checkout
                                </Link>

                                <Link
                                    href="/shop"
                                    className="mt-3 flex w-full items-center justify-center rounded-full border border-stone-900 bg-white py-4 text-base font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white"
                                >
                                    Continue Shopping
                                </Link>

                                <button
                                    type="button"
                                    onClick={clearCart}
                                    className="mt-5 w-full text-sm text-stone-400 transition hover:text-red-500"
                                >
                                    Clear Cart
                                </button>

                                <p className="mt-6 text-center text-xs leading-5 text-stone-400">
                                    Secure checkout · Free shipping ·
                                    Handcrafted with care
                                </p>

                            </aside>

                        </div>

                    )}

                </div>

            </main>

            <Footer />
        </>
    );
}