'use client';

import { useEffect, useMemo, useState } from 'react';

import {
    collection,
    getDocs,
} from 'firebase/firestore';

import SearchBar from '@/components/shop/SearchBar';
import CategoryFilter from '@/components/shop/CategoryFilter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';

import { db } from '@/lib/firebase';

import type { Product } from '@/lib/types';

export default function ShopPage() {

    const [products, setProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [searchValue, setSearchValue] =
        useState('');

    const [activeCategory, setActiveCategory] =
        useState('All');


    // ==========================================
    // LOAD PRODUCTS FROM FIRESTORE
    // ==========================================

    useEffect(() => {

        async function loadProducts() {

            try {

                setLoading(true);


                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            'products'
                        )
                    );


                const data: Product[] =
                    snapshot.docs.map(
                        (document) => {

                            const item =
                                document.data();


                            return {

                                // ==================================
                                // BASIC PRODUCT DATA
                                // ==================================

                                id:
                                    document.id,

                                slug:
                                    item.slug ??
                                    document.id,

                                name:
                                    item.name ??
                                    '',

                                price:
                                    Number(
                                        item.price ??
                                        0
                                    ),

                                category:
                                    item.category ??
                                    'Luxury',

                                description:
                                    item.description ??
                                    '',


                                // ==================================
                                // IMAGES
                                // ==================================

                                image:
                                    item.image ??
                                    '',

                                images:
                                    Array.isArray(
                                        item.images
                                    )
                                        ? item.images
                                        : item.image
                                            ? [
                                                item.image,
                                            ]
                                            : [],


                                // ==================================
                                // REVIEWS
                                // ==================================

                                rating:
                                    Number(
                                        item.rating ??
                                        0
                                    ),

                                reviews:
                                    Number(
                                        item.reviews ??
                                        0
                                    ),


                                // ==================================
                                // STOCK
                                // ==================================

                                stock:
                                    Number(
                                        item.stock ??
                                        0
                                    ),


                                // ==================================
                                // VISIBILITY
                                // ==================================
                                //
                                // true  = visible
                                // false = hidden
                                // missing = visible
                                //

                                visible:
                                    item.visible !==
                                    false,


                                // ==================================
                                // TIMESTAMPS
                                // ==================================

                                createdAt:
                                    item.createdAt
                                        ? item.createdAt.toMillis()
                                        : null,

                                updatedAt:
                                    item.updatedAt
                                        ? item.updatedAt.toMillis()
                                        : null,

                            };

                        }
                    );


                setProducts(data);

            } catch (error) {

                console.error(
                    'Failed to load products:',
                    error
                );

            } finally {

                setLoading(false);

            }

        }


        loadProducts();

    }, []);


    // ==========================================
    // FILTER PRODUCTS
    // ==========================================

    const filteredProducts =
        useMemo(() => {

            return products.filter(
                (product) => {

                    // ==================================
                    // HIDDEN PRODUCTS
                    // ==================================

                    if (
                        product.visible ===
                        false
                    ) {
                        return false;
                    }


                    // ==================================
                    // SEARCH
                    // ==================================

                    const search =
                        searchValue
                            .trim()
                            .toLowerCase();


                    const matchesSearch =
                        !search ||
                        product.name
                            .toLowerCase()
                            .includes(
                                search
                            ) ||
                        product.category
                            .toLowerCase()
                            .includes(
                                search
                            );


                    // ==================================
                    // CATEGORY
                    // ==================================

                    const matchesCategory =
                        activeCategory ===
                        'All' ||
                        product.category ===
                        activeCategory;


                    return (
                        matchesSearch &&
                        matchesCategory
                    );

                }
            );

        }, [
            products,
            searchValue,
            activeCategory,
        ]);


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <>

            <Navbar />


            <main className="min-h-screen bg-[#FAF8F5]">

                <div className="mx-auto max-w-7xl px-6 py-16">


                    {/* ==================================
                        HEADER
                    ================================== */}

                    <div className="mb-16 text-center">

                        <p className="uppercase tracking-[0.3em] text-stone-500">
                            Luxury Collection
                        </p>


                        <h1
                            className="mt-3 text-6xl"
                            style={{
                                fontFamily:
                                    'var(--font-playfair)',
                            }}
                        >
                            Shop Pearlvera
                        </h1>


                        <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-500">
                            Discover handcrafted
                            luxury bead purses
                            designed for timeless
                            elegance.
                        </p>

                    </div>


                    {/* ==================================
                        FILTERS
                    ================================== */}

                    <SearchBar
                        value={searchValue}
                        onChange={
                            setSearchValue
                        }
                    />


                    <CategoryFilter
                        active={
                            activeCategory
                        }
                        onSelect={
                            setActiveCategory
                        }
                    />


                    {/* ==================================
                        LOADING
                    ================================== */}

                    {loading ? (

                        <div className="py-24 text-center">

                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />

                            <p className="mt-5 text-sm text-stone-500">
                                Loading our collection...
                            </p>

                        </div>

                    ) : filteredProducts.length ===
                        0 ? (

                        /* ==================================
                           NO PRODUCTS
                        ================================== */

                        <div className="py-24 text-center">

                            <h2
                                className="text-3xl text-stone-900"
                                style={{
                                    fontFamily:
                                        'var(--font-playfair)',
                                }}
                            >
                                No products found
                            </h2>


                            <p className="mt-3 text-stone-500">
                                Try another search
                                or category.
                            </p>

                        </div>

                    ) : (

                        /* ==================================
                           PRODUCTS
                        ================================== */

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

                            {filteredProducts.map(
                                (product) => (

                                    <ProductCard
                                        key={
                                            product.id
                                        }
                                        product={
                                            product
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </div>

            </main>


            <Footer />

        </>

    );

}