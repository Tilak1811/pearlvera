'use client';

import { useEffect, useState } from 'react';

import {
    collection,
    getDocs,
} from 'firebase/firestore';

import ProductCard from '@/components/product/ProductCard';

import { db } from '@/lib/firebase';

import type { Product } from '@/lib/types';

export default function BestSellers() {

    const [products, setProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        async function loadProducts() {

            try {

                const snapshot =
                    await getDocs(
                        collection(db, 'products')
                    );

                const data =
                    snapshot.docs.map((document) => ({
                        id: document.data().id ?? document.id,
                        ...document.data(),
                    })) as Product[];

                setProducts(data.slice(0, 4));

            } catch (error) {

                console.error(
                    'Failed to load best sellers:',
                    error
                );

            } finally {

                setLoading(false);

            }
        }

        loadProducts();

    }, []);

    return (
        <section className="bg-[#FAF8F5] py-24">

            <div className="mx-auto max-w-7xl px-6">

                {/* Heading */}

                <div className="mb-14 text-center">

                    <p className="text-sm font-medium uppercase tracking-[0.3em] text-stone-600">
                        Most Loved
                    </p>

                    <h2
                        className="mt-3 text-5xl font-medium text-stone-900"
                        style={{
                            fontFamily:
                                'var(--font-playfair)',
                        }}
                    >
                        Best Sellers
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-stone-600">
                        Discover the handcrafted Pearlvera pieces loved
                        by our customers.
                    </p>

                </div>

                {/* Products */}

                {loading ? (

                    <div className="py-16 text-center">

                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />

                        <p className="mt-4 text-sm text-stone-500">
                            Loading our favourites...
                        </p>

                    </div>

                ) : products.length === 0 ? (

                    <div className="py-16 text-center text-stone-500">
                        No products available.
                    </div>

                ) : (

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

                        {products.map((product) => (

                            <ProductCard
                                key={product.id}
                                product={product}
                            />

                        ))}

                    </div>

                )}

            </div>

        </section>
    );
}