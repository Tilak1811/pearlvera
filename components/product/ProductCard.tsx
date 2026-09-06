'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Heart,
    ShoppingBag,
    Star,
    Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

import type { Product } from '@/lib/types';

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({
    product,
}: ProductCardProps) {

    const { addToCart } = useCart();

    const {
        toggleWishlist,
        isWishlisted,
    } = useWishlist();


    // ==========================================
    // SAFE VALUES
    // ==========================================

    const productSlug =
        product.slug || String(product.id);

    const productImage =
        product.image ||
        product.images?.[0] ||
        '/products/placeholder.jpg';

    const productRating =
        Number(product.rating || 0);

    const productReviews =
        Number(product.reviews || 0);

    const productPrice =
        Number(product.price || 0);

    const productStock =
        product.stock === undefined
            ? 1
            : Number(product.stock);


    const isFavorite =
        isWishlisted(product.id);

    const isOutOfStock =
        productStock <= 0;


    // ==========================================
    // ADD TO CART
    // ==========================================

    function handleAddToCart(
        event: React.MouseEvent<HTMLButtonElement>
    ) {

        event.preventDefault();
        event.stopPropagation();


        if (isOutOfStock) {
            return;
        }


        addToCart(product);

    }


    // ==========================================
    // WISHLIST
    // ==========================================

    function handleWishlist(
        event: React.MouseEvent<HTMLButtonElement>
    ) {

        event.preventDefault();
        event.stopPropagation();

        toggleWishlist(product);

    }


    // ==========================================
    // PRODUCT URL
    // ==========================================

    const productUrl =
        `/products/${encodeURIComponent(
            productSlug
        )}`;


    return (

        <motion.article
            whileHover={{
                y: -8,
            }}
            transition={{
                duration: 0.3,
            }}
            className="group overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl"
        >


            {/* ==================================
                IMAGE
            ================================== */}

            <div className="relative">


                <Link
                    href={productUrl}
                    aria-label={`View ${product.name}`}
                >

                    <div className="relative aspect-square overflow-hidden bg-[#F7F3EE]">


                        <Image
                            src={productImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                            className="object-contain p-8 transition duration-700 group-hover:scale-110"
                        />


                        {/* CATEGORY */}

                        <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-700 shadow">

                            {product.category}

                        </span>


                        {/* OUT OF STOCK */}

                        {isOutOfStock && (

                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">

                                <span className="rounded-full bg-white px-5 py-2 text-xs font-medium uppercase tracking-[0.15em] text-stone-900 shadow">

                                    Out of Stock

                                </span>

                            </div>

                        )}

                    </div>

                </Link>


                {/* ==================================
                    WISHLIST
                ================================== */}

                <button
                    type="button"
                    onClick={handleWishlist}
                    aria-label={
                        isFavorite
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                    }
                    className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition duration-300 hover:scale-110"
                >

                    <Heart
                        size={19}
                        className={
                            isFavorite
                                ? 'fill-red-500 text-red-500'
                                : 'text-stone-700'
                        }
                    />

                </button>


                {/* ==================================
                    QUICK VIEW
                ================================== */}

                {!isOutOfStock && (

                    <Link
                        href={productUrl}
                        className="absolute inset-x-0 bottom-6 z-10 flex justify-center opacity-0 transition duration-300 group-hover:opacity-100"
                    >

                        <span className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-900 shadow-lg transition hover:bg-stone-900 hover:text-white">

                            <Eye size={18} />

                            Quick View

                        </span>

                    </Link>

                )}

            </div>


            {/* ==================================
                PRODUCT INFO
            ================================== */}

            <div className="p-6">


                {/* ==================================
                    RATING
                ================================== */}

                <div className="mb-3 flex items-center gap-2">

                    <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                    />


                    <span className="text-sm text-stone-700">

                        {productRating > 0
                            ? productRating.toFixed(1)
                            : 'New'}

                    </span>


                    {productReviews > 0 && (

                        <span className="text-sm text-stone-500">

                            ({productReviews}{' '}
                            {productReviews === 1
                                ? 'review'
                                : 'reviews'})

                        </span>

                    )}

                </div>


                {/* ==================================
                    NAME
                ================================== */}

                <Link
                    href={productUrl}
                >

                    <h3
                        className="text-2xl text-stone-900 transition hover:text-stone-600"
                        style={{
                            fontFamily:
                                'var(--font-playfair)',
                        }}
                    >

                        {product.name}

                    </h3>

                </Link>


                {/* ==================================
                    PRICE
                ================================== */}

                <p className="mt-3 text-2xl font-semibold text-stone-900">

                    ₹{' '}

                    {productPrice.toLocaleString(
                        'en-IN'
                    )}

                </p>


                {/* ==================================
                    STOCK
                ================================== */}

                {productStock > 0 &&
                    productStock <= 5 && (

                        <p className="mt-2 text-xs font-medium text-amber-600">

                            Only {productStock}{' '}
                            {productStock === 1
                                ? 'piece'
                                : 'pieces'}{' '}
                            left

                        </p>

                    )}


                {/* ==================================
                    ADD TO CART
                ================================== */}

                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 font-medium transition duration-300 active:scale-[0.98] ${isOutOfStock
                            ? 'cursor-not-allowed bg-stone-200 text-stone-400'
                            : 'bg-stone-900 text-white hover:bg-black'
                        }`}
                >

                    <ShoppingBag
                        size={18}
                    />


                    {isOutOfStock
                        ? 'Out of Stock'
                        : 'Add to Cart'}

                </button>

            </div>

        </motion.article>

    );

}