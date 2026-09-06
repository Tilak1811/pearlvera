'use client';

import { useEffect, useState } from 'react';

import {
    collection,
    getDocs,
} from 'firebase/firestore';

import ProductCard from '@/components/product/ProductCard';

import { db } from '@/lib/firebase';

import type { Product } from '@/lib/types';

type Props = {
    currentProduct: Product;
};

export default function RelatedProducts({
    currentProduct,
}: Props) {

    const [related, setRelated] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // LOAD RELATED PRODUCTS
    // ==========================================

    useEffect(() => {

        async function loadRelatedProducts() {

            try {

                setLoading(true);


                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            'products'
                        )
                    );


                const allProducts:
                    Product[] =
                    snapshot.docs.map(
                        (document) => {

                            const data =
                                document.data();


                            return {

                                // Always use Firestore
                                // document ID

                                id:
                                    document.id,

                                slug:
                                    data.slug ??
                                    document.id,

                                name:
                                    data.name ??
                                    '',

                                price:
                                    Number(
                                        data.price ??
                                        0
                                    ),

                                category:
                                    data.category ??
                                    'Luxury',

                                description:
                                    data.description ??
                                    '',

                                image:
                                    data.image ??
                                    '',

                                images:
                                    Array.isArray(
                                        data.images
                                    )
                                        ? data.images
                                        : data.image
                                            ? [data.image]
                                            : [],

                                rating:
                                    Number(
                                        data.rating ??
                                        0
                                    ),

                                reviews:
                                    Number(
                                        data.reviews ??
                                        0
                                    ),

                                stock:
                                    Number(
                                        data.stock ??
                                        0
                                    ),

                                createdAt:
                                    data.createdAt
                                        ? data.createdAt.toMillis()
                                        : null,

                                updatedAt:
                                    data.updatedAt
                                        ? data.updatedAt.toMillis()
                                        : null,

                            };

                        }
                    );


                // ==================================
                // FIND RELATED PRODUCTS
                // ==================================

                const relatedProducts =
                    allProducts
                        .filter(
                            (product) => {

                                // Don't show current product

                                const isCurrentProduct =
                                    product.id ===
                                    currentProduct.id ||
                                    product.slug ===
                                    currentProduct.slug;


                                // Same category

                                const sameCategory =
                                    product.category ===
                                    currentProduct.category;


                                return (
                                    !isCurrentProduct &&
                                    sameCategory
                                );

                            }
                        )
                        .slice(0, 4);


                setRelated(
                    relatedProducts
                );

            } catch (error) {

                console.error(
                    'Failed to load related products:',
                    error
                );

                setRelated([]);

            } finally {

                setLoading(false);

            }

        }


        loadRelatedProducts();

    }, [
        currentProduct.id,
        currentProduct.slug,
        currentProduct.category,
    ]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <section className="mt-28">

                <div className="text-center">

                    <p className="uppercase tracking-[0.3em] text-stone-500">
                        You May Also Like
                    </p>

                    <h2
                        className="mt-3 text-5xl text-stone-900"
                        style={{
                            fontFamily:
                                'var(--font-playfair)',
                        }}
                    >
                        Related Products
                    </h2>

                    <div className="mt-10">

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />

                    </div>

                </div>

            </section>

        );

    }


    // ==========================================
    // EMPTY
    // ==========================================

    if (related.length === 0) {
        return null;
    }


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <section className="mt-28">


            {/* HEADER */}

            <div className="text-center">

                <p className="uppercase tracking-[0.3em] text-stone-500">
                    You May Also Like
                </p>


                <h2
                    className="mt-3 text-5xl text-stone-900"
                    style={{
                        fontFamily:
                            'var(--font-playfair)',
                    }}
                >
                    Related Products
                </h2>

            </div>


            {/* PRODUCTS */}

            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

                {related.map(
                    (product) => (

                        <ProductCard
                            key={product.id}
                            product={product}
                        />

                    )
                )}

            </div>

        </section>

    );

}