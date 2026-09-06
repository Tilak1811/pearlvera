'use client';

import { useEffect, useState } from 'react';

import type { Product } from '@/lib/types';

import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

import ProductAccordion from './ProductAccordion';

type Props = {
    product: Product;
};

export default function ProductInfo({
    product,
}: Props) {

    const { addToCart } = useCart();

    const {
        toggleWishlist,
        isWishlisted,
    } = useWishlist();

    const isFavorite =
        isWishlisted(product.id);

    // Products created before stock was added
    // are treated as having 0 stock.
    const stock = product.stock ?? 0;

    const [quantity, setQuantity] =
        useState(1);


    // Make sure quantity stays valid
    // if the available stock changes.
    useEffect(() => {

        if (stock === 0) {
            setQuantity(1);
            return;
        }

        setQuantity((current) =>
            Math.min(current, stock)
        );

    }, [stock]);


    const isOutOfStock =
        stock <= 0;


    function handleAddToCart() {

        if (isOutOfStock) {
            return;
        }

        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
    }


    function increaseQuantity() {

        setQuantity((current) =>
            Math.min(current + 1, stock)
        );
    }


    function decreaseQuantity() {

        setQuantity((current) =>
            Math.max(1, current - 1)
        );
    }


    return (

        <div className="flex flex-col pt-6 text-stone-900">

            {/* Category */}

            <span className="inline-flex w-fit rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white">

                {product.category}

            </span>


            {/* Title */}

            <h1
                className="mt-6 text-6xl font-semibold text-stone-900 opacity-100"
                style={{
                    fontFamily:
                        'var(--font-playfair)',
                }}
            >
                {product.name}
            </h1>


            {/* Rating */}

            <div className="mt-5 flex items-center gap-3">

                <div className="text-lg text-yellow-500">
                    ★★★★★
                </div>

                <span className="font-medium text-stone-700">
                    {product.rating} (
                    {product.reviews} Reviews)
                </span>

            </div>


            {/* Price */}

            <p className="mt-8 text-5xl font-bold text-stone-900 opacity-100">
                ₹ {product.price.toLocaleString()}
            </p>


            {/* Stock Status */}

            <div className="mt-5">

                {isOutOfStock ? (

                    <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">

                        <span className="h-2 w-2 rounded-full bg-red-600" />

                        Out of Stock

                    </div>

                ) : stock <= 5 ? (

                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">

                        <span className="h-2 w-2 rounded-full bg-amber-500" />

                        Only {stock} left

                    </div>

                ) : (

                    <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">

                        <span className="h-2 w-2 rounded-full bg-green-600" />

                        In Stock

                    </div>

                )}

            </div>


            {/* Description */}

            <p className="mt-8 text-lg leading-8 text-stone-600">
                {product.description}
            </p>


            {/* Quantity */}

            {!isOutOfStock && (

                <div className="mt-10">

                    <p className="mb-3 font-semibold text-stone-800">
                        Quantity
                    </p>

                    <div className="flex w-fit items-center rounded-full border-2 border-stone-300 bg-white shadow-sm">

                        <button
                            type="button"
                            onClick={
                                decreaseQuantity
                            }
                            disabled={
                                quantity <= 1
                            }
                            className="px-6 py-3 text-2xl font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            −
                        </button>


                        <span className="min-w-[60px] text-center text-xl font-bold text-stone-900">
                            {quantity}
                        </span>


                        <button
                            type="button"
                            onClick={
                                increaseQuantity
                            }
                            disabled={
                                quantity >= stock
                            }
                            className="px-6 py-3 text-2xl font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            +
                        </button>

                    </div>

                </div>

            )}


            {/* Buttons */}

            <div className="mt-10 flex flex-col gap-4">

                <button
                    type="button"
                    onClick={
                        handleAddToCart
                    }
                    disabled={
                        isOutOfStock
                    }
                    className="rounded-full bg-stone-900 py-4 text-lg font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                    {isOutOfStock
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                </button>


                <button
                    type="button"
                    onClick={() =>
                        toggleWishlist(product)
                    }
                    className="rounded-full border-2 border-stone-900 bg-white py-4 text-lg font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-white"
                >
                    {isFavorite
                        ? '♥ Remove Wishlist'
                        : '♡ Add to Wishlist'}
                </button>

            </div>


            {/* Features */}

            <div className="mt-12 space-y-5 border-t border-stone-300 pt-8">

                <div className="flex items-center gap-3 text-stone-800">

                    <span className="text-xl">
                        🚚
                    </span>

                    <span className="font-medium">
                        Free Shipping Across India
                    </span>

                </div>


                <div className="flex items-center gap-3 text-stone-800">

                    <span className="text-xl">
                        🎁
                    </span>

                    <span className="font-medium">
                        Premium Gift Packaging
                    </span>

                </div>


                <div className="flex items-center gap-3 text-stone-800">

                    <span className="text-xl">
                        🔒
                    </span>

                    <span className="font-medium">
                        100% Secure Checkout
                    </span>

                </div>

            </div>


            <ProductAccordion />

        </div>
    );
}