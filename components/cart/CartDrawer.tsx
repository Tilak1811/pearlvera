'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCart } from '@/hooks/useCart';

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function CartDrawer({
    open,
    onClose,
}: Props) {
    const {
        cart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
    } = useCart();

    const subtotal = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}

                    <motion.div
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Drawer */}

                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 30,
                        }}
                        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col bg-[#FCFBF9] shadow-2xl"
                    >

                        {/* Header */}

                        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">

                            <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
                                    Pearlvera
                                </p>

                                <h2
                                    className="mt-1 text-3xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    Shopping Bag
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close shopping bag"
                                className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100 hover:text-black"
                            >
                                <X size={22} />
                            </button>

                        </div>

                        {/* Cart Items */}

                        <div className="flex-1 overflow-y-auto px-6 py-6">

                            {cart.length === 0 ? (

                                <div className="mt-24 text-center">

                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                                        <span className="text-2xl">♡</span>
                                    </div>

                                    <h3 className="mt-6 text-xl font-semibold text-stone-900">
                                        Your bag is empty
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-stone-500">
                                        Discover handcrafted luxury
                                        pieces created by Pearlvera.
                                    </p>

                                    <Link
                                        href="/shop"
                                        onClick={onClose}
                                        className="mt-7 inline-flex rounded-full bg-stone-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-black"
                                    >
                                        Explore Collection
                                    </Link>

                                </div>

                            ) : (

                                <div className="space-y-5">

                                    {cart.map((item) => (

                                        <div
                                            key={item.id}
                                            className="flex gap-4 border-b border-stone-200 pb-5"
                                        >

                                            {/* Product Image */}

                                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-100">

                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="96px"
                                                    className="object-cover"
                                                />

                                            </div>

                                            {/* Product Info */}

                                            <div className="flex min-w-0 flex-1 flex-col">

                                                <div className="flex items-start justify-between gap-3">

                                                    <div>
                                                        <h3 className="text-base font-semibold text-stone-900">
                                                            {item.name}
                                                        </h3>

                                                        <p className="mt-1 text-xs uppercase tracking-wider text-stone-500">
                                                            {item.category}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFromCart(item.id)
                                                        }
                                                        aria-label={`Remove ${item.name}`}
                                                        className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-red-500"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>

                                                </div>

                                                <p className="mt-3 text-base font-semibold text-stone-900">
                                                    ₹ {item.price.toLocaleString()}
                                                </p>

                                                {/* Quantity */}

                                                <div className="mt-3 flex items-center">

                                                    <div className="flex items-center rounded-full border border-stone-300 bg-white">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                decreaseQuantity(
                                                                    item.id
                                                                )
                                                            }
                                                            aria-label="Decrease quantity"
                                                            className="flex h-8 w-8 items-center justify-center text-stone-600 transition hover:text-black"
                                                        >
                                                            <Minus size={14} />
                                                        </button>

                                                        <span className="w-8 text-center text-sm font-medium text-stone-900">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                increaseQuantity(
                                                                    item.id
                                                                )
                                                            }
                                                            aria-label="Increase quantity"
                                                            className="flex h-8 w-8 items-center justify-center text-stone-600 transition hover:text-black"
                                                        >
                                                            <Plus size={14} />
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                        {/* Footer */}

                        {cart.length > 0 && (

                            <div className="border-t border-stone-200 bg-[#FCFBF9] p-6">

                                {/* Shipping */}

                                <div className="mb-3 flex items-center justify-between text-sm text-stone-600">

                                    <span>
                                        Free Shipping
                                    </span>

                                    <span className="text-stone-500">
                                        Included ✓
                                    </span>

                                </div>

                                {/* Subtotal */}

                                <div className="mb-6 flex items-center justify-between">

                                    <span className="text-base font-medium text-stone-700">
                                        Subtotal
                                    </span>

                                    <span className="text-xl font-semibold text-stone-900">
                                        ₹ {subtotal.toLocaleString()}
                                    </span>

                                </div>

                                {/* Checkout */}

                                <Link
                                    href="/checkout"
                                    onClick={onClose}
                                    className="mb-3 flex w-full items-center justify-center rounded-full bg-stone-900 py-4 text-base font-medium text-white transition duration-300 hover:bg-black"
                                >
                                    Checkout
                                </Link>

                                {/* View Cart */}

                                <Link
                                    href="/cart"
                                    onClick={onClose}
                                    className="flex w-full items-center justify-center rounded-full border border-stone-900 bg-white py-4 text-base font-medium text-stone-900 transition duration-300 hover:bg-stone-900 hover:text-white"
                                >
                                    View Cart
                                </Link>

                                <p className="mt-4 text-center text-[11px] tracking-wide text-stone-400">
                                    Secure checkout · Crafted with care
                                </p>

                            </div>

                        )}

                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}