'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';

export default function WishlistPage() {
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#FAF8F5]">

                {/* Header */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-7xl px-6 py-16">

                        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                            Your Collection
                        </p>

                        <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">

                            <div>

                                <h1
                                    className="text-5xl text-stone-900 md:text-6xl"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    My Wishlist
                                </h1>

                                <p className="mt-4 text-stone-500">
                                    {wishlist.length === 0
                                        ? 'Save pieces you love.'
                                        : `${wishlist.length} ${wishlist.length === 1
                                            ? 'piece'
                                            : 'pieces'
                                        } saved`}
                                </p>

                            </div>

                            {wishlist.length > 0 && (
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 transition hover:text-black"
                                >
                                    Continue Shopping
                                    <ArrowRight size={16} />
                                </Link>
                            )}

                        </div>

                    </div>

                </section>

                {/* Content */}

                <section className="mx-auto max-w-7xl px-6 py-16">

                    {wishlist.length === 0 ? (

                        /* Empty Wishlist */

                        <div className="rounded-[36px] border border-stone-200/70 bg-white px-8 py-16 text-center shadow-sm md:px-16">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">

                                <Heart
                                    size={30}
                                    strokeWidth={1.5}
                                    className="text-stone-500"
                                />

                            </div>

                            <h2
                                className="mt-7 text-3xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                Nothing saved yet
                            </h2>

                            <p className="mx-auto mt-4 max-w-md leading-7 text-stone-500">
                                Keep the pieces that catch your eye.
                                Your favourite Pearlvera designs will
                                appear here.
                            </p>

                            <Link
                                href="/shop"
                                className="mt-8 inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-4 font-medium text-white transition hover:bg-black"
                            >
                                Explore Collection
                                <ArrowRight size={17} />
                            </Link>

                        </div>

                    ) : (

                        /* Wishlist Products */

                        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                            {wishlist.map((product) => (

                                <article
                                    key={product.id}
                                    className="group overflow-hidden rounded-[30px] border border-stone-200/70 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
                                >

                                    {/* Image */}

                                    <div className="relative aspect-square overflow-hidden bg-[#F7F3EE]">

                                        <Link
                                            href={`/products/${product.slug}`}
                                        >

                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                                                className="object-contain p-7 transition duration-700 group-hover:scale-105"
                                            />

                                        </Link>

                                        {/* Remove */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleWishlist(product)
                                            }
                                            aria-label={`Remove ${product.name} from wishlist`}
                                            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-stone-600 shadow-sm transition hover:bg-white hover:text-red-600"
                                        >
                                            <Trash2 size={17} />
                                        </button>

                                    </div>

                                    {/* Details */}

                                    <div className="p-6">

                                        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400">
                                            {product.category}
                                        </p>

                                        <Link
                                            href={`/products/${product.slug}`}
                                        >

                                            <h3
                                                className="mt-2 text-2xl text-stone-900"
                                                style={{
                                                    fontFamily:
                                                        'var(--font-playfair)',
                                                }}
                                            >
                                                {product.name}
                                            </h3>

                                        </Link>

                                        <p className="mt-3 text-lg font-semibold text-stone-900">
                                            ₹ {product.price.toLocaleString()}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                addToCart(product)
                                            }
                                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 py-3.5 text-sm font-medium text-white transition hover:bg-black"
                                        >
                                            <ShoppingBag size={17} />
                                            Add to Cart
                                        </button>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </section>

            </main>

            <Footer />
        </>
    );
}